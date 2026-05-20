import React from "react";
import { Platform, Text, View, DeviceEventEmitter } from "react-native";
import { Tabs } from "expo-router";
import * as Haptics from "expo-haptics";
// expo-blur kaldırıldı — kullanılmıyor (3.4)
import { Calculator, UtensilsCrossed, Settings } from "lucide-react-native";
import { useTheme } from "../../src/context/ThemeContext";

export default function TabsLayout() {
    const { isDark, colors } = useTheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: true,
                sceneStyle: { backgroundColor: isDark ? "#020617" : "#ffffff" },
                headerStyle: {
                    backgroundColor: isDark ? "#0f172a" : "#ffffff",
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 0,
                },
                headerTitleAlign: "center",
                headerTitle: () => (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                            <View style={{ width: 4, height: 12, borderRadius: 2, backgroundColor: isDark ? colors.primaryDark : colors.primary }} />
                            <View style={{ width: 4, height: 20, borderRadius: 2, backgroundColor: isDark ? colors.primaryDark : colors.primary }} />
                            <View style={{ width: 4, height: 12, borderRadius: 2, backgroundColor: isDark ? colors.primaryDark : colors.primary }} />
                        </View>
                        <Text style={{ fontSize: 18, fontWeight: "700", color: isDark ? colors.primaryDark : colors.primary, letterSpacing: -0.3 }}>
                            GencKalculator
                        </Text>
                    </View>
                ),
                tabBarActiveTintColor: isDark ? colors.primaryDark : colors.primary,
                tabBarInactiveTintColor: isDark ? "#475569" : "#9ca3af",
                tabBarShowLabel: true,
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: "700",
                    letterSpacing: 0.3,
                    marginBottom: 2,
                },
                tabBarStyle: {
                    backgroundColor: isDark ? "#0f172a" : "#ffffff",
                    borderTopWidth: 1,
                    borderTopColor: isDark ? "#1e293b" : "#f1f5f9",
                    height: Platform.OS === "ios" ? 88 : 68,
                    paddingBottom: Platform.OS === "ios" ? 28 : 12,
                    paddingTop: 10,
                    elevation: 8,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: isDark ? 0.2 : 0.03,
                    shadowRadius: 8,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Hesaplayıcı",
                    tabBarIcon: ({ color, size }) => (
                        <Calculator size={size} color={color} strokeWidth={2} />
                    ),
                }}
                listeners={{
                    tabPress: () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    },
                }}
            />
            <Tabs.Screen
                name="diet"
                options={{
                    title: "Diyet Planı",
                    tabBarIcon: ({ color, size }) => (
                        <UtensilsCrossed size={size} color={color} strokeWidth={2} />
                    ),
                }}
                listeners={{
                    tabPress: () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                        DeviceEventEmitter.emit("dietTabPress");
                    },
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: "Ayarlar",
                    tabBarIcon: ({ color, size }) => (
                        <Settings size={size} color={color} strokeWidth={2} />
                    ),
                }}
                listeners={{
                    tabPress: () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    },
                }}
            />
        </Tabs>
    );
}
