// src/components/TargetSimulator.tsx
// Aydınlık tema kilidi uygulanmış TargetSimulator
import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated, Easing } from "react-native";
import Slider from "@react-native-community/slider";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

interface TargetSimulatorProps {
    currentWeight: number;
    leanMass: number;
    currentBodyFat: number;
    onToggle?: (isOpen: boolean) => void;
}

export default function TargetSimulator({
    currentWeight,
    leanMass,
    currentBodyFat,
    onToggle,
}: TargetSimulatorProps) {
    const { isDark, colors } = useTheme();
    const minWeight = Math.ceil(leanMass);
    const [targetWeight, setTargetWeight] = useState(currentWeight);
    const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

    // React Native built-in Animated value (0 = closed, 1 = open)
    const animation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        setTargetWeight(currentWeight);
    }, [currentWeight]);

    useEffect(() => {
        Animated.timing(animation, {
            toValue: isSimulatorOpen ? 1 : 0,
            duration: 300,
            useNativeDriver: false, // Height animasyonları için false olmalı
            easing: Easing.inOut(Easing.ease),
        }).start();
    }, [isSimulatorOpen]);

    // Interpolations
    const animatedHeight = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 240], // Max içerik yüksekliği
    });

    const animatedOpacity = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    const animatedRotation = animation.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "180deg"],
    });

    // Sınır güvenliği ve çökme koruması kontrolü
    if (currentWeight <= 0 || leanMass <= 0 || minWeight <= 0 || currentWeight <= minWeight) {
        return null;
    }

    const newBodyFat =
        targetWeight > leanMass
            ? Math.max(0, ((targetWeight - leanMass) / targetWeight) * 100)
            : 0;

    return (
        <View
            style={{
                width: "100%",
                paddingTop: 16,
                paddingBottom: 0,
                marginBottom: 0
            }}
        >
            {/* Başlık */}
            <TouchableOpacity
                activeOpacity={0.7}
                className="flex-row items-center mb-4"
                onPress={() => {
                    const newState = !isSimulatorOpen;
                    setIsSimulatorOpen(newState);
                    onToggle?.(newState);
                }}
            >
                <Text className="text-lg font-semibold text-slate-900 dark:text-slate-100 text-left mr-2">
                    Hedef Simülatörü
                </Text>
                <Animated.View style={{ transform: [{ rotate: animatedRotation }] }}>
                    <Feather name="chevron-down" size={20} color="#64748b" />
                </Animated.View>
            </TouchableOpacity>

            <Animated.View style={{ height: animatedHeight, opacity: animatedOpacity, overflow: "hidden" }}>
                <View>
                    {/* Slider Alanı */}
                    <View className="gap-4 mt-2 mb-4">
                        <View className="items-center gap-1">
                            <Text className="text-sm text-slate-500 dark:text-slate-400">Hedef Kilo</Text>
                            <View className="flex-row items-baseline">
                                <Text
                                    style={{ color: isDark ? colors.primaryDark : colors.primary }}
                                    className="text-4xl font-black tracking-tight"
                                >
                                    {targetWeight}
                                </Text>
                                <Text
                                    style={{ color: (isDark ? colors.primaryDark : colors.primary) + "CC" }}
                                    className="text-xl font-bold ml-1"
                                >
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
                            minimumTrackTintColor={isDark ? colors.primaryDark : colors.primary}
                            maximumTrackTintColor="rgba(0,0,0,0.1)"
                            thumbTintColor={isDark ? colors.primaryDark : colors.primary}
                            style={{ height: 40, width: "100%" }}
                        />

                        <View className="flex-row justify-between px-1">
                            <Text className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                Min: {minWeight} kg
                            </Text>
                            <Text className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                Maks: {currentWeight + 25} kg
                            </Text>
                        </View>
                    </View>

                    {/* Sonuç Paneli */}
                    <View className="w-full items-center justify-center pt-2 gap-1">
                        <Text className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-2 text-center">
                            Yeni Yağ Oranı
                        </Text>
                        <Text className="text-4xl font-bold text-slate-900 dark:text-slate-100 text-center">
                            % {newBodyFat > 0 ? newBodyFat.toFixed(1) : "0.0"}
                        </Text>
                    </View>
                </View>
            </Animated.View>
        </View>
    );
}
