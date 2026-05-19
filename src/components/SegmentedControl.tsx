// src/components/SegmentedControl.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export interface SegmentedOption<T> {
    value: T;
    label: string;
    icon?: keyof typeof Ionicons.glyphMap;
}

interface SegmentedControlProps<T> {
    options: SegmentedOption<T>[];
    selectedValue: T;
    onValueChange: (value: T) => void;
    containerStyle?: object;
}

export default function SegmentedControl<T>({
    options,
    selectedValue,
    onValueChange,
    containerStyle,
}: SegmentedControlProps<T>) {
    const { isDark, colors } = useTheme();
    const activeColor = isDark ? colors.primaryDark : colors.primary; // Dynamic active theme color
    const inactiveColor = isDark ? "#94a3b8" : "#64748b"; // slate-400 / slate-500
    const activeBg = isDark ? "#1e293b" : "#ffffff"; // slate-800 / white
    const containerBg = isDark ? "#0f172a" : "#f1f5f9"; // slate-900 / slate-100

    return (
        <View style={[styles.container, { backgroundColor: containerBg }, containerStyle]}>
            {options.map((option) => {
                const isActive = selectedValue === option.value;
                return (
                    <TouchableOpacity
                        key={String(option.value)}
                        onPress={() => onValueChange(option.value)}
                        activeOpacity={0.85}
                        style={[
                            styles.button,
                            isActive && { backgroundColor: activeBg, ...styles.activeShadow },
                        ]}
                    >
                        {option.icon && (
                            <Ionicons
                                name={option.icon}
                                size={15}
                                color={isActive ? activeColor : inactiveColor}
                                style={styles.icon}
                            />
                        )}
                        <Text
                            style={[
                                styles.label,
                                {
                                    color: isActive ? activeColor : inactiveColor,
                                    fontWeight: isActive ? "700" : "500",
                                },
                            ]}
                        >
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 4,
        flexDirection: "row",
        borderRadius: 16,
    },
    button: {
        flex: 1,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        backgroundColor: "transparent",
    },
    activeShadow: {
        ...Platform.select({
            ios: {
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.15,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    icon: {
        marginRight: 6,
    },
    label: {
        fontSize: 13,
        textAlign: "center",
    },
});
