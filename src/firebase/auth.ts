
'use client';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './config';

let app: FirebaseApp;

// Always initialize with the config to ensure it works in all environments.
if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}


// IMPORTANT: single auth instance
export const auth = getAuth(app);
export const firebaseApp = app;
