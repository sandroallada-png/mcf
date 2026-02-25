
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
import type { Dish } from '@/lib/types';
import { Save, Loader2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ImageUploader } from './image-uploader';
import { Textarea } from '../ui/textarea';

const dishCategories = [
  'Plat Quotidien', 'Plat Classique', 'Healthy', 'Prise de Masse', 'Pâtes',
  'Poulet', 'Poisson', 'Cuisine du Monde', 'Plat Unique', 'Sur le Pouce',
  'Cuisine Africaine', 'Cuisine Antillaise'
];

const dishOrigins = [
  'Africaine', 'Américaine', 'Antillaise', 'Asiatique', 'Chinoise', 'Espagnole',
  'Française', 'Grecque', 'Indienne', 'Italienne', 'Japonaise', 'Coréenne',
  'Libanaise', 'Mexicaine', 'Thaïlandaise', 'Vietnamienne', 'Mondiale'
];

const dishTypes = ['Aucun', 'Végétarien', 'Vegan', 'Sans gluten', 'Sans lactose'];

const formSchema = z.object({
  name: z.string().min(2, { message: 'Le nom doit faire au moins 2 caractères.' }),
  category: z.string().min(1, { message: 'La catégorie est requise.' }),
  origin: z.string().min(1, { message: "Le pays est requis." }),
  cookingTime: z.string().min(1, { message: 'Le temps de cuisson est requis.' }),
  calories: z.preprocess((val) => (val === '' ? undefined : Number(val)), z.number().optional()),
  imageUrl: z.string().url({ message: "L'URL de l'image est requise." }).optional().or(z.literal('')),
  type: z.string().optional(),
  recipe: z.string().optional(),
});

type DishFormValues = z.infer<typeof formSchema>;

interface DishFormProps {
  onSubmit: (values: DishFormValues) => void;
  initialData?: Partial<Dish> | null;
}

export function DishForm({ onSubmit, initialData }: DishFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = initialData
    ? {
      name: initialData.name || '',
      category: initialData.category || '',
      origin: initialData.origin || '',
      cookingTime: initialData.cookingTime || '',
      calories: initialData.calories || undefined,
      imageUrl: initialData.imageUrl || '',
      type: initialData.type || 'Aucun',
      recipe: initialData.recipe || '',
    }
    : {
      name: '',
      category: '',
      origin: '',
      cookingTime: '',
      calories: undefined,
      imageUrl: '',
      type: 'Aucun',
      recipe: '',
    };

  const form = useForm<DishFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    const newDefaultValues = initialData
      ? {
        name: initialData.name || '',
        category: initialData.category || '',
        origin: initialData.origin || '',
        cookingTime: initialData.cookingTime || '',
        calories: initialData.calories || undefined,
        imageUrl: initialData.imageUrl || '',
        type: initialData.type || 'Aucun',
        recipe: initialData.recipe || '',
      }
      : {
        name: '',
        category: '',
        origin: '',
        cookingTime: '',
        calories: undefined,
        imageUrl: '',
        type: 'Aucun',
        recipe: '',
      };
    form.reset(newDefaultValues);
  }, [initialData, form]);

  const handleFormSubmit = (values: DishFormValues) => {
    setIsSubmitting(true);
    const submissionValues = {
      ...values,
      type: values.type === 'Aucun' ? '' : values.type,
    };
    onSubmit(submissionValues);
    setIsSubmitting(false);
  };

  const handleImageUpload = (url: string) => {
    form.setValue('imageUrl', url);
    form.clearErrors('imageUrl');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <ScrollArea className="h-[65vh] pr-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image du plat</FormLabel>
                  <FormControl>
                    <ImageUploader
                      initialImageUrl={field.value || ''}
                      onUploadSuccess={handleImageUpload}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du plat</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Pâtes bolognaise" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de plat</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dishTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une catégorie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dishCategories.sort().map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="origin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pays</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un pays" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dishOrigins.sort().map(orig => <SelectItem key={orig} value={orig}>{orig}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cookingTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temps de cuisson</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: 20 min" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="calories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calories (kcal)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="ex: 350"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormDescription>Laisser vide pour une génération auto via IA lors du service.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="recipe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recette</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Entrez la recette au format Markdown..."
                      className="min-h-48"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Utilisez le Markdown pour formater la recette (ex: # Titre, - Ingrédient, 1. Étape).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </ScrollArea>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {initialData?.name ? 'Enregistrer les modifications' : 'Créer le plat'}
        </Button>
      </form>
    </Form>
  );
}
