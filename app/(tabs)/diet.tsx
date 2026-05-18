// app/(tabs)/diet.tsx
import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Modal from "react-native-modal";
import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { useFormContext } from "../../src/context/FormContext";
import { calculateMacroGrams } from "../../src/utils/calculations";
import TDEECalculatorPanel from "../../src/components/TDEECalculatorPanel";

export default function DietTab() {
    const { formData, setFizikselAlan, setDiyetAlan, calculatedTDEE } = useFormContext();

    const activeHedef = formData.diyetVerileri.hedef;

    // Exact state architecture as requested by the specifications
    const [activePlan, setActivePlan] = useState<'Bulk' | 'Maintain' | 'Cut'>(
        activeHedef === "kilo_al" ? "Bulk" : activeHedef === "kilo_ver" ? "Cut" : "Maintain"
    );
    const [selectedPlanForModal, setSelectedPlanForModal] = useState<'Bulk' | 'Maintain' | 'Cut' | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Dynamic color configurations mapped structurally
    const plans = useMemo(() => [
        {
            id: "Bulk" as const,
            name: "Kilo Al (Bulk)",
            calories: calculatedTDEE + 500,
            iconName: "trending-up",
            iconColor: "#2563eb", // Royal Blue
            macros: { protein: 25, carb: 50, fat: 25 }
        },
        {
            id: "Maintain" as const,
            name: "Kilo Koru (Maintain)",
            calories: calculatedTDEE,
            iconName: "target",
            iconColor: "#059669", // Emerald Green
            macros: { protein: 30, carb: 40, fat: 30 }
        },
        {
            id: "Cut" as const,
            name: "Kilo Ver (Cut)",
            calories: calculatedTDEE - 500,
            iconName: "trending-down",
            iconColor: "#dc2626", // Crimson Red
            macros: { protein: 35, carb: 35, fat: 30 }
        },
    ], [calculatedTDEE]);

    // Calculates custom dynamic macro grams for the selected plan in the modal
    const getSelectedPlanMacros = () => {
        if (!selectedPlanForModal) return { proteinGrams: 0, proteinPerc: 0, carbGrams: 0, carbPerc: 0, fatGrams: 0, fatPerc: 0 };
        const calories = selectedPlanForModal === 'Bulk' ? calculatedTDEE + 500 : selectedPlanForModal === 'Cut' ? calculatedTDEE - 500 : calculatedTDEE;
        const pPerc = selectedPlanForModal === 'Bulk' ? 25 : selectedPlanForModal === 'Cut' ? 35 : 30;
        const cPerc = selectedPlanForModal === 'Bulk' ? 50 : selectedPlanForModal === 'Cut' ? 35 : 40;
        const fPerc = selectedPlanForModal === 'Bulk' ? 25 : selectedPlanForModal === 'Cut' ? 30 : 30;

        return {
            proteinGrams: calculateMacroGrams(calories, pPerc, 'protein'),
            proteinPerc: pPerc,
            carbGrams: calculateMacroGrams(calories, cPerc, 'carb'),
            carbPerc: cPerc,
            fatGrams: calculateMacroGrams(calories, fPerc, 'fat'),
            fatPerc: fPerc
        };
    };

    const macros = getSelectedPlanMacros();

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
            {/* Disable native sticky header for this screen */}
            <Tabs.Screen options={{ headerShown: false }} />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 16,
                    paddingBottom: 40
                }}
                keyboardShouldPersistTaps="handled"
            >
                {/* 1. Inline Logo Brand Header (Official desktop logo) */}
                <View style={{ alignItems: "center", marginTop: 16, marginBottom: 24 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
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

                {/* 2. Üst Panel: Kompakt Veri Girişi */}
                <View className="mb-8" style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 2 }}>
                    <TDEECalculatorPanel
                        data={formData.fizikselVeriler}
                        setField={setFizikselAlan}
                    />
                </View>

                {/* 3. Hero Metrik: Günlük Kalori İhtiyacı */}
                <View style={{ alignItems: "center", marginTop: 24, marginBottom: 32 }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: "#94a3b8", marginBottom: 8, letterSpacing: 1.5, textTransform: "uppercase" }}>
                        GÜNLÜK KALORİ İHTİYACINIZ
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "center" }}>
                        <Text style={{ fontSize: 56, fontWeight: "800", color: "#1e1b4b" }}>
                            {calculatedTDEE}
                        </Text>
                        <Text style={{ fontSize: 24, fontWeight: "600", color: "#64748b", marginLeft: 6 }}>
                            kcal
                        </Text>
                    </View>
                </View>

                {/* 4. Diyet Planları Bölümü */}
                <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: "#94a3b8", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16, marginLeft: 2 }}>
                        ÖNERİLEN DİYET PLANLARI
                    </Text>

                    {plans.map((plan) => {
                        const isActive = activePlan === plan.id;
                        const isMaintain = plan.id === 'Maintain';
                        
                        return (
                            <View
                                key={plan.id}
                                style={{
                                    backgroundColor: "#ffffff",
                                    borderRadius: 24,
                                    padding: 20,
                                    marginBottom: 16,
                                    borderWidth: 1,
                                    borderColor: "#f1f5f9",
                                    shadowColor: "#0f172a",
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.03,
                                    shadowRadius: 12,
                                    elevation: 2
                                }}
                            >
                                {/* Statically render "MEVCUT DURUM" badge on the Maintain card */}
                                {isMaintain && (
                                    <View
                                        style={{
                                            backgroundColor: "#e6fbf2",
                                            paddingHorizontal: 12,
                                            paddingVertical: 4,
                                            borderRadius: 99,
                                            marginBottom: 12,
                                            alignSelf: "flex-start"
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: "#047857",
                                                fontSize: 10,
                                                fontWeight: "800",
                                                letterSpacing: 0.5,
                                                textTransform: "uppercase"
                                            }}
                                        >
                                            MEVCUT DURUM
                                        </Text>
                                    </View>
                                )}

                                {/* Kart Başlığı ve İkon */}
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                    <Text style={{ fontSize: 18, fontWeight: "700", color: "#0f172a" }}>
                                        {plan.name}
                                    </Text>
                                    <Feather name={plan.iconName as any} size={28} color={plan.iconColor} />
                                </View>

                                {/* Kalori Değeri */}
                                <View style={{ flexDirection: "row", alignItems: "baseline", marginBottom: 16 }}>
                                    <Text style={{ fontSize: 28, fontWeight: "800", color: plan.iconColor }}>
                                        {plan.calories}
                                    </Text>
                                    <Text style={{ fontSize: 14, fontWeight: "500", color: "#94a3b8", marginLeft: 6 }}>
                                        kcal
                                    </Text>
                                </View>

                                {/* Dynamic CTA Button */}
                                {isActive ? (
                                    <TouchableOpacity
                                        style={{
                                            backgroundColor: plan.iconColor,
                                            paddingVertical: 12,
                                            borderRadius: 14,
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}
                                        activeOpacity={0.85}
                                        onPress={() => {
                                            setSelectedPlanForModal(plan.id);
                                            setIsModalVisible(true);
                                        }}
                                    >
                                        <Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 14 }}>
                                            Bu Planı Seç
                                        </Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        style={{
                                            borderColor: plan.iconColor,
                                            borderWidth: 1.5,
                                            paddingVertical: 12,
                                            borderRadius: 14,
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}
                                        activeOpacity={0.85}
                                        onPress={() => {
                                            setSelectedPlanForModal(plan.id);
                                            setIsModalVisible(true);
                                        }}
                                    >
                                        <Text style={{ color: plan.iconColor, fontWeight: "700", fontSize: 14 }}>
                                            Bu Planı Seç
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Layout-Safe Bottom Sheet Modal */}
            <Modal
                isVisible={isModalVisible}
                onBackdropPress={() => setIsModalVisible(false)}
                onBackButtonPress={() => setIsModalVisible(false)}
                onSwipeComplete={() => setIsModalVisible(false)}
                swipeDirection="down"
                propagateSwipe={true}
                style={{ margin: 0, justifyContent: 'flex-end' }}
                backdropColor="black"
                backdropOpacity={0.4}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                animationInTiming={350}
                animationOutTiming={300}
                backdropTransitionInTiming={350}
                backdropTransitionOutTiming={300}
                statusBarTranslucent={true}
                deviceHeight={undefined}
                deviceWidth={undefined}
            >
                {/* Bottom Sheet Container */}
                <View
                    style={{
                        backgroundColor: "#ffffff",
                        borderTopLeftRadius: 32,
                        borderTopRightRadius: 32,
                        paddingHorizontal: 24,
                        paddingTop: 8,
                        paddingBottom: 40,
                        width: "100%"
                    }}
                >
                    {/* Visual Handlebar Indicator */}
                    <View style={{ width: 44, height: 4.5, backgroundColor: "#e2e8f0", borderRadius: 99, alignSelf: "center", marginTop: 8, marginBottom: 24 }} />

                    {/* Title & Calories */}
                    <Text style={{ fontSize: 24, fontWeight: "800", color: "#0f172a", marginBottom: 6 }}>
                        {selectedPlanForModal === 'Bulk' ? 'Kilo Al (Bulk)' : selectedPlanForModal === 'Cut' ? 'Kilo Ver (Cut)' : 'Kilo Koru (Maintain)'}
                    </Text>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: "#4338ca", marginBottom: 24 }}>
                        {selectedPlanForModal === 'Bulk' ? calculatedTDEE + 500 : selectedPlanForModal === 'Cut' ? calculatedTDEE - 500 : calculatedTDEE}
                        <Text style={{ fontSize: 14, fontWeight: "500", color: "#64748b" }}> kcal / gün</Text>
                    </Text>

                    {/* Macros Section Header */}
                    <Text style={{ fontSize: 11, fontWeight: "700", color: "#94a3b8", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16 }}>
                        GÜNLÜK MAKRO DAĞILIMI
                    </Text>

                    {/* Progress Rows */}
                    {/* 1. Protein Row */}
                    <View style={{ marginBottom: 18 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <Text style={{ fontSize: 15, fontWeight: "700", color: "#0f172a" }}>Protein</Text>
                            <Text style={{ fontSize: 15, fontWeight: "800", color: "#0f172a" }}>
                                {macros.proteinGrams}g{" "}
                                <Text style={{ fontSize: 13, fontWeight: "500", color: "#94a3b8" }}>
                                    ({macros.proteinPerc}%)
                                </Text>
                            </Text>
                        </View>
                        <View style={{ width: "100%", height: 8, backgroundColor: "#f1f5f9", borderRadius: 99 }}>
                            <View style={{ height: "100%", width: `${macros.proteinPerc}%`, backgroundColor: "#f43f5e", borderRadius: 99 }} />
                        </View>
                    </View>

                    {/* 2. Carbs Row */}
                    <View style={{ marginBottom: 18 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <Text style={{ fontSize: 15, fontWeight: "700", color: "#0f172a" }}>Karbonhidrat</Text>
                            <Text style={{ fontSize: 15, fontWeight: "800", color: "#0f172a" }}>
                                {macros.carbGrams}g{" "}
                                <Text style={{ fontSize: 13, fontWeight: "500", color: "#94a3b8" }}>
                                    ({macros.carbPerc}%)
                                </Text>
                            </Text>
                        </View>
                        <View style={{ width: "100%", height: 8, backgroundColor: "#f1f5f9", borderRadius: 99 }}>
                            <View style={{ height: "100%", width: `${macros.carbPerc}%`, backgroundColor: "#2563eb", borderRadius: 99 }} />
                        </View>
                    </View>

                    {/* 3. Fat Row */}
                    <View style={{ marginBottom: 28 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <Text style={{ fontSize: 15, fontWeight: "700", color: "#0f172a" }}>Yağ</Text>
                            <Text style={{ fontSize: 15, fontWeight: "800", color: "#0f172a" }}>
                                {macros.fatGrams}g{" "}
                                <Text style={{ fontSize: 13, fontWeight: "500", color: "#94a3b8" }}>
                                    ({macros.fatPerc}%)
                                </Text>
                            </Text>
                        </View>
                        <View style={{ width: "100%", height: 8, backgroundColor: "#f1f5f9", borderRadius: 99 }}>
                            <View style={{ height: "100%", width: `${macros.fatPerc}%`, backgroundColor: "#eab308", borderRadius: 99 }} />
                        </View>
                    </View>

                    {/* Modal Action Button */}
                    <TouchableOpacity
                        style={{
                            backgroundColor: "#059669",
                            paddingVertical: 14,
                            borderRadius: 16,
                            alignItems: "center",
                            justifyContent: "center",
                            shadowColor: "#059669",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.12,
                            shadowRadius: 8,
                            elevation: 3
                        }}
                        activeOpacity={0.9}
                        onPress={() => {
                            if (selectedPlanForModal) {
                                setActivePlan(selectedPlanForModal);
                                let actualTarget: "kilo_al" | "kilo_koruma" | "kilo_ver" = "kilo_koruma";
                                if (selectedPlanForModal === "Bulk") actualTarget = "kilo_al";
                                else if (selectedPlanForModal === "Cut") actualTarget = "kilo_ver";
                                setDiyetAlan("hedef", actualTarget);
                            }
                            setIsModalVisible(false);
                        }}
                    >
                        <Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 16 }}>
                            Planı Onayla ve Başla
                        </Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </SafeAreaView>
    );
}