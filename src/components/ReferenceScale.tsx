// src/components/ReferenceScale.tsx
import React, { useMemo } from "react";
import { View, Text, Dimensions } from "react-native";
import Svg, { Polygon } from "react-native-svg";
import type { Cinsiyet } from "../types";

interface ReferenceScaleProps {
    score: number;
    type: "FFMI" | "BMI";
    gender?: Cinsiyet;
}

interface Segment {
    label: string;
    min: number;
    max: number;
    color: string;
}

const BMI_SEGMENTS: Segment[] = [
    { label: "Zayıf", min: 15, max: 18.5, color: "#3b82f6" },
    { label: "Normal", min: 18.5, max: 25, color: "#10b981" },
    { label: "Kilolu", min: 25, max: 30, color: "#f59e0b" },
    { label: "Obez", min: 30, max: 40, color: "#ef4444" },
];

const FFMI_SEGMENTS: Segment[] = [
    { label: "Düşük", min: 15, max: 18, color: "#3b82f6" },
    { label: "Ortalama", min: 18, max: 20, color: "#10b981" },
    { label: "İyi", min: 20, max: 22, color: "#8b5cf6" },
    { label: "Mükemmel", min: 22, max: 25, color: "#f59e0b" },
    { label: "Şüpheli", min: 25, max: 31, color: "#ef4444" },
];

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const H_PADDING = 16;
const BAR_HEIGHT = 14;
const GAP = 3;

export default function ReferenceScale({ score, type }: ReferenceScaleProps) {
    const segments = type === "BMI" ? BMI_SEGMENTS : FFMI_SEGMENTS;
    const scaleMin = segments[0].min;
    const scaleMax = segments[segments.length - 1].max;
    const totalRange = scaleMax - scaleMin;
    const barWidth = SCREEN_WIDTH - H_PADDING * 2 - 8; // px-1 padding from parent

    const markerPercent = useMemo(() => {
        return Math.min(100, Math.max(0, ((score - scaleMin) / totalRange) * 100));
    }, [score, scaleMin, totalRange]);

    const markerX = (markerPercent / 100) * barWidth;

    return (
        <View className="w-full mt-4 mb-6">
            {/* Başlık */}
            <Text className="text-xs text-indigo-200/60 font-bold tracking-widest uppercase text-center mb-4">
                {type === "BMI" ? "BMI Skalası" : "FFMI Skalası"}
            </Text>

            {/* İşaretçi üçgen */}
            <View style={{ marginLeft: markerX - 7, marginBottom: 3 }}>
                <Svg width={14} height={12} viewBox="0 0 14 12">
                    <Polygon
                        points="1,1 13,1 7,11"
                        fill="white"
                        stroke="white"
                        strokeWidth="1"
                        strokeLinejoin="round"
                    />
                </Svg>
            </View>

            {/* Segmentli bar */}
            <View className="flex-row" style={{ gap: GAP }}>
                {segments.map((seg, idx) => (
                    <View
                        key={idx}
                        style={{
                            flex: seg.max - seg.min,
                            height: BAR_HEIGHT,
                            backgroundColor: seg.color,
                            borderTopLeftRadius: idx === 0 ? 7 : 2,
                            borderBottomLeftRadius: idx === 0 ? 7 : 2,
                            borderTopRightRadius: idx === segments.length - 1 ? 7 : 2,
                            borderBottomRightRadius: idx === segments.length - 1 ? 7 : 2,
                        }}
                    />
                ))}
            </View>

            {/* Sınır değerleri (barın hemen altı) */}
            <View className="relative" style={{ height: 18, marginTop: 4 }}>
                {segments.map((seg, idx) => {
                    // İlk segment'in sol sınırı
                    if (idx === 0) {
                        return (
                            <Text
                                key={`start-${idx}`}
                                className="absolute text-[10px] text-gray-400 font-medium"
                                style={{ left: 0, top: 0 }}
                            >
                                {seg.min}
                            </Text>
                        );
                    }
                    return null;
                })}
                {segments.map((seg, idx) => {
                    // Her segment'in sağ sınırı
                    const rightEdgePercent = ((seg.max - scaleMin) / totalRange) * 100;
                    const rightEdgeX = (rightEdgePercent / 100) * barWidth;
                    return (
                        <Text
                            key={`end-${idx}`}
                            className="absolute text-[10px] text-gray-400 font-medium"
                            style={{
                                left: rightEdgeX,
                                top: 0,
                                transform: [{ translateX: idx === segments.length - 1 ? -14 : -8 }],
                            }}
                        >
                            {seg.max}
                        </Text>
                    );
                })}
            </View>

            {/* Kategori isimleri */}
            <View className="flex-row" style={{ gap: GAP, marginTop: 2 }}>
                {segments.map((seg, idx) => (
                    <View
                        key={idx}
                        style={{ flex: seg.max - seg.min }}
                        className="items-center"
                    >
                        <Text 
                            className="text-[10px] tracking-tighter text-white/80 font-semibold text-center"
                            numberOfLines={1}
                        >
                            {seg.label}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}
