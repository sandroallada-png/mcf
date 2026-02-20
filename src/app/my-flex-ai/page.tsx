
'use client';

import { Sidebar } from '@/components/dashboard/sidebar';
import {
  SidebarProvider,
  Sidebar as AppSidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { useUser, useFirebase, useMemoFirebase, useCollection } from '@/firebase';
import { collection, doc, query, limit, updateDoc } from 'firebase/firestore';
import { Loader2, Bot } from 'lucide-react';
import { ChatInterface } from '@/components/my-flex-ai/chat-interface';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Meal } from '@/lib/types';
import { HistoryPanel } from '@/components/my-flex-ai/history-panel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { AppHeader } from '@/components/layout/app-header';

export default function MyFlexAIPage() {
  const { user, isUserLoading } = useUser();
  const { firestore } = useFirebase();
  const router = useRouter();

  // State to manage the active conversation
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('chat');


  // Reusing data logic from dashboard to populate sidebar
  const mealsCollectionRef = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'foodLogs') : null),
    [user, firestore]
  );
  const { data: meals, isLoading: isLoadingMeals } = useCollection<Omit<Meal, 'id'>>(mealsCollectionRef);

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


  useEffect(() => {
    if (goalsData) {
      if (goalsData.length > 0 && goalsData[0]) {
        setGoals(goalsData[0].description);
        setGoalId(goalsData[0].id);
      } else if (user && !isLoadingGoals) {
        // No goals found, create a default one
        const defaultGoal = {
          userId: user.uid,
          description: 'Perdre du poids, manger plus sainement et réduire ma consommation de sucre.',
          targetValue: 2000,
          timeFrame: 'daily',
        };
        addDocumentNonBlocking(collection(firestore, 'users', user.uid, 'goals'), defaultGoal);
      }
    }
  }, [goalsData, user, isLoadingGoals, firestore]);

  const updateGoals = (newDescription: string) => {
    setGoals(newDescription);
    if (goalId && user) {
      const goalRef = doc(firestore, 'users', user.uid, 'goals', goalId);
      updateDoc(goalRef, { description: newDescription }).catch(console.error);
    }
  }

  const handleSelectConversation = (id: string | null) => {
    setActiveConversationId(id);
    setActiveTab('chat');
  };

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
        <SidebarInset className="bg-background">
          <div className="flex h-full flex-1 flex-col overflow-hidden">
            <AppHeader
              title="My Flex AI"
              icon={<Bot className="h-6 w-6" />}
              user={user}
              sidebarProps={sidebarProps}
            />

            <main className="flex-1 flex flex-col overflow-hidden relative">
              {/* Background Decorative Element */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] -mr-64 -mt-64 pointer-events-none" />

              <div className="px-4 md:px-8 pt-4 md:pt-6">
                {/* Hero Header */}
                <div className="relative rounded-3xl overflow-hidden bg-primary/5 border-2 border-primary/10 p-6 md:p-8 mb-6 group transition-all hover:bg-primary/[0.07]">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[60px] -mr-24 -mt-24 group-hover:scale-125 transition-transform duration-1000" />

                  <div className="relative z-10 flex items-center gap-6">
                    <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border-2 border-primary/10">
                      <Bot className="h-8 w-8 text-primary animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-primary">
                        <span className="font-mono text-[10px] font-black uppercase tracking-widest">Intelligence Artificielle</span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black tracking-tighter leading-tight">
                        Conseiller Personnel
                      </h2>
                      <p className="text-sm text-muted-foreground font-medium max-w-xl">
                        Votre coach intelligent dédié à votre transformation nutritionnelle et culinaire.
                      </p>
                    </div>
                  </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
                  <div className="flex justify-center mb-6">
                    <TabsList className="h-12 p-1 bg-muted/30 backdrop-blur-sm border-2 border-primary/5 rounded-2xl grid w-full max-w-md grid-cols-2">
                      <TabsTrigger
                        value="chat"
                        className="rounded-xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300"
                      >
                        Conversation
                      </TabsTrigger>
                      <TabsTrigger
                        value="history"
                        className="rounded-xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300"
                      >
                        Historique
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="flex-1 relative">
                    <TabsContent value="history" className="absolute inset-0 m-0 focus-visible:ring-0 outline-none overflow-y-auto">
                      <div className="px-2 pb-8">
                        <HistoryPanel
                          onSelectConversation={handleSelectConversation}
                          activeConversationId={activeConversationId}
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="chat" className="absolute inset-0 m-0 focus-visible:ring-0 outline-none flex flex-col h-full">
                      <div className="h-full flex flex-col pb-6 px-2">
                        <div className="flex-1 rounded-[2.5rem] border-2 border-primary/5 bg-background/50 backdrop-blur-md overflow-hidden shadow-2xl shadow-primary/5 relative">
                          <ChatInterface
                            conversationId={activeConversationId}
                            setConversationId={setActiveConversationId}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
