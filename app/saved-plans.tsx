import React, { useCallback, useRef, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import BrandLogo from "../src/components/BrandLogo";
import { useAuth } from "../src/context/AuthContext";
import { useTheme } from "../src/context/ThemeContext";
import { useAppDialog } from "../src/context/AppDialogContext";
import { deleteSavedDietPlan, fetchSavedDietPlan, fetchSavedDietPlans } from "../src/services/savedPlansApi";
import type { SavedDietPlan, SavedDietPlanSummary } from "../src/types/diet";

function formatDate(value: string) {
    return new Intl.DateTimeFormat("tr-TR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

export default function SavedPlansScreen() {
    const router = useRouter();
    const { user, token, authHeaders } = useAuth();
    const { isDark, colors } = useTheme();
    const { showDialog } = useAppDialog();
    const [plans, setPlans] = useState<SavedDietPlanSummary[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<SavedDietPlan | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [isFetchingDetail, setIsFetchingDetail] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const selectedPlanIdRef = useRef<string | null>(null);

    const loadPlans = useCallback(async () => {
        if (!token) return;
        setIsFetching(true);
        try {
            setPlans(await fetchSavedDietPlans(authHeaders()));
        } catch (error) {
            showDialog({
                title: "Planlar yüklenemedi",
                message: error instanceof Error ? error.message : "Liste alınamadı.",
                icon: "alert-circle-outline",
            });
        } finally {
            setIsFetching(false);
        }
    }, [authHeaders, showDialog, token]);

    const togglePlanDetail = async (id: string) => {
        if (!token) return;
        if (selectedPlanId === id) {
            selectedPlanIdRef.current = null;
            setSelectedPlanId(null);
            setSelectedPlan(null);
            return;
        }

        selectedPlanIdRef.current = id;
        setSelectedPlanId(id);
        setSelectedPlan(null);
        setIsFetchingDetail(true);
        try {
            const plan = await fetchSavedDietPlan(id, authHeaders());
            if (selectedPlanIdRef.current === id) {
                setSelectedPlan(plan);
            }
        } catch (error) {
            if (selectedPlanIdRef.current === id) {
                selectedPlanIdRef.current = null;
                setSelectedPlanId(null);
                showDialog({
                    title: "Plan detayı açılamadı",
                    message: error instanceof Error ? error.message : "Detay alınamadı.",
                    icon: "alert-circle-outline",
                });
            }
        } finally {
            if (selectedPlanIdRef.current === id) {
                setIsFetchingDetail(false);
            }
        }
    };

    const deletePlan = async (planId: string) => {
        if (!token) return;
        showDialog({
            title: "Plan silinsin mi?",
            message: "Bu diyet planı kalıcı olarak silinecek.",
            icon: "trash-outline",
            actions: [
                { label: "Vazgeç", style: "cancel" },
                {
                    label: "Sil",
                    style: "destructive",
                    onPress: async () => {
                        setIsDeleting(true);
                        try {
                            await deleteSavedDietPlan(planId, authHeaders());
                            setPlans((current) => current.filter((plan) => plan.id !== planId));
                            if (selectedPlanIdRef.current === planId) {
                                selectedPlanIdRef.current = null;
                            }
                            setSelectedPlanId((current) => current === planId ? null : current);
                            setSelectedPlan((current) => current?.id === planId ? null : current);
                        } catch (error) {
                            showDialog({
                                title: "Plan silinemedi",
                                message: error instanceof Error ? error.message : "Silme işlemi tamamlanamadı.",
                                icon: "alert-circle-outline",
                            });
                        } finally {
                            setIsDeleting(false);
                        }
                    },
                },
            ],
        });
    };

    useFocusEffect(
        useCallback(() => {
            if (token) {
                loadPlans();
            }
        }, [loadPlans, token])
    );

    const renderSelectedPlanDetails = () => {
        if (!selectedPlan) {
            if (!isFetchingDetail) return null;
            return (
                <View style={{
                    borderTopWidth: 1,
                    borderTopColor: isDark ? "#1e293b" : "#e2e8f0",
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                }}>
                    <Text style={{ color: isDark ? "#94a3b8" : "#64748b", fontWeight: "700" }}>
                        Detay yükleniyor...
                    </Text>
                </View>
            );
        }

        return (
            <View style={{
                borderTopWidth: 1,
                borderTopColor: isDark ? "#1e293b" : "#e2e8f0",
                paddingHorizontal: 16,
                paddingTop: 16,
                paddingBottom: 16,
            }}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                    <MacroBox label="P" value={selectedPlan.macros.protein} color="#dc2626" />
                    <MacroBox label="Y" value={selectedPlan.macros.fat} color="#d97706" />
                    <MacroBox label="K" value={selectedPlan.macros.carb} color="#2563eb" />
                </View>

                <View style={{ marginTop: 16, gap: 14 }}>
                    {selectedPlan.meals.map((meal, mealIndex) => (
                        <View key={`${meal.title}-${mealIndex}`} style={{ borderRadius: 18, backgroundColor: isDark ? "#020617" : "#f8fafc", padding: 14 }}>
                            <Text style={{ fontSize: 15, fontWeight: "800", color: isDark ? "#f1f5f9" : "#0f172a" }}>{meal.title}</Text>
                            <View style={{ marginTop: 8 }}>
                                {meal.items.map((item, itemIndex) => (
                                    <View key={`${item.name}-${itemIndex}`} style={{ paddingVertical: 10, borderTopWidth: itemIndex === 0 ? 0 : 1, borderTopColor: isDark ? "#1e293b" : "#e2e8f0" }}>
                                        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
                                            <Text style={{ flex: 1, color: isDark ? "#cbd5e1" : "#334155", fontWeight: "700", lineHeight: 20 }}>{item.fullText}</Text>
                                            <Text style={{ color: "#94a3b8", fontWeight: "800" }}>{item.cal} kcal</Text>
                                        </View>
                                        <Text style={{ marginTop: 4, color: "#94a3b8", fontSize: 12, fontWeight: "700" }}>
                                            P {item.macros.protein}g · Y {item.macros.fat}g · K {item.macros.carb}g
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    if (!user) {
        return (
            <View style={{ flex: 1, backgroundColor: isDark ? "#020617" : "#ffffff" }}>
                <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
                    <View style={{ padding: 20 }}>
                        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 24 }}>
                            <Ionicons name="chevron-back" size={20} color={isDark ? "#94a3b8" : "#64748b"} />
                            <Text style={{ color: isDark ? "#94a3b8" : "#64748b", fontWeight: "700" }}>Geri</Text>
                        </TouchableOpacity>
                        <View style={{ padding: 24, borderRadius: 24, backgroundColor: isDark ? "#0f172a" : "#f8fafc", alignItems: "center" }}>
                            <Text style={{ fontSize: 22, fontWeight: "800", color: isDark ? "#f1f5f9" : "#0f172a", textAlign: "center" }}>
                                Giriş yapmanız gerekmektedir
                            </Text>
                            <Text style={{ marginTop: 10, color: isDark ? "#94a3b8" : "#64748b", textAlign: "center", lineHeight: 22 }}>
                                Kayıtlı diyet planlarınızı görmek için hesabınıza giriş yapın.
                            </Text>
                            <TouchableOpacity
                                onPress={() => router.push("/auth?returnTo=saved-plans")}
                                style={{ marginTop: 20, paddingVertical: 14, paddingHorizontal: 22, borderRadius: 16, backgroundColor: isDark ? colors.brandDark : colors.primary }}
                            >
                                <Text style={{ color: "#ffffff", fontWeight: "800" }}>Giriş Yap</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? "#020617" : "#ffffff" }}>
            <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 48 }}
                >
                    <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 }}>
                        <Ionicons name="chevron-back" size={20} color={isDark ? "#94a3b8" : "#64748b"} />
                        <Text style={{ color: isDark ? "#94a3b8" : "#64748b", fontWeight: "700" }}>Geri</Text>
                    </TouchableOpacity>

                    <BrandLogo />

                    <View style={{ marginTop: 16, marginBottom: 22 }}>
                        <Text style={{ fontSize: 28, fontWeight: "800", color: isDark ? "#f1f5f9" : "#0f172a" }}>
                            Diyet Planlarım
                        </Text>
                    </View>

                    <View style={{ gap: 12 }}>
                        {isFetching ? (
                            <Text style={{ color: isDark ? "#94a3b8" : "#64748b", fontWeight: "700" }}>Planlar yükleniyor...</Text>
                        ) : plans.length === 0 ? (
                            <View style={{ padding: 20, borderRadius: 20, backgroundColor: isDark ? "#0f172a" : "#f8fafc" }}>
                                <Text style={{ color: isDark ? "#94a3b8" : "#64748b", lineHeight: 22 }}>
                                    Henüz kaydedilmiş diyet planınız yok.
                                </Text>
                            </View>
                        ) : plans.map((plan) => {
                            const isSelected = selectedPlanId === plan.id;
                            return (
                            <View
                                key={plan.id}
                                style={{
                                    borderWidth: 1,
                                    borderColor: isDark ? "#1e293b" : "#f1f5f9",
                                    backgroundColor: isDark ? "#0f172a" : "#ffffff",
                                    borderRadius: 20,
                                    overflow: "hidden",
                                }}
                            >
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 16 }}>
                                    <TouchableOpacity
                                        onPress={() => togglePlanDetail(plan.id)}
                                        activeOpacity={0.75}
                                        style={{ flex: 1 }}
                                    >
                                        <Text style={{ fontSize: 16, fontWeight: "800", color: isDark ? "#f1f5f9" : "#0f172a" }}>{plan.title}</Text>
                                        <View style={{ marginTop: 10, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                                            <Text style={{ fontSize: 12, fontWeight: "800", color: isDark ? colors.primaryDark : colors.primary }}>{plan.targetCalories} kcal</Text>
                                            <Text style={{ fontSize: 12, fontWeight: "700", color: "#94a3b8" }}>{plan.mealsPerDay} öğün</Text>
                                            <Text style={{ fontSize: 12, fontWeight: "700", color: "#94a3b8" }}>{formatDate(plan.createdAt)}</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => deletePlan(plan.id)}
                                        disabled={isDeleting}
                                        activeOpacity={0.7}
                                        style={{ width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: isDark ? "rgba(239,68,68,0.16)" : "#fee2e2" }}
                                    >
                                        <Ionicons name="trash-outline" size={19} color="#dc2626" />
                                    </TouchableOpacity>
                                </View>
                                {isSelected && renderSelectedPlanDetails()}
                            </View>
                        ); })}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

function MacroBox({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <View style={{ flex: 1, borderRadius: 14, backgroundColor: "rgba(148,163,184,0.12)", padding: 12, alignItems: "center" }}>
            <Text style={{ color, fontWeight: "900", fontSize: 16 }}>{value}g</Text>
            <Text style={{ color: "#94a3b8", fontWeight: "800", fontSize: 11, marginTop: 2 }}>{label}</Text>
        </View>
    );
}
