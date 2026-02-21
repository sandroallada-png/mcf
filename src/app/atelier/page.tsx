
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    SidebarProvider,
    Sidebar as AppSidebar,
    SidebarInset,
} from '@/components/ui/sidebar';
import { Sidebar } from '@/components/dashboard/sidebar';
import { useUser, useFirebase, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, query, limit, updateDoc, Timestamp, orderBy, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Meal, SaveUserRecipeInput, Dish, Cooking } from '@/lib/types';
import { Loader2, UtensilsCrossed, Save, Share2, ChefHat, Sprout, MapPin, ClockIcon, BookOpen, PlusCircle, Calendar, Search, X } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageUploader } from '@/components/admin/image-uploader';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { SuggestionDialog } from '@/components/cuisine/suggestion-dialog';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const recipeFormSchema = z.object({
    name: z.string().min(3, "Le nom doit faire au moins 3 caractères."),
    description: z.string().optional(),
    type: z.enum(['breakfast', 'lunch', 'dinner', 'dessert']),
    cookingTime: z.string().min(1, "Le temps de cuisson est requis."),
    calories: z.number().min(0, "Les calories doivent être un nombre positif."),
    recipe: z.string().min(10, "Les instructions sont requises."),
    imageUrl: z.string().url("Une URL d'image valide est requise."),
    imageHint: z.string().min(2, "Un indice d'image est requis."),
    plannedFor: z.date(),
    share: z.boolean().default(false),
});

type RecipeFormValues = z.infer<typeof recipeFormSchema>;

