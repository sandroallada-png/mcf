
'use client';

import { useState, useRef, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { PlusCircle, Refrigerator, X, Sparkles, Loader2, Bot, ShoppingCart, ChefHat } from 'lucide-react';
import { useUser, useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, query, orderBy, Timestamp } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Input } from '../ui/input';
import { getRecipesFromIngredientsAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

interface FridgeItem {
    id: string;
    name: string;
}

interface RecipeSuggestion {
    name: string;
    description: string;
    missingIngredients: string[];
}

export function MainPanel() {
    const { user } = useUser();
    const router = useRouter();
    const { firestore } = useFirebase();
    const [newItem, setNewItem] = useState('');
    const [suggestions, setSuggestions] = useState<RecipeSuggestion[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [isSendingToKitchen, setIsSendingToKitchen] = useState<string | null>(null);
    const { toast } = useToast();

    const fridgeCollectionRef = useMemoFirebase(
        () => (user ? collection(firestore, 'users', user.uid, 'fridge') : null),
        [user, firestore]
    );

    const fridgeQuery = useMemoFirebase(
        () => fridgeCollectionRef ? query(fridgeCollectionRef, orderBy('createdAt', 'asc')) : null,
        [fridgeCollectionRef]
    );

    const { data: ingredients, isLoading: isLoadingIngredients } = useCollection<FridgeItem>(fridgeQuery);

    const handleAddItem = (e: FormEvent) => {
        e.preventDefault();
        if (!newItem.trim() || !fridgeCollectionRef || !user) return;
        addDocumentNonBlocking(fridgeCollectionRef, {
            name: newItem.trim(),
            userId: user.uid,
            createdAt: serverTimestamp(),
        });
        setNewItem('');
    };

    const handleRemoveItem = (itemId: string) => {
        if (!user) return;
        const itemRef = doc(firestore, 'users', user.uid, 'fridge', itemId);
        deleteDocumentNonBlocking(itemRef);
    };

    const handleGetSuggestions = async () => {
        if (!ingredients || ingredients.length === 0) return;
        setIsLoadingSuggestions(true);
        setSuggestions([]);
        const ingredientNames = ingredients.map(i => i.name);
        const { recipes, error } = await getRecipesFromIngredientsAction({ ingredients: ingredientNames });
        setIsLoadingSuggestions(false);

        if (error) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de générer des suggestions.' });
        } else {
            setSuggestions(recipes || []);
        }
    };

    const handleSendToKitchen = async (recipe: RecipeSuggestion) => {
        if (!user) return;
        setIsSendingToKitchen(recipe.name);
        try {
            const pendingCookingCollectionRef = collection(firestore, 'users', user.uid, 'pendingCookings');

            await addDocumentNonBlocking(pendingCookingCollectionRef, {
                userId: user.uid,
                name: recipe.name,
                createdAt: Timestamp.now(),
                imageHint: recipe.name,
            });

            toast({
                title: 'Recette mise en attente !',
                description: `${recipe.name} a été ajouté à votre section "En attente" dans la Cuisine.`,
            });

        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Erreur', description: e.message || 'Impossible d\'envoyer la recette.' });
        } finally {
            setIsSendingToKitchen(null);
        }
    };

    return (
        <main className="flex-1 flex flex-col overflow-hidden bg-background">
            <div className="max-w-6xl mx-auto w-full px-6 md:px-12 py-10 space-y-10">

                {/* Header Section */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="text-5xl mb-4">🧊</div>
                        <h1 className="text-4xl font-bold tracking-tight">Mon Frigo</h1>
                        <p className="text-muted-foreground text-sm max-w-2xl">
                            Gérez vos ingrédients disponibles et recevez des suggestions de recettes personnalisées par notre IA.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={handleGetSuggestions}
                            disabled={isLoadingSuggestions || !ingredients || ingredients.length === 0}
                            className="h-9 px-4 text-xs font-semibold rounded shadow-sm transition-colors"
                        >
                            {isLoadingSuggestions ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-2 h-3.5 w-3.5" />}
                            Générer des idées
                        </Button>

                        <Button
                            onClick={() => router.push('/courses')}
                            variant="outline"
                            className="h-9 px-4 text-xs font-semibold rounded shadow-sm transition-colors"
                        >
                            <ShoppingCart className="mr-2 h-3.5 w-3.5" />
                            Ma Liste de Courses
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                    {/* Ingredients Column */}
                    <div className="md:col-span-4 space-y-6">
                        <div className="flex items-center gap-2 border-b pb-2">
                            <PlusCircle className="h-4 w-4 text-muted-foreground" />
                            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Stock actuel</h2>
                        </div>

                        <form onSubmit={handleAddItem} className="space-y-4">
                            <Input
                                placeholder="Ajouter un ingrédient..."
                                className="h-9 text-sm rounded border-muted/20 focus:border-primary/50 transition-all font-medium"
                                value={newItem}
                                onChange={e => setNewItem(e.target.value)}
                            />
                        </form>

                        {isLoadingIngredients ? (
                            <div className="py-10 flex justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/20" />
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {ingredients && ingredients.length > 0 ? (
                                    ingredients.map(item => (
                                        <div key={item.id} className="group flex items-center justify-between rounded px-2 py-1.5 hover:bg-accent/40 text-sm transition-colors font-medium">
                                            <div className="flex items-center gap-2.5">
                                                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                                                <span>{item.name}</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 rounded text-muted-foreground/20 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                                                onClick={() => handleRemoveItem(item.id)}
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-10 text-center border border-dashed rounded-lg bg-accent/5">
                                        <p className="text-xs font-medium text-muted-foreground/50 uppercase tracking-widest">
                                            Votre frigo est vide
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* AI Suggestions Column */}
                    <div className="md:col-span-8 space-y-6">
                        <div className="flex items-center gap-2 border-b pb-2">
                            <Sparkles className="h-4 w-4 text-muted-foreground" />
                            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Idées de recettes</h2>
                        </div>

                        {isLoadingSuggestions ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-40 rounded-lg border bg-accent/10 animate-pulse" />
                                ))}
                            </div>
                        ) : suggestions.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {suggestions.map((recipe, index) => (
                                    <Card key={index} className="flex flex-col rounded-lg border shadow-sm hover:border-primary/20 transition-all">
                                        <CardHeader className="p-5 pb-2">
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-1">
                                                Suggestion IA
                                            </div>
                                            <CardTitle className="text-lg font-bold">{recipe.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-5 pt-2 flex-grow space-y-4">
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                {recipe.description}
                                            </p>

                                            {recipe.missingIngredients.length > 0 && (
                                                <div className="space-y-1.5">
                                                    <p className="text-[10px] font-bold uppercase text-muted-foreground/60">Manquants :</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {recipe.missingIngredients.map(ing => (
                                                            <span key={ing} className="text-[9px] font-bold bg-destructive/5 text-destructive border border-destructive/10 px-2 py-0.5 rounded">
                                                                {ing}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <Button
                                                variant="outline"
                                                className="w-full h-8 text-xs font-bold rounded mt-auto"
                                                onClick={() => handleSendToKitchen(recipe)}
                                                disabled={isSendingToKitchen === recipe.name}
                                            >
                                                {isSendingToKitchen === recipe.name ? (
                                                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                ) : (
                                                    <ChefHat className="mr-2 h-3.5 w-3.5" />
                                                )}
                                                Cuisiner cette recette
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-accent/5 border border-dashed rounded-lg text-center px-10">
                                <Bot className="h-8 w-8 text-muted-foreground/20 mb-4" />
                                <h4 className="text-sm font-bold mb-1">Aucune suggestion pour le moment</h4>
                                <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                                    Ajoutez quelques ingrédients dans votre frigo pour que l'IA puisse vous proposer des recettes.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
