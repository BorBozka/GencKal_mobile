import React, { useMemo } from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Tabs } from "expo-router";

import { useFizikselContext } from "../../src/context/FormContext";
import { calculateBMI, calculateDetailedFFMI } from "../../src/utils/calculations";

import BrandLogo from "../../src/components/BrandLogo";
import InputPanel from "../../src/components/InputPanel";
import ResultsPanel from "../../src/components/ResultsPanel";
import TargetSimulator from "../../src/components/TargetSimulator";
import ReferenceScale from "../../src/components/ReferenceScale";

export default function CalculatorTab() {
    // 3.3: Yalnızca fiziksel verileri dinle — diyet değiştiğinde re-render olmaz
    const { fizikselVeriler, setFizikselAlan } = useFizikselContext();
    const { boy, kilo, yagOrani } = fizikselVeriler;

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
                contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
                keyboardShouldPersistTaps="handled"
            >
                {/* Marka Logo Başlığı — 3.5: BrandLogo bileşeni */}
                <BrandLogo />

                {/* Girdi Paneli (En Üstte) */}
                <View className="pt-4">
                    <InputPanel
                        data={fizikselVeriler}
                        setField={setFizikselAlan}
                    />

                    {/* FFMI Skalası (Yağ Oranı Biter Bitmez) */}
                    <View className="mt-2 pb-8">
                        <ReferenceScale
                            score={calculatedFFMI > 0 ? calculatedFFMI : calculatedBMI}
                            type={calculatedFFMI > 0 ? "FFMI" : "BMI"}
                            gender={fizikselVeriler.cinsiyet}
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
