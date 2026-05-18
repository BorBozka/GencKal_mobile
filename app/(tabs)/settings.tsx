// app/(tabs)/settings.tsx
// Premium iOS-Style Ayarlar Sekmesi (Aydınlık tema kilidi uygulanmış)
import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function SettingsTab() {
    const router = useRouter();
    
    // Görünüm seçimi için görsel aktif durumları yöneten yerel durum (DUMMY STATE)
    const [activeTheme, setActiveTheme] = useState<"aydinlik" | "karanlik" | "sistem">("sistem");

    const themeOptions = [
        { key: "aydinlik" as const, label: "Aydınlık", icon: "sunny-outline" as const },
        { key: "karanlik" as const, label: "Karanlık", icon: "moon-outline" as const },
        { key: "sistem" as const, label: "Sistem", icon: "phone-portrait-outline" as const }
    ];

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
                    paddingBottom: 140 // Tab bar koruması için ekstra alt boşluk
                }}
            >
                {/* 1. Brand Logo & Header Bölümü */}
                <View style={{ alignItems: "flex-start", marginTop: 8, marginBottom: 28 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                            <View style={{ width: 4, height: 12, borderRadius: 2, backgroundColor: "#4338ca" }} />
                            <View style={{ width: 4, height: 20, borderRadius: 2, backgroundColor: "#4338ca" }} />
                            <View style={{ width: 4, height: 12, borderRadius: 2, backgroundColor: "#4338ca" }} />
                        </View>
                        <Text style={{ fontSize: 18, fontWeight: "800", color: "#4338ca", letterSpacing: -0.3 }}>
                            GencKal
                        </Text>
                    </View>
                    
                    <Text className="text-[28px] font-bold text-slate-900 tracking-tight">
                        Ayarlar
                    </Text>
                    <Text className="text-sm text-slate-500 font-light mt-1">
                        Uygulama tercihleri ve bilgilendirme
                    </Text>
                </View>

                {/* 2. GÖRÜNÜM (Appearance Section) */}
                <View className="mb-8">
                    <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1">
                        GÖRÜNÜM
                    </Text>
                    <View style={{ backgroundColor: "#f1f5f9", padding: 4, flexDirection: "row", borderRadius: 16 }}>
                        {themeOptions.map((option) => {
                            const isActive = activeTheme === option.key;
                            return (
                                <TouchableOpacity
                                    key={option.key}
                                    onPress={() => setActiveTheme(option.key)}
                                    activeOpacity={0.85}
                                    style={{
                                        flex: 1,
                                        paddingVertical: 10,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 6,
                                        backgroundColor: isActive ? "#ffffff" : "transparent",
                                        borderRadius: 12,
                                        // Shadow for active item
                                        shadowColor: isActive ? "#000000" : "transparent",
                                        shadowOffset: isActive ? { width: 0, height: 1 } : { width: 0, height: 0 },
                                        shadowOpacity: isActive ? 0.08 : 0,
                                        shadowRadius: isActive ? 2 : 0,
                                        elevation: isActive ? 1 : 0
                                    }}
                                >
                                    <Ionicons
                                        name={option.icon}
                                        size={15}
                                        color={isActive ? "#4338ca" : "#64748b"}
                                    />
                                    <Text
                                        style={{
                                            fontSize: 13,
                                            fontWeight: isActive ? "700" : "500",
                                            color: isActive ? "#4338ca" : "#64748b"
                                        }}
                                    >
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* 3. DESTEK & UYGULAMA (Support Section) */}
                <View className="mb-8">
                    <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1">
                        DESTEK & UYGULAMA
                    </Text>
                    <View style={{ backgroundColor: "#f8fafc", borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: "#f1f5f9" }}>
                        {/* Satır 1: Bilgilendirme */}
                        <TouchableOpacity
                            onPress={() => router.push("/information")}
                            activeOpacity={0.6}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                paddingHorizontal: 20,
                                paddingVertical: 14
                            }}
                        >
                            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                                <View style={{ width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#eef2ff", marginRight: 14 }}>
                                    <Ionicons name="book-outline" size={18} color="#4338ca" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 15, fontWeight: "600", color: "#1e293b" }}>
                                        Bilgilendirme
                                    </Text>
                                    <Text style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                                        BMI, FFMI ve sağlık bilgileri
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
                        </TouchableOpacity>

                        {/* İndentasyonlu Zarif Ara Çizgi (Divider) */}
                        <View style={{ height: 1, backgroundColor: "#f1f5f9", marginLeft: 70 }} />

                        {/* Satır 2: İletişim */}
                        <TouchableOpacity
                            onPress={() => router.push("/contact")}
                            activeOpacity={0.6}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                paddingHorizontal: 20,
                                paddingVertical: 14
                            }}
                        >
                            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                                <View style={{ width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#eef2ff", marginRight: 14 }}>
                                    <Ionicons name="mail-outline" size={18} color="#4338ca" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 15, fontWeight: "600", color: "#1e293b" }}>
                                        İletişim
                                    </Text>
                                    <Text style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                                        E-posta ve sosyal medya
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 4. BİLGI ALT YAZISI (VERSION FOOTER) */}
                <View style={{ alignItems: "center", marginTop: 48, marginBottom: 16 }}>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: "#94a3b8", letterSpacing: 0.5 }}>
                        Versiyon 1.0.0
                    </Text>
                    <Text style={{ fontSize: 11, color: "#cbd5e1", marginTop: 4 }}>
                        © 2026 GencKal
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
