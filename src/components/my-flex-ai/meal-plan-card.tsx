
'use client';

import { useState } from 'react';
import type { MealPlan } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Check, Utensils, Zap, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MealPlanCardProps {
  plan: MealPlan;
}

export function MealPlanCard({ plan }: MealPlanCardProps) {
  const { user, firestore } = useFirebase();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleApprovePlan = async () => {
    if (!user || isAdded) return;

    setIsAdding(true);
    const mealsCollection = collection(firestore, `users/${user.uid}/foodLogs`);

    try {
      const promises = plan.map(meal => {
        const mealDate = parseISO(meal.date); // Convert string date to Date object
        return addDocumentNonBlocking(mealsCollection, {
          userId: user.uid,
          name: meal.name,
          calories: meal.calories,
          type: meal.type,
          date: Timestamp.fromDate(mealDate),
        });
      });

      await Promise.all(promises);

      setIsAdded(true);
      toast({
        title: 'Plan de repas ajouté !',
        description: 'Les repas ont été ajoutés à votre calendrier.',
      });
    } catch (error) {
      console.error('Failed to add meal plan:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Impossible d'ajouter le plan de repas.",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const groupedByDate = plan.reduce((acc, meal) => {
    const dateStr = meal.date;
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(meal);
    return acc;
  }, {} as Record<string, MealPlan>);

  return (
    <Card className="mt-4 bg-background/50 border-primary/20 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-5 w-5 text-primary" />
          Suggestion de plan de repas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(groupedByDate).map(([date, meals]) => (
          <div key={date}>
            <h4 className="font-semibold text-sm mb-2">
              {format(parseISO(date), 'eeee d MMMM', { locale: fr })}
            </h4>
            <div className="space-y-2">
              {meals.map(meal => (
                <div key={meal.name} className="flex items-center justify-between text-xs p-2 bg-background rounded-md">
                  <div className="flex items-center gap-2">
                    <Utensils className="h-3 w-3 text-muted-foreground"/>
                    <span className="font-medium">{meal.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{meal.calories} kcal</span>
                    <Zap className="h-3 w-3 text-muted-foreground"/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <Button
          onClick={handleApprovePlan}
          disabled={isAdding || isAdded}
          className="w-full mt-4"
        >
          {isAdding ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : isAdded ? (
            <Check className="mr-2 h-4 w-4" />
          ) : (
            <Calendar className="mr-2 h-4 w-4" />
          )}
          {isAdded ? 'Plan ajouté !' : isAdding ? 'Ajout en cours...' : 'Ajouter au calendrier'}
        </Button>
      </CardContent>
    </Card>
  );
}
