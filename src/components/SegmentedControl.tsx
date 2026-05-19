// src/components/SegmentedControl.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
    activeColor?: string;
    inactiveColor?: string;
}

export default function SegmentedControl<T>({
    options,
    selectedValue,
    onValueChange,
    containerStyle,
    activeColor = "#4338ca", // Brand Indigo-700
    inactiveColor = "#64748b", // Slate-500
}: SegmentedControlProps<T>) {
    return (
        <View style={[styles.container, containerStyle]}>
            {options.map((option) => {
                const isActive = selectedValue === option.value;
                return (
                    <TouchableOpacity
                        key={String(option.value)}
                        onPress={() => onValueChange(option.value)}
                        activeOpacity={0.85}
                        style={[
                            styles.button,
                            isActive && styles.activeButton,
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
        backgroundColor: "#f1f5f9", // bg-slate-100
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
    activeButton: {
        backgroundColor: "#ffffff",
        ...Platform.select({
            ios: {
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
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
