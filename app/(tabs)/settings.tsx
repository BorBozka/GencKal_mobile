// app/(tabs)/settings.tsx
// Ayarlar & Bilgi sekmesi (Aydınlık tema kilidi uygulanmış)
import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";

export default function SettingsTab() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
            {/* Disable native sticky header for this screen */}
            <Tabs.Screen options={{ headerShown: false }} />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 24,
                    paddingBottom: 40
                }}
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

                {/* Header */}
                <View className="mb-8">
                    <Text className="text-[28px] font-bold text-slate-900 tracking-tight">
                        Ayarlar
                    </Text>
                    <Text className="text-sm text-slate-500 font-light mt-1">
                        Uygulama tercihleri ve bilgilendirme
                    </Text>
                </View>

                {/* Hakkında Bölümü */}
                <View className="mb-8">
                    <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                        Hakkında
                    </Text>
                    <View className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                        <TouchableOpacity
                            onPress={() => router.push("/information")}
                            activeOpacity={0.6}
                            className="flex-row items-center justify-between px-5 py-4 border-b border-slate-100"
                        >
                            <View className="flex-row items-center gap-3">
                                <View className="w-9 h-9 rounded-xl items-center justify-center bg-emerald-100">
                                    <Feather name="book-open" size={18} color="#059669" />
                                </View>
                                <View>
                                    <Text className="text-base font-semibold text-slate-700">
                                        Bilgilendirme
                                    </Text>
                                    <Text className="text-xs text-slate-400 mt-0.5">
                                        BMI, FFMI ve sağlık bilgileri
                                    </Text>
                                </View>
                            </View>
                            <Feather name="chevron-right" size={20} color="#94a3b8" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push("/contact")}
                            activeOpacity={0.6}
                            className="flex-row items-center justify-between px-5 py-4"
                        >
                            <View className="flex-row items-center gap-3">
                                <View className="w-9 h-9 rounded-xl items-center justify-center bg-blue-100">
                                    <Feather name="mail" size={18} color="#2563eb" />
                                </View>
                                <View>
                                    <Text className="text-base font-semibold text-slate-700">
                                        İletişim
                                    </Text>
                                    <Text className="text-xs text-slate-400 mt-0.5">
                                        E-posta ve sosyal medya
                                    </Text>
                                </View>
                            </View>
                            <Feather name="chevron-right" size={20} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Uygulama Bilgisi */}
                <View className="items-center pt-8 pb-4">
                    <View className="flex-row items-center gap-2 mb-2">
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                            <View style={{ width: 3.5, height: 10, borderRadius: 2, backgroundColor: "#4338ca" }} />
                            <View style={{ width: 3.5, height: 16, borderRadius: 2, backgroundColor: "#4338ca" }} />
                            <View style={{ width: 3.5, height: 10, borderRadius: 2, backgroundColor: "#4338ca" }} />
                        </View>
                        <Text style={{ fontSize: 15, fontWeight: "700", color: "#4338ca", letterSpacing: -0.3 }}>
                            genckalculator
                        </Text>
                    </View>
                    <Text className="text-xs text-slate-400 font-medium">
                        Versiyon 1.0.0
                    </Text>
                    <Text className="text-[10px] text-slate-300 mt-1">
                        © {new Date().getFullYear()} GençKal Calculator
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
