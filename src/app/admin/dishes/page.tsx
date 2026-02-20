
'use client';

import { useState } from 'react';
import { useUser, useFirebase, useCollection, useMemoFirebase, type WithId } from '@/firebase';
import { collection, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { AppHeader } from '@/components/layout/app-header';
import { Sidebar } from '@/components/dashboard/sidebar';
import { SidebarProvider, Sidebar as AppSidebar, SidebarInset } from '@/components/ui/sidebar';
import { Loader2, Utensils, PlusCircle, Edit, Trash2, CheckCircle, XCircle, Upload } from 'lucide-react';
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
import { DishForm } from '@/components/admin/dish-form';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Dish, UserContribution } from '@/lib/types';
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
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BulkDishImporter } from '@/components/admin/bulk-dish-importer';

export default function AdminDishesPage() {
  const { user, isUserLoading } = useUser();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [isFormOpen, setFormOpen] = useState(false);
  const [isImportOpen, setImportOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Partial<Dish> | null>(null);
  const [contributionToUpdate, setContributionToUpdate] = useState<string | null>(null);

  // Data for app dishes
  const dishesCollectionRef = useMemoFirebase(() => collection(firestore, 'dishes'), [firestore]);
  const { data: dishes, isLoading: isLoadingDishes, setData: setDishes } = useCollection<Dish>(dishesCollectionRef);
  
  // Data for user contributions
  const userContributionsCollectionRef = useMemoFirebase(() => collection(firestore, 'userContributions'), [firestore]);
  const userContributionsQuery = useMemoFirebase(() => userContributionsCollectionRef ? query(userContributionsCollectionRef, orderBy('createdAt', 'desc')) : null, [userContributionsCollectionRef]);
  const { data: userContributions, isLoading: isLoadingContributions } = useCollection<WithId<UserContribution>>(userContributionsQuery);


  const handleEdit = (dish: Dish) => {
    setEditingDish(dish);
    setContributionToUpdate(null);
    setFormOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingDish(null);
    setContributionToUpdate(null);
    setFormOpen(true);
  };
  
  const handleAddToDishesFromContribution = (contribution: WithId<UserContribution>) => {
    setEditingDish({
      name: contribution.name,
      type: contribution.type,
      recipe: contribution.recipe,
      imageUrl: contribution.imageUrl,
    });
    setContributionToUpdate(contribution.id);
    setFormOpen(true);
  };

  const handleFormSubmit = (values: Omit<Dish, 'id'>) => {
    if (editingDish && 'id' in editingDish && editingDish.id) {
      const dishDocRef = doc(firestore, 'dishes', editingDish.id);
      updateDocumentNonBlocking(dishDocRef, values);
      toast({ title: "Plat modifié", description: "Le plat a été mis à jour." });
    } else {
      addDocumentNonBlocking(dishesCollectionRef, { ...values });
      toast({ title: "Plat ajouté", description: "Le nouveau plat a été ajouté." });
      // If this came from a contribution, update the contribution status
      if(contributionToUpdate) {
        handleContributionStatusUpdate(contributionToUpdate, 'approved');
      }
    }
    setFormOpen(false);
    setEditingDish(null);
    setContributionToUpdate(null);
  };
  
  const handleDelete = (dishId: string) => {
    const dishDocRef = doc(firestore, 'dishes', dishId);
    deleteDocumentNonBlocking(dishDocRef);
    toast({ variant: "destructive", title: "Plat supprimé" });
  };
  
  const handleDeleteContribution = (contributionId: string) => {
    const contributionDocRef = doc(firestore, 'userContributions', contributionId);
    deleteDocumentNonBlocking(contributionDocRef);
    toast({ variant: "destructive", title: "Contribution supprimée" });
  };
  
  const handleContributionStatusUpdate = (contributionId: string, status: 'approved' | 'rejected') => {
      const contributionRef = doc(firestore, 'userContributions', contributionId);
      updateDocumentNonBlocking(contributionRef, { status });
      toast({ title: 'Statut mis à jour', description: `La contribution a été ${status === 'approved' ? 'approuvée' : 'rejetée'}.`});
  };

  if (isUserLoading || isLoadingDishes || isLoadingContributions) {
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
              title="Gestion des Repas"
              icon={<Utensils className="h-6 w-6" />}
              user={user}
              sidebarProps={sidebarProps}
            />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
                <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        setEditingDish(null);
                        setContributionToUpdate(null);
                    }
                    setFormOpen(isOpen);
                }}>
                    <Tabs defaultValue="app_dishes">
                        <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="app_dishes">Repas de l'application</TabsTrigger>
                        <TabsTrigger value="user_dishes">Contributions des utilisateurs</TabsTrigger>
                        </TabsList>
                        
                        {/* Tab for application's official dishes */}
                        <TabsContent value="app_dishes">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                  <div>
                                      <CardTitle>Liste des plats</CardTitle>
                                      <CardDescription>Ajoutez, modifiez ou supprimez les plats de l'application.</CardDescription>
                                  </div>
                                  <div className="flex gap-2">
                                      <Dialog open={isImportOpen} onOpenChange={setImportOpen}>
                                          <DialogTrigger asChild>
                                              <Button variant="outline">
                                                  <Upload className="mr-2 h-4 w-4" />
                                                  Importer en masse
                                              </Button>
                                          </DialogTrigger>
                                          <DialogContent className="max-w-2xl">
                                              <DialogHeader>
                                                  <DialogTitle>Importer des plats en masse</DialogTitle>
                                                  <DialogDescription>
                                                    Chargez un fichier JSON contenant un tableau de plats. Chaque plat doit avoir au minimum une clé "name".
                                                  </DialogDescription>
                                              </DialogHeader>
                                              <BulkDishImporter onImportComplete={() => setImportOpen(false)} />
                                          </DialogContent>
                                      </Dialog>
                                      <DialogTrigger asChild>
                                          <Button onClick={handleAddNew}>
                                              <PlusCircle className="mr-2 h-4 w-4" />
                                              Ajouter
                                          </Button>
                                      </DialogTrigger>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                <Table>
                                    <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">Image</TableHead>
                                        <TableHead>Nom</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Catégorie</TableHead>
                                        <TableHead>Pays</TableHead>
                                        <TableHead>Temps</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                    {dishes && dishes.length > 0 ? (
                                        dishes.map((dish) => (
                                        <TableRow key={dish.id}>
                                            <TableCell>
                                                {dish.imageUrl ? (
                                                    <Image src={dish.imageUrl} alt={dish.name} width={64} height={64} className="rounded-md object-cover aspect-square" />
                                                ) : (
                                                    <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                                                        N/A
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">{dish.name}</TableCell>
                                            <TableCell>
                                                {dish.type && <Badge variant="outline">{dish.type}</Badge>}
                                            </TableCell>
                                            <TableCell><Badge variant="secondary">{dish.category}</Badge></TableCell>
                                            <TableCell className="text-muted-foreground">{dish.origin}</TableCell>
                                            <TableCell className="text-muted-foreground">{dish.cookingTime}</TableCell>
                                            <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(dish)}>
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
                                                    Cette action est irréversible et supprimera le plat définitivement.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(dish.id)} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                                                </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            Aucun plat dans la base de données.
                                        </TableCell>
                                        </TableRow>
                                    )}
                                    </TableBody>
                                </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        
                        {/* Tab for user contributions */}
                        <TabsContent value="user_dishes">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Contributions des utilisateurs</CardTitle>
                                    <CardDescription>Validez ou rejetez les plats soumis par les utilisateurs.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nom du plat</TableHead>
                                            <TableHead>Auteur</TableHead>
                                            <TableHead>Calories</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Statut</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {userContributions && userContributions.length > 0 ? (
                                            userContributions.map((contribution) => (
                                                <TableRow key={contribution.id}>
                                                    <TableCell className="font-medium">{contribution.name}</TableCell>
                                                    <TableCell className="text-muted-foreground">{contribution.authorName}</TableCell>
                                                    <TableCell className="text-muted-foreground">{contribution.calories} kcal</TableCell>
                                                    <TableCell>{contribution.createdAt ? format(contribution.createdAt.toDate(), 'd MMM yyyy', { locale: fr }) : 'N/A'}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={
                                                            contribution.status === 'approved' ? 'default' :
                                                            contribution.status === 'rejected' ? 'destructive' :
                                                            'secondary'
                                                        }>
                                                            {contribution.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {contribution.status === 'pending' && (
                                                            <>
                                                                <Button variant="outline" size="sm" onClick={() => handleAddToDishesFromContribution(contribution)}>
                                                                    <PlusCircle className="mr-2 h-4 w-4" /> Ajouter
                                                                </Button>
                                                                <Button variant="ghost" size="icon" className="text-destructive ml-2" onClick={() => handleContributionStatusUpdate(contribution.id, 'rejected')}>
                                                                    <XCircle className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                         <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="text-destructive ml-2">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                    Cette action est irréversible et supprimera la contribution définitivement.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDeleteContribution(contribution.id)} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-24 text-center">
                                                    Aucune contribution pour le moment.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingDish && 'id' in editingDish ? 'Modifier le plat' : 'Nouveau plat'}</DialogTitle>
                            <DialogDescription>
                                Remplissez les informations ci-dessous.
                            </DialogDescription>
                        </DialogHeader>
                        <DishForm
                            onSubmit={handleFormSubmit}
                            initialData={editingDish}
                        />
                    </DialogContent>
                </Dialog>
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
