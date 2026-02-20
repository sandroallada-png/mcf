
'use client';

import { useState, useMemo } from 'react';
import { useUser, useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { AppHeader } from '@/components/layout/app-header';
import { Sidebar } from '@/components/dashboard/sidebar';
import { SidebarProvider, Sidebar as AppSidebar, SidebarInset } from '@/components/ui/sidebar';
import { Loader2, Ticket, PlusCircle, Edit, Trash2 } from 'lucide-react';
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
import { PromotionForm } from '@/components/admin/promotion-form';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Promotion } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
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

export default function AdminPromotionsPage() {
  const { user, isUserLoading } = useUser();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  const promotionsCollectionRef = useMemoFirebase(() => collection(firestore, 'promotions'), [firestore]);
  const { data: promotions, isLoading: isLoadingPromotions } = useCollection<Promotion>(promotionsCollectionRef);

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingPromotion(null);
    setFormOpen(true);
  };

  const handleFormSubmit = (values: Omit<Promotion, 'id' | 'createdAt'>) => {
    if (editingPromotion) {
      // Update existing promotion
      const promoDocRef = doc(firestore, 'promotions', editingPromotion.id);
      updateDocumentNonBlocking(promoDocRef, values);
      toast({ title: "Promotion modifiée", description: "La promotion a été mise à jour avec succès." });
    } else {
      // Add new promotion
      addDocumentNonBlocking(promotionsCollectionRef, {
        ...values,
        createdAt: serverTimestamp(),
      });
      toast({ title: "Promotion ajoutée", description: "La nouvelle promotion a été créée." });
    }
    setFormOpen(false);
    setEditingPromotion(null);
  };
  
  const handleDelete = (promotionId: string) => {
    const promoDocRef = doc(firestore, 'promotions', promotionId);
    deleteDocumentNonBlocking(promoDocRef);
    toast({ variant: "destructive", title: "Promotion supprimée" });
  };

  if (isUserLoading || isLoadingPromotions) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const sidebarProps = {
    goals: "Admin Goals",
    setGoals: () => {},
    meals: [],
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
              title="Gestion des Promotions"
              icon={<Ticket className="h-6 w-6" />}
              user={user}
              sidebarProps={sidebarProps}
            />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Liste des promotions</CardTitle>
                    <CardDescription>Ajoutez, modifiez ou supprimez des promotions.</CardDescription>
                  </div>
                  <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
                    if (!isOpen) setEditingPromotion(null);
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
                        <DialogTitle>{editingPromotion ? 'Modifier la promotion' : 'Nouvelle promotion'}</DialogTitle>
                        <DialogDescription>
                            Remplissez les informations ci-dessous pour {editingPromotion ? 'mettre à jour' : 'créer'} une promotion.
                        </DialogDescription>
                      </DialogHeader>
                      <PromotionForm
                        onSubmit={handleFormSubmit}
                        initialData={editingPromotion}
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
                        <TableHead>Description</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {promotions && promotions.length > 0 ? (
                        promotions.map((promo) => (
                          <TableRow key={promo.id}>
                            <TableCell>
                              <Image src={promo.imageUrl} alt={promo.title} width={64} height={64} className="rounded-md object-cover aspect-square" />
                            </TableCell>
                            <TableCell className="font-medium">{promo.title}</TableCell>
                            <TableCell className="text-muted-foreground max-w-xs truncate">{promo.description}</TableCell>
                            <TableCell>
                              <Badge variant={promo.isActive ? 'default' : 'secondary'}>
                                {promo.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(promo)}>
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
                                      Cette action est irréversible et supprimera la promotion définitivement.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(promo.id)} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            Aucune promotion trouvée.
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
