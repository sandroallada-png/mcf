
'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { MainPanel } from '@/components/fridge/main-panel';
import {
  SidebarProvider,
  Sidebar as AppSidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { useUser, useFirebase, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, query, limit } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { UserProfile, Meal } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { Refrigerator, Loader2 } from 'lucide-react';

export default function FridgePage() {
  const { user, isUserLoading } = useUser();
  const { firestore } = useFirebase();
  // --- User Profile ---
  const userProfileRef = useMemoFirebase(() => (user ? doc(firestore, 'users', user.uid) : null), [user, firestore]);
  const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userProfileRef);

  const effectiveChefId = userProfile?.chefId || user?.uid;

  // --- Meals Data (for sidebar) ---
  const mealsCollectionRef = useMemoFirebase(
    () => (effectiveChefId ? collection(firestore, 'users', effectiveChefId, 'foodLogs') : null),
    [effectiveChefId, firestore]
  );
  const { data: meals, isLoading: isLoadingMeals } = useCollection<Omit<Meal, 'id'>>(mealsCollectionRef);

  // --- Goals Data (for sidebar) ---
  const goalsCollectionRef = useMemoFirebase(
    () => (effectiveChefId ? collection(firestore, 'users', effectiveChefId, 'goals') : null),
    [effectiveChefId, firestore]
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
    if (goalId && effectiveChefId) {
      const goalRef = doc(firestore, 'users', effectiveChefId, 'goals', goalId);
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
