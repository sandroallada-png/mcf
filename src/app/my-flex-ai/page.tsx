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
import { useState, useEffect } from 'react';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Meal } from '@/lib/types';
import { HistoryPanel } from '@/components/my-flex-ai/history-panel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppHeader } from '@/components/layout/app-header';

export default function MyFlexAIPage() {
  const { user, isUserLoading } = useUser();
  const { firestore } = useFirebase();

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('chat');

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
  );
  const { data: goalsData, isLoading: isLoadingGoals } = useCollection<{ description: string }>(singleGoalQuery);
  const [goals, setGoals] = useState('Perdre du poids, manger plus sainement et réduire ma consommation de sucre.');
  const [goalId, setGoalId] = useState<string | null>(null);

  useEffect(() => {
    if (goalsData) {
      if (goalsData.length > 0 && goalsData[0]) {
        setGoals(goalsData[0].description);
        setGoalId(goalsData[0].id);
      } else if (user && !isLoadingGoals) {
        addDocumentNonBlocking(collection(firestore, 'users', user.uid, 'goals'), {
          userId: user.uid,
          description: 'Perdre du poids, manger plus sainement et réduire ma consommation de sucre.',
          targetValue: 2000,
          timeFrame: 'daily',
        });
      }
    }
  }, [goalsData, user, isLoadingGoals, firestore]);

  const updateGoals = (newDescription: string) => {
    setGoals(newDescription);
    if (goalId && user) {
      updateDoc(doc(firestore, 'users', user.uid, 'goals', goalId), { description: newDescription }).catch(console.error);
    }
  };

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

  const sidebarProps = { goals, setGoals: updateGoals, meals: meals ?? [] };

  return (
    <div className="h-screen w-full bg-background font-body flex flex-col overflow-hidden">
      <SidebarProvider>
        <AppSidebar collapsible="icon" className="w-80 peer hidden md:block" variant="sidebar">
          <Sidebar {...sidebarProps} />
        </AppSidebar>

        <SidebarInset className="bg-background flex flex-col overflow-hidden flex-1">
          {/* ── Header fixe ── */}
          <AppHeader
            title="My Flex Coach"
            icon={<Bot className="h-6 w-6" />}
            user={user}
            sidebarProps={sidebarProps}
          />

          {/* ── Zone de travail : prend tout l'espace sous le header ── */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* ── Barre d'onglets : hauteur fixe, ne bouge jamais ── */}
            <div className="shrink-0 px-3 md:px-6 pt-3 pb-2">
              <TabsList className="h-10 md:h-12 p-1 bg-muted/30 backdrop-blur-sm border border-primary/10 rounded-2xl grid w-full grid-cols-2">
                <TabsTrigger
                  value="chat"
                  className="rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300"
                >
                  Conversation
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300"
                >
                  Historique
                </TabsTrigger>
              </TabsList>
            </div>

            {/* ── Carte partagée : s'étire jusqu'en bas ── */}
            <div className="flex-1 mx-3 md:mx-6 mb-3 md:mb-4 min-h-0 rounded-2xl md:rounded-3xl border border-primary/10 bg-background/50 backdrop-blur-md shadow-xl shadow-primary/5 overflow-hidden flex flex-col">

              {/* TAB : CONVERSATION */}
              <TabsContent
                value="chat"
                className="flex-1 m-0 focus-visible:ring-0 outline-none flex flex-col min-h-0 data-[state=inactive]:hidden"
              >
                <ChatInterface
                  conversationId={activeConversationId}
                  setConversationId={setActiveConversationId}
                />
              </TabsContent>

              {/* TAB : HISTORIQUE */}
              <TabsContent
                value="history"
                className="flex-1 m-0 focus-visible:ring-0 outline-none flex flex-col min-h-0 data-[state=inactive]:hidden"
              >
                <HistoryPanel
                  onSelectConversation={handleSelectConversation}
                  activeConversationId={activeConversationId}
                />
              </TabsContent>

            </div>
          </Tabs>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
