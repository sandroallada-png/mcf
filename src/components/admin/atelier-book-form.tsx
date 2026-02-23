
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AtelierBook } from '@/lib/types';
import { Save, Loader2, Plus, Trash2, Image as ImageIcon, BookOpen, Clock } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { ImageUploader } from './image-uploader';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Lock, Layers } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '@/lib/utils';

const formSchema = z.object({
    name: z.string().min(2, { message: 'Le nom doit faire au moins 2 caractères.' }),
    imageUrl: z.string().url({ message: "L'URL de l'image de couverture est requise." }),
    recipe: z.string().min(10, { message: 'La recette est requise (min 10 caractères).' }),
    description: z.string().min(10, { message: 'La description est requise.' }),
    hashtags: z.string().describe("Tags séparés par des virgules"),
    price: z.number().min(0, { message: 'Le prix doit être positif.' }),
    cookingTime: z.string().min(2, { message: 'Le temps de cuisson est requis.' }),
    category: z.string().min(1, { message: 'La catégorie est requise.' }),
    galleryUrls: z.array(z.string()).max(10, { message: 'Maximum 10 photos.' }).default([]),
});

type AtelierBookFormValues = z.infer<typeof formSchema>;

interface AtelierBookFormProps {
    onSubmit: (values: any) => void;
    initialData?: Partial<AtelierBook> | null;
}

