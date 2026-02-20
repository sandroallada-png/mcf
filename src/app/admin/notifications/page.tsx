
'use client';

import { useState } from 'react';
import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { SidebarProvider, Sidebar as AppSidebar, SidebarInset } from "@/components/ui/sidebar";
import { useUser, useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { Bell, Loader2, Send, Link as LinkIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { collection, writeBatch, serverTimestamp, doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';


export default function AdminNotificationsPage() {
    const { user, isUserLoading } = useUser();
    const { firestore } = useFirebase();
    const { toast } = useToast();
    
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [link, setLink] = useState('');
    const [isSending, setIsSending] = useState(false);

    const usersCollectionRef = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
    const { data: allUsers, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersCollectionRef);

    const handleSendNotification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !message.trim()) {
            toast({
                variant: "destructive",
                title: "Champs requis",
                description: "Le titre et le message sont obligatoires.",
            });
            return;
        }
        if (!allUsers || allUsers.length === 0) {
            toast({
                variant: "destructive",
                title: "Aucun utilisateur",
                description: "Impossible d'envoyer une notification, aucun utilisateur trouvé.",
            });
            return;
        }

        setIsSending(true);
        try {
            const batch = writeBatch(firestore);
            
            const notificationData: any = {
                title: title,
                body: message,
                isRead: false,
                createdAt: serverTimestamp(),
            };

            if (link.trim()) {
                notificationData.link = link.trim();
            }

            allUsers.forEach(targetUser => {
                const notificationRef = doc(collection(firestore, `users/${targetUser.id}/notifications`));
                batch.set(notificationRef, notificationData);
            });

            await batch.commit();

            toast({
                title: "Notification envoyée !",
                description: `Le message a été envoyé à ${allUsers.length} utilisateur(s).`,
            });
            setTitle('');
            setMessage('');
            setLink('');

        } catch (error) {
            console.error("Failed to send notifications:", error);
            toast({
                variant: "destructive",
                title: "Erreur d'envoi",
                description: "Une erreur est survenue lors de l'envoi des notifications.",
            });
        } finally {
            setIsSending(false);
        }
    };

    if (isUserLoading || !user || isLoadingUsers) {
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
                            title="Gestion des Notifications"
                            icon={<Bell className="h-6 w-6" />}
                            user={user}
                            sidebarProps={sidebarProps}
                        />
                        <main className="flex-1 overflow-y-auto p-4 md:p-6">
                            <div className="max-w-2xl mx-auto">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Envoyer une Notification de masse</CardTitle>
                                        <CardDescription>
                                            Composez et envoyez une notification à tous les utilisateurs de l'application.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleSendNotification} className="space-y-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="title">Titre de la notification</Label>
                                                <Input id="title" placeholder="Ex: Nouvelle recette disponible !" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isSending} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="message">Message</Label>
                                                <Textarea id="message" placeholder="Décrivez votre message ici..." className="min-h-32" value={message} onChange={(e) => setMessage(e.target.value)} disabled={isSending} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="link">Lien (optionnel)</Label>
                                                 <div className="relative">
                                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input id="link" placeholder="https://mycookflex.com/market" value={link} onChange={(e) => setLink(e.target.value)} disabled={isSending} className="pl-9" />
                                                 </div>
                                            </div>
                                            <Button type="submit" className="w-full" disabled={isSending || !title.trim() || !message.trim()}>
                                                {isSending ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Send className="mr-2 h-4 w-4" />
                                                )}
                                                {isSending ? 'Envoi en cours...' : `Envoyer à ${allUsers?.length || 0} utilisateur(s)`}
                                            </Button>
                                        </form>
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
