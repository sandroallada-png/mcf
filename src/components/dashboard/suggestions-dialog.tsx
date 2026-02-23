
'use client';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { getSuggestionsAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, Loader2, Sparkles, UtensilsCrossed, Flame, Info, ChevronRight, Check, ArrowRightLeft } from 'lucide-react';
import type { Meal } from '@/lib/types';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';

interface SuggestionsDialogProps {
  meal: Omit<Meal, 'id' | 'date'> & { id?: string };
  goals: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageClick?: (url: string) => void;
  onSelectAlternative?: (name: string) => Promise<void>;
}

export function SuggestionsDialog({
  meal,
  goals,
  open,
  onOpenChange,
  onImageClick,
  onSelectAlternative,
}: SuggestionsDialogProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);
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
      toast({ variant: 'destructive', title: 'Erreur', description: error });
    } else if (newSuggestions) {
      setSuggestions(newSuggestions);
    }
  };

  const handleSelectSuggestion = async (suggestion: string, index: number) => {
    if (!onSelectAlternative || replacingIndex !== null) return;
    setReplacingIndex(index);
    try {
      await onSelectAlternative(suggestion);
    } finally {
      setReplacingIndex(null);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSuggestions([]);
      setIsLoading(false);
      setReplacingIndex(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-none bg-background/95 backdrop-blur-xl shadow-2xl rounded-[2rem]">
        <div className="sr-only">
          <DialogTitle>Détails et suggestions du repas</DialogTitle>
          <DialogDescription>Consultez les détails de votre repas et découvrez des alternatives plus saines.</DialogDescription>
        </div>
        <div className="relative">
          {/* Header Backdrop */}
          <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/5 to-background border-b border-primary/10 relative overflow-hidden">
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute top-20 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
            </div>
          </div>

          <div className="px-6 pb-8 -mt-16 relative z-10">
            {/* Meal Preview Card */}
            <div className="bg-card border border-border/50 rounded-3xl p-5 shadow-xl flex items-center gap-5 transition-all hover:shadow-2xl hover:border-primary/20 group">
              <div
                className={cn(
                  "h-24 w-24 rounded-2xl overflow-hidden bg-muted border-2 border-background shadow-lg shrink-0 transition-transform active:scale-95",
                  meal.imageUrl && "cursor-zoom-in"
                )}
                onClick={() => meal.imageUrl && onImageClick?.(meal.imageUrl)}
              >
                {meal.imageUrl ? (
                  <img src={meal.imageUrl} alt={meal.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <UtensilsCrossed className="h-10 w-10 text-muted-foreground/20" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5">
                    Votre repas
                  </Badge>
                  <div className="flex items-center gap-1 text-orange-500 font-bold text-[10px]">
                    <Flame className="h-3 w-3" />
                    {meal.calories} kcal
                  </div>
                </div>
                <h2 className="text-2xl font-black text-foreground leading-tight">{meal.name}</h2>
              </div>
            </div>

            {/* Suggestions Section */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Alternatives suggérées
                </h3>
                {suggestions.length > 0 && (
                  <span className="text-[9px] text-primary/70 font-bold uppercase tracking-widest flex items-center gap-1 bg-primary/5 px-2 py-1 rounded-full border border-primary/10">
                    <ArrowRightLeft className="h-2.5 w-2.5" />
                    Cliquez pour remplacer
                  </span>
                )}
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="relative">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-primary animate-pulse" />
                  </div>
                  <p className="text-sm font-bold text-muted-foreground animate-pulse uppercase tracking-widest">Analyse en cours...</p>
                </div>
              ) : suggestions.length > 0 ? (
                <ScrollArea className="h-60 pr-1">
                  <div className="space-y-2.5">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        disabled={replacingIndex !== null}
                        onClick={() => handleSelectSuggestion(s, i)}
                        className={cn(
                          "w-full text-left p-4 rounded-2xl border transition-all group/item flex items-center gap-4 animate-in slide-in-from-bottom-2 duration-300",
                          replacingIndex === i
                            ? "border-primary bg-primary/10 scale-[0.99]"
                            : "bg-muted/20 border-border/50 hover:border-primary/40 hover:bg-primary/5 hover:scale-[1.01] active:scale-[0.99]",
                          replacingIndex !== null && replacingIndex !== i && "opacity-40 cursor-not-allowed"
                        )}
                        style={{ animationDelay: `${i * 80}ms` }}
                      >
                        <div className={cn(
                          "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-all",
                          replacingIndex === i ? "bg-primary" : "bg-primary/10 group-hover/item:bg-primary/20"
                        )}>
                          {replacingIndex === i ? (
                            <Loader2 className="h-4 w-4 text-white animate-spin" />
                          ) : (
                            <span className="text-xs font-black text-primary">{i + 1}</span>
                          )}
                        </div>
                        <p className={cn(
                          "flex-1 text-sm font-bold transition-colors leading-snug",
                          replacingIndex === i ? "text-primary" : "text-foreground/90 group-hover/item:text-primary"
                        )}>{s}</p>
                        {replacingIndex === i ? (
                          <Check className="h-4 w-4 text-primary shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 -translate-x-1 group-hover/item:translate-x-0 transition-transform" />
                        )}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-muted bg-muted/10 p-10 text-center space-y-4">
                  <div className="h-16 w-16 items-center justify-center rounded-3xl bg-primary/5 flex">
                    <Lightbulb className="h-8 w-8 text-primary opacity-40" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-foreground uppercase tracking-widest">Optimisez votre alimentation</p>
                    <p className="text-[11px] text-muted-foreground font-medium max-w-[280px]">
                      Basé sur vos objectifs, notre outil peut vous proposer des variantes plus saines pour ce repas.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Action */}
            <div className="mt-6">
              <Button
                onClick={handleGetSuggestions}
                disabled={isLoading || replacingIndex !== null}
                className={cn(
                  "w-full h-14 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]",
                  suggestions.length > 0 ? "bg-muted text-foreground hover:bg-muted/80" : "bg-primary text-white shadow-primary/20"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Recherche...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {suggestions.length > 0 ? "Actualiser les alternatives" : "Trouver un alternative"}
                  </>
                )}
              </Button>
              <div className="flex items-center gap-2 justify-center mt-4 opacity-40">
                <Info className="h-3 w-3" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Notre outil formé sur vos objectifs santé</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
