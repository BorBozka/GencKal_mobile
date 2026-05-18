// app/(tabs)/index.tsx
// Hesaplayıcı sekmesi (Aydınlık tema kilidi uygulanmış)
import React, { useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Tabs } from "expo-router";

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
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Disable native sticky header for this screen */}
            <Tabs.Screen options={{ headerShown: false }} />

            {/* Scrollable Content */}
            <ScrollView
                className="flex-1"
                style={{ paddingHorizontal: 24 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
                keyboardShouldPersistTaps="handled"
            >
                {/* 1. Inline Logo Brand Header (Official desktop logo) */}
                <View style={{ alignItems: "center", marginTop: 16, marginBottom: 24 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                            <View style={{ width: 4, height: 12, borderRadius: 2, backgroundColor: "#4338ca" }} />
                            <View style={{ width: 4, height: 20, borderRadius: 2, backgroundColor: "#4338ca" }} />
                            <View style={{ width: 4, height: 12, borderRadius: 2, backgroundColor: "#4338ca" }} />
                        </View>
                        <Text style={{ fontSize: 18, fontWeight: "700", color: "#4338ca", letterSpacing: -0.3 }}>
                            genckalculator
                        </Text>
                    </View>
                </View>

                {/* Girdi Paneli (En Üstte) */}
                <View className="pt-4">
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
