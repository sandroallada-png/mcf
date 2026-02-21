
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { doc, getDoc, updateDoc, setDoc, Timestamp } from 'firebase/firestore';
import {
    createUserWithEmailAndPassword,
    updateProfile,
    signOut
} from 'firebase/auth';
import {
    Users,
    ShieldCheck,
    Key,
    User,
    Phone,
    ChefHat,
    ArrowRight,
    Loader2,
    CheckCircle2,
    Lock,
    Globe
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getInviteAction } from '../../actions';

export default function JoinFamilyPage() {
    const { inviteId } = useParams();
    const router = useRouter();
    const { auth, firestore } = useFirebase();
    const { toast } = useToast();

    const [invite, setInvite] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const phoneCountries = [
        { name: 'France', code: '+33', flag: '🇫🇷' },
        { name: 'Belgique', code: '+32', flag: '🇧🇪' },
        { name: 'Suisse', code: '+41', flag: '🇨🇭' },
        { name: 'Luxembourg', code: '+352', flag: '🇱🇺' },
        { name: 'Allemagne', code: '+49', flag: '🇩🇪' },
        { name: 'Italie', code: '+39', flag: '🇮🇹' },
        { name: 'Espagne', code: '+34', flag: '🇪🇸' },
        { name: 'Portugal', code: '+351', flag: '🇵🇹' },
        { name: 'Royaume-Uni', code: '+44', flag: '🇬🇧' },
        { name: 'Pays-Bas', code: '+31', flag: '🇳🇱' },
        { name: 'Canada', code: '+1', flag: '🇨🇦' },
        { name: 'États-Unis', code: '+1', flag: '🇺🇸' },
        { name: 'Brésil', code: '+55', flag: '🇧🇷' },
        { name: 'Mexique', code: '+52', flag: '🇲🇽' },
    ];

    const getFlag = (phone: string) => {
        if (!phone) return '🌐';
        // Check for longest matches first
        const sorted = [...phoneCountries].sort((a, b) => b.code.length - a.code.length);
        const match = sorted.find(c => phone.startsWith(c.code));
        return match ? match.flag : '🌐';
    };

    useEffect(() => {
        const fetchInvite = async () => {
            if (!inviteId) return;
            setIsLoading(true);
            try {
                const { invite: inviteData, error: inviteError } = await getInviteAction(inviteId as string);
                if (inviteError) {
                    setError(inviteError);
                } else {
                    setInvite(inviteData);
                    setName(inviteData.name);
                }
            } catch (e) {
                console.error("Invite fetch failed:", e);
                setError("Impossible de charger l'invitation.");
            } finally {
                setIsLoading(false);
            }
        };

        // Ensure user is signed out to avoid session conflicts during signup
        signOut(auth).then(() => {
            fetchInvite();
        });
    }, [inviteId, auth]);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!invite || !password || password.length < 6) {
            toast({ variant: "destructive", title: "Erreur", description: "Le mot de passe doit faire au moins 6 caractères." });
            return;
        }

        setIsJoining(true);
        const email = `foyer${invite.phone.replace(/\+/g, '')}@cook.flex`;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await finishJoin(user, email, name);
        } catch (error: any) {
            console.error(error);
            let msg = "Une erreur est survenue lors de l'inscription.";
            if (error.code === 'auth/email-already-in-use') {
                msg = "Ce numéro de téléphone est déjà associé à un compte.";
            }
            toast({ variant: "destructive", title: "Échec de l'inscription", description: msg });
        } finally {
            setIsJoining(false);
        }
    };

    const finishJoin = async (user: any, email: string, displayName: string) => {
        // 3. Create/Update User Profile in Firestore
        const userProfile = {
            id: user.uid,
            name: displayName,
            email: email,
            chefId: invite.chefId,
            role: 'user',
            phoneNumber: invite.phone || '',
            xp: 0,
            level: 1,
            streak: 0,
            targetCalories: 2000,
            createdAt: Timestamp.now(),
            isAITrainingEnabled: true,
            origin: invite.chefName ? `Cuisine familiale (${invite.chefName})` : 'Cuisine familiale',
        };

        const userDocRef = doc(firestore, 'users', user.uid);
        const existingDoc = await getDoc(userDocRef);

        if (existingDoc.exists()) {
            await updateDoc(userDocRef, {
                chefId: invite.chefId,
                role: 'user',
                origin: userProfile.origin
            });
        } else {
            await setDoc(userDocRef, userProfile);
        }

        // 4. Mark invite as accepted
        await updateDoc(doc(firestore, 'invites', invite.id), { status: 'accepted' });

        toast({
            title: "Bienvenue dans la famille !",
            description: `Vous avez rejoint le foyer de ${invite.chefName}.`,
        });

        router.push('/dashboard');
    };

    if (isLoading) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0a0a0a]">
                <div className="relative">
                    <div className="absolute inset-0 blur-3xl bg-primary/20 rounded-full animate-pulse" />
                    <Loader2 className="h-16 w-16 animate-spin text-primary relative z-10" />
                </div>
                <p className="mt-8 text-muted-foreground font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Activation du lien sécurisé...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0a0a0a] p-6 text-center">
                <div className="h-24 w-24 bg-destructive/10 rounded-[2.5rem] flex items-center justify-center mb-8 rotate-12">
                    <ShieldCheck className="h-12 w-12 text-destructive" />
                </div>
                <h1 className="text-3xl font-black text-white tracking-tighter">Oups ! Lien Invalide</h1>
                <p className="text-muted-foreground max-w-sm mt-4 font-medium leading-relaxed">
                    {error} <br />
                    L'adresse a peut-être expiré ou a déjà été utilisée. Demandez au chef de foyer de vous renvoyer un lien.
                </p>
                <Button className="mt-10 h-14 px-10 rounded-2xl bg-white text-black hover:bg-white/90 font-black uppercase tracking-widest text-xs" onClick={() => router.push('/login')}>
                    Retour à l'accueil
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#050505] flex justify-center p-4 selection:bg-primary/30 overflow-y-auto">
            {/* Background Decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <Card className="max-w-md w-full my-auto rounded-[3rem] border border-white/5 bg-black/40 backdrop-blur-3xl shadow-2xl relative z-10 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                <CardHeader className="p-8 md:p-10 text-center space-y-4">
                    <div className="mx-auto h-20 w-20 bg-primary/10 rounded-[2rem] flex items-center justify-center rotate-3 hover:rotate-0 transition-transform duration-500">
                        <Users className="h-10 w-10 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-2xl md:text-3xl font-black text-white tracking-tighter">
                            Rejoindre {invite.chefName}
                        </CardTitle>
                        <CardDescription className="text-xs font-bold uppercase tracking-[0.2em] text-primary/60">
                            Invitation Privée MyFlex
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="p-8 md:p-10 pt-0 space-y-8">
                    <form onSubmit={handleJoin} className="space-y-6">
                        <div className="space-y-4">
                            {/* Read Only Phone */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2">Votre Identifiant (Téléphone)</label>
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-white/5 rounded-2xl blur-sm group-focus-within:bg-primary/5 transition-colors" />
                                    <div className="relative h-14 px-5 flex items-center gap-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                                        <span className="text-xl">{getFlag(invite.phone)}</span>
                                        <span className="text-white/60 font-black text-lg tracking-tight">{invite.phone}</span>
                                        <Lock className="h-4 w-4 text-muted-foreground/20 ml-auto" />
                                    </div>
                                </div>
                            </div>

                            {/* Name (Editable) */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Votre Prénom pour la famille</label>
                                <div className="relative group">
                                    <Input
                                        type="text"
                                        placeholder="Comment on vous appelle ?"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="h-14 pl-12 rounded-2xl border-white/5 bg-white/[0.03] text-white font-bold focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all text-lg"
                                        required
                                    />
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-primary transition-colors" />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Créer votre mot de passe</label>
                                <div className="relative group">
                                    <Input
                                        type="password"
                                        placeholder="Min. 6 caractères"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-14 pl-12 rounded-2xl border-white/5 bg-white/[0.03] text-white font-bold focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all text-lg"
                                        required
                                        minLength={6}
                                    />
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-primary transition-colors" />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-16 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all group"
                            disabled={isJoining}
                        >
                            {isJoining ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                                <>
                                    Rejoindre le foyer
                                    <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="p-8 border-t border-white/5 bg-white/[0.01] flex flex-col gap-4">
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        Connexion sécurisée Chiffrée
                    </div>
                    <p className="text-[9px] text-center text-muted-foreground/40 font-bold leading-relaxed px-4">
                        En rejoignant ce foyer, vous acceptez de partager votre planning de repas et votre activité culinaire avec les autres membres de la famille.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}

