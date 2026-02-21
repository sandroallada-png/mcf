
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useUser, useFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { Check, Sparkles, User, Camera, ArrowRight, Globe, HelpCircle } from 'lucide-react';
import { ImageUploader } from '@/components/admin/image-uploader';
import Image from 'next/image';
import { avatarUrls } from '@/lib/avatars';
import { countries } from '@/lib/countries';
import { cn } from '@/lib/utils';
import { useLoading } from '@/contexts/loading-context';
import { LogoIcon } from '@/components/icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function AvatarSelectionPage() {
  const router = useRouter();
  const { user } = useUser();
  const { firestore } = useFirebase();
  const { showLoading, hideLoading } = useLoading();
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Persistence: Load data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('mcf_avatar_draft');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.selectedAvatar) setSelectedAvatar(data.selectedAvatar);
        if (data.selectedCountry) setSelectedCountry(data.selectedCountry);
      } catch (e) {
        console.error("Failed to load avatar draft", e);
      }
    }
  }, []);

  // Persistence: Save data on change
  useEffect(() => {
    const draft = { selectedAvatar, selectedCountry };
    localStorage.setItem('mcf_avatar_draft', JSON.stringify(draft));
  }, [selectedAvatar, selectedCountry]);

  const handleSave = async () => {
    if (!user || !selectedAvatar) {
      toast({
        variant: 'destructive',
        title: 'Aucun avatar sélectionné',
        description: 'Veuillez choisir un avatar ou en télécharger un.',
      });
      return;
    }

    if (!selectedCountry) {
      toast({
        variant: 'destructive',
        title: 'Pays requis',
        description: 'Veuillez sélectionner votre pays d\'origine.',
      });
      return;
    }

    setIsSaving(true);
    showLoading('Finalisation de votre profil...');

    try {
      const userRef = doc(firestore, `users/${user.uid}`);
      await updateDoc(userRef, {
        avatarUrl: selectedAvatar,
        photoURL: selectedAvatar,
        country: selectedCountry,
      });

      toast({
        title: 'Profil prêt !',
        description: 'Bienvenue dans votre nouvel univers culinaire.',
      });

      router.push('/dashboard?welcome=true');
      localStorage.removeItem('mcf_avatar_draft');
    } catch (error) {
      console.error('Failed to save avatar:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Impossible d'enregistrer. Veuillez réessayer.",
      });
      hideLoading();
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadSuccess = (url: string) => {
    setSelectedAvatar(url);
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-start p-6 lg:p-12 overflow-y-auto selection:bg-primary/20">
      <div className="mx-auto w-full max-w-[800px] space-y-10 py-10">

        <div className="flex flex-col items-center text-center gap-6 mb-2">
          {/* Logo and Greeting */}
          <div className="flex flex-col items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white rounded-xl shadow-xl flex items-center justify-center transform -rotate-3 transition-transform hover:rotate-0 duration-500">
              <LogoIcon className="w-8 h-8" />
            </div>
            <p className="text-primary font-black text-[10px] tracking-[0.3em] uppercase">Configuration Profil</p>
          </div>

          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shadow-inner relative group">
            <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full animate-pulse group-hover:scale-125 transition-transform duration-1000" />
            <User className="h-7 w-7 text-primary relative z-10" />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">
              Choisissez votre Avatar
            </h1>
            <p className="text-muted-foreground font-medium max-w-[400px] mx-auto leading-relaxed text-base">
              Personnalisez votre présence sur My Cook Flex pour une expérience plus humaine.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Side: Upload & Preview */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-primary/[0.02] border-2 border-primary/10 rounded-[2rem] p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />

              <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="flex items-center gap-3 w-full">
                  <Camera className="h-4 w-4 text-primary" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Photo Personnelle</p>
                </div>

                <div className="w-full">
                  <ImageUploader
                    initialImageUrl={selectedAvatar || ''}
                    onUploadSuccess={handleUploadSuccess}
                  />
                </div>

                <p className="text-[9px] text-muted-foreground font-bold text-center italic">
                  "Téléchargez votre propre image pour un profil unique."
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Avatar Grid */}
          <div className="md:col-span-7 space-y-6">
            <div className="bg-background border-2 border-muted-foreground/10 rounded-[2rem] p-6 hover:border-primary/20 transition-all duration-500">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sélection Rapide</p>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {avatarUrls.map((avatar, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedAvatar(avatar.url)}
                    className={cn(
                      'relative aspect-square w-full rounded-2xl border-2 border-transparent transition-all hover:scale-110 active:scale-95 overflow-hidden group/item shadow-sm',
                      selectedAvatar === avatar.url ? 'border-primary ring-4 ring-primary/10' : 'hover:border-primary/40',
                      avatar.mobileOnly && 'md:hidden'
                    )}
                  >
                    <Image
                      src={avatar.url}
                      alt={`Avatar ${index + 1}`}
                      fill
                      sizes="(max-width: 640px) 25vw, (max-width: 1024px) 20vw, 100px"
                      className="object-cover transition-transform duration-500 group-hover/item:scale-110"
                    />
                    {selectedAvatar === avatar.url && (
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-[2px] animate-in fade-in duration-300">
                        <div className="bg-primary rounded-full p-1.5 shadow-lg shadow-primary/40">
                          <Check className="h-3 w-3 text-white stroke-[4px]" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-background border-2 border-muted-foreground/10 rounded-[2rem] p-6 hover:border-primary/20 transition-all duration-500">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-primary" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Votre Pays d'Origine</p>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary group/help">
                      <HelpCircle className="h-4 w-4 transition-transform group-hover:scale-110" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent side="top" align="end" className="w-72 p-5 rounded-[1.5rem] border-2 shadow-2xl bg-background/95 backdrop-blur-xl">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">Pourquoi cette info ?</p>
                      <p className="text-xs font-medium leading-relaxed text-muted-foreground">
                        Cela nous permet de vous proposer des recommandations culinaires adaptées à vos racines et de personnaliser votre assistant MyFlex pour qu'il comprenne mieux vos préférences de saveurs locales.
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <Select onValueChange={setSelectedCountry} value={selectedCountry}>
                <SelectTrigger className="h-14 border-2 rounded-2xl text-base px-6 font-bold bg-background">
                  <SelectValue placeholder="Sélectionnez votre pays" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-2 max-h-[300px]">
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSave}
              disabled={isSaving || !selectedAvatar || !selectedCountry}
              className="w-full h-14 rounded-xl font-black tracking-tight text-lg group relative overflow-hidden transition-all duration-500 bg-primary text-primary-foreground shadow-2xl shadow-primary/30"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              Finaliser mon profil
              <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform" />
            </Button>
          </div>
        </div>

        <p className="text-center text-muted-foreground/40 text-[8px] font-black uppercase tracking-[0.3em] mt-12">
          Étape finale • Prêt pour l'expérience My Cook Flex
        </p>
      </div>
    </div>
  );
}
