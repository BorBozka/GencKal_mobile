// src/components/BrandLogo.tsx
import React from "react";
import { View, Text } from "react-native";

interface BrandLogoProps {
    /** "center" (default) veya "left" hizalama */
    align?: "center" | "left";
    style?: object;
}

export default function BrandLogo({ align = "center", style }: BrandLogoProps) {
    return (
        <View
            style={[
                {
                    alignItems: align === "left" ? "flex-start" : "center",
                    paddingBottom: 16,
                },
                style,
            ]}
        >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                {/* Signal bars */}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                    <View style={{ width: 4, height: 12, borderRadius: 2, backgroundColor: "#4338ca" }} />
                    <View style={{ width: 4, height: 20, borderRadius: 2, backgroundColor: "#4338ca" }} />
                    <View style={{ width: 4, height: 12, borderRadius: 2, backgroundColor: "#4338ca" }} />
                </View>
                <Text style={{ fontSize: 18, fontWeight: "700", color: "#4338ca", letterSpacing: -0.3 }}>
                    genckalculator
                </Text>
            </View>
        </View>
    );
}
