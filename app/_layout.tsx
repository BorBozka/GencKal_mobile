// app/_layout.tsx
import "../global.css";
import React from "react";
import { Platform } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider as NavigationThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
import * as SystemUI from "expo-system-ui";
import { FormProvider } from "../src/context/FormContext";
import { ThemeProvider, useTheme } from "../src/context/ThemeContext";

const CustomDarkTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        background: "#020617",
    },
};

const CustomDefaultTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: "#ffffff",
    },
};

function AppContent() {
    const { isDark } = useTheme();

    React.useEffect(() => {
        SystemUI.setBackgroundColorAsync(isDark ? "#020617" : "#ffffff").catch((err) => {
            console.warn("SystemUI set background error: ", err);
        });
    }, [isDark]);

    return (
        <SafeAreaProvider initialWindowMetrics={initialWindowMetrics}>
            <StatusBar style={isDark ? "light" : "dark"} translucent={true} backgroundColor="transparent" hidden={false} />
            <NavigationThemeProvider value={isDark ? CustomDarkTheme : CustomDefaultTheme}>
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: isDark ? "#020617" : "#ffffff" }
                    }}
                >
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen
                        name="information"
                        options={{
                            headerShown: false,
                            gestureEnabled: true,
                        }}
                    />
                    <Stack.Screen
                        name="contact"
                        options={{
                            headerShown: false,
                            gestureEnabled: true,
                        }}
                    />
                </Stack>
            </NavigationThemeProvider>
        </SafeAreaProvider>
    );
}

export default function RootLayout() {
    return (
        <ThemeProvider>
            <FormProvider>
                <AppContent />
            </FormProvider>
        </ThemeProvider>
    );
}
