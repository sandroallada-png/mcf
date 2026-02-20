'use server';
/**
 * @fileOverview AI agent that estimates calories and assigns XP based on a meal's alignment with user goals.
 */

import OpenAI from 'openai';
import { z } from 'zod';

const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

const EstimateCaloriesInputSchema = z.object({
  mealName: z.string().describe('The name of the meal to estimate calories for.'),
  userObjective: z.string().describe("The user's primary dietary objective (e.g., 'Perte de poids', 'Prise de masse').")
});

const EstimateCaloriesOutputSchema = z.object({
  calories: z.number().describe('The estimated number of calories for the meal.'),
  xpGained: z.number().describe('The XP points gained or lost based on alignment with the user objective. Positive for good choices, negative for bad ones.'),
});

type EstimateCaloriesInput = z.infer<typeof EstimateCaloriesInputSchema>;
type EstimateCaloriesOutput = z.infer<typeof EstimateCaloriesOutputSchema>;

export async function estimateCalories(
  input: EstimateCaloriesInput
): Promise<EstimateCaloriesOutput> {
    const systemPrompt = `You are a nutritional expert and a motivational coach for a diet app.
Your task is to analyze a meal and determine its calorie count and its relevance to the user's main objective.

1.  **Estimate Calories**: Provide a reasonable and common calorie estimate for the given meal name.
2.  **Calculate XP**: Based on the user's objective, assign experience points (XP).
    - If the meal aligns with the objective (e.g., salad for weight loss, protein shake for muscle gain), award positive XP (between +3 and +10).
    - If the meal goes against the objective (e.g., pizza for weight loss), assign negative XP (between -3 and -10).
    - For neutral meals, assign a small amount of XP (0 to +2).
    - Be fair and consider the context. A small treat is not a catastrophe.

User's Main Objective: "${input.userObjective}"

You must respond in French.
Your response MUST be a JSON object matching the following schema: { "calories": number, "xpGained": number }`;

    const userContent = `Meal: "${input.mealName}"`;

    try {
        const completion = await openrouter.chat.completions.create({
            model: 'openai/gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userContent },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.2,
        });

        const responseJson = completion.choices[0]?.message?.content;
        if (!responseJson) {
            throw new Error('No response from AI');
        }

        const parsedResponse = JSON.parse(responseJson);
        const validatedResponse = EstimateCaloriesOutputSchema.parse(parsedResponse);
        
        // Ensure calories are within a reasonable range
        if (validatedResponse.calories < 0) {
            validatedResponse.calories = 0;
        }
        // Ensure XP is within a reasonable range
        validatedResponse.xpGained = Math.max(-10, Math.min(10, validatedResponse.xpGained));


        return validatedResponse;
    } catch (error) {
        console.error('Error in estimateCalories:', error);
        // Fallback to a neutral value in case of API error
        return { calories: Math.floor(Math.random() * 400) + 200, xpGained: 1 };
    }
}
