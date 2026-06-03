// src/components/BrandLogo.tsx
import React from "react";
import { View, Text, StyleProp, ViewStyle } from "react-native";

import { useTheme } from "../context/ThemeContext";

interface BrandLogoProps {
    /** "center" (default) veya "left" hizalama */
    align?: "center" | "left";
    style?: StyleProp<ViewStyle>;
    /** Logoyu büyük boyutta göstermek için */
    large?: boolean;
}

export default function BrandLogo({ align = "center", style, large = false }: BrandLogoProps) {
    const { isDark, colors } = useTheme();
    const brandColor = isDark ? colors.primaryDark : colors.primary;

    const barWidth = large ? 7 : 4;
    const sideBarHeight = large ? 24 : 12;
    const centerBarHeight = large ? 40 : 20;
    const barGap = large ? 4 : 2;
    const logoFontSize = large ? 32 : 18;
    const contentGap = large ? 12 : 8;

    return (
        <View
            style={[
                {
                    alignItems: align === "left" ? "flex-start" : "center",
                    paddingBottom: large ? 24 : 16,
                },
                style,
            ]}
        >
            <View style={{ flexDirection: "row", alignItems: "center", gap: contentGap }}>
                {/* Signal bars */}
                <View style={{ flexDirection: "row", alignItems: "center", gap: barGap }}>
                    <View style={{ width: barWidth, height: sideBarHeight, borderRadius: barWidth / 2, backgroundColor: brandColor }} />
                    <View style={{ width: barWidth, height: centerBarHeight, borderRadius: barWidth / 2, backgroundColor: brandColor }} />
                    <View style={{ width: barWidth, height: sideBarHeight, borderRadius: barWidth / 2, backgroundColor: brandColor }} />
                </View>
                <Text style={{ fontSize: logoFontSize, fontWeight: "800", color: brandColor, letterSpacing: large ? -0.8 : -0.3 }}>
                    GencKalculator
                </Text>
            </View>
        </View>
    );
}
