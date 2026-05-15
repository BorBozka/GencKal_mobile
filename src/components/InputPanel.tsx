// src/components/InputPanel.tsx
// Web'deki <input type="range"> → @react-native-community/slider dönüşümü
import React from "react";
import { View, Text } from "react-native";
import Slider from "@react-native-community/slider";
import type { KullaniciProfil } from "../types";

export interface InputPanelProps {
    data: KullaniciProfil["fizikselVeriler"];
    setField: <K extends keyof KullaniciProfil["fizikselVeriler"]>(
        name: K,
        value: KullaniciProfil["fizikselVeriler"][K]
    ) => void;
}

const sliderConfig = [
    { name: "boy" as const, label: "Boy", unit: "cm", min: 120, max: 220 },
    { name: "kilo" as const, label: "Kilo", unit: "kg", min: 30, max: 160 },
    { name: "yagOrani" as const, label: "Yağ Oranı", unit: "%", min: 1, max: 60 },
] as const;

export default function InputPanel({ data, setField }: InputPanelProps) {
    return (
        <View className="w-full bg-white rounded-2xl p-6 shadow-lg">
            <View className="gap-7">
                {sliderConfig.map((slider) => {
                    const val = data[slider.name] || 0;
                    return (
                        <View key={slider.name}>
                            {/* Üst Satır: Label + Değer */}
                            <View className="flex-row justify-between items-end mb-2">
                                <Text className="text-base font-bold text-slate-500 tracking-wide">
                                    {slider.label}
                                </Text>
                                <View className="flex-row items-baseline">
                                    <Text className="text-3xl font-black text-slate-800">
                                        {val}
                                    </Text>
                                    <Text className="text-sm text-slate-400 font-bold ml-1">
                                        {slider.unit}
                                    </Text>
                                </View>
                            </View>

                            {/* Slider */}
                            <View className="w-full py-1">
                                <Slider
                                    minimumValue={slider.min}
                                    maximumValue={slider.max}
                                    step={1}
                                    value={val}
                                    onValueChange={(v) => setField(slider.name, Math.round(v))}
                                    minimumTrackTintColor="#6366f1"
                                    maximumTrackTintColor="#e2e8f0"
                                    thumbTintColor="#6366f1"
                                />
                            </View>

                            {/* Alt Satır: Min/Max */}
                            <View className="flex-row justify-between mt-0.5">
                                <Text className="text-xs text-slate-500 font-medium">
                                    {slider.min} {slider.unit}
                                </Text>
                                <Text className="text-xs text-slate-500 font-medium">
                                    {slider.max} {slider.unit}
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}
