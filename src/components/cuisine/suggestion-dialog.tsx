
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, PlusCircle, Calendar, Loader2, Info, UtensilsCrossed } from 'lucide-react';
import type { SingleMealSuggestion } from '@/lib/types';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { Calendar as CalendarPicker } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

interface SuggestionDialogProps {
  suggestion: SingleMealSuggestion | null;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (meal: SingleMealSuggestion, date: Date, recipe: string) => void;
}


export function SuggestionDialog({
  suggestion,
  isOpen,
  onClose,
  onAccept,
}: SuggestionDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [localSuggestion, setLocalSuggestion] = useState(suggestion);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && suggestion) {
      setLocalSuggestion(suggestion);
    }
  }, [suggestion, isOpen]);

  if (!suggestion || !localSuggestion) {
    return null;
  }

  const handleAdd = () => {
    if (!selectedDate) {
      toast({ variant: "destructive", title: "Date manquante", description: "Veuillez sélectionner une date." });
      return;
    }
    // We now pass an empty string if recipe is not available. The Atelier page will handle this.
    onAccept(localSuggestion, selectedDate, localSuggestion.recipe || '');
  }

  const imageUrl = localSuggestion.imageUrl || `https://picsum.photos/seed/${localSuggestion.name.replace(/\s/g, '-')}/800/400`;
  const recipeToDisplay = localSuggestion.recipe;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold sr-only">{localSuggestion.name}</DialogTitle>
          <DialogDescription className="sr-only">Détails et recette pour {localSuggestion.name}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh]">
          <div className="pr-6 space-y-6">
            <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden border">
              <Image
                src={imageUrl}
                alt={localSuggestion.name}
                fill
                className="object-cover"
                data-ai-hint={localSuggestion.imageHint}
                quality={100}
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tight">{localSuggestion.name}</h2>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="bg-accent/50 text-foreground font-bold px-2 py-0.5 rounded text-[10px]">
                  {localSuggestion.calories} kcal
                </Badge>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-muted-foreground/60 tracking-widest">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{localSuggestion.cookingTime}</span>
                </div>
              </div>
            </div>
            <div className="space-y-4 py-6">
              {recipeToDisplay ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{recipeToDisplay}</ReactMarkdown>
                </div>
              ) : (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Recette non disponible</AlertTitle>
                  <AlertDescription>
                    Aucune recette détaillée n'est enregistrée pour ce plat. Vous pouvez l'ajouter au calendrier et créer la recette plus tard dans l'Atelier du Chef.
                  </AlertDescription>
                </Alert>
              )}
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/atelier">
                  <UtensilsCrossed className="mr-2 h-4 w-4" />
                  Aller à l'atelier
                </Link>
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Planifier ce repas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type de repas</label>
                  <Select onValueChange={(value) => setLocalSuggestion(prev => ({ ...prev!, type: value as SingleMealSuggestion['type'] }))} defaultValue={localSuggestion.type}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Petit-déjeuner</SelectItem>
                      <SelectItem value="lunch">Déjeuner</SelectItem>
                      <SelectItem value="dinner">Dîner</SelectItem>
                      <SelectItem value="dessert">Dessert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="pt-6 pr-6">
          <Button className="w-full" onClick={handleAdd}>
            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter au journal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