export function AtelierBookForm({ onSubmit, initialData }: AtelierBookFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const defaultValues = {
        name: initialData?.name || '',
        imageUrl: initialData?.imageUrl || '',
        recipe: initialData?.recipe || '',
        description: initialData?.description || '',
        hashtags: initialData?.hashtags?.join(', ') || '',
        price: initialData?.price || 0,
        cookingTime: (initialData as any)?.cookingTime || '45 min',
        category: (initialData as any)?.category || 'plat',
        galleryUrls: initialData?.galleryUrls || [],
    };

    const form = useForm<AtelierBookFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    useEffect(() => {
        if (initialData) {
            form.reset({
                name: initialData.name || '',
                imageUrl: initialData.imageUrl || '',
                recipe: initialData.recipe || '',
                description: initialData.description || '',
                hashtags: initialData.hashtags?.join(', ') || '',
                price: initialData.price || 0,
                cookingTime: (initialData as any).cookingTime || '45 min',
                category: (initialData as any).category || 'plat',
                galleryUrls: initialData.galleryUrls || [],
            });
        }
    }, [initialData, form]);

    const handleFormSubmit = (values: AtelierBookFormValues) => {
        setIsSubmitting(true);
        const submissionValues = {
            ...values,
            isLocked: values.price > 0,
            hashtags: values.hashtags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        };
        onSubmit(submissionValues);
        setIsSubmitting(false);
    };

    const addGalleryImages = (urls: string[]) => {
        const currentImages = form.getValues('galleryUrls') || [];
        const remainingSpace = 10 - currentImages.length;
        const newImages = urls.slice(0, remainingSpace);

        if (newImages.length > 0) {
            form.setValue('galleryUrls', [...currentImages, ...newImages]);
            form.clearErrors('galleryUrls');
        }
    };

    const addGalleryImage = (url: string) => {
        addGalleryImages([url]);
    };

    const removeGalleryImage = (index: number) => {
        const currentImages = form.getValues('galleryUrls') || [];
        form.setValue('galleryUrls', currentImages.filter((_, i) => i !== index));
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                <ScrollArea className="h-[75vh] pr-6">
                    <div className="space-y-8 pb-12">
                        {/* Section 1: Couverture et Identité */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                <ImageIcon className="h-4 w-4" />
                                Couverture du Livre
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-1">
                                    <FormField
                                        control={form.control}
                                        name="imageUrl"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <div className="aspect-[7/10] relative rounded-2xl overflow-hidden shadow-xl border-2 border-dashed border-primary/20 bg-primary/5">
                                                        <ImageUploader
                                                            initialImageUrl={field.value || ''}
                                                            onUploadSuccess={(url) => field.onChange(url)}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Titre de l'œuvre</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="ex: Les Secrets du Chef" className="h-12 text-lg font-bold rounded-xl" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="price"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Prix de vente (€)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" className="h-12 font-bold rounded-xl" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                                    </FormControl>
                                                    <FormDescription className="text-[9px]">0 pour gratuit</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="category"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                        <Layers className="h-3 w-3" />
                                                        Type de contenu
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-12 font-bold rounded-xl bg-background border-2 border-primary/10">
                                                                <SelectValue placeholder="Choisir un type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="bg-background border-2 border-primary/10">
                                                            <SelectItem value="tout" className="font-bold text-[10px] uppercase tracking-widest py-3">Tout</SelectItem>
                                                            <SelectItem value="entrée" className="font-bold text-[10px] uppercase tracking-widest py-3">Entrées</SelectItem>
                                                            <SelectItem value="plat" className="font-bold text-[10px] uppercase tracking-widest py-3">Plats</SelectItem>
                                                            <SelectItem value="dessert" className="font-bold text-[10px] uppercase tracking-widest py-3">Desserts</SelectItem>
                                                            <SelectItem value="technique" className="font-bold text-[10px] uppercase tracking-widest py-3">Techniques</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="cookingTime"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                        <Clock className="h-3 w-3" />
                                                        Temps de préparation
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="ex: 45 min" className="h-12 font-bold rounded-xl" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="flex flex-col justify-center rounded-xl border-2 border-dashed p-3 bg-muted/30">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <span className="text-[8px] font-black uppercase tracking-tight text-primary flex items-center gap-1">
                                                        <Lock className="h-2 w-2" />
                                                        Statut de Verrouillage
                                                    </span>
                                                    <p className="text-[7px] font-medium text-muted-foreground leading-tight">
                                                        Automatique : Un cadenas sera visible si le prix est supérieur à 0€.
                                                    </p>
                                                </div>
                                                <Badge className={cn(
                                                    "text-[8px] font-black",
                                                    form.watch('price') > 0 ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                                )} variant="outline">
                                                    {form.watch('price') > 0 ? 'LOCKED' : 'OPEN'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Contenu et Recette */}
                        <div className="space-y-4 pt-4 border-t border-dashed">
                            <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Détails du Volume
                            </h3>
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Information / Résumé</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Une immersion dans les saveurs..." className="min-h-[100px] rounded-xl" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="recipe"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Secret de Fabrication (Markdown)</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="# Ingrédients\n- 1kg de..." className="min-h-[200px] rounded-2xl font-mono text-sm leading-relaxed" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="hashtags"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Hashtags (séparés par des virgules)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="gastronomie, healthy, rapide" className="h-12 font-bold rounded-xl" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Section 3: Galerie de Photos */}
                        <div className="space-y-4 pt-4 border-t border-dashed">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Galerie des Photos du Plat (Optionnel)
                                </h3>
                                <p className="text-[10px] font-medium text-muted-foreground mt-1">Illustrez les étapes ou le dressage final. Laissez vide si non applicable.</p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {form.watch('galleryUrls')?.map((url, index) => (
                                    <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-primary/10 shadow-lg">
                                        <img src={url} alt={`Repas ${index + 1}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                                            <button
                                                type="button"
                                                onClick={() => removeGalleryImage(index)}
                                                className="bg-destructive text-white p-2 rounded-xl shadow-xl hover:scale-110 active:scale-95 transition-all"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {(form.watch('galleryUrls')?.length || 0) < 10 && (
                                    <div className="aspect-square border-2 border-dashed border-primary/20 rounded-xl flex flex-col items-center justify-center p-2 text-center hover:bg-primary/5 transition-all group overflow-hidden">
                                        <ImageUploader
                                            initialImageUrl=""
                                            onUploadSuccess={addGalleryImage}
                                            onMultipleUploadSuccess={addGalleryImages}
                                            allowMultiple={true}
                                        />
                                    </div>
                                )}
                            </div>
                            <FormMessage className="text-xs font-bold">{form.formState.errors.galleryUrls?.message}</FormMessage>
                        </div>
                    </div>
                </ScrollArea>
                <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                    {initialData?.id ? 'Mettre à jour le livre' : 'Publier dans l\'Atelier'}
                </Button>
            </form>
        </Form>
    );
}
