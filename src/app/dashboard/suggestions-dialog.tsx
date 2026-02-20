
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { getSuggestionsAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, Loader2, Sparkles, UtensilsCrossed } from 'lucide-react';
import type { Meal } from '@/lib/types';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

interface SuggestionsDialogProps {
  meal: Meal;
  goals: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SuggestionsDialog({
  meal,
  goals,
  open,
  onOpenChange,
}: SuggestionsDialogProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetSuggestions = async () => {
    setIsLoading(true);
    setSuggestions([]);
    const { suggestions: newSuggestions, error } = await getSuggestionsAction({
      loggedFood: meal.name,
      healthGoals: goals,
    });
    setIsLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error,
      });
    } else if (newSuggestions) {
      setSuggestions(newSuggestions);
    }
  };

  // Reset state when dialog is closed
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        setSuggestions([]);
        setIsLoading(false);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Alternatives plus saines
          </DialogTitle>
          <DialogDescription>
            Suggestions de notre outil pour remplacer{' '}
            <span className="font-semibold text-foreground">{meal.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-3">
              <h4 className="font-medium">Voici quelques idées :</h4>
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                {suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-8 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Cliquez sur le bouton pour obtenir des suggestions intelligentes basées sur vos objectifs de santé.
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleGetSuggestions} disabled={isLoading} className='w-full'>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Générer des suggestions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
