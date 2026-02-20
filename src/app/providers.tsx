'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AuthProvider } from '@/components/auth/auth-provider';
import { LoadingProvider } from '@/contexts/loading-context';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { AccentThemeProvider } from '@/contexts/accent-theme-context';
import { FeedbackButton } from '@/components/layout/feedback-button';
import { FloatingShortcuts } from '@/components/layout/floating-shortcuts';
import { Toaster } from "@/components/ui/toaster"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AccentThemeProvider>
          <LoadingProvider>
            <AuthProvider>
              {children}
              <FeedbackButton />
              <FloatingShortcuts />
              <LoadingOverlay />
              <Toaster />
            </AuthProvider>
          </LoadingProvider>
        </AccentThemeProvider>
      </ThemeProvider>
    </FirebaseClientProvider>
  );
}
