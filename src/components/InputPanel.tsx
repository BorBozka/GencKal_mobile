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
        <View className="w-full">
            {sliderConfig.map((slider, idx) => {
                const val = data[slider.name] || 0;
                return (
                    <View key={slider.name} className={`${idx < sliderConfig.length - 1 ? "border-b border-white/10 pb-8 mb-8" : "mb-8"}`}>
                        {/* Üst Satır: Label + Değer */}
                        <View className="flex-row justify-between items-end mb-2">
                            <Text className="text-base font-bold text-indigo-100 tracking-wide mb-1">
                                {slider.label}
                            </Text>
                            <View className="flex-row items-end">
                                <Text className="text-3xl font-black text-white leading-none">
                                    {val}
                                </Text>
                                <Text className="text-sm text-indigo-200 font-bold ml-1 mb-0.5">
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
                                minimumTrackTintColor="#22d3ee"
                                maximumTrackTintColor="rgba(255,255,255,0.2)"
                                thumbTintColor="#22d3ee"
                            />
                        </View>

                        {/* Alt Satır: Min/Max */}
                        <View className="flex-row justify-between mt-0.5">
                            <Text className="text-xs text-indigo-300/60 font-medium">
                                {slider.min} {slider.unit}
                            </Text>
                            <Text className="text-xs text-indigo-300/60 font-medium">
                                {slider.max} {slider.unit}
                            </Text>
                        </View>
                    </View>
                );
            })}
        </View>
    );
}
