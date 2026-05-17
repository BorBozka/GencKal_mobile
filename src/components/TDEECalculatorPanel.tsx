// src/components/TDEECalculatorPanel.tsx
import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { Feather } from "@expo/vector-icons";
import { KullaniciProfil, Cinsiyet, AktiviteSeviyesi } from "../types";

interface TDEECalculatorPanelProps {
    data: KullaniciProfil["fizikselVeriler"];
    setField: <K extends keyof KullaniciProfil["fizikselVeriler"]>(
        name: K,
        value: KullaniciProfil["fizikselVeriler"][K]
    ) => void;
}

const cinsiyetOptions: { key: Cinsiyet; label: string }[] = [
    { key: "erkek", label: "Erkek" },
    { key: "kadın", label: "Kadın" },
];

const aktiviteOptions: { key: AktiviteSeviyesi; label: string; desc: string }[] = [
    { key: "hareketsiz (ofis işi)", label: "Hareketsiz", desc: "Ofis işi" },
    { key: "hafif egzersiz (haftada 1-2 gün)", label: "Hafif", desc: "1-2 Gün" },
    { key: "orta düzey egzersiz (haftada 3-5 gün)", label: "Orta", desc: "3-5 Gün" },
    { key: "yoğun egzersiz (haftada 6-7 gün)", label: "Yoğun", desc: "6-7 Gün" },
    { key: "atlet (günde 2 kez egzersiz)", label: "Atlet", desc: "Günde 2x" },
];

export default function TDEECalculatorPanel({ data, setField }: TDEECalculatorPanelProps) {
    const [modalVisible, setModalVisible] = React.useState<"aktivite" | null>(null);

    const activeAktivite = aktiviteOptions.find(o => o.key === data.aktiviteSeviyesi);

    return (
        <View className="w-full">
            {/* Cinsiyet Seçimi (Elegant Segmented Control) */}
            <View className="flex-row bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-1 mb-8">
                {cinsiyetOptions.map((option) => (
                    <TouchableOpacity
                        key={option.key}
                        onPress={() => setField("cinsiyet", option.key)}
                        activeOpacity={0.8}
                        className={`flex-1 py-3 rounded-[14px] items-center ${
                            data.cinsiyet === option.key 
                                ? "bg-white dark:bg-slate-800 shadow-sm" 
                                : ""
                        }`}
                    >
                        <Text className={`text-[13px] font-bold ${data.cinsiyet === option.key ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"}`}>
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Boy / Kilo / Yaş Inputları (Dashboard Feel) */}
            <View className="flex-row gap-4 mb-8">
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
                className="flex-row items-center justify-between bg-slate-50 dark:bg-slate-900/30 rounded-2xl px-5 py-5"
                activeOpacity={0.7}
            >
                <View className="flex-1">
                    <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5">Aktivite Seviyesi</Text>
                    <Text className="text-[15px] text-slate-900 dark:text-white font-semibold" numberOfLines={1}>
                        {activeAktivite?.label} <Text className="text-slate-400 dark:text-slate-500 font-normal">({activeAktivite?.desc})</Text>
                    </Text>
                </View>
                <Feather name="chevron-right" size={18} color="#94a3b8" />
            </TouchableOpacity>

            {/* Aktivite Modalı */}
            <Modal
                isVisible={modalVisible === "aktivite"}
                onBackdropPress={() => setModalVisible(null)}
                onSwipeComplete={() => setModalVisible(null)}
                swipeDirection="down"
                backdropOpacity={0.4}
                style={{ margin: 0, justifyContent: 'flex-end' }}
            >
                <View className="bg-white dark:bg-slate-900 rounded-t-[3rem] p-6 pt-4 pb-14">
                    <View className="w-12 h-1 bg-slate-200 dark:bg-slate-800 rounded-full self-center mb-8" />
                    
                    <Text className="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center">Aktivite Seviyesi</Text>
                    
                    {aktiviteOptions.map((option) => (
                        <TouchableOpacity
                            key={option.key}
                            onPress={() => { setField("aktiviteSeviyesi", option.key); setModalVisible(null); }}
                            className={`w-full py-5 px-5 rounded-2xl mb-3 flex-row justify-between items-center ${
                                data.aktiviteSeviyesi === option.key ? "bg-slate-100 dark:bg-slate-800" : "bg-transparent"
                            }`}
                        >
                            <View>
                                <Text className={`text-[16px] font-bold ${data.aktiviteSeviyesi === option.key ? "text-slate-900 dark:text-white" : "text-slate-500"}`}>
                                    {option.label}
                                </Text>
                                <Text className={`text-[12px] mt-1 ${data.aktiviteSeviyesi === option.key ? "text-slate-500" : "text-slate-400"}`}>
                                    {option.desc}
                                </Text>
                            </View>
                            {data.aktiviteSeviyesi === option.key && <Feather name="check" size={20} color="#6366f1" />}
                        </TouchableOpacity>
                    ))}
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
    return (
        <View className="flex-1">
            <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2.5 text-center">
                {label}
            </Text>
            <View className="bg-slate-50 dark:bg-slate-900/30 rounded-[20px] px-2 py-4 items-center justify-center">
                <View className="flex-row items-baseline">
                    <TextInput
                        keyboardType="numeric"
                        value={value > 0 ? String(value) : ""}
                        onChangeText={(text) => {
                            const num = parseInt(text, 10);
                            onChange(isNaN(num) ? 0 : num);
                        }}
                        placeholder={placeholder}
                        placeholderTextColor="#94a3b8"
                        className="font-black text-2xl text-slate-900 dark:text-white text-center p-0"
                    />
                    {unit ? <Text className="text-[11px] text-slate-400 dark:text-slate-500 font-bold ml-0.5">{unit}</Text> : null}
                </View>
            </View>
        </View>
    );
}
