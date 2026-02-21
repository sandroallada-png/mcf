
import type {
    SuggestHealthyReplacementsInput,
    ProvidePersonalizedDietaryTipsInput,
    NutritionalAgentChatInput,
    GenerateConversationTitleInput,
    SuggestRecipesFromIngredientsInput,
    SuggestMealPlanInput,
    SuggestMealPlanOutput,
    SuggestSingleMealInput,
    SingleMealSuggestion,
    EstimateCaloriesInput,
    GetMotivationalMessageInput,
    GetMotivationalMessageOutput,
    GenerateRecipeInput,
    GenerateRecipeOutput,
    EstimateCaloriesOutput,
    SuggestDayPlanInput,
    SuggestDayPlanOutput,
    GenerateReminderInput,
    GenerateReminderOutput,
} from '@/lib/types';

// Native implementations (Client-side stubs)
// These functions will be used when the app is built for native platforms (APK/iOS)
// avoiding server-side code execution errors during build/export.

export async function getSuggestionsAction(
    input: SuggestHealthyReplacementsInput
) {
    console.warn('Native: getSuggestionsAction called (stub)');
    return { suggestions: null, error: 'Not available in native mode' };
}

export async function getTipsAction(input: ProvidePersonalizedDietaryTipsInput) {
    console.warn('Native: getTipsAction called (stub)');
    return { tips: null, error: 'Not available in native mode' };
}

export async function chatAction(input: NutritionalAgentChatInput) {
    console.warn('Native: chatAction called (stub)');
    return { messages: [], error: 'Not available in native mode' };
}

export async function generateTitleAction(input: GenerateConversationTitleInput) {
    console.warn('Native: generateTitleAction called (stub)');
    return { title: null, error: 'Not available in native mode' };
}

export async function getRecipesFromIngredientsAction(
    input: SuggestRecipesFromIngredientsInput
) {
    console.warn('Native: getRecipesFromIngredientsAction called (stub)');
    return { recipes: null, error: 'Not available in native mode' };
}

export async function getMealPlanAction(
    input: SuggestMealPlanInput
): Promise<{ mealPlan: SuggestMealPlanOutput | null; error: string | null }> {
    console.warn('Native: getMealPlanAction called (stub)');
    return { mealPlan: null, error: 'Not available in native mode' };
}

export async function getSingleMealSuggestionAction(
    input: SuggestSingleMealInput
): Promise<{ suggestion: SingleMealSuggestion | null; error: string | null }> {
    console.warn('Native: getSingleMealSuggestionAction called (stub)');
    return { suggestion: null, error: 'Not available in native mode' };
}

export async function estimateCaloriesAction(
    input: EstimateCaloriesInput
): Promise<EstimateCaloriesOutput & { error: string | null }> {
    console.warn('Native: estimateCaloriesAction called (stub)');
    return { calories: 0, xpGained: 0, error: 'Not available in native mode' };
}

export async function getMotivationalMessageAction(
    input: GetMotivationalMessageInput
): Promise<{ message: GetMotivationalMessageOutput | null; error: string | null }> {
    console.warn('Native: getMotivationalMessageAction called (stub)');
    return { message: null, error: 'Not available in native mode' };
}

export async function generateRecipeAction(
    input: GenerateRecipeInput
): Promise<{ recipe: GenerateRecipeOutput | null; error: string | null }> {
    console.warn('Native: generateRecipeAction called (stub)');
    return { recipe: null, error: 'Not available in native mode' };
}

export async function suggestDayPlanAction(
    input: SuggestDayPlanInput
): Promise<{ plan: SuggestDayPlanOutput | null; error: string | null }> {
    console.warn('Native: suggestDayPlanAction called (stub)');
    return { plan: null, error: 'Not available in native mode' };
}

export async function generateReminderMessageAction(
    input: GenerateReminderInput
): Promise<{ message: GenerateReminderOutput | null; error: string | null }> {
    console.warn('Native: generateReminderMessageAction called (stub)');
    return { message: null, error: 'Not available in native mode' };
}

export async function createHouseholdInviteAction(input: any) {
    console.warn('Native: createHouseholdInviteAction called (stub)');
    return { inviteId: null, error: 'Not available in native mode' };
}

export async function getInviteAction(inviteId: string) {
    console.warn('Native: getInviteAction called (stub)');
    return { invite: null, error: 'Not available in native mode' };
}
