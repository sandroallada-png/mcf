
'use client';

import { useState } from 'react';
import { useUser, useFirebase, useCollection, useMemoFirebase, useDoc, type WithId } from '@/firebase';
import { collection, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { AppHeader } from '@/components/layout/app-header';
import { Sidebar } from '@/components/dashboard/sidebar';
import { SidebarProvider, Sidebar as AppSidebar, SidebarInset } from '@/components/ui/sidebar';
import { Loader2, Library, PlusCircle, Edit, Trash2, BookOpen, Star, Lock } from 'lucide-react';
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
import { AtelierBookForm } from '@/components/admin/atelier-book-form';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { AtelierBook } from '@/lib/types';
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

export default function AdminAtelierPage() {
    const { user, isUserLoading } = useUser();
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const [isFormOpen, setFormOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<Partial<AtelierBook> | null>(null);

    const atelierCollectionRef = useMemoFirebase(() => collection(firestore, 'atelierBooks'), [firestore]);
    const atelierQuery = useMemoFirebase(() => atelierCollectionRef ? query(atelierCollectionRef, orderBy('createdAt', 'desc')) : null, [atelierCollectionRef]);
    const { data: books, isLoading: isLoadingBooks } = useCollection<AtelierBook>(atelierQuery);

    const handleEdit = (book: AtelierBook) => {
        setEditingBook({ ...book } as any);
        setFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingBook(null);
        setFormOpen(true);
    };

    const handleFormSubmit = (values: Omit<AtelierBook, 'id'>) => {
        if (editingBook && 'id' in editingBook && editingBook.id) {
            const bookDocRef = doc(firestore, 'atelierBooks', editingBook.id);
            updateDocumentNonBlocking(bookDocRef, { ...values });
            toast({ title: "Livre mis à jour", description: "Les modifications ont été enregistrées." });
        } else {
            addDocumentNonBlocking(atelierCollectionRef, {
                ...values,
                createdAt: serverTimestamp()
            });
            toast({ title: "Livre publié", description: "Le nouveau livre a été ajouté à l'Atelier." });
        }
        setFormOpen(false);
        setEditingBook(null);
    };

    const handleDelete = (bookId: string) => {
        const bookDocRef = doc(firestore, 'atelierBooks', bookId);
        deleteDocumentNonBlocking(bookDocRef);
        toast({ variant: "destructive", title: "Livre supprimé" });
    };

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

    if (isUserLoading || isLoadingBooks) {
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
                            title="Gestion de l'Atelier"
                            icon={<Library className="h-6 w-6" />}
                            user={user}
                            sidebarProps={sidebarProps}
                        />
                        <main className="flex-1 overflow-y-auto p-4 md:p-6">
                            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
                                <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
                                    <div>
                                        <CardTitle className="text-2xl font-black">Bibliothèque de l'Atelier</CardTitle>
                                        <CardDescription>Gérez les livres, recettes et contenus exclusifs du Chef.</CardDescription>
                                    </div>
                                    <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
                                        <DialogTrigger asChild>
                                            <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-primary/20">
                                                <PlusCircle className="mr-2 h-5 w-5" />
                                                Ajouter un Livre
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
                                            <div className="p-6 bg-primary/5 border-b">
                                                <DialogHeader>
                                                    <DialogTitle className="text-2xl font-black">{editingBook ? 'Modifier le Livre' : 'Nouveau Livre de l\'Atelier'}</DialogTitle>
                                                    <DialogDescription>
                                                        Remplissez les informations détaillées pour publier ce volume.
                                                    </DialogDescription>
                                                </DialogHeader>
                                            </div>
                                            <div className="p-6">
                                                <AtelierBookForm
                                                    onSubmit={handleFormSubmit}
                                                    initialData={editingBook}
                                                />
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="hover:bg-transparent border-muted/20">
                                                <TableHead className="w-[100px]">Couverture</TableHead>
                                                <TableHead>Titre & Tags</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Prix</TableHead>
                                                <TableHead>Statut</TableHead>
                                                <TableHead>Photos</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {books && books.length > 0 ? (
                                                books.map((book) => (
                                                    <TableRow key={book.id} className="group hover:bg-muted/30 transition-colors border-muted/10">
                                                        <TableCell>
                                                            <div className="relative h-20 w-16 rounded-lg overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-300">
                                                                <Image src={book.imageUrl} alt={book.name} fill className="object-cover" />
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col gap-1.5">
                                                                <span className="font-black text-lg tracking-tight">{book.name}</span>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {book.hashtags?.map(tag => (
                                                                        <Badge key={tag} variant="outline" className="text-[10px] font-bold uppercase tracking-wider py-0 px-1.5 bg-primary/5 border-primary/20">#{tag}</Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 font-black">
                                                                    {book.category}
                                                                </div>
                                                                <span className="text-xs font-bold text-muted-foreground uppercase opacity-70">Classification</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={book.price === 0 ? "bg-emerald-500 font-black" : "bg-primary font-black"}>
                                                                {book.price === 0 ? 'GRATUIT' : `${book.price} €`}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {book.price > 0 ? (
                                                                <Badge variant="destructive" className="font-black flex items-center gap-1 w-fit">
                                                                    <Lock className="h-3 w-3" /> BLOQUÉ
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 font-black">
                                                                    OUVERT
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-1">
                                                                <span className="font-black text-primary">{book.galleryUrls?.length || 0}</span>
                                                                <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Photos</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(book)} className="hover:bg-primary/10 hover:text-primary rounded-xl">
                                                                    <Edit className="h-5 w-5" />
                                                                </Button>
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="hover:bg-destructive/10 text-destructive rounded-xl">
                                                                            <Trash2 className="h-5 w-5" />
                                                                        </Button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle className="text-xl font-black">Supprimer ce livre ?</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                Cette action supprimera définitivement "{book.name}" de la bibliothèque et ne pourra pas être annulée.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel className="rounded-xl border-muted/20 font-bold">Annuler</AlertDialogCancel>
                                                                            <AlertDialogAction onClick={() => handleDelete(book.id)} className="bg-destructive hover:bg-destructive/90 rounded-xl font-bold">Supprimer définitivement</AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic">
                                                        La bibliothèque est vide. Commencez par ajouter un livre.
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
