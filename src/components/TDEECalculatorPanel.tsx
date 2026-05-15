// src/components/TDEECalculatorPanel.tsx
import React from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity } from "react-native";
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
    return (
        <View className="w-full">
            {/* Cinsiyet */}
            <View className="mb-8 border-b border-slate-200/50 pb-6">
                <Text className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                    Cinsiyet
                </Text>
                <View className="flex-row">
                    {cinsiyetOptions.map((option, idx) => (
                        <View key={option.key} className={`flex-1 ${idx === 0 ? "mr-2" : "ml-2"}`}>
                            <TouchableOpacity
                                onPress={() => setField("cinsiyet", option.key)}
                                className={`w-full flex-row items-center justify-center py-3 rounded-xl ${
                                    data.cinsiyet === option.key
                                        ? "bg-indigo-600"
                                        : "bg-slate-200/50"
                                }`}
                                activeOpacity={0.7}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Text
                                    numberOfLines={1}
                                    className={`text-sm font-bold tracking-wide text-center flex-shrink-0 ${
                                        data.cinsiyet === option.key
                                            ? "text-white"
                                            : "text-slate-600"
                                    }`}
                                >
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </View>

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
                    unit="yaş"
                    value={data.yas}
                    placeholder="25"
                    onChange={(v) => setField("yas", v)}
                />
            </View>

            {/* Aktivite Seviyesi */}
            <View className="mt-4">
                <Text className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                    Aktivite Seviyesi
                </Text>
                <View className="flex-row flex-wrap justify-between">
                    {aktiviteOptions.map((option) => (
                        <View key={option.key} className="w-[48%] mb-3">
                            <TouchableOpacity
                                onPress={() => setField("aktiviteSeviyesi", option.key)}
                                className={`w-full px-3 py-4 rounded-xl items-center justify-center ${
                                    data.aktiviteSeviyesi === option.key
                                        ? "bg-indigo-600"
                                        : "bg-slate-200/50"
                                }`}
                                activeOpacity={0.7}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Text
                                    className={`text-xs font-bold mb-1 text-center ${
                                        data.aktiviteSeviyesi === option.key
                                            ? "text-white"
                                            : "text-slate-700"
                                    }`}
                                >
                                    {option.label}
                                </Text>
                                <Text
                                    className={`text-[10px] font-medium text-center ${
                                        data.aktiviteSeviyesi === option.key
                                            ? "text-indigo-200"
                                            : "text-slate-500"
                                    }`}
                                >
                                    {option.desc}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </View>
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
            <View className="flex-row items-baseline">
                <TextInput
                    keyboardType="numeric"
                    value={value > 0 ? String(value) : ""}
                    onChangeText={(text) => {
                        const num = parseInt(text, 10);
                        onChange(isNaN(num) ? 0 : num);
                    }}
                    placeholder={placeholder}
                    placeholderTextColor="#cbd5e1"
                    className="font-bold text-2xl text-slate-900 text-right min-w-[60px] px-0 pb-0"
                />
                <Text className="text-sm text-slate-400 font-bold ml-1">{unit}</Text>
            </View>
        </View>
    );
}
