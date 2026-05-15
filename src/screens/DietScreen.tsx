// src/screens/DietScreen.tsx
// Web'deki OnboardingForm Step 2 → Mobil diyet plan seçimi ekranı
import React, { useMemo, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import type { KullaniciProfil } from "../types";
import { calculateTDEE } from "../utils/calculations";
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
        { name: "Kilo Al (Bulk)", calories: calculatedTDEE + 500, highlight: false, borderColor: "border-l-blue-500", textColor: "text-blue-600", bgColor: "bg-blue-600" },
        { name: "Kilo Koru (Maintain)", calories: calculatedTDEE, highlight: true, borderColor: "border-l-emerald-500", textColor: "text-emerald-600", bgColor: "bg-emerald-600" },
        { name: "Kilo Ver (Cut)", calories: calculatedTDEE - 500, highlight: false, borderColor: "border-l-rose-500", textColor: "text-rose-600", bgColor: "bg-rose-600" },
    ];

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
                contentContainerClassName="px-4 py-6"
                keyboardShouldPersistTaps="always"
            >
                {/* TDEE Hesaplama Paneli */}
                <View className="bg-white rounded-3xl p-6 border-2 border-indigo-100 shadow-md mb-5">
                    <TDEECalculatorPanel
                        data={formData.fizikselVeriler}
                        setField={setFizikselAlan}
                    />
                </View>

                {/* TDEE Skor Gösterimi - Hero Area */}
                <View className="items-center py-6 px-4 mb-5">
                    <View className="flex-row items-baseline gap-2 mb-1">
                        <Text className="text-[56px] font-extrabold text-indigo-950 tracking-tighter">
                            {calculatedTDEE}
                        </Text>
                        <Text className="text-2xl font-bold text-slate-400">kcal</Text>
                    </View>
                    <Text className="text-xs uppercase tracking-[3px] text-indigo-500/80 font-bold">
                        Günlük Kalori İhtiyacınız
                    </Text>
                </View>

                {/* Plan Kartları */}
                <View>
                    {plans.map((plan, idx) => (
                        <Pressable
                            key={plan.name}
                            className={`rounded-3xl p-6 bg-white shadow-sm border border-slate-100 border-l-4 ${plan.borderColor} ${idx < plans.length - 1 ? "mb-4" : ""}`}
                        >
                            <View className="flex-row items-center gap-4 mb-4">
                                <View className="flex-1">
                                    <Text className="text-lg font-bold text-slate-900">
                                        {plan.name}
                                    </Text>
                                    <View className="flex-row items-baseline">
                                        <Text className={`text-2xl font-black ${plan.textColor}`}>
                                            {plan.calories}
                                        </Text>
                                        <Text className="text-xs text-slate-400 font-bold ml-1">
                                            kcal
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity
                                className={`w-full py-3.5 px-4 rounded-xl items-center shadow-sm ${
                                    plan.highlight
                                        ? plan.bgColor
                                        : "bg-slate-100"
                                }`}
                                activeOpacity={0.8}
                            >
                                <Text
                                    className={`font-bold text-sm ${
                                        plan.highlight ? "text-white" : "text-slate-700"
                                    }`}
                                >
                                    Bu Planı Seç
                                </Text>
                            </TouchableOpacity>
                        </Pressable>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
