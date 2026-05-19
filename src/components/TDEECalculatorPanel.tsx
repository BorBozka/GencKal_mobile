// src/components/TDEECalculatorPanel.tsx
// Aydınlık tema kilidi uygulanmış TDEECalculatorPanel
import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { KullaniciProfil, Cinsiyet, AktiviteSeviyesi } from "../types";
import SegmentedControl, { SegmentedOption } from "./SegmentedControl";
import { useTheme } from "../context/ThemeContext";

interface TDEECalculatorPanelProps {
    data: KullaniciProfil["fizikselVeriler"];
    setField: <K extends keyof KullaniciProfil["fizikselVeriler"]>(
        name: K,
        value: KullaniciProfil["fizikselVeriler"][K]
    ) => void;
}

const cinsiyetOptions: SegmentedOption<Cinsiyet>[] = [
    { value: "erkek", label: "Erkek" },
    { value: "kadin", label: "Kadın" },
];

const aktiviteOptions: {
    key: AktiviteSeviyesi;
    label: string;
    desc: string;
    icon: keyof typeof Ionicons.glyphMap;
    multiplier: string;
}[] = [
    {
        key: "hareketsiz (ofis işi)",
        label: "Hareketsiz",
        desc: "Masa başı iş, çok az veya sıfır egzersiz",
        icon: "bed-outline",
        multiplier: "1.20x",
    },
    {
        key: "hafif egzersiz (haftada 1-2 gün)",
        label: "Hafif Aktivite",
        desc: "Haftada 1-2 gün hafif tempolu spor",
        icon: "walk-outline",
        multiplier: "1.38x",
    },
    {
        key: "orta düzey egzersiz (haftada 3-5 gün)",
        label: "Orta Aktivite",
        desc: "Haftada 3-5 gün orta antrenman",
        icon: "fitness-outline",
        multiplier: "1.55x",
    },
    {
        key: "yoğun egzersiz (haftada 6-7 gün)",
        label: "Yoğun Aktivite",
        desc: "Haftada 6-7 gün ağır spor / antrenman",
        icon: "barbell-outline",
        multiplier: "1.73x",
    },
    {
        key: "atlet (günde 2 kez egzersiz)",
        label: "Ekstra Aktivite / Atlet",
        desc: "Günde çift idman veya ağır fiziksel iş",
        icon: "trophy-outline",
        multiplier: "1.90x",
    },
];

