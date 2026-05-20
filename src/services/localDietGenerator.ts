// src/services/localDietGenerator.ts
// 3.9: generateLocalFallbackPlan ve generateLocalSwapFood component dışına taşındı.
// Saf fonksiyonlar — React state'e bağlı değil, her render'da yeniden oluşturulmuyor.
import type { GeneratedPlan, FoodItem, FoodItemMacros } from "../types/diet";

let _idCounter = 0;
const uid = () => `${Date.now()}-${++_idCounter}`;

type TemplateFood = {
    name: string;
    fullText: string;
    cal: number;
    macros: FoodItemMacros;
};

// Helper to check if a food is allergic
const isAllergic = (foodName: string, fullText: string, allergies: string[]) => {
    return allergies.some(allergy => {
        const lowerAllergy = allergy.toLowerCase().trim();
        if (!lowerAllergy) return false;
        
        const lowerName = foodName.toLowerCase();
        const lowerText = fullText.toLowerCase();
        
        if (lowerName.includes(lowerAllergy) || lowerText.includes(lowerAllergy)) {
            return true;
        }
        
        // Custom keyword mapping for common Turkish allergy cases
        if (lowerAllergy === "yumurta" && (lowerName.includes("egg") || lowerText.includes("egg"))) return true;
        if (["süt", "laktoz", "peynir", "yoğurt", "tereyağ"].some(k => lowerAllergy.includes(k)) && 
            ["süt", "peynir", "yoğurt", "tereyağ", "lor", "kaşar", "butter", "cheese", "milk", "lactose"].some(k => lowerName.includes(k) || lowerText.includes(k))) return true;
        if (["fındık", "fıstık", "badem", "ceviz", "kuruyemiş"].some(k => lowerAllergy.includes(k)) && 
            ["fındık", "fıstık", "badem", "ceviz", "nut", "almond", "walnut", "hazelnut", "peanut"].some(k => lowerName.includes(k) || lowerText.includes(k))) return true;
        if (["gluten", "buğday", "un"].some(k => lowerAllergy.includes(k)) && 
            ["yulaf", "un", "ekmek", "makarna", "bulgur", "siyez", "wheat", "gluten", "oat"].some(k => lowerName.includes(k) || lowerText.includes(k))) return true;
            
        return false;
    });
};

const safeFallbacks = [
    { name: "Yeşil Zeytin", fullText: "50g yeşil zeytin", cal: 70, macros: { protein: 0.5, fat: 7, carb: 2 } },
    { name: "Salatalık ve Domates", fullText: "Salatalık, domates ve yeşillik tabağı (1 yk zeytinyağı ile)", cal: 110, macros: { protein: 1.5, fat: 10, carb: 5 } },
    { name: "Avokado Dilimleri", fullText: "100g avokado dilimleri", cal: 160, macros: { protein: 2, fat: 15, carb: 9 } },
    { name: "Pirinç Patlağı", fullText: "4 adet sade pirinç patlağı", cal: 120, macros: { protein: 2.5, fat: 0.5, carb: 26 } },
];

// ---- Şablon veritabanı ----
const breakfastTemplates = {
    standart: [
        { name: "Haşlanmış Yumurta", fullText: "3 adet haşlanmış yumurta", cal: 210, macros: { protein: 18, fat: 15, carb: 1.5 } },
        { name: "Yulaf Ezmesi", fullText: "60g yulaf ezmesi ve 200ml süt", cal: 320, macros: { protein: 12, fat: 8, carb: 48 } },
        { name: "Lor Peyniri", fullText: "100g lor peyniri", cal: 110, macros: { protein: 13, fat: 2, carb: 3 } },
    ],
    karnivor: [
        { name: "Tereyağlı Yumurta", fullText: "4 adet tereyağında yumurta", cal: 360, macros: { protein: 24, fat: 28, carb: 2 } },
        { name: "Dana Kıyma", fullText: "150g sote dana kıyma", cal: 330, macros: { protein: 28, fat: 24, carb: 0 } },
    ],
    vejetaryen: [
        { name: "Tofu Tava", fullText: "150g sote baharatlı tofu", cal: 180, macros: { protein: 16, fat: 11, carb: 4 } },
        { name: "Haşlanmış Yumurta", fullText: "3 adet haşlanmış yumurta", cal: 210, macros: { protein: 18, fat: 15, carb: 1.5 } },
    ],
    vegan: [
        { name: "Fıstık Ezmeli Yulaf", fullText: "60g yulaf ezmesi, 200ml soya sütü ve 1 yk fıstık ezmesi", cal: 390, macros: { protein: 18, fat: 15, carb: 52 } },
        { name: "Muz", fullText: "1 adet orta boy muz", cal: 100, macros: { protein: 1.2, fat: 0.3, carb: 26 } },
    ],
    keto: [
        { name: "Avokadolu Yumurta", fullText: "3 adet tereyağlı yumurta ve yarım avokado", cal: 390, macros: { protein: 19, fat: 34, carb: 8 } },
        { name: "Süzme Peynir", fullText: "100g tam yağlı süzme peynir", cal: 210, macros: { protein: 11, fat: 18, carb: 2.5 } },
    ],
};

