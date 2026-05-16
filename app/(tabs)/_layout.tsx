// app/(tabs)/_layout.tsx
import React from "react";
import { Tabs } from "expo-router";
import { Calculator, UtensilsCrossed, Settings } from "lucide-react-native";
import { useColorScheme } from "react-native";

export default function TabsLayout() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: isDark ? "#818cf8" : "#4f46e5",
                tabBarInactiveTintColor: isDark ? "#64748b" : "#94a3b8",
                tabBarStyle: {
                    backgroundColor: isDark ? "#0f172a" : "#ffffff",
                    borderTopColor: isDark ? "#1e293b" : "#f1f5f9",
                    borderTopWidth: 1,
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 64,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "600",
                    letterSpacing: 0.3,
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
            />
            <Tabs.Screen
                name="diet"
                options={{
                    title: "Diyet Planı",
                    tabBarIcon: ({ color, size }) => (
                        <UtensilsCrossed size={size} color={color} strokeWidth={2} />
                    ),
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
            />
        </Tabs>
    );
}
