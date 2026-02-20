
'use server';

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

let app: FirebaseApp;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}

let firestore: Firestore;

export async function getFirestoreInstance(): Promise<Firestore> {
    if (!firestore) {
        firestore = getFirestore(app);
    }
    return firestore;
}