const lunchTemplates = {
    standart: [
        { name: "Izgara Tavuk", fullText: "150g ızgara tavuk göğsü", cal: 250, macros: { protein: 46, fat: 4, carb: 0 } },
        { name: "Basmati Pirinç", fullText: "150g haşlanmış basmati pirinç", cal: 210, macros: { protein: 4, fat: 0.5, carb: 46 } },
        { name: "Mevsim Salatası", fullText: "Mevsim yeşillikleri salatası (1 tatlı kaşığı zeytinyağı ile)", cal: 70, macros: { protein: 1, fat: 5, carb: 6 } },
    ],
    karnivor: [
        { name: "Dana Biftek", fullText: "250g ızgara dana biftek", cal: 520, macros: { protein: 55, fat: 34, carb: 0 } },
    ],
    vejetaryen: [
        { name: "Mercimek Yemeği", fullText: "150g haşlanmış yeşil mercimek", cal: 230, macros: { protein: 18, fat: 2, carb: 35 } },
        { name: "Kinoa Salatası", fullText: "100g haşlanmış kinoa ve yeşillik", cal: 140, macros: { protein: 5, fat: 2.5, carb: 24 } },
    ],
    vegan: [
        { name: "Nohut Sote", fullText: "150g baharatlı sote nohut", cal: 240, macros: { protein: 13, fat: 4, carb: 38 } },
        { name: "Basmati Pirinç", fullText: "150g haşlanmış basmati pirinç", cal: 210, macros: { protein: 4, fat: 0.5, carb: 46 } },
    ],
    keto: [
        { name: "Fırın Somon", fullText: "200g fırınlanmış somon fileto", cal: 400, macros: { protein: 40, fat: 26, carb: 0 } },
        { name: "Sarımsaklı Brokoli", fullText: "100g zeytinyağında sotelenmiş brokoli", cal: 110, macros: { protein: 3, fat: 10, carb: 6 } },
    ],
};

const dinnerTemplates = {
    standart: [
        { name: "Izgara Bonfile", fullText: "150g ızgara dana bonfile", cal: 280, macros: { protein: 36, fat: 15, carb: 0 } },
        { name: "Fırın Patates", fullText: "150g baharatlı fırın patates dilimleri", cal: 140, macros: { protein: 3, fat: 0.2, carb: 32 } },
        { name: "Haşlanmış Brokoli", fullText: "100g haşlanmış brokoli", cal: 35, macros: { protein: 2.8, fat: 0.4, carb: 7 } },
    ],
    karnivor: [
        { name: "Izgara Köfte", fullText: "200g ev yapımı ızgara köfte", cal: 420, macros: { protein: 36, fat: 30, carb: 0 } },
    ],
    vejetaryen: [
        { name: "Sote Tofu", fullText: "150g ızgara marineli tofu", cal: 180, macros: { protein: 16, fat: 11, carb: 4 } },
        { name: "Fırın Patates", fullText: "150g fırın patates", cal: 140, macros: { protein: 3, fat: 0.2, carb: 32 } },
    ],
    vegan: [
        { name: "Kuru Fasulye", fullText: "150g zeytinyağlı kuru fasulye yemeği", cal: 250, macros: { protein: 14, fat: 5, carb: 38 } },
        { name: "Siyez Bulguru", fullText: "100g haşlanmış siyez bulgur pilavı", cal: 130, macros: { protein: 4.5, fat: 1, carb: 27 } },
    ],
    keto: [
        { name: "Izgara Bonfile", fullText: "200g tereyağlı bonfile", cal: 410, macros: { protein: 48, fat: 24, carb: 0 } },
        { name: "Kuşkonmaz Sote", fullText: "100g zeytinyağlı ızgara kuşkonmaz", cal: 120, macros: { protein: 2, fat: 12, carb: 4 } },
    ],
};

