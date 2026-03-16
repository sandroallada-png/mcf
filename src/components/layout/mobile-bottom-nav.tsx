"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence, useAnimate } from 'framer-motion';
import { LayoutDashboard, Calendar, Sparkles, ChefHat, Bot, Loader2, UtensilsCrossed, X, Library } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useFirebase, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, limit } from 'firebase/firestore';
import type { UserProfile, DayPlanMeal, AIPersonality } from '@/lib/types';
import { suggestDayPlanAction } from '@/app/actions';
import Image from 'next/image';

const HIDDEN_PATHS = [
    '/login',
    '/register',
    '/personalization',
    '/preferences',
    '/pricing',
    '/welcome',
    '/join-family',
    '/verify-email',
    '/onboarding',
];

export function MobileBottomNav() {
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useUser();
    const { firestore } = useFirebase();
    const [scope, animate] = useAnimate();
    const drainTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasDrainedRef = useRef(false);

    // ── States ────────────────────────────────────────────────────────
    const [isMagicOpen, setIsMagicOpen] = useState(false);
    const [dayPlan, setDayPlan] = useState<DayPlanMeal[]>([]);
    const [isLoadingPlan, setIsLoadingPlan] = useState(false);
    const [planFetched, setPlanFetched] = useState(false);
    const [currentTime, setCurrentTime] = useState<Date>(new Date());

    // ── Time Update ───────────────────────────────────────────────────
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // ── Firebase data ────────────────────────────────────────────────────
    const profileRef = useMemoFirebase(
        () => (user ? doc(firestore, 'users', user.uid) : null),
        [user, firestore]
    );
    const { data: userProfile } = useDoc<UserProfile>(profileRef);

    const goalsRef = useMemoFirebase(
        () => (user ? query(collection(firestore, 'users', user.uid, 'goals'), limit(1)) : null),
        [user, firestore]
    );
    const { data: goalsData } = useCollection<{ description: string }>(goalsRef);
    const goals = goalsData?.[0]?.description || 'Manger équilibré et sainement.';

    // ── Fetch day plan ───────────────────────────────────────────────────
    const fetchDayPlan = useCallback(async () => {
        if (!userProfile) return;
        setIsLoadingPlan(true);
        try {
            let personality: AIPersonality | undefined;
            if (userProfile.isAITrainingEnabled) {
                personality = {
                    tone: userProfile.tone,
                    mainObjective: userProfile.mainObjective,
                    allergies: userProfile.allergies,
                    preferences: userProfile.preferences,
                };
            }
            const { plan, error } = await suggestDayPlanAction({
                dietaryGoals: goals,
                personality,
                householdMembers: userProfile.household || [],
            });
            if (error) throw new Error(error);
            setDayPlan(plan || []);
            setPlanFetched(true);
        } catch {
            setDayPlan([]);
        } finally {
            setIsLoadingPlan(false);
        }
    }, [userProfile, goals]);

    // ── Magic Context Logic ───────────────────────────────────────────
    const magicInfo = useMemo(() => {
        if (!dayPlan.length) return null;
        
        const hour = currentTime.getHours();
        let targetType: DayPlanMeal['type'] = 'lunch';
        let targetTime = '13:00';

        if (hour < 10) { targetType = 'breakfast'; targetTime = '08:30'; }
        else if (hour < 15) { targetType = 'lunch'; targetTime = '13:00'; }
        else if (hour < 22) { targetType = 'dinner'; targetTime = '20:00'; }
        else { targetType = 'breakfast'; targetTime = 'demain 08:30'; }

        const meal = dayPlan.find(m => m.type === targetType) || dayPlan[0];
        const peopleCount = userProfile?.household?.length || 1;

        return {
            time: currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            meal,
            targetTime,
            peopleCount
        };
    }, [dayPlan, currentTime, userProfile]);

    // ── Handlers ──────────────────────────────────────────────────────
    const handleMagicPress = useCallback(() => {
        setIsMagicOpen(true);
        if (!planFetched && userProfile) {
            fetchDayPlan();
        }
    }, [planFetched, userProfile, fetchDayPlan]);

    const closeOverlay = useCallback(() => {
        setIsMagicOpen(false);
    }, []);

    // ── AI page drain animation ──────────────────────────────────────────
    const isAIPage = pathname === '/my-flex-ai';

    useEffect(() => {
        if (!scope.current) return;
        if (isAIPage && !hasDrainedRef.current) {
            animate(scope.current, { scale: 1, opacity: 1 }, { duration: 0.3 });
            drainTimerRef.current = setTimeout(() => {
                animate(
                    scope.current,
                    { scale: [1, 0.98, 0.88, 0.72, 0.6], opacity: [1, 0.95, 0.85, 0.75, 0.65] },
                    { duration: 5, ease: [0.25, 0.46, 0.45, 0.94], times: [0, 0.15, 0.4, 0.75, 1] }
                );
                hasDrainedRef.current = true;
            }, 3000);
        } else if (!isAIPage) {
            if (drainTimerRef.current) clearTimeout(drainTimerRef.current);
            hasDrainedRef.current = false;
            animate(scope.current, { scale: 1, opacity: 1 }, { duration: 0.4, ease: 'easeOut' });
        }
        return () => { if (drainTimerRef.current) clearTimeout(drainTimerRef.current); };
    }, [isAIPage, animate, scope]);

    const isHidden = HIDDEN_PATHS.some(p => pathname === p || pathname?.startsWith(p));
    if (isHidden) return null;

    const navItems = [
        { href: '/dashboard', icon: LayoutDashboard, label: 'Accueil' },
        { href: '/calendar', icon: Calendar, label: 'Calendrier' },
        { href: '/atelier', icon: Library, label: 'Atelier' },
        { href: '/my-flex-ai', icon: Bot, label: 'Coach' },
    ];
    const leftItems = navItems.slice(0, 2);
    const rightItems = navItems.slice(2);

    return (
        <>
            {/* ── NAV BAR ─────────────────────────────────────────────────── */}
            <div className="md:hidden fixed bottom-0 inset-x-0 z-[40] bg-background/85 backdrop-blur-xl border-t border-border shadow-[0_-4px_24px_rgba(0,0,0,0.10)]">
                <div
                    className="flex items-center justify-between px-2"
                    style={{ paddingBottom: 'max(0.8rem, env(safe-area-inset-bottom))' }}
                >
                    {/* Items Gauche */}
                    <div className="flex flex-1 justify-around items-center">
                        {leftItems.map(item => {
                            const isActive = pathname === item.href;
                            return (
                                <motion.button
                                    key={item.href}
                                    className={cn(
                                        "flex flex-col items-center gap-1 py-2 px-2 rounded-xl transition-all relative min-w-[64px]",
                                        isActive ? "text-primary" : "text-muted-foreground"
                                    )}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => router.push(item.href)}
                                >
                                    <item.icon className={cn("h-[22px] w-[22px]", isActive && "animate-in fade-in zoom-in duration-300")} />
                                    <span className="text-[9px] font-black tracking-wide uppercase">{item.label}</span>
                                    {isActive && (
                                        <motion.span
                                            layoutId="nav-pill"
                                            className="absolute bottom-0.5 h-0.5 w-4 bg-primary rounded-full"
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Centre: Bouton Magie */}
                    <div className="relative flex flex-col items-center px-2" style={{ marginTop: '-32px' }}>
                        <div className="absolute -top-1 inset-x-0 h-2 bg-background/20 blur-md rounded-full -z-10" />
                        <motion.button
                            ref={scope}
                            onClick={handleMagicPress}
                            className="h-16 w-16 rounded-full bg-primary shadow-[0_8px_32px_rgba(var(--primary-rgb),0.4)] border-4 border-background flex items-center justify-center group relative overflow-hidden"
                            whileTap={{ scale: 0.92 }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Sparkles className="h-7 w-7 text-primary-foreground group-hover:rotate-12 transition-transform duration-300 relative z-10" />
                        </motion.button>
                        <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest mt-1.5 transition-colors",
                            isAIPage ? "text-muted-foreground" : "text-primary drop-shadow-sm font-black"
                        )}>
                            Magie
                        </span>
                    </div>

                    {/* Items Droite */}
                    <div className="flex flex-1 justify-around items-center">
                        {rightItems.map(item => {
                            const isActive = pathname === item.href;
                            return (
                                <motion.button
                                    key={item.href}
                                    className={cn(
                                        "flex flex-col items-center gap-1 py-2 px-2 rounded-xl transition-all relative min-w-[64px]",
                                        isActive ? "text-primary" : "text-muted-foreground"
                                    )}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => router.push(item.href)}
                                >
                                    <item.icon className={cn("h-[22px] w-[22px]", isActive && "animate-in fade-in zoom-in duration-300")} />
                                    <span className="text-[9px] font-black tracking-wide uppercase">{item.label}</span>
                                    {isActive && (
                                        <motion.span
                                            layoutId="nav-pill"
                                            className="absolute bottom-0.5 h-0.5 w-4 bg-primary rounded-full"
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── MAGIC OVERLAY ───────────────────────────────────────────── */}
            <AnimatePresence>
                {isMagicOpen && (
                    <motion.div
                        key="magic-overlay"
                        className="md:hidden fixed inset-0 z-[200] flex items-center justify-center px-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.22 }}
                    >
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            onClick={closeOverlay}
                        />

                        {/* Card */}
                        <motion.div
                            className="relative z-10 w-full max-w-sm bg-background/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-primary/20 border border-primary/20 overflow-hidden"
                            initial={{ scale: 0.8, y: 100, opacity: 0, rotate: -2 }}
                            animate={{ scale: 1, y: 0, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.8, y: 100, opacity: 0, rotate: 2 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        >
                            {/* Decorative Sparkles Background */}
                            <div className="absolute inset-0 pointer-events-none opacity-20">
                                <Sparkles className="absolute top-10 left-10 h-20 w-20 text-primary blur-2xl" />
                                <Sparkles className="absolute bottom-10 right-10 h-20 w-20 text-primary blur-2xl" />
                            </div>

                            {/* Header / Icon */}
                            <div className="pt-10 pb-4 flex justify-center">
                                <motion.div 
                                    className="h-24 w-24 rounded-full bg-gradient-to-tr from-primary to-violet-500 p-0.5 shadow-xl"
                                    animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                >
                                    <div className="h-full w-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                                        {magicInfo?.meal?.imageUrl ? (
                                            <div className="relative w-full h-full">
                                                <Image src={magicInfo.meal.imageUrl} alt="Meal" fill className="object-cover" />
                                            </div>
                                        ) : (
                                            <Sparkles className="h-10 w-10 text-primary" />
                                        )}
                                    </div>
                                </motion.div>
                            </div>

                            {/* Magic Text Content */}
                            <div className="px-8 pb-10 text-center space-y-6 relative z-10">
                                {isLoadingPlan ? (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center gap-4 py-6"
                                    >
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">
                                            Consultation des astres...
                                        </p>
                                    </motion.div>
                                ) : magicInfo ? (
                                    <>
                                        <div className="space-y-2">
                                            <motion.p 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60"
                                            >
                                                Assistant Culinaire
                                            </motion.p>
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                                className="space-y-4"
                                            >
                                                <h2 className="text-xl font-black leading-tight">
                                                    Il est <span className="text-primary">{magicInfo.time}</span>
                                                </h2>
                                                <div className="bg-primary/5 rounded-3xl p-5 border border-primary/10">
                                                    <p className="text-sm font-bold text-foreground leading-relaxed">
                                                        Le <span className="text-primary italic">"{magicInfo.meal.name}"</span> est à cuisiner pour <span className="underline underline-offset-4 decoration-primary/40">{magicInfo.targetTime}</span>.
                                                    </p>
                                                    <div className="mt-3 flex items-center justify-center gap-2">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                                                        <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                                                            {magicInfo.peopleCount} {magicInfo.peopleCount > 1 ? 'personnes qui cuisinent' : 'personne qui cuisine'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </div>

                                        <motion.button
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                            onClick={() => {
                                                const encoded = encodeURIComponent(magicInfo.meal.name);
                                                closeOverlay();
                                                router.push(`/cuisine?tab=in_progress&cook=${encoded}`);
                                            }}
                                            className="w-full bg-primary text-primary-foreground h-16 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 flex items-center justify-center gap-3 active:scale-95 transition-all group"
                                        >
                                            <ChefHat className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                                            Cuisiner
                                        </motion.button>
                                    </>
                                ) : (
                                    <p className="text-xs font-bold text-muted-foreground py-10">
                                        Impossible de lire le futur... réessayez !
                                    </p>
                                )}
                                
                                <button 
                                    onClick={closeOverlay}
                                    className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-primary transition-colors"
                                >
                                    Fermer
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
