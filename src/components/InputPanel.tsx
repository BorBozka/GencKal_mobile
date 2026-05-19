// src/components/InputPanel.tsx
// Premium card container ile yeniden tasarlandı
import React from "react";
import { View, Text, TextInput } from "react-native";
import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";
import type { KullaniciProfil } from "../types";
import { useTheme } from "../context/ThemeContext";

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
    const { isDark, colors } = useTheme();
    const lastHapticValues = React.useRef<Record<string, number>>({});
    const [focusedField, setFocusedField] = React.useState<string | null>(null);

    return (
        <View
            style={{
                backgroundColor: isDark ? "#0f172a" : "#ffffff",
                borderRadius: 20,
                borderWidth: 1,
                borderColor: isDark ? "#1e293b" : "#f1f5f9",
                overflow: "hidden",
                // Subtle elevation
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.25 : 0.06,
                shadowRadius: 8,
                elevation: 3,
            }}
        >
            {sliderConfig.map((slider, index) => {
                const val = data[slider.name] || 0;
                const isFocused = focusedField === slider.name;
                const isLast = index === sliderConfig.length - 1;

                return (
                    <View key={slider.name}>
                        <View style={{ paddingHorizontal: 18, paddingVertical: 18 }}>
                            {/* Üst Satır: Label + Değer input */}
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                                <Text
                                    style={{
                                        fontSize: 15,
                                        fontWeight: "700",
                                        color: isDark ? "#e2e8f0" : "#1e293b",
                                        letterSpacing: 0.2,
                                    }}
                                >
                                    {slider.label}
                                </Text>

                                {/* Değer chip */}
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        borderRadius: 12,
                                        paddingHorizontal: 14,
                                        paddingVertical: 7,
                                        borderWidth: 1.5,
                                        backgroundColor: isFocused
                                            ? (isDark ? colors.lightAccentDark : colors.lightAccent)
                                            : (isDark ? "#1e293b" : "#f8fafc"),
                                        borderColor: isFocused
                                            ? (isDark ? colors.primaryDark : colors.primary)
                                            : (isDark ? "#334155" : "#e2e8f0"),
                                    }}
                                >
                                    <TextInput
                                        keyboardType="numeric"
                                        value={val > 0 ? String(val) : ""}
                                        onChangeText={(text) => {
                                            const num = parseInt(text, 10);
                                            if (!isNaN(num)) {
                                                const clamped = Math.max(slider.min, Math.min(slider.max, num));
                                                setField(slider.name, clamped);
                                            } else if (text === "") {
                                                setField(slider.name, 0);
                                            }
                                        }}
                                        onFocus={() => setFocusedField(slider.name)}
                                        onBlur={() => setFocusedField(null)}
                                        returnKeyType="done"
                                        blurOnSubmit={true}
                                        style={{
                                            fontSize: 22,
                                            fontWeight: "900",
                                            color: isFocused
                                                ? (isDark ? colors.primaryDark : colors.primary)
                                                : (isDark ? "#f1f5f9" : "#0f172a"),
                                            minWidth: 44,
                                            textAlign: "right",
                                            padding: 0,
                                            lineHeight: undefined,
                                        }}
                                    />
                                    <Text
                                        style={{
                                            fontSize: 12,
                                            fontWeight: "700",
                                            color: isDark ? "#64748b" : "#94a3b8",
                                            marginLeft: 4,
                                        }}
                                    >
                                        {slider.unit}
                                    </Text>
                                </View>
                            </View>

                            {/* Slider */}
                            <Slider
                                minimumValue={slider.min}
                                maximumValue={slider.max}
                                step={1}
                                value={val || slider.min}
                                onValueChange={(v) => {
                                    const rounded = Math.round(v);
                                    const clamped = Math.max(slider.min, Math.min(slider.max, rounded));
                                    setField(slider.name, clamped);
                                    if (lastHapticValues.current[slider.name] !== clamped) {
                                        lastHapticValues.current[slider.name] = clamped;
                                        Haptics.selectionAsync().catch(() => {});
                                    }
                                }}
                                minimumTrackTintColor={isDark ? colors.primaryDark : colors.primary}
                                maximumTrackTintColor={isDark ? "#1e293b" : "#e2e8f0"}
                                thumbTintColor={isDark ? colors.primaryDark : colors.primary}
                                style={{ height: 36, marginHorizontal: -4 }}
                            />

                            {/* Min / Max etiketleri */}
                            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 2 }}>
                                <Text style={{ fontSize: 10, color: isDark ? "#475569" : "#94a3b8", fontWeight: "600" }}>
                                    {slider.min} {slider.unit}
                                </Text>
                                <Text style={{ fontSize: 10, color: isDark ? "#475569" : "#94a3b8", fontWeight: "600" }}>
                                    {slider.max} {slider.unit}
                                </Text>
                            </View>
                        </View>

                        {/* Ayırıcı çizgi (son elemanda gösterme) */}
                        {!isLast && (
                            <View
                                style={{
                                    height: 1,
                                    backgroundColor: isDark ? "#1e293b" : "#f1f5f9",
                                    marginHorizontal: 18,
                                }}
                            />
                        )}
                    </View>
                );
            })}
        </View>
    );
}
