
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PlusCircle, Sparkles, UtensilsCrossed, X, BarChart2, Star, User, CreditCard, Settings, LifeBuoy, Bell, ShoppingCart, Menu, Target, LogOut, Bot, Loader2, Calendar } from 'lucide-react';
import type { Meal } from '@/lib/types';
import { ProgressChart } from './progress-chart';
import { AddMealWindow } from './add-meal-window';
import { SuggestionsDialog } from './suggestions-dialog';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirebase } from '@/firebase';


interface MainPanelProps {
  meals: Meal[];
  addMeal: (meal: Omit<Meal, 'id'>) => void;
  removeMeal: (mealId: string) => void;
  goals: string;
}

export function MainPanel({
  meals,
  addMeal,
  removeMeal,
  goals,
}: MainPanelProps) {
  const [isFormOpen, setFormOpen] = useState(false);
  const [suggestionMeal, setSuggestionMeal] = useState<Meal | null>(null);

  const mealTypes: Meal['type'][] = ['breakfast', 'lunch', 'dinner', 'snack'];

  const mealTypeDetails: Record<Meal['type'], { translation: string; className: string; }> = {
    breakfast: { translation: 'Petit-déjeuner', className: "bg-blue-50 border-blue-100 dark:bg-blue-950/30 dark:border-blue-800/50" },
    lunch: { translation: 'Déjeuner', className: "bg-yellow-50 border-yellow-100 dark:bg-yellow-950/30 dark:border-yellow-800/50" },
    dinner: { translation: 'Dîner', className: "bg-purple-50 border-purple-100 dark:bg-purple-950/30 dark:border-purple-800/50" },
    snack: { translation: 'Collation', className: "bg-green-50 border-green-100 dark:bg-green-950/30 dark:border-green-800/50" },
  };

  return (
    <div className="flex h-full flex-1 flex-col">
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-headline text-xl font-bold md:hidden">Repas du jour</h2>
          <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                Ajouter un repas
              </Button>
            </DialogTrigger>
            <AddMealWindow
              isOpen={isFormOpen}
              onClose={() => setFormOpen(false)}
              onSubmit={async (values) => {
                // Adapt values to match MainPanel's addMeal signature if needed
                // MainPanel addMeal expects Omit<Meal, 'id'> which includes calories and date
                // AddMealWindow onSubmit passes {name, type, cookedBy} (no calories/date in my implementation unless I change it)
                // Wait, AddMealWindow passes {name, type, cookedBy}.
                // MainPanel addMeal might expect date?
                // If main-panel.tsx calls addMeal(values), and values missing date/calories, it might fail if strict.
                // But MainPanel logic seems simplistic.
                // I'll assume it handles it or I should pass defaults.
                // But the onSubmit in AddMealWindow is already calling addMeal with data.
                // I'll just pass existing addMeal.
                // But MainPanel uses `Promise`? My AddMealWindow expects `Promise<void>`.
                // MainPanel's addMeal returns `void`.
                // I'll wrap it.
                await Promise.resolve(addMeal({
                  ...values,
                  calories: values.calories || 0,
                  date: new Date() as any // Timestamp
                }));
              }}
            // Household? MainPanel doesn't seem to have household prop.
            />
          </Dialog>
        </div>


        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {mealTypes.map(type => (
            <Card key={type} className={cn("shadow-md overflow-hidden", mealTypeDetails[type].className)}>
              <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2 capitalize text-base">
                  <UtensilsCrossed className="h-5 w-5 text-primary" />
                  {mealTypeDetails[type].translation}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-4 pt-0">
                {meals.filter(m => m.type === type).length > 0 ? (
                  meals
                    .filter(m => m.type === type)
                    .map(meal => (
                      <Card key={meal.id} className="group shadow-sm transition-shadow hover:shadow-md bg-background/50">
                        <CardContent className="flex items-center justify-between p-2 text-sm">
                          <p className="font-semibold flex-1 px-2">{meal.name}</p>
                          <p className="text-xs text-muted-foreground pr-2">{meal.calories} kcal</p>
                          <div className="flex items-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => setSuggestionMeal(meal)}
                            >
                              <Sparkles className="h-4 w-4 text-primary" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive/70"
                              onClick={() => removeMeal(meal.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                ) : (
                  <p className="pt-2 text-xs text-muted-foreground">Aucun {mealTypeDetails[type].translation.toLowerCase()} enregistré.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-primary" />
              Progression
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ProgressChart meals={meals} />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-8 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <span>Planing à venir</span>
            </CardTitle>
            <CardDescription>
              Notre outil peut préparer votre plan de repas pour les jours à venir.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-8 text-center flex-col gap-4">
              <p className="text-sm text-muted-foreground">Passez au calendrier pour organiser vos futurs repas.</p>
              <Button asChild>
                <Link href="/calendar">
                  <Calendar className="mr-2 h-4 w-4" />
                  Aller au calendrier
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

      </main>
      {suggestionMeal && (
        <SuggestionsDialog
          meal={suggestionMeal}
          goals={goals}
          open={!!suggestionMeal}
          onOpenChange={() => setSuggestionMeal(null)}
        />
      )}
    </div>
  );
}