const snackTemplates = {
    standart: [{ name: "Çiğ Badem", fullText: "25g çiğ badem (yaklaşık 15 adet)", cal: 150, macros: { protein: 5, fat: 13, carb: 5 } }],
    karnivor: [{ name: "Eski Kaşar", fullText: "50g eski kaşar peyniri", cal: 200, macros: { protein: 14, fat: 16, carb: 0.5 } }],
    vejetaryen: [{ name: "Çiğ Ceviz", fullText: "30g çiğ ceviz içi", cal: 190, macros: { protein: 4.5, fat: 19, carb: 4 } }],
    vegan: [{ name: "Çiğ Fındık", fullText: "30g çiğ fındık", cal: 180, macros: { protein: 4, fat: 18, carb: 5 } }],
    keto: [{ name: "Çiğ Badem", fullText: "30g çiğ badem", cal: 180, macros: { protein: 6, fat: 16, carb: 6 } }],
};

const swapAlternatives = {
    standart: [
        { name: "Hindi Sote", fullText: "130g baharatlı sote hindi göğsü", cal: 210, macros: { protein: 38, fat: 4, carb: 2 } },
        { name: "Tofu Tava", fullText: "140g baharatlı sote tofu", cal: 170, macros: { protein: 15, fat: 10, carb: 5 } },
        { name: "Dana Füme", fullText: "80g yağsız dana füme eti", cal: 150, macros: { protein: 24, fat: 5, carb: 1 } },
        { name: "Tavuk Sote", fullText: "130g sebzeli tavuk sote", cal: 230, macros: { protein: 36, fat: 7, carb: 5 } },
        { name: "Izgara Levrek", fullText: "150g fırın levrek fileto", cal: 190, macros: { protein: 32, fat: 6, carb: 0 } },
    ],
    karnivor: [
        { name: "Kuzu Külbastı", fullText: "150g ızgara kuzu külbastı", cal: 360, macros: { protein: 34, fat: 24, carb: 0 } },
        { name: "Somon Izgara", fullText: "160g ızgara somon fileto", cal: 320, macros: { protein: 34, fat: 20, carb: 0 } },
        { name: "Dana Antrikot", fullText: "180g ızgara dana antrikot", cal: 430, macros: { protein: 42, fat: 28, carb: 0 } },
        { name: "Dana Köfte", fullText: "150g ev yapımı dana kıyma köfte", cal: 315, macros: { protein: 28, fat: 22, carb: 1 } },
    ],
    vejetaryen: [
        { name: "Izgara Tofu", fullText: "140g marineli ızgara tofu", cal: 170, macros: { protein: 15, fat: 10, carb: 5 } },
        { name: "Kinoa Haşlama", fullText: "100g haşlanmış kinoa", cal: 120, macros: { protein: 4, fat: 2, carb: 21 } },
        { name: "Sote Mercimek", fullText: "120g haşlanmış yeşil mercimek sote", cal: 185, macros: { protein: 14, fat: 4, carb: 25 } },
        { name: "Mantarlı Nohut", fullText: "130g mantarlı nohut sote", cal: 220, macros: { protein: 11, fat: 6, carb: 31 } },
    ],
    vegan: [
        { name: "Nohut Haşlama", fullText: "130g haşlanmış nohut", cal: 215, macros: { protein: 11, fat: 4, carb: 35 } },
        { name: "Mercimek Sote", fullText: "120g haşlanmış sote yeşil mercimek", cal: 185, macros: { protein: 14, fat: 4, carb: 25 } },
        { name: "Tofu Dilimleri", fullText: "120g baharatlı fırınlanmış tofu", cal: 145, macros: { protein: 13, fat: 8, carb: 4 } },
        { name: "Soya Kıyması", fullText: "110g sote edilmiş soya kıyması", cal: 210, macros: { protein: 24, fat: 7, carb: 13 } },
    ],
    keto: [
        { name: "Tereyağlı Yumurta", fullText: "2 adet yumurta (1 yk tereyağı ile)", cal: 245, macros: { protein: 12, fat: 21, carb: 1 } },
        { name: "Çiğ Ceviz içi", fullText: "30g çiğ ceviz", cal: 195, macros: { protein: 5, fat: 20, carb: 4 } },
        { name: "Avokadolu Somon", fullText: "120g fırın somon ve yarım avokado", cal: 340, macros: { protein: 26, fat: 25, carb: 7 } },
        { name: "Kaşar Peyniri", fullText: "60g eski kaşar peyniri dilimleri", cal: 240, macros: { protein: 15, fat: 20, carb: 1 } },
    ],
};

