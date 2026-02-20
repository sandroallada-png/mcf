
'use server';
/**
 * @fileOverview Generates a concise title for a conversation.
 */

import OpenAI from 'openai';
import { GenerateConversationTitleInputSchema, type GenerateConversationTitleInput, GenerateConversationTitleOutputSchema, type GenerateConversationTitleOutput } from '@/lib/types';


// Initialize the OpenAI client to point to OpenRouter
const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function generateConversationTitle(
  input: GenerateConversationTitleInput
): Promise<GenerateConversationTitleOutput> {
    const systemPrompt = `Based on the following messages, generate a very short, descriptive title (3-5 words maximum) for the conversation in French.
Your response must be a JSON object matching the following schema: { "title": "string" }`;

    const userMessages = input.messages.map(m => `- ${m.role}: ${m.text}`).join('\n');

    try {
        const completion = await openrouter.chat.completions.create({
            model: 'openai/gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessages },
            ],
            response_format: { type: 'json_object' },
        });

        const responseJson = completion.choices[0]?.message?.content;

        if (!responseJson) {
            throw new Error('No response from AI');
        }

        const parsedResponse = JSON.parse(responseJson);
        return GenerateConversationTitleOutputSchema.parse(parsedResponse);

    } catch (error) {
        console.error('Error in generateConversationTitle:', error);
        return { title: 'Nouvelle conversation' };
    }
}
