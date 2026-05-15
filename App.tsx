import "./global.css";
import React, { useState, useCallback } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { KullaniciProfil } from "./src/types";
import DashboardScreen from "./src/screens/DashboardScreen";
import DietScreen from "./src/screens/DietScreen";

type Screen = "dashboard" | "diet";

export default function App() {
    const [currentScreen, setCurrentScreen] = useState<Screen>("dashboard");
    const [formData, setFormData] = useState<KullaniciProfil | null>(null);
    const [tdee, setTdee] = useState(0);

    const handleNavigateToDiet = useCallback((data: KullaniciProfil, calculatedTdee: number) => {
        setFormData(data);
        setTdee(calculatedTdee);
        setCurrentScreen("diet");
    }, []);

    const handleBack = useCallback(() => {
        setCurrentScreen("dashboard");
    }, []);

    const handleUpdateFormData = useCallback((data: KullaniciProfil) => {
        setFormData(data);
    }, []);

    return (
        <SafeAreaProvider>
            {currentScreen === "dashboard" ? (
                <DashboardScreen onNavigateToDiet={handleNavigateToDiet} />
            ) : formData ? (
                <DietScreen
                    formData={formData}
                    tdee={tdee}
                    onBack={handleBack}
                    onUpdateFormData={handleUpdateFormData}
                />
            ) : null}
        </SafeAreaProvider>
    );
}
