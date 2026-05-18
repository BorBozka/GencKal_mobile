// app/contact.tsx
// İletişim modalı — Aydınlık tema kilidi uygulanmış
import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ContactScreen() {
    const router = useRouter();

    const handleEmail = async () => {
        const url = "mailto:info@genckalculator.com";
        try {
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                await Linking.openURL(url);
            } else {
                Alert.alert(
                    "E-posta Gönderilemiyor",
                    "Cihazınızda e-posta uygulamasını açabilecek bir istemci bulunamadı."
                );
            }
        } catch (error) {
            Alert.alert("Hata", "E-posta gönderim işlemi başarısız oldu.");
        }
    };

    const handleTwitter = async () => {
        const url = "https://twitter.com/genckalcalculator";
        try {
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                await Linking.openURL(url);
            } else {
                Alert.alert("Bağlantı Açılamıyor", "Tarayıcı veya Twitter uygulaması açılamadı.");
            }
        } catch (error) {
            Alert.alert("Hata", "Bağlantı açma işlemi başarısız oldu.");
        }
    };

    const handleInstagram = async () => {
        const url = "https://instagram.com/genckalcalculator";
        try {
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                await Linking.openURL(url);
            } else {
                Alert.alert("Bağlantı Açılamıyor", "Tarayıcı veya Instagram uygulaması açılamadı.");
            }
        } catch (error) {
            Alert.alert("Hata", "Bağlantı açma işlemi başarısız oldu.");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
            {/* Modal Header */}
            <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" }}>
                <Text style={{ fontSize: 18, fontWeight: "800", color: "#0f172a" }}>
                    İletişim
                </Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={{ width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: "#f1f5f9" }}
                >
                    <Ionicons name="close" size={20} color="#64748b" />
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 48 }}
            >
                {/* Hero Section */}
                <View style={{ alignItems: "center", marginBottom: 32 }}>
                    <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: "#eef2ff", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                        <Ionicons name="chatbubble-ellipses" size={32} color="#4338ca" />
                    </View>
                    <Text style={{ fontSize: 24, fontWeight: "800", color: "#0f172a", textAlign: "center", marginBottom: 6 }}>
                        Bize Ulaşın
                    </Text>
                    <Text style={{ fontSize: 14, color: "#64748b", textAlign: "center", lineHeight: 22, paddingHorizontal: 16 }}>
                        Sorularınız, önerileriniz veya geri bildirimleriniz için aşağıdaki kanallardan bizimle iletişime geçebilirsiniz.
                    </Text>
                </View>

                {/* Tek ve Bütünleşik İletişim Kartı */}
                <View className="mb-8">
                    <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1">
                        İLETİŞİM KANALLARI
                    </Text>
                    
                    <View style={{ backgroundColor: "#f8fafc", borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: "#f1f5f9" }}>
                        {/* Satır 1: E-posta */}
                        <TouchableOpacity
                            onPress={handleEmail}
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
                                        E-posta
                                    </Text>
                                    <Text style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                                        info@genckalculator.com
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="open-outline" size={16} color="#94a3b8" />
                        </TouchableOpacity>

                        {/* İndentasyonlu Bölücü Çizgi */}
                        <View style={{ height: 1, backgroundColor: "#f1f5f9", marginLeft: 70 }} />

                        {/* Satır 2: Twitter */}
                        <TouchableOpacity
                            onPress={handleTwitter}
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
                                    <Ionicons name="logo-twitter" size={18} color="#4338ca" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 15, fontWeight: "600", color: "#1e293b" }}>
                                        Twitter
                                    </Text>
                                    <Text style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                                        @genckalculator
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="open-outline" size={16} color="#94a3b8" />
                        </TouchableOpacity>

                        {/* İndentasyonlu Bölücü Çizgi */}
                        <View style={{ height: 1, backgroundColor: "#f1f5f9", marginLeft: 70 }} />

                        {/* Satır 3: Instagram */}
                        <TouchableOpacity
                            onPress={handleInstagram}
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
                                    <Ionicons name="logo-instagram" size={18} color="#4338ca" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 15, fontWeight: "600", color: "#1e293b" }}>
                                        Instagram
                                    </Text>
                                    <Text style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                                        @genckalcalculator
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="open-outline" size={16} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 3. MINIMAL DETACHED FOOTER */}
                <View style={{ alignItems: "center", marginTop: 48, marginBottom: 16 }}>
                    <Text style={{ fontSize: 12, fontWeight: "500", color: "#94a3b8", letterSpacing: 0.5, textAlign: "center" }}>
                        © 2026 GençKal Calculator. Tüm Hakları Saklıdır.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
