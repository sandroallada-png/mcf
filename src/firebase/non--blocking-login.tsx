
'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  UserCredential,
} from 'firebase/auth';
import { toast } from '@/hooks/use-toast';

/** Helper pour afficher les erreurs */
function showAuthError(title: string, description: string) {
  toast({ variant: 'destructive', title, description });
}

/** Connexion anonyme */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance).catch((error) => {
    console.error('Anonymous sign-in error:', error);
    showAuthError('Erreur de connexion', 'Impossible de se connecter anonymement.');
  });
}

/** Inscription email/password */
export function initiateEmailSignUp(
  authInstance: Auth,
  email: string,
  password: string
): Promise<UserCredential> {
  return createUserWithEmailAndPassword(authInstance, email, password).catch((error) => {
    switch (error.code) {
      case 'auth/email-already-in-use':
        showAuthError("Erreur d'inscription", "Cette adresse e-mail est déjà utilisée.");
        break;
      case 'auth/weak-password':
        showAuthError('Mot de passe faible', 'Le mot de passe doit contenir au moins 6 caractères.');
        break;
      default:
        showAuthError("Erreur d'inscription", 'Une erreur inconnue est survenue.');
        console.error('Email sign-up error:', error);
    }
    throw error;
  });
}

/** Connexion email/password */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password).catch((error) => {
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        showAuthError('Échec de la connexion', "L'adresse e-mail ou le mot de passe est incorrect.");
        break;
      default:
        showAuthError('Échec de la connexion', 'Une erreur inconnue est survenue.');
        console.error('Email sign-in error:', error);
    }
  });
}

/** Connexion Google */
export function initiateGoogleSignIn(authInstance: Auth): void {
  const provider = new GoogleAuthProvider();
  signInWithPopup(authInstance, provider).catch((error) => {
    if (error.code === 'auth/cancelled-popup-request') return;
    if (error.code === 'auth/popup-closed-by-user') {
      console.log('Google Sign-in popup closed by user.');
      return;
    }
    showAuthError('Erreur de connexion', 'Une erreur est survenue lors de la connexion avec Google.');
    console.error('Google sign-in error:', error);
  });
}
