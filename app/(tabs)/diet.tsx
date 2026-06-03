// app/(tabs)/diet.tsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, BackHandler, KeyboardAvoidingView, Platform, Keyboard, DeviceEventEmitter } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Tabs, useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useFormContext } from "../../src/context/FormContext";
import { ThemeColors, useTheme } from "../../src/context/ThemeContext";
import { useAuth } from "../../src/context/AuthContext";
import { useAppDialog } from "../../src/context/AppDialogContext";
import TDEECalculatorPanel from "../../src/components/TDEECalculatorPanel";
import BrandLogo from "../../src/components/BrandLogo";
import SegmentedControl, { SegmentedOption } from "../../src/components/SegmentedControl";
import { requestGeneratedDietPlan, requestSwapFood, saveGeneratedDietPlan } from "../../src/services/dietApi";
import { generateLocalFallbackPlan, generateLocalSwapFood } from "../../src/services/localDietGenerator";
import type { GeneratedPlan, FoodItem, FoodItemMacros } from "../../src/types/diet";
import type { DiyetTipi } from "../../src/types";

type DietPlanId = 'Bulk' | 'Maintain' | 'Cut';

type PlanOption = {
    id: DietPlanId;
    name: string;
    calories: number;
    iconName: keyof typeof Feather.glyphMap;
    iconColor: string;
    macros: FoodItemMacros;
};

// --- DİYET TİPİ SEÇENEKLERİ ---
const dietTypeOptions = [
    { key: "standart", label: "Standart", icon: "restaurant-outline" },
    { key: "karnivor", label: "Karnivor", icon: "egg-outline" },
    { key: "vejetaryen", label: "Vejetaryen", icon: "leaf-outline" },
    { key: "vegan", label: "Vegan", icon: "flower-outline" },
    { key: "keto", label: "Keto", icon: "flame-outline" },
] as const;

// --- GÜNLÜK ÖĞÜN SAYISI SEÇENEKLERİ ---
const mealOptions: SegmentedOption<number>[] = [
    { value: 2, label: "2 Öğün" },
    { value: 3, label: "3 Öğün" },
    { value: 4, label: "4 Öğün" },
    { value: 5, label: "5 Öğün" },
];

// Benzersiz ID üretimi için monoton sayaç (2.7 - Date.now() çakışma koruması)
let _idCounter = 0;
const uniqueId = () => `${Date.now()}-${++_idCounter}`;

const LOADING_MESSAGES = [
    "Fiziksel verileriniz analiz ediliyor...",
    "Metabolizma hızınız ve TDEE değeriniz hesaplanıyor...",
    "Hedef kalori ve makrolarınız dengeleniyor...",
    "Gemini AI sağlıklı besin alternatiflerini seçiyor...",
    "Öğünlerinizin makro dağılımı optimize ediliyor...",
    "Alerjen ve intolerans filtreleri uygulanıyor...",
    "Diyet planınız hazırlanıyor, son düzenlemeler yapılıyor...",
    "Yüksek proteinli alternatifler doğrulanıyor...",
    "Tablolar ve porsiyon önerileri şekillendiriliyor..."
];

const getSwapMessage = (progressVal: number) => {
    if (progressVal < 25) return "Alternatifler aranıyor...";
    if (progressVal < 55) return "Makrolar dengeleniyor...";
    if (progressVal < 80) return "Alerjenler filtreleniyor...";
    if (progressVal < 93) return "Yeni alternatif yazılıyor...";
    return "Son kontroller yapılıyor...";
};

const MIN_TARGET_CALORIES = 800;

const getRawTargetCalories = (tdee: number, plan: DietPlanId) => {
    if (plan === 'Bulk') return tdee + 500;
    if (plan === 'Cut') return tdee - 500;
    return tdee;
};

const getDisplayTargetCalories = (tdee: number, plan: DietPlanId) => (
    Math.max(MIN_TARGET_CALORIES, getRawTargetCalories(tdee, plan))
);

const recalculatePlanMacros = (plan: GeneratedPlan): FoodItemMacros => (
    plan.meals.reduce<FoodItemMacros>((totals, meal) => {
        meal.items.forEach((item) => {
            totals.protein += item.macros?.protein ?? 0;
            totals.fat += item.macros?.fat ?? 0;
            totals.carb += item.macros?.carb ?? 0;
        });
        return totals;
    }, { protein: 0, fat: 0, carb: 0 })
);

const replaceFoodInPlan = (
    plan: GeneratedPlan,
    mealId: string,
    foodId: string,
    newFood: FoodItem
): GeneratedPlan => {
    const nextPlan = {
        ...plan,
        meals: plan.meals.map(meal => {
            if (meal.id !== mealId) return meal;
            return {
                ...meal,
                items: meal.items.map(item => item.id === foodId ? newFood : item)
            };
        })
    };

    return {
        ...nextPlan,
        macros: recalculatePlanMacros(nextPlan),
    };
};

