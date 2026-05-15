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
            <View>
                {/* Cinsiyet */}
                <View className="mb-6">
                    <Text className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-3">
                        Cinsiyet
                    </Text>
                    <View className="flex-row">
                        {cinsiyetOptions.map((option, idx) => (
                            <TouchableOpacity
                                key={option.key}
                                onPress={() => setField("cinsiyet", option.key)}
                                className={`flex-1 h-14 rounded-2xl border-2 items-center justify-center ${
                                    data.cinsiyet === option.key
                                        ? "bg-indigo-50 border-indigo-500"
                                        : "bg-white border-slate-100 shadow-sm"
                                } ${idx === 0 ? "mr-1.5" : "ml-1.5"}`}
                                activeOpacity={0.7}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Text
                                    className={`text-base font-bold ${
                                        data.cinsiyet === option.key
                                            ? "text-indigo-700"
                                            : "text-slate-600"
                                    }`}
                                >
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Boy / Kilo / Yaş Inputları - Dikey Düzen */}
                <View className="mb-6">
                    <View className="mb-4">
                        <NumberField
                            label="Boy"
                            unit="cm"
                            value={data.boy}
                            placeholder="175"
                            onChange={(v) => setField("boy", v)}
                        />
                    </View>
                    <View className="mb-4">
                        <NumberField
                            label="Kilo"
                            unit="kg"
                            value={data.kilo}
                            placeholder="75"
                            onChange={(v) => setField("kilo", v)}
                        />
                    </View>
                    <View>
                        <NumberField
                            label="Yaş"
                            unit="yaş"
                            value={data.yas}
                            placeholder="25"
                            onChange={(v) => setField("yas", v)}
                        />
                    </View>
                </View>

                {/* Aktivite Seviyesi */}
                <View>
                    <Text className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-3">
                        Aktivite Seviyesi
                    </Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerClassName="pr-4"
                        keyboardShouldPersistTaps="always"
                    >
                        {aktiviteOptions.map((option, idx) => (
                            <TouchableOpacity
                                key={option.key}
                                onPress={() => setField("aktiviteSeviyesi", option.key)}
                                className={`px-5 py-3.5 rounded-2xl border-2 items-center justify-center min-w-[100px] ${
                                    data.aktiviteSeviyesi === option.key
                                        ? "bg-indigo-50 border-indigo-500"
                                        : "bg-white border-slate-100 shadow-sm"
                                } ${idx > 0 ? "ml-3" : ""}`}
                                activeOpacity={0.7}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Text
                                    className={`text-sm font-bold mb-1 ${
                                        data.aktiviteSeviyesi === option.key
                                            ? "text-indigo-700"
                                            : "text-slate-700"
                                    }`}
                                >
                                    {option.label}
                                </Text>
                                <Text
                                    className={`text-[11px] font-medium ${
                                        data.aktiviteSeviyesi === option.key
                                            ? "text-indigo-500"
                                            : "text-slate-400"
                                    }`}
                                >
                                    {option.desc}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
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
        <View>
            <Text className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2">
                {label}
            </Text>
            <View className="h-14 bg-white shadow-sm border-2 border-slate-100 rounded-2xl flex-row items-center px-4">
                <TextInput
                    keyboardType="numeric"
                    value={value > 0 ? String(value) : ""}
                    onChangeText={(text) => {
                        const num = parseInt(text, 10);
                        onChange(isNaN(num) ? 0 : num);
                    }}
                    placeholder={placeholder}
                    placeholderTextColor="#cbd5e1"
                    className="flex-1 font-bold text-xl text-slate-900"
                />
                <Text className="text-base text-slate-400 font-bold ml-2">{unit}</Text>
            </View>
        </View>
    );
}
