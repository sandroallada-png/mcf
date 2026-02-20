
'use server';
/**
 * @fileOverview Suggests recipes based on a list of available ingredients.
 */

import OpenAI from 'openai';
import { SuggestRecipesFromIngredientsInputSchema, SuggestRecipesFromIngredientsOutputSchema, type SuggestRecipesFromIngredientsInput, type SuggestRecipesFromIngredientsOutput } from '@/lib/types';


const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});


export async function suggestRecipesFromIngredients(
  input: SuggestRecipesFromIngredientsInput
): Promise<SuggestRecipesFromIngredientsOutput> {
    const systemPrompt = `You are a creative chef who excels at making delicious meals with whatever is on hand.
A user will provide you with a list of ingredients they have.
Your task is to suggest 2-3 simple and appealing recipes they can make.

- Prioritize using the provided ingredients.
- For each recipe, list any common, essential ingredients the user might be missing to complete it.
- Keep the recipes relatively simple and suitable for a home cook.
- Respond exclusively in the following language: French.
- Your response must be a JSON object matching the following schema: { "recipes": [{ "name": "string", "description": "string", "missingIngredients": ["string", ...] }] }`;

    const userContent = `Ingredients available:\n${input.ingredients.map(i => `- ${i}`).join('\n')}`;

    try {
        const completion = await openrouter.chat.completions.create({
            model: 'openai/gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userContent },
            ],
            response_format: { type: 'json_object' },
        });

        const responseJson = completion.choices[0]?.message?.content;
        if (!responseJson) {
            throw new Error('No response from AI');
        }

        const parsedResponse = JSON.parse(responseJson);
        return SuggestRecipesFromIngredientsOutputSchema.parse(parsedResponse);
    } catch (error) {
        console.error('Error in suggestRecipesFromIngredients:', error);
        throw new Error("Failed to generate recipes.");
    }
}
