
'use server';
/**
 * @fileOverview AI agent that generates a personalized motivational message for a user.
 */

import OpenAI from 'openai';
import { GetMotivationalMessageInputSchema, GetMotivationalMessageOutputSchema, type GetMotivationalMessageInput, type GetMotivationalMessageOutput } from '@/lib/types';

const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function getMotivationalMessage(
  input: GetMotivationalMessageInput
): Promise<GetMotivationalMessageOutput> {
    const systemPrompt = `You are a very positive and motivating personal coach for the "my cook flex" app.
Your only task is to generate a short, personalized, and encouraging message for a user based on their progress.
Keep it under 3-4 sentences. Be specific, positive, and forward-looking.
You MUST respond in French.
Your response MUST be a JSON object matching the following schema: { "message": "string" }`;

    const userContent = `User's name: ${input.userName}
Current Level: ${input.level}
Current Streak: ${input.streak} days
Main Objective: ${input.mainObjective}`;

    try {
        const completion = await openrouter.chat.completions.create({
            model: 'openai/gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userContent },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.8,
        });

        const responseJson = completion.choices[0]?.message?.content;
        if (!responseJson) {
            throw new Error('No response from AI');
        }

        const parsedResponse = JSON.parse(responseJson);
        return GetMotivationalMessageOutputSchema.parse(parsedResponse);
    } catch (error) {
        console.error('Error in getMotivationalMessage:', error);
        return { message: "Continuez vos efforts, vous êtes sur la bonne voie !" };
    }
}