// ---- Public API ----

export function generateLocalFallbackPlan(
    targetCalories: number,
    selectedDietType: string,
    selectedMealsPerDay: number,
    allergies: string[] = []
): GeneratedPlan {
    let pPerc = 30, cPerc = 40, fPerc = 30;
    if (selectedDietType === "karnivor") { pPerc = 40; cPerc = 5; fPerc = 55; }
    else if (selectedDietType === "keto") { pPerc = 25; cPerc = 5; fPerc = 70; }
    else if (selectedDietType === "vegan" || selectedDietType === "vejetaryen") { pPerc = 25; cPerc = 50; fPerc = 25; }

    const key = (selectedDietType in breakfastTemplates ? selectedDietType : "standart") as keyof typeof breakfastTemplates;

    const filterAllergicItems = (items: typeof breakfastTemplates["standart"]) => {
        const filtered = items.filter(it => !isAllergic(it.name, it.fullText, allergies));
        if (filtered.length > 0) return filtered;
        
        const safe = safeFallbacks.filter(it => !isAllergic(it.name, it.fullText, allergies));
        if (safe.length > 0) return [safe[Math.floor(Math.random() * safe.length)]];
        
        return [{ name: "Alerji Dostu Alternatif", fullText: "1 adet alerji dostu alternatif besin", cal: 100, macros: { protein: 2, fat: 5, carb: 12 } }];
    };

    const rawMeals: { title: string; items: typeof breakfastTemplates["standart"] }[] = [];
    if (selectedMealsPerDay === 2) {
        rawMeals.push({ title: "İlk Öğün (Kahvaltı)", items: filterAllergicItems(breakfastTemplates[key]) });
        rawMeals.push({ title: "İkinci Öğün (Akşam Yemeği)", items: filterAllergicItems(dinnerTemplates[key]) });
    } else if (selectedMealsPerDay === 3) {
        rawMeals.push({ title: "Kahvaltı", items: filterAllergicItems(breakfastTemplates[key]) });
        rawMeals.push({ title: "Öğle Yemeği", items: filterAllergicItems(lunchTemplates[key]) });
        rawMeals.push({ title: "Akşam Yemeği", items: filterAllergicItems(dinnerTemplates[key]) });
    } else if (selectedMealsPerDay === 4) {
        rawMeals.push({ title: "Kahvaltı", items: filterAllergicItems(breakfastTemplates[key]) });
        rawMeals.push({ title: "Öğle Yemeği", items: filterAllergicItems(lunchTemplates[key]) });
        rawMeals.push({ title: "Akşam Yemeği", items: filterAllergicItems(dinnerTemplates[key]) });
        rawMeals.push({ title: "Ara Öğün", items: filterAllergicItems(snackTemplates[key]) });
    } else {
        rawMeals.push({ title: "Kahvaltı", items: filterAllergicItems(breakfastTemplates[key]) });
        rawMeals.push({ title: "Öğle Yemeği", items: filterAllergicItems(lunchTemplates[key]) });
        rawMeals.push({ title: "Akşam Yemeği", items: filterAllergicItems(dinnerTemplates[key]) });
        rawMeals.push({ title: "Ara Öğün 1", items: filterAllergicItems(snackTemplates[key]) });
        rawMeals.push({ title: "Ara Öğün 2", items: filterAllergicItems(snackTemplates[key]) });
    }

    const safeTargetCalories = Math.max(1, targetCalories);
    const totalOriginalCal = rawMeals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + i.cal, 0), 0);
    const scale = totalOriginalCal > 0 ? safeTargetCalories / totalOriginalCal : 1;
    const scaledMacroTotals = rawMeals.reduce((totals, m) => {
        m.items.forEach((it) => {
            totals.protein += it.macros.protein * scale;
            totals.fat += it.macros.fat * scale;
            totals.carb += it.macros.carb * scale;
        });
        return totals;
    }, { protein: 0, fat: 0, carb: 0 });
    const targetMacros = {
        protein: Math.round((safeTargetCalories * (pPerc / 100)) / 4),
        fat: Math.round((safeTargetCalories * (fPerc / 100)) / 9),
        carb: Math.round((safeTargetCalories * (cPerc / 100)) / 4),
    };
    const macroScale = {
        protein: scaledMacroTotals.protein > 0 ? targetMacros.protein / scaledMacroTotals.protein : 1,
        fat: scaledMacroTotals.fat > 0 ? targetMacros.fat / scaledMacroTotals.fat : 1,
        carb: scaledMacroTotals.carb > 0 ? targetMacros.carb / scaledMacroTotals.carb : 1,
    };

    let finalP = 0, finalY = 0, finalK = 0;

    const meals = rawMeals.map((m, mIdx) => ({
        id: `meal-${mIdx}-${uid()}`,
        title: m.title,
        items: m.items.map((it, itIdx) => {
            const cal = Math.round(it.cal * scale);
            const protein = Math.round(it.macros.protein * scale * macroScale.protein);
            const fat = Math.round(it.macros.fat * scale * macroScale.fat);
            const carb = Math.round(it.macros.carb * scale * macroScale.carb);
            finalP += protein; finalY += fat; finalK += carb;

            let fullText = it.fullText;
            const match = it.fullText.match(/^(\d+)(g|ml| adet)?/);
            if (match) {
                const newQty = Math.round(parseInt(match[1], 10) * scale);
                fullText = it.fullText.replace(/^(\d+)/, String(newQty));
            }
            return { id: `food-${mIdx}-${itIdx}-${uid()}`, name: it.name, cal, fullText, macros: { protein, fat, carb } };
        }),
    }));

    return { macros: { protein: finalP, fat: finalY, carb: finalK }, meals };
}

