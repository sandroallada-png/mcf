
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Lightbulb, Loader2, Sparkles, Target, User, Activity, Calendar, Refrigerator, BarChart2, Star, History, ShoppingCart, MessageSquare, Bot, Save, LayoutDashboard, Trophy, ChefHat } from 'lucide-react';
import type { Meal } from '@/lib/types';
import { getTipsAction } from '@/app/actions';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '../icons';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import Link from 'next/link';
import { useUser, useFirebase } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { ButtonWithLoading } from '../ui/button-with-loading';
import { Progress } from '../ui/progress';
import { SidebarContent } from '../ui/sidebar';

export const mainNavLinks = [
  { href: '/dashboard', label: 'Tableau de bord', icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: '/market', label: 'My Cook Market', icon: <ShoppingCart className="h-5 w-5" /> },
  { href: '/calendar', label: 'Calendrier', icon: <Calendar className="h-5 w-5" /> },
  { href: '/forum', label: 'Forum', icon: <MessageSquare className="h-5 w-5" /> },
  { href: '/my-flex-ai', label: 'Assistant Personnel', icon: <Bot className="h-5 w-5" /> },
  { href: '/fridge', label: 'Frigo', icon: <Refrigerator className="h-5 w-5" /> },
  { href: '/mon-niveau', label: 'Mon Niveau', icon: <Trophy className="h-5 w-5" /> },
  { href: '/cuisine', label: 'Cuisine', icon: <ChefHat className="h-5 w-5" /> },
];

export const accountNavLinks = [
  { href: '#', label: 'Mon Abonnement', icon: <Star className="h-5 w-5" /> },
  { href: '#', label: 'Profil', icon: <User className="h-5 w-5" /> },
]

interface SidebarProps {
  goals: string;
  setGoals: (goals: string) => void;
  meals: Meal[];
  isMobile?: boolean;
}

