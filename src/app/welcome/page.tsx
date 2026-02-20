
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogoIcon, GoogleIcon } from '@/components/icons';
import { CheckCircle2, ArrowRight, Sparkles, User, Globe, MessageSquare, Loader2 } from 'lucide-react';
import { useAuthContext } from '@/components/auth/auth-provider';
import { useLoading } from '@/contexts/loading-context';
import { doc, updateDoc, serverTimestamp, collection } from 'firebase/firestore';
import { useFirebase, addDocumentNonBlocking } from '@/firebase';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Image from 'next/image';
import Autoplay from 'embla-carousel-autoplay';

const carouselItems = [
    { image: '/mcf/19.png' },
    { image: '/mcf/17.png' },
    { image: '/mcf/21.png' }
];

const ages = Array.from({ length: 86 }, (_, i) => (i + 14).toString());
const countries = [
    "France", "Belgique", "Suisse", "Luxembourg", "Allemagne", "Italie", "Espagne", "Portugal", "Royaume-Uni", "Pays-Bas",
    "Canada", "États-Unis", "Brésil", "Mexique", "Argentine"
].sort();

export default function WelcomePage() {
    const router = useRouter();
    const { user } = useAuthContext();
    const { firestore } = useFirebase();
    const { showLoading, hideLoading } = useLoading();

    const [step, setStep] = useState(1); // 1: Success message, 2: Form
    const [age, setAge] = useState('');
    const [country, setCountry] = useState('');
    const [referral, setReferral] = useState('');
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

    const handleNextStep = () => {
        setStep(2);
    };

    const handleCompleteProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!age || !country || !referral) return;

        showLoading("Finalisation de votre profil...");
        try {
            if (user) {
                const userRef = doc(firestore, 'users', user.uid);
                await updateDoc(userRef, {
                    age: parseInt(age, 10),
                    country,
                    referralSource: referral,
                    updatedAt: serverTimestamp(),
                });

                // Add feedback/log similar to regular registration
                const feedbackCollectionRef = collection(firestore, 'feedbacks');
                addDocumentNonBlocking(feedbackCollectionRef, {
                    userId: user.uid,
                    userName: user.displayName,
                    rating: 0,
                    comment: `Nouvelle inscription (Google) : ${user.displayName}`,
                    page: `Source: ${referral}`,
                    status: 'new',
                    createdAt: serverTimestamp(),
                });

                setTimeout(() => {
                    router.push('/personalization');
                }, 1000);
            }
        } catch (error) {
            console.error("Error completing profile:", error);
            hideLoading();
        }
    };

    if (!user) return null;

    return (
        <div className="flex min-h-screen w-full lg:grid lg:grid-cols-2 lg:h-screen lg:overflow-hidden bg-background">

            {/* Left Pane - Visuals (Consistent with Login/Register) */}
            <div className="hidden lg:flex bg-primary flex-col items-center justify-center relative overflow-hidden w-full h-full text-white">
                <div className="absolute inset-0 z-0 text-white">
                    <Carousel setApi={setApi} plugins={[autoplay.current]} className="w-full h-full" opts={{ loop: true }}>
                        <CarouselContent className="h-screen -ml-0">
                            {carouselItems.map((item, index) => (
                                <CarouselItem key={index} className="pl-0 relative h-screen bg-[#347d1c]">
                                    <Image src={item.image} alt="Cuisine" fill sizes="50vw" className="object-cover" priority={index === 0} />
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
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
                        <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-lg leading-tight italic">
                            Presque prêt,<br />{user.displayName?.split(' ')[0]} !
                        </h2>
                        <p className="text-xs text-white/80 font-medium tracking-wide mt-2">Plus que quelques informations pour commencer.</p>
                    </div>
                </div>
            </div>

            {/* Right Pane - Content */}
            <div className="flex w-full bg-background p-6 lg:p-12 lg:h-full lg:overflow-y-auto relative items-center justify-center">
                <div className="mx-auto w-full max-w-[420px] space-y-8">

                    {step === 1 && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            <div className="flex flex-col items-center text-center gap-6">
                                <div className="w-24 h-24 bg-green-500/10 rounded-[3rem] flex items-center justify-center relative">
                                    <div className="absolute inset-0 bg-green-500/5 blur-3xl rounded-full animate-pulse" />
                                    <CheckCircle2 className="h-12 w-12 text-green-500 relative z-10 animate-in zoom-in duration-500" />
                                </div>

                                <div className="space-y-3">
                                    <h1 className="text-3xl font-black tracking-tight leading-tight">Authentification<br />réussie avec Google !</h1>
                                    <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                                        Ravi de vous voir parmi nous, <span className="text-primary font-bold">{user.displayName}</span>.
                                    </p>
                                </div>

                                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex items-center gap-4 text-left">
                                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                                        <Sparkles className="h-5 w-5 text-white" />
                                    </div>
                                    <p className="text-sm font-medium leading-relaxed italic">
                                        "Il ne vous manque plus que <span className="text-primary font-black">3 petites étapes</span> pour finaliser votre profil et accéder à votre coach personnel."
                                    </p>
                                </div>
                            </div>

                            <Button
                                onClick={handleNextStep}
                                className="w-full h-16 text-lg font-black shadow-2xl shadow-primary/30 rounded-2xl group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                Compléter mon profil
                                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
                            <div className="flex flex-col items-center text-center gap-3">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === 1 ? 'w-8 bg-primary' : 'w-2 bg-muted'}`} />
                                    ))}
                                </div>
                                <h2 className="text-4xl font-black tracking-tight">Profil</h2>
                                <p className="text-muted-foreground font-medium">Parlez-nous un peu de vous.</p>
                            </div>

                            <form onSubmit={handleCompleteProfile} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 ml-1">
                                            <User className="h-3 w-3 text-primary" />
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Âge</Label>
                                        </div>
                                        <Select onValueChange={setAge} value={age}>
                                            <SelectTrigger className="h-16 border-2 rounded-2xl text-xl font-black text-center px-4">
                                                <SelectValue placeholder="-" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-2">
                                                {ages.map((a) => (
                                                    <SelectItem key={a} value={a}>{a} ans</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 ml-1">
                                            <Globe className="h-3 w-3 text-primary" />
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pays</Label>
                                        </div>
                                        <Select onValueChange={setCountry} value={country}>
                                            <SelectTrigger className="h-16 border-2 rounded-2xl text-base px-6 font-bold">
                                                <SelectValue placeholder="Pays" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-2">
                                                {countries.map((c) => (
                                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 ml-1">
                                        <MessageSquare className="h-3 w-3 text-primary" />
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Comment nous avez-vous connus ?</Label>
                                    </div>
                                    <Select onValueChange={setReferral} value={referral}>
                                        <SelectTrigger className="h-16 border-2 rounded-2xl text-base px-6 font-medium">
                                            <SelectValue placeholder="Sélectionner une source" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-2">
                                            <SelectItem value="Insta">Instagram</SelectItem>
                                            <SelectItem value="Tiktok">TikTok</SelectItem>
                                            <SelectItem value="Google">Recherche Google</SelectItem>
                                            <SelectItem value="Friend">Bouche à oreille</SelectItem>
                                            <SelectItem value="Other">Autre</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button
                                    disabled={!age || !country || !referral}
                                    className="w-full h-18 py-8 text-xl font-black shadow-2xl shadow-primary/30 rounded-[2rem] group relative overflow-hidden mt-4"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                    Continuer
                                    <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                                </Button>
                            </form>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
