'use client';

import { useState } from 'react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { Loader2, GalleryHorizontal, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CarouselItemForm } from '../components/carousel-form';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { CarouselItem } from '@/lib/types';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

export function CarouselSection() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CarouselItem | null>(null);

  const carouselCollectionRef = useMemoFirebase(() => collection(firestore, 'carouselItems'), [firestore]);
  const { data: carouselItems, isLoading: isLoadingItems } = useCollection<CarouselItem>(carouselCollectionRef);

  const handleEdit = (item: CarouselItem) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const handleFormSubmit = (values: Omit<CarouselItem, 'id' | 'createdAt'>) => {
    if (editingItem) {
      const itemDocRef = doc(firestore, 'carouselItems', editingItem.id);
      updateDocumentNonBlocking(itemDocRef, values);
      toast({ title: "Élément modifié", description: "L'élément du carrousel a été mis à jour." });
    } else {
      addDocumentNonBlocking(carouselCollectionRef, {
        ...values,
        createdAt: serverTimestamp(),
      });
      toast({ title: "Élément ajouté", description: "Le nouvel élément a été ajouté au carrousel." });
    }
    setFormOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (itemId: string) => {
    const itemDocRef = doc(firestore, 'carouselItems', itemId);
    deleteDocumentNonBlocking(itemDocRef);
    toast({ variant: "destructive", title: "Élément supprimé" });
  };

  if (isLoadingItems) {
    return (
      <div className="flex w-full items-center justify-center p-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Éléments du carrousel</CardTitle>
          <CardDescription>Ajoutez, modifiez ou supprimez les éléments du carrousel de la page d'accueil.</CardDescription>
        </div>
        <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
          if (!isOpen) setEditingItem(null);
          setFormOpen(isOpen);
        }}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Modifier l\'élément' : 'Nouvel élément'}</DialogTitle>
              <DialogDescription>
                Remplissez les informations ci-dessous.
              </DialogDescription>
            </DialogHeader>
            <CarouselItemForm
              onSubmit={handleFormSubmit}
              initialData={editingItem}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Titre</TableHead>
              <TableHead>Sous-titre</TableHead>
              <TableHead>Lien</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {carouselItems && carouselItems.length > 0 ? (
              carouselItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Image src={item.imageUrl} alt={item.title || 'Carousel image'} width={64} height={64} className="rounded-md object-cover aspect-square" />
                  </TableCell>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.subtitle}</TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">{item.link}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible et supprimera l'élément définitivement.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Aucun élément dans le carrousel.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
