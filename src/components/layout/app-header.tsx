
'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ShoppingCart, Menu, LogOut, Settings, LifeBuoy, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '../theme-toggle';
import { Sidebar } from '../dashboard/sidebar';
import type { Meal, UserProfile } from '@/lib/types';
import { NotificationBell } from './notification-bell';
import { doc } from 'firebase/firestore';
import { LogoIcon } from '../icons';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
    title: string;
    icon: React.ReactNode;
    user: any; // Firebase User type
    sidebarProps: {
        goals: string;
        setGoals: (goals: string) => void;
        meals: Meal[];
    };
    className?: string;
}

export function AppHeader({ title, icon, user, sidebarProps, className }: AppHeaderProps) {
    const { auth, firestore } = useFirebase();
    const router = useRouter();
    const { toast } = useToast();

    const userProfileRef = useMemoFirebase(() => (user ? doc(firestore, 'users', user.uid) : null), [user, firestore]);
    const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

    const handleLogout = async () => {
        try {
            await auth.signOut();
            router.push('/login');
        } catch (error) {
            console.error("Logout error:", error);
            toast({ variant: "destructive", title: "Erreur", description: "Impossible de vous déconnecter." });
        }
    };

    return (
        <header className={cn("sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-xl border-border/50", className)}>
            <div className="flex h-14 items-center justify-between px-4 md:px-6">

                {/* Left Side: Menu (Mobile) & Brand (Desktop) */}
                <div className="flex items-center gap-4">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[280px] p-0 border-r bg-sidebar">
                            <div className="sr-only">
                                <SheetTitle>Navigation Menu</SheetTitle>
                                <SheetDescription>Accéder aux différentes sections de l'application.</SheetDescription>
                            </div>
                            <Sidebar {...sidebarProps} isMobile={true} />
                        </SheetContent>
                    </Sheet>

                    <Link href="/dashboard" className="hidden md:flex items-center gap-2 group">
                        <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <LogoIcon className="h-5 w-5" />
                        </div>
                    </Link>
                </div>

                {/* Center: Title (Responsive) */}
                <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2 pointer-events-none md:pointer-events-auto md:static md:translate-x-0 md:flex-row">
                    <div className="md:hidden flex items-center gap-2">
                        <LogoIcon className="h-5 w-5" />
                    </div>
                    <div className="h-4 w-[1px] bg-border/60 mx-1 hidden md:block" />
                    <div className="flex items-center gap-2">
                        <div className="hidden md:block opacity-40 scale-75">{icon}</div>
                        <h2 className="text-[11px] md:text-xs font-black text-foreground truncate max-w-[150px] md:max-w-none uppercase tracking-[0.2em]">{title}</h2>
                    </div>
                </div>

                {/* Right Side: Actions & Profile */}
                <div className="flex items-center gap-1 md:gap-3">
                    <div className="flex items-center mr-1 md:mr-0">
                        <NotificationBell />
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors hidden sm:flex">
                            <ShoppingCart className="h-4 w-4" />
                        </Button>
                        <ThemeToggle />
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-9 w-9 rounded-full p-0.5 border border-border/50 hover:border-primary/50 transition-all overflow-hidden bg-muted/50">
                                <Avatar className="h-full w-full">
                                    <AvatarImage src={userProfile?.avatarUrl ?? user?.photoURL ?? undefined} alt="Profil" />
                                    <AvatarFallback className="bg-primary/10 text-[10px] font-black text-primary">
                                        {user?.displayName?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 mt-2 rounded-xl border-border/50 shadow-xl" align="end">
                            <DropdownMenuLabel className="p-4 font-normal">
                                <div className="flex flex-col gap-1">
                                    <p className="text-xs font-black uppercase tracking-widest leading-none">{userProfile?.name || user?.displayName || 'Utilisateur'}</p>
                                    <p className="text-[10px] font-medium text-muted-foreground mt-1 truncate">
                                        {user?.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <div className="p-1.5 pt-0">
                                <DropdownMenuItem asChild className="rounded-lg h-10 text-xs font-bold cursor-pointer focus:bg-primary/5 focus:text-primary">
                                    <Link href="/settings" className="flex items-center w-full">
                                        <Settings className="mr-3 h-4 w-4 opacity-70" />Paramètres
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="rounded-lg h-10 text-xs font-bold cursor-pointer focus:bg-primary/5 focus:text-primary">
                                    <Link href="/settings" className="flex items-center w-full">
                                        <LifeBuoy className="mr-3 h-4 w-4 opacity-70" />Aide & Support
                                    </Link>

                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="rounded-lg h-10 text-xs font-bold cursor-pointer focus:bg-primary/5 focus:text-primary">
                                    <Link href="/foyer-control" className="flex items-center w-full">
                                        <ArrowUpRight className="mr-3 h-4 w-4 opacity-70" />Gérer le Foyer
                                    </Link>
                                </DropdownMenuItem>
                            </div>
                            <DropdownMenuSeparator />
                            <div className="p-1.5">
                                <DropdownMenuItem onClick={handleLogout} className="rounded-lg h-10 text-xs font-black cursor-pointer text-destructive focus:bg-destructive/5 focus:text-destructive uppercase tracking-widest">
                                    <LogOut className="mr-3 h-4 w-4" />Déconnexion
                                </DropdownMenuItem>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