export function Sidebar({ goals, setGoals, meals, isMobile = false }: SidebarProps) {
  const [tips, setTips] = useState<string>('');
  const { toast } = useToast();
  const { user } = useUser();

  const handleGetTips = async () => {
    setTips('');
    const foodLogs = meals.map(m => `${m.name} (${m.calories} kcal)`).join(', ');
    try {
      const { tips: newTips, error } = await getTipsAction({
        foodLogs: foodLogs || 'Aucun aliment enregistré aujourd\'hui.',
        dietaryGoals: goals,
      });

      if (error) {
        throw new Error(error);
      } else if (newTips) {
        setTips(newTips);
      }
    } catch (e: any) {
       toast({
        variant: 'destructive',
        title: 'Erreur',
        description: e.message || 'Impossible de générer des conseils.',
      });
    }
  };

  const handleSoon = (e: React.MouseEvent, href: string) => {
    if (href === '#') {
      e.preventDefault();
      toast({
        title: 'Bientôt disponible',
        description: 'Cette fonctionnalité est en cours de développement.',
      });
    }
  };

    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const caloriesPerLevel = 500;
    const currentLevel = Math.max(1, Math.floor(totalCalories / caloriesPerLevel) + 1);
    const progressPercentage = (totalCalories % caloriesPerLevel) / (caloriesPerLevel / 100);
  
  if (isMobile) {
    return (
        <div className="flex w-full flex-col bg-card/50 p-4 h-full">
            <div className="flex flex-1 flex-col gap-4">
                <Card className="shadow-md">
                    <CardHeader className="p-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                                Niveau {currentLevel}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">{totalCalories % caloriesPerLevel} / {caloriesPerLevel} XP</p>
                        </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        <Progress value={progressPercentage} />
                    </CardContent>
                </Card>
                <Card className="shadow-md">
                <CardHeader className="flex-row items-center gap-3 space-y-0 p-3">
                    <Target className="h-5 w-5 text-primary" />
                    <div>
                    <CardTitle className="text-base">Vos Objectifs</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                    <Textarea
                    value={goals}
                    onChange={e => setGoals(e.target.value)}
                    placeholder="ex: Perdre 5kg..."
                    className="h-24 resize-none text-sm"
                    />
                    <div className="mt-2 rounded-lg border bg-background/50 p-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-muted-foreground" />
                                <h4 className="text-xs font-semibold">État</h4>
                            </div>
                            <Badge variant="secondary" className="text-xs">En cours</Badge>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3 h-8 text-xs" onClick={() => toast({ title: 'Objectifs sauvegardés !' })}><Save className="mr-2 h-3 w-3" /> Sauvegarder</Button>
                </CardContent>
                </Card>
                <Card className="flex flex-1 flex-col shadow-md">
                <CardHeader className="flex-row items-center gap-3 space-y-0 p-3">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <div>
                    <CardTitle className="text-base">Conseils de l'outil</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between p-3 pt-0">
                    {tips ? (
                    <div className="prose prose-sm rounded-lg bg-accent/10 p-3 text-accent-foreground/80 h-full overflow-y-auto">
                        <p className="text-xs">{tips}</p>
                    </div>
                    ) : (
                    <div className="flex flex-1 items-center justify-center text-center text-xs text-muted-foreground">
                        Cliquez pour générer vos conseils.
                    </div>
                    )}
                     <ButtonWithLoading onClick={handleGetTips} className="mt-3 w-full h-9">
                        <Lightbulb className="mr-2 h-4 w-4" />
                        Générer mes conseils
                    </ButtonWithLoading>
                </CardContent>
                </Card>
            </div>
        </div>
    )
  }

  return (
    <SidebarContent className="p-4 bg-sidebar/80 backdrop-blur-lg">
        <div className="mb-4">
            <Logo />
        </div>
        
        <Card className="shadow-md mb-4">
            <CardHeader className="p-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        Niveau {currentLevel}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">{totalCalories % caloriesPerLevel} / {caloriesPerLevel} XP</p>
                </div>
            </CardHeader>
            <CardContent className="px-3 pb-3">
                <Progress value={progressPercentage} />
            </CardContent>
        </Card>

        <nav className="flex flex-col flex-1">
            <div className="flex-1 space-y-2">
                {mainNavLinks.map(link => (
                <Link key={link.label} href={link.href} onClick={(e) => handleSoon(e, link.href)} className="flex items-center gap-3 text-foreground/70 hover:text-foreground hover:bg-muted p-2 rounded-md transition-colors text-sm font-medium">
                    {link.icon}
                    {link.label}
                </Link>
                ))}
            </div>
        </nav>
        
        <Separator className="my-4" />

        <div className="flex flex-col gap-6">
            <Card className="shadow-md">
            <CardHeader className="flex-row items-center gap-3 space-y-0 p-3">
                <Target className="h-5 w-5 text-primary" />
                <div>
                <CardTitle className='text-sm'>Vos Objectifs</CardTitle>
                </div>
            </CardHeader>
            <CardContent className='p-3 pt-0'>
                <Textarea
                value={goals}
                onChange={e => setGoals(e.target.value)}
                placeholder="ex: Perdre 5kg..."
                className="h-24 resize-none text-xs"
                />
                 <div className="mt-2 rounded-lg border bg-background/50 p-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                            <h4 className="text-xs font-semibold">État</h4>
                        </div>
                        <Badge variant="secondary">En cours</Badge>
                    </div>
                </div>
            </CardContent>
            </Card>

            <Card className="flex flex-1 flex-col shadow-md">
            <CardHeader className="flex-row items-center gap-3 space-y-0 p-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <div>
                    <CardTitle className='text-sm'>Conseils de l'outil</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between p-3 pt-0">
                {tips ? (
                <div className="prose prose-sm rounded-lg bg-accent/10 p-2 text-accent-foreground/80 h-32 overflow-y-auto">
                    <p className="text-xs">{tips}</p>
                </div>
                ) : (
                <div className="flex h-32 flex-1 items-center justify-center text-center text-xs text-muted-foreground">
                    Générez vos conseils.
                </div>
                )}
                <ButtonWithLoading onClick={handleGetTips} className="mt-2 w-full h-8 text-xs">
                     <Lightbulb className="mr-2 h-3 w-3" />
                     Générer
                </ButtonWithLoading>
            </CardContent>
            </Card>
        </div>
    
        <div className="mt-auto flex flex-col pt-4 border-t">
        <div className="space-y-2">
            {accountNavLinks.map(link => (
                <Link key={link.label} href={link.href} onClick={(e) => handleSoon(e, link.href)} className="flex items-center gap-3 text-foreground/70 hover:text-foreground hover:bg-muted p-2 rounded-md transition-colors text-sm font-medium">
                    {link.icon}
                    {link.label}
                </Link>
            ))}
        </div>
        <Separator className="my-4" />
        <div className="flex items-center gap-3 p-2">
            <Avatar>
                <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.displayName || 'Utilisateur'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
        </div>
        </div>
    </SidebarContent>
  );
}
