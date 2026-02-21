
'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/firebase/auth';
import { usePathname, useRouter } from 'next/navigation';
import { useLoading } from '@/contexts/loading-context';
import { setDoc, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';

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

  const ADMIN_EMAIL = 'emapms@gmail.com';

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (!u) {
        setUserDataState(null);
        setIsFullySetup(false);
        setLoading(false);

        const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password') || pathname.startsWith('/join-family');
        const isProtectedRoute = !['/', '/about', '/support', '/market', '/forum', '/terms', '/privacy'].includes(pathname) && !isAuthRoute;

        if (isProtectedRoute) {
          router.replace('/login');
        }
        return;
      }

      // User logged in
      const isAdmin = u.email === ADMIN_EMAIL;
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

  if (loading) return null;

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
