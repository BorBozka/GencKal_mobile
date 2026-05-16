// app/information.tsx
// Bilgilendirme modalı — Web EducationalSection'dan mobil uyarlaması
import React from "react";
import { View, Text, ScrollView, TouchableOpacity, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

interface TableRowProps {
    cells: string[];
    isHeader?: boolean;
    highlight?: "green" | "yellow" | "orange" | "red" | "red-bold" | null;
}

function TableRow({ cells, isHeader, highlight }: TableRowProps) {
    const isDark = useColorScheme() === "dark";

    let bgClass = "";
    let textClass = "text-slate-700 dark:text-slate-300";

    if (isHeader) {
        bgClass = "bg-indigo-50 dark:bg-indigo-900/20";
        textClass = "text-indigo-900 dark:text-indigo-300";
    } else if (highlight === "green") {
        bgClass = "bg-emerald-50 dark:bg-emerald-900/10";
        textClass = "text-emerald-800 dark:text-emerald-400";
    } else if (highlight === "yellow") {
        bgClass = "bg-yellow-50 dark:bg-yellow-900/10";
    } else if (highlight === "orange") {
        bgClass = "bg-orange-50 dark:bg-orange-900/10";
    } else if (highlight === "red") {
        bgClass = "bg-red-50 dark:bg-red-900/10";
    } else if (highlight === "red-bold") {
        bgClass = "bg-red-100 dark:bg-red-900/20";
        textClass = "text-red-900 dark:text-red-400";
    }

    return (
        <View className={`flex-row border-b border-slate-200 dark:border-slate-700 ${bgClass}`}>
            {cells.map((cell, i) => (
                <View key={i} className={`flex-1 px-3 py-3 ${i === 0 ? "" : "border-l border-slate-200 dark:border-slate-700"}`}>
                    <Text className={`text-sm ${isHeader ? "font-bold" : "font-medium"} ${textClass}`}>
                        {cell}
                    </Text>
                </View>
            ))}
        </View>
    );
}

function SectionTitle({ children }: { children: string }) {
    return (
        <Text className="text-xl font-bold text-indigo-900 dark:text-indigo-300 mb-3 mt-6">
            {children}
        </Text>
    );
}

function SubTitle({ children }: { children: string }) {
    return (
        <Text className="text-lg font-semibold text-indigo-800 dark:text-indigo-400 mb-2 mt-4">
            {children}
        </Text>
    );
}

function FormulaBox({ children }: { children: React.ReactNode }) {
    return (
        <View className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-6">
            {children}
        </View>
    );
}

function BulletItem({ bold, text }: { bold: string; text: string }) {
    return (
        <View className="flex-row mb-2 pl-2">
            <Text className="text-slate-500 dark:text-slate-400 mr-2">•</Text>
            <Text className="text-sm text-slate-700 dark:text-slate-300 flex-1 leading-5">
                <Text className="font-bold">{bold}</Text> {text}
            </Text>
        </View>
    );
}

export default function InformationScreen() {
    const router = useRouter();
    const isDark = useColorScheme() === "dark";

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-900" edges={["top"]}>
            {/* Modal Header */}
            <View className="px-5 pt-3 pb-3 flex-row justify-between items-center border-b border-slate-100 dark:border-slate-800">
                <Text className="text-lg font-bold text-slate-900 dark:text-white">
                    Bilgilendirme
                </Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    className="w-8 h-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
                >
                    <Feather name="x" size={18} color={isDark ? "#94a3b8" : "#64748b"} />
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerClassName="px-5 py-4 pb-16"
            >
                {/* ===== BMI BÖLÜMÜ ===== */}
                <SectionTitle>BMI (Vücut Kitle İndeksi) Nedir?</SectionTitle>
                <Text className="text-sm text-slate-600 dark:text-slate-400 leading-6 mb-4">
                    BMI, boyunuza ve kilonuza dayanarak zayıflık veya şişmanlık derecenizi ölçen, doku kütlesini ölçmeyi amaçlayan bir hesaplamadır. Bir kişinin boyuna göre sağlıklı bir vücut ağırlığına sahip olup olmadığının genel bir göstergesi olarak yaygın şekilde kullanılır.
                </Text>

                <SubTitle>BMI Formülü</SubTitle>
                <FormulaBox>
                    <Text className="text-sm font-mono text-slate-700 dark:text-slate-300 mb-1">
                        BMI = Kilo (kg) / ( Boy (m) × Boy (m) )
                    </Text>
                    <Text className="text-sm font-mono text-indigo-600 dark:text-indigo-400 font-bold mt-2">
                        Örnek: 75 kg / (1.75 × 1.75) = 24.49
                    </Text>
                </FormulaBox>

                <SubTitle>Yetişkinler İçin BMI Tablosu (DSÖ)</SubTitle>
                <View className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
                    <TableRow cells={["Sınıflandırma", "BMI Aralığı"]} isHeader />
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
                <Text className="text-sm text-slate-600 dark:text-slate-400 leading-6 mb-3">
                    BMI sağlıklı vücut ağırlığını belirlemek için yaygın olsa da, kas ve yağ oranını dikkate almayan sadece bir tahmindir.
                </Text>
                <BulletItem bold="Sporcular:" text="Kas yağdan daha ağır olduğu için yüksek kas kütlesine sahip kişiler BMI'ye göre 'Obez' çıkabilir, ancak aslında son derece sağlıklıdırlar." />
                <BulletItem bold="Yaşlı Yetişkinler:" text="Aynı BMI değerine sahip gençlere kıyasla daha fazla vücut yağına sahip olma eğilimindedirler." />

                {/* Fazla Kilo / Düşük Kilo Riskleri */}
                <View className="flex-row gap-3 mt-4 mb-6">
                    <View className="flex-1 bg-red-50 dark:bg-red-900/10 rounded-xl p-4">
                        <Text className="text-sm font-bold text-red-700 dark:text-red-400 mb-2">Fazla Kilo Riskleri</Text>
                        <Text className="text-xs text-slate-600 dark:text-slate-400 leading-5">
                            • Yüksek tansiyon ve kolesterol{'\n'}
                            • Tip II diyabet{'\n'}
                            • Koroner kalp hastalığı{'\n'}
                            • Uyku apnesi
                        </Text>
                    </View>
                    <View className="flex-1 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl p-4">
                        <Text className="text-sm font-bold text-yellow-700 dark:text-yellow-400 mb-2">Düşük Kilo Riskleri</Text>
                        <Text className="text-xs text-slate-600 dark:text-slate-400 leading-5">
                            • Yetersiz beslenme ve anemi{'\n'}
                            • Osteoporoz{'\n'}
                            • Zayıf bağışıklık sistemi{'\n'}
                            • Büyüme sorunları
                        </Text>
                    </View>
                </View>

                {/* Divider */}
                <View className="h-px bg-slate-200 dark:bg-slate-700 my-4" />

                {/* ===== FFMI BÖLÜMÜ ===== */}
                <SectionTitle>FFMI (Yağsız Vücut Kütlesi İndeksi) Nedir?</SectionTitle>
                <Text className="text-sm text-slate-600 dark:text-slate-400 leading-6 mb-4">
                    FFMI, boyunuza oranla ne kadar kas kütlesine sahip olduğunuzu hesaplamanızı sağlayan bir indekstir. Vücut geliştiriciler ve sporcular tarafından gelişimlerini takip etmek için yaygın olarak kullanılır ve BMI'ye göre çok daha güvenilirdir.
                </Text>

                <SubTitle>FFMI Formülü</SubTitle>
                <FormulaBox>
                    <Text className="text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">
                        Vücut Yağı = Kilo × (Yağ Oranı [%] / 100)
                    </Text>
                    <Text className="text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">
                        Yağsız Kütle = Kilo - Vücut Yağı
                    </Text>
                    <Text className="text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">
                        FFMI = Yağsız Kütle (kg) / Boy (m)²
                    </Text>
                    <Text className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold mt-2">
                        Norm. FFMI = FFMI + 6.1 × (1.8 - Boy (m))
                    </Text>
                </FormulaBox>

                <SubTitle>Erkekler İçin FFMI Skorları</SubTitle>
                <View className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
                    <TableRow cells={["FFMI", "Yağ Oranı", "Açıklama"]} isHeader />
                    <TableRow cells={["17-18", "10-18%", "Zayıf"]} />
                    <TableRow cells={["18-20", "20-27%", "Ortalama"]} />
                    <TableRow cells={["19-21", "25-40%", "Kilolu"]} />
                    <TableRow cells={["20-21", "10-18%", "Sporcu / Orta"]} />
                    <TableRow cells={["22-23", "6-12%", "İleri Sporcu"]} />
                    <TableRow cells={["24-25", "8-20%", "Vücut Gel."]} />
                </View>

                <SubTitle>Kadınlar İçin FFMI Skorları</SubTitle>
                <View className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
                    <TableRow cells={["FFMI", "Yağ Oranı", "Açıklama"]} isHeader />
                    <TableRow cells={["14-15", "20-25%", "Zayıf"]} />
                    <TableRow cells={["14-17", "22-35%", "Ortalama"]} />
                    <TableRow cells={["15-18", "30-45%", "Kilolu"]} />
                    <TableRow cells={["16-17", "18-25%", "Sporcu / Orta"]} />
                    <TableRow cells={["18-20", "15-22%", "İleri Sporcu"]} />
                    <TableRow cells={["19-21", "15-30%", "Vücut Gel."]} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
