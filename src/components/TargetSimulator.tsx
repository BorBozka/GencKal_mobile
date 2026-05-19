// src/components/TargetSimulator.tsx
// Aydınlık tema kilidi uygulanmış TargetSimulator
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
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
    const minWeight = Math.ceil(leanMass);
    const [targetWeight, setTargetWeight] = useState(currentWeight);
    const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

    useEffect(() => {
        setTargetWeight(currentWeight);
    }, [currentWeight]);

    // Sınır güvenliği ve çökme koruması kontrolü
    if (currentWeight <= 0 || leanMass <= 0 || minWeight <= 0 || currentWeight <= minWeight) {
        return null;
    }

    const newBodyFat =
        targetWeight > leanMass
            ? Math.max(0, ((targetWeight - leanMass) / targetWeight) * 100)
            : 0;

    return (
        <View className="w-full py-4 mb-6">
            {/* Başlık */}
            <TouchableOpacity
                activeOpacity={0.7}
                className="flex-row items-center mb-4"
                onPress={() => setIsSimulatorOpen(!isSimulatorOpen)}
            >
                <Text className="text-lg font-semibold text-slate-900 text-left mr-2">
                    Hedef Simülatörü
                </Text>
                <Text className="text-sm text-slate-500">
                    {isSimulatorOpen ? "▲" : "▼"}
                </Text>
            </TouchableOpacity>

            {isSimulatorOpen && (
                <View>
                    {/* Slider Alanı */}
                    <View className="gap-4 mt-2 mb-4">
                        <View className="items-center gap-1">
                            <Text className="text-sm text-slate-500">Hedef Kilo</Text>
                            <View className="flex-row items-baseline">
                                <Text className="text-4xl font-black tracking-tight" style={{ color: "#4338ca" }}>
                                    {targetWeight}
                                </Text>
                                <Text className="text-xl font-bold ml-1" style={{ color: "rgba(67, 56, 202, 0.8)" }}>
                                    kg
                                </Text>
                            </View>
                        </View>

                        <Slider
                            minimumValue={minWeight}
                            maximumValue={currentWeight + 25}
                            step={1}
                            value={targetWeight}
                            onValueChange={(v) => setTargetWeight(Math.round(v))}
                            minimumTrackTintColor="#4338ca"
                            maximumTrackTintColor="rgba(0,0,0,0.1)"
                            thumbTintColor="#4338ca"
                            style={{ height: 40, width: "100%" }}
                        />

                        <View className="flex-row justify-between px-1">
                            <Text className="text-[11px] text-slate-500 font-medium">
                                Min: {minWeight} kg
                            </Text>
                            <Text className="text-[11px] text-slate-500 font-medium">
                                Maks: {currentWeight + 25} kg
                            </Text>
                        </View>
                    </View>

                    {/* Sonuç Paneli */}
                    <View className="w-full items-center justify-center pt-2 gap-1">
                        <Text className="text-sm text-slate-500 font-medium mb-2 text-center">
                            Yeni Yağ Oranı
                        </Text>
                        <Text className="text-4xl font-bold text-slate-900 text-center">
                            % {newBodyFat > 0 ? newBodyFat.toFixed(1) : "0.0"}
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
}
