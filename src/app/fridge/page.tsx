
'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { MainPanel } from '@/components/fridge/main-panel';
import type { Meal } from '@/lib/types';
import {
  SidebarProvider,
  Sidebar as AppSidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { useUser, useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, query, limit, updateDoc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Loader2, Refrigerator } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';

export default function FridgePage() {
  const { user, isUserLoading } = useUser();
  const { firestore } = useFirebase();
  const router = useRouter();

  // --- Meals Data (for sidebar) ---
  const mealsCollectionRef = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'foodLogs') : null),
    [user, firestore]
  );
  const { data: meals, isLoading: isLoadingMeals } = useCollection<Omit<Meal, 'id'>>(mealsCollectionRef);

  // --- Goals Data (for sidebar) ---
  const goalsCollectionRef = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'goals') : null),
    [user, firestore]
  );
  const singleGoalQuery = useMemoFirebase(
      () => goalsCollectionRef ? query(goalsCollectionRef, limit(1)) : null,
      [goalsCollectionRef]
  )
  const { data: goalsData, isLoading: isLoadingGoals } = useCollection<{ description: string }>(singleGoalQuery);

  const [goals, setGoals] = useState('Perdre du poids, manger plus sainement et réduire ma consommation de sucre.');
  const [goalId, setGoalId] = useState<string | null>(null);

  useState(() => {
    if (goalsData) {
      if (goalsData.length > 0 && goalsData[0]) {
        setGoals(goalsData[0].description);
        setGoalId(goalsData[0].id);
      } else if (user && !isLoadingGoals) {
        const defaultGoal = {
            userId: user.uid,
            description: 'Perdre du poids, manger plus sainement et réduire ma consommation de sucre.',
            targetValue: 2000,
            timeFrame: 'daily',
        };
        addDocumentNonBlocking(collection(firestore, 'users', user.uid, 'goals'), defaultGoal);
      }
    }
  });

  const updateGoals = (newDescription: string) => {
    setGoals(newDescription);
    if (goalId && user) {
        const goalRef = doc(firestore, 'users', user.uid, 'goals', goalId);
        updateDocumentNonBlocking(goalRef, { description: newDescription });
    }
  }

  if (isUserLoading || isLoadingMeals || isLoadingGoals || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const sidebarProps = {
    goals,
    setGoals: updateGoals,
    meals: meals ?? [],
  };

  return (
    <div className="h-screen w-full bg-background font-body">
        <SidebarProvider>
            <AppSidebar collapsible="icon" className="w-80 peer hidden md:block" variant="sidebar">
              <Sidebar {...sidebarProps} />
            </AppSidebar>
            <SidebarInset>
                <div className="flex h-full flex-1 flex-col">
                    <AppHeader
                        title="Mon Frigo"
                        icon={<Refrigerator className="h-6 w-6" />}
                        user={user}
                        sidebarProps={sidebarProps}
                    />
                    <MainPanel />
                </div>
            </SidebarInset>
        </SidebarProvider>
    </div>
  );
}
