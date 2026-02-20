'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Check, Star, Zap, Shield, Crown, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { LogoIcon } from '@/components/icons';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Image from 'next/image';
import Autoplay from 'embla-carousel-autoplay';
import { useLoading } from '@/contexts/loading-context';

const plans = [
  {
    name: 'Welcome',
    price: '1,99€',
    annualPrice: '21,49€',
    annualDiscount: '10%',
    description: 'Essentiel pour les débutants.',
    icon: Zap,
    features: [
      'Planification intelligente',
      'Analyse nutritionnelle',
      'Liste de courses auto',
      'Mode hors-ligne',
    ],
    isPopular: false,
    color: 'from-blue-500/20 to-cyan-500/20',
    glow: 'bg-blue-500/10'
  },
  {
    name: 'Éco',
    price: '4,60€',
    annualPrice: '46,92€',
    annualDiscount: '15%',
    description: 'Le meilleur rapport qualité-prix.',
    icon: Shield,
    features: [
      'IA d\'apprentissage profond',
      'Optimisation budget expert',
      'Score d\'équilibre IA',
      'Partage familial (2 profils)',
      'Recettes personnalisées',
    ],
    isPopular: true,
    color: 'from-primary/20 to-emerald-500/20',
    glow: 'bg-primary/20'
  },
  {
    name: 'Premium',
    price: '15€',
    annualPrice: '135€',
    annualDiscount: '25%',
    description: 'L\'expérience ultime.',
    icon: Crown,
    features: [
      'Coaching IA illimité',
      'Accès My Cook Market',
      'Planification multi-profils',
      'Guide restaurants IA',
      'Support Ultra-prioritaire',
    ],
    isPopular: false,
    color: 'from-purple-500/20 to-pink-500/20',
    glow: 'bg-purple-500/10'
  },
];

const carouselItems = [
  { image: '/mcf/20.png' },
  { image: '/mcf/17.png' },
  { image: '/mcf/19.png' }
];

