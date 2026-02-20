
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Palette, ArrowRight, Sparkles } from 'lucide-react';
import { ThemeSelector } from '@/components/personalization/theme-selector';
import { useAccentTheme } from '@/contexts/accent-theme-context';
import { useUser, useFirebase } from '@/firebase';
import { setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Label } from '@/components/ui/label';
import { useLoading } from '@/contexts/loading-context';
import { LogoIcon } from '@/components/icons';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Image from 'next/image';
import Autoplay from 'embla-carousel-autoplay';

const carouselItems = [
  { image: '/mcf/19.png' },
  { image: '/mcf/21.png' },
  { image: '/mcf/18.png' }
];

export default function PersonalizationPage() {
  const router = useRouter();
  const { theme, setTheme } = useAccentTheme();
  const { user } = useUser();
  const { firestore } = useFirebase();
  const [api, setApi] = useState<any>();
  const { showLoading, hideLoading } = useLoading();
  const autoplay = useRef(Autoplay({ delay: 6000, stopOnInteraction: false }));

  // Persistence: Load data on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('mcf_personalization_theme');
    if (savedTheme) {
      try {
        const data = JSON.parse(savedTheme);
        if (data) setTheme(data);
      } catch (e) {
        console.error("Failed to load personalization draft", e);
      }
    }
  }, [setTheme]);

  // Persistence: Save data on change
  useEffect(() => {
    localStorage.setItem('mcf_personalization_theme', JSON.stringify(theme));
  }, [theme]);

  const handleFinish = async () => {
    showLoading("Préparation de votre univers...");

    try {
      if (user) {
        const userRef = doc(firestore, 'users', user.uid);
        await setDocumentNonBlocking(userRef, { theme: theme.name }, { merge: true });
      }

      // Petit délai pour savourer l'animation "Waouh"
      setTimeout(() => {
        router.push('/preferences');
        localStorage.removeItem('mcf_personalization_theme');
      }, 1000);

    } catch (error) {
      console.error("Error saving theme:", error);
      hideLoading();
    }
  };

  const handleSkip = () => {
    router.push('/preferences');
  };

  return (
    <div className="flex min-h-screen w-full lg:grid lg:grid-cols-2 lg:h-screen lg:overflow-hidden bg-background">
      {/* Left Pane - Visual Inspiration (Sticky on Desktop) */}
      <div className="hidden lg:flex bg-primary flex-col items-center justify-center relative overflow-hidden w-full h-screen lg:sticky lg:top-0">
        <div className="absolute inset-0 z-0 text-white">
          <Carousel
            setApi={setApi}
            plugins={[autoplay.current]}
            className="w-full h-full"
            opts={{ loop: true }}
          >
            <CarouselContent className="h-screen -ml-0">
              {carouselItems.map((item, index) => (
                <CarouselItem key={index} className="pl-0 relative h-screen">
                  <Image src={item.image} alt="Cuisine Inspiration" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority={index === 0} />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        <div className="absolute top-12 left-12 z-10 flex flex-col gap-2">
          <div className="p-5 rounded-[2rem] backdrop-blur-md bg-black/20 border border-white/10 shadow-2xl">
            <div className="w-12 h-12 bg-white rounded-xl shadow-2xl flex items-center justify-center transform -rotate-3 mb-4">
              <LogoIcon className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-lg leading-tight">Personnalisez votre<br />expérience culinaire.</h2>
          </div>
        </div>
      </div>

      {/* Right Pane - Content */}
      <div className="w-full flex items-start justify-center p-6 lg:p-12 lg:h-full overflow-y-auto bg-background">
        <div className="mx-auto w-full max-w-[500px] space-y-12 py-16">

          <div className="flex flex-col items-center text-center gap-10">
            {/* Logo and Greeting */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-2xl flex items-center justify-center transform -rotate-3 transition-transform hover:rotate-0 duration-500">
                <LogoIcon className="w-10 h-10" />
              </div>
              <p className="text-primary font-black text-xs tracking-[0.3em] uppercase">Configuration du Style</p>
            </div>

            <div className="w-20 h-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center shadow-inner relative group">
              <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full animate-pulse group-hover:scale-150 transition-transform duration-1000" />
              <Palette className="h-10 w-10 text-primary relative z-10" />
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">Votre Cuisine,<br />Vos Couleurs.</h1>
              <p className="text-muted-foreground font-medium max-w-[340px] mx-auto leading-relaxed">
                Choisissez une couleur qui vous ressemble pour l'interface de My Cook Flex.
              </p>
            </div>
          </div>

          <div className="bg-primary/[0.02] border-2 border-primary/10 rounded-[3rem] p-10 space-y-10 relative overflow-hidden group hover:border-primary/20 transition-all duration-500 shadow-xl shadow-primary/[0.02]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />

            <div className="space-y-8 relative z-10 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4">
                <div className="h-8 w-1 bg-primary rounded-full hidden md:block" />
                <Label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Thèmes Disponibles</Label>
              </div>

              <div className="pt-2 flex justify-center">
                <ThemeSelector selectedThemeName={theme.name} onThemeChange={setTheme} />
              </div>

              <div className="flex items-start gap-4 p-6 bg-background/50 rounded-3xl border border-primary/5 italic text-sm text-muted-foreground leading-relaxed shadow-inner">
                <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                "Ce réglage s'appliquera sur tous vos écrans pour une expérience utilisateur sur-mesure et immersive."
              </div>
            </div>
          </div>

          <div className="space-y-5 pt-4">
            <Button onClick={handleFinish} className="w-full h-18 py-8 text-xl font-black shadow-2xl shadow-primary/30 rounded-3xl group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              Appliquer & Continuer
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
            </Button>

            <Button onClick={handleSkip} variant="ghost" className="w-full h-14 text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-foreground rounded-2xl">
              Passer pour le moment
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
