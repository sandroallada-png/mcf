'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    SidebarProvider,
    Sidebar as AppSidebar,
    SidebarInset,
} from '@/components/ui/sidebar';
import { Sidebar } from '@/components/dashboard/sidebar';
import { useUser, useFirebase, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, query, limit, updateDoc, Timestamp, orderBy, getDoc, increment, setDoc, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Meal, AIPersonality, SingleMealSuggestion, Dish, Cooking, PendingCooking, UserProfile, SuggestSingleMealInput } from '@/lib/types';
import { Loader2, ChefHat, Search, Clock as ClockIcon, MapPin, AlarmClock, Bot, PlusCircle, Sprout, Calendar, History, Hourglass, Sparkles, X, UtensilsCrossed, CookingPot, BookOpen, ZoomIn, Heart, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AppHeader } from '@/components/layout/app-header';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSingleMealSuggestionAction, getRecommendedDishesAction, trackInteractionAction } from '../actions';
import { useToast } from '@/hooks/use-toast';
import { ImageZoomLightbox } from '@/components/shared/image-zoom-lightbox';
import { SuggestionDialog } from '@/components/cuisine/suggestion-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from 'react-markdown';
import { format, isPast, startOfToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { WhoIsCooking } from '@/components/cuisine/who-is-cooking';

type TimeOfDay = 'matin' | 'midi' | 'soir' | 'dessert';

const getContextualInfo = (hour: number): { message: string, image: string, timeOfDay: TimeOfDay } => {
    if (hour >= 5 && hour < 10) {
        return {
            message: "C'est l'heure du petit-déjeuner ! Préparez quelque chose de nutritif pour bien commencer la journée.",
            image: "/matin.png",
            timeOfDay: 'matin'
        };
    }
    if (hour >= 10 && hour < 12) {
        return {
            message: 'La matinée est bien avancée, pensez à vous hydrater. Bientôt l\'heure du déjeuner !',
            image: "/midi.png",
            timeOfDay: 'midi'
        };
    }
    if (hour >= 12 && hour < 14) {
        return {
            message: 'Bon appétit ! Profitez de votre pause déjeuner.',
            image: "/midi.png",
            timeOfDay: 'midi'
        };
    }
    if (hour >= 14 && hour < 16) {
        return {
            message: "L'après-midi commence. Un petit café ou un thé pour rester concentré ?",
            image: "/colation.png",
            timeOfDay: 'dessert'
        };
    }
    if (hour >= 16 && hour < 18) {
        return {
            message: "C'est l'heure du goûter ! Un fruit ou quelques noix pour recharger les batteries ?",
            image: "/colation.png",
            timeOfDay: 'dessert'
        };
    }
    if (hour >= 18 && hour < 20) {
        return {
            message: 'Que diriez-vous de commencer à préparer un bon dîner ?',
            image: "/soir.png",
            timeOfDay: 'soir'
        };
    }
    if (hour >= 20 && hour < 22) {
        return {
            message: 'Passez une bonne soirée. Un repas léger est idéal avant de se coucher.',
            image: "/soir.png",
            timeOfDay: 'soir'
        };
    }
    return {
        message: 'Planifiez vos repas, mangez sainement, et profitez de chaque bouchée !',
        image: "/soir.png",
        timeOfDay: 'soir'
    };
};

const tabDetails = {
    suggestions: { title: 'Inspiration', icon: <Sparkles className="h-4 w-4" /> },
    pending: { title: 'Derniers repas', icon: <Hourglass className="h-4 w-4" /> },
    in_progress: { title: 'En cuisine', icon: <CookingPot className="h-4 w-4" /> },
    history: { title: 'Archives', icon: <History className="h-4 w-4" /> },
};

type TabValue = keyof typeof tabDetails;

export default function CuisinePage() {
    const { user, isUserLoading } = useUser();
    const { firestore } = useFirebase();
    const { toast } = useToast();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [currentTime, setCurrentTime] = useState<Date | null>(null);
    const [activeTab, setActiveTab] = useState<TabValue>('suggestions');

    const [isSuggesting, setIsSuggesting] = useState(false);
    const [suggestion, setSuggestion] = useState<SingleMealSuggestion | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [pendingItemToCook, setPendingItemToCook] = useState<PendingCooking | null>(null);
    const [recommendations, setRecommendations] = useState<(Dish & { matchReason?: string })[]>([]);
    const [isLoadingRecs, setIsLoadingRecs] = useState(false);
    const [zoomImage, setZoomImage] = useState<string | null>(null);

    // --- Data Fetching from Firestore ---
    const dishesCollectionRef = useMemoFirebase(() => collection(firestore, 'dishes'), [firestore]);
    const { data: dishes, isLoading: isLoadingDishes } = useCollection<Dish>(dishesCollectionRef);

    // --- User Profile ---
    const userProfileRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, `users/${user.uid}`);
    }, [user, firestore]);

    const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userProfileRef);

    const effectiveChefId = userProfile?.chefId || user?.uid;

    const cookingCollectionRef = useMemoFirebase(() => (effectiveChefId ? collection(firestore, `users/${effectiveChefId}/cooking`) : null), [effectiveChefId, firestore]);
    const cookingQuery = useMemoFirebase(() => (cookingCollectionRef ? query(cookingCollectionRef, orderBy('plannedFor', 'desc')) : null), [cookingCollectionRef]);
    const { data: cookingItems, isLoading: isLoadingCookingItems } = useCollection<Cooking>(cookingQuery);
    const [selectedCookingItem, setSelectedCookingItem] = useState<Cooking | null>(null);

    const pendingCookingCollectionRef = useMemoFirebase(() => (effectiveChefId ? collection(firestore, `users/${effectiveChefId}/pendingCookings`) : null), [effectiveChefId, firestore]);
    const pendingCookingQuery = useMemoFirebase(() => (pendingCookingCollectionRef ? query(pendingCookingCollectionRef, orderBy('createdAt', 'desc')) : null), [pendingCookingCollectionRef]);
    const { data: pendingCookingItems, isLoading: isLoadingPendingItems } = useCollection<PendingCooking>(pendingCookingQuery);

    const favoritesCollectionRef = useMemoFirebase(() => (user ? collection(firestore, 'users', user.uid, 'favoriteRecipes') : null), [user, firestore]);
    const { data: favorites } = useCollection<{ id: string }>(favoritesCollectionRef);

    const { cookingInProgress, pastCookingItems } = useMemo(() => {
        if (!cookingItems) {
            return { cookingInProgress: [], pastCookingItems: [] };
        }
        const today = startOfToday();
        const inProgress: Cooking[] = [];
        const past: Cooking[] = [];

        cookingItems.forEach(item => {
            const plannedDate = item.plannedFor?.toDate();
            if (!plannedDate) return;

            if (isPast(plannedDate) && !format(plannedDate, 'yyyy-MM-dd').includes(format(today, 'yyyy-MM-dd'))) {
                past.push(item);
            } else {
                inProgress.push(item);
            }
        });

        inProgress.sort((a, b) => (a.plannedFor?.toDate() ?? 0) > (b.plannedFor?.toDate() ?? 0) ? 1 : -1);

        return { cookingInProgress: inProgress, pastCookingItems: past };
    }, [cookingItems]);

    const dishCategories = useMemo(() => {
        if (!dishes) return [];
        return [...new Set(dishes.map(d => d.category))];
    }, [dishes]);

    const filteredDishes = useMemo(() => {
        if (!dishes) return [];

        let result = dishes;

        if (selectedCategory && selectedCategory !== 'all') {
            result = result.filter(dish => dish.category === selectedCategory);
        }

        if (searchTerm) {
            result = result.filter(dish =>
                dish.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return result;
    }, [dishes, searchTerm, selectedCategory]);

    const { message: contextualMessage, timeOfDay } = currentTime ? getContextualInfo(currentTime.getHours()) : { message: 'Chargement...', image: "/soir.png", timeOfDay: 'soir' };

    useEffect(() => {
        setCurrentTime(new Date());
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchRecs = async () => {
            if (!user) return;
            setIsLoadingRecs(true);
            const { recommendations: recs, error } = await getRecommendedDishesAction({
                userId: user.uid,
                count: 6,
                timeOfDay: timeOfDay as any
            });
            if (recs) setRecommendations(recs as any);
            setIsLoadingRecs(false);
        };
        if (user) fetchRecs();
    }, [user, timeOfDay]);

    // --- Data fetching for sidebar and AI ---
    const allMealsCollectionRef = useMemoFirebase(
        () => (effectiveChefId ? collection(firestore, 'users', effectiveChefId, 'foodLogs') : null),
        [effectiveChefId, firestore]
    );

    const allMealsQuery = useMemoFirebase(
        () => allMealsCollectionRef ? query(allMealsCollectionRef, orderBy('date', 'desc'), limit(15)) : null,
        [allMealsCollectionRef]
    );

    const { data: allMeals, isLoading: isLoadingAllMeals } = useCollection<Meal>(allMealsQuery);

    const mealHistory = useMemo(() => allMeals?.map(meal => meal.name) || [], [allMeals]);

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

    const handleGetSuggestion = async (pendingItem?: PendingCooking) => {
        setIsSuggesting(true);
        setSuggestion(null);

        const mealName = pendingItem?.name;
        const imageHint = pendingItem?.imageHint;

        if (pendingItem) {
            setPendingItemToCook(pendingItem);
        } else {
            setPendingItemToCook(null);
        }

        try {
            let personality: AIPersonality | undefined;
            if (userProfile?.isAITrainingEnabled) {
                personality = {
                    tone: userProfile.tone,
                    mainObjective: userProfile.mainObjective,
                    allergies: userProfile.allergies,
                    preferences: userProfile.preferences,
                };
            }

            const { suggestion: newSuggestion, error } = await getSingleMealSuggestionAction({
                timeOfDay: timeOfDay as SuggestSingleMealInput['timeOfDay'],
                dietaryGoals: goals,
                personality: personality,
                mealHistory: mealHistory,
            });

            if (error) throw new Error(error);

            const finalSuggestion = {
                ...newSuggestion,
                name: mealName || newSuggestion!.name,
                imageHint: imageHint || newSuggestion!.imageHint,
                imageUrl: newSuggestion!.imageUrl,
                recipe: newSuggestion!.recipe,
            } as SingleMealSuggestion

            setSuggestion(finalSuggestion);

            if (finalSuggestion) {
                setIsDialogOpen(true);
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Erreur", description: "Impossible de générer une suggestion." });
        } finally {
            setIsSuggesting(false);
        }
    };

    const handleShowRecipeForDish = (dish: Dish) => {
        setSuggestion({
            id: dish.id,
            name: dish.name,
            calories: dish.calories || 450,
            cookingTime: dish.cookingTime,
            type: (dish.type?.toLowerCase() || 'lunch') as SingleMealSuggestion['type'],
            imageHint: `${dish.category} ${dish.origin}`,
            imageUrl: dish.imageUrl,
            recipe: dish.recipe,
        });
        setIsDialogOpen(true);

        if (user) {
            trackInteractionAction(user.uid, dish.name, dish.origin, dish.category, 'view');
        }
    };

    const handleAcceptSuggestion = async (meal: SingleMealSuggestion, date: Date, recipe: string) => {
        if (!user || !userProfileRef) return;

        const XP_PER_LEVEL = 500;
        const xpGained = meal.xpGained || 10;

        const relatedDish = dishes?.find(d => d.name === meal.name);
        if (user) {
            trackInteractionAction(
                user.uid,
                meal.name,
                relatedDish?.origin || 'Inconnue',
                relatedDish?.category || 'Inconnue',
                'cook_complete'
            );
        }

        addDocumentNonBlocking(collection(firestore, 'users', effectiveChefId!, 'foodLogs'), {
            userId: user.uid,
            name: meal.name,
            calories: meal.calories,
            type: meal.type,
            imageUrl: meal.imageUrl || '',
            date: Timestamp.fromDate(date)
        });

        addDocumentNonBlocking(collection(firestore, `users/${effectiveChefId}/cooking`), {
            userId: user.uid,
            name: meal.name,
            calories: meal.calories,
            cookingTime: meal.cookingTime,
            type: meal.type,
            recipe: recipe,
            imageHint: meal.imageHint,
            imageUrl: meal.imageUrl,
            createdAt: Timestamp.now(),
            plannedFor: Timestamp.fromDate(date),
        });

        try {
            const userDoc = await getDoc(userProfileRef);
            const currentXp = userDoc.data()?.xp ?? 0;
            const newXp = currentXp + xpGained;
            const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;

            await updateDoc(userProfileRef, {
                xp: increment(xpGained),
                level: newLevel
            });
        } catch (error) {
            console.error("Error updating user XP:", error);
        }

        if (pendingItemToCook) {
            const pendingDocRef = doc(firestore, 'users', effectiveChefId!, 'pendingCookings', pendingItemToCook.id);
            deleteDocumentNonBlocking(pendingDocRef);
            setPendingItemToCook(null);
        }

        toast({
            title: "Repas ajouté !",
            description: `${meal.name} a été ajouté à votre journal. +${xpGained} XP !`
        });
        setSuggestion(null);
        setIsDialogOpen(false);
    };

    const handleSelectCookingItem = (item: Cooking | null) => {
        setSelectedCookingItem(item);
        if (item) {
            const plannedDate = item.plannedFor.toDate();
            const isPlannedForPast = isPast(plannedDate) && !format(plannedDate, 'yyyy-MM-dd').includes(format(new Date(), 'yyyy-MM-dd'));

            if (isPlannedForPast) setActiveTab('history');
            else setActiveTab('in_progress');
        }
    }

    const handleDeletePendingItem = (itemId: string) => {
        if (!effectiveChefId) return;
        const itemRef = doc(firestore, 'users', effectiveChefId, 'pendingCookings', itemId);
        deleteDocumentNonBlocking(itemRef);
        toast({
            variant: "destructive",
            title: "Repas retiré",
            description: "Le repas a été retiré de la liste d'attente.",
        });
    };

    const handleToggleFavorite = async (meal: any) => {
        if (!user) return;
        const recipeId = meal.id || meal.name.replace(/\s/g, '_').toLowerCase();
        const favRef = doc(firestore, 'users', user.uid, 'favoriteRecipes', recipeId);

        const isFav = favorites?.some(f => f.id === recipeId);

        try {
            if (isFav) {
                await deleteDocumentNonBlocking(favRef);
                toast({ title: "Retiré des favoris", description: `${meal.name} n'est plus dans vos favoris.` });
            } else {
                await setDoc(favRef, {
                    id: recipeId,
                    name: meal.name,
                    imageUrl: meal.imageUrl,
                    addedAt: serverTimestamp()
                });
                toast({ title: "Ajouté aux favoris", description: `${meal.name} a été ajouté à vos favoris.` });
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
        }
    };

    const isLoading = isUserLoading || isLoadingAllMeals || isLoadingGoals || isLoadingProfile || isLoadingDishes || isLoadingCookingItems || isLoadingPendingItems;

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

    return (
        <SidebarProvider defaultOpen={true}>
            <AppSidebar collapsible="icon" className="w-64 peer hidden md:block border-r bg-sidebar">
                <Sidebar {...sidebarProps} />
            </AppSidebar>
            <SidebarInset className="bg-background flex flex-col h-screen">
                <AppHeader
                    title="Cuisine"
                    icon={<ChefHat className="h-4 w-4" />}
                    user={user}
                    sidebarProps={sidebarProps}
                />
                <main className="flex-1 flex flex-col overflow-y-auto bg-background">
                    <Tabs value={activeTab} onValueChange={(value) => {
                        setSelectedCookingItem(null);
                        setActiveTab(value as TabValue);
                    }} className="flex-1 flex flex-col">
                        <div className="max-w-6xl mx-auto w-full px-6 md:px-12 py-10 space-y-10">

                            {/* Header Section */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="text-5xl mb-4">🍳</div>
                                    <h1 className="text-4xl font-bold tracking-tight">Espace Cuisine</h1>
                                    <p className="text-muted-foreground text-sm max-w-2xl">
                                        Planifiez vos repas, explorez de nouvelles recettes et suivez votre historique culinaire. {contextualMessage}
                                    </p>
                                </div>

                                <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-2">
                                    <TabsList className="h-9 p-0.5 bg-accent/50 rounded-md border border-muted/20">
                                        {Object.entries(tabDetails).map(([value, { title, icon }]) => (
                                            <TabsTrigger
                                                key={value}
                                                value={value}
                                                className="h-8 px-4 rounded-sm font-semibold text-xs transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
                                            >
                                                <span className="mr-2 opacity-60">{icon}</span>
                                                {title}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>

                                    {activeTab === 'suggestions' && (
                                        <Button
                                            onClick={() => handleGetSuggestion()}
                                            disabled={isSuggesting}
                                            className="h-9 px-4 text-xs font-bold rounded shadow-sm"
                                        >
                                            {isSuggesting ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-2 h-3.5 w-3.5" />}
                                            Inspiration IA
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1">
                                <TabsContent value="suggestions" className="m-0 focus-visible:ring-0 outline-none space-y-12">
                                    <div className="p-6 rounded-lg border bg-accent/5 space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Bot className="h-4 w-4 text-primary" />
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Organisation du foyer</h3>
                                        </div>
                                        <WhoIsCooking />
                                    </div>

                                    {/* NEW: Personalized Recommendations Section */}
                                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="space-y-1">
                                                <h2 className="text-xl font-bold flex items-center gap-2">
                                                    <Sparkles className="h-5 w-5 text-primary" />
                                                    Recommandé pour vous
                                                    <Badge variant="outline" className="text-[10px] uppercase tracking-tighter ml-2 bg-primary/10 text-primary border-primary/20">Algorithme MyFlex</Badge>
                                                </h2>
                                                <p className="text-xs text-muted-foreground">Inspirations basées sur votre profil ({userProfile?.origin || 'Cuisine variée'}) et vos saveurs préférées.</p>
                                            </div>
                                            <Button variant="ghost" size="sm" className="hidden sm:flex text-[10px] uppercase font-bold tracking-widest" onClick={() => window.location.reload()}>
                                                Rafraîchir
                                            </Button>
                                        </div>

                                        {isLoadingRecs ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="h-48 rounded-xl bg-accent/5 border border-dashed animate-pulse" />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {recommendations.slice(0, 3).map((dish, idx) => (
                                                    <Card key={idx} className="group relative aspect-[7/10] overflow-hidden border-none shadow-lg transition-all rounded-xl cursor-pointer" onClick={() => handleShowRecipeForDish(dish)}>
                                                        <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-background/90 shadow-sm" onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (user) trackInteractionAction(user.uid, dish.name, dish.origin, dish.category, 'like');
                                                                toast({ title: "Ajouté à vos favoris", description: "L'IA affinera vos prochaines suggestions." });
                                                            }}>
                                                                <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
                                                            </Button>
                                                        </div>
                                                        <Image
                                                            src={dish.imageUrl || `https://picsum.photos/seed/${dish.name.replace(/\s/g, '-')}/400/550`}
                                                            alt={dish.name}
                                                            fill
                                                            className="object-cover group-hover:scale-110 transition-transform duration-1000"
                                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent flex flex-col justify-end p-5">
                                                            <Badge variant="outline" className="mb-2 w-fit text-[8px] bg-primary/20 backdrop-blur border-white/10 text-white font-black uppercase tracking-widest px-2 py-0.5 rounded-sm">
                                                                ✨ {dish.matchReason || 'Suggestion MyFlex'}
                                                            </Badge>
                                                            <h3 className="text-xl font-black text-white uppercase italic leading-tight group-hover:-translate-y-1 transition-transform">{dish.name}</h3>
                                                            <div className="mt-2 flex items-center gap-3 text-[9px] font-black text-white/50 uppercase tracking-[0.2em]">
                                                                <div className="flex items-center gap-1">
                                                                    <ClockIcon className="h-3 w-3" />
                                                                    <span>{dish.cookingTime}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <MapPin className="h-3 w-3" />
                                                                    <span>{dish.origin}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </section>

                                    <div className="space-y-8">
                                        <div className="flex flex-col md:flex-row items-end justify-between gap-6 border-b pb-4">
                                            <div className="space-y-1">
                                                <h3 className="text-xl font-bold">Explorer les recettes</h3>
                                                <p className="text-xs text-muted-foreground">Découvrez notre catalogue de plats équilibrés.</p>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                                                <div className="relative group">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                    <Input
                                                        placeholder="Rechercher..."
                                                        className="h-9 pl-9 w-full sm:w-48 text-xs font-medium rounded border-muted/20"
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                    />
                                                </div>
                                                <Select onValueChange={setSelectedCategory} value={selectedCategory}>
                                                    <SelectTrigger className="h-9 w-full sm:w-40 text-xs font-medium rounded border-muted/20 bg-background">
                                                        <SelectValue placeholder="Catégorie" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-md border shadow-lg text-xs">
                                                        <SelectItem value="all">Toutes catégories</SelectItem>
                                                        {dishCategories.map(category => (
                                                            <SelectItem key={category} value={category}>{category}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                                            {filteredDishes.length > 0 ? (
                                                filteredDishes.map((dish, index) => (
                                                    <Card key={`${dish.id}-${index}`}
                                                        className="group relative aspect-[7/10] rounded-xl overflow-hidden border-none shadow-lg transition-all cursor-pointer bg-muted"
                                                        onClick={() => handleShowRecipeForDish(dish)}>
                                                        <Image
                                                            src={dish.imageUrl || `https://picsum.photos/seed/${dish.name.replace(/\s/g, '-')}/400/550`}
                                                            alt={dish.name}
                                                            fill
                                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                                            data-ai-hint={dish.imageHint}
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent flex flex-col justify-end p-5">
                                                            <div className="flex gap-1.5 mb-2">
                                                                <Badge className="bg-primary/20 backdrop-blur-sm text-white border-white/10 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm">
                                                                    {dish.category}
                                                                </Badge>
                                                            </div>
                                                            <h4 className="text-xl font-black text-white uppercase italic leading-tight mb-2 group-hover:-translate-y-1 transition-transform">
                                                                {dish.name}
                                                            </h4>
                                                            <div className="flex items-center gap-4 text-[9px] font-black text-white/50 uppercase tracking-widest">
                                                                <div className="flex items-center gap-1.5">
                                                                    <ClockIcon className="h-3 w-3" />
                                                                    <span>{dish.cookingTime}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5">
                                                                    <MapPin className="h-3 w-3" />
                                                                    <span className="truncate max-w-[80px]">{dish.origin || 'Standard'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                ))
                                            ) : (
                                                <div className="col-span-full py-20 text-center border border-dashed rounded-lg bg-accent/5">
                                                    <h3 className="text-sm font-bold text-muted-foreground/50 uppercase tracking-widest">Aucune recette trouvée</h3>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="pending" className="m-0 focus-visible:ring-0 outline-none">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {pendingCookingItems && pendingCookingItems.length > 0 ? pendingCookingItems.map(item => (
                                            <Card key={item.id} className="flex flex-col rounded-lg border shadow-sm hover:border-primary/20 transition-all">
                                                <CardHeader className="p-5 pb-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
                                                            En attente
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 rounded text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleDeletePendingItem(item.id)}
                                                        >
                                                            <X className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                    <CardTitle className="text-lg font-bold truncate mt-1">{item.name}</CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-5 pt-2 flex-grow space-y-4">
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>Ajouté le {item.createdAt ? format(item.createdAt.toDate(), 'd MMM', { locale: fr }) : ''}</span>
                                                    </div>
                                                    <Button
                                                        onClick={() => handleGetSuggestion(item)}
                                                        className="w-full h-9 text-xs font-bold rounded shadow-sm"
                                                    >
                                                        <CookingPot className="mr-2 h-3.5 w-3.5" />
                                                        Démarrer la préparation
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        )) : (
                                            <div className="col-span-full py-20 text-center border border-dashed rounded-lg bg-accent/5">
                                                <h3 className="text-sm font-bold text-muted-foreground/50 uppercase tracking-widest">File d'attente vide</h3>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="in_progress" className="m-0 focus-visible:ring-0 outline-none">
                                    {selectedCookingItem && !isPast(selectedCookingItem.plannedFor.toDate()) ? (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <Button variant="outline" size="sm" onClick={() => setSelectedCookingItem(null)} className="h-8 rounded font-semibold text-xs border-muted/20">
                                                &larr; Retour à la liste
                                            </Button>
                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                                <div className="lg:col-span-8 space-y-8 text-foreground/90">
                                                    <div className="space-y-4">
                                                        <h2 className="text-4xl font-bold tracking-tight">{selectedCookingItem.name}</h2>
                                                        <div className="flex flex-wrap gap-4">
                                                            <Badge variant="secondary" className="bg-accent/50 text-foreground font-bold px-2 py-0.5 rounded text-[10px]">
                                                                {selectedCookingItem.calories} kcal
                                                            </Badge>
                                                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                                                                <ClockIcon className="h-3.5 w-3.5" />
                                                                <span>{selectedCookingItem.cookingTime}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="prose prose-sm dark:prose-invert max-w-none pt-4 border-t">
                                                        <ReactMarkdown>
                                                            {selectedCookingItem.recipe || "Recette en cours de chargement..."}
                                                        </ReactMarkdown>
                                                    </div>
                                                </div>
                                                <div className="lg:col-span-4">
                                                    <div className="rounded-lg border overflow-hidden shadow-sm aspect-[4/3] relative group cursor-zoom-in">
                                                        <Image
                                                            src={selectedCookingItem.imageUrl || `https://picsum.photos/seed/${selectedCookingItem.name.replace(/\s/g, '-')}/400/300`}
                                                            alt={selectedCookingItem.name}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                            onClick={() => setZoomImage(selectedCookingItem.imageUrl || `https://picsum.photos/seed/${selectedCookingItem.name.replace(/\s/g, '-')}/400/300`)}
                                                        />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                            <ZoomIn className="h-10 w-10 text-white drop-shadow-lg" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                            {cookingInProgress && cookingInProgress.length > 0 ? cookingInProgress.map(item => (
                                                <Card
                                                    key={item.id}
                                                    className="group flex flex-col rounded-lg border shadow-sm hover:border-primary/20 transition-all cursor-pointer"
                                                    onClick={() => handleSelectCookingItem(item)}
                                                >
                                                    <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                                                        <Image
                                                            src={item.imageUrl || `https://picsum.photos/seed/${item.name.replace(/\s/g, '-')}/400/250`}
                                                            alt={item.name}
                                                            fill
                                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                        />
                                                        <div className="absolute top-2 left-2">
                                                            <Badge className="bg-background/90 text-[9px] font-bold text-foreground border-none px-2 py-0.5">
                                                                En cuisine
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <CardContent className="p-5 space-y-3">
                                                        <h4 className="text-base font-bold group-hover:text-primary transition-colors">{item.name}</h4>
                                                        <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                                            <div className="flex items-center gap-1.5 transition-colors">
                                                                <ClockIcon className="h-3 w-3" />
                                                                <span>{item.cookingTime || 'Prêt'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <Calendar className="h-3 w-3" />
                                                                <span>{item.plannedFor ? format(item.plannedFor.toDate(), 'd MMM', { locale: fr }) : 'Chef'}</span>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )) : (
                                                <div className="col-span-full py-20 text-center border border-dashed rounded-lg bg-accent/5">
                                                    <h3 className="text-sm font-bold text-muted-foreground/50 uppercase tracking-widest">Rien en cours de préparation</h3>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="history" className="m-0 focus-visible:ring-0 outline-none">
                                    {selectedCookingItem && isPast(selectedCookingItem.plannedFor.toDate()) ? (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                                            <Button variant="outline" size="sm" onClick={() => setSelectedCookingItem(null)} className="h-8 rounded font-semibold text-xs border-muted/20">
                                                &larr; Retour à l'historique
                                            </Button>
                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 opacity-80">
                                                <div className="lg:col-span-8 space-y-8">
                                                    <div className="space-y-4">
                                                        <h2 className="text-4xl font-bold tracking-tight grayscale-[0.2]">{selectedCookingItem.name}</h2>
                                                        <div className="flex items-center gap-2 text-muted-foreground font-bold text-[10px] uppercase tracking-widest">
                                                            <History className="h-3.5 w-3.5" />
                                                            <span>Cuisiné le {format(selectedCookingItem.plannedFor.toDate(), 'd MMMM yyyy', { locale: fr })}</span>
                                                        </div>
                                                    </div>
                                                    <div className="prose prose-sm dark:prose-invert max-w-none pt-4 border-t">
                                                        <ReactMarkdown>
                                                            {selectedCookingItem.recipe || "Recette archivée."}
                                                        </ReactMarkdown>
                                                    </div>
                                                </div>
                                                <div className="lg:col-span-4">
                                                    <div className="rounded-lg border overflow-hidden shadow-sm aspect-[4/3] relative grayscale-[0.5]">
                                                        <Image
                                                            src={selectedCookingItem.imageUrl || `https://picsum.photos/seed/${selectedCookingItem.name.replace(/\s/g, '-')}/400/300`}
                                                            alt={selectedCookingItem.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                            {pastCookingItems && pastCookingItems.length > 0 ? pastCookingItems.map(item => (
                                                <Card
                                                    key={item.id}
                                                    className="group flex flex-col rounded-lg border shadow-xs hover:border-primary/20 transition-all cursor-pointer grayscale-[0.3] hover:grayscale-0"
                                                    onClick={() => handleSelectCookingItem(item)}
                                                >
                                                    <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                                                        <Image
                                                            src={item.imageUrl || `https://picsum.photos/seed/${item.name.replace(/\s/g, '-')}/400/250`}
                                                            alt={item.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <CardContent className="p-5 space-y-3">
                                                        <h4 className="text-base font-bold group-hover:text-primary transition-colors">{item.name}</h4>
                                                        <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                                            <div className="flex items-center gap-1.5">
                                                                <History className="h-3 w-3" />
                                                                <span>{format(item.plannedFor.toDate(), 'd MMM yyyy', { locale: fr })}</span>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )) : (
                                                <div className="col-span-full py-20 text-center border border-dashed rounded-lg bg-accent/5">
                                                    <h3 className="text-sm font-bold text-muted-foreground/50 uppercase tracking-widest">Historique vide</h3>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </TabsContent>
                            </div>
                        </div>
                    </Tabs>
                </main>
                {suggestion && (
                    <SuggestionDialog
                        suggestion={suggestion}
                        isOpen={isDialogOpen}
                        onClose={() => setIsDialogOpen(false)}
                        onAccept={handleAcceptSuggestion}
                        isFavorite={favorites?.some(f => f.id === (suggestion?.id || suggestion?.name?.replace(/\s/g, '_').toLowerCase()))}
                        onToggleFavorite={handleToggleFavorite}
                    />
                )}
            </SidebarInset>
            <ImageZoomLightbox
                isOpen={!!zoomImage}
                imageUrl={zoomImage}
                onClose={() => setZoomImage(null)}
            />
        </SidebarProvider>
    );
}
