
'use server';
/**
 * @fileOverview Suggests a full day meal plan (breakfast, lunch, dinner) and assigns cooks.
 */

import {
    SuggestDayPlanInputSchema,
    SuggestDayPlanOutputSchema,
    DayPlanMealSchema,
    type SuggestDayPlanInput,
    type SuggestDayPlanOutput,
    Dish,
} from '@/lib/types';
import { collection, getDocs, Firestore } from 'firebase/firestore';
import { getFirestoreInstance } from '@/firebase/server-init';
import OpenAI from 'openai';

const openrouter = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
});

async function getDishesFromFirestore(db: Firestore): Promise<Dish[]> {
    const dishesCol = collection(db, 'dishes');
    const dishSnapshot = await getDocs(dishesCol);
    return dishSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Dish));
}

function getRandomCook(householdMembers: string[]): string | undefined {
    if (!householdMembers || householdMembers.length === 0) {
        return undefined;
    }
    return householdMembers[Math.floor(Math.random() * householdMembers.length)];
}

export async function suggestDayPlan(
    input: SuggestDayPlanInput
): Promise<SuggestDayPlanOutput> {
    try {
        const firestore = await getFirestoreInstance();
        const allDishes = await getDishesFromFirestore(firestore);
        if (allDishes.length === 0) {
            return [];
        }

        const mealTypes: ('breakfast' | 'lunch' | 'dinner')[] = ['breakfast', 'lunch', 'dinner'];
        const suggestions: SuggestDayPlanOutput = [];

        // For simplicity, this version randomly selects dishes.
        // A more advanced version could use an AI call to select complementary dishes.
        for (const mealType of mealTypes) {
            let relevantDishes = allDishes.filter(d => (d.type || '').toLowerCase() === mealType);

            if (relevantDishes.length === 0) {
                if (mealType === 'breakfast') {
                    relevantDishes = allDishes.filter(d => (d.category || '').toLowerCase() === 'healthy');
                } else {
                    relevantDishes = allDishes.filter(d => ['lunch', 'dinner', 'plat quotidien', 'plat unique', '', undefined].includes((d.type || '').toLowerCase()));
                }
            }

            if (relevantDishes.length === 0) {
                relevantDishes = allDishes; // Fallback to all dishes
            }

            // Exclude already suggested dishes
            const availableDishes = relevantDishes.filter(d => !suggestions.some(s => s.name === d.name));
            const selectedPool = availableDishes.length > 0 ? availableDishes : relevantDishes;

            const randomDish = selectedPool[Math.floor(Math.random() * selectedPool.length)];

            if (randomDish) {
                suggestions.push({
                    name: randomDish.name,
                    type: mealType,
                    calories: Math.floor(Math.random() * 350) + 250, // Placeholder calories
                    cookedBy: getRandomCook(input.householdMembers || []),
                    imageUrl: randomDish.imageUrl,
                });
            }
        }

        return SuggestDayPlanOutputSchema.parse(suggestions);

    } catch (error) {
        console.error('Error in suggestDayPlan:', error);
        return [];
    }
}
