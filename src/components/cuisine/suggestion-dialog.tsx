
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
import { Clock, PlusCircle, Calendar, Loader2, Info, UtensilsCrossed, Library, Flame, Heart, BookOpen, ShoppingBag } from 'lucide-react';
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
import { ImageZoomLightbox } from '../shared/image-zoom-lightbox';

interface SuggestionDialogProps {
  suggestion: SingleMealSuggestion | null;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (meal: SingleMealSuggestion, date: Date, recipe: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (meal: SingleMealSuggestion) => void;
}


export function SuggestionDialog({
  suggestion,
  isOpen,
  onClose,
  onAccept,
  isFavorite,
  onToggleFavorite,
}: SuggestionDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [localSuggestion, setLocalSuggestion] = useState(suggestion);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
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
    onAccept(localSuggestion, new Date(), localSuggestion.recipe || '');
  }

  const imageUrl = localSuggestion.imageUrl || `https://picsum.photos/seed/${localSuggestion.name.replace(/\s/g, '-')}/800/400`;
  const recipeToDisplay = localSuggestion.recipe;
  const descriptionToDisplay = localSuggestion.description;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-none bg-background/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{localSuggestion.name}</DialogTitle>
          <DialogDescription>Détails et recette pour {localSuggestion.name}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row h-[90vh] md:h-[600px]">
          {/* Left Side: Visual & Quick Meta */}
          <div className="w-full md:w-[40%] relative bg-[#0d0d0d] hidden md:block">
            <Image
              src={imageUrl}
              alt={localSuggestion.name}
              fill
              className="object-cover opacity-80 cursor-zoom-in hover:scale-105 transition-transform duration-700"
              quality={100}
              priority
              onClick={() => setZoomImage(imageUrl)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent" />

            {/* Favorite Button */}
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(localSuggestion);
                }}
                className="absolute top-6 left-6 z-40 p-2.5 rounded-xl bg-black/40 backdrop-blur-md hover:bg-black/60 transition-all group border border-white/10"
              >
                <Heart
                  className={cn(
                    "h-5 w-5 transition-all duration-300",
                    isFavorite ? "fill-rose-500 text-rose-500 scale-110" : "text-white/70 group-hover:text-rose-500 group-hover:scale-110"
                  )}
                />
              </button>
            )}

            <div className="absolute bottom-6 left-6 right-6 space-y-4">
              <Badge className="bg-amber-500 text-black font-black text-[8px] uppercase tracking-widest px-3 py-1 rounded-full border-none shadow-lg shadow-amber-500/20">
                Premium Workshop
              </Badge>
              <h2 className="text-2xl font-bold text-white font-serif leading-tight">
                {localSuggestion.name}
              </h2>
              <div className="flex items-center gap-4 text-white/70 text-[10px] uppercase font-black tracking-widest pt-2">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-amber-500" />
                  <span>{localSuggestion.cookingTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Content & Actions */}
          <div className="flex-1 flex flex-col min-w-0 bg-background dark:bg-[#0d0d0d]/40">
            {/* Mobile Image (visible only on small screens) */}
            <div className="md:hidden relative h-48 w-full cursor-zoom-in">
              <Image
                src={imageUrl}
                alt={localSuggestion.name}
                fill
                className="object-cover"
                onClick={() => setZoomImage(imageUrl)}
              />
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-background to-transparent flex items-end justify-between">
                <h2 className="text-xl font-bold text-foreground font-serif">{localSuggestion.name}</h2>
                {onToggleFavorite && (
                  <button
                    onClick={() => onToggleFavorite(localSuggestion)}
                    className="p-2.5 rounded-xl bg-black/40 backdrop-blur-md shadow-lg mb-1 border border-white/10"
                  >
                    <Heart className={cn("h-4 w-4 transition-all", isFavorite ? "fill-rose-500 text-rose-500 scale-110" : "text-white")} />
                  </button>
                )}
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6 md:p-8 space-y-8">
                {/* Summary / Description */}
                {descriptionToDisplay && (
                  <div className="space-y-3">
                    <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-amber-600 dark:text-amber-500">Résumé</h3>
                    <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                      {descriptionToDisplay}
                    </p>
                  </div>
                )}

                {/* Recipe Content - Modified to only show summary/action for saved recipes, and full content for AI ones */}
                <div className="space-y-6">
                  {recipeToDisplay ? (
                    localSuggestion.id ? (
                      <div className="space-y-6">
                        <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-4">
                          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 font-black text-[10px] uppercase tracking-widest">
                            <BookOpen className="h-4 w-4" />
                            <span>Contenu disponible</span>
                          </div>
                          <p className="text-sm text-foreground/70 leading-relaxed italic">
                            Cette œuvre culinaire contient une recette détaillée avec techniques de dressage et secrets du chef.
                          </p>

                          <Link href={`/atelier/recipe/${localSuggestion.id}`} className="block">
                            <Button variant="outline" className="w-full border-amber-500/20 text-amber-600 hover:bg-amber-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest h-10 rounded-xl">
                              Lire la recette complète
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-5 text-sm">
                        {recipeToDisplay.split('\n').map((line, i) => {
                          const trimmed = line.trim();
                          if (!trimmed) return <div key={i} className="h-2" />;
                          // Heading ## or #
                          if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
                            return (
                              <h3 key={i} className="text-base font-bold font-serif text-primary border-b border-amber-500/20 pb-2 mt-6 first:mt-0">
                                {trimmed.replace(/^#+\s/, '')}
                              </h3>
                            );
                          }
                          // Bold **text** converted to span
                          if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length > 4) {
                            return (
                              <p key={i} className="font-black text-xs uppercase tracking-widest text-amber-600 dark:text-amber-500 mt-4">
                                {trimmed.slice(2, -2)}
                              </p>
                            );
                          }
                          // List items
                          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                            return (
                              <div key={i} className="flex items-start gap-3 ml-2">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                                <span className="text-foreground/80 leading-relaxed text-[13px]">{trimmed.slice(2)}</span>
                              </div>
                            );
                          }
                          // Numbered list
                          const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
                          if (numMatch) {
                            return (
                              <div key={i} className="flex items-start gap-3 ml-2">
                                <span className="shrink-0 h-5 w-5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-500 text-[10px] font-black flex items-center justify-center mt-0.5">{numMatch[1]}</span>
                                <span className="text-foreground/80 leading-relaxed text-[13px]">{numMatch[2]}</span>
                              </div>
                            );
                          }
                          // Normal paragraph
                          return (
                            <p key={i} className="text-foreground/75 leading-relaxed text-[13px]">{trimmed}</p>
                          );
                        })}
                      </div>
                    )
                  ) : (
                    <Alert className="bg-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-500">
                      <Info className="h-4 w-4" />
                      <AlertTitle className="font-black text-xs uppercase tracking-widest">Contenu Indisponible</AlertTitle>
                      <AlertDescription className="text-[11px] font-medium leading-relaxed mt-2">
                        Cette œuvre culinaire nécessite un accès spécial ou n'a pas encore de détails enregistrés.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </ScrollArea>

            {/* Sticky Action Footer */}
            <div className="p-6 border-t border-border/10 bg-background/50 backdrop-blur-md space-y-3">
              {localSuggestion.price && localSuggestion.price > 0 && (
                <Button
                  className="w-full h-12 rounded-full font-black text-xs uppercase tracking-widest bg-amber-500 hover:bg-amber-600 text-black shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => {
                    toast({
                      title: "Redirection vers le paiement",
                      description: `Cet atelier coûte ${localSuggestion.price}€. Vous allez être redirigé.`,
                    });
                  }}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  S'offrir cet atelier ({localSuggestion.price}€)
                </Button>
              )}

              <Button
                onClick={handleAdd}
                className="w-full h-12 rounded-full font-black text-xs uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Ajouter à mon grimoire
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
      <ImageZoomLightbox
        isOpen={!!zoomImage}
        imageUrl={zoomImage}
        onClose={() => setZoomImage(null)}
      />
    </Dialog>
  );
}

