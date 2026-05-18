// app/_layout.tsx
import "../global.css";
import React from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { FormProvider } from "../src/context/FormContext";

export default function RootLayout() {
    return (
        <FormProvider>
            <SafeAreaProvider>
                <StatusBar style="dark" translucent={false} backgroundColor="#ffffff" hidden={false} />
                <Stack
                    screenOptions={{
                        headerShown: false,
                    }}
                >
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen
                        name="information"
                        options={{
                            presentation: "modal",
                            headerShown: false,
                            animation: "slide_from_bottom",
                        }}
                    />
                    <Stack.Screen
                        name="contact"
                        options={{
                            presentation: "modal",
                            headerShown: false,
                            animation: "slide_from_bottom",
                        }}
                    />
                </Stack>
            </SafeAreaProvider>
        </FormProvider>
    );
}