export default function AtelierPage() {
    const { user, isUserLoading } = useUser();
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [selectedDish, setSelectedDish] = useState<Dish | Cooking | null>(null);
    const [isSuggestionDialogOpen, setIsSuggestionDialogOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const form = useForm<RecipeFormValues>({
        resolver: zodResolver(recipeFormSchema),
        defaultValues: {
            name: '',
            description: '',
            type: 'lunch',
            cookingTime: '30 min',
            calories: 450,
            recipe: '',
            imageUrl: '',
            imageHint: '',
            plannedFor: new Date(),
            share: false,
        },
    });

    const { handleSubmit, control, setValue, formState: { errors } } = form;

    // --- Data fetching ---
    const allMealsCollectionRef = useMemoFirebase(
        () => (user ? collection(firestore, 'users', user.uid, 'foodLogs') : null),
        [user, firestore]
    );
    const { data: allMeals, isLoading: isLoadingAllMeals } = useCollection<Omit<Meal, 'id'>>(allMealsCollectionRef);

    const goalsCollectionRef = useMemoFirebase(
        () => (user ? collection(firestore, 'users', user.uid, 'goals') : null),
        [user, firestore]
    );
    const singleGoalQuery = useMemoFirebase(
        () => goalsCollectionRef ? query(goalsCollectionRef, limit(1)) : null,
        [goalsCollectionRef]
    )
    const { data: goalsData, isLoading: isLoadingGoals } = useCollection<{ description: string }>(singleGoalQuery);

    const dishesCollectionRef = useMemoFirebase(() => collection(firestore, 'dishes'), [firestore]);
    const { data: dishes, isLoading: isLoadingDishes } = useCollection<Dish>(dishesCollectionRef);

    const userCookingCollectionRef = useMemoFirebase(() => (user ? collection(firestore, `users/${user.uid}/cooking`) : null), [user, firestore]);
    const userCookingQuery = useMemoFirebase(() => (userCookingCollectionRef ? query(userCookingCollectionRef, orderBy('createdAt', 'desc')) : null), [userCookingCollectionRef]);
    const { data: userCookingItems, isLoading: isLoadingUserCooking } = useCollection<Cooking>(userCookingQuery);

    const [goals, setGoals] = useState('Perdre du poids, manger plus sainement et réduire ma consommation de sucre.');
    const [goalId, setGoalId] = useState<string | null>(null);

    const filteredDishes = useMemo(() => {
        if (!dishes) return [];
        return dishes.filter(dish =>
            dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dish.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dish.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dish.origin?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [dishes, searchTerm]);

    const filteredUserCookingItems = useMemo(() => {
        if (!userCookingItems) return [];
        return userCookingItems.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.type?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [userCookingItems, searchTerm]);

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

    const onFormSubmit = async (data: RecipeFormValues) => {
        if (!user) return;
        setIsSaving(true);

        const recipeData: SaveUserRecipeInput = {
            ...data,
            plannedFor: Timestamp.fromDate(data.plannedFor),
        };

        try {
            const cookingCollectionRef = collection(firestore, 'users', user.uid, 'cooking');

            // Save to user's personal 'cooking' collection
            const cookingDocPromise = addDocumentNonBlocking(cookingCollectionRef, {
                ...recipeData,
                userId: user.uid,
                createdAt: serverTimestamp(),
            });

            let publicationPromise = Promise.resolve(null);
            if (data.share) {
                const contributionsCollectionRef = collection(firestore, 'userContributions');
                publicationPromise = addDocumentNonBlocking(contributionsCollectionRef, {
                    name: recipeData.name,
                    type: recipeData.type,
                    calories: recipeData.calories,
                    recipe: recipeData.recipe,
                    imageUrl: recipeData.imageUrl,
                    authorId: user.uid,
                    authorName: user.displayName || 'Anonyme',
                    status: 'pending',
                    createdAt: serverTimestamp(),
                });
            }

            await Promise.all([cookingDocPromise, publicationPromise]);

            toast({
                title: "Recette enregistrée !",
                description: "Votre nouvelle recette a été ajoutée à votre espace Cuisine.",
            });
            form.reset();
            setIsFormOpen(false);

        } catch (error) {
            console.error("Failed to save recipe:", error);
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Impossible d'enregistrer la recette. Veuillez réessayer.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleShowRecipe = (item: Dish | Cooking) => {
        setSelectedDish(item);
        setIsSuggestionDialogOpen(true);
    };

    const handleAcceptSuggestion = (meal: any, date: Date) => {
        // This is a placeholder function to satisfy the SuggestionDialog component
        // In this context, it's just for viewing, so we can just close the dialog.
        console.log("Viewing meal", meal, date);
        setIsSuggestionDialogOpen(false);
    }

    const isLoading = isUserLoading || isLoadingAllMeals || isLoadingGoals || isLoadingDishes || isLoadingUserCooking || !user;

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
        <div className="h-screen w-full bg-background font-body">
            <SidebarProvider>
                <AppSidebar collapsible="icon" className="w-80 peer hidden md:block" variant="sidebar">
                    <Sidebar {...sidebarProps} />
                </AppSidebar>
                <SidebarInset>
                    <div className="flex h-full flex-1 flex-col">
                        <AppHeader
                            title="Atelier culinaire"
                            icon={<UtensilsCrossed className="h-6 w-6" />}
                            user={user}
                            sidebarProps={sidebarProps}
                        />
                        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
                            {/* Hero Section */}
                            <div className="relative rounded-3xl overflow-hidden bg-primary/5 border-2 border-primary/10 p-6 md:p-12 group">
                                <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-primary/10 blur-[60px] md:blur-[100px] -mr-32 -mt-32 md:-mr-48 md:-mt-48 group-hover:scale-125 transition-transform duration-1000" />

                                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-12">
                                    <div className="w-24 h-24 md:w-48 md:h-48 bg-white/50 dark:bg-black/20 rounded-2xl shadow-2xl p-4 md:p-6 flex items-center justify-center backdrop-blur-md border border-white/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                        <ChefHat className="w-full h-full text-primary drop-shadow-lg" />
                                    </div>
                                    <div className="text-center md:text-left space-y-3 md:space-y-4">
                                        <Badge variant="outline" className="px-3 py-0.5 md:px-4 md:py-1 rounded-full border-primary/20 bg-primary/5 text-primary text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                                            Espace Création
                                        </Badge>
                                        <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">
                                            Atelier du Chef
                                        </h2>
                                        <p className="text-sm md:text-lg text-muted-foreground font-medium max-w-xl leading-relaxed">
                                            Donnez vie à vos inspirations culinaires. Explorez nos signatures ou immortalisez vos créations.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                                <div className="relative flex-1 group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    </div>
                                    <Input
                                        type="text"
                                        placeholder="Rechercher une recette, un ingrédient ou une origine..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="h-14 pl-12 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/20 focus:bg-background transition-all font-medium text-base shadow-sm"
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center hover:opacity-70 transition-opacity"
                                        >
                                            <X className="h-4 w-4 text-muted-foreground" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <Tabs defaultValue="chef_recipes" className="w-full">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                                    <TabsList className="w-full md:w-auto h-12 md:h-14 p-1 bg-muted/50 backdrop-blur-sm rounded-2xl border border-white/5 shadow-inner">
                                        <TabsTrigger value="chef_recipes" className="flex-1 md:flex-none px-4 md:px-8 rounded-xl font-black text-xs md:text-sm data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all">
                                            Signature Chef
                                        </TabsTrigger>
                                        <TabsTrigger value="my_recipes" className="flex-1 md:flex-none px-4 md:px-8 rounded-xl font-black text-xs md:text-sm data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all">
                                            Mes Créations
                                        </TabsTrigger>
                                    </TabsList>

                                    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="w-full md:w-auto h-12 md:h-14 px-8 rounded-2xl font-black shadow-xl shadow-primary/20 group relative overflow-hidden transition-all hover:scale-105 active:scale-95">
                                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                                <PlusCircle className="mr-2 h-5 w-5" />
                                                Nouvelle Recette
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-4xl rounded-3xl border-2 shadow-3xl bg-background/95 backdrop-blur-xl">
                                            <DialogHeader className="p-4">
                                                <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3 text-primary">
                                                    <ChefHat className="h-6 w-6" />
                                                    Nouvelle Création
                                                </DialogTitle>
                                                <DialogDescription className="text-muted-foreground font-medium">
                                                    Partagez votre savoir-faire culinaire avec la communauté Cook Flex.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto px-4 pb-4 scrollbar-hide">
                                                <Controller
                                                    name="imageUrl"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div className="space-y-3">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Visuel du plat</Label>
                                                            <div className="rounded-3xl border-2 border-dashed border-primary/20 overflow-hidden bg-primary/5">
                                                                <ImageUploader
                                                                    initialImageUrl={field.value}
                                                                    onUploadSuccess={(url) => setValue('imageUrl', url, { shouldValidate: true })}
                                                                />
                                                            </div>
                                                            {errors.imageUrl && <p className="text-xs font-bold text-destructive">{errors.imageUrl.message}</p>}
                                                        </div>
                                                    )}
                                                />

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <Controller
                                                        name="name"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <div className="space-y-2">
                                                                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 pl-1">Nom de la recette</Label>
                                                                <Input id="name" placeholder="Ex: Risotto aux truffes..." className="h-12 rounded-xl bg-muted/30 border-2 focus:bg-background" {...field} />
                                                                {errors.name && <p className="text-xs font-bold text-destructive">{errors.name.message}</p>}
                                                            </div>
                                                        )}
                                                    />
                                                    <Controller
                                                        name="description"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <div className="space-y-2">
                                                                <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 pl-1">Description courte</Label>
                                                                <Input id="description" placeholder="Une explosion de saveurs bretonnes..." className="h-12 rounded-xl bg-muted/30 border-2 focus:bg-background" {...field} />
                                                            </div>
                                                        )}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <Controller
                                                        name="type"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <div className="space-y-2">
                                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 pl-1">Moment idéal</Label>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-2">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="rounded-2xl border-2 shadow-2xl">
                                                                        <SelectItem value="breakfast">Petit-déjeuner</SelectItem>
                                                                        <SelectItem value="lunch">Déjeuner</SelectItem>
                                                                        <SelectItem value="dinner">Dîner</SelectItem>
                                                                        <SelectItem value="dessert">Dessert</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        )}
                                                    />
                                                    <Controller
                                                        name="cookingTime"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <div className="space-y-2">
                                                                <Label htmlFor="cookingTime" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 pl-1">Temps de cuisson</Label>
                                                                <div className="relative">
                                                                    <ClockIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                                    <Input id="cookingTime" placeholder="45 min" className="h-12 pl-11 rounded-xl bg-muted/30 border-2 focus:bg-background" {...field} />
                                                                </div>
                                                                {errors.cookingTime && <p className="text-xs font-bold text-destructive">{errors.cookingTime.message}</p>}
                                                            </div>
                                                        )}
                                                    />
                                                    <Controller
                                                        name="calories"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <div className="space-y-2">
                                                                <Label htmlFor="calories" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 pl-1">Calories estimées</Label>
                                                                <Input id="calories" type="number" className="h-12 rounded-xl bg-muted/30 border-2 focus:bg-background" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                                                                {errors.calories && <p className="text-xs font-bold text-destructive">{errors.calories.message}</p>}
                                                            </div>
                                                        )}
                                                    />
                                                </div>

                                                <Controller
                                                    name="recipe"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div className="space-y-2">
                                                            <Label htmlFor="recipe" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 pl-1">Instructions détaillées</Label>
                                                            <Textarea
                                                                id="recipe"
                                                                placeholder="Partagez vos étapes secrètes ici..."
                                                                className="min-h-48 rounded-2xl bg-muted/30 border-2 focus:bg-background resize-none focus:ring-0"
                                                                {...field}
                                                            />
                                                            {errors.recipe && <p className="text-xs font-bold text-destructive">{errors.recipe.message}</p>}
                                                        </div>
                                                    )}
                                                />

                                                <Controller
                                                    name="imageHint"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div className="space-y-2">
                                                            <Label htmlFor="imageHint" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 pl-1">Mots-clés visuels</Label>
                                                            <Input id="imageHint" placeholder="Ex: creamy risotto truffle mushrooms" className="h-12 rounded-xl bg-muted/30 border-2 focus:bg-background" {...field} />
                                                            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-40 px-1 italic">Indice pour l'IA en cas d'erreur visuelle (Anglais recommandé).</p>
                                                            {errors.imageHint && <p className="text-xs font-bold text-destructive">{errors.imageHint.message}</p>}
                                                        </div>
                                                    )}
                                                />

                                                <Controller
                                                    name="share"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div className="flex items-center space-x-4 rounded-2xl border-2 bg-primary/[0.03] border-primary/10 p-5 transition-all hover:bg-primary/[0.05]">
                                                            <Checkbox id="share" checked={field.value} onCheckedChange={field.onChange} className="h-6 w-6 rounded-lg border-2" />
                                                            <Label htmlFor="share" className="flex flex-col cursor-pointer">
                                                                <span className="font-black tracking-tight text-primary">Partager l'expertise</span>
                                                                <span className="text-xs font-medium text-muted-foreground mt-1">Votre recette sera examinée pour rejoindre nos signatures.</span>
                                                            </Label>
                                                        </div>
                                                    )}
                                                />

                                                <Button type="submit" disabled={isSaving} className="w-full h-16 rounded-2xl text-lg font-black shadow-2xl shadow-primary/20 group relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                                                    {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                                                    Enregistrer dans l'Atelier
                                                </Button>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                <TabsContent value="my_recipes" className="mt-0 focus-visible:ring-0 outline-none">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                        {isLoadingUserCooking ? (
                                            Array.from({ length: 3 }).map((_, i) => (
                                                <div key={i} className="aspect-[4/5] sm:aspect-square md:aspect-[4/5] w-full bg-muted/50 rounded-3xl animate-shimmer border-2" />
                                            ))
                                        ) : filteredUserCookingItems && filteredUserCookingItems.length > 0 ? (
                                            filteredUserCookingItems.map((item) => (
                                                <Card key={item.id} className="group relative aspect-video sm:aspect-square md:aspect-[4/5] rounded-3xl border-2 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden bg-background/50 backdrop-blur-sm">
                                                    <div className="absolute inset-0 z-0">
                                                        <Image
                                                            src={item.imageUrl || `https://picsum.photos/seed/${item.name.replace(/\s/g, '-')}/400/500`}
                                                            alt={item.name}
                                                            fill
                                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                            data-ai-hint={item.imageHint}
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 md:opacity-40 group-hover:opacity-80 transition-opacity duration-500" />
                                                    </div>

                                                    <CardContent className="relative z-10 h-full flex flex-col justify-end p-5 md:p-8 gap-3 md:gap-4">
                                                        <div className="space-y-1 md:space-y-2 translate-y-2 md:translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                                            <Badge variant="secondary" className="bg-primary/20 backdrop-blur-md text-white border-white/10 text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2 py-0.5 md:px-3 md:py-1">
                                                                {item.type || 'Création'}
                                                            </Badge>
                                                            <CardTitle className="text-xl md:text-3xl font-black text-white tracking-tight leading-tight">
                                                                {item.name}
                                                            </CardTitle>
                                                            <div className="flex items-center gap-3 md:gap-4 text-white/60 text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                                                                <div className="flex items-center gap-1.5 md:gap-2">
                                                                    <ClockIcon className="h-2.5 w-2.5 md:h-3 md:w-3" />
                                                                    <span>{item.cookingTime || 'Planifié'}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 md:gap-2">
                                                                    <Calendar className="h-2.5 w-2.5 md:h-3 md:w-3" />
                                                                    <span>{item.plannedFor ? format(item.plannedFor.toDate(), 'd MMM', { locale: fr }) : 'Chef'}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100 hidden md:block">
                                                            <Button
                                                                variant="secondary"
                                                                className="w-full h-10 md:h-12 rounded-xl font-black bg-white/10 hover:bg-white text-white hover:text-primary backdrop-blur-md border border-white/20 shadow-xl"
                                                                onClick={() => handleShowRecipe(item)}
                                                                disabled={!item.recipe}
                                                            >
                                                                <BookOpen className="mr-2 h-4 w-4" />
                                                                Découvrir
                                                            </Button>
                                                        </div>

                                                        {/* Mobile touch trigger */}
                                                        <div className="md:hidden">
                                                            <Button
                                                                variant="secondary"
                                                                className="w-full h-10 rounded-xl font-black bg-white/20 backdrop-blur-md text-white border-white/10"
                                                                onClick={() => handleShowRecipe(item)}
                                                                disabled={!item.recipe}
                                                            >
                                                                Voir recette
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))
                                        ) : (
                                            <div className="col-span-full py-24 text-center space-y-6 bg-primary/[0.03] border-2 border-dashed border-primary/20 rounded-3xl">
                                                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                    <ChefHat className="h-10 w-10 text-primary opacity-40" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="text-2xl font-black tracking-tight">Aucun chef-d'œuvre à l'horizon</h3>
                                                    <p className="text-muted-foreground font-medium">Capturez vos inspirations culinaires pour les retrouver ici.</p>
                                                </div>
                                                <Button onClick={() => setIsFormOpen(true)} className="h-12 px-8 rounded-xl font-black">
                                                    Créer ma première recette
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="chef_recipes" className="mt-0 focus-visible:ring-0 outline-none">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                        {isLoadingDishes ? (
                                            Array.from({ length: 6 }).map((_, i) => (
                                                <div key={i} className="aspect-[4/5] sm:aspect-square md:aspect-[4/5] w-full bg-muted/50 rounded-3xl animate-shimmer border-2" />
                                            ))
                                        ) : (
                                            filteredDishes?.map((dish) => (
                                                <Card key={dish.id} className="group relative aspect-video sm:aspect-square md:aspect-[4/5] rounded-3xl border-2 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden bg-background/50 backdrop-blur-sm">
                                                    <div className="absolute inset-0 z-0">
                                                        <Image
                                                            src={dish.imageUrl || `https://picsum.photos/seed/${dish.name.replace(/\s/g, '-')}/400/500`}
                                                            alt={dish.name}
                                                            fill
                                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-70 md:opacity-50 group-hover:opacity-90 transition-opacity duration-500" />
                                                    </div>

                                                    <CardContent className="relative z-10 h-full flex flex-col justify-end p-5 md:p-8 gap-3 md:gap-4">
                                                        <div className="space-y-2 md:space-y-3 translate-y-2 md:translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                                                            <div className="flex flex-wrap gap-1.5 md:gap-2">
                                                                <Badge variant="secondary" className="bg-primary text-white border-none text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 md:px-3 md:py-1 animate-pulse">
                                                                    Signature
                                                                </Badge>
                                                                <Badge variant="outline" className="bg-white/10 backdrop-blur-md text-white border-white/20 text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 md:px-3 md:py-1">
                                                                    {dish.category}
                                                                </Badge>
                                                            </div>

                                                            <CardTitle className="text-xl md:text-3xl font-black text-white tracking-tight leading-tight">
                                                                {dish.name}
                                                            </CardTitle>

                                                            <div className="flex flex-wrap items-center gap-x-3 md:gap-x-4 gap-y-1 md:gap-y-2 text-white/60 text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em]">
                                                                <div className="flex items-center gap-1.5 md:gap-2">
                                                                    <MapPin className="h-2.5 w-2.5 md:h-3 md:w-3 text-primary" />
                                                                    <span className="truncate max-w-[80px] md:max-w-none">{dish.origin || 'Monde'}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 md:gap-2">
                                                                    <ClockIcon className="h-2.5 w-2.5 md:h-3 md:w-3 text-primary" />
                                                                    <span>{dish.cookingTime}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 md:gap-2">
                                                                    <Sprout className="h-2.5 w-2.5 md:h-3 md:w-3 text-primary" />
                                                                    <span>{dish.type || 'Sain'}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="opacity-0 group-hover:opacity-100 translate-y-4 md:translate-y-8 group-hover:translate-y-0 transition-all duration-500 delay-150 hidden md:block">
                                                            <Button
                                                                className="w-full h-12 md:h-14 rounded-2xl font-black bg-primary border-none shadow-2xl shadow-primary/40 relative overflow-hidden group/btn"
                                                                onClick={() => handleShowRecipe(dish)}
                                                                disabled={!dish.recipe}
                                                            >
                                                                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                                                                <BookOpen className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                                                                Recette
                                                            </Button>
                                                        </div>

                                                        {/* Mobile button */}
                                                        <div className="md:hidden mt-2">
                                                            <Button
                                                                className="w-full h-10 rounded-xl font-black bg-primary border-none shadow-lg text-white text-xs"
                                                                onClick={() => handleShowRecipe(dish)}
                                                                disabled={!dish.recipe}
                                                            >
                                                                Voir recette
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </main>
                    </div>
                </SidebarInset>
            </SidebarProvider>
            {selectedDish && (
                <SuggestionDialog
                    suggestion={{
                        name: selectedDish.name,
                        calories: 'calories' in selectedDish ? selectedDish.calories : Math.floor(Math.random() * 300) + 300,
                        cookingTime: selectedDish.cookingTime,
                        type: ('type' in selectedDish && selectedDish.type ? selectedDish.type.toLowerCase() : 'lunch') as any,
                        imageHint: 'imageHint' in selectedDish ? selectedDish.imageHint || `${selectedDish.name}` : `${'category' in selectedDish ? selectedDish.category : ''} ${'origin' in selectedDish ? selectedDish.origin : ''}`,
                        imageUrl: selectedDish.imageUrl,
                        recipe: 'recipe' in selectedDish ? selectedDish.recipe : undefined,
                    }}
                    isOpen={isSuggestionDialogOpen}
                    onClose={() => {
                        setIsSuggestionDialogOpen(false);
                        setSelectedDish(null);
                    }}
                    onAccept={handleAcceptSuggestion}
                />
            )}
        </div>
    );
}
