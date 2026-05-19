// app/(tabs)/diet.tsx
import React, { useState, useMemo, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, StyleSheet, BackHandler } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Tabs, useFocusEffect, useNavigation } from "expo-router";
import Constants from "expo-constants";

import { useFormContext } from "../../src/context/FormContext";
import TDEECalculatorPanel from "../../src/components/TDEECalculatorPanel";
import BrandLogo from "../../src/components/BrandLogo";
import { generateLocalFallbackPlan, generateLocalSwapFood } from "../../src/services/localDietGenerator";
import type { GeneratedPlan, FoodItem, FoodItemMacros } from "../../src/types/diet";
import type { DiyetTipi } from "../../src/types";

// API yanıtı için runtime type-guard
function isValidDietResponse(data: unknown): data is Omit<GeneratedPlan, 'meals'> & {
    meals: Array<{ title: string; items: Array<{ name: string; cal: number; fullText: string; macros?: FoodItemMacros }> }>;
} {
    if (!data || typeof data !== 'object') return false;
    const d = data as Record<string, unknown>;
    if (!Array.isArray(d.meals)) return false;
    if (!d.macros || typeof d.macros !== 'object') return false;
    return true;
}

// --- DİYET TİPİ SEÇENEKLERİ ---
const dietTypeOptions = [
    { key: "standart", label: "Standart", icon: "restaurant-outline" },
    { key: "karnivor", label: "Karnivor", icon: "egg-outline" },
    { key: "vejetaryen", label: "Vejetaryen", icon: "leaf-outline" },
    { key: "vegan", label: "Vegan", icon: "flower-outline" },
    { key: "keto", label: "Keto", icon: "flame-outline" },
] as const;

// --- DİNAMİK GELİŞTİRİCİ SUNUCU IP ÇÖZÜMLEMESİ ---
const getBaseUrl = () => {
    const debuggerHost = Constants.expoConfig?.hostUri || "";
    const ipAddress = debuggerHost.split(":")[0] || "localhost";
    return `http://${ipAddress}:3000`;
};

// Benzersiz ID üretimi için monoton sayaç (2.7 - Date.now() çakışma koruması)
let _idCounter = 0;
const uniqueId = () => `${Date.now()}-${++_idCounter}`;

