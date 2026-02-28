
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
import { collection, getDocs, Firestore, query, where } from 'firebase/firestore';
import { getFirestoreInstance } from '@/firebase/server-init';


const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

async function getDishesFromFirestore(db: Firestore): Promise<Dish[]> {
  const dishesCol = collection(db, 'dishes');
  // On essaie d'abord les plats vérifiés
  const qV = query(dishesCol, where('isVerified', '==', true));
  const verifiedSnap = await getDocs(qV);

  if (!verifiedSnap.empty) {
    return verifiedSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Dish));
  }

  // Fallback sur tous les plats si aucun n'est vérifié (pour éviter de casser l'outil au début)
  const dishSnapshot = await getDocs(dishesCol);
  return dishSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Dish));
}

function mapTimeOfDayToMealType(timeOfDay: 'matin' | 'midi' | 'soir' | 'dessert'): 'breakfast' | 'lunch' | 'dinner' | 'dessert' {
  switch (timeOfDay) {
    case 'matin': return 'breakfast';
    case 'midi': return 'lunch';
    case 'soir': return 'dinner';
    case 'dessert': return 'dessert';
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
    const dishListForAI = allDishes.map(d => `- ${d.name} (Catégorie: ${d.category}, Type/Régime: ${d.type || 'N/A'}, Moment conseillé: ${d.momentSuggest || 'N/A'})`).join('\n');

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
Also, write a very short, friendly and encouraging message (in French) to accompany this suggestion, explaining why it's a great choice for them right now (e.g. "Je pense que ce repas sera votre régal ce soir 😋").

Your response MUST be a valid JSON object with the following structure:
{
  "dishName": "The exact name of the dish from the list",
  "message": "Your short personalized message in French"
}
`;

    const completion = await openrouter.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const responseContent = completion.choices[0]?.message?.content;
    let aiChoice: { dishName: string; message: string } | null = null;

    try {
      if (responseContent) {
        aiChoice = JSON.parse(responseContent);
      }
    } catch (e) {
      console.error("Failed to parse AI response:", e);
    }

    const chosenDishName = aiChoice?.dishName?.trim();

    // Step 2: Validate the AI's choice.
    let chosenDish = chosenDishName ? allDishes.find(d => d.name.toLowerCase() === chosenDishName.toLowerCase()) : undefined;

    // Step 3: If AI fails or returns invalid data, fall back to random selection.
    if (!chosenDish) {
      console.warn(`AI suggested an invalid dish: "${chosenDishName}". Falling back to random selection.`);
      const mealType = mapTimeOfDayToMealType(input.timeOfDay);
      let relevantDishes = allDishes.filter(d => (d.momentSuggest || d.type || '').toLowerCase() === mealType);
      if (relevantDishes.length === 0) {
        relevantDishes = allDishes; // Fallback to all if no type matches
      }
      chosenDish = relevantDishes[Math.floor(Math.random() * relevantDishes.length)];
    }

    // Step 4: Construct the final output based on the (now guaranteed valid) dish data.
    return {
      name: chosenDish.name,
      calories: chosenDish.calories || Math.floor(Math.random() * 300) + 300,
      cookingTime: chosenDish.cookingTime,
      type: mapTimeOfDayToMealType(input.timeOfDay),
      imageHint: `${chosenDish.category.toLowerCase()} ${chosenDish.origin.toLowerCase()}`.substring(0, 50),
      imageUrl: chosenDish.imageUrl,
      recipe: chosenDish.recipe,
      message: aiChoice?.message || "Voici une excellente idée pour vous !",
    };

  } catch (error: any) {
    console.error('Error in suggestSingleMeal:', error);
    // Fallback in case of a complete API failure
    const firestore = await getFirestoreInstance();
    const allDishes = await getDishesFromFirestore(firestore);
    if (allDishes.length > 0) {
      const randomDish = allDishes[Math.floor(Math.random() * allDishes.length)];
      return {
        name: randomDish.name,
        calories: randomDish.calories || Math.floor(Math.random() * 300) + 300,
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
