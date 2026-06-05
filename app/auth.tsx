import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import BrandLogo from "../src/components/BrandLogo";
import { useAuth } from "../src/context/AuthContext";
import { useTheme } from "../src/context/ThemeContext";
import { useAppDialog } from "../src/context/AppDialogContext";

type AuthMode = "signin" | "signup";

export default function AuthScreen() {
    const router = useRouter();
    const { returnTo, pendingSave } = useLocalSearchParams<{ returnTo?: string; pendingSave?: string }>();
    const { signin, signup } = useAuth();
    const { isDark, colors } = useTheme();
    const { showDialog } = useAppDialog();
    const [mode, setMode] = useState<AuthMode>("signin");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getReturnPath = () => {
        if (returnTo === "diet-result") {
            return `/diet${pendingSave === "diet-plan-save" ? "?pendingSave=diet-plan-save" : ""}`;
        }

        if (returnTo === "saved-plans") {
            return "/saved-plans";
        }

        return "/settings";
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            if (mode === "signup") {
                await signup(name, email, password);
            } else {
                await signin(email, password);
            }
            router.replace(getReturnPath());
        } catch (error) {
            showDialog({
                title: mode === "signup" ? "Kayıt başarısız" : "Giriş başarısız",
                message: error instanceof Error ? error.message : "İşlem tamamlanamadı.",
                icon: "alert-circle-outline",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const canSubmit = mode === "signin"
        ? email.trim().length > 0 && password.length > 0
        : name.trim().length >= 2 && email.trim().length > 0 && password.length >= 6;

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? "#020617" : "#ffffff" }}>
            <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingHorizontal: 20,
                            paddingTop: 16,
                            paddingBottom: 40,
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => router.back()}
                            activeOpacity={0.7}
                            style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 }}
                        >
                            <Ionicons name="chevron-back" size={20} color={isDark ? "#94a3b8" : "#64748b"} />
                            <Text style={{ color: isDark ? "#94a3b8" : "#64748b", fontWeight: "700" }}>Geri</Text>
                        </TouchableOpacity>

                        <BrandLogo />

                        <View style={{ marginTop: 24, marginBottom: 24 }}>
                            <Text style={{ fontSize: 28, fontWeight: "800", color: isDark ? "#f1f5f9" : "#0f172a" }}>
                                {mode === "signin" ? "Giriş Yap" : "Kayıt Ol"}
                            </Text>
                            <Text style={{ marginTop: 8, color: isDark ? "#94a3b8" : "#64748b", lineHeight: 22 }}>
                                Diyet planlarınızı web ve mobilde aynı hesapla saklayın.
                            </Text>
                        </View>

                        <View style={{
                            flexDirection: "row",
                            backgroundColor: isDark ? "#0f172a" : "#f1f5f9",
                            borderRadius: 16,
                            padding: 4,
                            marginBottom: 20,
                        }}>
                            <TouchableOpacity
                                onPress={() => setMode("signin")}
                                activeOpacity={0.8}
                                style={{
                                    flex: 1,
                                    borderRadius: 12,
                                    paddingVertical: 12,
                                    alignItems: "center",
                                    backgroundColor: mode === "signin" ? (isDark ? "#1e293b" : "#ffffff") : "transparent",
                                }}
                            >
                                <Text style={{ fontWeight: "800", color: mode === "signin" ? (isDark ? colors.primaryDark : colors.primary) : "#94a3b8" }}>
                                    Giriş Yap
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setMode("signup")}
                                activeOpacity={0.8}
                                style={{
                                    flex: 1,
                                    borderRadius: 12,
                                    paddingVertical: 12,
                                    alignItems: "center",
                                    backgroundColor: mode === "signup" ? (isDark ? "#1e293b" : "#ffffff") : "transparent",
                                }}
                            >
                                <Text style={{ fontWeight: "800", color: mode === "signup" ? (isDark ? colors.primaryDark : colors.primary) : "#94a3b8" }}>
                                    Kayıt Ol
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{
                            borderWidth: 1,
                            borderColor: isDark ? "#1e293b" : "#f1f5f9",
                            backgroundColor: isDark ? "#0f172a" : "#ffffff",
                            borderRadius: 24,
                            padding: 18,
                            gap: 14,
                        }}>
                            {mode === "signup" && (
                                <TextInput
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Adınız"
                                    placeholderTextColor="#94a3b8"
                                    autoCapitalize="words"
                                    style={{
                                        height: 52,
                                        borderRadius: 16,
                                        paddingHorizontal: 16,
                                        backgroundColor: isDark ? "#020617" : "#f8fafc",
                                        color: isDark ? "#f1f5f9" : "#0f172a",
                                        fontWeight: "700",
                                    }}
                                />
                            )}
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder="E-posta"
                                placeholderTextColor="#94a3b8"
                                autoCapitalize="none"
                                autoCorrect={false}
                                keyboardType="email-address"
                                textContentType="emailAddress"
                                style={{
                                    height: 52,
                                    borderRadius: 16,
                                    paddingHorizontal: 16,
                                    backgroundColor: isDark ? "#020617" : "#f8fafc",
                                    color: isDark ? "#f1f5f9" : "#0f172a",
                                    fontWeight: "700",
                                }}
                            />
                            <View style={{
                                height: 52,
                                borderRadius: 16,
                                paddingHorizontal: 16,
                                backgroundColor: isDark ? "#020617" : "#f8fafc",
                                flexDirection: "row",
                                alignItems: "center",
                            }}>
                                <TextInput
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder={mode === "signup" ? "Şifre (en az 6 karakter)" : "Şifre"}
                                    placeholderTextColor="#94a3b8"
                                    secureTextEntry={!isPasswordVisible}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    spellCheck={false}
                                    textContentType={mode === "signup" ? "newPassword" : "password"}
                                    style={{
                                        flex: 1,
                                        color: isDark ? "#f1f5f9" : "#0f172a",
                                        fontWeight: "700",
                                    }}
                                />
                                <TouchableOpacity
                                    onPress={() => setIsPasswordVisible((value) => !value)}
                                    activeOpacity={0.7}
                                    style={{ paddingLeft: 10, paddingVertical: 8 }}
                                >
                                    <Ionicons name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} size={20} color="#94a3b8" />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={!canSubmit || isSubmitting}
                                activeOpacity={0.85}
                                style={{
                                    height: 52,
                                    borderRadius: 16,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: !canSubmit || isSubmitting ? "#cbd5e1" : (isDark ? colors.brandDark : colors.primary),
                                }}
                            >
                                <Text style={{ color: "#ffffff", fontWeight: "800" }}>
                                    {isSubmitting ? "İşleniyor..." : mode === "signup" ? "Kayıt Ol" : "Giriş Yap"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}
