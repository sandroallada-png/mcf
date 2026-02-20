
'use client';

import { collection, writeBatch, getDocs, Firestore, doc } from 'firebase/firestore';
import { initialDishes } from './dishes';

export async function initializeDishes(db: Firestore): Promise<{ count: number }> {
    const dishesRef = collection(db, 'dishes');
    
    // Check if the collection is already populated to avoid re-writing data.
    const snapshot = await getDocs(dishesRef);
    if (!snapshot.empty) {
        console.log('Dishes collection already initialized.');
        return { count: snapshot.size };
    }
    
    const batch = writeBatch(db);
    
    initialDishes.forEach((dish) => {
        // Create a new document reference for each dish
        const dishRef = doc(dishesRef);
        batch.set(dishRef, dish);
    });
    
    try {
        await batch.commit();
        console.log(`${initialDishes.length} dishes have been added to the database.`);
        return { count: initialDishes.length };
    } catch (error) {
        console.error("Error initializing dishes collection:", error);
        throw error;
    }
}
