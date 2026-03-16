
'use client';

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Crown, Lock, MessageCircle, HelpCircle } from 'lucide-react';
import { useReadOnly } from '@/contexts/read-only-context';
import Link from 'next/link';

/**
 * Bottom Sheet (Drawer) qui s'affiche quand un membre de famille
 * tente d'effectuer une action d'écriture.
 */
export function FamilyMemberGuardModal() {
    const { isBlocked, chefName, dismissBlock } = useReadOnly();

    return (
        <Sheet open={isBlocked} onOpenChange={(open) => { if (!open) dismissBlock(); }}>
            <SheetContent side="bottom" className="p-0 border-t-2 border-primary/20 rounded-t-[2.5rem] bg-background/95 backdrop-blur-xl shadow-2xl focus:outline-none">
                {/* Petite barre de drag visuelle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-12 h-1.5 rounded-full bg-muted/60" />
                </div>

                {/* Bannière décorative haut de tiroir */}
                <div className="px-6 py-6 text-center space-y-4">
                    <div className="relative mx-auto h-16 w-16">
                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                        <div className="relative h-16 w-16 rounded-[2rem] bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shadow-inner">
                            <Crown className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    
                    <div className="space-y-1">
                        <h2 className="text-xl font-black tracking-tight text-foreground uppercase">Mode Lecture Uniquement</h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 flex items-center justify-center gap-2">
                            <Lock className="h-3 w-3" />
                            Accès restreint aux membres
                        </p>
                    </div>
                </div>

                <div className="px-8 pb-10 space-y-6">
                    <SheetHeader className="text-center space-y-3">
                        <SheetTitle className="sr-only">Action réservée au chef d'équipe</SheetTitle>
                        <SheetDescription asChild>
                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-muted/30 border border-primary/5 shadow-inner">
                                    <p className="text-sm text-foreground/80 font-medium leading-relaxed italic">
                                        "Seul{chefName ? <span className="font-black text-primary"> {chefName}</span> : ' le chef de famille'} est autorisé à modifier le planning, ajouter des repas ou gérer les stocks."
                                    </p>
                                </div>
                                
                                <div className="flex items-start gap-3 text-left">
                                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <HelpCircle className="h-3 w-3 text-primary" />
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        En tant qu'assistant culinaire, votre rôle est de consulter les recettes, voir le planning partagé et bénéficier des conseils du Coach IA.
                                    </p>
                                </div>
                            </div>
                        </SheetDescription>
                    </SheetHeader>

                    <div className="grid gap-3">
                        <Link href="/my-flex-ai" onClick={dismissBlock} className="w-full">
                            <Button className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest gap-3 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-98">
                                <MessageCircle className="h-4 w-4" />
                                Demander conseil à l'IA
                            </Button>
                        </Link>
                        
                        <Button
                            variant="outline"
                            className="w-full h-12 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 border-border/50"
                            onClick={dismissBlock}
                        >
                            J'ai compris
                        </Button>
                    </div>

                    <div className="flex items-center justify-center gap-4 py-2 opacity-20 filter grayscale">
                        {/* Mascottes ou logos subtils ici si besoin */}
                        <Lock className="h-4 w-4" />
                        <div className="h-1 w-1 rounded-full bg-foreground" />
                        <Crown className="h-4 w-4" />
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
