
'use server';
/**
 * @fileOverview AI agent that generates a personalized reminder message for inactive users.
 */

import OpenAI from 'openai';
import type { GenerateReminderInput, GenerateReminderOutput } from '@/lib/types';
import { GenerateReminderOutputSchema } from '@/lib/types';


const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function generateReminderMessage(
  input: GenerateReminderInput
): Promise<GenerateReminderOutput> {
    const systemPrompt = `You are a marketing and user engagement expert for a nutrition app called "my cook flex".
Your task is to generate a short, friendly, and effective reminder message to re-engage users.

You will be given a "type" (${input.type}) and a "userSegment".

- If the type is "notification", the body should be very short (max 150 characters) and punchy. NO subject is needed.
- If the type is "email", you MUST provide a friendly subject line and a slightly more detailed body (max 4-5 sentences).
- The tone should be encouraging and not guilt-inducing.
- End with a clear call-to-action, like inviting them to discover a new recipe or plan their next meal.
- You MUST respond in French.
- Your response MUST be a JSON object matching this schema: { "subject": "(string, optional)", "body": "string" }`;

    const userContent = `User Segment: "${input.userSegment}"
Message Type: "${input.type}"`;

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
        
        // Ensure subject is omitted for notifications
        if (input.type === 'notification') {
            delete parsedResponse.subject;
        }
        
        return GenerateReminderOutputSchema.parse(parsedResponse);
    } catch (error) {
        console.error('Error in generateReminderMessage:', error);
        return { 
            subject: 'On pense à vous !',
            body: "De nouvelles recettes et fonctionnalités vous attendent sur My Cook Flex. Venez les découvrir !" 
        };
    }
}