export default function DietTab() {
    const scrollViewRef = useRef<ScrollView>(null);
    const allergyInputRef = useRef<TextInput>(null);
    const { 
        formData, 
        setFizikselAlan, 
        setDiyetAlan, 
        calculatedTDEE,
        generatedPlan,
        setGeneratedPlan,
        dietStep: step,
        setDietStep: setStep
    } = useFormContext();
    const { isDark, colors } = useTheme();
    const { user, token, authHeaders } = useAuth();
    const { showDialog } = useAppDialog();
    const router = useRouter();
    const { pendingSave } = useLocalSearchParams<{ pendingSave?: string }>();
    const styles = useMemo(() => getStyles(isDark, colors), [isDark, colors]);

    useEffect(() => {
        const keyboardDidHideListener = Keyboard.addListener(
            "keyboardDidHide",
            () => {
                setIsInputFocused(false);
                allergyInputRef.current?.blur();
            }
        );
        return () => {
            keyboardDidHideListener.remove();
            if (saveFeedbackTimeoutRef.current) {
                clearTimeout(saveFeedbackTimeoutRef.current);
            }
        };
    }, []);


    const activeHedef = formData.diyetVerileri.hedef;

    // --- STATE ARŞİTEKTÜRÜ ---

    // 2.3: activePlan artık yerel state değil — context'teki activeHedef'ten reaktif olarak türetiliyor.
    const activePlan: DietPlanId =
        activeHedef === "kilo_al" ? "Bulk" : activeHedef === "kilo_ver" ? "Cut" : "Maintain";
    const [progress, setProgress] = useState(0);

    // --- FORM YEREL STATELERİ ---
    const [mealsPerDay, setMealsPerDay] = useState<number>(3);
    const [dietType, setDietType] = useState<DiyetTipi>("standart");
    const [allergyInput, setAllergyInput] = useState<string>("");
    const [allergyList, setAllergyList] = useState<string[]>(formData.diyetVerileri.alerjenler || []);
    const [selectedPlanId, setSelectedPlanId] = useState<'Bulk' | 'Maintain' | 'Cut' | null>(null);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [messageIndex, setMessageIndex] = useState(0);
    const saveFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingSaveHandledRef = useRef(false);

    // --- AI ÜRETİM STATELERİ ---
    const [isLocalSimulated, setIsLocalSimulated] = useState(false);
    const [isSavingPlan, setIsSavingPlan] = useState(false);
    const [isPlanSaveSuccess, setIsPlanSaveSuccess] = useState(false);

    // --- SWAP YÜKLENİYOR STATELERİ ---
    const [swappingFoodIds, setSwappingFoodIds] = useState<Record<string, boolean>>({});
    const [swapProgress, setSwapProgress] = useState<Record<string, number>>({});

    const navigation = useNavigation();

    // Sekme navigasyon mantığı:
    // 1. Başka sekmeden gelindiğinde: Her zaman "select-plan" (ilk sayfa) açılır. Plan hafızada tutulur.
    // 2. Zaten bu sekmedeyken butona basıldığında: Plan varsa "result" ile "select-plan" arasında geçiş (toggle) yapar.
    useEffect(() => {
        const unsubscribeFocus = navigation.addListener("focus", () => {
            if (step !== "generating") {
                if (generatedPlan) {
                    setStep("result");
                } else {
                    setStep("select-plan");
                    setSelectedPlanId(null);
                }
            }
        });
        
        const subscription = DeviceEventEmitter.addListener("dietTabPress", () => {
            if (step === "generating") return;

            if (generatedPlan) {
                // Zaten bu sekmedeysek toggle yapıyoruz (plan ile wizard arasında)
                if (navigation.isFocused()) {
                    setStep(prev => {
                        if (prev === "result") {
                            setSelectedPlanId(null);
                            return "select-plan";
                        } else {
                            return "result";
                        }
                    });
                } else {
                    // Başka sekmeden geçiş yapılıyorsa ve plan varsa direkt plan sonucunu göster
                    setStep("result");
                }
            } else {
                setStep("select-plan");
                setSelectedPlanId(null);
            }
        });

        return () => {
            unsubscribeFocus();
            subscription.remove();
        };
    }, [navigation, step, generatedPlan, setStep]);

    // Android fiziksel geri tuşu ve iOS kenardan kaydırarak geri gitme (swipe-back) jestlerini yakalayarak
    // kullanıcıyı hesaplayıcıya veya önceki modala atmak yerine bir önceki sihirbaz adımına döndürme
    useEffect(() => {
        const unsubscribe = navigation.addListener("beforeRemove", (e) => {
            if (step === "select-plan") {
                // İlk adımdaysak varsayılan geri gitme eylemine izin ver
                return;
            }

            // Sayfadan çıkış/pop eylemini engelle
            e.preventDefault();

            // Sihirbaz adımları arası akıllı geri gitme yönetimi
            if (step === "result") {
                setStep("preferences");
            } else if (step === "preferences") {
                setStep("select-plan");
            }
        });

        return unsubscribe;
    }, [navigation, step, setStep]);

    // Donanım geri tuşunu ve Android/Emulator kenardan geri kaydırma (Edge-Swipe Back) jestlerini sadece diet tabı aktifken yakalayalım
    useFocusEffect(
        React.useCallback(() => {
            const handleHardwareBack = () => {
                if (isInputFocused) {
                    Keyboard.dismiss();
                    setIsInputFocused(false);
                    allergyInputRef.current?.blur();
                    return true;
                }

                if (step === "select-plan") {
                    // İlk adımdaysak varsayılan geri gitme eylemine izin ver (Hesaplayıcı sekmesine geçsin)
                    return false;
                }

                // Sihirbaz adımları arası akıllı geri gitme yönetimi
                if (step === "result") {
                    setStep("preferences");
                } else if (step === "preferences") {
                    setStep("select-plan");
                } else if (step === "generating") {
                    // Yükleme sırasında geri tuşunu tamamen kilitleyelim
                }

                return true; // Geri gitme eylemini engelle ve kendi adım geçişimizi çalıştır
            };

            const subscription = BackHandler.addEventListener("hardwareBackPress", handleHardwareBack);
            return () => subscription.remove();
        }, [step, isInputFocused, setStep])
    );

    // --- PRESET DİYET PLANLARI ---
    const plans = useMemo<PlanOption[]>(() => [
        {
            id: "Bulk" as const,
            name: "Kilo Al (Bulk)",
            calories: getDisplayTargetCalories(calculatedTDEE, "Bulk"),
            iconName: "trending-up",
            iconColor: isDark ? "#60a5fa" : "#2563eb",
            macros: { protein: 25, carb: 50, fat: 25 }
        },
        {
            id: "Maintain" as const,
            name: "Kilo Koru (Maintain)",
            calories: getDisplayTargetCalories(calculatedTDEE, "Maintain"),
            iconName: "target",
            iconColor: "#059669", // Emerald Green
            macros: { protein: 30, carb: 40, fat: 30 }
        },
        {
            id: "Cut" as const,
            name: "Kilo Ver (Cut)",
            calories: getDisplayTargetCalories(calculatedTDEE, "Cut"),
            iconName: "trending-down",
            iconColor: "#dc2626", // Crimson Red
            macros: { protein: 35, carb: 35, fat: 30 }
        },
    ], [calculatedTDEE, isDark]);

    const addAllergy = () => {
        const trimmed = allergyInput.trim();
        if (trimmed && !allergyList.includes(trimmed)) {
            const updated = [...allergyList, trimmed];
            setAllergyList(updated);
            setDiyetAlan("alerjenler", updated);
            setAllergyInput("");
        }
    };

    const removeAllergy = (indexToRemove: number) => {
        const updated = allergyList.filter((_, idx) => idx !== indexToRemove);
        setAllergyList(updated);
        setDiyetAlan("alerjenler", updated);
    };

    // --- AI PLAN OLUŞTURMA İŞLEYİCİSİ (GENERATE PLAN HANDLER) ---
    const handleGeneratePlan = async () => {
        const rawTargetCalories = getRawTargetCalories(calculatedTDEE, activePlan);
        if (rawTargetCalories < MIN_TARGET_CALORIES) return;

        setStep("generating");
        setIsLocalSimulated(false);

        const targetCalories = Math.max(MIN_TARGET_CALORIES, rawTargetCalories);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 125000); // Backend can wait up to 120s for AI generation.

        try {
            // 2.2: Diyet verilerini context'e yaz (FormContext ile senkronizasyon)
            setDiyetAlan("ogunSayisi", mealsPerDay);
            setDiyetAlan("diyetTipi", dietType);
            setDiyetAlan("alerjenler", allergyList);

            const rawData = await requestGeneratedDietPlan({
                targetCalories,
                dietType,
                mealsPerDay,
                allergies: allergyList,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            // 2.7: API yanıtı item ID'leri de monoton sayaç ile üretilsin
            const planWithIds: GeneratedPlan = {
                ...rawData,
                meals: rawData.meals.map((meal, mIdx) => ({
                    ...meal,
                    id: `meal-${mIdx}-${uniqueId()}`,
                    items: meal.items.map((item, itIdx) => ({
                        ...item,
                        id: `food-${mIdx}-${itIdx}-${uniqueId()}`,
                    })),
                })),
            };

            // Memnun edici bir mikro etkileşim hissi için barı %100 yapıp kısa bir süre bekletelim
            setProgress(100);
            setTimeout(() => {
                setGeneratedPlan(planWithIds);
                setStep("result");
            }, 600);
        } catch {
            clearTimeout(timeoutId);
            // Sunucu çevrimdışıysa yerel simülasyon fallback'ini devreye al!
            const fallbackData = generateLocalFallbackPlan(targetCalories, dietType, mealsPerDay, allergyList);
            setProgress(100);
            setTimeout(() => {
                setGeneratedPlan(fallbackData);
                setIsLocalSimulated(true);
                setStep("result");
            }, 600);
        }
    };

    // --- AI BESİN YENİLEME İŞLEYİCİSİ (SWAP HANDLER) ---
    const handleSwapFood = async (mealId: string, foodId: string) => {
        if (!generatedPlan) return;

        const targetMeal = generatedPlan.meals.find(m => m.id === mealId);
        if (!targetMeal) return;

        const targetFood = targetMeal.items.find(f => f.id === foodId);
        if (!targetFood) return;

        setSwappingFoodIds(prev => ({ ...prev, [foodId]: true }));
        setSwapProgress(prev => ({ ...prev, [foodId]: 5 }));

        const progressInterval = setInterval(() => {
            setSwapProgress(prevMap => {
                const prev = prevMap[foodId] ?? 5;
                if (prev >= 98) return prevMap;

                let increment = 0;
                if (prev < 30) {
                    increment = Math.random() * 0.8 + 0.4;
                } else if (prev < 65) {
                    increment = Math.random() * 0.4 + 0.2;
                } else if (prev < 88) {
                    increment = Math.random() * 0.15 + 0.05;
                } else {
                    increment = (98 - prev) * 0.015;
                }

                return {
                    ...prevMap,
                    [foodId]: Number((prev + increment).toFixed(1))
                };
            });
        }, 150);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 35000); // Backend can wait up to 30s for a swap.

        try {
            const rawSwapFood = await requestSwapFood({
                currentFood: targetFood,
                mealTitle: targetMeal.title,
                dietType,
                allergies: allergyList,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            const newFoodWithId: FoodItem = {
                ...rawSwapFood,
                id: `food-swapped-${uniqueId()}`
            };

            clearInterval(progressInterval);
            setSwapProgress(prev => ({ ...prev, [foodId]: 100 }));

            setTimeout(() => {
                setGeneratedPlan(prev => {
                    if (!prev) return prev;
                    return replaceFoodInPlan(prev, mealId, foodId, newFoodWithId);
                });
                setSwappingFoodIds(prev => ({ ...prev, [foodId]: false }));
            }, 300);
        } catch {
            clearTimeout(timeoutId);
            // macros yoksa local swap'ı güvenli şekilde çalıştır
            const safeMacros = targetFood.macros ?? { protein: 0, fat: 0, carb: 0 };
            const localNewFood = generateLocalSwapFood(targetMeal.title, dietType, { ...targetFood, macros: safeMacros }, allergyList);

            clearInterval(progressInterval);
            setSwapProgress(prev => ({ ...prev, [foodId]: 100 }));

            setTimeout(() => {
                setGeneratedPlan(prev => {
                    if (!prev) return prev;
                    return replaceFoodInPlan(prev, mealId, foodId, localNewFood);
                });
                setSwappingFoodIds(prev => ({ ...prev, [foodId]: false }));
            }, 300);
        }
    };

    const handleSavePlan = React.useCallback(async () => {
        if (!generatedPlan) return;

        if (!user || !token) {
            showDialog({
                title: "Giriş yapmanız gerekmektedir",
                message: "Diyet planını kaydetmek için önce giriş yapın.",
                icon: "person-circle-outline",
                actions: [
                    { label: "Vazgeç", style: "cancel" },
                    { label: "Giriş Yap", onPress: () => router.push("/auth?returnTo=diet-result&pendingSave=diet-plan-save") },
                ],
            });
            return;
        }

        setIsSavingPlan(true);
        setIsPlanSaveSuccess(false);
        try {
            const targetCalories = getDisplayTargetCalories(calculatedTDEE, activePlan);
            const selectedPlanName = plans.find((plan) => plan.id === activePlan)?.name || "Diyet Planı";
            await saveGeneratedDietPlan({
                authHeaders: authHeaders(),
                title: `${selectedPlanName} - ${targetCalories} kcal`,
                targetCalories,
                dietType,
                mealsPerDay,
                allergies: allergyList,
                plan: generatedPlan,
            });

            setIsPlanSaveSuccess(true);
            if (saveFeedbackTimeoutRef.current) {
                clearTimeout(saveFeedbackTimeoutRef.current);
            }
            saveFeedbackTimeoutRef.current = setTimeout(() => {
                setIsPlanSaveSuccess(false);
                saveFeedbackTimeoutRef.current = null;
            }, 1800);
        } catch (error) {
            showDialog({
                title: "Plan kaydedilemedi",
                message: error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu.",
                icon: "alert-circle-outline",
            });
        } finally {
            setIsSavingPlan(false);
        }
    }, [activePlan, allergyList, authHeaders, calculatedTDEE, dietType, generatedPlan, mealsPerDay, plans, router, showDialog, token, user]);

    useEffect(() => {
        if (pendingSave !== "diet-plan-save") {
            pendingSaveHandledRef.current = false;
            return;
        }

        if (pendingSaveHandledRef.current || !user || !token || !generatedPlan) {
            return;
        }

        pendingSaveHandledRef.current = true;
        setStep("result");
        void handleSavePlan();
    }, [pendingSave, user, token, generatedPlan, setStep, handleSavePlan]);

    // --- AKILLI PROGRESS VE MESAJ DÖNGÜSÜ ---
    useEffect(() => {
        if (step !== "generating") {
            setProgress(0);
            setMessageIndex(0);
            return;
        }

        setProgress(3);

        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 98) {
                    return 98;
                }

                let increment = 0;
                if (prev < 30) {
                    increment = Math.random() * 0.6 + 0.3;
                } else if (prev < 60) {
                    increment = Math.random() * 0.3 + 0.15;
                } else if (prev < 85) {
                    increment = Math.random() * 0.12 + 0.04;
                } else {
                    increment = (98 - prev) * 0.015;
                }

                return Number((prev + increment).toFixed(2));
            });
        }, 350);

        const messageInterval = setInterval(() => {
            setMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
        }, 2500);

        return () => {
            clearInterval(progressInterval);
            clearInterval(messageInterval);
        };
    }, [step]);

    const loadingMessage = LOADING_MESSAGES[messageIndex];

    // --- KALORİYE VE MAKROLARA DAİR VERİLER ---
    const rawActiveCalories = getRawTargetCalories(calculatedTDEE, activePlan);
    const activeCalories = Math.max(MIN_TARGET_CALORIES, rawActiveCalories);
    const canGeneratePlan = rawActiveCalories >= MIN_TARGET_CALORIES;
    const planMacros = generatedPlan?.macros || { protein: 0, fat: 0, carb: 0 };
    const totalCalFromMacros = (planMacros.protein * 4) + (planMacros.fat * 9) + (planMacros.carb * 4);
    const proteinPct = totalCalFromMacros > 0 ? Math.round((planMacros.protein * 4) / totalCalFromMacros * 100) : 0;
    const fatPct = totalCalFromMacros > 0 ? Math.round((planMacros.fat * 9) / totalCalFromMacros * 100) : 0;
    const carbPct = totalCalFromMacros > 0 ? Math.round((planMacros.carb * 4) / totalCalFromMacros * 100) : 0;

    if (step === "generating") {
        return (
            <View className="flex-1 bg-white dark:bg-slate-950" style={styles.loadingContainer}>
                <SafeAreaView style={{ flex: 1 }}>
                    <Tabs.Screen options={{ headerShown: false }} />

                    <View style={styles.fullScreenLoader}>
                        <BrandLogo large style={{ marginBottom: 36 }} />

                        <Text style={styles.loadingTitle} className="dark:text-slate-100">Diyet Planı Hazırlanıyor</Text>

                        {/* Akıllı Progress Bar */}
                        <View style={styles.progressBarWrapper}>
                            <View style={styles.progressBarTrack} className="dark:bg-slate-800">
                                <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                            </View>
                            <Text style={styles.progressPercentageText}>{Math.floor(progress)}%</Text>
                        </View>

                        <Text style={styles.loadingSubtitle} className="dark:text-slate-400">{loadingMessage}</Text>
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white dark:bg-slate-950">
            <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
            <Tabs.Screen options={{ headerShown: false }} />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
            >
                <ScrollView
                    ref={scrollViewRef}
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: isInputFocused ? 250 : 9 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* 3.5: BrandLogo bileşeni */}
                    <BrandLogo />
                    {/* ================= STEP 1: SELECT PLAN ================= */}
                    {step === "select-plan" && (
                        <View>
                            {/* Kompakt TDEE Girişi */}
                            <View className="mb-8" style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 2 }}>
                                <TDEECalculatorPanel
                                    data={formData.fizikselVeriler}
                                    setField={setFizikselAlan}
                                />
                            </View>

                            {/* Hero Metrik */}
                            <View style={styles.heroMetricContainer}>
                                <Text style={styles.heroLabel}>GÜNLÜK KALORİ İHTİYACINIZ</Text>
                                <View style={styles.heroCaloriesRow}>
                                    <Text style={styles.heroCaloriesText} className="dark:text-slate-100">{calculatedTDEE}</Text>
                                    <Text style={styles.heroCaloriesKcal}>kcal</Text>
                                </View>
                            </View>

                            {/* Planlar Listesi */}
                            <View className="mb-4">
                                <Text style={styles.sectionHeader}>ÖNERİLEN DİYET PLANLARI</Text>

                                {plans.map(plan => {
                                    const isActive = selectedPlanId === plan.id;
                                    return (
                                        <TouchableOpacity
                                            key={plan.id}
                                            style={[
                                                styles.planCard,
                                                isActive && { borderColor: plan.iconColor, borderWidth: 1.8 }
                                            ]}
                                            className="dark:bg-slate-900 dark:border-white/5"
                                            activeOpacity={0.9}
                                            onPress={() => {
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                                                let actualTarget: "kilo_al" | "kilo_koruma" | "kilo_ver" = "kilo_koruma";
                                                if (plan.id === "Bulk") actualTarget = "kilo_al";
                                                else if (plan.id === "Cut") actualTarget = "kilo_ver";
                                                setDiyetAlan("hedef", actualTarget);
                                                setSelectedPlanId(plan.id);
                                            }}
                                        >
                                            {isActive && (
                                                <View style={[styles.currentStatusBadge, { backgroundColor: plan.iconColor + "14" }]}>
                                                    <Text style={[styles.currentStatusBadgeText, { color: plan.iconColor }]}>MEVCUT DURUM</Text>
                                                </View>
                                            )}
                                            <View style={styles.planCardHeader}>
                                                <Text style={styles.planCardName} className="dark:text-slate-100">{plan.name}</Text>
                                                <Feather name={plan.iconName} size={26} color={plan.iconColor} />
                                            </View>
                                            <View style={styles.planCardCaloriesRow}>
                                                <Text style={[styles.planCardCalories, { color: plan.iconColor }]}>{plan.calories}</Text>
                                                <Text style={styles.planCardKcal}>kcal</Text>
                                            </View>
                                            <TouchableOpacity
                                                style={[styles.ctaButton, isActive ? { backgroundColor: plan.iconColor } : { borderColor: plan.iconColor, borderWidth: 1.5 }]}
                                                activeOpacity={0.85}
                                                onPress={() => {
                                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                                                    let actualTarget: "kilo_al" | "kilo_koruma" | "kilo_ver" = "kilo_koruma";
                                                    if (plan.id === "Bulk") actualTarget = "kilo_al";
                                                    else if (plan.id === "Cut") actualTarget = "kilo_ver";
                                                    setDiyetAlan("hedef", actualTarget);
                                                    setSelectedPlanId(plan.id);
                                                    setStep("preferences");
                                                }}
                                            >
                                                <Text style={[styles.ctaButtonText, isActive ? { color: "#ffffff" } : { color: plan.iconColor }]}>
                                                    Bu Planı Seç
                                                </Text>
                                            </TouchableOpacity>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    {/* ================= STEP 2: PREFERENCES ================= */}
                    {step === "preferences" && (
                        <View style={styles.formContainer}>
                            {/* Başlık ve Plan Bilgisi */}
                            <View style={styles.formHeaderBlock}>
                                <Text style={styles.formHeaderTitle} className="dark:text-slate-100">Beslenme Tercihleri</Text>
                                <Text style={styles.formHeaderSubtitle}>
                                    {activePlan === 'Bulk' ? 'Kilo Al (Bulk)' : activePlan === 'Cut' ? 'Kilo Ver (Cut)' : 'Kilo Koru (Maintain)'} • {activeCalories} kcal
                                </Text>
                            </View>

                            {/* Günlük Öğün Sayısı */}
                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>GÜNLÜK ÖĞÜN SAYISI</Text>
                                <SegmentedControl
                                    options={mealOptions}
                                    selectedValue={mealsPerDay}
                                    onValueChange={setMealsPerDay}
                                />
                            </View>

                            {/* Diyet Tipi Grid */}
                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>DİYET TİPİ</Text>
                                <View style={styles.dietTypeGrid}>
                                    {dietTypeOptions.map(option => {
                                        const isSelected = dietType === option.key;
                                        return (
                                            <TouchableOpacity
                                                key={option.key}
                                                onPress={() => setDietType(option.key)}
                                                activeOpacity={0.75}
                                                style={[
                                                    styles.dietTypeCard,
                                                    isSelected && styles.dietTypeCardActive,
                                                    isSelected && {
                                                        backgroundColor: isDark ? colors.brandDark + "22" : colors.lightAccent,
                                                        borderColor: isDark ? colors.brandDark + "4D" : colors.primary + "33",
                                                    }
                                                ]}
                                                className={`dark:border-slate-800 ${isSelected ? "" : "dark:bg-slate-900"}`}
                                            >
                                                <Ionicons
                                                    name={option.icon}
                                                    size={24}
                                                    color={isSelected ? (isDark ? colors.primaryDark : colors.primary) : (isDark ? "#64748b" : "#94a3b8")}
                                                    style={{ marginBottom: 6 }}
                                                />
                                                <Text style={[
                                                    styles.dietTypeLabel,
                                                    isSelected && styles.dietTypeLabelActive
                                                ]}>
                                                    {option.label}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>

                            {/* Alerjiler / İntoleranslar */}
                            <View style={styles.formGroup}>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                                    <Text style={styles.formLabel}>ALERJİLER / İNTOLERANSLAR</Text>
                                    <Text style={{ fontSize: 10, color: "#cbd5e1" }}>İsteğe bağlı</Text>
                                </View>
                                <View style={{ flexDirection: "row", gap: 8 }}>
                                    <TextInput
                                        ref={allergyInputRef}
                                        value={allergyInput}
                                        onChangeText={setAllergyInput}
                                        onSubmitEditing={addAllergy}
                                        placeholder="Örn: Yumurta, Fıstık, Gluten..."
                                        placeholderTextColor={isDark ? "#64748b" : "#cbd5e1"}
                                        autoComplete="off"
                                        autoCorrect={false}
                                        style={[styles.allergiesInput, { flex: 1, marginBottom: 0 }]}
                                        className="dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100"
                                        onFocus={() => {
                                            setIsInputFocused(true);
                                            setTimeout(() => {
                                                scrollViewRef.current?.scrollToEnd({ animated: true });
                                            }, 150);
                                        }}
                                        onBlur={() => setIsInputFocused(false)}
                                    />
                                    <TouchableOpacity
                                        onPress={addAllergy}
                                        style={{
                                            backgroundColor: isDark ? colors.brandDark : colors.primary,
                                            borderRadius: 16,
                                            paddingHorizontal: 20,
                                            justifyContent: "center",
                                            alignItems: "center"
                                        }}
                                    >
                                        <Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 14 }}>Ekle</Text>
                                    </TouchableOpacity>
                                </View>

                                {allergyList.length > 0 && (
                                    <View style={styles.chipsContainer}>
                                        {allergyList.map((allergen, idx) => (
                                            <View key={idx} style={styles.chip}>
                                                <Text style={styles.chipText}>{allergen}</Text>
                                                <TouchableOpacity onPress={() => removeAllergy(idx)} style={styles.chipRemoveButton}>
                                                    <Feather name="x" size={12} color={isDark ? colors.textTint : colors.primary} />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {/* Aksiyon Butonları */}
                            <View style={styles.formActionRow}>
                                <TouchableOpacity
                                    onPress={() => setStep("select-plan")}
                                    activeOpacity={0.7}
                                    style={styles.formBackButton}
                                    className="dark:bg-slate-900 dark:border-slate-800"
                                >
                                    <Text style={styles.formBackButtonText} className="dark:text-slate-500">← Geri Dön</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleGeneratePlan}
                                    disabled={!canGeneratePlan}
                                    activeOpacity={canGeneratePlan ? 0.9 : 1}
                                    style={[styles.formSubmitButton, !canGeneratePlan && styles.formSubmitButtonDisabled]}
                                >
                                    <View style={styles.formSubmitButtonContent}>
                                        <View style={styles.brandSignalBars}>
                                            <View style={[styles.signalBar, { height: 8, backgroundColor: "#ffffff" }]} />
                                            <View style={[styles.signalBar, { height: 12, backgroundColor: "#ffffff" }]} />
                                            <View style={[styles.signalBar, { height: 8, backgroundColor: "#ffffff" }]} />
                                        </View>
                                        <Text style={styles.formSubmitButtonText}>Diyet Planımı Oluştur</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}



                    {/* ================= STEP 4: RESULT ================= */}
                    {step === "result" && generatedPlan && (
                        <View style={styles.resultContainer}>
                            {/* Simülasyon Uyarısı */}
                            {isLocalSimulated && (
                                <View style={styles.simulationBanner} className="dark:bg-amber-600/15 dark:border-amber-600/30">
                                    <Ionicons name="information-circle-outline" size={20} color={isDark ? "#fcd34d" : "#b45309"} style={{ marginRight: 8 }} />
                                    <Text style={styles.simulationBannerText} className="dark:text-amber-300">
                                        Yerel Simülasyon Aktif: Sunucu çevrimdışı olduğundan plan yerel olarak optimize edildi.
                                    </Text>
                                </View>
                            )}

                            {/* Kalori & Makro Özet Kartı */}
                            <View style={styles.resultHeaderCard} className="dark:bg-slate-900 dark:border-slate-800">
                                <Text style={styles.resultHeaderCategory} className="dark:text-slate-500">BESLENME HEDEFİ</Text>
                                <View style={{ flexDirection: "row", alignItems: "baseline", marginBottom: 16 }}>
                                    <Text style={styles.resultHeaderCalories} className="dark:text-slate-100">{activeCalories}</Text>
                                    <Text style={styles.resultHeaderKcal}>kcal / gün</Text>
                                </View>

                                {/* Üç Kanallı Makro Besin Görselleştirme Paneli */}
                                <View style={{ gap: 16, marginTop: 8 }}>
                                    {/* Protein Row */}
                                    <View style={{ gap: 6 }}>
                                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                                <Ionicons name="flame" size={18} color="#f43f5e" />
                                                <Text style={{ fontSize: 14, fontWeight: "700", color: isDark ? "#cbd5e1" : "#334155" }}>Protein</Text>
                                            </View>
                                            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
                                                <Text style={{ fontSize: 16, fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a" }}>{planMacros.protein}g</Text>
                                                <Text style={{ fontSize: 12, fontWeight: "600", color: "#94a3b8" }}>%{proteinPct}</Text>
                                            </View>
                                        </View>
                                        <View style={{ height: 8, backgroundColor: isDark ? "#1e293b" : "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                                            <View style={{ height: "100%", width: `${proteinPct}%`, backgroundColor: "#f43f5e", borderRadius: 4 }} />
                                        </View>
                                    </View>

                                    {/* Karbonhidrat Row */}
                                    <View style={{ gap: 6 }}>
                                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                                <Ionicons name="leaf" size={16} color="#2563eb" />
                                                <Text style={{ fontSize: 14, fontWeight: "700", color: isDark ? "#cbd5e1" : "#334155" }}>Karbonhidrat</Text>
                                            </View>
                                            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
                                                <Text style={{ fontSize: 16, fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a" }}>{planMacros.carb}g</Text>
                                                <Text style={{ fontSize: 12, fontWeight: "600", color: "#94a3b8" }}>%{carbPct}</Text>
                                            </View>
                                        </View>
                                        <View style={{ height: 8, backgroundColor: isDark ? "#1e293b" : "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                                            <View style={{ height: "100%", width: `${carbPct}%`, backgroundColor: "#2563eb", borderRadius: 4 }} />
                                        </View>
                                    </View>

                                    {/* Yağ Row */}
                                    <View style={{ gap: 6 }}>
                                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                                <Ionicons name="water" size={16} color="#eab308" />
                                                <Text style={{ fontSize: 14, fontWeight: "700", color: isDark ? "#cbd5e1" : "#334155" }}>Yağ</Text>
                                            </View>
                                            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
                                                <Text style={{ fontSize: 16, fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a" }}>{planMacros.fat}g</Text>
                                                <Text style={{ fontSize: 12, fontWeight: "600", color: "#94a3b8" }}>%{fatPct}</Text>
                                            </View>
                                        </View>
                                        <View style={{ height: 8, backgroundColor: isDark ? "#1e293b" : "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                                            <View style={{ height: "100%", width: `${fatPct}%`, backgroundColor: "#eab308", borderRadius: 4 }} />
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Öğün Listesi */}
                            <Text style={[styles.sectionHeader, { marginBottom: 16 }]}>GÜNLÜK ÖĞÜNLERİNİZ</Text>

                            {generatedPlan.meals.map((meal) => {
                                const mealTotalCal = meal.items.reduce((sum, item) => sum + item.cal, 0);
                                return (
                                    <View key={meal.id} style={styles.mealCard} className="dark:bg-slate-900 dark:border-slate-800">
                                        {/* Öğün Kart Başlığı */}
                                        <View style={styles.mealCardHeader} className="dark:border-slate-800">
                                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                <View style={[styles.mealIconBox, { backgroundColor: isDark ? colors.lightAccentDark : colors.lightAccent }]}>
                                                    <Ionicons name="restaurant-outline" size={16} color={isDark ? colors.primaryDark : colors.primary} />
                                                </View>
                                                <Text style={styles.mealCardTitle} className="dark:text-slate-100">{meal.title}</Text>
                                            </View>
                                            <Text style={styles.mealCardCaloriesText}>{mealTotalCal} kcal</Text>
                                        </View>

                                        {/* Yiyecek Maddeleri */}
                                        <View style={styles.foodListContainer}>
                                            {meal.items.map((food, fIdx) => {
                                                const isSwapping = !!swappingFoodIds[food.id];
                                                return (
                                                    <View key={food.id} style={[styles.foodRow, fIdx === meal.items.length - 1 && { borderBottomWidth: 0 }]} className="dark:border-slate-800">
                                                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                                            <View style={{ flex: 1, marginRight: 8 }}>
                                                                {isSwapping ? (
                                                                    <View style={{ gap: 6, paddingVertical: 2 }}>
                                                                        <Text style={{ fontSize: 13, fontWeight: "600", color: isDark ? colors.primaryDark : colors.primary }}>{getSwapMessage(swapProgress[food.id] || 0)}</Text>
                                                                        <View style={{ height: 6, backgroundColor: isDark ? "#1e293b" : "#f1f5f9", borderRadius: 3, overflow: "hidden", width: "95%" }}>
                                                                            <View style={{ height: "100%", width: `${Math.round(swapProgress[food.id] || 0)}%`, backgroundColor: isDark ? colors.brandDark : colors.primary, borderRadius: 3 }} />
                                                                        </View>
                                                                    </View>
                                                                ) : (
                                                                    <Text style={styles.foodFullText} className="dark:text-slate-300">{food.fullText}</Text>
                                                                )}
                                                            </View>
                                                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                                {isSwapping ? (
                                                                    <Text style={{ fontSize: 12, fontWeight: "700", color: isDark ? colors.primaryDark : colors.primary, marginRight: 8 }}>
                                                                        %{Math.round(swapProgress[food.id] || 0)}
                                                                    </Text>
                                                                ) : (
                                                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                                        <Text style={styles.foodCalories}>{food.cal}</Text>
                                                                        <Text style={styles.foodKcalLabel}>kcal</Text>
                                                                        <TouchableOpacity
                                                                            onPress={() => handleSwapFood(meal.id, food.id)}
                                                                            activeOpacity={0.6}
                                                                            style={styles.swapButton}
                                                                            className="dark:bg-slate-800"
                                                                        >
                                                                            <Ionicons name="refresh-outline" size={15} color={isDark ? "#94a3b8" : "#94a3b8"} />
                                                                        </TouchableOpacity>
                                                                    </View>
                                                                )}
                                                            </View>
                                                        </View>

                                                        {/* Yiyecek Makro Rozetleri */}
                                                        {food.macros && !isSwapping && (
                                                            <View style={styles.foodMacroBadgesRow}>
                                                                <View style={styles.proteinBadge}>
                                                                    <Text style={styles.proteinBadgeText}>P {food.macros.protein}g</Text>
                                                                </View>
                                                                <View style={styles.carbBadge}>
                                                                    <Text style={styles.carbBadgeText}>K {food.macros.carb}g</Text>
                                                                </View>
                                                                <View style={styles.fatBadge}>
                                                                    <Text style={styles.fatBadgeText}>Y {food.macros.fat}g</Text>
                                                                </View>
                                                            </View>
                                                        )}
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    </View>
                                );
                            })}

                            <TouchableOpacity
                                onPress={handleSavePlan}
                                disabled={isSavingPlan}
                                activeOpacity={0.85}
                                style={[
                                    styles.resultSaveButton,
                                    isPlanSaveSuccess && styles.resultSaveButtonSuccess,
                                    isSavingPlan && styles.resultSaveButtonDisabled
                                ]}
                            >
                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
                                    <Ionicons name={isPlanSaveSuccess ? "bookmark" : "bookmark-outline"} size={18} color="#ffffff" />
                                    <Text style={styles.resultSaveButtonText}>
                                        {isSavingPlan ? "Kaydediliyor..." : isPlanSaveSuccess ? "Kaydedildi" : "Bu Diyet Planını Kaydet"}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            {/* Son Eylem Butonları */}
                            <View style={{ marginTop: 24, flexDirection: "row", gap: 12 }}>
                                <TouchableOpacity
                                    onPress={() => setStep("preferences")}
                                    activeOpacity={0.7}
                                    style={styles.resultResetButton}
                                    className="dark:bg-slate-900 dark:border-slate-800"
                                >
                                    <Text style={styles.resultResetButtonText} className="dark:text-slate-500">Tercihleri Düzenle</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => {
                                        setStep("select-plan");
                                        setGeneratedPlan(null);
                                    }}
                                    activeOpacity={0.7}
                                    style={styles.resultPlanSelectorButton}
                                >
                                    <Text style={styles.resultPlanSelectorButtonText}>Yeni Plan Seç</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

// --- PREMIUM VANILLA STYLES ---
const getStyles = (isDark: boolean, colors: ThemeColors) => StyleSheet.create({
    brandHeader: {
        alignItems: "center",
        paddingVertical: 12,
        backgroundColor: isDark ? "#020617" : "#ffffff",
    },
    brandLogoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    brandSignalBars: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
    },
    signalBar: {
        width: 4,
        borderRadius: 2,
        backgroundColor: isDark ? colors.primaryDark : colors.primary,
    },
    brandTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: isDark ? colors.primaryDark : colors.primary,
        letterSpacing: -0.3,
    },

    heroMetricContainer: {
        alignItems: "center",
        marginTop: 20,
        marginBottom: 24,
    },
    progressBarWrapper: {
        width: "100%",
        alignItems: "center",
        marginVertical: 20,
        paddingHorizontal: 16,
    },
    progressBarTrack: {
        width: "100%",
        height: 10,
        backgroundColor: isDark ? "#1e293b" : "#f1f5f9",
        borderRadius: 99,
        overflow: "hidden",
        marginBottom: 8,
    },
    progressBarFill: {
        height: "100%",
        backgroundColor: isDark ? colors.brandDark : colors.primary,
        borderRadius: 99,
    },
    progressPercentageText: {
        fontSize: 14,
        fontWeight: "800",
        color: isDark ? colors.primaryDark : colors.primary,
        letterSpacing: -0.2,
    },
    heroLabel: {
        fontSize: 11,
        fontWeight: "700",
        color: "#94a3b8",
        marginBottom: 8,
        letterSpacing: 1.5,
        textTransform: "uppercase",
    },
    heroCaloriesRow: {
        flexDirection: "row",
        alignItems: "baseline",
        justifyContent: "center",
    },
    heroCaloriesText: {
        fontSize: 56,
        fontWeight: "800",
        color: isDark ? "#f1f5f9" : "#1e1b4b",
    },
    heroCaloriesKcal: {
        fontSize: 24,
        fontWeight: "600",
        color: "#64748b",
        marginLeft: 6,
    },
    sectionHeader: {
        fontSize: 11,
        fontWeight: "700",
        color: "#94a3b8",
        letterSpacing: 1.5,
        textTransform: "uppercase",
        marginLeft: 2,
        marginBottom: 12,
    },
    planCard: {
        backgroundColor: isDark ? "#0f172a" : "#ffffff",
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: isDark ? "#1e293b" : "#f1f5f9",
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.2 : 0.03,
        shadowRadius: 12,
        elevation: 2,
    },
    currentStatusBadge: {
        backgroundColor: isDark ? "rgba(16, 185, 129, 0.15)" : "#e6fbf2",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 99,
        marginBottom: 12,
        alignSelf: "flex-start",
    },
    currentStatusBadgeText: {
        color: isDark ? "#34d399" : "#047857",
        fontSize: 10,
        fontWeight: "800",
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },
    planCardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    planCardName: {
        fontSize: 18,
        fontWeight: "700",
        color: isDark ? "#f1f5f9" : "#0f172a",
    },
    planCardCaloriesRow: {
        flexDirection: "row",
        alignItems: "baseline",
        marginBottom: 16,
    },
    planCardCalories: {
        fontSize: 28,
        fontWeight: "800",
    },
    planCardKcal: {
        fontSize: 14,
        fontWeight: "500",
        color: "#94a3b8",
        marginLeft: 6,
    },
    ctaButton: {
        paddingVertical: 12,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    ctaButtonText: {
        fontWeight: "700",
        fontSize: 14,
    },

    // --- FORM STYLES (STEP 2) ---
    formContainer: {
        paddingTop: 8,
    },
    formHeaderBlock: {
        alignItems: "center",
        marginBottom: 28,
    },
    formHeaderTitle: {
        fontSize: 24,
        fontWeight: "800",
        color: isDark ? "#f1f5f9" : "#0f172a",
        marginBottom: 4,
    },
    formHeaderSubtitle: {
        fontSize: 14,
        fontWeight: "600",
        color: isDark ? colors.primaryDark : colors.primary,
    },
    formGroup: {
        marginBottom: 24,
    },
    formLabel: {
        fontSize: 11,
        fontWeight: "700",
        color: "#94a3b8",
        letterSpacing: 1.5,
        textTransform: "uppercase",
        marginBottom: 10,
        marginLeft: 2,
    },
    mealsSegmentedContainer: {
        flexDirection: "row",
        backgroundColor: isDark ? "#0f172a" : "#f8fafc",
        padding: 5,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: isDark ? "#1e293b" : "#f1f5f9",
    },
    mealsSegmentedButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
        borderRadius: 12,
    },
    mealsSegmentedButtonActive: {
        backgroundColor: isDark ? "#1e293b" : "#ffffff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.2 : 0.05,
        shadowRadius: 8,
        elevation: 1,
    },
    mealsSegmentedText: {
        fontSize: 14,
        fontWeight: "700",
        color: isDark ? "#475569" : "#94a3b8",
    },
    mealsSegmentedTextActive: {
        color: isDark ? colors.primaryDark : colors.primary,
    },
    dietTypeGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    dietTypeCard: {
        width: "31%", // 3 sütunlu grid hesabı
        flexGrow: 1,
        minWidth: 100,
        backgroundColor: isDark ? "#0f172a" : "#ffffff",
        borderWidth: 1,
        borderColor: isDark ? "#1e293b" : "#f1f5f9",
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    dietTypeCardActive: {
        backgroundColor: isDark ? "#1e1b4b" : "#eef2ff",
        borderColor: isDark ? colors.primaryDark : colors.primary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    dietTypeLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: isDark ? "#94a3b8" : "#64748b",
    },
    dietTypeLabelActive: {
        color: isDark ? colors.primaryDark : colors.primary,
        fontWeight: "700",
    },
    allergiesInput: {
        backgroundColor: isDark ? "#0f172a" : "#f8fafc",
        borderWidth: 1,
        borderColor: isDark ? "#1e293b" : "#f1f5f9",
        borderRadius: 16,
        height: 52,
        paddingHorizontal: 16,
        color: isDark ? "#f1f5f9" : "#0f172a",
        fontSize: 14,
        fontWeight: "500",
    },
    chipsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 10,
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: isDark ? colors.lightAccentDark : colors.lightAccent,
        borderWidth: 1,
        borderColor: isDark ? "rgba(99, 102, 241, 0.3)" : "#e0e7ff",
        borderRadius: 99,
        paddingLeft: 12,
        paddingRight: 6,
        paddingVertical: 6,
        gap: 4,
    },
    chipText: {
        fontSize: 12,
        fontWeight: "600",
        color: isDark ? colors.primaryDark : colors.primary,
    },
    chipRemoveButton: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: isDark ? "rgba(99, 102, 241, 0.2)" : "rgba(67, 56, 202, 0.08)",
        alignItems: "center",
        justifyContent: "center",
    },
    formActionRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingTop: 12,
    },
    formBackButton: {
        flex: 1,
        paddingVertical: 15,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: isDark ? "#1e293b" : "#f1f5f9",
        backgroundColor: isDark ? "#0f172a" : "#ffffff",
    },
    formBackButtonText: {
        color: isDark ? "#64748b" : "#94a3b8",
        fontWeight: "700",
        fontSize: 14,
    },
    formSubmitButton: {
        flex: 2,
        backgroundColor: isDark ? colors.brandDark : colors.primary,
        borderRadius: 16,
        paddingVertical: 15,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 3,
    },
    formSubmitButtonDisabled: {
        backgroundColor: isDark ? "#334155" : "#cbd5e1",
        shadowOpacity: 0,
        elevation: 0,
    },
    formSubmitButtonContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    formSubmitButtonText: {
        color: "#ffffff",
        fontWeight: "700",
        fontSize: 14,
    },

    // --- LOADING STYLES (STEP 3) ---
    loadingContainer: {
        flex: 1,
    },
    loadingTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: isDark ? "#f1f5f9" : "#0f172a",
        marginBottom: 8,
        textAlign: "center",
    },
    loadingSubtitle: {
        fontSize: 14,
        color: "#94a3b8",
        textAlign: "center",
        lineHeight: 20,
        minHeight: 40,
    },

    // --- RESULT STYLES (STEP 4) ---
    resultContainer: {
        paddingTop: 8,
    },
    simulationBanner: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: isDark ? "rgba(245, 158, 11, 0.15)" : "#fffbeb",
        borderWidth: 1,
        borderColor: isDark ? "rgba(245, 158, 11, 0.3)" : "#fef3c7",
        borderRadius: 16,
        padding: 12,
        marginBottom: 20,
    },
    simulationBannerText: {
        flex: 1,
        fontSize: 11,
        fontWeight: "600",
        color: isDark ? "#fbbf24" : "#b45309",
        lineHeight: 16,
    },
    resultHeaderCard: {
        backgroundColor: isDark ? "#0f172a" : "#ffffff",
        borderWidth: 1,
        borderColor: isDark ? "#1e293b" : "#f1f5f9",
        borderRadius: 24,
        padding: 20,
        marginBottom: 28,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.2 : 0.03,
        shadowRadius: 12,
        elevation: 1,
    },
    resultHeaderCategory: {
        fontSize: 10,
        fontWeight: "700",
        color: "#94a3b8",
        letterSpacing: 1.5,
        marginBottom: 6,
    },
    resultHeaderCalories: {
        fontSize: 38,
        fontWeight: "800",
        color: isDark ? "#f1f5f9" : "#0f172a",
    },
    resultHeaderKcal: {
        fontSize: 16,
        fontWeight: "600",
        color: "#64748b",
        marginLeft: 6,
    },
    macroBarTrack: {
        flexDirection: "row",
        height: 10,
        backgroundColor: isDark ? "#1e293b" : "#f1f5f9",
        borderRadius: 99,
        overflow: "hidden",
        marginBottom: 20,
    },
    macroBarFill: {
        height: "100%",
    },
    macroDetailsRow: {
        flexDirection: "row",
        borderTopWidth: 1,
        borderTopColor: isDark ? "#1e293b" : "#f8fafc",
        paddingTop: 16,
    },
    macroDetailItem: {
        flex: 1,
        alignItems: "center",
    },
    macroDetailVal: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 2,
    },
    macroDetailLabel: {
        fontSize: 9,
        fontWeight: "600",
        color: "#94a3b8",
    },
    mealCard: {
        backgroundColor: isDark ? "#0f172a" : "#ffffff",
        borderWidth: 1,
        borderColor: isDark ? "#1e293b" : "#f1f5f9",
        borderRadius: 24,
        padding: 16,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.2 : 0.02,
        shadowRadius: 8,
        elevation: 1,
    },
    mealCardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: isDark ? "#1e293b" : "#f8fafc",
    },
    mealIconBox: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: isDark ? "rgba(99, 102, 241, 0.15)" : "#eef2ff",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    mealCardTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: isDark ? "#f1f5f9" : "#0f172a",
    },
    mealCardCaloriesText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#94a3b8",
    },
    foodListContainer: {
        flexDirection: "column",
    },
    foodRow: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: isDark ? "#1e293b" : "#f8fafc",
    },
    foodFullText: {
        fontSize: 14,
        fontWeight: "600",
        color: isDark ? "#cbd5e1" : "#334155",
        lineHeight: 20,
    },
    foodCalories: {
        fontSize: 13,
        fontWeight: "700",
        color: "#64748b",
    },
    foodKcalLabel: {
        fontSize: 9,
        color: "#cbd5e1",
        marginLeft: 2,
        fontWeight: "500",
    },
    swapButton: {
        marginLeft: 10,
        width: 26,
        height: 26,
        borderRadius: 6,
        backgroundColor: isDark ? "#1e293b" : "#f8fafc",
        alignItems: "center",
        justifyContent: "center",
    },
    foodMacroBadgesRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        marginTop: 8,
    },
    proteinBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        backgroundColor: isDark ? "rgba(244, 63, 94, 0.15)" : "#fff1f2",
    },
    proteinBadgeText: {
        fontSize: 9,
        fontWeight: "700",
        color: isDark ? "#fda4af" : "#dc2626",
    },
    carbBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        backgroundColor: isDark ? "rgba(59, 130, 246, 0.15)" : "#eff6ff",
    },
    carbBadgeText: {
        fontSize: 9,
        fontWeight: "700",
        color: isDark ? "#93c5fd" : "#2563eb",
    },
    fatBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        backgroundColor: isDark ? "rgba(245, 158, 11, 0.15)" : "#fffbeb",
    },
    fatBadgeText: {
        fontSize: 9,
        fontWeight: "700",
        color: isDark ? "#fde047" : "#ea580c",
    },
    shimmerRowPlaceholder: {
        height: 16,
        backgroundColor: isDark ? "#1e293b" : "#f1f5f9",
        borderRadius: 6,
        width: "90%",
    },
    resultSaveButton: {
        marginTop: 8,
        paddingVertical: 15,
        backgroundColor: isDark ? colors.brandDark : colors.primary,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    resultSaveButtonSuccess: {
        backgroundColor: "#059669",
    },
    resultSaveButtonDisabled: {
        opacity: 0.7,
    },
    resultSaveButtonText: {
        color: "#ffffff",
        fontWeight: "800",
        fontSize: 14,
    },
    resultResetButton: {
        flex: 1,
        paddingVertical: 15,
        backgroundColor: isDark ? "#0f172a" : "#ffffff",
        borderWidth: 1,
        borderColor: isDark ? "#1e293b" : "#f1f5f9",
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    resultResetButtonText: {
        color: isDark ? "#94a3b8" : "#64748b",
        fontWeight: "700",
        fontSize: 14,
    },
    resultPlanSelectorButton: {
        flex: 1,
        paddingVertical: 15,
        backgroundColor: isDark ? colors.brandDark : colors.primary,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    resultPlanSelectorButtonText: {
        color: "#ffffff",
        fontWeight: "700",
        fontSize: 14,
    },
    fullScreenLoader: {
        flex: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingBottom: 80,
    },
});
