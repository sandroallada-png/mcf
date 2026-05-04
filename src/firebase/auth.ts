
'use client';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, setPersistence, indexedDBLocalPersistence } from 'firebase/auth';
import { firebaseConfig } from './config';

let app: FirebaseApp;

// Always initialize with the config to ensure it works in all environments.
if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}


// IMPORTANT: single auth instance
const authInstance = getAuth(app);

if (typeof window !== 'undefined') {
    setPersistence(authInstance, indexedDBLocalPersistence).catch(err => {
        console.warn('[Auth] Error setting persistence in auth.ts:', err);
    });
}

export const auth = authInstance;
export const firebaseApp = app;
