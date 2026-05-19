import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../src/context/ThemeContext";

interface TableRowProps {
    cells: string[];
    isHeader?: boolean;
    highlight?: "green" | "yellow" | "orange" | "red" | "red-bold";
}

function TableRow({ cells, isHeader, highlight }: TableRowProps) {
    const { isDark, colors } = useTheme();
    let backgroundColor = isDark ? "#0f172a" : "#ffffff";
    let textColor = isDark ? "#cbd5e1" : "#475569";
    let fontWeight: "400" | "500" | "600" | "700" | "800" = "500";

    if (isHeader) {
        backgroundColor = isDark ? colors.lightAccentDark : colors.lightAccent;
        textColor = isDark ? colors.textTint : colors.primary;
        fontWeight = "700";
    } else if (highlight === "green") {
        backgroundColor = isDark ? "rgba(16, 185, 129, 0.15)" : "#ecfdf5"; // bg-emerald-50
        textColor = isDark ? "#34d399" : "#065f46";       // text-emerald-800
        fontWeight = "700";
    } else if (highlight === "yellow") {
        backgroundColor = isDark ? "rgba(245, 158, 11, 0.15)" : "#fffbeb"; // bg-amber-50
        textColor = isDark ? "#fbbf24" : "#92400e";       // text-amber-800
        fontWeight = "600";
    } else if (highlight === "orange") {
        backgroundColor = isDark ? "rgba(249, 115, 22, 0.15)" : "#fff7ed"; // bg-orange-50
        textColor = isDark ? "#fb923c" : "#c2410c";       // text-orange-800
        fontWeight = "600";
    } else if (highlight === "red") {
        backgroundColor = isDark ? "rgba(239, 68, 68, 0.15)" : "#fef2f2"; // bg-red-50
        textColor = isDark ? "#f87171" : "#b91c1c";       // text-red-800
        fontWeight = "600";
    } else if (highlight === "red-bold") {
        backgroundColor = isDark ? "rgba(239, 68, 68, 0.25)" : "#fee2e2"; // bg-red-100
        textColor = isDark ? "#fca5a5" : "#7f1d1d";       // text-red-900
        fontWeight = "700";
    }

    return (
        <View style={{
            flexDirection: "row",
            backgroundColor: backgroundColor,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? "#1e293b" : "#e2e8f0"
        }}>
            {cells.map((cell, i) => {
                let flexValue = 1;
                if (cells.length === 3) {
                    if (i === 0) flexValue = 1.0;       // FFMI
                    else if (i === 1) flexValue = 1.1;  // Yağ Oranı
                    else if (i === 2) flexValue = 2.0;  // Açıklama
                } else if (cells.length === 2) {
                    if (i === 0) flexValue = 1.5;       // Sınıflandırma
                    else if (i === 1) flexValue = 1.0;  // BMI Aralığı
                }

                return (
                    <View
                        key={i}
                        style={{
                            flex: flexValue,
                            paddingHorizontal: 12,
                            paddingVertical: 12,
                            borderLeftWidth: i === 0 ? 0 : 1,
                            borderLeftColor: isDark ? "#1e293b" : "#e2e8f0",
                            justifyContent: "center"
                        }}
                    >
                        <Text style={{
                            fontSize: 12,
                            fontWeight: fontWeight,
                            color: textColor,
                            lineHeight: 16
                        }}>
                            {cell}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
}

function SectionTitle({ children }: { children: string }) {
    const { isDark, colors } = useTheme();
    return (
        <Text style={{ fontSize: 20, fontWeight: "800", color: isDark ? colors.primaryDark : colors.primary, marginTop: 24, marginBottom: 8 }}>
            {children}
        </Text>
    );
}

function SubTitle({ children }: { children: string }) {
    const { isDark, colors } = useTheme();
    return (
        <Text style={{ fontSize: 16, fontWeight: "700", color: isDark ? colors.textTint : colors.primary, marginTop: 18, marginBottom: 8 }}>
            {children}
        </Text>
    );
}

function FormulaBox({ children }: { children: React.ReactNode }) {
    const { isDark } = useTheme();
    return (
        <View style={{ backgroundColor: isDark ? "#0f172a" : "#f8fafc", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: isDark ? "#1e293b" : "#e2e8f0", marginBottom: 16 }}>
            {children}
        </View>
    );
}

function BulletItem({ bold, text }: { bold: string; text: string }) {
    const { isDark } = useTheme();
    return (
        <View style={{ flexDirection: "row", marginBottom: 8, paddingLeft: 4 }}>
            <Text style={{ color: "#94a3b8", marginRight: 8, fontSize: 14 }}>•</Text>
            <Text style={{ fontSize: 13, color: isDark ? "#cbd5e1" : "#475569", flex: 1, lineHeight: 18 }}>
                <Text style={{ fontWeight: "700", color: isDark ? "#f1f5f9" : "#0f172a" }}>{bold}</Text> {text}
            </Text>
        </View>
    );
}

export default function InformationScreen() {
    const router = useRouter();
    const { isDark, colors } = useTheme();
    const insets = useSafeAreaInsets();

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
                    <Feather name="chevron-left" size={20} color={isDark ? "#94a3b8" : "#64748b"} />
                </TouchableOpacity>
                <Text style={{ fontSize: 18, fontWeight: "800", color: isDark ? "#f1f5f9" : "#0f172a" }}>
                    Bilgilendirme
                </Text>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 48 }}
            >
                {/* Sol Kolon: BMI Bölümü */}
                <SectionTitle>BMI (Vücut Kitle İndeksi) Nedir?</SectionTitle>
                <Text style={{ fontSize: 14, color: isDark ? "#cbd5e1" : "#475569", lineHeight: 22, marginBottom: 12 }}>
                    BMI, boyunuza ve kilonuza dayanarak zayıflık veya şişmanlık derecenizi ölçen, doku kütlesini ölçmeyi amaçlayan bir hesaplamadır. Bir kişinin boyuna göre sağlıklı bir vücut ağırlığına sahip olup olmadığının genel bir göstergesi olarak yaygın şekilde kullanılır.
                </Text>

                <SubTitle>BMI Formülü</SubTitle>
                <FormulaBox>
                    <Text style={{ fontSize: 13, fontFamily: "monospace", color: isDark ? "#cbd5e1" : "#334155", marginBottom: 4 }}>
                        BMI = Kilo (kg) / ( Boy (m) * Boy (m) )
                    </Text>
                    <Text style={{ fontSize: 13, fontFamily: "monospace", color: isDark ? colors.primaryDark : colors.primary, fontWeight: "700" }}>
                        Örnek: 75 kg / (1.75 * 1.75) = 24.49
                    </Text>
                </FormulaBox>

                <SubTitle>Yetişkinler İçin BMI Tablosu (DSÖ)</SubTitle>
                <View style={{ borderRadius: 16, borderWidth: 1, borderColor: isDark ? "#1e293b" : "#e2e8f0", overflow: "hidden", marginBottom: 16 }}>
                    <TableRow cells={["Sınıflandırma", "BMI Aralığı (kg/m²)"]} isHeader />
                    <TableRow cells={["İleri Derece Zayıflık", "< 16"]} />
                    <TableRow cells={["Orta Derece Zayıflık", "16 - 17"]} />
                    <TableRow cells={["Hafif Zayıflık", "17 - 18.5"]} />
                    <TableRow cells={["Normal", "18.5 - 25"]} highlight="green" />
                    <TableRow cells={["Fazla Kilolu", "25 - 30"]} highlight="yellow" />
                    <TableRow cells={["Obez (1. Derece)", "30 - 35"]} highlight="orange" />
                    <TableRow cells={["Obez (2. Derece)", "35 - 40"]} highlight="red" />
                    <TableRow cells={["Aşırı Obez (3. Derece)", "> 40"]} highlight="red-bold" />
                </View>

                <SubTitle>BMI'nin Sınırları</SubTitle>
                <Text style={{ fontSize: 14, color: isDark ? "#cbd5e1" : "#475569", lineHeight: 22, marginBottom: 10 }}>
                    BMI sağlıklı vücut ağırlığını belirlemek için yaygın olsa da, kas ve yağ oranını dikkate almayan sadece bir tahmindir.
                </Text>
                <BulletItem bold="Sporcular:" text="Kas yağdan daha ağır olduğu için yüksek kas kütlesine sahip kişiler BMI'ye göre 'Obez' çıkabilir, ancak aslında son derece sağlıklıdırlar." />
                <BulletItem bold="Yaşlı Yetişkinler:" text="Aynı BMI değerine sahip gençlere kıyasla daha fazla vücut yağına sahip olma eğilimindedirler." />

                {/* Fazla Kilo / Düşük Kilo Riskleri */}
                <View style={{ flexDirection: "row", gap: 12, marginTop: 12, marginBottom: 16 }}>
                    <View style={{ flex: 1, backgroundColor: isDark ? "rgba(239, 68, 68, 0.15)" : "#fef2f2", borderRadius: 16, padding: 12, borderWidth: 1, borderColor: isDark ? "rgba(239, 68, 68, 0.3)" : "#fee2e2" }}>
                        <Text style={{ fontSize: 14, fontWeight: "700", color: isDark ? "#f87171" : "#991b1b", marginBottom: 6 }}>Fazla Kilo Riskleri</Text>
                        <Text style={{ fontSize: 12, color: isDark ? "#fca5a5" : "#7f1d1d", lineHeight: 18 }}>
                            • Yüksek tansiyon ve kolesterol{'\n'}
                            • Tip II diyabet{'\n'}
                            • Koroner kalp hastalığı{'\n'}
                            • Uyku apnesi
                        </Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: isDark ? "rgba(245, 158, 11, 0.15)" : "#fffbeb", borderRadius: 16, padding: 12, borderWidth: 1, borderColor: isDark ? "rgba(245, 158, 11, 0.3)" : "#fef3c7" }}>
                        <Text style={{ fontSize: 14, fontWeight: "700", color: isDark ? "#fbbf24" : "#92400e", marginBottom: 6 }}>Düşük Kilo Riskleri</Text>
                        <Text style={{ fontSize: 12, color: isDark ? "#fde047" : "#78350f", lineHeight: 18 }}>
                            • Yetersiz beslenme ve anemi{'\n'}
                            • Osteoporoz (Kemik erimesi){'\n'}
                            • Zayıf bağışıklık sistemi{'\n'}
                            • Büyüme sorunları
                        </Text>
                    </View>
                </View>

                {/* Divider */}
                <View style={{ height: 1, backgroundColor: isDark ? "#1e293b" : "#f1f5f9", marginVertical: 16 }} />

                {/* FFMI Bölümü */}
                <SectionTitle>FFMI (Yağsız Vücut Kütlesi İndeksi) Nedir?</SectionTitle>
                <Text style={{ fontSize: 14, color: isDark ? "#cbd5e1" : "#475569", lineHeight: 22, marginBottom: 12 }}>
                    FFMI, boyunuza oranla ne kadar kas kütlesine sahip olduğunuzu hesaplamanızı sağlayan bir indekstir. Bu indeks, vücut geliştiriciler ve sporcular tarafından gelişimlerini takip etmek için yaygın olarak kullanılır ve BMI'ye göre çok daha güvenilirdir.
                </Text>

                <SubTitle>FFMI Formülü</SubTitle>
                <FormulaBox>
                    <Text style={{ fontSize: 12, fontFamily: "monospace", color: isDark ? "#cbd5e1" : "#334155", marginBottom: 2 }}>
                        Vücut Yağı = Kilo * (Yağ Oranı [%] / 100)
                    </Text>
                    <Text style={{ fontSize: 12, fontFamily: "monospace", color: isDark ? "#cbd5e1" : "#334155", marginBottom: 2 }}>
                        Yağsız Kütle = Kilo - Vücut Yağı
                    </Text>
                    <Text style={{ fontSize: 12, fontFamily: "monospace", color: isDark ? "#cbd5e1" : "#334155", marginBottom: 4 }}>
                        FFMI = Yağsız Kütle (kg) / Boy (m)²
                    </Text>
                    <Text style={{ fontSize: 12, fontFamily: "monospace", color: isDark ? colors.primaryDark : colors.primary, fontWeight: "700" }}>
                        Norm. FFMI = FFMI + 6.1 * (1.8 - Boy (m))
                    </Text>
                </FormulaBox>

                <SubTitle>Erkekler İçin FFMI Skorları</SubTitle>
                <View style={{ borderRadius: 16, borderWidth: 1, borderColor: isDark ? "#1e293b" : "#e2e8f0", overflow: "hidden", marginBottom: 16 }}>
                    <TableRow cells={["FFMI", "Yağ Oranı", "Açıklama"]} isHeader />
                    <TableRow cells={["17 - 18", "10 - 18%", "Zayıf"]} />
                    <TableRow cells={["18 - 20", "20 - 27%", "Ortalama"]} />
                    <TableRow cells={["19 - 21", "25 - 40%", "Kilolu"]} />
                    <TableRow cells={["20 - 21", "10 - 18%", "Sporcu / Orta Seviye"]} />
                    <TableRow cells={["22 - 23", "6 - 12%", "İleri Seviye Sporcu"]} />
                    <TableRow cells={["24 - 25", "8 - 20%", "Vücut Geliştirici"]} />
                </View>

                <SubTitle>Kadınlar İçin FFMI Skorları</SubTitle>
                <View style={{ borderRadius: 16, borderWidth: 1, borderColor: isDark ? "#1e293b" : "#e2e8f0", overflow: "hidden", marginBottom: 8 }}>
                    <TableRow cells={["FFMI", "Yağ Oranı", "Açıklama"]} isHeader />
                    <TableRow cells={["14 - 15", "20 - 25%", "Zayıf"]} />
                    <TableRow cells={["14 - 17", "22 - 35%", "Ortalama"]} />
                    <TableRow cells={["15 - 18", "30 - 45%", "Kilolu"]} />
                    <TableRow cells={["16 - 17", "18 - 25%", "Sporcu / Orta Seviye"]} />
                    <TableRow cells={["18 - 20", "15 - 22%", "İleri Seviye Sporcu"]} />
                    <TableRow cells={["19 - 21", "15 - 30%", "Vücut Geliştirici"]} />
                </View>
            </ScrollView>
        </View>
    );
}
