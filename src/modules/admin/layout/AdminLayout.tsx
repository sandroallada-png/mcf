'use client';

import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { SidebarProvider, Sidebar as AppSidebar, SidebarInset } from "@/components/ui/sidebar";
import { useUser, useDoc, useMemoFirebase, useFirebase, useCollection } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { UserProfile } from "@/lib/types";
import { AdminGuard } from "./AdminGuard";

interface AdminLayoutProps {
    children: React.ReactNode;
    title: string;
    icon: React.ReactNode;
}

export function AdminLayout({ children, title, icon }: AdminLayoutProps) {
    const { user } = useUser();
    const { firestore } = useFirebase();

    const userProfileRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);
    const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

    // Sidebar Data
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

    const sidebarProps = {
        goals: goalsData?.[0]?.description || "Manger équilibré",
        setGoals: () => { },
        meals: allMeals ?? [],
    };

    return (
        <AdminGuard>
            <div className="h-screen w-full bg-background font-body">
                <SidebarProvider>
                    <AppSidebar collapsible="icon" className="w-80 peer hidden md:block" variant="sidebar">
                        <Sidebar {...sidebarProps} />
                    </AppSidebar>
                    <SidebarInset>
                        <div className="flex h-full flex-1 flex-col">
                            <AppHeader
                                title={title}
                                icon={icon}
                                user={user}
                                sidebarProps={sidebarProps}
                            />
                            <main className="flex-1 overflow-y-auto p-4 md:p-6">
                                {children}
                            </main>
                        </div>
                    </SidebarInset>
                </SidebarProvider>
            </div>
        </AdminGuard>
    );
}
