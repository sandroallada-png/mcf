
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    SidebarProvider,
    Sidebar as AppSidebar,
    SidebarInset,
} from '@/components/ui/sidebar';
import { Sidebar } from '@/components/dashboard/sidebar';
import { useUser, useFirebase, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, query, limit, updateDoc, Timestamp, where, orderBy } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Meal, SuggestedMeal, AIPersonality, UserProfile } from '@/lib/types';
import { Loader2, Bot, PlusCircle, Sparkles, Utensils, Calendar as CalendarIcon, Clock, X, History, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { getMealPlanAction } from '../actions';
import { format, startOfDay, endOfDay, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AppHeader } from '@/components/layout/app-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export default function CalendarPage() {
    const { user, isUserLoading } = useUser();
    const { firestore } = useFirebase();
    const { toast } = useToast();

    const [date, setDate] = useState<Date | undefined>(new Date());
    const [suggestedMeals, setSuggestedMeals] = useState<SuggestedMeal[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
    const [selectedMealForPlanning, setSelectedMealForPlanning] = useState<SuggestedMeal | null>(null);
    const [planningDate, setPlanningDate] = useState<Date | undefined>(new Date());
    const [planningType, setPlanningType] = useState<Meal['type']>('lunch');
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    // --- Data fetching for the selected day's meals ---
    const dailyMealsQuery = useMemoFirebase(() => {
        if (!user || !date) return null;
        const start = startOfDay(date);
        const end = endOfDay(date);
        return query(
            collection(firestore, 'users', user.uid, 'foodLogs'),
            where('date', '>=', Timestamp.fromDate(start)),
            where('date', '<=', Timestamp.fromDate(end))
        );
    }, [user, firestore, date]);
    const { data: dailyMeals, isLoading: isLoadingDailyMeals } = useCollection<Meal>(dailyMealsQuery);


    // --- Data fetching for goals & personality (for AI context) ---
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
    const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

    const [goals, setGoals] = useState('Perdre du poids, manger plus sainement et réduire ma consommation de sucre.');
    const [goalId, setGoalId] = useState<string | null>(null);

    // --- Data fetching for sidebar and history ---
    const allMealsCollectionRef = useMemoFirebase(
        () => (user ? collection(firestore, 'users', user.uid, 'foodLogs') : null),
        [user, firestore]
    );
    const allMealsQuery = useMemoFirebase(
        () => allMealsCollectionRef ? query(allMealsCollectionRef, orderBy('date', 'desc')) : null,
        [allMealsCollectionRef]
    );
    const { data: allMeals, isLoading: isLoadingAllMeals } = useCollection<Meal>(allMealsQuery);

    const mealTypeTranslations: Record<Meal['type'], string> = {
        breakfast: 'Petit-déjeuner',
        lunch: 'Déjeuner',
        dinner: 'Dîner',
        dessert: 'Dessert',
    };

    const groupedMeals = useMemo(() => {
        if (!allMeals) return {};
        return allMeals.reduce((acc, meal) => {
            const dateStr = format(meal.date.toDate(), 'yyyy-MM-dd');
            if (!acc[dateStr]) {
                acc[dateStr] = [];
            }
            acc[dateStr].push(meal);
            return acc;
        }, {} as Record<string, Meal[]>);
    }, [allMeals]);


    useEffect(() => {
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
    }, [goalsData, user, isLoadingGoals, firestore]);

    const updateGoals = (newDescription: string) => {
        setGoals(newDescription);
        if (goalId && user) {
            const goalRef = doc(firestore, 'users', user.uid, 'goals', goalId);
            updateDoc(goalRef, { description: newDescription }).catch(console.error);
        }
    }

    const fetchSuggestions = async () => {
        if (!user) return;
        setIsLoadingSuggestions(true);
        setSuggestedMeals([]);
        try {
            let personality: AIPersonality | undefined = undefined;
            if (userProfile?.isAITrainingEnabled) {
                personality = {
                    tone: userProfile.tone,
                    mainObjective: userProfile.mainObjective,
                    allergies: userProfile.allergies,
                    preferences: userProfile.preferences,
                };
            }

            const { mealPlan, error } = await getMealPlanAction({
                dietaryGoals: goals,
                personality: personality
            });

            if (error) {
                throw new Error(error);
            }
            setSuggestedMeals(mealPlan || []);
        } catch (e) {
            toast({
                variant: "destructive",
                title: "Erreur de suggestion",
                description: "Impossible de générer des suggestions pour le moment.",
            });
        } finally {
            setIsLoadingSuggestions(false);
        }
    };

    useEffect(() => {
        if (!isLoadingGoals && !isLoadingAllMeals && user) {
            fetchSuggestions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [goals, userProfile, isLoadingGoals, isLoadingAllMeals, user]);

    const handleAddMealFromSuggestion = () => {
        if (!user || !selectedMealForPlanning || !planningDate) return;

        const mealData = {
            userId: user.uid,
            name: selectedMealForPlanning.name,
            calories: selectedMealForPlanning.calories,
            type: planningType,
            date: Timestamp.fromDate(startOfDay(planningDate))
        };
        addDocumentNonBlocking(collection(firestore, 'users', user.uid, 'foodLogs'), mealData);
        toast({
            title: "Repas ajouté !",
            description: `${selectedMealForPlanning.name} a été ajouté à votre planning du ${format(planningDate, 'dd/MM/yyyy', { locale: fr })}.`,
        });
        setIsPlanDialogOpen(false);
        setSelectedMealForPlanning(null);
    };

    const openPlanningDialog = (meal: SuggestedMeal) => {
        setSelectedMealForPlanning(meal);
        setPlanningDate(new Date());
        setPlanningType(meal.type);
        setIsPlanDialogOpen(true);
    };

    const handleRemoveMeal = (mealId: string) => {
        if (!user) return;
        deleteDocumentNonBlocking(doc(firestore, 'users', user.uid, 'foodLogs', mealId));
        toast({
            title: "Repas supprimé",
            variant: "destructive",
            description: `Le repas a été retiré de votre planning.`,
        });
    };

    const isLoading = isUserLoading || isLoadingAllMeals || isLoadingGoals || !user;

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    const sidebarProps = {
        goals,
        setGoals: updateGoals,
        meals: allMeals ?? [],
    };

    const isSelectedDateInPast = date ? isPast(endOfDay(date)) : false;

    return (
        <div className="h-screen w-full bg-background font-body">
            <SidebarProvider>
                <AppSidebar collapsible="icon" className="w-80 peer hidden md:block" variant="sidebar">
                    <Sidebar {...sidebarProps} />
                </AppSidebar>
                <SidebarInset>
                    <div className="flex h-full flex-1 flex-col">
                        <AppHeader
                            title="L'Art de Planifier"
                            icon={<CalendarIcon className="h-6 w-6" />}
                            user={user}
                            sidebarProps={sidebarProps}
                        />
                        <main className="flex-1 flex flex-col overflow-y-auto">
                            <Tabs defaultValue="planning" className="flex-1 flex flex-col pt-4 md:pt-6">
                                <div className="px-4 md:px-8 space-y-6 md:space-y-8">
                                    {/* Hero Section - Inspiration IA */}
                                    <div className="relative rounded-3xl overflow-hidden bg-primary/5 border-2 border-primary/10 p-6 md:p-10 group">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[60px] md:blur-[100px] -mr-32 -mt-32 group-hover:scale-125 transition-transform duration-1000" />

                                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
                                            <div className="text-center md:text-left space-y-3">
                                                <div className="flex items-center justify-center md:justify-start gap-2 text-primary">
                                                    <Bot className="h-5 w-5 animate-bounce" />
                                                    <span className="font-mono text-xs font-black uppercase tracking-widest">Assistant Intelligent</span>
                                                </div>
                                                <h2 className="text-2xl md:text-4xl font-black tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">
                                                    Inspiration Culinaire
                                                </h2>
                                                <p className="text-sm md:text-base text-muted-foreground font-medium max-w-xl leading-relaxed">
                                                    Voici quelques idées pour vos prochains repas, basées sur vos objectifs et vos préférences.
                                                </p>
                                            </div>

                                            <Button
                                                variant="outline"
                                                onClick={fetchSuggestions}
                                                disabled={isLoadingSuggestions}
                                                className="w-full md:w-auto h-12 md:h-14 px-8 rounded-2xl font-black border-2 bg-background/50 backdrop-blur-md hover:bg-background transition-all"
                                            >
                                                {isLoadingSuggestions ? (
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                ) : (
                                                    <Sparkles className="mr-2 h-5 w-5 text-primary" />
                                                )}
                                                Renouveler l'Inspiration
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 md:mt-10">
                                            {isLoadingSuggestions ? (
                                                Array.from({ length: 3 }).map((_, i) => (
                                                    <div key={i} className="aspect-[4/5] rounded-3xl bg-muted animate-pulse border-2 border-muted" />
                                                ))
                                            ) : suggestedMeals.length > 0 ? (
                                                suggestedMeals.map((meal, index) => (
                                                    <Card key={meal.name} className="group relative aspect-video sm:aspect-square md:aspect-[4/5] rounded-3xl border-2 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden bg-background/50 backdrop-blur-sm">
                                                        <div className="absolute inset-0 z-0">
                                                            {meal.imageUrl ? (
                                                                <Image
                                                                    src={meal.imageUrl}
                                                                    alt={meal.name}
                                                                    fill
                                                                    sizes="(max-width: 640px) 100vw, 33vw"
                                                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                                    data-ai-hint={meal.imageHint}
                                                                />
                                                            ) : (
                                                                <div className="h-full w-full bg-muted flex items-center justify-center transition-transform duration-700 group-hover:scale-110">
                                                                    <ChefHat className="h-12 w-12 text-muted-foreground opacity-20" />
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />
                                                        </div>

                                                        <CardContent className="relative z-10 h-full flex flex-col justify-end p-5 md:p-8 gap-3 md:gap-4">
                                                            <div className="space-y-1 md:space-y-2 translate-y-2 md:translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                                                                <Badge variant="secondary" className="bg-primary/20 backdrop-blur-md text-white border-white/10 text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2 py-0.5 md:px-3 md:py-1">
                                                                    {mealTypeTranslations[meal.type]}
                                                                </Badge>
                                                                <CardTitle className="text-lg md:text-2xl font-black text-white tracking-tight leading-tight">
                                                                    {meal.name}
                                                                </CardTitle>
                                                                <div className="flex items-center gap-3 md:gap-4 text-white/60 text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                                                                    <div className="flex items-center gap-1.5 md:gap-2">
                                                                        <Clock className="h-2.5 w-2.5 md:h-3 md:w-3 text-primary" />
                                                                        <span>{meal.cookingTime}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5 md:gap-2">
                                                                        <span className="text-primary/80">★</span>
                                                                        <span>{meal.calories} kcal</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="opacity-0 group-hover:opacity-100 translate-y-4 md:translate-y-8 group-hover:translate-y-0 transition-all duration-500 delay-150 hidden md:block">
                                                                <Button
                                                                    variant="secondary"
                                                                    className="w-full h-12 rounded-xl font-black bg-white/10 hover:bg-white text-white hover:text-primary backdrop-blur-md border border-white/20 shadow-xl"
                                                                    onClick={() => openPlanningDialog(meal)}
                                                                >
                                                                    <PlusCircle className="mr-2 h-4 w-4" />
                                                                    Planifier
                                                                </Button>
                                                            </div>
                                                            <div className="md:hidden mt-2">
                                                                <Button
                                                                    className="w-full h-10 rounded-xl font-black bg-primary border-none shadow-lg text-white text-xs"
                                                                    onClick={() => openPlanningDialog(meal)}
                                                                >
                                                                    Planifier
                                                                </Button>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))
                                            ) : (
                                                <div className="col-span-full py-12 text-center border-2 border-dashed border-primary/20 rounded-3xl bg-primary/5">
                                                    <p className="text-muted-foreground font-medium">Réclamez votre inspiration du jour !</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Tabs Switching */}
                                    <div className="flex justify-center">
                                        <TabsList className="h-12 md:h-14 p-1 bg-muted/50 backdrop-blur-sm rounded-2xl border border-white/5 shadow-inner">
                                            <TabsTrigger
                                                value="planning"
                                                className="px-6 md:px-10 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all"
                                            >
                                                Le Planning
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="history"
                                                className="px-6 md:px-10 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all"
                                            >
                                                L'Historique
                                            </TabsTrigger>
                                        </TabsList>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-8">
                                    <TabsContent value="planning" className="mt-6 md:mt-8 space-y-8 focus-visible:ring-0 outline-none">
                                        <div className="grid grid-cols-1 lg:grid-cols-7 gap-8 min-h-[500px]">
                                            <Card className="lg:col-span-3 rounded-3xl border-2 bg-background/50 backdrop-blur-sm overflow-hidden flex flex-col">
                                                <div className="p-6 md:p-8 border-b-2 border-primary/5">
                                                    <h3 className="text-xl font-black tracking-tighter flex items-center gap-2">
                                                        <CalendarIcon className="h-5 w-5 text-primary" />
                                                        Sélecteur Temporel
                                                    </h3>
                                                </div>
                                                <div className="flex-1 flex items-center justify-center p-4">
                                                    <Calendar
                                                        mode="single"
                                                        selected={date}
                                                        onSelect={setDate}
                                                        className="scale-110 md:scale-125"
                                                        locale={fr}
                                                    />
                                                </div>
                                            </Card>

                                            <Card className="lg:col-span-4 rounded-3xl border-2 bg-background/50 backdrop-blur-sm overflow-hidden flex flex-col border-primary/10 shadow-2xl shadow-primary/5">
                                                <div className="p-6 md:p-8 border-b-2 border-primary/5 bg-primary/[0.02]">
                                                    <h3 className="text-xl font-black tracking-tighter">
                                                        Repas du {date ? format(date, 'eeee d MMMM', { locale: fr }) : '...'}
                                                    </h3>
                                                </div>
                                                <div className="flex-1 p-6 md:p-8">
                                                    {isLoadingDailyMeals ? (
                                                        <div className="h-full flex flex-col items-center justify-center">
                                                            <Loader2 className="h-10 w-10 animate-spin text-primary opacity-40" />
                                                        </div>
                                                    ) : (dailyMeals && dailyMeals.length > 0) ? (
                                                        <div className="space-y-4">
                                                            {dailyMeals.map(meal => (
                                                                <Card key={meal.id} className="group relative rounded-2xl border-2 border-primary/5 bg-background/50 backdrop-blur-sm hover:border-primary/20 transition-all duration-300">
                                                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-[30px] -mr-12 -mt-12 group-hover:scale-150 transition-transform" />
                                                                    <CardContent className="p-5 flex justify-between items-center relative z-10">
                                                                        <div className="space-y-1">
                                                                            <div className="flex items-center gap-2">
                                                                                <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest text-primary border-primary/20">
                                                                                    {mealTypeTranslations[meal.type]}
                                                                                </Badge>
                                                                            </div>
                                                                            <p className="text-lg font-black tracking-tight">{meal.name}</p>
                                                                            <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                                                <span className="flex items-center gap-1">
                                                                                    <Utensils className="h-3 w-3 text-primary/60" />
                                                                                    {meal.calories} kcal
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-10 w-10 rounded-full text-destructive/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                                            onClick={() => handleRemoveMeal(meal.id)}
                                                                            disabled={isSelectedDateInPast}
                                                                        >
                                                                            <X className="h-5 w-5" />
                                                                        </Button>
                                                                    </CardContent>
                                                                </Card>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="h-full flex flex-col items-center justify-center py-20 bg-primary/[0.02] border-2 border-dashed border-primary/10 rounded-2xl text-center px-6">
                                                            <Utensils className="h-12 w-12 text-primary opacity-20 mb-4" />
                                                            <h4 className="text-lg font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Carte Blanche</h4>
                                                            <p className="text-sm text-muted-foreground font-medium max-w-xs">
                                                                Aucun festin n'est encore prévu pour cette journée.
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </Card>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="history" className="mt-6 md:mt-8 focus-visible:ring-0 outline-none">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                            {Object.keys(groupedMeals).length > 0 ? (
                                                Object.entries(groupedMeals).map(([dateStr, meals]) => (
                                                    <Card key={dateStr} className="rounded-3xl border-2 bg-background/50 backdrop-blur-sm overflow-hidden border-primary/5 hover:border-primary/10 transition-colors">
                                                        <div className="p-5 border-b-2 border-primary/5 bg-primary/[0.02]">
                                                            <h3 className="font-black text-sm uppercase tracking-widest">{format(new Date(dateStr), 'eeee d MMMM yyyy', { locale: fr })}</h3>
                                                        </div>
                                                        <div className="p-5 space-y-3">
                                                            {meals.map(meal => (
                                                                <div key={meal.id} className="flex justify-between items-center p-3 rounded-xl bg-muted/30">
                                                                    <div>
                                                                        <p className="font-black text-sm tracking-tight">{meal.name}</p>
                                                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{mealTypeTranslations[meal.type]} • {meal.calories} kcal</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </Card>
                                                ))
                                            ) : (
                                                <div className="col-span-full py-24 text-center space-y-6 bg-primary/[0.03] border-2 border-dashed border-primary/20 rounded-3xl">
                                                    <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                        <History className="h-10 w-10 text-primary opacity-40" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className="text-2xl font-black tracking-tight">Archives Vierges</h3>
                                                        <p className="text-muted-foreground font-medium">Commencez à savourer vos plats pour remplir l'histoire.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </main>
                    </div>
                </SidebarInset>
            </SidebarProvider>

            <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
                <DialogContent className="rounded-[2rem] border-2 bg-background/95 backdrop-blur-xl shadow-2xl max-w-lg">
                    <DialogHeader className="space-y-4">
                        <div className="flex items-center gap-4 text-primary font-black text-[10px] uppercase tracking-[0.2em]">
                            <Bot className="h-5 w-5" />
                            <span>Planification Intelligente</span>
                        </div>
                        <DialogTitle className="text-3xl font-black tracking-tight leading-tight">Planifier "{selectedMealForPlanning?.name}"</DialogTitle>
                        <DialogDescription className="text-sm font-bold text-muted-foreground">
                            Choisissez le moment idéal pour savourer cette création culinaire.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date Prévue</label>
                            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full h-12 rounded-2xl justify-start text-left font-black border-2 bg-muted/30 hover:bg-muted/50 transition-all",
                                            !planningDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                        {planningDate ? format(planningDate, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden border-2 shadow-2xl">
                                    <Calendar
                                        mode="single"
                                        selected={planningDate}
                                        onSelect={(date) => {
                                            setPlanningDate(date);
                                            setIsCalendarOpen(false);
                                        }}
                                        disabled={(date) => date < startOfDay(new Date())}
                                        initialFocus
                                        locale={fr}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Moment</label>
                            <Select onValueChange={(value: Meal['type']) => setPlanningType(value)} defaultValue={planningType}>
                                <SelectTrigger className="h-12 rounded-2xl font-black border-2 bg-muted/30 hover:bg-muted/50 transition-all">
                                    <SelectValue placeholder="Choisir un type" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-2 shadow-2xl">
                                    <SelectItem value="breakfast">Petit-déjeuner</SelectItem>
                                    <SelectItem value="lunch">Déjeuner</SelectItem>
                                    <SelectItem value="dinner">Dîner</SelectItem>
                                    <SelectItem value="dessert">Dessert</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="gap-3">
                        <Button variant="ghost" onClick={() => setIsPlanDialogOpen(false)} className="rounded-xl font-black text-xs uppercase tracking-widest h-12">Annuler</Button>
                        <Button
                            onClick={handleAddMealFromSuggestion}
                            disabled={!planningDate}
                            className="flex-1 h-12 rounded-xl font-black bg-primary border-none shadow-xl shadow-primary/20 relative overflow-hidden group/btn"
                        >
                            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Ajouter au Calendrier
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
