
'use client';

import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string | null;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  withLoading: <T extends (...args: any[]) => Promise<any>>(fn: T, message?: string) => T;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [loadingCount, setLoadingCount] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);

  const showLoading = useCallback((message: string = "Chargement...") => {
    setLoadingCount(prev => {
      if (prev === 0) {
        setLoadingMessage(message);
      }
      return prev + 1;
    });
  }, []);

  const hideLoading = useCallback(() => {
    setLoadingCount(prev => {
      const newCount = Math.max(0, prev - 1);
      if (newCount === 0) {
        setLoadingMessage(null);
      }
      return newCount;
    });
  }, []);

  const withLoading = useCallback(<T extends (...args: any[]) => Promise<any>>(fn: T, message?: string): T => {
    return (async (...args: Parameters<T>) => {
      showLoading(message);
      try {
        return await fn(...args);
      } finally {
        hideLoading();
      }
    }) as T;
  }, [showLoading, hideLoading]);

  const value = {
    isLoading: loadingCount > 0,
    loadingMessage,
    showLoading,
    hideLoading,
    withLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading(): LoadingContextType {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
