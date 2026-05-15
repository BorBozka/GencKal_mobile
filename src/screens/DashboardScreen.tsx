// src/screens/DashboardScreen.tsx
import React, { useState, useMemo, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import type { KullaniciProfil, Cinsiyet, AktiviteSeviyesi, Hedef } from "../types";
import { calculateBMI, calculateDetailedFFMI, calculateTDEE } from "../utils/calculations";

import InputPanel from "../components/InputPanel";
import ResultsPanel from "../components/ResultsPanel";
import TargetSimulator from "../components/TargetSimulator";
import ReferenceScale from "../components/ReferenceScale";

interface DashboardScreenProps {
    onNavigateToDiet: (formData: KullaniciProfil, tdee: number) => void;
}

export default function DashboardScreen({ onNavigateToDiet }: DashboardScreenProps) {
    const [formData, setFormData] = useState<KullaniciProfil>({
        fizikselVeriler: {
            boy: 175,
            kilo: 75,
            yas: 25,
            cinsiyet: "erkek" as Cinsiyet,
            yagOrani: 15,
            aktiviteSeviyesi: "hareketsiz (ofis işi)" as AktiviteSeviyesi,
            agirlikCalisiyorMu: false,
        },
        diyetVerileri: {
            diyetTipi: "standart",
            ogunSayisi: 3,
            alerjenler: [],
            kullanilanTakviyeler: [],
            hedef: "kilo_koruma" as Hedef,
        },
    });

    const { boy, kilo, yagOrani } = formData.fizikselVeriler;

    // --- ANLIK HESAPLAMALAR ---
    const calculatedBMI = useMemo(() => calculateBMI(boy, kilo), [boy, kilo]);
    const { leanMass, ffmi: rawFFMI, normalizedFfmi: calculatedFFMI } = useMemo(
        () => calculateDetailedFFMI(boy, kilo, yagOrani),
        [boy, kilo, yagOrani]
    );
    const calculatedTDEE = useMemo(
        () => calculateTDEE(formData.fizikselVeriler),
        [formData.fizikselVeriler]
    );
    // --- HANDLER ---
    const setFizikselAlan = useCallback(<K extends keyof KullaniciProfil["fizikselVeriler"]>(
        name: K,
        value: KullaniciProfil["fizikselVeriler"][K]
    ) => {
        setFormData(prev => ({
            ...prev,
            fizikselVeriler: { ...prev.fizikselVeriler, [name]: value }
        }));
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-900" edges={["top"]}>
            <StatusBar style="auto" />

            {/* Header */}
            <View className="px-5 pt-3 pb-4 flex-row justify-between items-center">
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
                <TouchableOpacity
                    onPress={() => onNavigateToDiet(formData, calculatedTDEE)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    className="py-2 pl-2 pr-2"
                >
                    <Text className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold tracking-wide">
                        Diyet Planı
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerClassName="pb-12 px-5 pt-4"
                keyboardShouldPersistTaps="handled"
            >
                {/* Üst: Başlık */}
                <View className="items-center mb-8">
                    <Text className="text-[28px] font-normal text-slate-900 dark:text-white tracking-wide text-center">
                        GençKal Calculator
                    </Text>
                    <Text className="text-sm text-slate-500 dark:text-indigo-200 font-light tracking-wide text-center mt-1">
                        Sağlık metriklerinizi ve yağsız vücut kütlenizi belirleyin
                    </Text>
                </View>

                {/* ResultsPanel */}
                <ResultsPanel
                    calculatedBMI={calculatedBMI}
                    leanMass={leanMass}
                    bodyFat={yagOrani || 0}
                    kilo={kilo}
                    ffmi={rawFFMI}
                    normalizedFfmi={calculatedFFMI}
                />

                {/* Girdi ve Çıktı Ayrımı (Zarif Panel) */}
                <View className="pt-2 px-6 -mx-5">
                    {/* InputPanel */}
                    <InputPanel
                        data={formData.fizikselVeriler}
                        setField={setFizikselAlan}
                    />

                    {/* TargetSimulator */}
                    {kilo > 0 && yagOrani > 0 && (
                        <TargetSimulator
                            currentWeight={kilo}
                            leanMass={leanMass}
                            currentBodyFat={yagOrani}
                        />
                    )}

                    {/* ReferenceScale */}
                    <View className="mt-4 pt-6 border-t border-slate-200 dark:border-slate-800 pb-10">
                        <ReferenceScale
                            score={calculatedFFMI > 0 ? calculatedFFMI : calculatedBMI}
                            type={calculatedFFMI > 0 ? "FFMI" : "BMI"}
                            gender={formData.fizikselVeriler.cinsiyet}
                        />
                    </View>
                </View>
            </ScrollView>


        </SafeAreaView>
    );
}
