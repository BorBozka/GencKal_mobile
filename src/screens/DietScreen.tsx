// src/screens/DietScreen.tsx
// Web'deki OnboardingForm Step 2 → Mobil diyet plan seçimi ekranı
import React, { useMemo, useCallback, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Feather } from "@expo/vector-icons";

import type { KullaniciProfil } from "../types";
import { calculateTDEE, calculateMacroGrams } from "../utils/calculations";
import TDEECalculatorPanel from "../components/TDEECalculatorPanel";

interface DietScreenProps {
    formData: KullaniciProfil;
    tdee: number;
    onBack: () => void;
    onUpdateFormData: (data: KullaniciProfil) => void;
}

export default function DietScreen({ formData, tdee: initialTdee, onBack, onUpdateFormData }: DietScreenProps) {
    const setFizikselAlan = useCallback(<K extends keyof KullaniciProfil["fizikselVeriler"]>(
        name: K,
        value: KullaniciProfil["fizikselVeriler"][K]
    ) => {
        const updated = {
            ...formData,
            fizikselVeriler: { ...formData.fizikselVeriler, [name]: value }
        };
        onUpdateFormData(updated);
    }, [formData, onUpdateFormData]);

    const calculatedTDEE = useMemo(
        () => calculateTDEE(formData.fizikselVeriler),
        [formData.fizikselVeriler]
    );

    const plans = [
        { 
            name: "Kilo Al (Bulk)", 
            calories: calculatedTDEE + 500, 
            iconName: "trending-up",
            iconColor: "#2563eb",
            highlight: false, 
            borderColor: "border-blue-500", 
            textColor: "text-blue-600", 
            btnBg: "bg-blue-600",
            btnText: "text-white",
            macros: { protein: 25, carb: 50, fat: 25 }
        },
        { 
            name: "Kilo Koru (Maintain)", 
            calories: calculatedTDEE, 
            iconName: "target",
            iconColor: "#059669",
            highlight: true, 
            borderColor: "border-emerald-500", 
            textColor: "text-emerald-600", 
            btnBg: "bg-emerald-600",
            btnText: "text-white",
            macros: { protein: 30, carb: 40, fat: 30 }
        },
        { 
            name: "Kilo Ver (Cut)", 
            calories: calculatedTDEE - 500, 
            iconName: "trending-down",
            iconColor: "#e11d48",
            highlight: false, 
            borderColor: "border-rose-500", 
            textColor: "text-rose-600", 
            btnBg: "bg-rose-600",
            btnText: "text-white",
            macros: { protein: 35, carb: 35, fat: 30 }
        },
    ];

    const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
            <StatusBar style="dark" />

            {/* Header */}
            <View className="px-6 pt-2 pb-4 flex-row justify-between items-center bg-transparent">
                <TouchableOpacity onPress={onBack} activeOpacity={0.7} className="py-2 pr-4">
                    <Text className="text-slate-600 text-base font-bold">← Ana Sayfa</Text>
                </TouchableOpacity>
                <View className="flex-row items-center gap-2">
                    <View className="flex-row items-center gap-0.5">
                        <View className="w-1.5 h-3.5 rounded-full bg-indigo-700" />
                        <View className="w-1.5 h-5 rounded-full bg-indigo-700" />
                        <View className="w-1.5 h-3.5 rounded-full bg-indigo-700" />
                    </View>
                    <Text className="text-xl text-indigo-700 font-extrabold tracking-tight">
                        genckalculator
                    </Text>
                </View>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerClassName="px-5 py-6 pb-12"
                keyboardShouldPersistTaps="handled"
            >
                {/* TDEE Hesaplama Paneli */}
                <View className="mb-8">
                    <TDEECalculatorPanel
                        data={formData.fizikselVeriler}
                        setField={setFizikselAlan}
                    />
                </View>

                {/* TDEE Skor Gösterimi - Hero Area */}
                <View className="items-center py-8 mb-8 border-t border-b border-slate-200/50">
                    <View className="flex-row items-baseline gap-2 mb-1">
                        <Text className="text-[56px] font-extrabold text-indigo-950 tracking-tighter">
                            {calculatedTDEE}
                        </Text>
                        <Text className="text-2xl font-bold text-slate-400">kcal</Text>
                    </View>
                    <Text className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium">
                        Günlük Kalori İhtiyacınız
                    </Text>
                </View>

                {/* Plan Kartları */}
                <View className="mb-4">
                    <Text className="text-xs font-bold text-slate-500 tracking-wider mb-4 mt-8">
                        ÖNERİLEN DİYET PLANLARI
                    </Text>
                    {plans.map((plan, idx) => (
                        <View
                            key={plan.name}
                            className="p-5 border border-gray-200 dark:border-gray-800 rounded-2xl mb-4 bg-white dark:bg-slate-900"
                        >
                            {plan.highlight && (
                                <Text className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-full self-start mb-2 uppercase tracking-wide overflow-hidden">
                                    MEVCUT DURUM
                                </Text>
                            )}

                            <View className="flex-row justify-between items-center mb-4">
                                <View>
                                    <Text className="text-lg font-bold text-slate-900 mb-0.5">
                                        {plan.name}
                                    </Text>
                                    <View className="flex-row items-baseline">
                                        <Text className={`text-3xl font-black ${plan.textColor}`}>
                                            {plan.calories}
                                        </Text>
                                        <Text className="text-sm text-slate-400 font-bold ml-1">
                                            kcal
                                        </Text>
                                    </View>
                                </View>
                                
                                <View className="w-12 h-12 items-center justify-center">
                                    <Feather name={plan.iconName as any} size={32} color={plan.iconColor} />
                                </View>
                            </View>

                            <TouchableOpacity
                                className={`w-full py-3.5 px-4 rounded-xl items-center ${
                                    plan.highlight ? plan.btnBg : `bg-transparent border ${plan.borderColor}`
                                }`}
                                activeOpacity={0.8}
                                onPress={() => setSelectedPlan(plan)}
                            >
                                <Text
                                    className={`font-bold text-sm ${plan.highlight ? plan.btnText : plan.textColor}`}
                                >
                                    Bu Planı Seç
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Plan Detay Modalı (Bottom Sheet) */}
            <Modal
                isVisible={!!selectedPlan}
                onBackdropPress={() => setSelectedPlan(null)}
                onSwipeComplete={() => setSelectedPlan(null)}
                swipeDirection="down"
                backdropOpacity={0.3}
                style={{ margin: 0, justifyContent: 'flex-end' }}
            >
                <View className="bg-white rounded-t-[3rem] pt-4 pb-14 px-6">
                    {/* Drag Handle */}
                    <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-6" />

                    <View className="flex-row justify-between items-start mb-8">
                        <View>
                            <Text className="text-2xl font-extrabold text-slate-900 mb-1">
                                {selectedPlan?.name}
                            </Text>
                            <View className="flex-row items-baseline gap-1">
                                <Text className="text-lg font-black text-indigo-600">
                                    {selectedPlan?.calories}
                                </Text>
                                <Text className="text-xs font-bold text-slate-500">
                                    kcal / gün
                                </Text>
                            </View>
                        </View>
                    </View>

                        <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">
                            Günlük Makro Dağılımı
                        </Text>
                        
                        <View className="gap-6">
                            {/* Protein */}
                            <MacroRow 
                                label="Protein" 
                                color="bg-rose-500" 
                                percentage={selectedPlan?.macros.protein || 0} 
                                calories={selectedPlan?.calories || 0} 
                                type="protein"
                            />
                            {/* Karbonhidrat */}
                            <MacroRow 
                                label="Karbonhidrat" 
                                color="bg-blue-500" 
                                percentage={selectedPlan?.macros.carb || 0} 
                                calories={selectedPlan?.calories || 0} 
                                type="carb"
                            />
                            {/* Yağ */}
                            <MacroRow 
                                label="Yağ" 
                                color="bg-amber-500" 
                                percentage={selectedPlan?.macros.fat || 0} 
                                calories={selectedPlan?.calories || 0} 
                                type="fat"
                            />
                        </View>
                        
                        <TouchableOpacity
                            className={`w-full py-4 mt-10 rounded-2xl items-center mb-4 ${selectedPlan?.btnBg}`}
                            onPress={() => setSelectedPlan(null)}
                            activeOpacity={0.8}
                        >
                            <Text className={`font-bold text-base ${selectedPlan?.btnText}`}>
                                Planı Onayla ve Başla
                            </Text>
                        </TouchableOpacity>
                    </View>
            </Modal>
        </SafeAreaView>
    );
}

function MacroRow({ label, color, percentage, calories, type }: { label: string, color: string, percentage: number, calories: number, type: 'protein'|'carb'|'fat' }) {
    const grams = calculateMacroGrams(calories, percentage, type);
    return (
        <View>
            <View className="flex-row justify-between items-baseline mb-2">
                <Text className="font-bold text-slate-700">{label}</Text>
                <View className="flex-row items-baseline gap-1">
                    <Text className="font-black text-slate-900">{grams}g</Text>
                    <Text className="text-[10px] font-bold text-slate-400">({percentage}%)</Text>
                </View>
            </View>
            <View className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <View className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
            </View>
        </View>
    );
}
