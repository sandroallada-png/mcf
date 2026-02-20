
'use client';


import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo, GoogleIcon } from '@/components/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/firebase/auth';
import { initiateEmailSignIn, initiateGoogleSignIn } from '@/firebase/auth-actions';
import { useLoading } from '@/contexts/loading-context';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Image from 'next/image';
import Autoplay from 'embla-carousel-autoplay';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

const carouselItems = [
  { image: '/mcf/19.png' },
  { image: '/mcf/20.png' },
  { image: '/mcf/21.png' },
  { image: '/mcf/17.png' },
  { image: '/mcf/18.png' }
];

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { showLoading, hideLoading } = useLoading();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [api, setApi] = useState<any>();
  const [current, setCurrent] = useState(0);

  const autoplay = useRef(Autoplay({ delay: 6000, stopOnInteraction: false }));

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: 'Champs requis',
        description: 'Veuillez renseigner votre email et votre mot de passe.',
      });
      return;
    }

    showLoading("Connexion en cours...");

    try {
      await initiateEmailSignIn(auth, email, password);
    } catch (error) {
      console.error("Login failed:", error);
      hideLoading();
    }
  };

  const handleGoogleSignIn = async () => {
    showLoading("Authentification sécurisée...");
    try {
      await initiateGoogleSignIn(auth);
    } catch (error) {
      console.error("Google sign in failed:", error);
      hideLoading();
    }
  };

  return (
    <div className="flex min-h-screen w-full lg:grid lg:grid-cols-2 lg:h-screen lg:overflow-hidden bg-background">

      {/* Left Pane - Carousel (Always hidden on mobile, fixed on desktop) */}
      <div className="hidden lg:flex bg-primary flex-col items-center justify-center relative overflow-hidden w-full h-full text-white">
        <div className="absolute inset-0 z-0 text-white">
          <Carousel
            setApi={setApi}
            plugins={[autoplay.current]}
            className="w-full h-full"
            opts={{ loop: true }}
          >
            <CarouselContent className="h-screen -ml-0">
              {carouselItems.map((item, index) => (
                <CarouselItem key={index} className="pl-0 relative h-screen bg-[#347d1c] flex items-center justify-center lg:block text-white">
                  {/* Desktop View */}
                  <div className="hidden lg:block absolute inset-0">
                    <Image src={item.image} alt="Cuisine" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority={index === 0} />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Pagination Dots */}
        <div className="absolute bottom-12 left-0 right-0 z-20 flex justify-center gap-2">
          {carouselItems.map((_, index) => (
            <div key={index} className={`h-2 w-2 rounded-full transition-all duration-300 ${current === index ? 'bg-white w-6' : 'bg-white/40'}`} />
          ))}
        </div>

        <div className="absolute top-12 left-12 z-10 flex flex-col gap-2">
          <div className="p-4 rounded-3xl backdrop-blur-md bg-black/20 border border-white/10 shadow-2xl">
            <Logo className="w-48 h-auto brightness-0 invert" />
            <p className="text-white/80 font-medium tracking-wide mt-2">L'art de cuisiner intelligemment.</p>
          </div>
        </div>
      </div>

      {/* Right Pane - Professional Form Side */}
      <div className="flex w-full bg-background p-6 lg:p-12 lg:h-full lg:overflow-y-auto relative items-center justify-center">
        <div className="mx-auto w-full max-w-[420px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="flex flex-col items-center gap-3 text-center">
            <div>
              <h1 className="text-4xl font-black tracking-tight">De retour ?</h1>
              <p className="text-muted-foreground mt-2 font-medium max-w-[300px] mx-auto leading-relaxed">
                Connectez-vous pour retrouver vos recettes et votre plan nutritionnel.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="grid gap-4">
              <Button
                variant="outline"
                className="h-14 text-base font-bold border-2 hover:bg-muted relative overflow-hidden group transition-all hover:scale-[1.02] active:scale-95"
                onClick={handleGoogleSignIn}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-red-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <GoogleIcon className="mr-3 h-5 w-5" />
                Continuer avec Google
              </Button>

              <div className="relative py-4 flex items-center gap-4">
                <div className="flex-1 h-px bg-muted-foreground/20" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">Ou</span>
                <div className="flex-1 h-px bg-muted-foreground/20" />
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">E-mail</Label>
                <Input type="email" placeholder="jean@exemple.com" value={email} onChange={e => setEmail(e.target.value)} className="h-14 border-2 rounded-2xl focus-visible:ring-primary focus-visible:border-primary text-base font-medium px-5" required />
              </div>
              <div className="space-y-3 relative">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Mot de passe</Label>
                  <Link href="/forgot-password" size="sm" className="text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-70 transition-opacity">Oublié ?</Link>
                </div>
                <div className="relative group">
                  <Input type={isPasswordVisible ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="h-14 border-2 rounded-2xl pr-14 px-5 text-base" required />
                  <button type="button" onClick={togglePasswordVisibility} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                    {isPasswordVisible ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full h-16 text-lg font-black shadow-2xl shadow-primary/30 rounded-2xl group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                Se connecter
                <ArrowLeft className="ml-3 h-5 w-5 rotate-180 group-hover:translate-x-2 transition-transform" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
