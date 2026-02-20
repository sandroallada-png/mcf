
'use client';

import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { SidebarProvider, Sidebar as AppSidebar, SidebarInset } from "@/components/ui/sidebar";
import { useUser, useDoc, useMemoFirebase } from "@/firebase";
import { LayoutDashboard, Loader2, Users, FileText, Ticket, GalleryHorizontal, ShoppingCart, Shield, Utensils, Bell, MessageSquare, Star, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from 'next/link';

interface UserProfile {
    role?: 'user' | 'admin';
}

export default function AdminPage() {
    const { user, isUserLoading } = useUser();
    const { firestore } = useFirebase();
    const router = useRouter();

    const userProfileRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);
    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

    useEffect(() => {
        // If profile is loaded and user is not an admin, redirect them.
        if (!isProfileLoading && userProfile?.role !== 'admin') {
            router.replace('/dashboard');
        }
    }, [isProfileLoading, userProfile, router]);


    if (isUserLoading || isProfileLoading || !user || userProfile?.role !== 'admin') {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    // This is a placeholder for sidebar props.
    // In a real app, you'd fetch the necessary data.
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
                            title="Admin Dashboard"
                            icon={<LayoutDashboard className="h-6 w-6" />}
                            user={user}
                            sidebarProps={sidebarProps}
                        />
                        <main className="flex-1 overflow-y-auto p-4 md:p-6">
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5 text-primary" />
                                            Liste des Utilisateurs
                                        </CardTitle>
                                        <CardDescription>
                                            Voir, modifier ou supprimer des utilisateurs.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button className="w-full" asChild>
                                            <Link href="/admin/users">Gérer les utilisateurs</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                                 <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Ticket className="h-5 w-5 text-primary" />
                                            Gestion des Promotions
                                        </CardTitle>
                                        <CardDescription>
                                            Créer et gérer les offres promotionnelles.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button className="w-full" asChild>
                                            <Link href="/admin/promotions">Gérer les promotions</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-primary" />
                                            Gestion des Publications
                                        </CardTitle>
                                        <CardDescription>
                                            Modérer les recettes et guides partagés.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button className="w-full" asChild>
                                            <Link href="/admin/publications">Modérer le contenu</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                                 <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <GalleryHorizontal className="h-5 w-5 text-primary" />
                                            Gestion du Carrousel
                                        </CardTitle>
                                        <CardDescription>
                                            Modifier les images et textes du carrousel.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button className="w-full" asChild>
                                            <Link href="/admin/carousel">Gérer le carrousel</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                                 <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ShoppingCart className="h-5 w-5 text-primary" />
                                            Modération du Market
                                        </CardTitle>
                                        <CardDescription>
                                            Approuver et gérer les produits du marché.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button className="w-full" disabled>
                                            Modérer le Market (Bientôt)
                                        </Button>
                                    </CardContent>
                                </Card>
                                 <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Shield className="h-5 w-5 text-primary" />
                                            Contrôle du Forum
                                        </CardTitle>
                                        <CardDescription>
                                            Modérer les sujets et réponses du forum.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button className="w-full" disabled>
                                            Contrôler le Forum (Bientôt)
                                        </Button>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Utensils className="h-5 w-5 text-primary" />
                                            Gestion des Repas
                                        </CardTitle>
                                        <CardDescription>
                                            Ajouter ou modifier les plats disponibles dans l'application.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button className="w-full" asChild>
                                            <Link href="/admin/dishes">Gérer les repas</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Bell className="h-5 w-5 text-primary" />
                                            Gestion des Notifications
                                        </CardTitle>
                                        <CardDescription>
                                            Envoyer des notifications aux utilisateurs.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button className="w-full" asChild>
                                            <Link href="/admin/notifications">Gérer les notifications</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <MessageSquare className="h-5 w-5 text-primary" />
                                            Gestion des Messages
                                        </CardTitle>
                                        <CardDescription>
                                            Modérer et répondre aux messages du support.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button className="w-full" asChild>
                                            <Link href="/admin/messages">Gérer les messages</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                                 <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Star className="h-5 w-5 text-primary" />
                                            Gestion des Feedbacks
                                        </CardTitle>
                                        <CardDescription>
                                            Consulter les retours et avis des utilisateurs.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button className="w-full" asChild>
                                            <Link href="/admin/feedbacks">Consulter les feedbacks</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Activity className="h-5 w-5 text-primary" />
                                            Suivi et Relance
                                        </CardTitle>
                                        <CardDescription>
                                            Surveiller l'activité et relancer les utilisateurs.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button className="w-full" asChild>
                                            <Link href="/admin/follow-up">Suivre l'activité</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </main>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </div>
    );
}
