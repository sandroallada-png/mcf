'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    SidebarProvider,
    Sidebar as AppSidebar,
    SidebarInset,
} from '@/components/ui/sidebar';
import { Sidebar } from '@/components/dashboard/sidebar';
import { useUser, useFirebase, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, query, limit, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Meal, UserProfile, FridgeItem, GenerateShoppingListOutput, ShoppingListHistoryItem } from '@/lib/types';
import { Loader2, ShoppingCart, Sparkles, Trash2, CheckCircle2, ListFilter, Bot, Refrigerator, Info, ArrowRight, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { AppHeader } from '@/components/layout/app-header';
import { useToast } from '@/hooks/use-toast';
import { generateShoppingListAction } from '../actions';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function CoursesPage() {
    const { user, isUserLoading } = useUser();
    const { firestore } = useFirebase();
    const { toast } = useToast();

    const [isGenerating, setIsGenerating] = useState(false);
    const [shoppingList, setShoppingList] = useState<GenerateShoppingListOutput | null>(null);
    const [checkedItems, setCheckedItems] = useState<string[]>([]);
    const [generationStep, setGenerationStep] = useState(0);

    // --- Data Fetching ---
    const userProfileRef = useMemoFirebase(() => (user ? doc(firestore, 'users', user.uid) : null), [user, firestore]);
    const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userProfileRef);

    const effectiveChefId = userProfile?.chefId || user?.uid;

    const fridgeCollectionRef = useMemoFirebase(() => (effectiveChefId ? collection(firestore, 'users', effectiveChefId, 'fridge') : null), [effectiveChefId, firestore]);
    const { data: fridgeItems, isLoading: isLoadingFridge } = useCollection<FridgeItem>(fridgeCollectionRef);

    const foodLogsCollectionRef = useMemoFirebase(() => (effectiveChefId ? collection(firestore, 'users', effectiveChefId, 'foodLogs') : null), [effectiveChefId, firestore]);
    const foodLogsQuery = useMemoFirebase(() => (foodLogsCollectionRef ? query(foodLogsCollectionRef, orderBy('date', 'desc'), limit(15)) : null), [foodLogsCollectionRef]);
    const { data: foodLogs, isLoading: isLoadingLogs } = useCollection<Meal>(foodLogsQuery);

    const goalsCollectionRef = useMemoFirebase(() => (effectiveChefId ? collection(firestore, 'users', effectiveChefId, 'goals') : null), [effectiveChefId, firestore]);
    const { data: goalsData, isLoading: isLoadingGoals } = useCollection<{ description: string }>(goalsCollectionRef);

    const historyCollectionRef = useMemoFirebase(() => (effectiveChefId ? collection(firestore, 'users', effectiveChefId, 'shoppingHistory') : null), [effectiveChefId, firestore]);
    const historyQuery = useMemoFirebase(() => (historyCollectionRef ? query(historyCollectionRef, orderBy('createdAt', 'desc'), limit(5)) : null), [historyCollectionRef]);
    const { data: historyItems, isLoading: isLoadingHistory } = useCollection<ShoppingListHistoryItem>(historyQuery);

    const [goals, setGoals] = useState('Alimentation équilibrée');

    useEffect(() => {
        if (goalsData && goalsData.length > 0) {
            setGoals(goalsData[0].description);
        }
    }, [goalsData]);

    const handleGenerateList = async () => {
        if (!user) return;
        setIsGenerating(true);
        setShoppingList(null);
        setGenerationStep(0);

        // Simulated steps for "real-time analysis" feeling
        const steps = [
            "Analyse de vos repas préférés...",
            "Vérification de l'état du frigo...",
            "Adaptation à vos origines culinaires...",
            "Optimisation nutritionnelle...",
            "Génération de la liste précise..."
        ];

        for (let i = 0; i < steps.length; i++) {
            setGenerationStep(i);
            await new Promise(resolve => setTimeout(resolve, 800));
        }

        try {
            const likedMeals = foodLogs?.map(m => m.name) || [];
            const fridgeContents = fridgeItems?.map(i => i.name) || [];

            const { list, error } = await generateShoppingListAction({
                likedMeals,
                origin: userProfile?.origin || 'Cuisine variée',
                country: userProfile?.country || 'France',
                fridgeContents,
                personality: {
                    tone: userProfile?.tone,
                    mainObjective: userProfile?.mainObjective,
                    allergies: userProfile?.allergies,
                    preferences: userProfile?.preferences,
                }
            });

            if (error) throw new Error(error);
            setShoppingList(list);

            // Save to history
            if (list && historyCollectionRef) {
                addDocumentNonBlocking(historyCollectionRef, {
                    userId: user.uid,
                    items: list.items,
                    summary: list.summary,
                    createdAt: serverTimestamp(),
                });
            }

            toast({
                title: "Liste générée !",
                description: "Votre liste de courses par notre outil est prête."
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Erreur",
                description: error.message || "Impossible de générer la liste."
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleItem = (itemName: string) => {
        setCheckedItems(prev =>
            prev.includes(itemName)
                ? prev.filter(i => i !== itemName)
                : [...prev, itemName]
        );
    };

    const groupedItems = useMemo(() => {
        if (!shoppingList) return {};
        return shoppingList.items.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
        }, {} as Record<string, typeof shoppingList.items>);
    }, [shoppingList]);

    const isLoading = isUserLoading || isLoadingProfile || isLoadingFridge || isLoadingLogs || isLoadingGoals || isLoadingHistory;

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    const sidebarProps = {
        goals,
        setGoals: (g: string) => setGoals(g),
        meals: foodLogs || [],
    };

    const generationSteps = [
        "Analyse de vos repas préférés...",
        "Vérification de l'état du frigo...",
        "Adaptation à vos origines culinaires...",
        "Optimisation nutritionnelle...",
        "Génération de la liste précise..."
    ];

    return (
        <div className="h-screen w-full bg-background font-body flex flex-col">
            <SidebarProvider>
                <AppSidebar collapsible="icon" className="w-64 peer hidden md:block border-r bg-sidebar">
                    <Sidebar {...sidebarProps} />
                </AppSidebar>
                <SidebarInset>
                    <div className="flex h-full flex-1 flex-col">
                        <AppHeader
                            title="Courses"
                            icon={<ShoppingCart className="h-4 w-4" />}
                            user={user}
                            sidebarProps={sidebarProps}
                        />
                        <main className="flex-1 flex flex-col overflow-y-auto bg-background">
                            <div className="max-w-6xl mx-auto w-full px-6 md:px-12 py-10 space-y-10">
                                {/* Header Section */}
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="text-5xl mb-4">🛒</div>
                                        <h1 className="text-4xl font-bold tracking-tight">Ma Liste de Courses</h1>
                                        <p className="text-muted-foreground text-sm max-w-2xl">
                                            Notre outil analyse vos goûts ({userProfile?.origin || 'non spécifié'}), votre frigo et vos objectifs pour vous créer la liste parfaite.
                                        </p>
                                    </div>

                                    {!shoppingList && !isGenerating && (
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <Button
                                                onClick={handleGenerateList}
                                                className="h-12 px-8 text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                                            >
                                                <Sparkles className="mr-2 h-4 w-4" />
                                                Générer ma liste de courses avec notre outil
                                            </Button>

                                            {historyItems && historyItems.length > 0 && (
                                                <Button
                                                    variant="outline"
                                                    className="h-12 px-8 text-sm font-bold rounded-xl"
                                                    onClick={() => {
                                                        const latest = historyItems[0];
                                                        setShoppingList({
                                                            items: latest.items,
                                                            summary: latest.summary
                                                        });
                                                    }}
                                                >
                                                    <History className="mr-2 h-4 w-4" />
                                                    Dernière liste générée
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {isGenerating && (
                                    <div className="space-y-8 py-10 animate-in fade-in duration-500">
                                        <div className="flex flex-col items-center text-center gap-6">
                                            <div className="relative">
                                                <div className="h-24 w-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                                                <Bot className="absolute inset-0 m-auto h-10 w-10 text-primary" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-bold">{generationSteps[generationStep]}</h3>
                                                <p className="text-xs text-muted-foreground uppercase tracking-widest font-black opacity-60">Notre outil en action</p>
                                            </div>
                                            <div className="w-full max-w-md">
                                                <Progress value={((generationStep + 1) / generationSteps.length) * 100} className="h-2" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {shoppingList && (
                                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                        {/* Summary Card */}
                                        <Card className="bg-primary/5 border-primary/10 rounded-2xl overflow-hidden relative group">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Bot className="h-24 w-24" />
                                            </div>
                                            <CardHeader>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Sparkles className="h-4 w-4 text-primary" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Analyse Terminée</span>
                                                </div>
                                                <CardTitle className="text-xl font-bold italic">"{shoppingList.summary}"</CardTitle>
                                            </CardHeader>
                                            <CardFooter className="pt-0">
                                                <Button variant="ghost" size="sm" onClick={handleGenerateList} className="text-xs text-primary font-bold hover:bg-primary/10">
                                                    Refaire l'analyse <ArrowRight className="ml-2 h-3 w-3" />
                                                </Button>
                                            </CardFooter>
                                        </Card>

                                        {/* List Items */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {Object.entries(groupedItems).map(([category, items]) => (
                                                <div key={category} className="space-y-4">
                                                    <div className="flex items-center gap-2 border-b pb-2">
                                                        <ListFilter className="h-4 w-4 text-muted-foreground" />
                                                        <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground/80">{category}</h2>
                                                        <Badge variant="secondary" className="ml-auto text-[10px]">{items.length}</Badge>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {items.map((item, idx) => (
                                                            <div
                                                                key={idx}
                                                                onClick={() => toggleItem(item.name)}
                                                                className={cn(
                                                                    "group flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer",
                                                                    checkedItems.includes(item.name)
                                                                        ? "bg-muted/50 opacity-60 border-transparent"
                                                                        : "bg-background hover:border-primary/30 hover:shadow-md"
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className={cn(
                                                                        "h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-colors",
                                                                        checkedItems.includes(item.name)
                                                                            ? "bg-primary border-primary text-white"
                                                                            : "border-muted group-hover:border-primary/50"
                                                                    )}>
                                                                        {checkedItems.includes(item.name) && <CheckCircle2 className="h-4 w-4" />}
                                                                    </div>
                                                                    <div className="space-y-0.5">
                                                                        <p className={cn(
                                                                            "text-sm font-bold",
                                                                            checkedItems.includes(item.name) && "line-through"
                                                                        )}>{item.name}</p>
                                                                        <p className="text-[10px] text-muted-foreground font-medium">{item.reason}</p>
                                                                    </div>
                                                                </div>
                                                                {item.quantity && (
                                                                    <Badge variant="outline" className="text-[10px] font-bold px-2 py-0 border-primary/20 text-primary">
                                                                        {item.quantity}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex justify-center pt-10">
                                            <Button variant="outline" onClick={() => setShoppingList(null)} className="rounded-xl border-dashed">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Effacer la liste
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {!shoppingList && !isGenerating && historyItems && historyItems.length > 0 && (
                                    <div className="space-y-6 pt-10 border-t">
                                        <div className="flex items-center gap-2">
                                            <History className="h-5 w-5 text-muted-foreground" />
                                            <h2 className="text-xl font-bold">Historique des courses</h2>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {historyItems.map((item) => (
                                                <Card key={item.id} className="hover:border-primary/30 transition-all cursor-pointer group" onClick={() => {
                                                    setShoppingList({
                                                        items: item.items,
                                                        summary: item.summary
                                                    });
                                                }}>
                                                    <CardHeader className="p-4">
                                                        <CardTitle className="text-sm font-bold truncate">{item.summary || "Liste sans résumé"}</CardTitle>
                                                        <CardDescription className="text-[10px] uppercase font-bold tracking-widest">
                                                            {item.createdAt ? format(item.createdAt.toDate(), 'd MMMM yyyy', { locale: fr }) : 'Date inconnue'}
                                                        </CardDescription>
                                                    </CardHeader>
                                                    <CardContent className="p-4 pt-0">
                                                        <div className="flex flex-wrap gap-1">
                                                            {item.items.slice(0, 3).map((listItem, i) => (
                                                                <Badge key={i} variant="secondary" className="text-[8px] bg-accent/50 text-muted-foreground">
                                                                    {listItem.name}
                                                                </Badge>
                                                            ))}
                                                            {item.items.length > 3 && (
                                                                <Badge variant="secondary" className="text-[8px]">+{item.items.length - 3}</Badge>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {!shoppingList && !isGenerating && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t">
                                        <div className="flex flex-col items-center text-center p-6 space-y-3 bg-accent/5 rounded-2xl">
                                            <Refrigerator className="h-8 w-8 text-primary/40" />
                                            <h4 className="font-bold text-sm">Analyse du Frigo</h4>
                                            <p className="text-xs text-muted-foreground">Nous vérifions vos {fridgeItems?.length || 0} ingrédients pour ne suggérer que le nécessaire.</p>
                                        </div>
                                        <div className="flex flex-col items-center text-center p-6 space-y-3 bg-accent/5 rounded-2xl">
                                            <Bot className="h-8 w-8 text-primary/40" />
                                            <h4 className="font-bold text-sm">Profil Culturel</h4>
                                            <p className="text-xs text-muted-foreground">Une liste adaptée à votre origine : {userProfile?.origin || 'Cuisine variée'}.</p>
                                        </div>
                                        <div className="flex flex-col items-center text-center p-6 space-y-3 bg-accent/5 rounded-2xl">
                                            <Info className="h-8 w-8 text-primary/40" />
                                            <h4 className="font-bold text-sm">Budget Optimisé</h4>
                                            <p className="text-xs text-muted-foreground">Notre outil évite le gaspillage en se basant sur vos habitudes réelles.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </main>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </div>
    );
}
