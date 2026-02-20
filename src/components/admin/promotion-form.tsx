
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import type { Promotion } from '@/lib/types';
import { Save, Loader2 } from 'lucide-react';
import { ImageUploader } from './image-uploader';
import { ScrollArea } from '../ui/scroll-area';

const formSchema = z.object({
  title: z.string().min(3, { message: 'Le titre doit faire au moins 3 caractères.' }),
  description: z.string().optional(),
  imageUrl: z.string().url({ message: "L'URL de l'image est requise." }),
  link: z.string().url({ message: 'Veuillez entrer une URL valide.' }).optional().or(z.literal('')),
  isActive: z.boolean(),
});

type PromotionFormValues = z.infer<typeof formSchema>;

interface PromotionFormProps {
  onSubmit: (values: PromotionFormValues) => void;
  initialData?: Promotion | null;
}

export function PromotionForm({ onSubmit, initialData }: PromotionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = initialData
    ? {
        title: initialData.title,
        description: initialData.description || '',
        imageUrl: initialData.imageUrl,
        link: initialData.link || '',
        isActive: initialData.isActive,
      }
    : {
        title: '',
        description: '',
        imageUrl: '',
        link: '',
        isActive: true,
      };

  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  useEffect(() => {
    form.reset(defaultValues);
  }, [initialData, form]);

  const handleFormSubmit = (values: PromotionFormValues) => {
    setIsSubmitting(true);
    onSubmit(values);
    setIsSubmitting(false);
  };
  
  const handleImageUpload = (url: string) => {
    form.setValue('imageUrl', url);
    form.clearErrors('imageUrl');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <ScrollArea className="h-[65vh] pr-6">
            <div className="space-y-6">
                <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Image de la promotion</FormLabel>
                            <FormControl>
                            <ImageUploader 
                                initialImageUrl={field.value}
                                onUploadSuccess={handleImageUpload}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            
                <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Titre</FormLabel>
                    <FormControl>
                        <Input placeholder="ex: -20% sur les paniers bio" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Courte description de l'offre..." {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Lien (optionnel)</FormLabel>
                    <FormControl>
                        <Input placeholder="https://exemple.com/promo" {...field} />
                    </FormControl>
                    <FormDescription>URL vers laquelle la promotion redirigera.</FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <FormLabel className="text-base">
                        Activer la promotion
                        </FormLabel>
                        <FormDescription>
                        Rendre cette promotion visible pour les utilisateurs.
                        </FormDescription>
                    </div>
                    <FormControl>
                        <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    </FormItem>
                )}
                />
            </div>
        </ScrollArea>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {initialData ? 'Enregistrer les modifications' : 'Créer la promotion'}
        </Button>
      </form>
    </Form>
  );
}
