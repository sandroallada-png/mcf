
'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chatAction, generateTitleAction } from '@/app/actions';
import { cn } from '@/lib/utils';
import { Send, Loader2, BotMessageSquare, User, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUser, useFirebase, useDoc, useMemoFirebase, addDocumentNonBlocking, useCollection } from '@/firebase';
import { collection, addDoc, serverTimestamp, updateDoc, doc, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';
import { MealPlanCard } from './meal-plan-card';
import type { MealPlan, AIPersonality, Meal, FridgeItem, Cooking, UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format, startOfDay, endOfDay } from 'date-fns';

type Message = {
  role: 'user' | 'ai';
  text: string;
};

interface ConversationDoc {
    messages: Message[];
    title: string;
}

interface ChatInterfaceProps {
    conversationId: string | null;
    setConversationId: (id: string | null) => void;
}

const parseMealPlan = (text: string): { intro: string, plan: MealPlan | null } => {
    const regex = /```json-meal-plan\s*([\s\S]*?)\s*```/;
    const match = text.match(regex);

    if (!match || !match[1]) {
        return { intro: text, plan: null };
    }

    try {
        const plan = JSON.parse(match[1]);
        const intro = text.replace(regex, '').trim();
        return { intro, plan };
    } catch (e) {
        console.error("Failed to parse meal plan JSON:", e);
        return { intro: text, plan: null };
    }
};


export function ChatInterface({ conversationId, setConversationId }: ChatInterfaceProps) {
  const { user } = useUser();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: "Bonjour ! Je suis votre coach nutritionnel personnel. Comment puis-je vous aider aujourd'hui ?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState<Record<number, boolean>>({});
  
  // --- Data Fetching for AI Context ---
  const conversationRef = useMemoFirebase(() => {
    if (!user || !conversationId) return null;
    return doc(firestore, 'users', user.uid, 'conversations', conversationId);
  }, [user, conversationId, firestore]);
  
  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [user, firestore]);

  const mealHistoryQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/foodLogs`), orderBy('date', 'desc'), limit(15));
  }, [user, firestore]);

  const fridgeQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/fridge`), orderBy('createdAt', 'desc'));
  }, [user, firestore]);

  const plannedMealsQuery = useMemoFirebase(() => {
      if (!user) return null;
      return query(collection(firestore, `users/${user.uid}/cooking`), where('plannedFor', '>=', Timestamp.now()), limit(10));
  }, [user, firestore]);

  const todaysMealsQuery = useMemoFirebase(() => {
      if (!user) return null;
      const start = startOfDay(new Date());
      const end = endOfDay(new Date());
      return query(
        collection(firestore, 'users', user.uid, 'foodLogs'),
        where('date', '>=', Timestamp.fromDate(start)),
        where('date', '<=', Timestamp.fromDate(end))
      );
  }, [user, firestore]);

  const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userProfileRef);
  const { data: conversationData, isLoading: isLoadingConversation } = useDoc<ConversationDoc>(conversationRef);
  const { data: mealHistoryData, isLoading: isLoadingHistory } = useCollection<Meal>(mealHistoryQuery);
  const { data: fridgeItems, isLoading: isLoadingFridge } = useCollection<FridgeItem>(fridgeQuery);
  const { data: plannedMeals, isLoading: isLoadingPlannedMeals } = useCollection<Cooking>(plannedMealsQuery);
  const { data: todaysMeals, isLoading: isLoadingTodaysMeals } = useCollection<Meal & { cookedBy?: string }>(todaysMealsQuery);
  
  const mealHistory = useMemo(() => mealHistoryData?.map(meal => meal.name) || [], [mealHistoryData]);
  const fridgeContents = useMemo(() => fridgeItems?.map(item => item.name) || [], [fridgeItems]);
  const householdMembers = useMemo(() => userProfile?.household || [], [userProfile]);

  const todaysCooks = useMemo(() => {
    if (!todaysMeals) return {};
    return todaysMeals.reduce((acc, meal) => {
        if (meal.cookedBy) {
            acc[meal.type] = meal.cookedBy;
        }
        return acc;
    }, {} as Record<string, string>);
  }, [todaysMeals]);

  useEffect(() => {
    if (conversationData) {
        setMessages(conversationData.messages);
    } else if (!conversationId) {
        // Reset to initial state for a new conversation
        setMessages([{ role: 'ai', text: `Bonjour ${user?.displayName || ''} ! Je suis votre coach nutritionnel personnel. Comment puis-je vous aider aujourd'hui ?` }]);
    }
     setFeedbackSent({}); // Reset feedback status on conversation change
  }, [conversationData, conversationId, user]);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
        viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSaveConversation = async (newMessages: Message[]) => {
      if (!user || !firestore) return;

      if (!conversationId) {
          // Create a new conversation document
          const convCollection = collection(firestore, 'users', user.uid, 'conversations');
          const docRef = await addDoc(convCollection, {
              userId: user.uid,
              createdAt: serverTimestamp(),
              messages: newMessages,
              title: "Nouvelle conversation..." // Placeholder title
          });
          setConversationId(docRef.id);
          return docRef.id;
      } else {
          // Update the existing conversation
          const convRef = doc(firestore, 'users', user.uid, 'conversations', conversationId);
          await updateDoc(convRef, { messages: newMessages });
          return conversationId;
      }
  };

  const handleGenerateTitle = async (convId: string, finalMessages: Message[]) => {
    if (!user || !firestore || finalMessages.length < 2) return;

    const { title } = await generateTitleAction({ messages: finalMessages.slice(0, 4) });
    if (title) {
        const convRef = doc(firestore, 'users', user.uid, 'conversations', convId);
        await updateDoc(convRef, { title });
    }
  };

  const handleFeedback = (messageIndex: number, rating: 1 | -1) => {
    if (!user) return;
    const message = messages[messageIndex];
    if (!message || message.role !== 'ai' || feedbackSent[messageIndex]) return;

    const feedbackCollection = collection(firestore, 'feedbacks');
    addDocumentNonBlocking(feedbackCollection, {
        userId: user.uid,
        userName: user.displayName,
        rating,
        comment: message.text,
        page: 'My Flex AI',
        status: 'new',
        createdAt: serverTimestamp(),
    });
    
    setFeedbackSent(prev => ({ ...prev, [messageIndex]: true }));
    toast({ title: "Merci !", description: "Votre retour a bien été pris en compte."});
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { 
        role: 'user', 
        text: inputValue,
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
        let personality: AIPersonality | undefined = undefined;
        if (userProfile?.isAITrainingEnabled) {
            personality = {
                tone: userProfile.tone,
                mainObjective: userProfile.mainObjective, // Using mainObjective now
                allergies: userProfile.allergies,
                preferences: userProfile.preferences,
            };
        }
        
        const response = await chatAction({ 
            message: currentInput,
            userName: userProfile?.name || user?.displayName || undefined,
            personality: personality,
            mealHistory: mealHistory,
            fridgeContents: fridgeContents,
            userLevel: userProfile?.level,
            plannedMeals: plannedMeals?.map(m => ({ name: m.name, date: format(m.plannedFor.toDate(), 'yyyy-MM-dd') })),
            householdMembers: householdMembers,
            todaysCooks: todaysCooks,
        });
        const aiResponse: Message = { role: 'ai', text: response };
        const finalMessages = [...newMessages, aiResponse];
        setMessages(finalMessages);

        const savedConvId = await handleSaveConversation(finalMessages);
        
        if (savedConvId && !conversationId && finalMessages.length > 2) {
             handleGenerateTitle(savedConvId, finalMessages);
        }

    } catch (error) {
        console.error(error);
        const aiErrorMessage: Message = {
            role: 'ai',
            text: "Désolé, une erreur s'est produite. Veuillez réessayer.",
        };
        setMessages(prev => [...prev, aiErrorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  const isDataLoading = isLoadingConversation || isLoadingProfile || isLoadingHistory || isLoadingFridge || isLoadingPlannedMeals || isLoadingTodaysMeals;

  return (
    <div className="flex h-full flex-col bg-background/70">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-4 md:p-6 space-y-6" ref={viewportRef}>
          {(isDataLoading && conversationId) ? (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
                {messages.map((message, index) => {
                    const { intro, plan } = message.role === 'ai' ? parseMealPlan(message.text) : { intro: message.text, plan: null };
                    const isAiMessage = message.role === 'ai';

                    return (
                        <div key={index} className="group flex items-start gap-3 w-full">
                            {isAiMessage && (
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback><BotMessageSquare className="h-5 w-5" /></AvatarFallback>
                                </Avatar>
                            )}

                            <div className={cn("flex flex-col gap-2 max-w-xl", isAiMessage ? "items-start" : "items-end ml-auto")}>
                                <div
                                    className={cn(
                                    "rounded-lg p-3 text-sm shadow-sm",
                                    !isAiMessage
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted'
                                    )}
                                >
                                    <ReactMarkdown
                                        className="prose prose-sm dark:prose-invert"
                                        components={{
                                            p: ({node, ...props}) => <p className="mb-0" {...props} />,
                                        }}
                                    >
                                        {intro}
                                    </ReactMarkdown>
                                    {plan && <MealPlanCard plan={plan} />}
                                </div>
                                {isAiMessage && !isLoading && index > 0 && (
                                    <div className={cn(
                                        "flex items-center gap-1 transition-opacity",
                                        feedbackSent[index] ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                    )}>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className={cn(
                                                "h-7 w-7 text-muted-foreground hover:bg-green-100 dark:hover:bg-green-900/50",
                                                feedbackSent[index] && "bg-green-100 dark:bg-green-900/50 text-green-600"
                                            )} 
                                            onClick={() => handleFeedback(index, 1)}
                                            disabled={feedbackSent[index]}
                                        >
                                            <ThumbsUp className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className={cn(
                                                "h-7 w-7 text-muted-foreground hover:bg-red-100 dark:hover:bg-red-900/50",
                                                 feedbackSent[index] && "text-red-600"
                                            )} 
                                            onClick={() => handleFeedback(index, -1)}
                                            disabled={feedbackSent[index]}
                                        >
                                            <ThumbsDown className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {!isAiMessage && (
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || <User className="h-5 w-5" />}</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    );
                })}
                {isLoading && (
                    <div className="flex items-start gap-3">
                        <Avatar className="h-9 w-9">
                        <AvatarFallback>
                            <BotMessageSquare className="h-5 w-5" />
                        </AvatarFallback>
                        </Avatar>
                    <div className="max-w-xl rounded-lg p-3 text-sm bg-muted flex items-center shadow-sm">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                    </div>
                )}
            </>
          )}
        </div>
      </ScrollArea>
      <div className="flex-shrink-0 border-t bg-background/70 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Posez une question..."
            className="flex-1"
            disabled={isLoading || isDataLoading}
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={!inputValue.trim() || isLoading || isDataLoading}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Envoyer</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
