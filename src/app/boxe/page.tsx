'use client';

import { useState, useMemo } from 'react';
import {
    SidebarProvider,
    Sidebar as AppSidebar,
    SidebarInset,
} from '@/components/ui/sidebar';
import { Sidebar } from '@/components/dashboard/sidebar';
import { useUser } from '@/firebase';
import { AppHeader } from '@/components/layout/app-header';
import {
    Package,
    Calendar,
    ChevronRight,
    Sparkles,
    Clock,
    Flame,
    ArrowRight,
    CheckCircle2,
    CalendarDays,
    Info,
    LayoutGrid,
    Timer,
    UtensilsCrossed,
    Coffee,
    Sun,
    Apple,
    Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ZoomIn } from 'lucide-react';
import { ImageZoomLightbox } from '@/components/shared/image-zoom-lightbox';

// Types for the Box Program
type BoxMeal = {
    name: string;
    time: string;
    calories: number;
    image: string;
    category: string;
    type: 'breakfast' | 'lunch' | 'snack' | 'dinner';
};

type DayPlan = {
    day: number;
    label: string;
    meals: BoxMeal[];
};

type WeeklyBox = {
    week: number;
    title: string;
    description: string;
    theme: string;
    color: string;
    days: DayPlan[];
};

const mealTypes: Record<string, { label: string, icon: any }> = {
    breakfast: { label: 'Petit-déjeuner', icon: <Coffee className="h-4 w-4" /> },
    lunch: { label: 'Déjeuner', icon: <Sun className="h-4 w-4" /> },
    snack: { label: 'Goûter', icon: <Apple className="h-4 w-4" /> },
    dinner: { label: 'Dîner', icon: <Moon className="h-4 w-4" /> }
};

const generateMockMeals = (day: number, week: number): BoxMeal[] => [
    {
        name: day === 1 ? "Pancakes à la Banane" : `Bowl Énergie J${day}`,
        time: "15 min", calories: 350, category: "Healthy", type: 'breakfast',
        image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&q=80&w=400"
    },
    {
        name: day === 1 ? "Poulet Yassa Tradition" : `Plat Équilibré J${day}`,
        time: "40 min", calories: 580, category: "Cuisine Africaine", type: 'lunch',
        image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&q=80&w=400"
    },
    {
        name: `Mélange de Noix J${day}`,
        time: "5 min", calories: 150, category: "Snack", type: 'snack',
        image: "https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?auto=format&fit=crop&q=80&w=400"
    },
    {
        name: day === 1 ? "Poisson Grillé & Atiéké" : `Dîner de Saison J${day}`,
        time: "25 min", calories: 420, category: "Poisson", type: 'dinner',
        image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=400"
    }
];

const MOCK_BOXES: WeeklyBox[] = [1, 2, 3, 4].map(w => ({
    week: w,
    title: ["Équilibre Gourmand", "Boost Énergie", "Detox Végétale", "Fusion Culturelle"][w - 1],
    theme: ["Saveurs d'Antan", "Performance & Vitalité", "Pureté & Fraîcheur", "Voyage Culinaire"][w - 1],
    color: ["bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-rose-500"][w - 1],
    description: "Un programme complet de 28 repas calculés pour une semaine parfaite.",
    days: [1, 2, 3, 4, 5, 6, 7].map(d => ({
        day: d,
        label: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"][d - 1],
        meals: generateMockMeals(d, w)
    }))
}));

