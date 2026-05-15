// src/components/ResultsPanel.tsx
// Web'deki dairesel SVG gauge → react-native-svg dönüşümü
import React from "react";
import { View, Text } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
import { getBMICategory } from "../utils/calculations";

interface ResultsPanelProps {
    calculatedBMI: number;
    leanMass: number;
    bodyFat: number;
    kilo: number;
    ffmi?: number;
    normalizedFfmi?: number;
}

export default function ResultsPanel({
    calculatedBMI,
    leanMass,
    bodyFat,
    kilo,
    ffmi,
    normalizedFfmi,
}: ResultsPanelProps) {
    const { label: bmiLabel } = getBMICategory(calculatedBMI);

    const arcLength = 188.5;
    const progressPercent =
        calculatedBMI > 0
            ? Math.min(100, Math.max(0, (calculatedBMI / 40) * 100))
            : 0;
    const dashOffset = arcLength - (arcLength * progressPercent) / 100;
    const fatMass = (kilo * bodyFat) / 100;

    return (
        <View className="w-full py-4 border-b border-slate-200 dark:border-slate-800 mb-6">
            {/* Dairesel İlerleme Çubuğu SVG */}
            <View className="items-center mb-8">
                <View className="w-32 h-32 relative">
                    <Svg width="100%" height="100%" viewBox="0 0 100 100">
                        <Defs>
                            <LinearGradient
                                id="gaugeGradient"
                                x1="0%"
                                y1="100%"
                                x2="100%"
                                y2="0%"
                            >
                                <Stop offset="0%" stopColor="#c084fc" />
                                <Stop offset="50%" stopColor="#818cf8" />
                                <Stop offset="100%" stopColor="#22d3ee" />
                            </LinearGradient>
                        </Defs>
                        {/* Arka plan yay */}
                        <Path
                            d="M 21.7 78.3 A 40 40 0 1 1 78.3 78.3"
                            fill="transparent"
                            stroke="rgba(99, 102, 241, 0.2)"
                            strokeWidth={10}
                            strokeLinecap="round"
                        />
                        {/* İlerleme yayı */}
                        <Path
                            d="M 21.7 78.3 A 40 40 0 1 1 78.3 78.3"
                            fill="transparent"
                            stroke="url(#gaugeGradient)"
                            strokeWidth={10}
                            strokeLinecap="round"
                            strokeDasharray={`${arcLength}`}
                            strokeDashoffset={`${dashOffset}`}
                        />
                    </Svg>
                    {/* Ortadaki BMI değeri */}
                    <View className="absolute inset-0 items-center justify-center pt-1">
                        <Text className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                            {calculatedBMI > 0 ? calculatedBMI.toFixed(1) : "0.0"}
                        </Text>
                        <Text className="text-[9px] text-slate-500 dark:text-indigo-300 font-bold tracking-widest uppercase mt-0.5">
                            BMI SKORU
                        </Text>
                    </View>
                </View>
            </View>

            {/* Alt Metrikler */}
            <View className="flex-row flex-wrap px-1 -mx-2">
                <View className="w-1/2 px-2 mb-4">
                    <MetricRow label="Beden Kitle İndeksi" value={calculatedBMI > 0 ? calculatedBMI.toFixed(2) : "--"} />
                </View>
                <View className="w-1/2 px-2 mb-4">
                    <MetricRow label="BMI Durumu" value={calculatedBMI > 0 ? bmiLabel : "--"} />
                </View>
                <View className="w-1/2 px-2 mb-4">
                    <MetricRow label="Yağsız Kütle" value={leanMass > 0 ? `${leanMass.toFixed(2)} kg` : "-- kg"} />
                </View>
                <View className="w-1/2 px-2 mb-4">
                    <MetricRow label="Vücut Yağ Kütlesi" value={bodyFat > 0 ? `${fatMass.toFixed(2)} kg` : "-- kg"} />
                </View>
                {ffmi !== undefined && (
                    <View className="w-1/2 px-2 mb-4">
                        <MetricRow label="FFMI Skoru" value={ffmi.toFixed(2)} />
                    </View>
                )}
                {normalizedFfmi !== undefined && (
                    <View className="w-1/2 px-2 mb-4">
                        <MetricRow
                            label="Normalize FFMI"
                            value={normalizedFfmi.toFixed(2)}
                            highlight
                        />
                    </View>
                )}
            </View>
        </View>
    );
}

function MetricRow({
    label,
    value,
    highlight = false,
}: {
    label: string;
    value: string;
    highlight?: boolean;
}) {
    return (
        <View className="flex-col justify-start items-start">
            <Text
                className={`text-[12px] font-normal tracking-wide mb-0.5 ${
                    highlight ? "text-indigo-600 dark:text-cyan-400" : "text-slate-500 dark:text-indigo-200/70"
                }`}
            >
                {label}
            </Text>
            <Text
                className={`text-[14px] ${
                    highlight ? "text-indigo-600 dark:text-cyan-400 font-bold" : "text-slate-900 dark:text-white font-medium"
                }`}
            >
                {value}
            </Text>
        </View>
    );
}
