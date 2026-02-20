
'use client';

import { useState, useMemo } from 'react';
import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { SidebarProvider, Sidebar as AppSidebar, SidebarInset } from "@/components/ui/sidebar";
import { useUser, useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { Loader2, Star, ThumbsUp, ThumbsDown, User, Calendar, CheckCircle, Archive, MessageSquare, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, doc, query, orderBy } from 'firebase/firestore';
import type { Feedback } from '@/lib/types';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const statusConfig = {
    new: { label: "Nouveau", color: "bg-blue-500" },
    read: { label: "Lu", color: "bg-green-500" },
    archived: { label: "Archivé", color: "bg-gray-500" },
};

const FeedbackIcon = ({ rating }: { rating: number }) => {
    if (rating > 0) return <ThumbsUp className="h-5 w-5 text-green-500"/>;
    if (rating === -1) return <ThumbsDown className="h-5 w-5 text-red-500" />;
    return <Info className="h-5 w-5 text-blue-500" />; // For rating === 0
}

const StarRatingDisplay = ({ rating }: { rating: number }) => {
  if (rating <= 0) return null;
  return (
    <div className="flex">
        {[...Array(5)].map((_, i) => (
            <Star
                key={i}
                className={cn('h-4 w-4', rating > i ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30')}
            />
        ))}
    </div>
  );
};


export default function AdminFeedbacksPage() {
    const { user, isUserLoading } = useUser();
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('new');

    const feedbacksCollectionRef = useMemoFirebase(() => collection(firestore, 'feedbacks'), [firestore]);
    const feedbacksQuery = useMemoFirebase(
        () => feedbacksCollectionRef ? query(feedbacksCollectionRef, orderBy('createdAt', 'desc')) : null,
        [feedbacksCollectionRef]
    );

    const { data: feedbacks, isLoading: isLoadingFeedbacks } = useCollection<Feedback>(feedbacksQuery);
    
    const filteredFeedbacks = useMemo(() => {
        return feedbacks?.filter(f => f.status === activeTab) ?? [];
    }, [feedbacks, activeTab]);

    const handleUpdateStatus = (feedbackId: string, status: 'read' | 'archived') => {
        const feedbackRef = doc(firestore, 'feedbacks', feedbackId);
        updateDocumentNonBlocking(feedbackRef, { status });
        toast({ title: "Statut mis à jour" });
    };

    const isLoading = isUserLoading || isLoadingFeedbacks;
    
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
                            title="Gestion des Feedbacks"
                            icon={<Star className="h-6 w-6" />}
                            user={user}
                            sidebarProps={sidebarProps}
                        />
                        <main className="flex-1 overflow-y-auto p-4 md:p-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Retours et Activités</CardTitle>
                                    <CardDescription>
                                        Consultez les retours utilisateurs et les nouvelles inscriptions.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                                        <TabsList className="mb-4">
                                            <TabsTrigger value="new">Nouveaux</TabsTrigger>
                                            <TabsTrigger value="read">Lus</TabsTrigger>
                                            <TabsTrigger value="archived">Archivés</TabsTrigger>
                                        </TabsList>
                                        {isLoading ? (
                                            <div className="flex h-64 items-center justify-center">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                            </div>
                                        ) : (
                                            filteredFeedbacks.length > 0 ? (
                                                <div className="space-y-4">
                                                    {filteredFeedbacks.map(feedback => (
                                                        <Card key={feedback.id} className="bg-muted/30">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-start justify-between">
                                                                    <div className="flex items-center gap-3">
                                                                        <FeedbackIcon rating={feedback.rating} />
                                                                        <div>
                                                                            <p className="text-sm font-semibold">{feedback.userName}</p>
                                                                            <p className="text-xs text-muted-foreground">{feedback.createdAt ? formatDistanceToNow(feedback.createdAt.toDate(), { addSuffix: true, locale: fr }) : ''}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        {activeTab === 'new' && (
                                                                             <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus(feedback.id, 'read')}>
                                                                                <CheckCircle className="mr-2 h-4 w-4"/> Marquer comme lu
                                                                            </Button>
                                                                        )}
                                                                        {activeTab !== 'archived' && (
                                                                            <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus(feedback.id, 'archived')}>
                                                                                <Archive className="mr-2 h-4 w-4"/> Archiver
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <Card className="mt-3 bg-background">
                                                                    <CardContent className="p-3 text-sm">
                                                                         <div className="flex items-center justify-between mb-2">
                                                                            <p className="font-semibold text-muted-foreground flex items-center gap-2">
                                                                                {feedback.rating > 0 ? <MessageSquare className="h-4 w-4"/> : <User className="h-4 w-4"/>}
                                                                                {feedback.rating > 0 ? "Avis utilisateur" : "Information"}
                                                                            </p>
                                                                            {feedback.rating > 0 && <StarRatingDisplay rating={feedback.rating} />}
                                                                        </div>
                                                                        
                                                                        <p>"{feedback.comment}"</p>
                                                                        {feedback.page && (
                                                                             <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                                                                                Soumis depuis: {feedback.page}
                                                                            </p>
                                                                        )}
                                                                    </CardContent>
                                                                </Card>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="h-64 flex flex-col items-center justify-center bg-muted/50 rounded-lg">
                                                    <p className="text-muted-foreground">Aucun élément dans cette catégorie.</p>
                                                </div>
                                            )
                                        )}
                                    </Tabs>
                                </CardContent>
                            </Card>
                        </main>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </div>
    );
}
