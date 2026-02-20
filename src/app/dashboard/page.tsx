
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Sidebar as DashboardSidebar } from '@/components/dashboard/sidebar';
import type { Meal, AIPersonality, PendingCooking, UserProfile, DayPlanMeal } from '@/lib/types';
import { Coffee, Moon, IceCream } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar as AppSidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useUser, useFirebase, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, query, where, limit, updateDoc, Timestamp, increment, writeBatch, getDoc, setDoc } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Loader2, PartyPopper, LayoutDashboard, ChefHat, PlusCircle, Sparkles, UtensilsCrossed, X, BarChart2, Bot, Calendar, AlarmClock, Check, Shuffle, Award, Flame, Target, TrendingUp, Search, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLoading } from '@/contexts/loading-context';
import { startOfDay, endOfDay } from 'date-fns';
import { AppHeader } from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AddMealWindow } from '@/components/dashboard/add-meal-window';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SuggestionsDialog } from '@/components/dashboard/suggestions-dialog';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { estimateCaloriesAction, suggestDayPlanAction } from '../actions';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const XP_PER_LEVEL = 500;

const getContextualInfo = (hour: number): { message: string, image: string } => {
  if (hour >= 5 && hour < 10) return { message: "Préparez un bon petit-déjeuner pour bien démarrer !", image: "/matin.png" };
  if (hour >= 10 && hour < 12) return { message: "Bientôt l'heure du déjeuner !", image: "/midi.png" };
  if (hour >= 12 && hour < 14) return { message: 'Bon appétit ! Profitez de votre pause déjeuner.', image: "/midi.png" };
  if (hour >= 14 && hour < 16) return { message: "L'après-midi commence, restez concentré.", image: "/colation.png" };
  if (hour >= 16 && hour < 18) return { message: "C'est l'heure du goûter ! Un fruit pour recharger les batteries ?", image: "/colation.png" };
  if (hour >= 18 && hour < 20) return { message: 'Que diriez-vous de commencer à préparer un bon dîner ?', image: "/soir.png" };
  if (hour >= 20 && hour < 22) return { message: 'Passez une bonne soirée. Un repas léger est idéal.', image: "/soir.png" };
  return { message: 'Planifiez vos repas, mangez sainement, et profitez !', image: "/soir.png" };
};


