// Web projesinden birebir aktarıldı — mantıksal değişiklik SIFIR
import { FizikselVeriler } from '../types';

export function calculateBMI(boyCm: number, kiloKg: number): number {
    if (boyCm <= 0 || kiloKg <= 0) return 0;
    const boyM = boyCm / 100;
    const bmi = kiloKg / (boyM * boyM);
    return Number(bmi.toFixed(2));
}

// BMI için Kategori ve Yüzde Hesaplama Yardımcıları
export function getBMICategory(bmi: number): { label: string; colorClass: string; percentage: number } {
    let percentage = (bmi / 40) * 100; // 40 max referans BMI
    if (percentage > 100) percentage = 100;

    if (bmi < 18.5) return { label: "Zayıf", colorClass: "text-blue-500 bg-blue-500", percentage };
    if (bmi < 25) return { label: "Normal", colorClass: "text-emerald-500 bg-emerald-500", percentage };
    if (bmi < 30) return { label: "Fazla Kilolu", colorClass: "text-orange-500 bg-orange-500", percentage };
    return { label: "Obezite", colorClass: "text-red-500 bg-red-500", percentage };
}

export function calculateFFMI(boyCm: number, kiloKg: number, yagOrani?: number): number {
    if (boyCm <= 0 || kiloKg <= 0) return 0;

    if (yagOrani === undefined || yagOrani < 0 || yagOrani > 100) return 0;

    const yagsizKutle = kiloKg * (1 - (yagOrani / 100));
    const boyM = boyCm / 100;
    const ffmi = yagsizKutle / (boyM * boyM);

    const normalizedFfmi = ffmi + 6.1 * (1.8 - boyM);

    return Number(normalizedFfmi.toFixed(2));
}

// Tüm verileri tek seferde döndüren fonksiyon
export function calculateDetailedFFMI(boyCm: number, kiloKg: number, yagOrani?: number): { leanMass: number; ffmi: number; normalizedFfmi: number } {
    if (boyCm <= 0 || kiloKg <= 0 || yagOrani === undefined || yagOrani < 0 || yagOrani > 100) {
        return { leanMass: 0, ffmi: 0, normalizedFfmi: 0 };
    }

    const leanMass = kiloKg * (1 - (yagOrani / 100));
    const boyM = boyCm / 100;
    const ffmi = leanMass / (boyM * boyM);
    const normalizedFfmi = ffmi + 6.1 * (1.8 - boyM);

    return {
        leanMass: Number(leanMass.toFixed(2)),
        ffmi: Number(ffmi.toFixed(2)),
        normalizedFfmi: Number(normalizedFfmi.toFixed(2))
    };
}

// FFMI için Kategori ve Yüzde Hesaplama Yardımcıları (Erkek bazlı genel kategori)
export function getFFMICategory(ffmi: number, isMale: boolean): { label: string; colorClass: string; percentage: number } {
    const baseOffset = isMale ? 0 : -4;

    let percentage = (ffmi / (28 + baseOffset)) * 100;
    if (percentage > 100) percentage = 100;

    if (ffmi < (18 + baseOffset)) return { label: "Ortalamanın Altı", colorClass: "text-blue-500 bg-blue-500", percentage };
    if (ffmi < (20 + baseOffset)) return { label: "Ortalama", colorClass: "text-emerald-500 bg-emerald-500", percentage };
    if (ffmi < (22 + baseOffset)) return { label: "İyi", colorClass: "text-indigo-500 bg-indigo-500", percentage };
    if (ffmi < (25 + baseOffset)) return { label: "Mükemmel", colorClass: "text-purple-500 bg-purple-500", percentage };
    return { label: "Üstün (Şüpheli Doğal)", colorClass: "text-pink-600 bg-pink-600", percentage };
}

export function calculateTDEE(fizikselVeriler: FizikselVeriler): number {
    const { boy, kilo, yas, cinsiyet, aktiviteSeviyesi } = fizikselVeriler;

    if (boy <= 0 || kilo <= 0 || yas <= 0) return 0;

    let bmr = (10 * kilo) + (6.25 * boy) - (5 * yas);

    if (cinsiyet === 'erkek') {
        bmr += 5;
    } else {
        bmr -= 161;
    }

    let activityMultiplier = 1.2;

    switch (aktiviteSeviyesi) {
        case 'hareketsiz (ofis işi)':
            activityMultiplier = 1.2;
            break;
        case 'hafif egzersiz (haftada 1-2 gün)':
            activityMultiplier = 1.375;
            break;
        case 'orta düzey egzersiz (haftada 3-5 gün)':
            activityMultiplier = 1.55;
            break;
        case 'yoğun egzersiz (haftada 6-7 gün)':
            activityMultiplier = 1.725;
            break;
        case 'atlet (günde 2 kez egzersiz)':
            activityMultiplier = 1.9;
            break;
        default:
            activityMultiplier = 1.2;
    }

    const tdee = bmr * activityMultiplier;
    return Number(tdee.toFixed(0));
}

export const calculateMacroGrams = (
    totalCalories: number,
    percentage: number,
    macroType: 'protein' | 'carb' | 'fat'
): number => {
    const caloriesFromMacro = totalCalories * (percentage / 100);
    const divisor = macroType === 'fat' ? 9 : 4;
    return Math.round(caloriesFromMacro / divisor);
};