export default function DietTab() {
    const { formData, setFizikselAlan, setDiyetAlan, calculatedTDEE } = useFormContext();

    const activeHedef = formData.diyetVerileri.hedef;

    // --- STATE ARŞİTEKTÜRÜ ---
    const [step, setStep] = useState<"select-plan" | "preferences" | "generating" | "result">("select-plan");
    
    // 2.3: activePlan artık yerel state değil — context'teki activeHedef'ten reaktif olarak türetiliyor.
    const activePlan: 'Bulk' | 'Maintain' | 'Cut' =
        activeHedef === "kilo_al" ? "Bulk" : activeHedef === "kilo_ver" ? "Cut" : "Maintain";
    const [progress, setProgress] = useState(0);

    // --- FORM YEREL STATELERİ ---
    const [mealsPerDay, setMealsPerDay] = useState<number>(3);
    const [dietType, setDietType] = useState<string>("standart");
    const [allergies, setAllergies] = useState<string>("");

    // --- AI ÜRETİM STATELERİ ---
    const [isLoadingPlan, setIsLoadingPlan] = useState(false);
    const [isLocalSimulated, setIsLocalSimulated] = useState(false);
    const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);

    // --- SWAP YÜKLENİYOR STATELERİ ---
    const [swappingFoodIds, setSwappingFoodIds] = useState<Record<string, boolean>>({});

    // 2.1: Sadece henüz plan üretilmemişse sıfırla — üretilmiş planı sekmeler arası geçişte kaybetme!
    useFocusEffect(
        React.useCallback(() => {
            if (!generatedPlan) {
                setStep("select-plan");
            }
        }, [generatedPlan])
    );

    const navigation = useNavigation();

    // Android fiziksel geri tuşu ve iOS kenardan kaydırarak geri gitme (swipe-back) jestlerini yakalayarak
    // kullanıcıyı hesaplayıcıya veya önceki modala atmak yerine akıllıca bir önceki sihirbaz adımına döndürelim!
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
    }, [navigation, step]);

    // Donanım geri tuşunu ve Android/Emulator kenardan geri kaydırma (Edge-Swipe Back) jestlerini yakalayalım
    useEffect(() => {
        const handleHardwareBack = () => {
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
    }, [step]);

    // Taşındı (üst satırlarda tanımlandı)

    // --- PRESET DİYET PLANLARI ---
    const plans = useMemo(() => [
        {
            id: "Bulk" as const,
            name: "Kilo Al (Bulk)",
            calories: calculatedTDEE + 500,
            iconName: "trending-up",
            iconColor: "#4338ca", // Brand Indigo-700
            macros: { protein: 25, carb: 50, fat: 25 }
        },
        {
            id: "Maintain" as const,
            name: "Kilo Koru (Maintain)",
            calories: calculatedTDEE,
            iconName: "target",
            iconColor: "#059669", // Emerald Green
            macros: { protein: 30, carb: 40, fat: 30 }
        },
        {
            id: "Cut" as const,
            name: "Kilo Ver (Cut)",
            calories: calculatedTDEE - 500,
            iconName: "trending-down",
            iconColor: "#dc2626", // Crimson Red
            macros: { protein: 35, carb: 35, fat: 30 }
        },
    ], [calculatedTDEE]);

    // generateLocalFallbackPlan ve generateLocalSwapFood artık
    // src/services/localDietGenerator.ts'den import ediliyor (3.9)

    // --- AI PLAN OLUŞTURMA İŞLEYİCİSİ (GENERATE PLAN HANDLER) ---
    const handleGeneratePlan = async () => {
        setStep("generating");
        setIsLoadingPlan(true);
        setIsLocalSimulated(false);

        const targetCalories = activePlan === 'Bulk' ? calculatedTDEE + 500 : activePlan === 'Cut' ? calculatedTDEE - 500 : calculatedTDEE;

        try {
            // 2.2: Diyet verilerini context'e yaz (FormContext ile senkronizasyon)
            setDiyetAlan("ogunSayisi", mealsPerDay);
            setDiyetAlan("diyetTipi", dietType as DiyetTipi);
            setDiyetAlan("alerjenler", allergies.trim() ? [allergies.trim()] : []);

            const baseUrl = getBaseUrl();
            const response = await fetch(`${baseUrl}/api/generate-diet`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    targetCalories,
                    dietType,
                    mealsPerDay,
                    allergies: allergies.trim() || undefined
                }),
            });

            if (!response.ok) {
                throw new Error("Sunucu hatası");
            }

            const rawData: unknown = await response.json();

            if (!isValidDietResponse(rawData)) {
                throw new Error("API'den geçersiz yanıt formatı alındı");
            }

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
                setIsLoadingPlan(false);
            }, 600);
        } catch (error) {
            // Sunucu çevrimdışıysa yerel simülasyon fallback'ini devreye al!
            const fallbackData = generateLocalFallbackPlan(targetCalories, dietType, mealsPerDay);
            setProgress(100);
            setTimeout(() => {
                setGeneratedPlan(fallbackData);
                setIsLocalSimulated(true);
                setStep("result");
                setIsLoadingPlan(false);
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

        try {
            const baseUrl = getBaseUrl();
            const response = await fetch(`${baseUrl}/api/swap-food`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentFood: {
                        name: targetFood.name,
                        cal: targetFood.cal,
                        fullText: targetFood.fullText,
                        macros: targetFood.macros || { protein: 0, fat: 0, carb: 0 }
                    },
                    mealTitle: targetMeal.title,
                    dietType,
                    allergies: allergies.trim() || undefined
                }),
            });

            if (!response.ok) {
                throw new Error("Swap hatası");
            }

            const rawSwapFood: unknown = await response.json();
            // Temel yapı doğrulaması
            if (!rawSwapFood || typeof rawSwapFood !== 'object' || !('name' in rawSwapFood) || !('cal' in rawSwapFood)) {
                throw new Error("Swap API geçersiz yanıt döndürdü");
            }
            const newFoodWithId: FoodItem = {
                ...(rawSwapFood as Omit<FoodItem, 'id'>),
                id: `food-swapped-${uniqueId()}`
            };

            setGeneratedPlan(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    meals: prev.meals.map(meal => {
                        if (meal.id !== mealId) return meal;
                        return {
                            ...meal,
                            items: meal.items.map(item => item.id === foodId ? newFoodWithId : item)
                        };
                    })
                };
            });
        } catch (err) {
            // macros yoksa local swap'ı güvenli şekilde çalıştır
            const safeMacros = targetFood.macros ?? { protein: 0, fat: 0, carb: 0 };
            const localNewFood = generateLocalSwapFood(targetMeal.title, dietType, { ...targetFood, macros: safeMacros });
            setGeneratedPlan(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    meals: prev.meals.map(meal => {
                        if (meal.id !== mealId) return meal;
                        return {
                            ...meal,
                            items: meal.items.map(item => item.id === foodId ? localNewFood : item)
                        };
                    })
                };
            });
        } finally {
            setSwappingFoodIds(prev => ({ ...prev, [foodId]: false }));
        }
    };

    // --- AKILLI PROGRESS VE MESAJ DÖNGÜSÜ ---
    useEffect(() => {
        if (step !== "generating") {
            setProgress(0);
            return;
        }

        setProgress(3); // %3 ile başla

        // Logaritmik yavaşlama ve asimptotik ilerleme (asla donmaz, sürekli minik adımlarla akar)
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 98) {
                    return 98; // API gelene kadar maksimum %98'e kadar izin ver
                }

                let increment = 0;
                if (prev < 40) {
                    // İlk aşama: Hızlı ve kararlı başlangıç
                    increment = Math.random() * 1.6 + 0.8;
                } else if (prev < 70) {
                    // İkinci aşama: Dengeli ilerleme
                    increment = Math.random() * 0.8 + 0.4;
                } else if (prev < 90) {
                    // Üçüncü aşama: Yavaş analiz derinleşmesi
                    increment = Math.random() * 0.3 + 0.15;
                } else {
                    // Son aşama: Asimptotik sonsuz yaklaşım (asla tamamen durmaz, küsuratlı ilerler)
                    increment = (98 - prev) * 0.04;
                }

                return Number((prev + increment).toFixed(2));
            });
        }, 300);

        return () => {
            clearInterval(progressInterval);
        };
    }, [step]);

    const loadingMessage = useMemo(() => {
        if (progress < 25) return "Fiziksel verileriniz analiz ediliyor...";
        if (progress < 50) return "Hedef kalori ve makrolarınız hesaplanıyor...";
        if (progress < 75) return "Gemini AI tarafından sağlıklı öğünler oluşturuluyor...";
        if (progress < 92) return "Beslenme şablonunuz özenle optimize ediliyor...";
        return "Planınız hazırlanıyor, son düzenlemeler yapılıyor...";
    }, [progress]);

    // --- KALORİYE VE MAKROLARA DAİR VERİLER ---
    const activeCalories = activePlan === 'Bulk' ? calculatedTDEE + 500 : activePlan === 'Cut' ? calculatedTDEE - 500 : calculatedTDEE;
    const planMacros = generatedPlan?.macros || { protein: 0, fat: 0, carb: 0 };
    const totalCalFromMacros = (planMacros.protein * 4) + (planMacros.fat * 9) + (planMacros.carb * 4);
    const proteinPct = totalCalFromMacros > 0 ? Math.round((planMacros.protein * 4) / totalCalFromMacros * 100) : 0;
    const fatPct = totalCalFromMacros > 0 ? Math.round((planMacros.fat * 9) / totalCalFromMacros * 100) : 0;
    const carbPct = totalCalFromMacros > 0 ? Math.round((planMacros.carb * 4) / totalCalFromMacros * 100) : 0;

    if (step === "generating") {
        return (
            <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
                <Tabs.Screen options={{ headerShown: false }} />

                {/* 3.5: BrandLogo bileşeni */}
                <BrandLogo />

                <View style={styles.fullScreenLoader}>
                    <Text style={styles.loadingTitle}>Diyet Planı Hazırlanıyor</Text>

                    {/* Akıllı Progress Bar */}
                    <View style={styles.progressBarWrapper}>
                        <View style={styles.progressBarTrack}>
                            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                        </View>
                        <Text style={styles.progressPercentageText}>{Math.floor(progress)}%</Text>
                    </View>

                    <Text style={styles.loadingSubtitle}>{loadingMessage}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
            <Tabs.Screen options={{ headerShown: false }} />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
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
                                <Text style={styles.heroCaloriesText}>{calculatedTDEE}</Text>
                                <Text style={styles.heroCaloriesKcal}>kcal</Text>
                            </View>
                        </View>

                        {/* Planlar Listesi */}
                        <View className="mb-4">
                            <Text style={styles.sectionHeader}>ÖNERİLEN DİYET PLANLARI</Text>

                            {plans.map(plan => {
                                const isActive = activePlan === plan.id;
                                return (
                                    <TouchableOpacity
                                        key={plan.id}
                                        style={[
                                            styles.planCard,
                                            isActive && { borderColor: plan.iconColor, borderWidth: 1.8 }
                                        ]}
                                        activeOpacity={0.9}
                                        onPress={() => {
                                            // 2.3: setActivePlan kaldırıldı — context üzerinden reaktif güncelleme
                                            let actualTarget: "kilo_al" | "kilo_koruma" | "kilo_ver" = "kilo_koruma";
                                            if (plan.id === "Bulk") actualTarget = "kilo_al";
                                            else if (plan.id === "Cut") actualTarget = "kilo_ver";
                                            setDiyetAlan("hedef", actualTarget);
                                        }}
                                    >
                                        {plan.id === 'Maintain' && (
                                            <View style={styles.currentStatusBadge}>
                                                <Text style={styles.currentStatusBadgeText}>MEVCUT DURUM</Text>
                                            </View>
                                        )}
                                        <View style={styles.planCardHeader}>
                                            <Text style={styles.planCardName}>{plan.name}</Text>
                                            <Feather name={plan.iconName as any} size={26} color={plan.iconColor} />
                                        </View>
                                        <View style={styles.planCardCaloriesRow}>
                                            <Text style={[styles.planCardCalories, { color: plan.iconColor }]}>{plan.calories}</Text>
                                            <Text style={styles.planCardKcal}>kcal</Text>
                                        </View>
                                        <TouchableOpacity
                                            style={[styles.ctaButton, isActive ? { backgroundColor: plan.iconColor } : { borderColor: plan.iconColor, borderWidth: 1.5 }]}
                                            activeOpacity={0.85}
                                            onPress={() => {
                                                // 2.3: setActivePlan kaldırıldı — context üzerinden reaktif güncelleme
                                                let actualTarget: "kilo_al" | "kilo_koruma" | "kilo_ver" = "kilo_koruma";
                                                if (plan.id === "Bulk") actualTarget = "kilo_al";
                                                else if (plan.id === "Cut") actualTarget = "kilo_ver";
                                                setDiyetAlan("hedef", actualTarget);
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
                            <Text style={styles.formHeaderTitle}>Beslenme Tercihleri</Text>
                            <Text style={styles.formHeaderSubtitle}>
                                {activePlan === 'Bulk' ? 'Kilo Al (Bulk)' : activePlan === 'Cut' ? 'Kilo Ver (Cut)' : 'Kilo Koru (Maintain)'} • {activeCalories} kcal
                            </Text>
                        </View>

                        {/* Günlük Öğün Sayısı */}
                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>GÜNLÜK ÖĞÜN SAYISI</Text>
                            <View style={styles.mealsSegmentedContainer}>
                                {[2, 3, 4, 5].map(num => (
                                    <TouchableOpacity
                                        key={num}
                                        onPress={() => setMealsPerDay(num)}
                                        activeOpacity={0.7}
                                        style={[
                                            styles.mealsSegmentedButton,
                                            mealsPerDay === num && styles.mealsSegmentedButtonActive
                                        ]}
                                    >
                                        <Text style={[
                                            styles.mealsSegmentedText,
                                            mealsPerDay === num && styles.mealsSegmentedTextActive
                                        ]}>
                                            {num}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
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
                                                isSelected && styles.dietTypeCardActive
                                            ]}
                                        >
                                            <Ionicons
                                                name={option.icon}
                                                size={24}
                                                color={isSelected ? "#4338ca" : "#94a3b8"}
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
                            <TextInput
                                value={allergies}
                                onChangeText={setAllergies}
                                placeholder="Örn: Yumurta, Fıstık, Gluten..."
                                placeholderTextColor="#cbd5e1"
                                autoComplete="off"
                                autoCorrect={false}
                                style={styles.allergiesInput}
                            />
                        </View>

                        {/* Aksiyon Butonları */}
                        <View style={styles.formActionRow}>
                            <TouchableOpacity
                                onPress={() => setStep("select-plan")}
                                activeOpacity={0.7}
                                style={styles.formBackButton}
                            >
                                <Text style={styles.formBackButtonText}>← Geri Dön</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleGeneratePlan}
                                activeOpacity={0.9}
                                style={styles.formSubmitButton}
                            >
                                <View style={styles.formSubmitButtonContent}>
                                    <View style={styles.brandSignalBars}>
                                        <View style={[styles.signalBar, { height: 8, backgroundColor: "#ffffff" }]} />
                                        <View style={[styles.signalBar, { height: 12, backgroundColor: "#ffffff" }]} />
                                        <View style={[styles.signalBar, { height: 8, backgroundColor: "#ffffff" }]} />
                                    </View>
                                    <Text style={styles.formSubmitButtonText}>AI Planımı Oluştur</Text>
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
                            <View style={styles.simulationBanner}>
                                <Ionicons name="information-circle-outline" size={20} color="#b45309" style={{ marginRight: 8 }} />
                                <Text style={styles.simulationBannerText}>
                                    Yerel Simülasyon Aktif: Sunucu çevrimdışı olduğundan plan yerel olarak optimize edildi.
                                </Text>
                            </View>
                        )}

                        {/* Kalori & Makro Özet Kartı */}
                        <View style={styles.resultHeaderCard}>
                            <Text style={styles.resultHeaderCategory}>AI BESLENME HEDEFİ</Text>
                            <View style={{ flexDirection: "row", alignItems: "baseline", marginBottom: 16 }}>
                                <Text style={styles.resultHeaderCalories}>{activeCalories}</Text>
                                <Text style={styles.resultHeaderKcal}>kcal / gün</Text>
                            </View>

                            {/* Macro Proportional Bar */}
                            <View style={styles.macroBarTrack}>
                                <View style={[styles.macroBarFill, { width: `${proteinPct}%`, backgroundColor: "#f43f5e" }]} />
                                <View style={[styles.macroBarFill, { width: `${carbPct}%`, backgroundColor: "#2563eb" }]} />
                                <View style={[styles.macroBarFill, { width: `${fatPct}%`, backgroundColor: "#eab308" }]} />
                            </View>

                            {/* Macro Badges Details */}
                            <View style={styles.macroDetailsRow}>
                                <View style={styles.macroDetailItem}>
                                    <Text style={[styles.macroDetailVal, { color: "#f43f5e" }]}>{planMacros.protein}g</Text>
                                    <Text style={styles.macroDetailLabel}>Protein (%{proteinPct})</Text>
                                </View>
                                <View style={styles.macroDetailItem}>
                                    <Text style={[styles.macroDetailVal, { color: "#2563eb" }]}>{planMacros.carb}g</Text>
                                    <Text style={styles.macroDetailLabel}>Karbonhidrat (%{carbPct})</Text>
                                </View>
                                <View style={styles.macroDetailItem}>
                                    <Text style={[styles.macroDetailVal, { color: "#eab308" }]}>{planMacros.fat}g</Text>
                                    <Text style={styles.macroDetailLabel}>Yağ (%{fatPct})</Text>
                                </View>
                            </View>
                        </View>

                        {/* Öğün Listesi */}
                        <Text style={[styles.sectionHeader, { marginBottom: 16 }]}>GÜNLÜK ÖĞÜNLERİNİZ</Text>

                        {generatedPlan.meals.map((meal, mIdx) => {
                            const mealTotalCal = meal.items.reduce((sum, item) => sum + item.cal, 0);
                            return (
                                <View key={meal.id} style={styles.mealCard}>
                                    {/* Öğün Kart Başlığı */}
                                    <View style={styles.mealCardHeader}>
                                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                                            <View style={styles.mealIconBox}>
                                                <Ionicons name="restaurant-outline" size={16} color="#4338ca" />
                                            </View>
                                            <Text style={styles.mealCardTitle}>{meal.title}</Text>
                                        </View>
                                        <Text style={styles.mealCardCaloriesText}>{mealTotalCal} kcal</Text>
                                    </View>

                                    {/* Yiyecek Maddeleri */}
                                    <View style={styles.foodListContainer}>
                                        {meal.items.map((food, fIdx) => {
                                            const isSwapping = !!swappingFoodIds[food.id];
                                            return (
                                                <View key={food.id} style={[styles.foodRow, fIdx === meal.items.length - 1 && { borderBottomWidth: 0 }]}>
                                                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                                                        <View style={{ flex: 1, marginRight: 8 }}>
                                                            {isSwapping ? (
                                                                <View style={styles.shimmerRowPlaceholder} />
                                                            ) : (
                                                                <Text style={styles.foodFullText}>{food.fullText}</Text>
                                                            )}
                                                        </View>
                                                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                            {isSwapping ? (
                                                                <ActivityIndicator size="small" color="#4338ca" style={{ marginRight: 8 }} />
                                                            ) : (
                                                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                                    <Text style={styles.foodCalories}>{food.cal}</Text>
                                                                    <Text style={styles.foodKcalLabel}>kcal</Text>
                                                                    <TouchableOpacity
                                                                        onPress={() => handleSwapFood(meal.id, food.id)}
                                                                        activeOpacity={0.6}
                                                                        style={styles.swapButton}
                                                                    >
                                                                        <Ionicons name="refresh-outline" size={15} color="#94a3b8" />
                                                                    </TouchableOpacity>
                                                                </View>
                                                            )}
                                                        </View>
                                                    </View>

                                                    {/* Yiyecek Makro Rozetleri */}
                                                    {food.macros && !isSwapping && (
                                                        <View style={styles.foodMacroBadgesRow}>
                                                            <View style={[styles.foodMacroBadge, { backgroundColor: "#fff5f5" }]}>
                                                                <Text style={[styles.foodMacroBadgeText, { color: "#e53e3e" }]}>P {food.macros.protein}g</Text>
                                                            </View>
                                                            <View style={[styles.foodMacroBadge, { backgroundColor: "#ebf8ff" }]}>
                                                                <Text style={[styles.foodMacroBadgeText, { color: "#2b6cb0" }]}>K {food.macros.carb}g</Text>
                                                            </View>
                                                            <View style={[styles.foodMacroBadge, { backgroundColor: "#fffaf0" }]}>
                                                                <Text style={[styles.foodMacroBadgeText, { color: "#dd6b20" }]}>Y {food.macros.fat}g</Text>
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

                        {/* Son Eylem Butonları */}
                        <View style={{ marginTop: 24, flexDirection: "row", gap: 12 }}>
                            <TouchableOpacity
                                onPress={() => setStep("preferences")}
                                activeOpacity={0.7}
                                style={styles.resultResetButton}
                            >
                                <Text style={styles.resultResetButtonText}>Tercihleri Düzenle</Text>
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
        </SafeAreaView>
    );
}

// --- PREMIUM VANILLA STYLES ---
const styles = StyleSheet.create({
    brandHeader: {
        alignItems: "center",
        paddingVertical: 12,
        backgroundColor: "#ffffff",
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
        backgroundColor: "#4338ca",
    },
    brandTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#4338ca",
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
        backgroundColor: "#f1f5f9",
        borderRadius: 99,
        overflow: "hidden",
        marginBottom: 8,
    },
    progressBarFill: {
        height: "100%",
        backgroundColor: "#4338ca",
        borderRadius: 99,
    },
    progressPercentageText: {
        fontSize: 14,
        fontWeight: "800",
        color: "#4338ca",
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
        color: "#1e1b4b",
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
        backgroundColor: "#ffffff",
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#f1f5f9",
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 12,
        elevation: 2,
    },
    currentStatusBadge: {
        backgroundColor: "#e6fbf2",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 99,
        marginBottom: 12,
        alignSelf: "flex-start",
    },
    currentStatusBadgeText: {
        color: "#047857",
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
        color: "#0f172a",
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
        color: "#0f172a",
        marginBottom: 4,
    },
    formHeaderSubtitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#4338ca",
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
        backgroundColor: "#f8fafc",
        padding: 5,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#f1f5f9",
    },
    mealsSegmentedButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
        borderRadius: 12,
    },
    mealsSegmentedButtonActive: {
        backgroundColor: "#ffffff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 1,
    },
    mealsSegmentedText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#94a3b8",
    },
    mealsSegmentedTextActive: {
        color: "#4338ca",
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
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#f1f5f9",
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    dietTypeCardActive: {
        backgroundColor: "#eef2ff",
        borderColor: "#4338ca",
        shadowColor: "#4338ca",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 2,
    },
    dietTypeLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: "#64748b",
    },
    dietTypeLabelActive: {
        color: "#4338ca",
        fontWeight: "700",
    },
    allergiesInput: {
        backgroundColor: "#f8fafc",
        borderWidth: 1,
        borderColor: "#f1f5f9",
        borderRadius: 16,
        height: 52,
        paddingHorizontal: 16,
        color: "#0f172a",
        fontSize: 14,
        fontWeight: "500",
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
        borderColor: "#f1f5f9",
        backgroundColor: "#ffffff",
    },
    formBackButtonText: {
        color: "#94a3b8",
        fontWeight: "700",
        fontSize: 14,
    },
    formSubmitButton: {
        flex: 2,
        backgroundColor: "#4338ca",
        borderRadius: 16,
        paddingVertical: 15,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#4338ca",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 3,
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
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 100,
        paddingHorizontal: 20,
    },
    loadingTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: "#0f172a",
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
        backgroundColor: "#fffbeb",
        borderWidth: 1,
        borderColor: "#fef3c7",
        borderRadius: 16,
        padding: 12,
        marginBottom: 20,
    },
    simulationBannerText: {
        flex: 1,
        fontSize: 11,
        fontWeight: "600",
        color: "#b45309",
        lineHeight: 16,
    },
    resultHeaderCard: {
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#f1f5f9",
        borderRadius: 24,
        padding: 20,
        marginBottom: 28,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
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
        color: "#0f172a",
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
        backgroundColor: "#f1f5f9",
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
        borderTopColor: "#f8fafc",
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
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#f1f5f9",
        borderRadius: 24,
        padding: 16,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
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
        borderBottomColor: "#f8fafc",
    },
    mealIconBox: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: "#eef2ff",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    mealCardTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#0f172a",
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
        borderBottomColor: "#f8fafc",
    },
    foodFullText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#334155",
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
        backgroundColor: "#f8fafc",
        alignItems: "center",
        justifyContent: "center",
    },
    foodMacroBadgesRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        marginTop: 8,
    },
    foodMacroBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    foodMacroBadgeText: {
        fontSize: 9,
        fontWeight: "700",
    },
    shimmerRowPlaceholder: {
        height: 16,
        backgroundColor: "#f1f5f9",
        borderRadius: 6,
        width: "90%",
    },
    resultResetButton: {
        flex: 1,
        paddingVertical: 15,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#f1f5f9",
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    resultResetButtonText: {
        color: "#64748b",
        fontWeight: "700",
        fontSize: 14,
    },
    resultPlanSelectorButton: {
        flex: 1,
        paddingVertical: 15,
        backgroundColor: "#4338ca",
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
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingBottom: 80, // Dikeyde optik olarak mükemmel bir merkezleme hissi verir
    },
});