export default function PricingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const { firestore } = useFirebase();
  const { showLoading, hideLoading } = useLoading();
  const [api, setApi] = useState<any>();
  const autoplay = useRef(Autoplay({ delay: 7000, stopOnInteraction: false }));

  const handleConfirmBeta = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour activer votre accès.",
        variant: "destructive",
      });
      return;
    }

    showLoading("Initialisation de votre accès...");

    const userDocRef = doc(firestore, 'users', user.uid);
    try {
      await updateDoc(userDocRef, {
        subscriptionStatus: 'free'
      });

      setTimeout(() => {
        router.push('/avatar-selection');
      }, 1000);

    } catch (error) {
      console.error("Failed to update subscription:", error);
      toast({
        title: "Erreur technique",
        description: "Impossible d'activer votre essai. Réessayez dans un instant.",
        variant: "destructive",
      });
      hideLoading();
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-start p-4 md:p-6 lg:p-12 overflow-y-auto selection:bg-primary/20">
      <div className="mx-auto w-full max-w-[900px] space-y-6 md:space-y-10 py-6 md:py-10">

        <div className="flex flex-col items-center text-center gap-6 mb-2">
          {/* Logo and Greeting */}
          <div className="flex flex-col items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white rounded-xl shadow-xl flex items-center justify-center transform -rotate-3 transition-transform hover:rotate-0 duration-500">
              <LogoIcon className="w-8 h-8" />
            </div>
            <p className="text-primary font-black text-[10px] tracking-[0.3em] uppercase">My Cook Flex Premium</p>
          </div>

          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shadow-inner relative group">
            <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full animate-pulse group-hover:scale-125 transition-transform duration-1000" />
            <Crown className="h-7 w-7 text-primary relative z-10" />
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">
              Choisissez votre Énergie
            </h1>
            <p className="text-muted-foreground font-medium max-w-[400px] mx-auto leading-relaxed text-base">
              Une expérience sans compromis, sans carte bancaire demandée.
            </p>
          </div>
        </div>

        <AlertDialog>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <Card
                  key={plan.name}
                  className={cn(
                    'relative flex flex-col rounded-[2rem] border-2 transition-all duration-500 group overflow-hidden',
                    plan.isPopular
                      ? 'border-primary bg-primary/[0.03] shadow-[0_0_40px_-15px_rgba(var(--primary),0.3)] scale-105 z-10'
                      : 'border-muted-foreground/10 bg-background hover:border-primary/40 hover:translate-y-[-6px]'
                  )}
                >
                  {/* Futuristic Background Glow */}
                  <div className={cn("absolute -top-24 -right-24 w-48 h-48 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000", plan.glow)} />

                  {plan.isPopular && (
                    <div className="absolute top-8 right-8">
                      <div className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20">
                        <Star className="h-3 w-3 fill-current" />
                        Recommandé
                      </div>
                    </div>
                  )}

                  <CardHeader className="pb-3 md:pb-4 p-4 md:p-6">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br shadow-inner", plan.color)}>
                      <Icon className="h-5 w-5 text-foreground" />
                    </div>
                    <CardTitle className="text-xl font-black tracking-tight">{plan.name}</CardTitle>
                    <CardDescription className="font-bold text-muted-foreground/80 text-sm">{plan.description}</CardDescription>

                    <div className="pt-6 space-y-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl md:text-4xl font-black tracking-tighter">{plan.price}</span>
                        <span className="text-muted-foreground font-bold text-xs">/mois</span>
                      </div>
                      <p className="text-[9px] uppercase font-black tracking-widest text-primary/60">
                        ou {plan.annualPrice}/an (Economisez {plan.annualDiscount})
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-4 md:space-y-6 p-4 md:p-6 pt-0">
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent" />
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start group/li">
                          <div className="mr-3 mt-1 h-1.5 w-1.5 rounded-full bg-primary transition-transform group-hover/li:scale-150 shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                          <span className="text-xs font-bold text-muted-foreground/90 group-hover/li:text-foreground transition-colors leading-tight">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="p-4 md:p-6 pt-2">
                    <AlertDialogTrigger asChild>
                      <Button
                        className={cn(
                          "w-full h-12 rounded-xl font-black tracking-tight text-base group/btn relative overflow-hidden transition-all duration-500",
                          plan.isPopular
                            ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/30"
                            : "bg-background border-2 border-muted-foreground/20 hover:border-primary/60"
                        )}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:btn:translate-x-full transition-transform duration-1000" />
                        Choisir {plan.name}
                      </Button>
                    </AlertDialogTrigger>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          <div className="mt-12 flex flex-col items-center gap-6">
            <div className="flex items-center gap-4 text-muted-foreground/20">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-current" />
              <Sparkles className="h-4 w-4" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-current" />
            </div>

            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="h-12 px-8 font-black text-[10px] tracking-[0.2em] uppercase hover:text-primary hover:bg-primary/5 group transition-all duration-500 rounded-full border border-transparent hover:border-primary/20">
                Commencer l'essai gratuit maintenant
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
              </Button>
            </AlertDialogTrigger>
          </div>

          <AlertDialogContent className="rounded-[2rem] border-2 border-primary/20 bg-background/95 backdrop-blur-2xl max-w-md p-5 md:p-8 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/10 blur-[80px] rounded-full" />

            <AlertDialogHeader className="items-center text-center space-y-4 relative z-10">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center transform -rotate-6 mb-1 border border-primary/5">
                <LogoIcon className="w-10 h-10" />
              </div>
              <AlertDialogTitle className="text-2xl font-black tracking-tighter">Accès Bêta Prioritaire</AlertDialogTitle>
              <AlertDialogDescription className="text-base font-bold text-muted-foreground/80 leading-relaxed">
                Félicitations ! En tant que pionnier, My Cook Flex vous est offert
                <span className="text-primary font-black ml-1">gratuitement</span> pendant toute la durée de la bêta.
                <br /><br />
                Accédez à l'intégralité des outils sans aucun frais dès maintenant.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="pt-8 relative z-10">
              <AlertDialogAction
                onClick={handleConfirmBeta}
                className="w-full h-14 rounded-xl text-lg font-black shadow-2xl shadow-primary/30 bg-primary group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                Activer mon accès
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        <p className="text-center text-muted-foreground/40 text-[8px] font-black uppercase tracking-[0.3em] mt-12">
          Secure encrypted checkout • Next-Gen meal planning
        </p>
      </div>
    </div>
  );
}
