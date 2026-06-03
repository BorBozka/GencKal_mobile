import { getConfiguredApiBaseUrlOrThrow, parseApiError } from "./api";
import type { DiyetTipi } from "../types";
import type { FoodItem, FoodItemMacros, GeneratedPlan } from "../types/diet";
import { isFoodItemMacros } from "../utils/dietTypeGuards";

type ApiDietResponse = Omit<GeneratedPlan, "meals"> & {
    meals: {
        title: string;
        items: {
            name: string;
            cal: number;
            fullText: string;
            macros?: FoodItemMacros;
        }[];
    }[];
};

type GenerateDietPlanRequest = {
    targetCalories: number;
    dietType: DiyetTipi;
    mealsPerDay: number;
    allergies: string[];
    signal: AbortSignal;
};

type SwapFoodRequest = {
    currentFood: FoodItem;
    mealTitle: string;
    dietType: DiyetTipi;
    allergies: string[];
    signal: AbortSignal;
};

type SaveDietPlanRequest = {
    authHeaders: Record<string, string>;
    title: string;
    targetCalories: number;
    dietType: DiyetTipi;
    mealsPerDay: number;
    allergies: string[];
    plan: GeneratedPlan;
};

const isValidDietResponse = (data: unknown): data is ApiDietResponse => {
    if (!data || typeof data !== "object") return false;
    const d = data as Record<string, unknown>;
    if (!Array.isArray(d.meals)) return false;
    if (!isFoodItemMacros(d.macros)) return false;
    return d.meals.every((meal) => {
        if (!meal || typeof meal !== "object") return false;
        const m = meal as Record<string, unknown>;
        if (typeof m.title !== "string" || !Array.isArray(m.items)) return false;

        return m.items.every((item) => {
            if (!item || typeof item !== "object") return false;
            const food = item as Record<string, unknown>;
            const hasRequiredFields = typeof food.name === "string"
                && typeof food.cal === "number"
                && typeof food.fullText === "string";
            if (!hasRequiredFields) return false;
            return food.macros === undefined || isFoodItemMacros(food.macros);
        });
    });
};

const isValidSwapFood = (value: unknown): value is Omit<FoodItem, "id"> => {
    if (!value || typeof value !== "object") return false;
    const food = value as Record<string, unknown>;
    return typeof food.name === "string"
        && typeof food.cal === "number"
        && typeof food.fullText === "string"
        && (food.macros === undefined || isFoodItemMacros(food.macros));
};

export const requestGeneratedDietPlan = async ({
    targetCalories,
    dietType,
    mealsPerDay,
    allergies,
    signal,
}: GenerateDietPlanRequest) => {
    const response = await fetch(`${getConfiguredApiBaseUrlOrThrow()}/api/generate-diet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal,
        body: JSON.stringify({
            targetCalories,
            dietType,
            mealsPerDay,
            allergies: allergies.join(", ") || undefined,
        }),
    });

    if (!response.ok) {
        throw new Error("Sunucu hatası");
    }

    const rawData: unknown = await response.json();
    if (!isValidDietResponse(rawData)) {
        throw new Error("API'den geçersiz yanıt formatı alındı");
    }

    return rawData;
};

export const requestSwapFood = async ({
    currentFood,
    mealTitle,
    dietType,
    allergies,
    signal,
}: SwapFoodRequest) => {
    const response = await fetch(`${getConfiguredApiBaseUrlOrThrow()}/api/swap-food`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal,
        body: JSON.stringify({
            currentFood: {
                name: currentFood.name,
                cal: currentFood.cal,
                fullText: currentFood.fullText,
                macros: currentFood.macros || { protein: 0, fat: 0, carb: 0 },
            },
            mealTitle,
            dietType,
            allergies: allergies.join(", ") || undefined,
        }),
    });

    if (!response.ok) {
        throw new Error("Swap hatası");
    }

    const rawSwapFood: unknown = await response.json();
    if (!isValidSwapFood(rawSwapFood)) {
        throw new Error("Swap API geçersiz yanıt döndürdü");
    }

    return rawSwapFood;
};

export const saveGeneratedDietPlan = async ({
    authHeaders,
    title,
    targetCalories,
    dietType,
    mealsPerDay,
    allergies,
    plan,
}: SaveDietPlanRequest) => {
    const response = await fetch(`${getConfiguredApiBaseUrlOrThrow()}/api/diet-plans`, {
        method: "POST",
        headers: {
            ...authHeaders,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title,
            targetCalories,
            dietType,
            mealsPerDay,
            allergies: allergies.join(", "),
            macros: plan.macros,
            meals: plan.meals,
        }),
    });

    if (!response.ok) {
        throw new Error(await parseApiError(response));
    }
};
