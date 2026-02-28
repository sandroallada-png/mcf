'use server';
/**
 * @fileOverview AI agent that suggests healthier replacements for logged meals.
 */

import OpenAI from 'openai';
import { SuggestHealthyReplacementsInputSchema, SuggestHealthyReplacementsOutputSchema, type SuggestHealthyReplacementsInput, type SuggestHealthyReplacementsOutput, Dish } from '@/lib/types';
import { collection, getDocs, Firestore, query, where } from 'firebase/firestore';
import { getFirestoreInstance } from '@/firebase/server-init';

const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

async function getDishesFromFirestore(db: Firestore): Promise<Dish[]> {
    const dishesCol = collection(db, 'dishes');
    // On privilégie les plats vérifiés
    const qV = query(dishesCol, where('isVerified', '==', true));
    const verifiedSnap = await getDocs(qV);

    if (!verifiedSnap.empty) {
        return verifiedSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Dish));
    }

    // Fallback si aucun plat n'est vérifié
    const dishSnapshot = await getDocs(dishesCol);
    return dishSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Dish));
}

export async function suggestHealthyReplacements(
  input: SuggestHealthyReplacementsInput
): Promise<SuggestHealthyReplacementsOutput> {
    try {
        const firestore = await getFirestoreInstance();
        const allDishes = await getDishesFromFirestore(firestore);

        let systemPrompt = `You are a nutritional expert. Based on the user's logged food and health goals, suggest a few healthier alternative meals or snacks.
Provide a list of 2 or 3 suggestions.
Your response must be a JSON object matching the following schema: { "suggestions": [{ "name": "string", "calories": number, "imageHint": "string" }, ...] }`;

        if (allDishes.length > 0) {
            const dishListForAI = allDishes.map(d => `- "${d.name}" (Catégorie: ${d.category}, Calories: ${d.calories || 'N/A'})`).join('\n');
            systemPrompt += `\n\nCRITICAL INSTRUCTION: You MUST ONLY choose alternative meal suggestions from the following list of available dishes:\n${dishListForAI}\nDo not invent new dishes. Only use exact names from the list.`;
        }

        const userContent = `Logged Food: ${input.loggedFood}\nHealth Goals: ${input.healthGoals}`;

        const completion = await openrouter.chat.completions.create({
            model: 'openai/gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userContent },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.6,
        });

        const responseJson = completion.choices[0]?.message?.content;
        if (!responseJson) {
            throw new Error('No response from AI');
        }

        const parsedResponse = JSON.parse(responseJson);
        const validatedResponse = SuggestHealthyReplacementsOutputSchema.parse(parsedResponse);
        
        // Hook back the AI selections to the exact database objects to retrieve imageUrls
        const finalSuggestions = validatedResponse.suggestions.map(s => {
          const matchedDish = allDishes.find(d => d.name.toLowerCase() === s.name.toLowerCase());
          if (matchedDish) {
            return {
              name: matchedDish.name,
              calories: matchedDish.calories || s.calories || 0,
              imageHint: matchedDish.category || s.imageHint || '',
              imageUrl: matchedDish.imageUrl
            };
          }
          return s; // Fallback to AI's raw output if not matched exactly
        }).filter(s => s !== null);

        return { suggestions: finalSuggestions };

    } catch (error) {
        console.error('Error in suggestHealthyReplacements:', error);
        
        // Fallback: Random selection if AI fails
        try {
            const firestore = await getFirestoreInstance();
            const allDishes = await getDishesFromFirestore(firestore);
            if (allDishes.length > 0) {
                 const shuffled = allDishes.sort(() => 0.5 - Math.random()).slice(0, 2);
                 return {
                     suggestions: shuffled.map(d => ({
                         name: d.name,
                         calories: d.calories || 300,
                         imageHint: d.category || '',
                         imageUrl: d.imageUrl
                     }))
                 };
            }
        } catch(e) {}
        
        throw new Error("Failed to generate suggestions.");
    }
}