export default function TDEECalculatorPanel({ data, setField }: TDEECalculatorPanelProps) {
    const { isDark, colors } = useTheme();
    const [modalVisible, setModalVisible] = React.useState<"aktivite" | null>(null);

    const activeAktivite = aktiviteOptions.find(o => o.key === data.aktiviteSeviyesi);

    return (
        <View className="w-full">
            {/* Cinsiyet Seçimi (Elegant Segmented Control) */}
            <SegmentedControl
                options={cinsiyetOptions}
                selectedValue={data.cinsiyet}
                onValueChange={(val) => setField("cinsiyet", val)}
                containerStyle={{ marginBottom: 24 }}
            />

            {/* Boy / Kilo / Yaş Inputları (Dashboard Feel) */}
            <View className="flex-row gap-3 mb-6">
                <CompactNumberField
                    label="BOY"
                    unit="cm"
                    value={data.boy}
                    placeholder="175"
                    onChange={(v) => setField("boy", v)}
                />
                <CompactNumberField
                    label="KİLO"
                    unit="kg"
                    value={data.kilo}
                    placeholder="75"
                    onChange={(v) => setField("kilo", v)}
                />
                <CompactNumberField
                    label="YAŞ"
                    unit=""
                    value={data.yas}
                    placeholder="25"
                    onChange={(v) => setField("yas", v)}
                />
            </View>

            {/* Aktivite Seçicisi (Minimalist Native Feel) */}
            <TouchableOpacity
                onPress={() => setModalVisible("aktivite")}
                className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl flex-row justify-between items-center mt-6 border border-slate-100 dark:border-slate-800"
                activeOpacity={0.7}
            >
                <Text className="text-[15px] text-slate-800 dark:text-slate-200 font-medium tracking-tight">
                    {activeAktivite?.label}
                </Text>
                <Feather name="chevron-down" size={18} color={isDark ? "#64748b" : "#94a3b8"} />
            </TouchableOpacity>

            <Modal
                isVisible={modalVisible === "aktivite"}
                onBackdropPress={() => setModalVisible(null)}
                onBackButtonPress={() => setModalVisible(null)}
                onSwipeComplete={() => setModalVisible(null)}
                swipeDirection="down"
                propagateSwipe={true}
                style={{ margin: 0, justifyContent: 'flex-end' }}
                backdropColor="black"
                backdropOpacity={0.4}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                animationInTiming={350}
                animationOutTiming={300}
                backdropTransitionInTiming={350}
                backdropTransitionOutTiming={300}
                statusBarTranslucent={true}
                deviceHeight={undefined}
                deviceWidth={undefined}
            >
                <View className="bg-white dark:bg-slate-900 rounded-t-[3rem] p-6 pt-4 pb-14 shadow-2xl">
                    <View className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full self-center mb-8" />
                    
                    <Text className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 text-center">Aktivite Seviyesi</Text>
                    
                    {aktiviteOptions.map((option) => {
                        const isSelected = data.aktiviteSeviyesi === option.key;
                        return (
                            <TouchableOpacity
                                key={option.key}
                                onPress={() => {
                                    setField("aktiviteSeviyesi", option.key);
                                    setModalVisible(null);
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                                }}
                                style={[
                                    {
                                        width: "100%",
                                        paddingVertical: 12,
                                        paddingHorizontal: 14,
                                        borderRadius: 16,
                                        marginBottom: 10,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        borderWidth: 1,
                                        gap: 12,
                                    },
                                    isSelected ? {
                                        backgroundColor: isDark ? colors.lightAccentDark : colors.lightAccent,
                                        borderColor: isDark ? colors.brandDark + "4D" : colors.bgTint,
                                    } : {
                                        backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                                        borderColor: isDark ? "#1e293b" : "#f1f5f9",
                                    }
                                ]}
                                activeOpacity={0.7}
                            >
                                {/* Sol taraftaki ikon kutusu */}
                                <View style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 10,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: isSelected ? (isDark ? colors.brandDark : colors.primary) : (isDark ? "#1e293b" : "#f1f5f9")
                                }}>
                                    <Ionicons
                                        name={option.icon}
                                        size={20}
                                        color={isSelected ? "#ffffff" : (isDark ? "#94a3b8" : "#64748b")}
                                    />
                                </View>

                                {/* Orta alan: Metinler */}
                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            fontWeight: "700",
                                            color: isSelected ? (isDark ? colors.textTint : colors.primary) : (isDark ? "#cbd5e1" : "#1e293b"),
                                        }}
                                    >
                                        {option.label}
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: 11,
                                            marginTop: 2,
                                            color: isSelected ? (isDark ? colors.textTint + "CC" : colors.primary + "CC") : (isDark ? "#64748b" : "#64748b"),
                                        }}
                                    >
                                        {option.desc}
                                    </Text>
                                </View>

                                {/* Sağ taraftaki çarpan badge'i ve checkmark */}
                                <View style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 6
                                }}>
                                    <View style={{
                                        paddingHorizontal: 8,
                                        paddingVertical: 4,
                                        borderRadius: 8,
                                        backgroundColor: isSelected ? (isDark ? colors.brandDark + "33" : colors.lightAccent) : (isDark ? "#1e293b" : "#f1f5f9"),
                                    }}>
                                        <Text style={{
                                            fontSize: 11,
                                            fontWeight: "700",
                                            color: isSelected ? (isDark ? colors.textTint : colors.primary) : (isDark ? "#94a3b8" : "#64748b"),
                                        }}>
                                            {option.multiplier}
                                        </Text>
                                    </View>
                                    {isSelected && <Feather name="check" size={16} color={isDark ? colors.primaryDark : colors.primary} />}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </Modal>
        </View>
    );
}

function CompactNumberField({
    label,
    unit,
    value,
    placeholder,
    onChange,
}: {
    label: string;
    unit: string;
    value: number;
    placeholder: string;
    onChange: (v: number) => void;
}) {
    const { isDark, colors } = useTheme();
    const [isFocused, setIsFocused] = React.useState(false);
    return (
        <View className="flex-1">
            <Text className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5 text-center">
                {label}
            </Text>
            <View
                style={isFocused ? {
                    borderColor: isDark ? colors.primaryDark : colors.primary,
                    backgroundColor: isDark ? colors.lightAccentDark : colors.lightAccent
                } : null}
                className={`rounded-[24px] px-1 py-3 items-center justify-center border ${
                    isFocused ? "" : "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50"
                }`}
            >
                <View className="flex-row items-center">
                    <TextInput
                        keyboardType="numeric"
                        value={value > 0 ? String(value) : ""}
                        onChangeText={(text) => {
                            const num = parseInt(text, 10);
                            onChange(isNaN(num) ? 0 : num);
                        }}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={placeholder}
                        placeholderTextColor="#94a3b8"
                        returnKeyType="done"
                        blurOnSubmit={true}
                        className="font-black text-3xl text-slate-900 dark:text-white text-center p-0"
                    />
                    {unit ? <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-bold ml-0.5">{unit}</Text> : null}
                </View>
            </View>
        </View>
    );
}
