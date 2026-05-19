import React, { useMemo, useRef } from "react";
import { View, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Tabs } from "expo-router";

import { useFizikselContext } from "../../src/context/FormContext";
import { calculateBMI, calculateDetailedFFMI } from "../../src/utils/calculations";

import BrandLogo from "../../src/components/BrandLogo";
import InputPanel from "../../src/components/InputPanel";
import ResultsPanel from "../../src/components/ResultsPanel";
import TargetSimulator from "../../src/components/TargetSimulator";
import ReferenceScale from "../../src/components/ReferenceScale";
import { useTheme } from "../../src/context/ThemeContext";

export default function CalculatorTab() {
    const { fizikselVeriler, setFizikselAlan } = useFizikselContext();
    const { boy, kilo, yagOrani } = fizikselVeriler;
    const scrollViewRef = useRef<ScrollView>(null);
    const { isDark, colors } = useTheme();

    const calculatedBMI = useMemo(() => calculateBMI(boy, kilo), [boy, kilo]);
    const { leanMass, ffmi: rawFFMI, normalizedFfmi: calculatedFFMI } = useMemo(
        () => calculateDetailedFFMI(boy, kilo, yagOrani),
        [boy, kilo, yagOrani]
    );

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? "#020617" : "#f8fafc" }}>
            <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
                {/* Disable native sticky header */}
                <Tabs.Screen options={{ headerShown: false }} />

                <ScrollView
                    ref={scrollViewRef}
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: 20,
                        paddingTop: 16,
                        paddingBottom: 40,
                    }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Marka Logosu */}
                    <BrandLogo />

                    {/* ── GİRDİ BÖLÜMÜ ── */}
                    <InputPanel
                        data={fizikselVeriler}
                        setField={setFizikselAlan}
                    />

                    {/* ── FFMI / BMI SKALASI ── */}
                    <View style={{ marginTop: 20 }}>
                        <ReferenceScale
                            score={calculatedFFMI > 0 ? calculatedFFMI : calculatedBMI}
                            type={calculatedFFMI > 0 ? "FFMI" : "BMI"}
                            gender={fizikselVeriler.cinsiyet}
                        />
                    </View>

                    {/* ── SONUÇ PANELİ ── */}
                    <View style={{ marginTop: 24 }}>
                        <ResultsPanel
                            calculatedBMI={calculatedBMI}
                            leanMass={leanMass}
                            bodyFat={yagOrani || 0}
                            kilo={kilo}
                            ffmi={rawFFMI}
                            normalizedFfmi={calculatedFFMI}
                        />
                    </View>

                    {/* ── HEDEF SİMÜLATÖRÜ ── */}
                    {kilo > 0 && yagOrani > 0 && (
                        <View style={{ marginTop: 20 }}>
                            <TargetSimulator
                                currentWeight={kilo}
                                leanMass={leanMass}
                                currentBodyFat={yagOrani}
                                onToggle={(isOpen) => {
                                    if (isOpen) {
                                        setTimeout(() => {
                                            scrollViewRef.current?.scrollToEnd({ animated: true });
                                        }, 100);
                                    }
                                }}
                            />
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

/** Küçük bölüm başlığı chip'i */
function SectionLabel({ label }: { label: string }) {
    const { isDark } = useTheme();
    return (
        <Text
            style={{
                fontSize: 10,
                fontWeight: "800",
                color: isDark ? "#475569" : "#94a3b8",
                letterSpacing: 2,
                textTransform: "uppercase",
                marginBottom: 10,
                marginTop: 4,
            }}
        >
            {label}
        </Text>
    );
}
