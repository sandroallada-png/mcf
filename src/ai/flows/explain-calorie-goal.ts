'use server';
/**
 * @fileOverview AI agent that explains a calorie target with concrete eamples.
 */

import OpenAI from 'openai';
import { z } from 'zod';
import { ExplainCalorieGoalInputSchema, ExplainCalorieGoalOutputSchema, type ExplainCalorieGoalInput, type ExplainCalorieGoalOutput } from '@/lib/types';

const openrouter = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
});

export async function explainCalorieGoal(
    input: ExplainCalorieGoalInput
): Promise<ExplainCalorieGoalOutput> {
    const isFamily = input.eatersCount && input.eatersCount > 1;
    const systemPrompt = `Tu es un expert en nutrition bienveillant. 
Ta mission est d'expliquer à l'utilisateur ce que représente concrètement son objectif de calories journalier (${input.targetCalories} kcal).
${isFamily ? `\n⚠️ ATTENTION : L'objectif total que tu dois expliquer est pour une famille de ${input.eatersCount} personnes (soit environ ${Math.round(input.targetCalories / input.eatersCount!)} kcal par personne). Félicite-les pour ces repas en famille, et donne des exemples de "repas pour ${input.eatersCount}" qui atteignent ces ${input.targetCalories} kcal au total !` : ''}

Donne des exemples parlants de repas typiques pour atteindre ce total sur une journée (Petit-déjeuner, Déjeuner, Dîner, Collation).
Sois très concret et utilise des plats réels.
Adapte tes exemples si l'utilisateur a des préférences ou des objectifs spécifiques : "${input.personality?.mainObjective || 'Manger équilibré'}".

Format de réponse :
- Un ton encourageant et complice.
- Des exemples de plats variés.
- Utilise des emojis pour rendre le texte vivant.
- Reste concis (pas plus de 150 mots).

Tu dois répondre en Français.
Ton objectif est de rassurer l'utilisateur sur le fait que son objectif est atteignable et gourmand.

Ta réponse DOIT être un objet JSON avec la clé "explanation".`;

    const userContent = `Objectif : ${input.targetCalories} kcal / jour.`;

    try {
        const completion = await openrouter.chat.completions.create({
            model: 'openai/gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userContent },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        const responseJson = completion.choices[0]?.message?.content;
        if (!responseJson) {
            throw new Error('No response from AI');
        }

        const parsedResponse = JSON.parse(responseJson);
        const validatedResponse = ExplainCalorieGoalOutputSchema.parse(parsedResponse);

        return validatedResponse;
    } catch (error) {
        console.error('Error in explainCalorieGoal:', error);
        return { explanation: `Avec ${input.targetCalories} kcal, vous pouvez manger des repas équilibrés comme un poulet grillé avec du riz et des légumes, ou un bon bol de porridge le matin. C'est un excellent objectif !` };
    }
}
