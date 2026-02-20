
'use server';
/**
 * @fileOverview Provides personalized dietary tips based on food logs and dietary goals.
 */

import OpenAI from 'openai';
import { ProvidePersonalizedDietaryTipsInputSchema, ProvidePersonalizedDietaryTipsOutputSchema, type ProvidePersonalizedDietaryTipsInput, type ProvidePersonalizedDietaryTipsOutput } from '@/lib/types';


const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function providePersonalizedDietaryTips(
  input: ProvidePersonalizedDietaryTipsInput
): Promise<ProvidePersonalizedDietaryTipsOutput> {
    const systemPrompt = `You are a personal nutritionist providing dietary advice.
Based on the user's food logs and dietary goals, provide personalized tips and recommendations to help them improve their eating habits and achieve their goals.
Your response must be a JSON object matching the following schema: { "tips": "string" }`;

    const userContent = `Food Logs: ${input.foodLogs}\nDietary Goals: ${input.dietaryGoals}`;

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
        return ProvidePersonalizedDietaryTipsOutputSchema.parse(parsedResponse);
    } catch (error) {
        console.error('Error in providePersonalizedDietaryTips:', error);
        throw new Error("Failed to generate dietary tips.");
    }
}
