
'use client';

import { useState } from 'react';
import { useFirebase } from '@/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, CheckCircle, FileJson } from 'lucide-react';
import type { Dish } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';

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

        if (!Array.isArray(json)) {
            throw new Error("Le fichier JSON doit contenir un tableau de plats.");
        }

        const dishes: ParsedDish[] = json.map(row => ({
          name: row.name || '',
          category: row.category || 'Inconnu',
          origin: row.origin || 'Inconnu',
          cookingTime: row.cookingTime || 'N/A',
          imageUrl: row.imageUrl || '',
          type: row.type || '',
          recipe: row.recipe || '',
        })).filter(dish => dish.name); // Filtrer les plats sans nom

        if (dishes.length === 0) {
            throw new Error("Aucun plat valide trouvé dans le fichier. Vérifiez la présence de la clé 'name'.");
        }

        setParsedDishes(dishes);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Erreur de lecture du JSON",
          description: error.message || "Impossible de lire le fichier. Assurez-vous qu'il est au bon format."
        });
        setFileName('');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (parsedDishes.length === 0) return;

    setIsProcessing(true);
    try {
      const dishesRef = collection(firestore, 'dishes');
      const batch = writeBatch(firestore);

      parsedDishes.forEach(dish => {
        const newDishRef = doc(dishesRef);
        batch.set(newDishRef, dish);
      });

      await batch.commit();
      toast({
        title: "Importation réussie",
        description: `${parsedDishes.length} plats ont été ajoutés à la base de données.`,
      });
      onImportComplete();
    } catch (error) {
      console.error("Error importing dishes:", error);
      toast({
        variant: "destructive",
        title: "Erreur d'importation",
        description: "Une erreur est survenue lors de l'ajout des plats."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <FileJson className="h-4 w-4" />
        <AlertTitle>Format du fichier JSON</AlertTitle>
        <AlertDescription>
          Le fichier doit être un tableau d'objets. Chaque objet doit contenir au minimum une clé <strong>`name`</strong>. Les autres clés (category, origin, etc.) sont optionnelles.
        </AlertDescription>
      </Alert>

      <Input
        type="file"
        accept=".json"
        onChange={handleFileChange}
        disabled={isProcessing}
      />

      {parsedDishes.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm font-medium">Aperçu des données de "{fileName}":</p>
          <ScrollArea className="h-64 w-full rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Origine</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedDishes.map((dish, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{dish.name}</TableCell>
                    <TableCell>{dish.category}</TableCell>
                    <TableCell>{dish.origin}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      )}

      <Button
        onClick={handleImport}
        disabled={isProcessing || parsedDishes.length === 0}
        className="w-full"
      >
        {isProcessing ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle className="mr-2 h-4 w-4" />
        )}
        {isProcessing ? 'Traitement...' : `Importer ${parsedDishes.length} plats`}
      </Button>
    </div>
  );
}
