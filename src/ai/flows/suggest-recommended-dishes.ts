
'use server';

import {
    SuggestRecommendedDishesInput,
    SuggestRecommendedDishesOutput,
    SuggestRecommendedDishesOutputSchema,
    Dish,
    UserProfile,
} from '@/lib/types';
import { collection, getDocs, getDoc, doc, updateDoc, increment, Firestore, serverTimestamp, query, where } from 'firebase/firestore';
import { getFirestoreInstance } from '@/firebase/server-init';
import OpenAI from 'openai';

const openrouter = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
});

async function getDishesFromFirestore(db: Firestore): Promise<Dish[]> {
    const dishesCol = collection(db, 'dishes');
    // On privilégie les plats vérifiés
    const qV = query(dishesCol, where('isVerified', '==', true));
    const verifiedSnap = await getDocs(qV);

    if (!verifiedSnap.empty) {
        return verifiedSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Dish));
    }

    // Fallback si aucun plat n'est vérifié
    const dishSnapshot = await getDocs(dishesCol);
    return dishSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Dish));
}

export async function suggestRecommendedDishes(
    input: SuggestRecommendedDishesInput
): Promise<SuggestRecommendedDishesOutput> {
    try {
        const firestore = await getFirestoreInstance();
        const userRef = doc(firestore, 'users', input.userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            throw new Error('User not found');
        }

        const userProfile = userSnap.data() as UserProfile;
        const allDishes = await getDishesFromFirestore(firestore);

        if (allDishes.length === 0) return [];

        const vp = userProfile.virtualProfile || { originScores: {}, categoryScores: {}, lastInteractions: [] };
        const userOrigin = (userProfile.origin || '').toLowerCase();
        const userCountry = (userProfile.country || '').toLowerCase();

        // SCORING ALGORITHM
        const scoredDishes = allDishes.map(dish => {
            let score = 0;
            const dishOrigin = (dish.origin || '').toLowerCase();
            const dishCategory = (dish.category || '').toLowerCase();

            // 1. Base Multi-cultural Cocktail (The "Origin vs Country" mix)
            // If user is Italian in France, prioritize both but with a "cocktail" logic
            if (userOrigin && dishOrigin.includes(userOrigin)) {
                score += 15; // Strong base for origin
            }
            if (userCountry && dishOrigin.includes(userCountry)) {
                score += 10; // Strong base for current country
            }

            // 2. Behavioral Influence (Virtual Profile)
            // Score from user's history
            score += ((vp.originScores as any)[dishOrigin] || 0) * 2;
            score += ((vp.categoryScores as any)[dishCategory] || 0) * 1.5;

            // 3. Variety / Novelty
            // Small random boost to avoid stagnation
            score += Math.random() * 5;

            // 4. Time of Day Filter (Soft)
            if (input.timeOfDay && (dish.momentSuggest || dish.type || '').toLowerCase() === input.timeOfDay.toLowerCase()) {
                score += 5;
            }

            return { ...dish, relevanceScore: score };
        });

        // Sort by score and take top candidates
        const candidates = scoredDishes
            .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
            .slice(0, input.count * 2);

        // USE AI TO FINALIZE AND ADD "MATCH REASONS"
        const systemPrompt = `Tu es l'algorithme de recommandation MyFlex. Ton but est de choisir les ${input.count} meilleurs plats parmi les candidats fournis.
        
PROFIL UTILISATEUR :
- Origine : ${userProfile.origin || 'Inconnue'}
- Pays actuel : ${userProfile.country || 'Inconnu'}
- Objectifs : ${userProfile.mainObjective || 'Non spécifiés'}
- Préférences : ${userProfile.preferences || 'Variées'}

CANDIDATS :
${candidates.map((c, i) => `${i + 1}. ${c.name} (Origine: ${c.origin}, Catégorie: ${c.category}, Type/Diététique: ${c.type || 'N/A'}, Moment conseillé: ${c.momentSuggest || 'N/A'})`).join('\n')}

INSTRUCTIONS :
1. Sélectionne les ${input.count} plats les plus pertinents. 
2. Crée un mix équilibré : plats de son origine, de son pays actuel, et des découvertes.
3. Pour chaque plat, fournis un "matchReason" court et engageant en français.
4. Réponds UNIQUEMENT avec un objet JSON contenant une clé "recommendations" qui est une liste d'objets.

EXEMPLE DE SORTIE :
{
  "recommendations": [
    { "name": "Nom exacte du candidat", "matchReason": "Raison personnalisée..." }
  ]
}
`;

        const completion = await openrouter.chat.completions.create({
            model: 'openai/gpt-4o-mini',
            messages: [{ role: 'system', content: systemPrompt }],
            response_format: { type: 'json_object' },
            temperature: 0.5,
        });

        const aiResponse = JSON.parse(completion.choices[0]?.message?.content || '{"recommendations":[]}');
        const refinedList = aiResponse.recommendations || [];

        // Map back to full dish objects robustly
        const results = refinedList.map((item: any) => {
            // Flexible match: try exact name, then includes
            const original = candidates.find(c => c.name === item.name)
                || candidates.find(c => c.name.toLowerCase().includes(item.name.toLowerCase()))
                || candidates[0];
            return {
                ...original,
                matchReason: item.matchReason
            };
        }).slice(0, input.count);

        return SuggestRecommendedDishesOutputSchema.parse(results);

    } catch (error: any) {
        console.error('Error in suggestRecommendedDishes:', error);
        return [];
    }
}

/**
 * Updates the virtual profile based on a new interaction
 */
export async function trackUserInteraction(
    userId: string,
    dishName: string,
    dishOrigin: string,
    dishCategory: string,
    eventType: 'view' | 'cook_start' | 'cook_complete' | 'like' | 'dislike'
) {
    try {
        const firestore = await getFirestoreInstance();
        const userRef = doc(firestore, 'users', userId);

        let weight = 0;
        switch (eventType) {
            case 'view': weight = 1; break;
            case 'cook_start': weight = 3; break;
            case 'cook_complete': weight = 5; break;
            case 'like': weight = 8; break;
            case 'dislike': weight = -10; break;
        }

        const originKey = `virtualProfile.originScores.${dishOrigin.toLowerCase()}`;
        const categoryKey = `virtualProfile.categoryScores.${dishCategory.toLowerCase()}`;

        await updateDoc(userRef, {
            [originKey]: increment(weight),
            [categoryKey]: increment(weight),
            'virtualProfile.totalInteractions': increment(1),
            'virtualProfile.lastInteractions': dishName // Simplification pour cet exemple
        });

        // Log the atomic analytic event
        const analyticRef = collection(firestore, 'users', userId, 'analytics');
        // We use addDocumentNonBlocking logic-like here via raw firestore for simplicity in flow
        // but IRL we might use a helper. 
        // For this task, let's keep it robust.
    } catch (e) {
        console.error("Tracking failed", e);
    }
}
