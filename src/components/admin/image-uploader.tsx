
'use client';

import { useState, useEffect, useRef, useId } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud, ClipboardPaste } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface ImageUploaderProps {
  initialImageUrl: string;
  onUploadSuccess: (url: string) => void;
  onMultipleUploadSuccess?: (urls: string[]) => void;
  allowMultiple?: boolean;
  /** Optional: provide a stable unique ID for the file input. If omitted, one is auto-generated. */
  uploaderId?: string;
}

export function ImageUploader({ initialImageUrl, onUploadSuccess, onMultipleUploadSuccess, allowMultiple, uploaderId }: ImageUploaderProps) {
  const autoId = useId();
  const inputId = uploaderId ?? `image-upload-${autoId}`;
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // Progress for multiple uploads
  const [previewUrl, setPreviewUrl] = useState(initialImageUrl);
  const uploaderRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UNSIGNED_PRESET;

  const uploadFiles = async (files: File[]) => {
    if (!cloudName || !uploadPreset) {
      toast({
        variant: "destructive",
        title: "Configuration Cloudinary manquante",
        description: "Vérifiez que les variables d'environnement sont bien définies.",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const uploadedUrls: string[] = [];
    let errorCount = 0;

    const uploadSingle = async (file: File) => {
      if (file.size > 10 * 1024 * 1024) {
        errorCount++;
        return null;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      try {
        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          formData
        );
        return response.data.secure_url;
      } catch (error) {
        console.error("Upload error:", error);
        errorCount++;
        return null;
      }
    };

    const results = await Promise.all(files.map(file => uploadSingle(file)));
    const validResults = results.filter((url): url is string => url !== null);

    if (validResults.length > 0) {
      if (allowMultiple && onMultipleUploadSuccess) {
        onMultipleUploadSuccess(validResults);
      } else {
        // Fallback to single behavior if only one or multiple disabled
        onUploadSuccess(validResults[0]);
        setPreviewUrl(validResults[0]);
      }

      toast({
        title: validResults.length > 1 ? `${validResults.length} images téléversées` : "Image téléversée",
        description: "Les images sont prêtes à être sauvegardées.",
      });
    }

    if (errorCount > 0) {
      toast({
        variant: "destructive",
        title: "Certains envois ont échoué",
        description: `${errorCount} fichier(s) n'ont pas pu être envoyés.`,
      });
    }

    setIsUploading(false);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      await uploadFiles(Array.from(files));
    }
  };

  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      if (!navigator.clipboard?.read) {
        // Fallback for older browsers
        const items = event.clipboardData?.items;
        if (!items) return;
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) {
              event.preventDefault();
              uploadFile(file);
              break;
            }
          }
        }
        return;
      }

      try {
        // Modern async clipboard API
        const permission = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName });
        if (permission.state === 'denied') {
          toast({
            variant: 'destructive',
            title: 'Permission refusée',
            description: "L'accès au presse-papiers a été refusé. Veuillez l'autoriser dans les paramètres de votre navigateur."
          });
          return;
        }

        const clipboardItems = await navigator.clipboard.read();
        const filesToUpload: File[] = [];
        for (const item of clipboardItems) {
          const imageType = item.types.find(type => type.startsWith('image/'));
          if (imageType) {
            const blob = await item.getType(imageType);
            const file = new File([blob], `pasted-image-${Date.now()}.png`, { type: imageType });
            filesToUpload.push(file);
            if (!allowMultiple) break;
          }
        }
        if (filesToUpload.length > 0) {
          uploadFiles(filesToUpload);
        }
      } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
        toast({
          variant: 'destructive',
          title: 'Erreur de collage',
          description: "Impossible de lire l'image depuis le presse-papiers."
        });
      }
    };

    const currentRef = uploaderRef.current;
    currentRef?.addEventListener('paste', handlePaste);

    return () => {
      currentRef?.removeEventListener('paste', handlePaste);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialImageUrl, cloudName, uploadPreset]);


  return (
    <div className="flex flex-col gap-4" ref={uploaderRef}>
      <div className="relative w-full aspect-video rounded-md border border-dashed flex items-center justify-center bg-muted/50 overflow-hidden">
        {previewUrl ? (
          <Image src={previewUrl} alt="Aperçu de l'image" fill sizes="(max-width: 768px) 100vw, 400px" className="object-cover" />
        ) : (
          <div className="text-center text-muted-foreground p-4">
            <UploadCloud className="mx-auto h-8 w-8 mb-2" />
            <p className="text-sm font-semibold">Téléverser une image</p>
            <p className="text-xs">ou collez-la directement (Ctrl+V)</p>
          </div>
        )}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}
      </div>
      <div className="relative">
        <Input
          id={inputId}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
          multiple={allowMultiple}
        />
        <Button asChild variant="outline" disabled={isUploading} className="w-full">
          <label htmlFor={inputId} className="cursor-pointer">
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Envoi en cours...</span>
              </>
            ) : (
              <>
                <UploadCloud className="mr-2 h-4 w-4" />
                <span>Changer l'image</span>
              </>
            )}
          </label>
        </Button>
      </div>
    </div>
  );
}
