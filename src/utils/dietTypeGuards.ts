import type { FoodItemMacros, SavedDietPlan, SavedDietPlanSummary } from "../types/diet";

export const isFoodItemMacros = (value: unknown): value is FoodItemMacros => {
    if (!value || typeof value !== "object") return false;
    const macros = value as Record<string, unknown>;
    return typeof macros.protein === "number"
        && typeof macros.fat === "number"
        && typeof macros.carb === "number";
};

export const isSavedPlanSummary = (value: unknown): value is SavedDietPlanSummary => {
    if (!value || typeof value !== "object") return false;
    const plan = value as Record<string, unknown>;
    return typeof plan.id === "string"
        && typeof plan.title === "string"
        && typeof plan.targetCalories === "number"
        && typeof plan.dietType === "string"
        && typeof plan.mealsPerDay === "number"
        && typeof plan.allergies === "string"
        && isFoodItemMacros(plan.macros)
        && typeof plan.createdAt === "string";
};

export const isSavedDietPlan = (value: unknown): value is SavedDietPlan => {
    if (!isSavedPlanSummary(value)) return false;
    const plan = value as unknown as Record<string, unknown>;
    return Array.isArray(plan.meals)
        && plan.meals.every((meal) => {
            if (!meal || typeof meal !== "object") return false;
            const mealRecord = meal as Record<string, unknown>;
            return typeof mealRecord.title === "string"
                && Array.isArray(mealRecord.items)
                && mealRecord.items.every((item) => {
                    if (!item || typeof item !== "object") return false;
                    const itemRecord = item as Record<string, unknown>;
                    return typeof itemRecord.name === "string"
                        && typeof itemRecord.cal === "number"
                        && typeof itemRecord.fullText === "string"
                        && isFoodItemMacros(itemRecord.macros);
                });
        });
};
