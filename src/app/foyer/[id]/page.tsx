
'use client';

import { useParams } from 'next/navigation';
import { useFirebase, useCollection, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, query, where, Timestamp, orderBy } from 'firebase/firestore';
import { FridgeItem, Meal, UserProfile } from '@/lib/types';
import {
    Loader2,
    Refrigerator,
    Calendar,
    Clock,
    ChefHat,
    LayoutDashboard,
    Utensils,
    Info,
    ChevronRight,
    MapPin,
    ArrowUpRight,
    Users,
    ShieldCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, addDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import Image from 'next/image';
import { useMemo } from 'react';

export default function FoyerVisitorPage() {
    const params = useParams();
    const userId = params.id as string; // This is the chef's UID
    const { user, isUserLoading } = useUser();
    const { firestore } = useFirebase();

    // --- Authorization Check ---
    const currentUserProfileRef = useMemoFirebase(() => (user ? doc(firestore, 'users', user.uid) : null), [user, firestore]);
    const { data: currentUserProfile, isLoading: isLoadingCurrentUser } = useDoc<UserProfile>(currentUserProfileRef);

    const isAuthorized = useMemo(() => {
        if (!user || !currentUserProfile) return false;
        // Case 1: Active user is the chef
        if (user.uid === userId) return true;
        // Case 2: Active user is a member of this chef's foyer
        if (currentUserProfile.chefId === userId) return true;
        return false;
    }, [user, currentUserProfile, userId]);

    // --- Data Fetching ---
    const userProfileRef = useMemoFirebase(() => doc(firestore, 'users', userId), [firestore, userId]);
    const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userProfileRef);

    const fridgeCollectionRef = useMemoFirebase(() => collection(firestore, 'users', userId, 'fridge'), [firestore, userId]);
    const { data: fridgeItems, isLoading: isLoadingFridge } = useCollection<FridgeItem>(fridgeCollectionRef);

    const mealsCollectionRef = useMemoFirebase(() => collection(firestore, 'users', userId, 'foodLogs'), [firestore, userId]);
    const { data: allMeals, isLoading: isLoadingMeals } = useCollection<Meal>(mealsCollectionRef);

    // --- Calculations ---
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

    const todaysMeals = useMemo(() => {
        if (!allMeals) return [];
        return allMeals.filter(meal => isSameDay(meal.date.toDate(), today));
    }, [allMeals, today]);

    const weeklyMeals = useMemo(() => {
        if (!allMeals) return [];
        return allMeals.filter(meal => {
            const mealDate = meal.date.toDate();
            return mealDate >= weekStart && mealDate <= weekEnd;
        }).sort((a, b) => a.date.seconds - b.date.seconds);
    }, [allMeals, weekStart, weekEnd]);

    const mealsByDay = useMemo(() => {
        const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
        return days.map(day => ({
            day,
            meals: weeklyMeals.filter(meal => isSameDay(meal.date.toDate(), day))
        }));
    }, [weeklyMeals, weekStart]);

    const isLoading = isUserLoading || isLoadingCurrentUser || isLoadingProfile || isLoadingFridge || isLoadingMeals;

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#0a0a0b]">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative h-20 w-20">
                        <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
                        <div className="absolute inset-2 rounded-full border-b-2 border-primary/30 animate-spin-slow" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <ChefHat className="h-8 w-8 text-primary/50" />
                        </div>
                    </div>
                    <p className="text-muted-foreground font-medium animate-pulse">Vérification des accès...</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0a0a0b] p-6 text-center">
                <div className="h-24 w-24 bg-destructive/10 rounded-[2.5rem] flex items-center justify-center mb-8 rotate-12">
                    <ShieldCheck className="h-12 w-12 text-destructive" />
                </div>
                <h1 className="text-3xl font-black text-white tracking-tighter">Accès Privé</h1>
                <p className="text-muted-foreground max-w-sm mt-4 font-medium leading-relaxed">
                    Ce foyer est privé. Vous devez être membre de la famille pour consulter ce planning.
                </p>
                <Button className="mt-10 h-14 px-10 rounded-2xl bg-white text-black hover:bg-white/90 font-black uppercase tracking-widest text-xs" onClick={() => window.location.href = '/login'}>
                    Se connecter
                </Button>
            </div>
        );
    }

    if (!userProfile) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0a0a0b] p-6 text-center">
                <div className="mb-6 rounded-full bg-destructive/10 p-4">
                    <Info className="h-10 w-10 text-destructive" />
                </div>
                <h1 className="mb-2 text-2xl font-black text-white">Foyer Introuvable</h1>
                <p className="max-w-md text-muted-foreground">
                    Le foyer n'existe pas ou l'identifiant est incorrect.
                </p>
                <Button className="mt-8 px-8 rounded-xl font-bold" variant="outline" onClick={() => window.location.href = '/'}>
                    Retour à l'accueil
                </Button>
            </div>
        );
    }

    const mealTypeTranslations: Record<Meal['type'], string> = {
        breakfast: 'Petit-déjeuner',
        lunch: 'Déjeuner',
        dinner: 'Dîner',
        dessert: 'Dessert'
    };

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-primary/20 font-body">
            {/* Background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                {/* Header */}
                <header className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16 md:mb-24 animate-in fade-in slide-in-from-top-8 duration-700">
                    <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
                        <Badge variant="outline" className="px-3 py-1 bg-white/5 border-white/10 text-primary font-bold tracking-widest uppercase text-[10px]">
                            Interface Visiteur
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight flex flex-col md:flex-row items-center gap-3">
                            Foyer de <span className="text-primary">{userProfile.name}</span>
                        </h1>
                        <p className="text-muted-foreground text-sm md:text-lg max-w-xl font-medium">
                            Découvrez le programme culinaire de la semaine et l'état actuel de notre cuisine.
                        </p>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs font-bold text-white/60">
                                <Users className="h-3.5 w-3.5" />
                                <span>{userProfile.household?.length || 1} Membres</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs font-bold text-white/60">
                                <MapPin className="h-3.5 w-3.5" />
                                <span>{userProfile.origin || 'Standard'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-700" />
                        <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-3xl overflow-hidden border border-white/10 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                            <Image
                                src={userProfile.photoURL || userProfile.avatarUrl || '/plat-vide.png'}
                                alt={userProfile.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                    {/* Left Column: Planning */}
                    <div className="lg:col-span-8 space-y-12">
                        {/* Summary Section */}
                        <section className="animate-in fade-in slide-in-from-left-8 duration-700 delay-100">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-primary/10 rounded-xl">
                                    <Clock className="h-5 w-5 text-primary" />
                                </div>
                                <h2 className="text-2xl font-black tracking-tight uppercase">Aujourd'hui</h2>
                                <span className="ml-auto text-xs font-black text-muted-foreground/60 uppercase tracking-widest">
                                    {format(today, 'EEEE d MMMM', { locale: fr })}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {['breakfast', 'lunch', 'dinner', 'dessert'].map((type) => {
                                    const meal = todaysMeals.find(m => m.type === type);
                                    return (
                                        <Card key={type} className={`relative overflow-hidden border-2 transition-all duration-300 ${meal ? 'bg-white/[0.03] border-primary/20 shadow-lg shadow-primary/5' : 'bg-transparent border-dashed border-white/5 opacity-50'}`}>
                                            <CardContent className="p-5 flex items-center gap-4">
                                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${meal ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/20'}`}>
                                                    {type === 'breakfast' && <Clock className="h-6 w-6" />}
                                                    {type === 'lunch' && <Utensils className="h-6 w-6" />}
                                                    {type === 'dinner' && <ChefHat className="h-6 w-6" />}
                                                    {type === 'dessert' && <LayoutDashboard className="h-6 w-6" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">{mealTypeTranslations[type as Meal['type']]}</p>
                                                    <h4 className="text-lg font-black truncate text-white">{meal?.name || 'Non programmé'}</h4>
                                                    {meal?.cookedBy && (
                                                        <span className="inline-flex items-center gap-1.5 mt-1 text-[10px] font-bold text-primary/80">
                                                            <ChefHat className="h-2.5 w-2.5" />
                                                            Cuisiné par {meal.cookedBy}
                                                        </span>
                                                    )}
                                                </div>
                                                {meal && <ArrowUpRight className="h-5 w-5 text-primary/40 group-hover:text-primary transition-colors" />}
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Weekly Calendar */}
                        <section className="animate-in fade-in slide-in-from-left-8 duration-700 delay-200">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-blue-500/10 rounded-xl">
                                    <Calendar className="h-5 w-5 text-blue-500" />
                                </div>
                                <h2 className="text-2xl font-black tracking-tight uppercase">Planning de la semaine</h2>
                            </div>

                            <div className="space-y-4">
                                {mealsByDay.map(({ day, meals }, idx) => (
                                    <div
                                        key={day.toString()}
                                        className="group relative flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                                        style={{ animationDelay: `${(idx + 1) * 100}ms` }}
                                    >
                                        <div className="flex md:flex-col items-center md:items-start gap-2 md:gap-0 shrink-0 md:w-24">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">{format(day, 'EEE', { locale: fr })}</span>
                                            <span className={`text-2xl font-black ${isSameDay(day, today) ? 'text-primary' : 'text-white'}`}>{format(day, 'd')}</span>
                                        </div>

                                        <div className="flex-1 flex flex-wrap gap-2">
                                            {meals.length > 0 ? (
                                                meals.map((meal, mealIdx) => (
                                                    <Badge
                                                        key={meal.id}
                                                        variant="secondary"
                                                        className="px-3 py-1.5 bg-white/5 hover:bg-primary/20 hover:text-white transition-all text-xs font-bold border-white/5 rounded-xl cursor-default"
                                                    >
                                                        <span className="text-primary mr-2 opacity-50">{mealTypeTranslations[meal.type].charAt(0)}</span>
                                                        {meal.name}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-xs font-medium text-white/20 italic">Libre</span>
                                            )}
                                        </div>

                                        {isSameDay(day, today) && (
                                            <div className="hidden md:block absolute right-6">
                                                <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Fridge & Info */}
                    <aside className="lg:col-span-4 space-y-12 animate-in fade-in slide-in-from-right-8 duration-700 delay-300">
                        {/* Fridge Section */}
                        <section className="p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-500/10 to-transparent border border-white/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-12 pointer-events-none opacity-5">
                                <Refrigerator className="h-48 w-48 text-white scale-150 rotate-12" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 bg-blue-500/20 rounded-xl">
                                        <Refrigerator className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <h2 className="text-xl font-black tracking-tight uppercase">Le Frigo</h2>
                                </div>

                                <div className="space-y-3">
                                    {fridgeItems && fridgeItems.length > 0 ? (
                                        fridgeItems.map((item, idx) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/20 transition-colors animate-in fade-in zoom-in-95"
                                                style={{ animationDelay: `${(idx + 1) * 50}ms` }}
                                            >
                                                <div className="h-2 w-2 rounded-full bg-blue-500/50" />
                                                <span className="text-sm font-bold text-white/90">{item.name}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-12 flex flex-col items-center justify-center text-center opacity-30">
                                            <Refrigerator className="h-10 w-10 mb-2" />
                                            <p className="text-xs font-bold uppercase tracking-widest">Frigo vide</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-10 p-5 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-3 text-primary text-xs font-black uppercase tracking-widest">
                                        <Info className="h-4 w-4" />
                                        <span>Le saviez-vous ?</span>
                                    </div>
                                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed font-medium text-justify">
                                        L'IA de notre foyer suggère des recettes basées sur ces ingrédients pour éviter le gaspillage.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* CTA Section */}
                        <section className="p-1 rounded-[2.5rem] bg-gradient-to-r from-primary/30 to-blue-500/30">
                            <div className="bg-[#0a0a0b] rounded-[2.4rem] p-8 text-center space-y-6">
                                <h3 className="text-xl font-black tracking-tight">Envie de cuisiner ?</h3>
                                <p className="text-sm text-muted-foreground font-medium">
                                    Rejoignez MyFlex pour organiser votre propre foyer et profiter de nos outils IA.
                                </p>
                                <Button className="w-full py-6 rounded-2xl font-black uppercase tracking-widest bg-primary text-white hover:scale-[1.02] transition-transform shadow-xl shadow-primary/20" asChild>
                                    <a href="/">C'est parti !</a>
                                </Button>
                            </div>
                        </section>
                    </aside>
                </div>

                {/* Footer */}
                <footer className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 opacity-40 hover:opacity-100 transition-opacity duration-500">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 bg-primary rounded-lg flex items-center justify-center">
                            <ChefHat className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs font-black tracking-widest uppercase">MyFlex Cooking</span>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-tighter">
                        © 2026 MyFlex Household System • Premium Visitor Interface
                    </p>
                </footer>
            </div>

            {/* Custom animations */}
            <style jsx global>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(-360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
            `}</style>
        </div>
    );
}

