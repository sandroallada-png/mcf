
import { useState } from 'react';
import { useFirebase } from '@/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, CheckCircle, FileJson, ClipboardPaste, Image as ImageIcon, Flame, Tag, MapPin, Globe } from 'lucide-react';
import type { Dish } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { Progress } from '../ui/progress';

interface BulkDishImporterProps {
  onImportComplete: () => void;
}

type ParsedDish = Omit<Dish, 'id'>;

export function BulkDishImporter({ onImportComplete }: BulkDishImporterProps) {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedDishes, setParsedDishes] = useState<ParsedDish[]>([]);
  const [fileName, setFileName] = useState('');
  const [pastedJson, setPastedJson] = useState('');
  const [importProgress, setImportProgress] = useState(0);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UNSIGNED_PRESET;

  const parseJsonData = (json: any) => {
    if (!Array.isArray(json)) {
      throw new Error("Le JSON doit être un tableau de plats.");
    }

    const dishes: ParsedDish[] = json.map(row => ({
      name: row.name || '',
      category: row.category || 'Inconnu',
      origin: row.origin || 'Inconnu',
      cookingTime: row.cookingTime || 'N/A',
      imageUrl: row.imageUrl || '',
      type: row.type || '',
      recipe: row.recipe || '',
      calories: (row.calories || row.calorie) ? Number(row.calories || row.calorie) : undefined,
      isVerified: false,
    })).filter(dish => dish.name); // Filtrer les plats sans nom

    if (dishes.length === 0) {
      throw new Error("Aucun plat valide trouvé. Vérifiez la présence de la clé 'name'.");
    }

    return dishes;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    setParsedDishes([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const json = JSON.parse(text);
        const dishes = parseJsonData(json);
        setParsedDishes(dishes);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Erreur de lecture",
          description: error.message || "Impossible de lire le contenu. Assurez-vous du format JSON correct."
        });
        setFileName('');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsText(file);
  };

  const handlePasteParse = () => {
    if (!pastedJson.trim()) return;

    setIsProcessing(true);
    setParsedDishes([]);
    try {
      const json = JSON.parse(pastedJson);
      const dishes = parseJsonData(json);
      setParsedDishes(dishes);
      setFileName('Texte collé');
      toast({
        title: "JSON analysé avec succès",
        description: `${dishes.length} plats identifiés.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur de parsing JSON",
        description: error.message || "Format JSON invalide."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const uploadToCloudinary = async (imageUrl: string, dishName: string): Promise<string> => {
    if (!imageUrl || imageUrl.includes('cloudinary.com')) return imageUrl;
    if (!cloudName || !uploadPreset) {
      console.warn("Cloudinary not configured, skipping upload for:", dishName);
      return imageUrl;
    }

    try {
      const formData = new FormData();
      formData.append('file', imageUrl);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'mcf_dishes_import');

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData,
        { timeout: 15000 }
      );

      return response.data.secure_url;
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || error.message;
      console.error(`Cloudinary upload failed for "${dishName}":`, errorMsg);
      return imageUrl;
    }
  };

  const handleImport = async () => {
    if (parsedDishes.length === 0) return;

    setIsProcessing(true);
    setImportProgress(0);
    try {
      const dishesRef = collection(firestore, 'dishes');
      const total = parsedDishes.length;
      const processedDishes: ParsedDish[] = [];

      for (let i = 0; i < total; i++) {
        const dish = parsedDishes[i];

        // Try uploading to cloudinary with name for logs
        const cloudinaryUrl = await uploadToCloudinary(dish.imageUrl || '', dish.name);

        processedDishes.push({
          ...dish,
          imageUrl: cloudinaryUrl
        });

        setImportProgress(Math.round(((i + 1) / total) * 100));

        // Small delay to prevent saturation
        if (i % 3 === 0 && i > 0) {
          await new Promise(r => setTimeout(r, 600));
        }
      }

      const batch = writeBatch(firestore);
      processedDishes.forEach(dish => {
        const newDishRef = doc(dishesRef);
        batch.set(newDishRef, dish);
      });

      await batch.commit();
      toast({
        title: "Importation terminée",
        description: `${parsedDishes.length} plats ont été traités avec succès.`,
      });
      setPastedJson('');
      setParsedDishes([]);
      onImportComplete();
    } catch (error) {
      console.error("Critical error during import:", error);
      toast({
        variant: "destructive",
        title: "Échec de l'importation",
        description: "Une erreur est survenue lors de l'enregistrement des données."
      });
    } finally {
      setIsProcessing(false);
      setImportProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <FileJson className="h-4 w-4" />
        <AlertTitle>Format des données</AlertTitle>
        <AlertDescription>
          Les données doivent être un tableau d'objets. Chaque objet doit contenir au minimum une clé <strong>`name`</strong>.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="file" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file">
            <Upload className="h-4 w-4 mr-2" />
            Fichier JSON
          </TabsTrigger>
          <TabsTrigger value="paste">
            <ClipboardPaste className="h-4 w-4 mr-2" />
            Coller JSON
          </TabsTrigger>
        </TabsList>
        <TabsContent value="file" className="mt-4">
          <Input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            disabled={isProcessing}
          />
        </TabsContent>
        <TabsContent value="paste" className="mt-4 space-y-4">
          <Textarea
            placeholder='[{"name": "Plat exemple", "category": "Healthy", ...}]'
            className="min-h-[150px] font-mono text-xs"
            value={pastedJson}
            onChange={(e) => setPastedJson(e.target.value)}
            disabled={isProcessing}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePasteParse}
            disabled={isProcessing || !pastedJson.trim()}
            className="w-full"
          >
            Analyser le texte
          </Button>
        </TabsContent>
      </Tabs>

      {parsedDishes.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">Aperçu : {fileName}</p>
            <Badge variant="outline">{parsedDishes.length} plats</Badge>
          </div>
          <ScrollArea className="h-64 w-full rounded-md border bg-muted/20">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[60px]">Image</TableHead>
                  <TableHead>Plat</TableHead>
                  <TableHead>Infos</TableHead>
                  <TableHead>Calories</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedDishes.map((dish, index) => (
                  <TableRow key={index} className="group hover:bg-muted/30">
                    <TableCell>
                      <div className="h-10 w-10 relative rounded-md overflow-hidden bg-muted border shadow-sm">
                        {dish.imageUrl ? (
                          <img
                            src={dish.imageUrl}
                            alt=""
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                            onError={(e) => (e.currentTarget.src = 'https://placehold.co/100x100?text=No+Img')}
                          />
                        ) : (
                          <ImageIcon className="h-4 w-4 m-auto text-muted-foreground/30" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-black text-xs leading-none mb-1">{dish.name}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-muted-foreground uppercase font-medium">{dish.origin}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-[8px] py-0 px-1 border-primary/20">{dish.category}</Badge>
                        <Badge variant="secondary" className="text-[8px] py-0 px-1 font-normal">{dish.type || 'N/A'}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-[10px] font-black text-amber-600">
                        <Flame className="h-3 w-3" />
                        {dish.calories || '--'}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      )}

      {isProcessing && importProgress > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary">
            <span>Traitement des images...</span>
            <span>{importProgress}%</span>
          </div>
          <Progress value={importProgress} className="h-1.5" />
        </div>
      )}

      <Button
        onClick={handleImport}
        disabled={isProcessing || parsedDishes.length === 0}
        className="w-full h-12 text-lg font-bold shadow-xl shadow-primary/10"
      >
        {isProcessing ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <CheckCircle className="mr-2 h-5 w-5" />
        )}
        {isProcessing ? 'Importation en cours...' : `Confirmer l'importation`}
      </Button>
    </div>
  );
}
