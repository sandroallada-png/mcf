
'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  UserCredential,
  sendEmailVerification,
  User,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
} from 'firebase/auth';
import { toast } from '@/hooks/use-toast';

function showError(title: string, description: string) {
  toast({ variant: 'destructive', title, description });
}

function showSuccess(title: string, description: string) {
  toast({ variant: 'default', title, description });
}

/** Anonymous sign-in */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance).catch((error) => {
    console.error('Anonymous sign-in error:', error);
    showError('Erreur de connexion anonyme', "Impossible d'établir une session anonyme.");
  });
}

/** Email/password sign-up */
export function initiateEmailSignUp(
  authInstance: Auth,
  email: string,
  password: string
): Promise<UserCredential> {
  return createUserWithEmailAndPassword(authInstance, email, password)
    .then((cred) => {
      showSuccess('Inscription réussie', 'Votre compte a été créé.');
      return cred;
    })
    .catch((error) => {
      console.error('Email sign-up error:', error);
      switch (error.code) {
        case 'auth/email-already-in-use':
          showError("Erreur d'inscription", 'Cette adresse e-mail est déjà utilisée.');
          break;
        case 'auth/weak-password':
          showError('Mot de passe faible', 'Le mot de passe doit contenir au moins 6 caractères.');
          break;
        case 'auth/invalid-email':
          showError("Erreur d'inscription", "Adresse e-mail invalide.");
          break;
        default:
          showError("Erreur d'inscription", 'Une erreur inconnue est survenue.');
      }
      throw error;
    });
}

/** Email/password sign-in */
export async function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  try {
    return await signInWithEmailAndPassword(authInstance, email, password);
  } catch (error: any) {
    console.error('Email sign-in error:', error);
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        showError('Échec de la connexion', "Adresse e-mail ou mot de passe incorrect.");
        break;
      case 'auth/too-many-requests':
        showError('Échec de la connexion', 'Trop de tentatives. Réessayez plus tard.');
        break;
      default:
        showError('Échec de la connexion', 'Une erreur inconnue est survenue.');
    }
    throw error; // Re-throw the error so the caller can handle it (e.g., stop loading state)
  }
}

/** Google sign-in with popup + redirect fallback */
export async function initiateGoogleSignIn(authInstance: Auth): Promise<void> {
  const provider = new GoogleAuthProvider();

  try {
    await signInWithPopup(authInstance, provider);
  } catch (error: any) {
    console.error('Google sign-in error:', error);

    if (error.code === 'auth/cancelled-popup-request') {
      throw new Error('Popup cancelled'); // Throw to be caught by the caller
    }

    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/popup-blocked') {
      try {
        await signInWithRedirect(authInstance, provider);
        // This promise might not resolve in the current page context if redirect is successful
      } catch (redirectError) {
        console.error('Google sign-in redirect error:', redirectError);
        showError('Erreur de Redirection', 'La connexion via redirection a également échoué.');
        throw redirectError; // Throw to be caught
      }
    } else {
      // Handle other potential errors, like misconfiguration.
      showError('Erreur de connexion Google', 'Connexion Google impossible. Vérifiez la configuration.');
      throw error; // Throw to be caught
    }
  }
}

/** Send verification email */
export function initiateEmailVerification(currentUser: User | null): void {
  if (!currentUser) {
    showError('Erreur', 'Aucun utilisateur connecté.');
    return;
  }

  sendEmailVerification(currentUser)
    .then(() => {
      showSuccess('Email envoyé !', 'Un lien de vérification a été envoyé à votre adresse e-mail.');
    })
    .catch((error) => {
      console.error('Email verification error:', error);
      if (error.code === 'auth/too-many-requests') {
        showError('Trop de demandes', 'Un email a déjà été envoyé. Veuillez réessayer plus tard.');
      } else {
        showError("Erreur d'envoi", "Impossible d'envoyer l'e-mail de vérification.");
      }
    });
}

/** Send password reset email */
export async function initiatePasswordReset(authInstance: Auth, email: string): Promise<void> {
  try {
    // Let Firebase handle the redirect URL to its own hosted page.
    await sendPasswordResetEmail(authInstance, email);
    // The success message is now handled inside the component for better UX.
  } catch (error: any) {
    console.error('Password reset error:', error);
    // Errors are handled in the component for better UX, but we can log them here.
    // We avoid showing specific errors to prevent user enumeration.
    throw error;
  }
}
