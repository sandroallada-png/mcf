
'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/firebase/auth';
import { usePathname, useRouter } from 'next/navigation';
import { useLoading } from '@/contexts/loading-context';
import { setDoc, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';

const AUTH_COOKIE = 'mcf_auth';
const ADMIN_EMAIL = 'maxyculture11@gmail.com';

// Routes publiques (pas de redirection vers login)
const PUBLIC_ROUTES = [
  '/', '/login', '/register', '/forgot-password', '/reset-password',
  '/about', '/support', '/market', '/forum', '/terms', '/privacy',
  '/join-family', '/offline',
];

function setAuthCookie(role: 'admin' | 'user') {
  // Cookie accessible par le middleware Edge (pas httpOnly)
  const maxAge = 60 * 60 * 24 * 7; // 7 jours
  document.cookie = `${AUTH_COOKIE}=${role}; path=/; max-age=${maxAge}; SameSite=Strict`;
}

function deleteAuthCookie() {
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; SameSite=Strict`;
}

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  userData: any | null;
  isFullySetup: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  userData: null,
  isFullySetup: false
});

function NavigationEvents() {
  const pathname = usePathname();
  const { hideLoading } = useLoading();

  useEffect(() => {
    hideLoading();
  }, [pathname, hideLoading]);

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { firestore } = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserDataState] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullySetup, setIsFullySetup] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const ADMIN_EMAIL_LOCAL = ADMIN_EMAIL;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (!u) {
        setUserDataState(null);
        setIsFullySetup(false);
        setLoading(false);
        deleteAuthCookie(); // ← supprimer le cookie dès la déconnexion

        const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password') || pathname.startsWith('/join-family');
        const isProtectedRoute = !PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/')) && !isAuthRoute;

        if (isProtectedRoute) {
          router.replace('/login');
        }
        return;
      }

      // User logged in
      const isAdmin = u.email === ADMIN_EMAIL_LOCAL;
      const userDocRef = doc(firestore, 'users', u.uid);
      const userDocSnap = await getDoc(userDocRef);
      let data;

      if (!userDocSnap.exists()) {
        const newData = {
          id: u.uid,
          name: u.displayName || 'Nouvel utilisateur',
          email: u.email,
          photoURL: u.photoURL,
          role: isAdmin ? 'admin' : 'user',
          createdAt: serverTimestamp(),
          subscriptionStatus: '',
          xp: 0,
          level: 1,
        };
        await setDoc(userDocRef, newData, { merge: true });
        data = newData;
      } else {
        data = userDocSnap.data();
        if (isAdmin && data?.role !== 'admin') {
          await updateDoc(userDocRef, { role: 'admin' });
          data.role = 'admin';
        }
      }

      setUserDataState(data);

      // ← Écrire le cookie IMMÉDIATEMENT après avoir déterminé le rôle
      setAuthCookie(isAdmin ? 'admin' : 'user');

      const hasBasicProfile = !!(data?.age && data?.country && data?.referralSource);
      const hasPersonalization = !!data?.theme;
      const hasPreferences = !!data?.mainObjective;
      const hasPricing = !!data?.subscriptionStatus;
      const hasAvatar = !!data?.avatarUrl;
      const isFamilyMember = !!data?.chefId;
      const fullySetup = (hasBasicProfile && hasPersonalization && hasPreferences && hasPricing && hasAvatar) || isFamilyMember;

      setIsFullySetup(fullySetup);
      setLoading(false);

      const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password') || pathname.startsWith('/join-family');

      if (isAdmin) {
        if (!pathname.startsWith('/admin')) {
          router.replace('/admin');
        }
      } else if (isFamilyMember) {
        // Skip onboarding for family members
        if (isAuthRoute || ['/welcome', '/personalization', '/preferences', '/pricing', '/avatar-selection'].some(p => pathname.startsWith(p))) {
          router.replace('/dashboard');
        }
      } else {
        // Onboarding logic: only for primary users
        if (!hasBasicProfile && !pathname.startsWith('/welcome') && !pathname.startsWith('/register') && !pathname.startsWith('/join-family')) {
          router.replace('/welcome');
        } else if (hasBasicProfile && !hasPersonalization && !pathname.startsWith('/personalization')) {
          router.replace('/personalization');
        } else if (hasPersonalization && !hasPreferences && !pathname.startsWith('/preferences')) {
          router.replace('/preferences');
        } else if (hasPreferences && !hasPricing && !pathname.startsWith('/pricing')) {
          router.replace('/pricing');
        } else if (hasPricing && !hasAvatar && !pathname.startsWith('/avatar-selection')) {
          router.replace('/avatar-selection');
        } else if (fullySetup && (isAuthRoute || ['/welcome', '/personalization', '/preferences', '/pricing', '/avatar-selection'].some(p => pathname.startsWith(p)))) {
          router.replace('/dashboard');
        }
      }
    });

    return () => unsub();
  }, [pathname, firestore, router]);

  if (loading) {
    // Pendant le chargement de l'auth, bloquer le rendu des routes sensibles
    // pour éviter tout flash de contenu non autorisé
    const isSensitiveRoute =
      pathname.startsWith('/admin') ||
      (pathname.startsWith('/dashboard') ||
        pathname.startsWith('/cuisine') ||
        pathname.startsWith('/fridge') ||
        pathname.startsWith('/calendar') ||
        pathname.startsWith('/settings') ||
        pathname.startsWith('/mon-niveau') ||
        pathname.startsWith('/courses') ||
        pathname.startsWith('/atelier') ||
        pathname.startsWith('/ma-boxe') ||
        pathname.startsWith('/personalization') ||
        pathname.startsWith('/preferences') ||
        pathname.startsWith('/pricing') ||
        pathname.startsWith('/avatar-selection') ||
        pathname.startsWith('/foyer'));

    if (isSensitiveRoute) return null; // ← Rien ne s'affiche jusqu'à confirmation
  }

  return (
    <AuthContext.Provider value={{ user, loading, userData, isFullySetup }}>
      <NavigationEvents />
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within an AuthProvider');
  return context;
}
