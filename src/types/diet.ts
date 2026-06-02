// src/types/diet.ts
// Diet ekranına özgü tipler — diet.tsx ve localDietGenerator arasında paylaşılır

export interface FoodItemMacros {
    protein: number;
    fat: number;
    carb: number;
}

export interface FoodItem {
    id: string;
    name: string;
    cal: number;
    fullText: string;
    macros?: FoodItemMacros;
}

export interface MealItem {
    id: string;
    title: string;
    items: FoodItem[];
}

export interface GeneratedPlan {
    macros: FoodItemMacros;
    meals: MealItem[];
}

export interface SavedDietPlanSummary {
    id: string;
    title: string;
    targetCalories: number;
    dietType: string;
    mealsPerDay: number;
    allergies: string;
    macros: FoodItemMacros;
    createdAt: string;
}

export interface SavedDietPlanItem {
    name: string;
    cal: number;
    fullText: string;
    macros: FoodItemMacros;
}

export interface SavedDietPlanMeal {
    title: string;
    items: SavedDietPlanItem[];
}

export interface SavedDietPlan extends SavedDietPlanSummary {
    meals: SavedDietPlanMeal[];
}
