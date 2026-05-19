// app/contact.tsx
// İletişim modalı — Aydınlık tema kilidi uygulanmış
import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../src/context/ThemeContext";

// 2.6: Tüm marka referansları tek bir yerde — tutarlılık için
const BRAND = {
    email: "info@genckalculator.com",
    twitterHandle: "@genckalculator",
    twitterUrl: "https://twitter.com/genckalculator",
    instagramHandle: "@genckalculator",
    instagramUrl: "https://instagram.com/genckalculator",
} as const;

export default function ContactScreen() {
    const router = useRouter();
    const { isDark, colors } = useTheme();
    const insets = useSafeAreaInsets();

    // 3.7: Tek bir genel yardımcı — üç duplicate handler yerine
    const openLink = async (url: string, errorTitle = "Bağlantı Açılamıyor") => {
        try {
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                await Linking.openURL(url);
            } else {
                Alert.alert(errorTitle, "Uygulama veya tarayıcı açılamadı.");
            }
        } catch {
            Alert.alert("Hata", "Bağlantı açma işlemi başarısız oldu.");
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? "#020617" : "#ffffff", paddingTop: insets.top }}>
            {/* Header */}
            <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderBottomColor: isDark ? "#1e293b" : "#f1f5f9" }}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={{ width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: isDark ? "#1e293b" : "#f1f5f9" }}
                >
                    <Ionicons name="chevron-back" size={20} color={isDark ? "#94a3b8" : "#64748b"} />
                </TouchableOpacity>
                <Text style={{ fontSize: 18, fontWeight: "800", color: isDark ? "#f1f5f9" : "#0f172a" }}>
                    İletişim
                </Text>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 48 }}
            >
                {/* Hero Section */}
                <View style={{ alignItems: "center", marginBottom: 32 }}>
                    <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: isDark ? colors.lightAccentDark : colors.lightAccent, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                        <Ionicons name="chatbubble-ellipses" size={32} color={isDark ? colors.primaryDark : colors.primary} />
                    </View>
                    <Text style={{ fontSize: 24, fontWeight: "800", color: isDark ? "#f1f5f9" : "#0f172a", textAlign: "center", marginBottom: 6 }}>
                        Bize Ulaşın
                    </Text>
                    <Text style={{ fontSize: 14, color: isDark ? "#94a3b8" : "#64748b", textAlign: "center", lineHeight: 22, paddingHorizontal: 16 }}>
                        Sorularınız, önerileriniz veya geri bildirimleriniz için aşağıdaki kanallardan bizimle iletişime geçebilirsiniz.
                    </Text>
                </View>

                {/* Tek ve Bütünleşik İletişim Kartı */}
                <View className="mb-8">
                    <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1">
                        İLETİŞİM KANALLARI
                    </Text>

                    <View style={{ backgroundColor: isDark ? "#0f172a" : "#f8fafc", borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: isDark ? "#1e293b" : "#f1f5f9" }}>
                        {/* Satır 1: E-posta */}
                        <TouchableOpacity
                            onPress={() => openLink(`mailto:${BRAND.email}`, "E-posta Gönderilemiyor")}
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
                                <View style={{ width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: isDark ? colors.lightAccentDark : colors.lightAccent, marginRight: 14 }}>
                                    <Ionicons name="mail-outline" size={18} color={isDark ? colors.primaryDark : colors.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 15, fontWeight: "600", color: isDark ? "#f1f5f9" : "#1e293b" }}>
                                        E-posta
                                    </Text>
                                    <Text style={{ fontSize: 12, color: isDark ? "#64748b" : "#94a3b8", marginTop: 2 }}>
                                        {BRAND.email}
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="open-outline" size={16} color="#94a3b8" />
                        </TouchableOpacity>

                        {/* İndentasyonlu Bölücü Çizgi */}
                        <View style={{ height: 1, backgroundColor: isDark ? "#1e293b" : "#f1f5f9", marginLeft: 70 }} />

                        {/* Satır 2: Twitter */}
                        <TouchableOpacity
                            onPress={() => openLink(BRAND.twitterUrl)}
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
                                <View style={{ width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: isDark ? colors.lightAccentDark : colors.lightAccent, marginRight: 14 }}>
                                    <Ionicons name="logo-twitter" size={18} color={isDark ? colors.primaryDark : colors.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 15, fontWeight: "600", color: isDark ? "#f1f5f9" : "#1e293b" }}>
                                        Twitter
                                    </Text>
                                    <Text style={{ fontSize: 12, color: isDark ? "#64748b" : "#94a3b8", marginTop: 2 }}>
                                        {BRAND.twitterHandle}
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="open-outline" size={16} color="#94a3b8" />
                        </TouchableOpacity>

                        {/* İndentasyonlu Bölücü Çizgi */}
                        <View style={{ height: 1, backgroundColor: isDark ? "#1e293b" : "#f1f5f9", marginLeft: 70 }} />

                        {/* Satır 3: Instagram */}
                        <TouchableOpacity
                            onPress={() => openLink(BRAND.instagramUrl)}
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
                                <View style={{ width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: isDark ? colors.lightAccentDark : colors.lightAccent, marginRight: 14 }}>
                                    <Ionicons name="logo-instagram" size={18} color={isDark ? colors.primaryDark : colors.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 15, fontWeight: "600", color: isDark ? "#f1f5f9" : "#1e293b" }}>
                                        Instagram
                                    </Text>
                                    <Text style={{ fontSize: 12, color: isDark ? "#64748b" : "#94a3b8", marginTop: 2 }}>
                                        {BRAND.instagramHandle}
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="open-outline" size={16} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 3. MINIMAL DETACHED FOOTER */}
                <View style={{ alignItems: "center", marginTop: 48, marginBottom: 16 }}>
                    <Text style={{ fontSize: 12, fontWeight: "500", color: isDark ? "#475569" : "#94a3b8", letterSpacing: 0.5, textAlign: "center" }}>
                        © 2026 GencKalculator. Tüm Hakları Saklıdır.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
