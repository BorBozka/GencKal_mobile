// src/components/TargetSimulator.tsx
import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import Slider from "@react-native-community/slider";

interface TargetSimulatorProps {
    currentWeight: number;
    leanMass: number;
    currentBodyFat: number;
}

export default function TargetSimulator({
    currentWeight,
    leanMass,
    currentBodyFat,
}: TargetSimulatorProps) {
    const [targetWeight, setTargetWeight] = useState(currentWeight);

    useEffect(() => {
        setTargetWeight(currentWeight);
    }, [currentWeight]);

    const newBodyFat =
        targetWeight > 0 ? ((targetWeight - leanMass) / targetWeight) * 100 : 0;
    const minWeight = Math.ceil(leanMass);

    return (
        <View className="w-full py-4 mb-6">
            {/* Başlık */}
            <Text className="text-lg font-semibold text-slate-900 dark:text-slate-100 text-left mb-4">
                Hedef Simülatörü
            </Text>

            {/* Slider Alanı */}
            <View className="gap-5 my-2 py-3">
                <View className="items-center gap-1">
                    <Text className="text-sm text-slate-500 dark:text-indigo-200/80">Hedef Kilo</Text>
                    <View className="flex-row items-baseline">
                        <Text className="text-4xl text-cyan-400 font-black tracking-tight">
                            {targetWeight}
                        </Text>
                        <Text className="text-xl text-cyan-400/80 font-bold ml-1">
                            kg
                        </Text>
                    </View>
                </View>

                <Slider
                    minimumValue={minWeight > 0 ? minWeight : 30}
                    maximumValue={currentWeight > minWeight ? currentWeight : minWeight + 1}
                    step={1}
                    value={targetWeight}
                    onValueChange={(v) => setTargetWeight(Math.round(v))}
                    minimumTrackTintColor="#22d3ee"
                    maximumTrackTintColor="rgba(255,255,255,0.2)"
                    thumbTintColor="#22d3ee"
                />

                <View className="flex-row justify-between px-1">
                    <Text className="text-[11px] text-slate-500 dark:text-indigo-300/80 font-medium">
                        Min: {minWeight} kg
                    </Text>
                    <Text className="text-[11px] text-slate-500 dark:text-indigo-300/80 font-medium">
                        Mevcut: {currentWeight} kg
                    </Text>
                </View>
            </View>

            {/* Sonuç Paneli */}
            <View className="w-full items-center justify-center mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
                <Text className="text-sm text-slate-500 dark:text-indigo-200 font-medium mb-2 text-center">
                    Yeni Yağ Oranı
                </Text>
                <Text className="text-4xl font-bold text-slate-900 dark:text-white text-center">
                    % {newBodyFat > 0 ? newBodyFat.toFixed(1) : "0.0"}
                </Text>
            </View>
        </View>
    );
}
