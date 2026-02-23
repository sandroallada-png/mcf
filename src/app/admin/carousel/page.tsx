
'use client';

import { useState } from 'react';
import { useUser, useFirebase, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { AppHeader } from '@/components/layout/app-header';
import { Sidebar } from '@/components/dashboard/sidebar';
import { SidebarProvider, Sidebar as AppSidebar, SidebarInset } from '@/components/ui/sidebar';
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
import { CarouselItemForm } from '@/components/admin/carousel-form';
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

export default function AdminCarouselPage() {
  const { user, isUserLoading } = useUser();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CarouselItem | null>(null);

  const carouselCollectionRef = useMemoFirebase(() => collection(firestore, 'carouselItems'), [firestore]);
  const { data: carouselItems, isLoading: isLoadingItems } = useCollection<CarouselItem>(carouselCollectionRef);

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  const { data: userProfile } = useDoc<any>(userProfileRef);

  // --- Sidebar Data ---
  const goalsCollectionRef = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'goals') : null),
    [user, firestore]
  );
  const { data: goalsData } = useCollection<{ description: string }>(goalsCollectionRef);

  const effectiveChefId = userProfile?.chefId || user?.uid;
  const allMealsCollectionRef = useMemoFirebase(
    () => (effectiveChefId ? collection(firestore, 'users', effectiveChefId, 'foodLogs') : null),
    [effectiveChefId, firestore]
  );
  const { data: allMeals } = useCollection<any>(allMealsCollectionRef);

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

  if (isUserLoading || isLoadingItems) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const sidebarProps = {
    goals: goalsData?.[0]?.description || "Manger équilibré",
    setGoals: () => { },
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
              title="Gestion du Carrousel"
              icon={<GalleryHorizontal className="h-6 w-6" />}
              user={user}
              sidebarProps={sidebarProps}
            />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
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
                          <TableCell colSpan={4} className="h-24 text-center">
                            Aucun élément dans le carrousel.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
