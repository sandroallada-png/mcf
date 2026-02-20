
'use server';
/**
 * @fileOverview Suggests a meal plan by intelligently selecting dishes from Firestore using an AI model.
 */

import OpenAI from 'openai';
import {
  SuggestMealPlanInputSchema,
  SuggestMealPlanOutputSchema,
  type SuggestMealPlanInput,
  type SuggestMealPlanOutput,
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

function mapMealTypeToFrench(type: 'breakfast' | 'lunch' | 'dinner' | 'snack'): string {
    switch (type) {
        case 'breakfast': return 'Petit-déjeuner';
        case 'lunch': return 'Déjeuner';
        case 'dinner': return 'Dîner';
        case 'snack': return 'Collation';
    }
}

export async function suggestMealPlan(
  input: SuggestMealPlanInput
): Promise<SuggestMealPlanOutput> {
    try {
        const firestore = await getFirestoreInstance();
        const allDishes = await getDishesFromFirestore(firestore);

        if (allDishes.length < 3) {
            throw new Error('Not enough dishes in the database to generate a full meal plan.');
        }

        // 1. Ask the AI to pick the names of the best 3 dishes for a day plan.
        const dishListForAI = allDishes.map(d => `- "${d.name}" (Type: ${d.type || 'N/A'}, Catégorie: ${d.category})`).join('\n');

        let systemPrompt = `You are an expert nutritionist. Your task is to select three dishes from the provided list to create a balanced and appealing one-day meal plan (breakfast, lunch, dinner).

User's dietary goals: "${input.dietaryGoals}"
`;
        if (input.personality) {
            systemPrompt += `\nConsider their preferences: ${JSON.stringify(input.personality)}`;
        }
        systemPrompt += `
Here is the list of available dishes:
${dishListForAI}

Your response MUST be a JSON object with three keys: "breakfast", "lunch", and "dinner". The value for each key must be ONLY the name of the dish you have chosen, exactly as it appears in the list.

Example of a valid JSON response:
{
  "breakfast": "Pancakes protéinés",
  "lunch": "Salade composée (poulet, pâtes, thon…)",
  "dinner": "Saumon au four"
}`;

        const completion = await openrouter.chat.completions.create({
            model: 'openai/gpt-4o-mini',
            messages: [{ role: 'system', content: systemPrompt }],
            response_format: { type: 'json_object' },
            temperature: 0.5,
        });

        const responseJson = completion.choices[0]?.message?.content;
        if (!responseJson) {
            throw new Error('AI did not return a response.');
        }
        
        const chosenDishNames = JSON.parse(responseJson) as { breakfast: string, lunch: string, dinner: string };
        
        // 2. Map AI choices back to full dish objects
        const suggestions: SuggestMealPlanOutput = [];
        const mealTypes: ('breakfast' | 'lunch' | 'dinner')[] = ['breakfast', 'lunch', 'dinner'];

        for (const type of mealTypes) {
            const dishName = chosenDishNames[type];
            const foundDish = allDishes.find(d => d.name.toLowerCase() === dishName?.toLowerCase());

            if (foundDish) {
                suggestions.push({
                    name: foundDish.name,
                    calories: Math.floor(Math.random() * 300) + 300, // Placeholder
                    cookingTime: foundDish.cookingTime,
                    imageHint: `${foundDish.category.toLowerCase()} ${foundDish.origin.toLowerCase()}`.substring(0, 50),
                    imageUrl: foundDish.imageUrl || `https://picsum.photos/seed/${foundDish.name.replace(/\s/g, '-')}/400/300`,
                    type: type,
                });
            }
        }
        
        // 3. Fallback: If AI fails to produce 3 valid suggestions, use random selection.
        if (suggestions.length < 3) {
            console.warn("AI suggestion was incomplete. Falling back to random selection.");
            const shuffled = allDishes.sort(() => 0.5 - Math.random());
            return [
                { ...shuffled[0], calories: 350, type: 'breakfast' },
                { ...shuffled[1], calories: 550, type: 'lunch' },
                { ...shuffled[2], calories: 600, type: 'dinner' },
            ].map(d => ({
                name: d.name,
                calories: d.calories,
                cookingTime: d.cookingTime,
                imageHint: `${d.category.toLowerCase()} ${d.origin.toLowerCase()}`.substring(0, 50),
                imageUrl: d.imageUrl || `https://picsum.photos/seed/${d.name.replace(/\s/g, '-')}/400/300`,
                type: d.type as 'breakfast' | 'lunch' | 'dinner',
            }));
        }
            
        return suggestions;

    } catch (error) {
        console.error('Error in suggestMealPlan:', error);
        // If anything fails, provide a random plan as a last resort.
        const firestore = await getFirestoreInstance();
        const allDishes = await getDishesFromFirestore(firestore);
        if (allDishes.length < 3) return [];
        
        const shuffled = allDishes.sort(() => 0.5 - Math.random());
        return [
            { ...shuffled[0], calories: 350, type: 'breakfast' },
            { ...shuffled[1], calories: 550, type: 'lunch' },
            { ...shuffled[2], calories: 600, type: 'dinner' },
        ].map(d => ({
            name: d.name,
            calories: d.calories,
            cookingTime: d.cookingTime,
            imageHint: `${d.category.toLowerCase()} ${d.origin.toLowerCase()}`.substring(0, 50),
            imageUrl: d.imageUrl || `https://picsum.photos/seed/${d.name.replace(/\s/g, '-')}/400/300`,
            type: d.type as 'breakfast' | 'lunch' | 'dinner',
        }));
    }
}
