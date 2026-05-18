// app/contact.tsx
// İletişim modalı — Aydınlık tema kilidi uygulanmış
import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

interface ContactItemProps {
    icon: string;
    iconBg: string;
    iconColor: string;
    title: string;
    subtitle: string;
    onPress: () => void;
}

function ContactItem({ icon, iconBg, iconColor, title, subtitle, onPress }: ContactItemProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.6}
            className="flex-row items-center gap-4 bg-slate-50 rounded-2xl px-5 py-4 mb-3 border border-slate-100"
        >
            <View className={`w-12 h-12 rounded-xl items-center justify-center ${iconBg}`}>
                <Feather name={icon as any} size={22} color={iconColor} />
            </View>
            <View className="flex-1">
                <Text className="text-base font-semibold text-slate-800">
                    {title}
                </Text>
                <Text className="text-sm text-slate-500 mt-0.5">
                    {subtitle}
                </Text>
            </View>
            <Feather name="external-link" size={16} color="#94a3b8" />
        </TouchableOpacity>
    );
}

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
        const url = "https://twitter.com/genckalculator";
        try {
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                await Linking.openURL(url);
            } else {
                Alert.alert("Bağlantı Açılamıyor", "Tarayıcı veya ilgili uygulama açılamadı.");
            }
        } catch (error) {
            Alert.alert("Hata", "Bağlantı açma işlemi başarısız oldu.");
        }
    };

    const handleFacebook = async () => {
        const url = "https://facebook.com/genckalculator";
        try {
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                await Linking.openURL(url);
            } else {
                Alert.alert("Bağlantı Açılamıyor", "Tarayıcı veya ilgili uygulama açılamadı.");
            }
        } catch (error) {
            Alert.alert("Hata", "Bağlantı açma işlemi başarısız oldu.");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
            {/* Modal Header */}
            <View className="px-5 pt-3 pb-3 flex-row justify-between items-center border-b border-slate-100">
                <Text className="text-lg font-bold text-slate-900">
                    İletişim
                </Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    className="w-8 h-8 items-center justify-center rounded-full bg-slate-100"
                >
                    <Feather name="x" size={18} color="#64748b" />
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerClassName="px-5 py-8 pb-16"
            >
                {/* Hero */}
                <View className="items-center mb-10">
                    <View className="w-20 h-20 rounded-full bg-indigo-100 items-center justify-center mb-5">
                        <Feather name="message-circle" size={36} color="#4f46e5" />
                    </View>
                    <Text className="text-2xl font-bold text-slate-900 text-center mb-2">
                        Bize Ulaşın
                    </Text>
                    <Text className="text-sm text-slate-500 text-center leading-5 px-4">
                        Sorularınız, önerileriniz veya geri bildirimleriniz için bizimle iletişime geçebilirsiniz.
                    </Text>
                </View>

                {/* İletişim Kartları */}
                <View className="mb-8">
                    <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                        İletişim Kanalları
                    </Text>

                    <ContactItem
                        icon="mail"
                        iconBg="bg-indigo-100"
                        iconColor="#4f46e5"
                        title="E-posta"
                        subtitle="info@genckalculator.com"
                        onPress={handleEmail}
                    />

                    <ContactItem
                        icon="twitter"
                        iconBg="bg-sky-100"
                        iconColor="#0284c7"
                        title="Twitter"
                        subtitle="@genckalculator"
                        onPress={handleTwitter}
                    />

                    <ContactItem
                        icon="facebook"
                        iconBg="bg-blue-100"
                        iconColor="#2563eb"
                        title="Facebook"
                        subtitle="genckalculator"
                        onPress={handleFacebook}
                    />
                </View>

                {/* Footer */}
                <View className="items-center pt-6 border-t border-slate-100">
                    <View className="flex-row items-center gap-2 mb-2">
                        <View className="flex-row items-center gap-0.5">
                            <View className="w-1 h-3 rounded-full bg-indigo-600" />
                            <View className="w-1 h-5 rounded-full bg-indigo-600" />
                            <View className="w-1 h-3 rounded-full bg-indigo-600" />
                        </View>
                        <Text className="text-sm text-slate-900 font-bold tracking-tight">
                            genckalculator
                        </Text>
                    </View>
                    <Text className="text-[10px] text-slate-300 mt-1">
                        © {new Date().getFullYear()} GençKal Calculator. Tüm Hakları Saklıdır.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
