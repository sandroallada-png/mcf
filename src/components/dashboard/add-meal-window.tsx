'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    Search,
    Calendar as CalendarIcon,
    Clock,
    ChefHat,
    Loader2,
    Sparkles,
    UtensilsCrossed,
    PlusCircle,
    HelpCircle,
    Flame,
    CheckCircle2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit, getDocs, deleteDoc } from 'firebase/firestore';
import { getSingleMealSuggestionAction } from '@/app/actions';
import type { Dish, Meal, SingleMealSuggestion } from '@/lib/types';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Timestamp } from 'firebase/firestore';

// Schema for the form
const mealFormSchema = z.object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères.'),
    type: z.enum(['breakfast', 'lunch', 'dinner', 'dessert']),
    cookedBy: z.string().optional(),
    date: z.date().optional(),
    calories: z.number().optional(),
});

type MealFormValues = z.infer<typeof mealFormSchema>;

interface AddMealWindowProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; type: Meal['type']; cookedBy?: string; calories?: number; date?: Date }) => Promise<void>;
    household?: string[];
    userId?: string;
}

export function AddMealWindow({ isOpen, onClose, onSubmit, household = [], userId }: AddMealWindowProps) {
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<'today' | 'later'>('today');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sentMissingMeal, setSentMissingMeal] = useState(false);

    // Fetch dishes for search
    const dishesCollectionRef = useMemoFirebase(() => collection(firestore, 'dishes'), [firestore]);
    const dishesQuery = useMemoFirebase(() => query(dishesCollectionRef, orderBy('name'), limit(50)), [dishesCollectionRef]);
    const { data: dishes, isLoading: isLoadingDishes } = useCollection<Dish>(dishesQuery);

    const handleSendMissingMeal = async () => {
        if (!searchTerm || !userId) return;
        setIsSubmitting(true);
        try {
            await addDocumentNonBlocking(collection(firestore, 'missingMeals'), {
                name: searchTerm,
                userId: userId,
                userEmail: user?.email || 'Inconnu',
                userName: user?.displayName || 'Utilisateur',
                createdAt: Timestamp.now(),
                status: 'pending'
            });
            setSentMissingMeal(true);
            toast({
                title: "Demande envoyée !",
                description: "Nous avons bien reçu votre suggestion. Nos experts l'ajouteront bientôt."
            });
        } catch (error) {
            console.error("Error sending missing meal:", error);
            toast({ variant: "destructive", title: "Erreur", description: "Impossible d'envoyer votre demande." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getDefaultMealType = (): 'breakfast' | 'lunch' | 'dinner' | 'dessert' => {
        const hour = new Date().getHours();
        // Si on est le matin (5h-11h), on suggère le Déjeuner
        if (hour >= 5 && hour < 11) return 'lunch';
        // Si on est le midi (11h-15h), on suggère le Dîner (ou Dessert/Goûter ?)
        // Le client dit "on ne peut pas être à 6h et programmer pour 6h", donc on anticipe.
        if (hour >= 11 && hour < 17) return 'dinner';
        // Le soir, on suggère le Petit-déjeuner du lendemain
        if (hour >= 17 && hour < 22) return 'breakfast';
        // Fin de soirée / Nuit, on suggère le Petit-déjeuner ou Déjeuner
        return 'breakfast';
    };

    const form = useForm<MealFormValues>({
        resolver: zodResolver(mealFormSchema),
        defaultValues: {
            name: '',
            type: getDefaultMealType(),
            cookedBy: '',
            date: new Date(),
        },
    });

    useEffect(() => {
        if (isOpen) {
            form.setValue('type', getDefaultMealType());
            form.setValue('date', new Date());
        }
    }, [isOpen, form]);

    // Filter dishes based on search term (client-side for responsiveness on small dataset)
    const filteredDishes = useMemo(() => {
        if (!dishes || !searchTerm) return [];
        const lowerTerm = searchTerm.toLowerCase();
        return dishes.filter(dish => dish.name.toLowerCase().includes(lowerTerm)).slice(0, 5);
    }, [dishes, searchTerm]);

    const handleSelectDish = (dish: Dish) => {
        setSelectedDish(dish);
        form.setValue('name', dish.name);
        // Rough calorie estimation based on dish type if not present (although dish usually has no calories field in types.ts? Wait, Dish schema has no calories, only user meal logs have. 
        // Actually Dish schema in types.ts doesn't have calories. So we still need estimation or fetch from somewhere else. 
        // But the user prompt implies "repas disponible avec/sans recette".
        // I'll leave calories undefined to let the main onSubmit handle estimation, or I could try to fetch a "Recipe" if linked.
        // For now, just set name.
    };

    const [pendingSubmission, setPendingSubmission] = useState<{ values: MealFormValues; type: 'today' | 'later' } | null>(null);
    const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
    const [conflictMessage, setConflictMessage] = useState('');

    const checkForConflict = async (date: Date, type: Meal['type']) => {
        if (!userId) return false;

        // Define range for the day
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // Check in 'cooking' collection (planned meals)
        const cookingRef = collection(firestore, 'users', userId, 'cooking');
        const q = query(
            cookingRef,
            where('plannedFor', '>=', Timestamp.fromDate(startOfDay)),
            where('plannedFor', '<=', Timestamp.fromDate(endOfDay)),
            where('type', '==', type) // Assuming we only care about same meal type conflict
        );

        // Also check in 'meals' collection (logged meals) if it's for today/past? 
        // User said "si un repas est programmer". 
        // So we mainly check future planned meals.

        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            return true;
        }
        return false;
    };


    const handleFormSubmit = async (values: MealFormValues) => {
        setIsSubmitting(true);
        try {
            if (activeTab === 'later' && values.date) {
                const plannedDate = values.date;
                if (plannedDate < new Date()) {
                    toast({ title: "Date invalide", description: "Veuillez choisir une date future.", variant: "destructive" });
                    setIsSubmitting(false);
                    return;
                }

                // Check for conflict
                const hasConflict = await checkForConflict(plannedDate, values.type);
                if (hasConflict) {
                    setPendingSubmission({ values, type: 'later' });
                    setConflictMessage(`Vous avez déjà un repas de type "${values.type === 'breakfast' ? 'Petit-déjeuner' : values.type === 'lunch' ? 'Déjeuner' : values.type === 'dinner' ? 'Dîner' : 'Dessert'}" programmé pour cette date. Voulez-vous le remplacer ?`);
                    setConflictDialogOpen(true);
                    setIsSubmitting(false);
                    return;
                }

                await procceedSubmission(values, 'later');

            } else {
                // Check conflict for today? User said "when user searches a meal and wants to add it, we check if no meal is scheduled at this moment".
                // That implies even for "Today".
                // If I add lunch for today, and I already planned a lunch for today...
                // I should check "cooking" for today as well.
                const todayDate = new Date();
                const hasConflict = await checkForConflict(todayDate, values.type);

                if (hasConflict) {
                    setPendingSubmission({ values, type: 'today' });
                    setConflictMessage(`Vous avez un repas prévu pour ce moment aujourd'hui. Voulez-vous le remplacer par celui-ci ?`);
                    setConflictDialogOpen(true);
                    setIsSubmitting(false);
                    return;
                }

                await procceedSubmission(values, 'today');
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Erreur", description: "Une erreur est survenue.", variant: "destructive" });
            setIsSubmitting(false);
        }
    };

    const procceedSubmission = async (values: MealFormValues, tab: 'today' | 'later') => {
        try {
            if (tab === 'later' && values.date) {
                const plannedDate = values.date;
                if (!userId) throw new Error("User ID missing");

                // Start: Remove existing conflict if any?
                // The prompt says "Do you want to change it?". This implies we overwrite or just add?
                // "Change it" usually means replace.
                // To replace, we should find the old one and delete it, or just add new one.
                // If we really want to replace, we need to delete the old one.
                // For simplicity, let's just add the new one. The user can have multiple if they want, but the warning is good.
                // Wait, "Voulez-vous le changer?" implies replacement. 
                // Implementing replacement would require finding the ID of the conflicting document.
                // Let's do that optimization if I have time. For now, just proceeding to add is "changing the plan" in a loose sense.
                // Actually, let's try to delete the conflicting one if we found it.
                // I'll need to re-query to get the ID.

                // Re-query for conflict to delete it (simple overwrite)
                const startOfDay = new Date(plannedDate);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(plannedDate);
                endOfDay.setHours(23, 59, 59, 999);
                const cookingRef = collection(firestore, 'users', userId, 'cooking');
                const q = query(
                    cookingRef,
                    where('plannedFor', '>=', Timestamp.fromDate(startOfDay)),
                    where('plannedFor', '<=', Timestamp.fromDate(endOfDay)),
                    where('type', '==', values.type)
                );
                const snapshot = await getDocs(q);
                snapshot.forEach(async (doc) => {
                    await deleteDoc(doc.ref);
                });


                const cookingData = {
                    userId,
                    name: values.name,
                    type: values.type,
                    calories: 0,
                    cookingTime: 'Unknown',
                    imageHint: values.name,
                    createdAt: Timestamp.now(),
                    plannedFor: Timestamp.fromDate(plannedDate),
                    recipe: selectedDish?.recipe,
                };

                await addDocumentNonBlocking(collection(firestore, 'users', userId, 'cooking'), cookingData);
                toast({ title: "Repas programmé", description: `Le repas ${values.name} a été programmé pour le ${format(plannedDate, 'dd/MM/yyyy')}.` });
                onClose();

            } else {
                // Today
                // If conflict found for today (in planned meals), we should probably delete the planned meal and add the real log.
                // Or just add the log.
                if (userId) {
                    const todayDate = new Date();
                    const startOfDay = new Date(todayDate);
                    startOfDay.setHours(0, 0, 0, 0);
                    const endOfDay = new Date(todayDate);
                    endOfDay.setHours(23, 59, 59, 999);
                    const cookingRef = collection(firestore, 'users', userId, 'cooking');
                    const q = query(
                        cookingRef,
                        where('plannedFor', '>=', Timestamp.fromDate(startOfDay)),
                        where('plannedFor', '<=', Timestamp.fromDate(endOfDay)),
                        where('type', '==', values.type)
                    );
                    const snapshot = await getDocs(q);
                    snapshot.forEach(async (doc) => {
                        await deleteDoc(doc.ref);
                    });
                }

                await onSubmit({
                    name: values.name,
                    type: values.type,
                    cookedBy: values.cookedBy,
                });
                onClose();
            }
        } catch (e) {
            console.error(e);
            toast({ title: "Erreur", description: "Échec de l'enregistrement.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
            setConflictDialogOpen(false);
            setPendingSubmission(null);
        }
    };

    const [suggestedAlternative, setSuggestedAlternative] = useState<SingleMealSuggestion | null>(null);
    const [isSearchingAlternative, setIsSearchingAlternative] = useState(false);

    // Carousel state
    const [carouselIndex, setCarouselIndex] = useState(0);
    const displaySuggestions = useMemo(() => {
        // Use dishes from DB, shuffle or just pick top 5
        if (!dishes || dishes.length === 0) return [];
        // Ideally we would filter for "liked" dishes, but for now just random ones
        return [...dishes].sort(() => 0.5 - Math.random()).slice(0, 5);
    }, [dishes]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isSearchingAlternative && displaySuggestions.length > 0) {
            interval = setInterval(() => {
                setCarouselIndex((prev) => (prev + 1) % displaySuggestions.length);
            }, 2000); // Change every 2 seconds
        }
        return () => clearInterval(interval);
    }, [isSearchingAlternative, displaySuggestions]);

    const handleFindAlternative = async () => {
        setIsSearchingAlternative(true);
        setSuggestedAlternative(null);
        toast({
            title: "Recherche d'alternative...",
            description: "Notre outil de cuisine (MyFlex) cherche une alternative saine."
        });

        try {
            // Determine time of day based on current hour
            const hour = new Date().getHours();
            let timeOfDay: 'matin' | 'midi' | 'soir' | 'dessert' = 'midi';
            if (hour < 10) timeOfDay = 'matin';
            else if (hour < 14) timeOfDay = 'midi';
            else if (hour < 18) timeOfDay = 'dessert';
            else timeOfDay = 'soir';

            const { suggestion, error } = await getSingleMealSuggestionAction({
                dietaryGoals: "Manger équilibré", // You might want to pass actual user goals if available
                timeOfDay: timeOfDay,
                // personality: ... (optional)
            });

            if (error || !suggestion) {
                throw new Error(error || "Aucune suggestion trouvée");
            }

            setSuggestedAlternative(suggestion);
        } catch (error) {
            console.error("Alternative search failed:", error);
            toast({
                title: "Erreur",
                description: "Impossible de trouver une alternative pour le moment.",
                variant: "destructive"
            });
        } finally {
            setIsSearchingAlternative(false);
        }
    };

    const handleSelectAlternative = () => {
        if (suggestedAlternative) {
            form.setValue('name', suggestedAlternative.name);
            form.setValue('type', suggestedAlternative.type as any);
            // We set the search term to empty to close the suggestions dropdown
            setSearchTerm('');
            toast({ title: "Alternative sélectionnée", description: "Bon appétit !" });
            setSuggestedAlternative(null);
        }
    };

    return (
        <DialogContent className="sm:max-w-[600px] sm:h-[600px] gap-0 p-0 overflow-hidden rounded-2xl border-2 flex flex-col">
            <DialogHeader className="px-6 pt-6 pb-4 bg-muted/10 border-b">
                <DialogTitle className="text-2xl font-black flex items-center gap-2">
                    🍽️ Ajouter ou Planifier un repas
                </DialogTitle>
                <DialogDescription className="font-medium text-muted-foreground">
                    Enregistrez ce que vous mangez pour suivre vos objectifs.
                </DialogDescription>
            </DialogHeader>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'today' | 'later')} className="w-full flex flex-col h-full">

                <div className="px-6 py-2 bg-muted/5 border-b">
                    <TabsList className="grid w-full grid-cols-2 h-10">
                        <TabsTrigger value="today" className="text-xs font-bold uppercase tracking-wide">Aujourd'hui</TabsTrigger>
                        <TabsTrigger value="later" className="text-xs font-bold uppercase tracking-wide">Plus tard</TabsTrigger>
                    </TabsList>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">

                            {/* Search / Name Input */}
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="relative">
                                            <div className="flex items-center justify-between mb-2">
                                                <FormLabel>Que mangez-vous ?</FormLabel>
                                                {!selectedDish && !searchTerm && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary hover:bg-primary/5 gap-1.5"
                                                        onClick={handleFindAlternative}
                                                        disabled={isSearchingAlternative}
                                                    >
                                                        {isSearchingAlternative ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                                        Besoin d'une idée ?
                                                    </Button>
                                                )}
                                            </div>
                                            <FormControl>
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        placeholder="ex: Poulet Yassa, Ratatouille..."
                                                        {...field}
                                                        className="pl-9 h-12 rounded-xl focus-visible:ring-primary/20"
                                                        autoComplete="off"
                                                        onChange={(e) => {
                                                            field.onChange(e);
                                                            setSearchTerm(e.target.value);
                                                            setSentMissingMeal(false); // Reset when user types
                                                            if (e.target.value === '') setSelectedDish(null);
                                                        }}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Close Suggestion if it exists when searching something else */}
                                {searchTerm && suggestedAlternative && !selectedDish && (
                                    <div className="flex justify-between items-center px-1">
                                        <p className="text-[10px] font-medium text-muted-foreground italic">Recherche en cours...</p>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 text-[10px] text-muted-foreground px-2"
                                            onClick={() => setSuggestedAlternative(null)}
                                        >
                                            Ignorer la suggestion
                                        </Button>
                                    </div>
                                )}

                                {/* AI Suggestion Display */}
                                {suggestedAlternative && !selectedDish && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                        {/* AI Speech Bubble */}
                                        <div className="relative bg-primary/10 border border-primary/20 p-4 rounded-2xl rounded-tl-none ml-4 shadow-sm">
                                            <div className="absolute -left-3 top-0 w-3 h-3 bg-primary/10 border-l border-t border-primary/20" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
                                            <div className="flex items-start gap-3">
                                                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-lg">
                                                    <Sparkles className="h-4 w-4 text-white" />
                                                </div>
                                                <p className="text-sm font-medium leading-relaxed italic text-foreground/90">
                                                    "{suggestedAlternative.message}"
                                                </p>
                                            </div>
                                        </div>

                                        <div
                                            className="flex items-center gap-4 p-4 rounded-2xl border-2 border-primary bg-primary/5 cursor-pointer hover:bg-primary/10 transition-all hover:scale-[1.02] shadow-sm group"
                                            onClick={handleSelectAlternative}
                                        >
                                            <div className="h-16 w-16 rounded-xl bg-background flex items-center justify-center shrink-0 overflow-hidden border-2 border-primary/20 shadow-inner">
                                                {suggestedAlternative.imageUrl ? (
                                                    <img src={suggestedAlternative.imageUrl} alt={suggestedAlternative.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                ) : (
                                                    <UtensilsCrossed className="h-8 w-8 text-primary/30" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Coup de cœur suggéré</p>
                                                <p className="text-lg font-black text-foreground truncate">{suggestedAlternative.name}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                                                        <Flame className="h-3 w-3 text-orange-500" />
                                                        {suggestedAlternative.calories} kcal
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                                                        <Clock className="h-3 w-3 text-blue-500" />
                                                        {suggestedAlternative.cookingTime}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button type="button" size="sm" className="rounded-full px-6 font-bold shadow-lg shadow-primary/20">
                                                Choisir
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Search Results */}
                                {searchTerm && !selectedDish && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">
                                            {filteredDishes.length > 0 ? 'Suggestions' : 'Résultats'}
                                        </p>

                                        <div className="grid gap-2">
                                            {filteredDishes.length > 0 ? (
                                                filteredDishes.map((dish, index) => (
                                                    <div
                                                        key={dish.id}
                                                        className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-accent/50 hover:border-primary/30 cursor-pointer transition-all group"
                                                        onClick={() => handleSelectDish(dish)}
                                                    >
                                                        <div className={cn(
                                                            "h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden border transition-transform",
                                                            index === 0 && "animate-wiggle ring-2 ring-primary/20 ring-offset-1"
                                                        )}>
                                                            {dish.imageUrl ? (
                                                                <img src={dish.imageUrl} alt={dish.name} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <UtensilsCrossed className="h-5 w-5 text-muted-foreground/50" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-foreground">{dish.name}</p>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <Badge variant="secondary" className="text-[9px] h-4 px-1.5 font-bold border-muted-foreground/20">
                                                                    {dish.recipe ? 'Recette dispo' : 'Sans recette'}
                                                                </Badge>
                                                                <span className="text-[10px] text-muted-foreground truncate">{dish.origin}</span>
                                                            </div>
                                                        </div>
                                                        <PlusCircle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-4 rounded-xl border border-dashed bg-muted/5 text-center space-y-3">
                                                    {isSearchingAlternative && displaySuggestions.length > 0 ? (
                                                        <div className="py-2 animate-in fade-in duration-300 space-y-3">
                                                            <div className="flex flex-col items-center gap-3">
                                                                <div className="relative h-16 w-16 rounded-full border-2 border-primary/30 p-1">
                                                                    <div className="h-full w-full rounded-full overflow-hidden relative">
                                                                        {displaySuggestions[carouselIndex]?.imageUrl ? (
                                                                            <img
                                                                                key={carouselIndex}
                                                                                src={displaySuggestions[carouselIndex].imageUrl}
                                                                                alt="Suggestion loading"
                                                                                className="h-full w-full object-cover animate-in fade-in zoom-in duration-500"
                                                                            />
                                                                        ) : (
                                                                            <div className="h-full w-full bg-muted flex items-center justify-center animate-pulse">
                                                                                <UtensilsCrossed className="h-6 w-6 text-muted-foreground/50" />
                                                                            </div>
                                                                        )}
                                                                        <div className="absolute inset-0 bg-black/10" />
                                                                    </div>
                                                                    <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 shadow-sm">
                                                                        <Loader2 className="h-4 w-4 text-primary animate-spin" />
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="text-xs font-medium text-muted-foreground">Notre outil cherche la meilleure alternative...</p>
                                                                    <p className="text-[10px] text-primary/70 font-semibold animate-pulse">
                                                                        Pourquoi pas du {displaySuggestions[carouselIndex]?.name} ?
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="flex flex-col items-center gap-2">
                                                                <HelpCircle className="h-8 w-8 text-muted-foreground/30" />
                                                                <p className="text-sm font-medium text-muted-foreground">Repas pas encore disponible</p>
                                                                {searchTerm.length > 2 && (
                                                                    <div className="mt-2 space-y-3 w-full">
                                                                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                                                                            Nous avons bien remarqué que votre repas est absent.
                                                                            Souhaitez-vous nous le signaler pour que nos modérateurs puissent l'ajouter ?
                                                                        </p>
                                                                        {!sentMissingMeal ? (
                                                                            <Button
                                                                                type="button"
                                                                                variant="secondary"
                                                                                size="sm"
                                                                                className="w-full text-xs font-bold"
                                                                                onClick={handleSendMissingMeal}
                                                                                disabled={isSubmitting}
                                                                            >
                                                                                {isSubmitting ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
                                                                                Envoyer ce repas absent
                                                                            </Button>
                                                                        ) : (
                                                                            <div className="flex items-center justify-center gap-2 text-primary font-bold text-xs p-2 bg-primary/5 rounded-lg border border-primary/20">
                                                                                <CheckCircle2 className="h-4 w-4" />
                                                                                Signalé avec succès !
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                className="w-full text-xs font-bold border-primary/20 text-primary hover:bg-primary/5"
                                                                onClick={handleFindAlternative}
                                                                disabled={isSearchingAlternative}
                                                            >
                                                                {isSearchingAlternative ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-2 h-3.5 w-3.5" />}
                                                                Trouver une alternative
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Type</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Sélectionnez" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="breakfast">Petit-déjeuner</SelectItem>
                                                    <SelectItem value="lunch">Déjeuner</SelectItem>
                                                    <SelectItem value="dinner">Dîner</SelectItem>
                                                    <SelectItem value="dessert">Dessert</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {household.length > 0 && (
                                    <FormField
                                        control={form.control}
                                        name="cookedBy"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Cuisinier</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Moi" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="">Moi</SelectItem>
                                                        {household.map(m => (
                                                            <SelectItem key={m} value={m}>{m}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>

                            <TabsContent value="later" className="mt-0 space-y-4 pt-2 border-t">
                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Date prévue</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP", { locale: fr })
                                                            ) : (
                                                                <span>Choisir une date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) =>
                                                            date < new Date(new Date().setHours(0, 0, 0, 0))
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>

                            <div className="pt-2 flex justify-end gap-2">
                                <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>Annuler</Button>
                                <Button type="submit" disabled={isSubmitting || !form.getValues().name}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {activeTab === 'today' ? 'Ajouter le repas' : 'Programmer'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </Tabs>

            {/* Conflict Confirmation Dialog */}
            {conflictDialogOpen && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-sm p-6 rounded-xl border shadow-xl space-y-4 animate-in fade-in zoom-in duration-200">
                        <div className="flex flex-col items-center text-center gap-2">
                            <Clock className="h-10 w-10 text-orange-500 bg-orange-100 p-2 rounded-full" />
                            <h3 className="font-bold text-lg">Conflit de planning</h3>
                            <p className="text-sm text-muted-foreground">{conflictMessage}</p>
                        </div>
                        <div className="flex gap-2 justify-center">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setConflictDialogOpen(false);
                                    setPendingSubmission(null);
                                    setIsSubmitting(false);
                                }}
                            >
                                Annuler
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => {
                                    if (pendingSubmission) {
                                        procceedSubmission(pendingSubmission.values, pendingSubmission.type);
                                    }
                                }}
                            >
                                Remplacer
                            </Button>
                        </div>
                    </div>
                </div>
            )}

        </DialogContent>
    );
}
