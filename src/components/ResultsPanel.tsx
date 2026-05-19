// src/components/ResultsPanel.tsx
// Premium 2x2 grid metric cards ile yeniden tasarlandı
import React from "react";
import { View, Text } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
import { getBMICategory } from "../utils/calculations";
import { useTheme } from "../context/ThemeContext";

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
    const { isDark, colors } = useTheme();
    const { label: bmiLabel } = getBMICategory(calculatedBMI);

    const arcLength = 188.5;
    const progressPercent =
        calculatedBMI > 0
            ? Math.min(100, Math.max(0, (calculatedBMI / 40) * 100))
            : 0;
    const dashOffset = arcLength - (arcLength * progressPercent) / 100;
    const fatMass = (kilo * bodyFat) / 100;

    // Temel metrikler: ilk 4 her zaman görünür
    const primaryMetrics = [
        { label: "Beden Kitle İndeksi", value: calculatedBMI > 0 ? calculatedBMI.toFixed(2) : "--", highlight: false },
        { label: "BMI Durumu", value: calculatedBMI > 0 ? bmiLabel : "--", highlight: false },
        { label: "Yağsız Kütle", value: leanMass > 0 ? `${leanMass.toFixed(1)} kg` : "-- kg", highlight: false },
        { label: "Vücut Yağ Kütlesi", value: bodyFat > 0 ? `${fatMass.toFixed(1)} kg` : "-- kg", highlight: false },
    ];

    // FFMI metrikleri opsiyonel
    const ffmiMetrics = [
        ...(ffmi !== undefined ? [{ label: "FFMI Skoru", value: ffmi.toFixed(2), highlight: false }] : []),
        ...(normalizedFfmi !== undefined ? [{ label: "Normalize FFMI", value: normalizedFfmi.toFixed(2), highlight: true }] : []),
    ];

    const allMetrics = [...primaryMetrics, ...ffmiMetrics];

    // 2 sütunlu grid için çiftler halinde grupla
    const rows: typeof allMetrics[] = [];
    for (let i = 0; i < allMetrics.length; i += 2) {
        rows.push(allMetrics.slice(i, i + 2));
    }

    return (
        <View style={{ width: "100%", paddingVertical: 4 }}>
            {/* BMI Gauge */}
            <View style={{ alignItems: "center", marginVertical: 24 }}>
                <View style={{ width: 140, height: 140, position: "relative" }}>
                    <Svg width="100%" height="100%" viewBox="0 0 100 100">
                        <Defs>
                            <LinearGradient id="gaugeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                                <Stop offset="0%" stopColor="#c084fc" />
                                <Stop offset="50%" stopColor={isDark ? colors.primaryDark : colors.primary} />
                                <Stop offset="100%" stopColor="#22d3ee" />
                            </LinearGradient>
                        </Defs>
                        {/* Arka plan yayı */}
                        <Path
                            d="M 21.7 78.3 A 40 40 0 1 1 78.3 78.3"
                            fill="transparent"
                            stroke={isDark ? "#1e293b" : "#f1f5f9"}
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
                    {/* Ortadaki değer */}
                    <View style={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center", paddingTop: 4 }}>
                        <Text style={{ fontSize: 38, fontWeight: "900", color: isDark ? "#f1f5f9" : "#0f172a", letterSpacing: -1 }}>
                            {calculatedBMI > 0 ? calculatedBMI.toFixed(1) : "0.0"}
                        </Text>
                        <Text style={{ fontSize: 9, color: isDark ? "#64748b" : "#94a3b8", fontWeight: "800", letterSpacing: 2, marginTop: 2 }}>
                            BMI SKORU
                        </Text>
                    </View>
                </View>

                {/* BMI durum etiketi */}
                {calculatedBMI > 0 && (
                    <View
                        style={{
                            marginTop: 12,
                            paddingHorizontal: 16,
                            paddingVertical: 5,
                            borderRadius: 999,
                            backgroundColor: isDark ? colors.lightAccentDark : colors.lightAccent,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 12,
                                fontWeight: "700",
                                color: isDark ? colors.primaryDark : colors.primary,
                                letterSpacing: 0.5,
                            }}
                        >
                            {bmiLabel}
                        </Text>
                    </View>
                )}
            </View>

            {/* 2x2 Metrik Kart Grid */}
            <View style={{ gap: 10 }}>
                {rows.map((row, rowIndex) => (
                    <View key={rowIndex} style={{ flexDirection: "row", gap: 10 }}>
                        {row.map((metric, colIndex) => (
                            <MetricCard
                                key={colIndex}
                                label={metric.label}
                                value={metric.value}
                                highlight={metric.highlight}
                            />
                        ))}
                        {/* Tek elemanlı satırda boşluk doldurucu */}
                        {row.length === 1 && <View style={{ flex: 1 }} />}
                    </View>
                ))}
            </View>
        </View>
    );
}

function MetricCard({
    label,
    value,
    highlight = false,
}: {
    label: string;
    value: string;
    highlight?: boolean;
}) {
    const { isDark, colors } = useTheme();

    const cardBg = isDark ? "#0f172a" : "#ffffff";
    const cardBorder = isDark ? "#1e293b" : "#f1f5f9";
    const labelColor = highlight
        ? (isDark ? colors.primaryDark : colors.primary)
        : (isDark ? "#64748b" : "#94a3b8");
    const valueColor = highlight
        ? (isDark ? colors.primaryDark : colors.primary)
        : (isDark ? "#f1f5f9" : "#0f172a");

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: cardBg,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: cardBorder,
                padding: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isDark ? 0.2 : 0.04,
                shadowRadius: 4,
                elevation: 2,
            }}
        >
            <Text
                style={{
                    fontSize: 10,
                    fontWeight: "700",
                    color: labelColor,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    marginBottom: 8,
                }}
                numberOfLines={2}
            >
                {label}
            </Text>
            <Text
                style={{
                    fontSize: 22,
                    fontWeight: "900",
                    color: valueColor,
                    letterSpacing: -0.5,
                }}
                numberOfLines={1}
                adjustsFontSizeToFit
            >
                {value}
            </Text>
        </View>
    );
}
