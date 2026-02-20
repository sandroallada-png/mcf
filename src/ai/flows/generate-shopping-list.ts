
'use server';

import OpenAI from 'openai';
import {
    GenerateShoppingListInputSchema,
    GenerateShoppingListOutputSchema,
    type GenerateShoppingListInput,
    type GenerateShoppingListOutput,
} from '@/lib/types';

const openrouter = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
});

export async function generateShoppingList(
    input: GenerateShoppingListInput
): Promise<GenerateShoppingListOutput> {
    try {
        const systemPrompt = `Tu es un assistant culinaire expert et un nutritionniste. Ton but est de générer une liste de courses précise et optimisée.

ANALYSE DES DONNÉES UTILISATEUR :
1. Repas aimés/récents : ${input.likedMeals.join(', ')}
2. Origine culturelle : ${input.origin || 'Non spécifiée'}
3. Pays de résidence : ${input.country || 'Non spécifié'}
4. Contenu du frigo (à exclure si possible ou à compléter) : ${input.fridgeContents.join(', ')}
5. Préférences/Allergies : ${JSON.stringify(input.personality || {})}

OBJECTIF :
- Génère une liste de courses pour la semaine.
- Propose des ingrédients cohérents avec les repas aimés de l'utilisateur et ses origines.
- Ne suggère pas d'ingrédients que l'utilisateur a déjà dans son frigo, sauf s'ils sont presque épuisés ou nécessaires en plus grande quantité.
- Organise la liste par catégories (Légumes, Épicerie, Viandes/Poissons, Produits Laitiers, etc.).
- Ajoute une explication concise (summary) de tes choix.

FORMAT DE SORTIE (JSON STRICT) :
{
  "items": [
    { "name": "Nom de l'article", "category": "Catégorie", "quantity": "Quantité suggérée", "reason": "Pourquoi cet article ?" }
  ],
  "summary": "Résumé de l'analyse IA..."
}
`;

        const completion = await openrouter.chat.completions.create({
            model: 'openai/gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: 'Génère ma liste de courses personnalisée.' }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
        return GenerateShoppingListOutputSchema.parse(result);

    } catch (error: any) {
        console.error('Error in generateShoppingList:', error);
        throw new Error('Impossible de générer la liste de courses : ' + error.message);
    }
}
