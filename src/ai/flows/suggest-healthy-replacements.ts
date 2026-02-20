
'use server';
/**
 * @fileOverview AI agent that suggests healthier replacements for logged meals.
 */

import OpenAI from 'openai';
import { SuggestHealthyReplacementsInputSchema, SuggestHealthyReplacementsOutputSchema, type SuggestHealthyReplacementsInput, type SuggestHealthyReplacementsOutput } from '@/lib/types';

const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function suggestHealthyReplacements(
  input: SuggestHealthyReplacementsInput
): Promise<SuggestHealthyReplacementsOutput> {
    const systemPrompt = `You are a nutritional expert. Based on the user's logged food and health goals, suggest a few healthier alternative meals or snacks.
Provide a list of suggestions.
Your response must be a JSON object matching the following schema: { "suggestions": ["string", "string", ...] }`;

    const userContent = `Logged Food: ${input.loggedFood}\nHealth Goals: ${input.healthGoals}`;

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
        return SuggestHealthyReplacementsOutputSchema.parse(parsedResponse);
    } catch (error) {
        console.error('Error in suggestHealthyReplacements:', error);
        throw new Error("Failed to generate suggestions.");
    }
}
