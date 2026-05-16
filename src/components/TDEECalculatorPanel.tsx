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
    const [modalVisible, setModalVisible] = React.useState<"cinsiyet" | "aktivite" | null>(null);

    const activeAktivite = aktiviteOptions.find(o => o.key === data.aktiviteSeviyesi);
    const activeCinsiyet = cinsiyetOptions.find(o => o.key === data.cinsiyet);

    return (
        <View className="w-full">
            {/* Boy / Kilo / Yaş Inputları */}
            <View className="mb-4">
                <NumberField
                    label="Boy"
                    unit="cm"
                    value={data.boy}
                    placeholder="175"
                    onChange={(v) => setField("boy", v)}
                />
                <NumberField
                    label="Kilo"
                    unit="kg"
                    value={data.kilo}
                    placeholder="75"
                    onChange={(v) => setField("kilo", v)}
                />
                <NumberField
                    label="Yaş"
                    unit=""
                    value={data.yas}
                    placeholder="25"
                    onChange={(v) => setField("yas", v)}
                />
            </View>

            {/* Seçiciler (Trigger Butonlar) */}
            <View className="mt-2 space-y-4">
                <TouchableOpacity
                    onPress={() => setModalVisible("cinsiyet")}
                    className="flex-row items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3.5 mb-3 shadow-sm"
                    activeOpacity={0.7}
                >
                    <Text className="text-sm">
                        <Text className="text-gray-500 dark:text-gray-400 font-normal">Cinsiyet: </Text>
                        <Text className="text-gray-900 dark:text-white font-semibold">{activeCinsiyet?.label}</Text>
                    </Text>
                    <Feather name="chevron-down" size={20} color="#64748b" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setModalVisible("aktivite")}
                    className="flex-row items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3.5 shadow-sm"
                    activeOpacity={0.7}
                >
                    <Text className="text-sm">
                        <Text className="text-gray-500 dark:text-gray-400 font-normal">Aktivite: </Text>
                        <Text className="text-gray-900 dark:text-white font-semibold">{activeAktivite?.label} ({activeAktivite?.desc})</Text>
                    </Text>
                    <Feather name="chevron-down" size={20} color="#64748b" />
                </TouchableOpacity>
            </View>

            {/* Alt Modallar */}
            <Modal
                isVisible={modalVisible === "cinsiyet"}
                onBackdropPress={() => setModalVisible(null)}
                onSwipeComplete={() => setModalVisible(null)}
                swipeDirection="down"
                backdropOpacity={0.3}
                style={{ margin: 0, justifyContent: 'flex-end' }}
            >
                <View className="bg-white rounded-t-[2rem] p-6 pt-4 pb-14">
                    {/* Drag Handle */}
                    <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-6" />
                    
                    <Text className="text-xl font-bold text-slate-900 mb-6 text-center">Cinsiyet Seçimi</Text>
                    
                    {cinsiyetOptions.map((option) => (
                        <TouchableOpacity
                            key={option.key}
                            onPress={() => { setField("cinsiyet", option.key); setModalVisible(null); }}
                            className={`w-full py-4 px-4 rounded-xl mb-3 flex-row justify-between items-center ${
                                data.cinsiyet === option.key ? "bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/50" : "bg-slate-50 border border-slate-100"
                            }`}
                        >
                            <Text className={`text-base font-bold ${data.cinsiyet === option.key ? "text-blue-700 dark:text-blue-400" : "text-slate-700"}`}>
                                {option.label}
                            </Text>
                            {data.cinsiyet === option.key && <Feather name="check" size={20} color="#3b82f6" />}
                        </TouchableOpacity>
                    ))}
                </View>
            </Modal>

            <Modal
                isVisible={modalVisible === "aktivite"}
                onBackdropPress={() => setModalVisible(null)}
                onSwipeComplete={() => setModalVisible(null)}
                swipeDirection="down"
                backdropOpacity={0.3}
                style={{ margin: 0, justifyContent: 'flex-end' }}
            >
                <View className="bg-white rounded-t-[2rem] p-6 pt-4 pb-14">
                    {/* Drag Handle */}
                    <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-6" />
                    
                    <Text className="text-xl font-bold text-slate-900 mb-6 text-center">Aktivite Seviyesi</Text>
                    
                    {aktiviteOptions.map((option) => (
                        <TouchableOpacity
                            key={option.key}
                            onPress={() => { setField("aktiviteSeviyesi", option.key); setModalVisible(null); }}
                            className={`w-full py-4 px-4 rounded-xl mb-3 flex-row justify-between items-center ${
                                data.aktiviteSeviyesi === option.key ? "bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/50" : "bg-slate-50 border border-slate-100"
                            }`}
                        >
                            <View>
                                <Text className={`text-base font-bold ${data.aktiviteSeviyesi === option.key ? "text-blue-700 dark:text-blue-400" : "text-slate-700"}`}>
                                    {option.label}
                                </Text>
                                <Text className={`text-xs mt-1 ${data.aktiviteSeviyesi === option.key ? "text-blue-500" : "text-slate-500"}`}>
                                    {option.desc}
                                </Text>
                            </View>
                            {data.aktiviteSeviyesi === option.key && <Feather name="check" size={20} color="#3b82f6" />}
                        </TouchableOpacity>
                    ))}
                </View>
            </Modal>
        </View>
    );
}

function NumberField({
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
        <View className="flex-row justify-between items-baseline border-b border-slate-100 pb-2 mb-4">
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                {label}
            </Text>
            <View className="flex-row items-baseline bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2">
                <TextInput
                    keyboardType="numeric"
                    value={value > 0 ? String(value) : ""}
                    onChangeText={(text) => {
                        const num = parseInt(text, 10);
                        onChange(isNaN(num) ? 0 : num);
                    }}
                    placeholder={placeholder}
                    placeholderTextColor="#cbd5e1"
                    className="font-bold text-2xl text-slate-900 dark:text-white text-right min-w-[50px] p-0"
                />
                {unit ? <Text className="text-sm text-slate-500 dark:text-slate-400 font-bold ml-1">{unit}</Text> : null}
            </View>
        </View>
    );
}
