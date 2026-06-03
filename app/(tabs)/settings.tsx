// app/(tabs)/settings.tsx
// Premium iOS-Style Ayarlar Sekmesi (Aydınlık tema kilidi uygulanmış)
import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import SegmentedControl, { SegmentedOption } from "../../src/components/SegmentedControl";
import { ThemeContextType, useTheme } from "../../src/context/ThemeContext";
import BrandLogo from "../../src/components/BrandLogo";
import { useAuth } from "../../src/context/AuthContext";
import { useAppDialog } from "../../src/context/AppDialogContext";

export default function SettingsTab() {
    const router = useRouter();
    const { themeMode, setThemeMode, isDark, accentColor, setAccentColor, colors } = useTheme();
    const { user, signout } = useAuth();
    const { showDialog } = useAppDialog();
    
    const themeOptions: SegmentedOption<ThemeContextType["themeMode"]>[] = [
        { value: "aydinlik", label: "Aydınlık", icon: "sunny-outline" },
        { value: "karanlik", label: "Karanlık", icon: "moon-outline" },
        { value: "sistem", label: "Sistem", icon: "phone-portrait-outline" }
    ];

    const handleSavedPlansPress = () => {
        if (!user) {
            showDialog({
                title: "Giriş yapmanız gerekmektedir",
                message: "Kayıtlı diyet planlarınızı görmek için önce giriş yapın.",
                icon: "person-circle-outline",
            });
            return;
        }

        router.push("/saved-plans");
    };

    const handleSignout = () => {
        showDialog({
            title: "Çıkış yapılsın mı?",
            message: "Hesabınızdan çıkış yapılacak.",
            icon: "log-out-outline",
            actions: [
                { label: "Vazgeç", style: "cancel" },
                {
                    label: "Çıkış Yap",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await signout();
                        } catch (error) {
                            showDialog({
                                title: "Çıkış yapılamadı",
                                message: error instanceof Error ? error.message : "İşlem tamamlanamadı.",
                                icon: "alert-circle-outline",
                            });
                        }
                    },
                },
            ],
        });
    };



    return (
        <View style={{ flex: 1, backgroundColor: isDark ? "#020617" : "#ffffff" }}>
            <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
                {/* Disable native sticky header for this screen */}
                <Tabs.Screen options={{ headerShown: false }} />

                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: 20,
                        paddingTop: 16,
                        paddingBottom: 36 // Tab bar koruması için alt boşluk
                    }}
                >
                    {/* Marka Logo Başlığı */}
                    <BrandLogo />

                    {/* Header Bölümü */}
                    <View style={{ alignItems: "flex-start", marginTop: 8, marginBottom: 28 }}>
                        <Text className="text-[28px] font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                            Ayarlar
                        </Text>
                        <Text className="text-sm text-slate-500 dark:text-slate-400 font-light mt-1">
                            Uygulama tercihleri ve bilgilendirme
                        </Text>
                    </View>

                    {/* 1. HESAP (Account Section) */}
                    <View className="mb-8">
                        <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1">
                            HESAP
                        </Text>
                        <View style={{ backgroundColor: isDark ? "#0f172a" : "#f8fafc", borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: isDark ? "#1e293b" : "#f1f5f9" }}>
                            {user ? (
                                <>
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            paddingHorizontal: 20,
                                            paddingVertical: 14
                                        }}
                                    >
                                        <View style={{ width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: isDark ? colors.lightAccentDark : colors.lightAccent, marginRight: 14 }}>
                                            <Ionicons name="person-outline" size={18} color={isDark ? colors.primaryDark : colors.primary} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 15, fontWeight: "700", color: isDark ? "#f1f5f9" : "#1e293b" }}>
                                                {user.name}
                                            </Text>
                                            <Text style={{ fontSize: 12, color: isDark ? "#64748b" : "#94a3b8", marginTop: 2 }}>
                                                {user.email}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={{ height: 1, backgroundColor: isDark ? "#1e293b" : "#f1f5f9", marginLeft: 70 }} />
                                </>
                            ) : (
                                <>
                                    <TouchableOpacity
                                        onPress={() => router.push("/auth")}
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
                                                <Ionicons name="log-in-outline" size={18} color={isDark ? colors.primaryDark : colors.primary} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontSize: 15, fontWeight: "600", color: isDark ? "#f1f5f9" : "#1e293b" }}>
                                                    Giriş Yap / Kayıt Ol
                                                </Text>
                                                <Text style={{ fontSize: 12, color: isDark ? "#64748b" : "#94a3b8", marginTop: 2 }}>
                                                    Planlarınızı hesabınıza kaydedin
                                                </Text>
                                            </View>
                                        </View>
                                        <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
                                    </TouchableOpacity>
                                    <View style={{ height: 1, backgroundColor: isDark ? "#1e293b" : "#f1f5f9", marginLeft: 70 }} />
                                </>
                            )}

                            <TouchableOpacity
                                onPress={handleSavedPlansPress}
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
                                        <Ionicons name="restaurant-outline" size={18} color={isDark ? colors.primaryDark : colors.primary} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 15, fontWeight: "600", color: isDark ? "#f1f5f9" : "#1e293b" }}>
                                            Diyet Planlarım
                                        </Text>
                                        <Text style={{ fontSize: 12, color: isDark ? "#64748b" : "#94a3b8", marginTop: 2 }}>
                                            Kaydettiğiniz planları görüntüleyin
                                        </Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
                            </TouchableOpacity>

                            {user && (
                                <>
                                    <View style={{ height: 1, backgroundColor: isDark ? "#1e293b" : "#f1f5f9", marginLeft: 70 }} />
                                    <TouchableOpacity
                                        onPress={handleSignout}
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
                                            <View style={{ width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: isDark ? "rgba(239,68,68,0.16)" : "#fee2e2", marginRight: 14 }}>
                                                <Ionicons name="log-out-outline" size={18} color="#dc2626" />
                                            </View>
                                            <Text style={{ fontSize: 15, fontWeight: "600", color: "#dc2626" }}>
                                                Çıkış Yap
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>

                    {/* 2. GÖRÜNÜM (Appearance Section) */}
                    <View className="mb-8">
                        <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1">
                            GÖRÜNÜM
                        </Text>
                        <SegmentedControl
                            options={themeOptions}
                            selectedValue={themeMode}
                            onValueChange={setThemeMode}
                        />
                    </View>

                    {/* 3. RENK TEMASI (Color Theme Section) */}
                    <View className="mb-8">
                        <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1">
                            RENK TEMASI
                        </Text>
                        <View style={{ flexDirection: "row", gap: 16, alignItems: "center", paddingLeft: 4 }}>
                            {/* İndigo Seçeneği */}
                            <TouchableOpacity
                                onPress={() => setAccentColor("indigo")}
                                activeOpacity={0.8}
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 22,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderWidth: 2,
                                    borderColor: accentColor === "indigo" 
                                        ? (isDark ? colors.primaryDark : colors.primary) 
                                        : "transparent",
                                    padding: 3
                                }}
                            >
                                <View style={{
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: 18,
                                    backgroundColor: "#4338ca",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 2,
                                    elevation: 2
                                }}>
                                    {accentColor === "indigo" && (
                                        <Ionicons name="checkmark" size={16} color="#ffffff" />
                                    )}
                                </View>
                            </TouchableOpacity>

                            {/* Orman Yeşili Seçeneği */}
                            <TouchableOpacity
                                onPress={() => setAccentColor("yesil")}
                                activeOpacity={0.8}
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 22,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderWidth: 2,
                                    borderColor: accentColor === "yesil" 
                                        ? (isDark ? colors.primaryDark : colors.primary) 
                                        : "transparent",
                                    padding: 3
                                }}
                            >
                                <View style={{
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: 18,
                                    backgroundColor: "#355E3B",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 2,
                                    elevation: 2
                                }}>
                                    {accentColor === "yesil" && (
                                        <Ionicons name="checkmark" size={16} color="#ffffff" />
                                    )}
                                </View>
                            </TouchableOpacity>

                            {/* Kırmızı Seçeneği */}
                            <TouchableOpacity
                                onPress={() => setAccentColor("kirmizi")}
                                activeOpacity={0.8}
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 22,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderWidth: 2,
                                    borderColor: accentColor === "kirmizi"
                                        ? (isDark ? colors.primaryDark : colors.primary)
                                        : "transparent",
                                    padding: 3
                                }}
                            >
                                <View style={{
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: 18,
                                    backgroundColor: "#CC0000",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 2,
                                    elevation: 2
                                }}>
                                    {accentColor === "kirmizi" && (
                                        <Ionicons name="checkmark" size={16} color="#ffffff" />
                                    )}
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 4. DESTEK & UYGULAMA (Support Section) */}
                    <View className="mb-8">
                        <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1">
                            DESTEK & UYGULAMA
                        </Text>
                        <View style={{ backgroundColor: isDark ? "#0f172a" : "#f8fafc", borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: isDark ? "#1e293b" : "#f1f5f9" }}>
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
                                    <View style={{ width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: isDark ? colors.lightAccentDark : colors.lightAccent, marginRight: 14 }}>
                                        <Ionicons name="book-outline" size={18} color={isDark ? colors.primaryDark : colors.primary} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 15, fontWeight: "600", color: isDark ? "#f1f5f9" : "#1e293b" }}>
                                            Bilgilendirme
                                        </Text>
                                        <Text style={{ fontSize: 12, color: isDark ? "#64748b" : "#94a3b8", marginTop: 2 }}>
                                            BMI, FFMI ve sağlık bilgileri
                                        </Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
                            </TouchableOpacity>

                            {/* İndentasyonlu Zarif Ara Çizgi (Divider) */}
                            <View style={{ height: 1, backgroundColor: isDark ? "#1e293b" : "#f1f5f9", marginLeft: 70 }} />

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
                                    <View style={{ width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: isDark ? colors.lightAccentDark : colors.lightAccent, marginRight: 14 }}>
                                        <Ionicons name="mail-outline" size={18} color={isDark ? colors.primaryDark : colors.primary} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 15, fontWeight: "600", color: isDark ? "#f1f5f9" : "#1e293b" }}>
                                            İletişim
                                        </Text>
                                        <Text style={{ fontSize: 12, color: isDark ? "#64748b" : "#94a3b8", marginTop: 2 }}>
                                            E-posta ve sosyal medya
                                        </Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 5. BİLGI ALT YAZISI (VERSION FOOTER) */}
                    <View style={{ alignItems: "center", marginTop: 48, marginBottom: 16 }}>
                        <Text style={{ fontSize: 12, fontWeight: "600", color: "#94a3b8", letterSpacing: 0.5 }}>
                            Versiyon 1.0.0
                        </Text>
                        <Text style={{ fontSize: 11, color: "#cbd5e1", marginTop: 4 }}>
                            © 2026 GencKalculator
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
