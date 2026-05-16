// app/(tabs)/settings.tsx
// Ayarlar & Bilgi sekmesi
import React from "react";
import { View, Text, ScrollView, TouchableOpacity, useColorScheme, Appearance } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

type ThemeOption = "light" | "dark" | "system";

export default function SettingsTab() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const router = useRouter();

    // Theme state — we track what the user selected
    const [selectedTheme, setSelectedTheme] = React.useState<ThemeOption>("system");

    const themeOptions: { key: ThemeOption; label: string; icon: string }[] = [
        { key: "light", label: "Aydınlık", icon: "sun" },
        { key: "dark", label: "Karanlık", icon: "moon" },
        { key: "system", label: "Sistem", icon: "smartphone" },
    ];

    const handleThemeChange = (theme: ThemeOption) => {
        setSelectedTheme(theme);
        if (theme === "system") {
            Appearance.setColorScheme(null);
        } else {
            Appearance.setColorScheme(theme);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-900" edges={["top"]}>
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerClassName="px-5 py-6 pb-20"
            >
                {/* Header */}
                <View className="mb-8">
                    <Text className="text-[28px] font-bold text-slate-900 dark:text-white tracking-tight">
                        Ayarlar
                    </Text>
                    <Text className="text-sm text-slate-500 dark:text-slate-400 font-light mt-1">
                        Uygulama tercihleri ve bilgilendirme
                    </Text>
                </View>

                {/* Görünüm Bölümü */}
                <View className="mb-8">
                    <Text className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                        Görünüm
                    </Text>
                    <View className="bg-slate-50 dark:bg-slate-800 rounded-2xl overflow-hidden">
                        {themeOptions.map((option, idx) => (
                            <TouchableOpacity
                                key={option.key}
                                onPress={() => handleThemeChange(option.key)}
                                activeOpacity={0.6}
                                className={`flex-row items-center justify-between px-5 py-4 ${
                                    idx < themeOptions.length - 1 ? "border-b border-slate-200 dark:border-slate-700" : ""
                                }`}
                            >
                                <View className="flex-row items-center gap-3">
                                    <View className={`w-9 h-9 rounded-xl items-center justify-center ${
                                        selectedTheme === option.key
                                            ? "bg-indigo-600 dark:bg-indigo-500"
                                            : "bg-slate-200 dark:bg-slate-700"
                                    }`}>
                                        <Feather
                                            name={option.icon as any}
                                            size={18}
                                            color={selectedTheme === option.key ? "#ffffff" : isDark ? "#94a3b8" : "#64748b"}
                                        />
                                    </View>
                                    <Text className={`text-base font-semibold ${
                                        selectedTheme === option.key
                                            ? "text-indigo-600 dark:text-indigo-400"
                                            : "text-slate-700 dark:text-slate-300"
                                    }`}>
                                        {option.label}
                                    </Text>
                                </View>
                                {selectedTheme === option.key && (
                                    <Feather name="check" size={20} color={isDark ? "#818cf8" : "#4f46e5"} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Hakkında Bölümü */}
                <View className="mb-8">
                    <Text className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                        Hakkında
                    </Text>
                    <View className="bg-slate-50 dark:bg-slate-800 rounded-2xl overflow-hidden">
                        <TouchableOpacity
                            onPress={() => router.push("/information")}
                            activeOpacity={0.6}
                            className="flex-row items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700"
                        >
                            <View className="flex-row items-center gap-3">
                                <View className="w-9 h-9 rounded-xl items-center justify-center bg-emerald-100 dark:bg-emerald-900/30">
                                    <Feather name="book-open" size={18} color={isDark ? "#34d399" : "#059669"} />
                                </View>
                                <View>
                                    <Text className="text-base font-semibold text-slate-700 dark:text-slate-300">
                                        Bilgilendirme
                                    </Text>
                                    <Text className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                        BMI, FFMI ve sağlık bilgileri
                                    </Text>
                                </View>
                            </View>
                            <Feather name="chevron-right" size={20} color={isDark ? "#64748b" : "#94a3b8"} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push("/contact")}
                            activeOpacity={0.6}
                            className="flex-row items-center justify-between px-5 py-4"
                        >
                            <View className="flex-row items-center gap-3">
                                <View className="w-9 h-9 rounded-xl items-center justify-center bg-blue-100 dark:bg-blue-900/30">
                                    <Feather name="mail" size={18} color={isDark ? "#60a5fa" : "#2563eb"} />
                                </View>
                                <View>
                                    <Text className="text-base font-semibold text-slate-700 dark:text-slate-300">
                                        İletişim
                                    </Text>
                                    <Text className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                        E-posta ve sosyal medya
                                    </Text>
                                </View>
                            </View>
                            <Feather name="chevron-right" size={20} color={isDark ? "#64748b" : "#94a3b8"} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Uygulama Bilgisi */}
                <View className="items-center pt-8 pb-4">
                    <View className="flex-row items-center gap-2 mb-2">
                        <View className="flex-row items-center gap-0.5">
                            <View className="w-1 h-3 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                            <View className="w-1 h-5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                            <View className="w-1 h-3 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                        </View>
                        <Text className="text-base text-slate-900 dark:text-white font-bold tracking-tight">
                            genckalculator
                        </Text>
                    </View>
                    <Text className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                        Versiyon 1.0.0
                    </Text>
                    <Text className="text-[10px] text-slate-300 dark:text-slate-600 mt-1">
                        © {new Date().getFullYear()} GençKal Calculator
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
