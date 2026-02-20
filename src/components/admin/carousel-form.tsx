
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
import type { CarouselItem } from '@/lib/types';
import { Save, Loader2 } from 'lucide-react';
import { ImageUploader } from './image-uploader';
import { ScrollArea } from '../ui/scroll-area';

const formSchema = z.object({
  title: z.string().min(2, { message: 'Le titre doit faire au moins 2 caractères.' }).optional(),
  imageUrl: z.string().url({ message: "L'URL de l'image est requise." }),
  link: z.string().url({ message: 'Veuillez entrer une URL valide.' }).optional().or(z.literal('')),
});

type CarouselFormValues = z.infer<typeof formSchema>;

interface CarouselItemFormProps {
  onSubmit: (values: CarouselFormValues) => void;
  initialData?: CarouselItem | null;
}

export function CarouselItemForm({ onSubmit, initialData }: CarouselItemFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = initialData
    ? {
        title: initialData.title || '',
        imageUrl: initialData.imageUrl,
        link: initialData.link || '',
      }
    : {
        title: '',
        imageUrl: '',
        link: '',
      };

  const form = useForm<CarouselFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  useEffect(() => {
    form.reset(defaultValues);
  }, [initialData, form]);

  const handleFormSubmit = (values: CarouselFormValues) => {
    setIsSubmitting(true);
    onSubmit(values);
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
                            <FormLabel>Image</FormLabel>
                            <FormControl>
                            <ImageUploader 
                                initialImageUrl={field.value}
                                onUploadSuccess={handleImageUpload}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            
                <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Titre (optionnel)</FormLabel>
                    <FormControl>
                        <Input placeholder="ex: Astuce pour manger bien" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Lien (optionnel)</FormLabel>
                    <FormControl>
                        <Input placeholder="https://exemple.com/article" {...field} />
                    </FormControl>
                    <FormDescription>URL vers laquelle l'élément redirigera.</FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
        </ScrollArea>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {initialData ? 'Enregistrer les modifications' : 'Créer l\'élément'}
        </Button>
      </form>
    </Form>
  );
}
