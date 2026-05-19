// src/services/localDietGenerator.ts
// 3.9: generateLocalFallbackPlan ve generateLocalSwapFood component dışına taşındı.
// Saf fonksiyonlar — React state'e bağlı değil, her render'da yeniden oluşturulmuyor.
import type { GeneratedPlan, FoodItem, FoodItemMacros } from "../types/diet";

let _idCounter = 0;
const uid = () => `${Date.now()}-${++_idCounter}`;

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
        { name: "Hindi Sote", fullText: "130g baharatlı sote hindi göğsü" },
        { name: "Tofu Tava", fullText: "140g baharatlı sote tofu" },
        { name: "Dana Füme", fullText: "80g yağsız dana füme eti" },
        { name: "Tavuk Sote", fullText: "130g sebzeli tavuk sote" },
        { name: "Izgara Levrek", fullText: "150g fırın levrek fileto" },
    ],
    karnivor: [
        { name: "Kuzu Külbastı", fullText: "150g ızgara kuzu külbastı" },
        { name: "Somon Izgara", fullText: "160g ızgara somon fileto" },
        { name: "Dana Antrikot", fullText: "180g ızgara dana antrikot" },
        { name: "Dana Köfte", fullText: "150g ev yapımı dana kıyma köfte" },
    ],
    vejetaryen: [
        { name: "Izgara Tofu", fullText: "140g marineli ızgara tofu" },
        { name: "Kinoa Haşlama", fullText: "100g haşlanmış kinoa" },
        { name: "Sote Mercimek", fullText: "120g haşlanmış yeşil mercimek sote" },
        { name: "Mantarlı Nohut", fullText: "130g mantarlı nohut sote" },
    ],
    vegan: [
        { name: "Nohut Haşlama", fullText: "130g haşlanmış nohut" },
        { name: "Mercimek Sote", fullText: "120g haşlanmış sote yeşil mercimek" },
        { name: "Tofu Dilimleri", fullText: "120g baharatlı fırınlanmış tofu" },
        { name: "Soya Kıyması", fullText: "110g sote edilmiş soya kıyması" },
    ],
    keto: [
        { name: "Tereyağlı Yumurta", fullText: "2 adet yumurta (1 yk tereyağı ile)" },
        { name: "Çiğ Ceviz içi", fullText: "30g çiğ ceviz" },
        { name: "Avokadolu Somon", fullText: "120g fırın somon ve yarım avokado" },
        { name: "Kaşar Peyniri", fullText: "60g eski kaşar peyniri dilimleri" },
    ],
};

// ---- Public API ----

export function generateLocalFallbackPlan(
    targetCalories: number,
    selectedDietType: string,
    selectedMealsPerDay: number
): GeneratedPlan {
    let pPerc = 30, cPerc = 40, fPerc = 30;
    if (selectedDietType === "karnivor") { pPerc = 40; cPerc = 5; fPerc = 55; }
    else if (selectedDietType === "keto") { pPerc = 25; cPerc = 5; fPerc = 70; }
    else if (selectedDietType === "vegan" || selectedDietType === "vejetaryen") { pPerc = 25; cPerc = 50; fPerc = 25; }

    const key = (selectedDietType in breakfastTemplates ? selectedDietType : "standart") as keyof typeof breakfastTemplates;

    const rawMeals: { title: string; items: typeof breakfastTemplates["standart"] }[] = [];
    if (selectedMealsPerDay === 2) {
        rawMeals.push({ title: "İlk Öğün (Kahvaltı)", items: breakfastTemplates[key] });
        rawMeals.push({ title: "İkinci Öğün (Akşam Yemeği)", items: dinnerTemplates[key] });
    } else if (selectedMealsPerDay === 3) {
        rawMeals.push({ title: "Kahvaltı", items: breakfastTemplates[key] });
        rawMeals.push({ title: "Öğle Yemeği", items: lunchTemplates[key] });
        rawMeals.push({ title: "Akşam Yemeği", items: dinnerTemplates[key] });
    } else if (selectedMealsPerDay === 4) {
        rawMeals.push({ title: "Kahvaltı", items: breakfastTemplates[key] });
        rawMeals.push({ title: "Öğle Yemeği", items: lunchTemplates[key] });
        rawMeals.push({ title: "Akşam Yemeği", items: dinnerTemplates[key] });
        rawMeals.push({ title: "Ara Öğün", items: snackTemplates[key] });
    } else {
        rawMeals.push({ title: "Kahvaltı", items: breakfastTemplates[key] });
        rawMeals.push({ title: "Öğle Yemeği", items: lunchTemplates[key] });
        rawMeals.push({ title: "Akşam Yemeği", items: dinnerTemplates[key] });
        rawMeals.push({ title: "Ara Öğün 1", items: snackTemplates[key] });
        rawMeals.push({ title: "Ara Öğün 2", items: snackTemplates[key] });
    }

    const totalOriginalCal = rawMeals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + i.cal, 0), 0);
    const scale = totalOriginalCal > 0 ? targetCalories / totalOriginalCal : 1;

    let finalP = 0, finalY = 0, finalK = 0;

    const meals = rawMeals.map((m, mIdx) => ({
        id: `meal-${mIdx}-${uid()}`,
        title: m.title,
        items: m.items.map((it, itIdx) => {
            const cal = Math.round(it.cal * scale);
            const protein = Math.round(it.macros.protein * scale);
            const fat = Math.round(it.macros.fat * scale);
            const carb = Math.round(it.macros.carb * scale);
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
    currentFood: FoodItem & { macros: FoodItemMacros }
): FoodItem {
    const key = (selectedDietType in swapAlternatives ? selectedDietType : "standart") as keyof typeof swapAlternatives;
    const list = swapAlternatives[key];
    const filtered = list.filter(item => item.name.toLowerCase() !== currentFood.name.toLowerCase());
    const source = filtered.length > 0 ? filtered : list;
    const pick = source[Math.floor(Math.random() * source.length)];
    return {
        id: `food-swapped-${uid()}`,
        name: pick.name,
        cal: currentFood.cal,
        fullText: pick.fullText,
        macros: currentFood.macros,
    };
}
