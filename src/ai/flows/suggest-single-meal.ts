
'use server';
/**
 * @fileOverview Suggests a single meal based on the time of day and user preferences.
 * This flow now uses an AI model to intelligently select a dish name from the database,
 * then validates it and retrieves the full data.
 */

import OpenAI from 'openai';
import {
  SuggestSingleMealInputSchema,
  SuggestSingleMealOutputSchema,
  type SuggestSingleMealInput,
  type SuggestSingleMealOutput,
  Dish,
  AIPersonality,
} from '@/lib/types';
import { collection, getDocs, Firestore } from 'firebase/firestore';
import { getFirestoreInstance } from '@/firebase/server-init';


const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

async function getDishesFromFirestore(db: Firestore): Promise<Dish[]> {
    const dishesCol = collection(db, 'dishes');
    const dishSnapshot = await getDocs(dishesCol);
    return dishSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Dish));
}

function mapTimeOfDayToMealType(timeOfDay: 'matin' | 'midi' | 'soir' | 'collation'): 'breakfast' | 'lunch' | 'dinner' | 'snack' {
    switch (timeOfDay) {
        case 'matin': return 'breakfast';
        case 'midi': return 'lunch';
        case 'soir': return 'dinner';
        case 'collation': return 'snack';
    }
}


export async function suggestSingleMeal(
  input: SuggestSingleMealInput
): Promise<SuggestSingleMealOutput> {
    
  try {
    const firestore = await getFirestoreInstance();
    const allDishes = await getDishesFromFirestore(firestore);

    if (allDishes.length === 0) {
        throw new Error('No dishes found in the database.');
    }
    
    // Step 1: Ask the AI to pick the *name* of the best dish.
    const dishListForAI = allDishes.map(d => `- ${d.name} (Catégorie: ${d.category}, Type: ${d.type || 'N/A'})`).join('\n');

    let systemPrompt = `You are an expert nutritionist's assistant. Your ONLY task is to choose the most suitable dish from the following list for a user.

The user wants a meal for the following time of day: "${input.timeOfDay}".
Their dietary goals are: "${input.dietaryGoals}".
`;
    if (input.mealHistory && input.mealHistory.length > 0) {
      systemPrompt += `\nHere is the user's recent meal history, avoid suggesting these too often: ${input.mealHistory.join(', ')}.`;
    }

    if (input.personality) {
      systemPrompt += `\nConsider their preferences: ${JSON.stringify(input.personality)}`;
    }

    systemPrompt += `
Here is the list of available dishes:
${dishListForAI}

Based on all this information, what is the single best dish to suggest?

Your response MUST be ONLY the name of the dish you have chosen, exactly as it appears in the list. Do not add any other text, explanation, or formatting.
Example of a valid response: "Salade César Réinventée"
`;
    
    const completion = await openrouter.chat.completions.create({
        model: 'openai/gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }],
        temperature: 0.5,
    });

    const chosenDishName = completion.choices[0]?.message?.content?.trim();

    // Step 2: Validate the AI's choice.
    let chosenDish = chosenDishName ? allDishes.find(d => d.name.toLowerCase() === chosenDishName.toLowerCase()) : undefined;

    // Step 3: If AI fails or returns invalid data, fall back to random selection.
    if (!chosenDish) {
        console.warn(`AI suggested an invalid dish: "${chosenDishName}". Falling back to random selection.`);
        const mealType = mapTimeOfDayToMealType(input.timeOfDay);
        let relevantDishes = allDishes.filter(d => (d.type || '').toLowerCase() === mealType);
        if (relevantDishes.length === 0) {
           relevantDishes = allDishes; // Fallback to all if no type matches
        }
        chosenDish = relevantDishes[Math.floor(Math.random() * relevantDishes.length)];
    }
    
    // Step 4: Construct the final output based on the (now guaranteed valid) dish data.
    return {
        name: chosenDish.name,
        calories: Math.floor(Math.random() * 300) + 300, // Random calories as it's not in the model
        cookingTime: chosenDish.cookingTime,
        type: mapTimeOfDayToMealType(input.timeOfDay),
        imageHint: `${chosenDish.category.toLowerCase()} ${chosenDish.origin.toLowerCase()}`.substring(0, 50),
        imageUrl: chosenDish.imageUrl,
        recipe: chosenDish.recipe, // Pass the existing recipe, which can be undefined
    };

  } catch (error: any) {
    console.error('Error in suggestSingleMeal:', error);
    // Fallback in case of a complete API failure
    const firestore = await getFirestoreInstance();
    const allDishes = await getDishesFromFirestore(firestore);
    if(allDishes.length > 0) {
        const randomDish = allDishes[Math.floor(Math.random() * allDishes.length)];
        return {
            name: randomDish.name,
            calories: Math.floor(Math.random() * 300) + 300,
            cookingTime: randomDish.cookingTime,
            type: mapTimeOfDayToMealType(input.timeOfDay),
            imageHint: `${randomDish.category.toLowerCase()} ${randomDish.origin.toLowerCase()}`.substring(0, 50),
            imageUrl: randomDish.imageUrl,
            recipe: randomDish.recipe,
        };
    }
    throw new Error('Failed to generate meal suggestion. ' + error.message);
  }
}