export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const { hideLoading } = useLoading();
  const router = useRouter();

  const [isFormOpen, setFormOpen] = useState(false);
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [suggestionMeal, setSuggestionMeal] = useState<Omit<Meal, 'date' | 'id'> | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [dayPlan, setDayPlan] = useState<DayPlanMeal[]>([]);
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  const [isAcceptingPlan, setIsAcceptingPlan] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string, name: string } | null>(null);


  // --- Meals Data ---
  // This query specifically fetches meals for the current day for the main panel
  const todaysMealsQuery = useMemoFirebase(() => {
    if (!user) return null;
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    return query(
      collection(firestore, 'users', user.uid, 'foodLogs'),
      where('date', '>=', Timestamp.fromDate(todayStart)),
      where('date', '<=', Timestamp.fromDate(todayEnd))
    );
  }, [user, firestore]);
  const { data: todaysMeals, isLoading: isLoadingTodaysMeals } = useCollection<Meal>(todaysMealsQuery);

  // This query fetches all meals, which is needed for the sidebar context (AI tips)
  const allMealsCollectionRef = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'foodLogs') : null),
    [user, firestore]
  );
  const { data: allMeals, isLoading: isLoadingAllMeals } = useCollection<Omit<Meal, 'id'>>(allMealsCollectionRef);


  // --- Goals & Personality Data for AI ---
  const goalsCollectionRef = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'goals') : null),
    [user, firestore]
  );
  const singleGoalQuery = useMemoFirebase(
    () => goalsCollectionRef ? query(goalsCollectionRef, limit(1)) : null,
    [goalsCollectionRef]
  )
  const { data: goalsData, isLoading: isLoadingGoals } = useCollection<{ description: string }>(singleGoalQuery);

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userProfileRef);

  const [goals, setGoals] = useState('Perdre du poids, manger plus sainement et réduire ma consommation de sucre.');
  const [goalId, setGoalId] = useState<string | null>(null);

  const fetchDayPlan = useCallback(async () => {
    if (!userProfile) return;
    setIsLoadingPlan(true);
    try {
      let personality: AIPersonality | undefined;
      if (userProfile.isAITrainingEnabled) {
        personality = {
          tone: userProfile.tone,
          mainObjective: userProfile.mainObjective,
          allergies: userProfile.allergies,
          preferences: userProfile.preferences,
        };
      }
      const { plan, error } = await suggestDayPlanAction({
        dietaryGoals: goals,
        personality,
        householdMembers: userProfile.household || [],
      });
      if (error) throw new Error(error);
      setDayPlan(plan || []);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur de planification', description: 'Impossible de générer un plan.' });
    } finally {
      setIsLoadingPlan(false);
    }
  }, [userProfile, goals, toast]);

  useEffect(() => {
    if (userProfile) {
      fetchDayPlan();
    }
  }, [userProfile, fetchDayPlan]);


  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const { message: contextualMessage, image: contextualImage } = getContextualInfo(currentTime.getHours());

  const mealTypes: Meal['type'][] = ['breakfast', 'lunch', 'dinner', 'dessert'];

  const mealTypeDetails: Record<Meal['type'], { translation: string; className: string; icon: any; glow: string }> = {
    breakfast: { translation: 'Petit-déjeuner', className: "border-blue-500/20 bg-blue-500/5", icon: Coffee, glow: "shadow-blue-500/20" },
    lunch: { translation: 'Déjeuner', className: "border-yellow-500/20 bg-yellow-500/5", icon: UtensilsCrossed, glow: "shadow-yellow-500/20" },
    dinner: { translation: 'Dîner', className: "border-purple-500/20 bg-purple-500/5", icon: Moon, glow: "shadow-purple-500/20" },
    dessert: { translation: 'Dessert', className: "border-green-500/20 bg-green-500/5", icon: IceCream, glow: "shadow-green-500/20" },
  };

  const mealTypeTranslations: Record<DayPlanMeal['type'], string> = {
    breakfast: 'Petit-déjeuner',
    lunch: 'Déjeuner',
    dinner: 'Dîner',
  };

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
      // Using updateDoc directly as it's a simple, non-blocking operation on user interaction
      updateDoc(goalRef, { description: newDescription }).catch(console.error);
    }
  }

  const addMeal = async (meal: { name: string; type: Meal['type'], cookedBy?: string, calories?: number }) => {
    if (!user || !userProfileRef) return;
    setIsAddingMeal(true);

    try {
      let calories = meal.calories;
      let xpGained = 0; // Default XP if not estimated

      if (!calories) {
        const estimation = await estimateCaloriesAction({
          mealName: meal.name,
          userObjective: userProfile?.mainObjective || 'Manger équilibré'
        });

        if (estimation.error || estimation.xpGained === null || estimation.calories === null) {
          throw new Error(estimation.error || 'Failed to analyze meal.');
        }
        calories = estimation.calories;
        xpGained = estimation.xpGained;
      } else {
        // rough XP estimation if calories provided (optional, or just give 50)
        xpGained = 50;
      }

      const fullMealData = {
        name: meal.name,
        type: meal.type,
        cookedBy: meal.cookedBy || '',
        calories,
        userId: user.uid,
        date: Timestamp.now()
      };

      const mealsCollectionRef = collection(firestore, 'users', user.uid, 'foodLogs');
      addDocumentNonBlocking(mealsCollectionRef, fullMealData);

      // Use a transaction or a server-side function for atomicity if critical
      // For client-side, we read then write
      const userDoc = await getDoc(userProfileRef);
      const currentXp = userDoc.data()?.xp ?? 0;
      const newXp = currentXp + xpGained;
      const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;

      await updateDoc(userProfileRef, {
        xp: increment(xpGained),
        level: newLevel
      });

      toast({ title: 'Repas ajouté !', description: `${meal.name} (${calories} kcal) a été enregistré. ${xpGained > 0 ? `+${xpGained} XP !` : `${xpGained} XP.`}` });
      setFormOpen(false);

    } catch (e) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible d\'ajouter le repas.' });
    } finally {
      setIsAddingMeal(false);
    }
  };

  const handleAddToPending = (meal: Omit<Meal, 'id' | 'date'>) => {
    if (!user) return;
    const pendingCookingCollectionRef = collection(firestore, 'users', user.uid, 'pendingCookings');
    addDocumentNonBlocking(pendingCookingCollectionRef, {
      userId: user.uid,
      name: meal.name,
      createdAt: Timestamp.now(),
      imageHint: meal.name,
    });
    toast({
      title: 'Repas ajouté au chariot',
      description: `${meal.name} est prêt à être cuisiné depuis la page Cuisine.`,
    });
  }

  const removeMeal = (mealId: string) => {
    if (!user) return;
    const mealRef = doc(firestore, 'users', user.uid, 'foodLogs', mealId);
    deleteDocumentNonBlocking(mealRef);
  };

  const handleAcceptPlan = async () => {
    if (!user || dayPlan.length === 0) return;
    setIsAcceptingPlan(true);

    try {
      const batch = writeBatch(firestore);
      const mealsCollectionRef = collection(firestore, 'users', user.uid, 'foodLogs');
      const today = Timestamp.now();

      dayPlan.forEach(meal => {
        const newMealRef = doc(mealsCollectionRef);
        batch.set(newMealRef, {
          userId: user.uid,
          name: meal.name,
          calories: meal.calories,
          type: meal.type,
          cookedBy: meal.cookedBy || '',
          date: today,
        });
      });

      await batch.commit();
      toast({ title: 'Planning accepté !', description: "Les repas d'aujourd'hui ont été ajoutés à votre journal." });
      // The real-time listener will update the UI automatically
    } catch (error) {
      console.error("Failed to accept plan:", error);
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible d'enregistrer le planning." });
    } finally {
      setIsAcceptingPlan(false);
    }
  };


  // Use todaysMeals for the dashboard cards
  const displayMeals = useMemo(() => (todaysMeals ?? []).map(m => ({ ...m, id: m.id } as Meal)), [todaysMeals]);

  const cooksForToday = useMemo(() => {
    const cooks: Partial<Record<Meal['type'], string>> = {};
    displayMeals.forEach(meal => {
      if (meal.type && meal.cookedBy && !cooks[meal.type]) {
        cooks[meal.type] = meal.cookedBy;
      }
    });
    return cooks;
  }, [displayMeals]);


  const isLoading = isUserLoading || isLoadingTodaysMeals || isLoadingGoals || isLoadingAllMeals || !user || isLoadingProfile;

  useEffect(() => {
    if (!isLoading) {
      hideLoading();
    }
  }, [isLoading, hideLoading]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Pass allMeals to the sidebar for context
  const sidebarProps = {
    goals: goals,
    setGoals: updateGoals,
    meals: allMeals ?? []
  };

  const personality: AIPersonality | undefined = userProfile?.isAITrainingEnabled
    ? {
      tone: userProfile.tone,
      mainObjective: userProfile.mainObjective,
      allergies: userProfile.allergies,
      preferences: userProfile.preferences,
    }
    : undefined;

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/20">
      <SidebarProvider defaultOpen={true}>
        <AppSidebar collapsible="icon" className="group peer hidden md:block text-sidebar-foreground border-r border-border">
          <DashboardSidebar {...sidebarProps} />
        </AppSidebar>
        <SidebarInset className="bg-background">
          <div className="flex flex-col h-full relative">
            <AppHeader
              title="Tableau de bord"
              icon={<LayoutDashboard className="h-4 w-4" />}
              user={user}
              sidebarProps={sidebarProps}
            />

            <main className="flex-1 max-w-4xl mx-auto px-3 sm:px-4 py-4 md:py-8 space-y-4 md:space-y-8">
              {/* Header section - Clean & Welcoming */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl md:text-3xl select-none">🏠</div>
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight text-foreground truncate">Tableau de bord</h1>
                  </div>
                  <p className="text-muted-foreground text-xs md:text-sm font-medium leading-relaxed max-w-[450px]">
                    Bienvenue, <span className="text-foreground font-bold">{userProfile?.name?.split(' ')[0] || 'Chef'}</span>. Voici un aperçu de votre journée culinaire.
                  </p>
                </div>

                <div className="grid grid-cols-2 md:flex items-center gap-2 w-full md:w-auto">
                  <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
                    <DialogTrigger asChild>
                      <Button className="h-9 md:h-10 w-full md:w-auto px-3 md:px-5 text-[10px] md:text-xs font-black rounded-lg border border-primary/20 shadow-md shadow-primary/10 hover:scale-105 active:scale-95 transition-all">
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Ajouter un repas
                      </Button>
                    </DialogTrigger>
                    <AddMealWindow
                      isOpen={isFormOpen}
                      onClose={() => setFormOpen(false)}
                      onSubmit={addMeal}
                      household={userProfile?.household || []}
                      userId={user?.uid}
                    />
                  </Dialog>
                  <Button variant="outline" className="h-9 md:h-10 w-full md:w-auto px-3 md:px-5 text-[10px] md:text-xs font-black rounded-lg border border-border hover:bg-accent transition-all shadow-sm" asChild>
                    <Link href="/cuisine">
                      <ChefHat className="mr-1.5 h-3.5 w-3.5 md:h-4 md:w-4" />
                      Cuisiner
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Tips Carousel - Sleek & Modern */}
              <div className="w-full">
                <Carousel
                  opts={{
                    align: "start",
                    loop: true,
                  }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-2 md:-ml-4">
                    {[
                      { image: "/matin.png", title: "Start Strong", subtitle: "Petit-déjeuner" },
                      { image: "/midi.png", title: "Power Up", subtitle: "Déjeuner" },
                      { image: "/colation.png", title: "Snack Smart", subtitle: "Goûter" },
                      { image: "/soir.png", title: "Wind Down", subtitle: "Dîner" },
                      { image: "/plat-vide.png", title: "Create", subtitle: "Nouveau plat" },
                    ].map((slide, index) => (
                      <CarouselItem key={index} className="pl-2 md:pl-4 basis-[45%] md:basis-1/3 lg:basis-1/4">
                        <div className="group relative aspect-[21/9] md:aspect-[3/1] lg:aspect-[21/9] w-full overflow-hidden rounded-xl border border-border shadow-sm cursor-pointer">
                          <Image
                            src={slide.image}
                            alt={slide.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 768px) 45vw, (max-width: 1200px) 33vw, 25vw"
                            priority={index === 0}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity group-hover:opacity-90" />
                          <div className="absolute bottom-0 left-0 p-2 md:p-3">
                            <p className="text-[8px] md:text-[10px] uppercase tracking-widest text-white/70 font-bold">{slide.subtitle}</p>
                            <p className="text-xs md:text-sm font-black text-white">{slide.title}</p>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="hidden md:flex -left-2 h-8 w-8" />
                  <CarouselNext className="hidden md:flex -right-2 h-8 w-8" />
                </Carousel>
              </div>

              {/* Stats Section - Clean & Structured */}
              <div className="border border-border rounded-xl p-3 md:p-5 bg-card shadow-sm">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-4">
                  {[
                    { label: 'CALORIES', value: displayMeals.reduce((acc, m) => acc + (m.calories || 0), 0), unit: 'kcal', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10', progress: (displayMeals.reduce((acc, m) => acc + (m.calories || 0), 0) / 2000) * 100 },
                    { label: 'REPAS', value: displayMeals.length, unit: '/ 4', icon: UtensilsCrossed, color: 'text-blue-500', bg: 'bg-blue-500/10', progress: (displayMeals.length / 4) * 100 },
                    { label: 'OBJECTIF', value: '2000', unit: 'kcal', icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'NIVEAU', value: userProfile?.level || 1, unit: 'Master', icon: Award, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                  ].map((stat, i) => (
                    <div key={i} className="group relative bg-background border border-border rounded-lg p-2.5 md:p-4 hover:border-primary/30 hover:shadow-md transition-all duration-300">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className={cn("p-1.5 rounded-md", stat.bg)}>
                            <stat.icon className={cn("h-3 w-3 md:h-3.5 md:w-3.5", stat.color)} />
                          </div>
                          <span className="text-[7px] md:text-[9px] font-black tracking-widest text-muted-foreground uppercase">{stat.label}</span>
                        </div>
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg md:text-xl font-black tracking-tight">{stat.value}</span>
                            <span className="text-[8px] md:text-[9px] text-muted-foreground font-bold uppercase">{stat.unit}</span>
                          </div>
                          {stat.progress !== undefined && (
                            <div className="mt-2 h-1 md:h-1.5 w-full bg-muted/30 rounded-full overflow-hidden border border-border/50">
                              <div
                                className={cn("h-full transition-all duration-1000 ease-out rounded-full", stat.color.replace('text', 'bg'))}
                                style={{ width: `${Math.min(stat.progress, 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-8 items-start">
                {/* Left Column: Journal du Jour (2/3) */}
                <div className="lg:col-span-7 border border-border rounded-xl p-3 md:p-5 bg-card shadow-sm space-y-4 md:space-y-6">
                  <div className="flex items-center justify-between border-b border-border pb-2 md:pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-primary/10 rounded-lg">
                        <Calendar className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary" />
                      </div>
                      <h2 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground">Journal Alimentaire</h2>
                    </div>
                    <Badge variant="outline" className="rounded-full font-bold bg-background border border-border px-2.5 py-0.5 text-[9px] md:text-[10px]">
                      {currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </Badge>
                  </div>

                  <div className="grid gap-3 md:gap-4">
                    {mealTypes.map(type => {
                      const details = mealTypeDetails[type];
                      const mealsForType = displayMeals.filter(m => m.type === type);

                      return (
                        <div key={type} className="group/meal flex flex-col gap-3">
                          <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                              <details.icon className={cn("h-4 w-4", details.className.split(' ')[0].replace('border-', 'text-'))} />
                              <h3 className="text-lg font-black tracking-tight">{details.translation}</h3>
                            </div>
                            <button
                              onClick={() => setFormOpen(true)}
                              className="h-8 w-8 flex items-center justify-center rounded-xl bg-muted/30 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all opacity-0 group-hover/meal:opacity-100 border border-muted/40"
                            >
                              <PlusCircle className="h-5 w-5" />
                            </button>
                          </div>

                          <div className={cn(
                            "relative rounded-2xl p-4 transition-all border-2",
                            mealsForType.length > 0 ? "bg-background border-muted/60 shadow-sm" : "bg-muted/10 border-dashed border-muted/40"
                          )}>
                            {mealsForType.length > 0 ? (
                              <div className="space-y-3">
                                {mealsForType.map(meal => (
                                  <div
                                    key={meal.id}
                                    className="group/item flex items-center justify-between p-2 md:p-2.5 rounded-xl hover:bg-accent/5 transition-all cursor-pointer border border-transparent hover:border-border/50"
                                    onClick={() => setSuggestionMeal(meal)}
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className={cn("h-8 w-8 md:h-9 md:w-9 rounded-lg flex items-center justify-center shrink-0 border shadow-sm", details.className)}>
                                        <details.icon className="h-4 w-4 opacity-40" />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-xs md:text-sm font-bold truncate text-foreground/90">{meal.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                          <span className="text-[9px] font-black text-muted-foreground/60 uppercase">{meal.calories} kcal</span>
                                          {meal.cookedBy && (
                                            <span className="flex items-center gap-1 text-[9px] font-bold text-primary/60 bg-primary/5 px-2 py-0.5 rounded-full">
                                              <ChefHat className="h-2 w-2" />
                                              Chef: {meal.cookedBy}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <button
                                      className="h-8 w-8 flex items-center justify-center rounded-full text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover/item:opacity-100 border border-transparent hover:border-destructive/20"
                                      onClick={(e) => { e.stopPropagation(); removeMeal(meal.id); }}
                                    >
                                      <X className="h-4 w-4 stroke-[3px]" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="py-8 flex flex-col items-center justify-center gap-2 opacity-30 select-none">
                                <details.icon className="h-8 w-8" />
                                <span className="text-[10px] font-black uppercase tracking-widest italic">Aucun enregistrement</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column: AI & Recommendations (1/3) */}
                <div className="lg:col-span-5 border border-border rounded-xl p-3 md:p-5 bg-card shadow-sm space-y-4 md:space-y-6 lg:sticky lg:top-24">
                  <div className="flex items-center gap-2 border-b border-border pb-2 md:pb-3">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                      <Sparkles className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary" />
                    </div>
                    <h2 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground">Assistant IA</h2>
                  </div>

                  <div className="bg-gradient-to-br from-primary/5 via-background to-background rounded-xl p-4 md:p-5 sm:p-6 space-y-4 md:space-y-6 border border-primary/20 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />

                    <div className="relative z-10 space-y-4 md:space-y-5">
                      <div className="flex flex-col items-center text-center gap-4">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                          <div className="absolute inset-0 bg-white rounded-2xl shadow-md border border-primary/10 transform -rotate-3" />
                          <div className="relative w-full h-full p-1.5 bg-white rounded-2xl shadow-sm border border-primary/5 overflow-hidden transform rotate-3 transition-transform duration-700 group-hover:rotate-0">
                            <Image
                              src="/plat-vide.png"
                              alt="Vide"
                              fill
                              className={cn("object-cover transition-opacity duration-700 ease-in-out", dayPlan.length > 0 ? "opacity-0" : "opacity-100")}
                              sizes="100px"
                              priority
                            />
                            <Image
                              src="/repas-plein.png"
                              alt="Plein"
                              fill
                              className={cn("object-cover transition-opacity duration-700 ease-in-out", dayPlan.length > 0 ? "opacity-100" : "opacity-0")}
                              sizes="100px"
                            />
                          </div>
                        </div>
                        <p className="text-xs font-medium text-muted-foreground leading-relaxed italic px-2 max-w-[240px]">
                          "{contextualMessage}"
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Planning suggéré</span>
                          <Badge variant="secondary" className="text-[7px] font-black uppercase tracking-tighter bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20">Alpha v2</Badge>
                        </div>

                        {isLoadingPlan ? (
                          <div className="flex flex-col items-center justify-center py-8 gap-2 bg-muted/5 rounded-xl border border-dashed border-muted-foreground/30">
                            <Loader2 className="h-5 w-5 animate-spin text-primary opacity-40" />
                            <span className="text-[8px] font-black tracking-[0.2em] uppercase text-muted-foreground opacity-40">Analyse en cours...</span>
                          </div>
                        ) : dayPlan.length > 0 ? (
                          <div className="space-y-2">
                            {dayPlan.map((meal) => (
                              <div key={meal.name} className="flex items-center gap-3 p-2 rounded-xl bg-background border border-border hover:border-primary/30 transition-all group/plan shadow-sm">
                                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted border border-border">
                                  {meal.imageUrl ? (
                                    <Image
                                      src={meal.imageUrl}
                                      alt={meal.name}
                                      fill
                                      sizes="40px"
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center opacity-10">
                                      <UtensilsCrossed className="h-4 w-4" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-[11px] truncate text-foreground/90">{meal.name}</p>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[7px] font-black text-primary/60 uppercase bg-primary/5 px-1 py-0.5 rounded-md">{mealTypeTranslations[meal.type]}</span>
                                    <span className="text-[8px] text-muted-foreground/60 font-bold">{meal.calories} kcal</span>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-lg bg-muted/30 text-muted-foreground hover:bg-primary hover:text-white transition-all border border-muted/40"
                                  onClick={() => handleAddToPending(meal)}
                                >
                                  <PlusCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <Button onClick={fetchDayPlan} className="w-full h-11 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all border-2 border-primary/30 hover:border-primary/50">
                              <Sparkles className="mr-2 h-3.5 w-3.5" />
                              Générer un plan
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Quick Insights Card */}
                      <div className="pt-3 mt-3 border-t-2 border-primary/5">
                        <Link href="/my-flex-ai" className="flex items-center justify-between p-3 rounded-xl bg-background border-2 border-muted/60 hover:border-primary/20 transition-all group/insight">
                          <div className="space-y-0.5">
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Chat Intelligent</p>
                            <p className="text-xs font-bold">Posez vos questions sur la nutrition</p>
                          </div>
                          <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center group-hover/insight:bg-primary group-hover/insight:text-white transition-all">
                            <ArrowRight className="h-5 w-5" />
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>

            {/* Mobile Navigation Bar - Native App Style */}
            <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
              <div className="flex items-center justify-between px-6 pb-5 pt-2">
                <Button
                  variant="ghost"
                  className="flex flex-col items-center gap-1 h-auto py-1.5 px-2 text-muted-foreground hover:text-foreground hover:bg-transparent active:scale-95 transition-all"
                  onClick={() => router.push('/calendar')}
                >
                  <Calendar className="h-5 w-5" />
                  <span className="text-[9px] font-bold tracking-wide">Agenda</span>
                </Button>

                <div className="relative -top-6 mx-3 filter drop-shadow-lg flex-1">
                  <Button
                    onClick={() => fetchDayPlan()}
                    className="h-16 w-full rounded-3xl bg-primary shadow-xl border-4 border-background flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all group"
                  >
                    <Sparkles className="h-6 w-6 text-primary-foreground group-hover:rotate-12 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest text-primary-foreground/90">Magie</span>
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  className="flex flex-col items-center gap-1 h-auto py-1.5 px-2 text-muted-foreground hover:text-foreground hover:bg-transparent active:scale-95 transition-all"
                  onClick={() => router.push('/my-flex-ai')}
                >
                  <Bot className="h-5 w-5" />
                  <span className="text-[9px] font-bold tracking-wide">Assistant</span>
                </Button>
              </div>
            </div>

            {suggestionMeal && (
              <SuggestionsDialog
                meal={suggestionMeal}
                goals={goals}
                open={!!suggestionMeal}
                onOpenChange={() => setSuggestionMeal(null)}
              />
            )}
          </div>
        </SidebarInset >
      </SidebarProvider >
    </div >
  );
}