export default function BoxPage() {
    const { user } = useUser();
    const { toast } = useToast();
    const [selectedWeek, setSelectedWeek] = useState(1);
    const [selectedDay, setSelectedDay] = useState(1);
    const [zoomImage, setZoomImage] = useState<string | null>(null);

    const currentBox = useMemo(() => MOCK_BOXES.find(b => b.week === selectedWeek) || MOCK_BOXES[0], [selectedWeek]);
    const currentDayPlan = useMemo(() => currentBox.days.find(d => d.day === selectedDay) || currentBox.days[0], [currentBox, selectedDay]);

    const handlePlanBox = () => {
        toast({
            title: "Planification hebdomadaire",
            description: `Les 28 repas de la semaine ${selectedWeek} ont été synchronisés avec votre calendrier.`,
        });
    };

    const sidebarProps = {
        goals: "Chargement...",
        setGoals: () => { },
        meals: [],
    };

    return (
        <div className="h-screen w-full bg-background font-body select-none">
            <SidebarProvider>
                <AppSidebar collapsible="icon" className="w-80 peer hidden md:block" variant="sidebar">
                    <Sidebar {...sidebarProps} />
                </AppSidebar>
                <SidebarInset>
                    <div className="flex h-full flex-1 flex-col overflow-hidden">
                        <AppHeader
                            title="Ma Boxe Nutritionnelle"
                            icon={<Package className="h-6 w-6" />}
                            user={user}
                            sidebarProps={sidebarProps}
                        />
                        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-10">

                            {/* Hero Section */}
                            <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/10 p-8 md:p-12">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32 rounded-full animate-pulse" />

                                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                    <div className="space-y-6">
                                        <Badge variant="secondary" className="px-4 py-1.5 rounded-full bg-primary/20 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                                            Programme Premium
                                        </Badge>
                                        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[0.9] bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                                            28 Repas par Box. <br />
                                            <span className="text-primary italic">7 jours complets.</span>
                                        </h1>
                                        <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-xl leading-relaxed">
                                            Plus besoin de réfléchir. Petit-déjeuner, déjeuner, goûter et dîner : tout est prévu pour chaque jour de la semaine.
                                        </p>
                                        <div className="flex flex-wrap gap-4 pt-4">
                                            <div className="flex items-center gap-2 bg-background/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-sm">
                                                <Calendar className="h-5 w-5 text-primary" />
                                                <span className="text-xs font-bold uppercase tracking-wider">7 Jours / 7</span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-background/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-sm">
                                                <UtensilsCrossed className="h-5 w-5 text-primary" />
                                                <span className="text-xs font-bold uppercase tracking-wider">4 Repas / Jour</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="hidden lg:block relative aspect-square group">
                                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-75 group-hover:scale-110 transition-transform duration-1000" />
                                        <div className="relative z-10 w-full h-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border-8 border-white group-hover:-rotate-3 transition-transform duration-500 cursor-zoom-in">
                                            <Image
                                                src="https://images.unsplash.com/photo-1547592110-803444465817?auto=format&fit=crop&q=80&w=800"
                                                alt="Meal Prep"
                                                fill
                                                className="object-cover"
                                                onClick={() => setZoomImage("https://images.unsplash.com/photo-1547592110-803444465817?auto=format&fit=crop&q=80&w=800")}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Main Program Section */}
                            <section className="space-y-12">
                                {/* Week Selector */}
                                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mr-4">Semaine :</p>
                                    <div className="flex items-center gap-3 bg-muted/30 p-2 rounded-[2rem] border shadow-inner">
                                        {[1, 2, 3, 4].map(w => (
                                            <button
                                                key={w}
                                                onClick={() => { setSelectedWeek(w); setSelectedDay(1); }}
                                                className={cn(
                                                    "w-12 h-12 rounded-full flex items-center justify-center text-sm font-black transition-all",
                                                    selectedWeek === w
                                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110"
                                                        : "text-muted-foreground hover:bg-background hover:text-foreground"
                                                )}
                                            >
                                                {w}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Box Info & Day Nav */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                                    {/* Left: Box Details */}
                                    <div className="lg:col-span-4 space-y-8">
                                        <Card className="rounded-[2.5rem] overflow-hidden border-none bg-accent/5 flex flex-col group shadow-xl">
                                            <CardHeader className={cn("p-8 transition-colors duration-700", currentBox.color)}>
                                                <Badge className="w-fit bg-white/20 text-white border-none uppercase text-[10px] tracking-widest mb-4">Focus Semaine {selectedWeek}</Badge>
                                                <CardTitle className="text-4xl font-black text-white leading-tight">
                                                    {currentBox.title}
                                                </CardTitle>
                                                <CardDescription className="text-white/80 font-bold uppercase tracking-widest text-xs pt-2">
                                                    Thème: {currentBox.theme}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-8 space-y-6">
                                                <p className="text-muted-foreground font-medium leading-relaxed italic">
                                                    "{currentBox.description}"
                                                </p>
                                                <Button onClick={handlePlanBox} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest group shadow-lg">
                                                    Planifier les 28 repas
                                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                                                </Button>
                                            </CardContent>
                                        </Card>

                                        {/* Day Selector (Vertical/Grid on Mobile) */}
                                        <div className="bg-background border-2 border-muted/20 rounded-[2.5rem] p-6 space-y-4">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary text-center">Calendrier de la semaine</p>
                                            <div className="flex flex-col gap-2">
                                                {currentBox.days.map(d => (
                                                    <button
                                                        key={d.day}
                                                        onClick={() => setSelectedDay(d.day)}
                                                        className={cn(
                                                            "w-full px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-between transition-all",
                                                            selectedDay === d.day
                                                                ? "bg-primary/10 text-primary border-2 border-primary/20 translate-x-2"
                                                                : "bg-muted/5 text-muted-foreground hover:bg-muted/10 border-2 border-transparent"
                                                        )}
                                                    >
                                                        <span>{d.label}</span>
                                                        {selectedDay === d.day && <ChevronRight className="h-4 w-4" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Daily Meals Grid */}
                                    <div className="lg:col-span-8 flex flex-col gap-8">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center text-white font-black">
                                                    {selectedDay}
                                                </div>
                                                <h3 className="text-2xl font-black uppercase tracking-tighter">
                                                    Menu du {currentDayPlan.label}
                                                </h3>
                                            </div>
                                            <Badge variant="outline" className="h-8 border-2 px-4 rounded-xl font-bold uppercase text-[10px] tracking-widest bg-accent/50">
                                                {currentDayPlan.meals.reduce((acc, m) => acc + m.calories, 0)} kcal / Jour
                                            </Badge>
                                        </div>

                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={`${selectedWeek}-${selectedDay}`}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.3 }}
                                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                            >
                                                {currentDayPlan.meals.map((meal, idx) => (
                                                    <Card key={meal.type} className="group relative aspect-[7/10] rounded-xl overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 bg-muted cursor-zoom-in">
                                                        <Image
                                                            src={meal.image}
                                                            alt={meal.name}
                                                            fill
                                                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                                            onClick={() => setZoomImage(meal.image)}
                                                        />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                            <ZoomIn className="h-12 w-12 text-white drop-shadow-lg" />
                                                        </div>
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent flex flex-col justify-end p-5 md:p-8">
                                                            <div className="flex items-center gap-1.5 mb-2 transition-transform duration-500 group-hover:-translate-y-1">
                                                                <Badge className="bg-primary/20 backdrop-blur-sm text-white border-white/10 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm">
                                                                    <span className="flex items-center gap-1.5">
                                                                        {mealTypes[meal.type].icon}
                                                                        {mealTypes[meal.type].label}
                                                                    </span>
                                                                </Badge>
                                                            </div>
                                                            <h4 className="text-xl md:text-2xl font-black text-white uppercase italic leading-tight mb-3 transition-transform duration-500 group-hover:-translate-y-2">
                                                                {meal.name}
                                                            </h4>
                                                            <div className="flex items-center gap-5 text-[9px] font-black text-white/50 uppercase tracking-widest transition-transform duration-500 group-hover:-translate-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <Clock className="h-3.5 w-3.5 text-primary" />
                                                                    <span>{meal.time}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Flame className="h-3.5 w-3.5 text-primary" />
                                                                    <span>{meal.calories} kcal</span>
                                                                </div>
                                                            </div>

                                                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all">
                                                                <button className="h-10 w-10 rounded-full bg-white text-primary flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all">
                                                                    <ChevronRight className="h-5 w-5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                ))}
                                            </motion.div>
                                        </AnimatePresence>

                                        {/* Weekly Insight Box */}
                                        <div className="bg-gradient-to-r from-primary/5 to-transparent border-2 border-dashed rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-8 shadow-inner">
                                            <div className="h-20 w-20 bg-background rounded-3xl flex items-center justify-center shadow-lg border border-primary/10">
                                                <Sparkles className="h-10 w-10 text-primary" />
                                            </div>
                                            <div className="space-y-2 text-center md:text-left">
                                                <p className="text-xs font-black text-primary uppercase tracking-[0.2em]">Le saviez-vous ?</p>
                                                <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-lg">
                                                    Ce programme de 28 repas a été conçu pour alterner les sources de protéines et maximiser l'apport en fibres, tout en gardant une cohérence calorique sur l'ensemble de la semaine.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <div className="pb-20" />
                        </main>
                    </div>
                </SidebarInset>
            </SidebarProvider>
            <ImageZoomLightbox
                isOpen={!!zoomImage}
                imageUrl={zoomImage}
                onClose={() => setZoomImage(null)}
            />
        </div>
    );
}
