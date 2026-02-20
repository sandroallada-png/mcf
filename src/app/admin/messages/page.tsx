
'use client';

import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { SidebarProvider, Sidebar as AppSidebar, SidebarInset } from "@/components/ui/sidebar";
import { useUser } from "@/firebase";
import { MessageSquare, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminMessagesPage() {
    const { user, isUserLoading } = useUser();

    if (isUserLoading || !user) {
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
                            title="Gestion des Messages"
                            icon={<MessageSquare className="h-6 w-6" />}
                            user={user}
                            sidebarProps={sidebarProps}
                        />
                        <main className="flex-1 overflow-y-auto p-4 md:p-6">
                            <div className="max-w-2xl mx-auto">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Boîte de réception du support</CardTitle>
                                        <CardDescription>
                                            Consultez, gérez et répondez aux messages envoyés par les utilisateurs depuis la page de support.
                                            <span className="font-bold text-destructive"> (Fonctionnalité en cours de développement)</span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-64 flex items-center justify-center bg-muted/30 rounded-b-lg">
                                        <p className="text-muted-foreground">La boîte de réception sera bientôt disponible ici.</p>
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
