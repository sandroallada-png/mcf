
'use server';
/**
 * @fileOverview AI agent that generates a simple recipe for a given meal name.
 */

import OpenAI from 'openai';
import { GenerateRecipeInputSchema, GenerateRecipeOutputSchema, type GenerateRecipeInput, type GenerateRecipeOutput } from '@/lib/types';

const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function generateRecipe(
  input: GenerateRecipeInput
): Promise<GenerateRecipeOutput> {
    const systemPrompt = `You are a helpful chef's assistant. Your task is to provide a simple, easy-to-follow recipe for a given meal.
The recipe should be clear, concise, and formatted in Markdown. It should include an ingredient list and step-by-step instructions.
Keep it simple enough for a home cook. You must respond in French.
Your response must be a JSON object matching the following schema: { "recipe": "string in markdown format" }`;

    const userContent = `Meal: "${input.mealName}"`;

    try {
        const completion = await openrouter.chat.completions.create({
            model: 'openai/gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userContent },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
        });

        const responseJson = completion.choices[0]?.message?.content;
        if (!responseJson) {
            throw new Error('No response from AI');
        }

        const parsedResponse = JSON.parse(responseJson);
        return GenerateRecipeOutputSchema.parse(parsedResponse);
    } catch (error) {
        console.error('Error in generateRecipe:', error);
        return { recipe: "Désolé, je n'ai pas pu trouver de recette pour ce plat. Essayez de chercher en ligne !" };
    }
}
