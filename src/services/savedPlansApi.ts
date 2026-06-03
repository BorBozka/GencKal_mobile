import { getConfiguredApiBaseUrlOrThrow, parseApiError } from "./api";
import { isSavedDietPlan, isSavedPlanSummary } from "../utils/dietTypeGuards";

const parseSavedPlanSummaries = (data: unknown) => {
    if (!data || typeof data !== "object") {
        throw new Error("API'den geçersiz plan listesi yanıtı alındı.");
    }

    const plans = (data as Record<string, unknown>).plans;
    if (!Array.isArray(plans) || !plans.every(isSavedPlanSummary)) {
        throw new Error("API'den geçersiz plan listesi yanıtı alındı.");
    }

    return plans;
};

const parseSavedDietPlan = (data: unknown) => {
    if (!data || typeof data !== "object") {
        throw new Error("API'den geçersiz plan detayı yanıtı alındı.");
    }

    const plan = (data as Record<string, unknown>).plan;
    if (!isSavedDietPlan(plan)) {
        throw new Error("API'den geçersiz plan detayı yanıtı alındı.");
    }

    return plan;
};

export const fetchSavedDietPlans = async (authHeaders: Record<string, string>) => {
    const response = await fetch(`${getConfiguredApiBaseUrlOrThrow()}/api/diet-plans`, {
        headers: authHeaders,
    });

    if (!response.ok) throw new Error(await parseApiError(response));
    const data: unknown = await response.json();
    return parseSavedPlanSummaries(data);
};

export const fetchSavedDietPlan = async (id: string, authHeaders: Record<string, string>) => {
    const response = await fetch(`${getConfiguredApiBaseUrlOrThrow()}/api/diet-plans/${id}`, {
        headers: authHeaders,
    });

    if (!response.ok) throw new Error(await parseApiError(response));
    const data: unknown = await response.json();
    return parseSavedDietPlan(data);
};

export const deleteSavedDietPlan = async (id: string, authHeaders: Record<string, string>) => {
    const response = await fetch(`${getConfiguredApiBaseUrlOrThrow()}/api/diet-plans/${id}`, {
        method: "DELETE",
        headers: authHeaders,
    });

    if (!response.ok) throw new Error(await parseApiError(response));
};
