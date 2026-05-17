// app/(tabs)/diet.tsx
// Diyet Planı sekmesi — DietScreen'den uyarlandı
import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { useFormContext } from "../../src/context/FormContext";
import { calculateMacroGrams } from "../../src/utils/calculations";
import TDEECalculatorPanel from "../../src/components/TDEECalculatorPanel";

export default function DietTab() {
    const { formData, setFizikselAlan, calculatedTDEE } = useFormContext();

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
        <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={["top"]}>
            {/* Header */}
            <View className="px-6 pt-2 pb-4 flex-row justify-center items-center bg-transparent">
                <View className="flex-row items-center gap-2">
                    <View className="flex-row items-center gap-0.5">
                        <View className="w-1.5 h-3.5 rounded-full bg-indigo-700 dark:bg-indigo-400" />
                        <View className="w-1.5 h-5 rounded-full bg-indigo-700 dark:bg-indigo-400" />
                        <View className="w-1.5 h-3.5 rounded-full bg-indigo-700 dark:bg-indigo-400" />
                    </View>
                    <Text className="text-xl text-indigo-700 dark:text-indigo-400 font-extrabold tracking-tight">
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

                {/* TDEE Skor Gösterimi (Hero Metrik) */}
                <View className="items-center py-12 mb-10">
                    <Text className="text-[11px] uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 font-bold mb-4">
                        GÜNLÜK KALORİ HEDEFİ
                    </Text>
                    <View className="flex-row items-baseline justify-center">
                        <Text className="text-[84px] font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                            {calculatedTDEE}
                        </Text>
                        <Text className="text-xl font-bold text-slate-400 dark:text-slate-500 ml-3">kcal</Text>
                    </View>
                </View>

                {/* Plan Kartları */}
                <View className="mb-4">
                    <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider mb-4 mt-8">
                        ÖNERİLEN DİYET PLANLARI
                    </Text>
                    {plans.map((plan) => (
                        <View
                            key={plan.name}
                            className="p-5 border border-gray-200 dark:border-gray-800 rounded-2xl mb-4 bg-white dark:bg-slate-800"
                        >
                            {plan.highlight && (
                                <Text className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full self-start mb-2 uppercase tracking-wide overflow-hidden">
                                    MEVCUT DURUM
                                </Text>
                            )}

                            <View className="flex-row justify-between items-center mb-4">
                                <View>
                                    <Text className="text-lg font-bold text-slate-900 dark:text-white mb-0.5">
                                        {plan.name}
                                    </Text>
                                    <View className="flex-row items-baseline">
                                        <Text className={`text-3xl font-black ${plan.textColor}`}>
                                            {plan.calories}
                                        </Text>
                                        <Text className="text-sm text-slate-400 dark:text-slate-500 font-bold ml-1">
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

            {/* Plan Detay Modalı */}
            <Modal
                isVisible={!!selectedPlan}
                onBackdropPress={() => setSelectedPlan(null)}
                onSwipeComplete={() => setSelectedPlan(null)}
                swipeDirection="down"
                backdropOpacity={0.3}
                style={{ margin: 0, justifyContent: 'flex-end' }}
            >
                <View className="bg-white dark:bg-slate-800 rounded-t-[3rem] pt-4 pb-14 px-6">
                    <View className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full self-center mb-6" />

                    <View className="flex-row justify-between items-start mb-8">
                        <View>
                            <Text className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
                                {selectedPlan?.name}
                            </Text>
                            <View className="flex-row items-baseline gap-1">
                                <Text className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                                    {selectedPlan?.calories}
                                </Text>
                                <Text className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                    kcal / gün
                                </Text>
                            </View>
                        </View>
                    </View>

                    <Text className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-5">
                        Günlük Makro Dağılımı
                    </Text>

                    <View className="gap-6">
                        <MacroRow
                            label="Protein"
                            color="bg-rose-500"
                            percentage={selectedPlan?.macros.protein || 0}
                            calories={selectedPlan?.calories || 0}
                            type="protein"
                        />
                        <MacroRow
                            label="Karbonhidrat"
                            color="bg-blue-500"
                            percentage={selectedPlan?.macros.carb || 0}
                            calories={selectedPlan?.calories || 0}
                            type="carb"
                        />
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
                <Text className="font-bold text-slate-700 dark:text-slate-300">{label}</Text>
                <View className="flex-row items-baseline gap-1">
                    <Text className="font-black text-slate-900 dark:text-white">{grams}g</Text>
                    <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500">({percentage}%)</Text>
                </View>
            </View>
            <View className="h-2.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <View className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
            </View>
        </View>
    );
}
