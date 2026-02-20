
'use client';

import { useState } from 'react';
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
import { Logo } from '@/components/icons';
import Link from 'next/link';
import { initiatePasswordReset } from '@/firebase/auth-actions';
import { useLoading } from '@/contexts/loading-context';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';

export default function ForgotPasswordPage() {
    const { auth } = useFirebase();
    const { showLoading, hideLoading } = useLoading();
    const { toast } = useToast();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsSubmitting(true);
        showLoading("Envoi de l'e-mail...");

        try {
            await initiatePasswordReset(auth, email);
            toast({
                title: "E-mail envoyé",
                description: "Si un compte existe, vous recevrez un lien pour réinitialiser votre mot de passe.",
            });
            setIsSubmitted(true);
            setTimeout(() => router.push('/login'), 3000); // Redirect to login after 3 seconds
        } catch(error) {
            // Even on error, we show a success message to prevent email enumeration.
            // The error is logged in the auth-actions file.
             toast({
                title: "E-mail envoyé",
                description: "Si un compte existe, vous recevrez un lien pour réinitialiser votre mot de passe.",
            });
            setIsSubmitted(true);
            setTimeout(() => router.push('/login'), 3000);
        } finally {
            hideLoading();
            setIsSubmitting(false);
        }
    };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
      <div className="absolute top-6 left-6 hidden md:block">
        <Logo />
      </div>
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Mot de passe oublié</CardTitle>
          <CardDescription>
            {isSubmitted
              ? "Veuillez consulter votre boîte de réception."
              : "Entrez votre adresse e-mail pour recevoir un lien de réinitialisation."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="text-center">
                <p className="text-muted-foreground mb-4">Un e-mail a été envoyé. Redirection vers la page de connexion...</p>
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="email">Adresse e-mail</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="ex: jean.dupont@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Envoyer le lien
                </Button>
            </form>
          )}
          {!isSubmitted && (
            <div className="mt-4 text-center text-sm">
                <Link href="/login" className="underline">
                Retour à la connexion
                </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
