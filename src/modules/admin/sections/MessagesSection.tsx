'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MessagesSection() {
    return (
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
    );
}