export function generateLocalSwapFood(
    _mealTitle: string,
    selectedDietType: string,
    currentFood: FoodItem & { macros: FoodItemMacros },
    allergies: string[] = []
): FoodItem {
    const key = (selectedDietType in swapAlternatives ? selectedDietType : "standart") as keyof typeof swapAlternatives;
    const list = swapAlternatives[key];
    
    let filtered = list.filter(item => !isAllergic(item.name, item.fullText, allergies));
    filtered = filtered.filter(item => item.name.toLowerCase() !== currentFood.name.toLowerCase());
    
    let pick: TemplateFood;
    if (filtered.length > 0) {
        pick = filtered[Math.floor(Math.random() * filtered.length)];
    } else {
        const safe = safeFallbacks.filter(it => !isAllergic(it.name, it.fullText, allergies));
        pick = safe.length > 0
            ? safe[Math.floor(Math.random() * safe.length)]
            : { name: "Alerji Dostu Alternatif", fullText: "1 adet Alerji Dostu Alternatif", cal: 100, macros: { protein: 2, fat: 5, carb: 12 } };
    }
    
    return {
        id: `food-swapped-${uid()}`,
        name: pick.name,
        cal: pick.cal,
        fullText: pick.fullText,
        macros: pick.macros,
    };
}
