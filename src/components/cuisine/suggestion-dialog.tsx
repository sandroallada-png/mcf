
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
import { Clock, PlusCircle, Calendar, Loader2, Info, UtensilsCrossed, Library, Flame, Heart, BookOpen, ShoppingBag, Hourglass } from 'lucide-react';
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
  onAccept?: (meal: SingleMealSuggestion, date: Date, recipe: string) => void;
  onAddToPending?: (meal: SingleMealSuggestion) => void;
  onPlan?: (meal: SingleMealSuggestion, date: Date, slot: 'breakfast' | 'lunch' | 'dinner' | 'dessert') => void;
  existingCookings?: Cooking[];
  isFavorite?: boolean;
  onToggleFavorite?: (meal: SingleMealSuggestion) => void;
  mode?: 'recipe' | 'dish' | 'suggestion';
}


export function SuggestionDialog({
  suggestion,
  isOpen,
  onClose,
  onAccept,
  onAddToPending,
  onPlan,
  existingCookings = [],
  isFavorite,
  onToggleFavorite,
  mode = 'suggestion',
}: SuggestionDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<'breakfast' | 'lunch' | 'dinner' | 'dessert'>('lunch');
  const [conflictMeal, setConflictMeal] = useState<Cooking | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [localSuggestion, setLocalSuggestion] = useState(suggestion);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && suggestion) {
      setLocalSuggestion(suggestion);
      // Auto-set slot based on suggestion type if available
      if (suggestion.type) {
        setSelectedSlot(suggestion.type as any);
      }
    }
  }, [suggestion, isOpen]);

  if (!suggestion || !localSuggestion) {
    return null;
  }

  const handleAdd = () => {
    onAccept?.(localSuggestion, new Date(), localSuggestion.recipe || '');
  }

  const handlePlanClick = () => {
    // Check for conflict
    const conflict = existingCookings.find(c => {
      const cDate = c.plannedFor?.toDate ? c.plannedFor.toDate() : new Date(c.plannedFor);
      return format(cDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') && c.type === selectedSlot;
    });

    if (conflict) {
      setConflictMeal(conflict);
    } else {
      onPlan?.(localSuggestion, selectedDate, selectedSlot);
    }
  }

  const confirmReplacement = () => {
    onPlan?.(localSuggestion, selectedDate, selectedSlot);
    setConflictMeal(null);
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
              {mode === 'recipe' && (
                <Badge className="bg-amber-500 text-black font-black text-[8px] uppercase tracking-widest px-3 py-1 rounded-full border-none shadow-lg shadow-amber-500/20">
                  Premium Workshop
                </Badge>
              )}
              <h2 className="text-2xl font-bold text-white font-serif leading-tight">
                {localSuggestion.name}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-white/70 text-[10px] uppercase font-black tracking-widest pt-2">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-amber-500" />
                  <span>{localSuggestion.cookingTime}</span>
                </div>
                {localSuggestion.calories > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Flame className="h-3 w-3 text-orange-500" />
                    <span>{localSuggestion.calories} kcal</span>
                  </div>
                )}
                {localSuggestion.type && (
                  <div className="flex items-center gap-1.5">
                    <UtensilsCrossed className="h-3 w-3 text-emerald-500" />
                    <span>{localSuggestion.type}</span>
                  </div>
                )}
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

                {/* Recipe Content - Full display for Cuisine, summary/link ONLY for Atelier recipes */}
                <div className="space-y-6">
                  {recipeToDisplay ? (
                    localSuggestion.id && mode === 'recipe' ? (
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
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown
                          components={{
                            h1: ({ node, ...props }) => <h3 className="text-base font-bold font-serif text-primary border-b border-amber-500/20 pb-2 mt-6 first:mt-0" {...props} />,
                            h2: ({ node, ...props }) => <h3 className="text-base font-bold font-serif text-primary border-b border-amber-500/20 pb-2 mt-6 first:mt-0" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-sm font-bold font-serif text-primary/80 border-b border-amber-500/10 pb-1 mt-4" {...props} />,
                            p: ({ node, ...props }) => <p className="text-foreground/75 leading-relaxed text-[13px] mb-4" {...props} />,
                            li: ({ node, ...props }) => (
                              <li className="flex items-start gap-3 ml-2 list-none mb-2">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                                <span className="text-foreground/80 leading-relaxed text-[13px]">{props.children}</span>
                              </li>
                            ),
                            ul: ({ node, ...props }) => <ul className="p-0 m-0" {...props} />,
                            ol: ({ node, ...props }) => <ol className="p-0 m-0 space-y-2" {...props} />,
                          }}
                        >
                          {recipeToDisplay}
                        </ReactMarkdown>
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
            {(localSuggestion.price && localSuggestion.price > 0 || onPlan || onAddToPending || (onAccept && !onPlan && !onAddToPending)) && (
              <div className="p-6 border-t border-border/10 bg-background/50 backdrop-blur-md space-y-4">
                {localSuggestion.price && localSuggestion.price > 0 && (
                  <Button
                    className="w-full h-12 rounded-xl font-black text-[10px] uppercase tracking-widest bg-amber-500 hover:bg-amber-600 text-black shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
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

                {(onPlan || onAddToPending) && (
                  <div className="grid grid-cols-1 gap-3">
                    {onPlan && (
                      <div className="flex flex-col gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Planifier ce repas</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full h-11 rounded-xl border-border/50 font-bold text-xs justify-start px-4">
                                <Calendar className="mr-2 h-4 w-4 text-primary" />
                                {format(selectedDate, 'd MMMM yyyy', { locale: fr })}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl" align="start">
                              <CalendarPicker
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => date && setSelectedDate(date)}
                                initialFocus
                                locale={fr}
                                className="p-3"
                              />
                            </PopoverContent>
                          </Popover>

                          <Select value={selectedSlot} onValueChange={(val: any) => setSelectedSlot(val)}>
                            <SelectTrigger className="w-full h-11 rounded-xl border-border/50 font-bold text-xs">
                              <SelectValue placeholder="Moment" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-none shadow-2xl">
                              <SelectItem value="breakfast" className="rounded-lg">☕ Matin</SelectItem>
                              <SelectItem value="lunch" className="rounded-lg">🍴 Midi</SelectItem>
                              <SelectItem value="dinner" className="rounded-lg">🌙 Soir</SelectItem>
                              <SelectItem value="dessert" className="rounded-lg">🍰 Dessert / Goûter</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Button
                          onClick={handlePlanClick}
                          className="w-full h-12 rounded-xl font-black text-[10px] uppercase tracking-widest bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Confirmer la programmation
                        </Button>
                      </div>
                    )}

                    {onAddToPending && (
                      <Button
                        variant="outline"
                        onClick={() => onAddToPending(localSuggestion)}
                        className="w-full h-12 rounded-xl font-black text-[10px] uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5 transition-all"
                      >
                        <Hourglass className="mr-2 h-4 w-4" />
                        Mettre en attente
                      </Button>
                    )}
                  </div>
                )}

                {onAccept && !onPlan && !onAddToPending && (
                  <Button
                    onClick={handleAdd}
                    className="w-full h-12 rounded-xl font-black text-[10px] uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {mode === 'recipe' ? "Ajouter à mon grimoire" : "Valider ce repas"}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
      <ImageZoomLightbox
        isOpen={!!zoomImage}
        imageUrl={zoomImage}
        onClose={() => setZoomImage(null)}
      />

      {/* Conflict Dialog */}
      <Dialog open={!!conflictMeal} onOpenChange={() => setConflictMeal(null)}>
        <DialogContent className="max-w-md rounded-3xl border-none p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-2">
            <Info className="h-8 w-8 text-amber-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black font-serif">Conflit de planning</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Vous avez déjà le plat <span className="font-bold text-foreground">"{conflictMeal?.name}"</span> programmé pour ce moment.
              <br /><br />
              Souhaitez-vous le <span className="text-primary font-bold">remplacer</span> ?
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button variant="outline" onClick={() => setConflictMeal(null)} className="flex-1 h-12 rounded-xl font-bold">
              Annuler
            </Button>
            <Button onClick={confirmReplacement} className="flex-1 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest bg-primary">
              Oui, changer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

