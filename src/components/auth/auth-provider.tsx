
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
    // Hide loading indicator whenever the path changes
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
  const { showLoading, hideLoading } = useLoading();

  const ADMIN_EMAIL = 'emapms@gmail.com';

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);

      const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password');
      const isProtectedRoute = !['/', '/about', '/support', '/market', '/forum', '/terms', '/privacy'].includes(pathname) && !isAuthRoute;

      if (u) {
        // User is logged in
        const isAdmin = u.email === ADMIN_EMAIL;
        const userDocRef = doc(firestore, 'users', u.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          // Create user document if it doesn't exist
          await setDoc(userDocRef, {
            id: u.uid,
            name: u.displayName || 'Nouvel utilisateur',
            email: u.email,
            photoURL: u.photoURL,
            role: isAdmin ? 'admin' : 'user',
            createdAt: serverTimestamp(),
            subscriptionStatus: 'free',
            xp: 0,
            level: 1,
          }, { merge: true });
        } else {
          // Ensure role is correctly set if it changed
          if (isAdmin && userDocSnap.data()?.role !== 'admin') {
            await updateDoc(userDocRef, { role: 'admin' });
          }
        }

        let userData = userDocSnap.data();

        // If the doc was just created or data is missing, we might need to re-fetch or use initial data
        if (!userData && !userDocSnap.exists()) {
          // This is the first time the user logs in
          userData = {
            subscriptionStatus: 'free',
            role: isAdmin ? 'admin' : 'user'
          };
        }

        const isProfileComplete = !!(userData?.age && userData?.country && userData?.referralSource);
        const isSetupComplete = isProfileComplete && !!userData?.subscriptionStatus;

        if (isAdmin) {
          // If admin is on any non-admin page, redirect to admin dashboard
          if (!pathname.startsWith('/admin')) {
            router.replace('/admin');
          }
        } else {
          // Regular user logic
          if (!isProfileComplete && !pathname.startsWith('/welcome')) {
            // New user or incomplete profile - redirect to welcome transition
            router.replace('/welcome');
          } else if (isProfileComplete && !userData?.subscriptionStatus && !pathname.startsWith('/pricing')) {
            // Profile complete but no subscription info - redirect to pricing
            router.replace('/pricing');
          } else if (isSetupComplete && (isAuthRoute || ['/welcome', '/pricing', '/personalization', '/preferences'].some(p => pathname.startsWith(p)))) {
            // If setup is complete, redirect from auth/setup pages to dashboard
            router.replace('/dashboard');
          }
        }
      } else {
        // User is not logged in
        if (isProtectedRoute) {
          router.replace('/login');
        }
      }
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      <NavigationEvents />
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
