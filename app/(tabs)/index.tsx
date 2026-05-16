// app/(tabs)/index.tsx
// Hesaplayıcı sekmesi — DashboardScreen'den uyarlandı
import React, { useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useFormContext } from "../../src/context/FormContext";
import { calculateBMI, calculateDetailedFFMI } from "../../src/utils/calculations";

import InputPanel from "../../src/components/InputPanel";
import ResultsPanel from "../../src/components/ResultsPanel";
import TargetSimulator from "../../src/components/TargetSimulator";
import ReferenceScale from "../../src/components/ReferenceScale";

export default function CalculatorTab() {
    const { formData, setFizikselAlan } = useFormContext();
    const { boy, kilo, yagOrani } = formData.fizikselVeriler;

    const calculatedBMI = useMemo(() => calculateBMI(boy, kilo), [boy, kilo]);
    const { leanMass, ffmi: rawFFMI, normalizedFfmi: calculatedFFMI } = useMemo(
        () => calculateDetailedFFMI(boy, kilo, yagOrani),
        [boy, kilo, yagOrani]
    );

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-900" edges={['top']}>


            {/* Scrollable Content */}
            <ScrollView
                className="flex-1"
                style={{ paddingHorizontal: 24 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header Logo */}
                <View className="items-center mt-8 mb-8">
                    <View className="flex-row items-center gap-2">
                        <View className="flex-row items-center gap-0.5">
                            <View className="w-1 h-3 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                            <View className="w-1 h-5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                            <View className="w-1 h-3 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                        </View>
                        <Text className="text-lg text-slate-900 dark:text-white font-bold tracking-tight">
                            genckalculator
                        </Text>
                    </View>
                </View>

                {/* Girdi Paneli (En Üstte) */}
                <View className="pt-0">
                    <InputPanel
                        data={formData.fizikselVeriler}
                        setField={setFizikselAlan}
                    />

                    {/* FFMI Skalası (Yağ Oranı Biter Bitmez) */}
                    <View className="mt-2 pb-8">
                        <ReferenceScale
                            score={calculatedFFMI > 0 ? calculatedFFMI : calculatedBMI}
                            type={calculatedFFMI > 0 ? "FFMI" : "BMI"}
                            gender={formData.fizikselVeriler.cinsiyet}
                        />
                    </View>
                </View>

                {/* ResultsPanel (FFMI Skalası Altında) */}
                <View className="mt-2 mb-8">
                    <ResultsPanel
                        calculatedBMI={calculatedBMI}
                        leanMass={leanMass}
                        bodyFat={yagOrani || 0}
                        kilo={kilo}
                        ffmi={rawFFMI}
                        normalizedFfmi={calculatedFFMI}
                    />
                </View>

                {/* Hedef Simülatörü (En Altta) */}
                <View className="mt-8 pt-4">
                    {kilo > 0 && yagOrani > 0 && (
                        <TargetSimulator
                            currentWeight={kilo}
                            leanMass={leanMass}
                            currentBodyFat={yagOrani}
                        />
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
