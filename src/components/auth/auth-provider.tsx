
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
};

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

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
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const ADMIN_EMAIL = 'emapms@gmail.com';

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);

      const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password');
      const isProtectedRoute = !['/', '/about', '/support', '/market', '/forum', '/terms', '/privacy'].includes(pathname) && !isAuthRoute;

      if (u) {
        const isAdmin = u.email === ADMIN_EMAIL;
        const userDocRef = doc(firestore, 'users', u.uid);
        const userDocSnap = await getDoc(userDocRef);
        let userData;

        if (!userDocSnap.exists()) {
          // Create new user doc
          await setDoc(userDocRef, {
            id: u.uid,
            name: u.displayName || 'Nouvel utilisateur',
            email: u.email,
            photoURL: u.photoURL,
            role: isAdmin ? 'admin' : 'user',
            createdAt: serverTimestamp(),
            subscriptionStatus: '', // Empty initially
            xp: 0,
            level: 1,
          }, { merge: true });

          const freshSnap = await getDoc(userDocRef);
          userData = freshSnap.data();
        } else {
          userData = userDocSnap.data();
          if (isAdmin && userData?.role !== 'admin') {
            await updateDoc(userDocRef, { role: 'admin' });
            userData.role = 'admin';
          }
        }

        if (!userData) {
          userData = { subscriptionStatus: '', role: isAdmin ? 'admin' : 'user', xp: 0, level: 1 };
        }

        const hasBasicProfile = !!(userData?.age && userData?.country && userData?.referralSource);
        const hasPersonalization = !!userData?.theme;
        const hasPreferences = !!userData?.mainObjective;
        const hasPricing = !!userData?.subscriptionStatus;
        const hasAvatar = !!userData?.avatarUrl;
        const isFullySetup = hasBasicProfile && hasPersonalization && hasPreferences && hasPricing && hasAvatar;

        if (isAdmin) {
          if (!pathname.startsWith('/admin')) {
            router.replace('/admin');
          }
        } else {
          // Linear Onboarding Flow
          if (!hasBasicProfile && !pathname.startsWith('/welcome') && !pathname.startsWith('/register')) {
            router.replace('/welcome');
          } else if (hasBasicProfile && !hasPersonalization && !pathname.startsWith('/personalization')) {
            router.replace('/personalization');
          } else if (hasPersonalization && !hasPreferences && !pathname.startsWith('/preferences')) {
            router.replace('/preferences');
          } else if (hasPreferences && !hasPricing && !pathname.startsWith('/pricing')) {
            router.replace('/pricing');
          } else if (hasPricing && !hasAvatar && !pathname.startsWith('/avatar-selection')) {
            router.replace('/avatar-selection');
          } else if (isFullySetup && (isAuthRoute || ['/welcome', '/personalization', '/preferences', '/pricing', '/avatar-selection'].some(p => pathname.startsWith(p)))) {
            router.replace('/dashboard');
          }
        }
      } else {
        if (isProtectedRoute) {
          router.replace('/login');
        }
      }
    });

    return () => unsub();
  }, [pathname, firestore, router]);

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, loading }}>
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
