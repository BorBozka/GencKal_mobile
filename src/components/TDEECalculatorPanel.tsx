// src/components/TDEECalculatorPanel.tsx
// Aydınlık tema kilidi uygulanmış TDEECalculatorPanel
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
    { key: "kadin", label: "Kadın" },
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
            <View
                style={{
                    backgroundColor: "#f1f5f9",
                    padding: 4,
                    flexDirection: "row",
                    borderRadius: 16,
                    marginBottom: 24,
                }}
            >
                {cinsiyetOptions.map((option) => (
                    <TouchableOpacity
                        key={option.key}
                        onPress={() => setField("cinsiyet", option.key)}
                        activeOpacity={0.8}
                        style={[
                            {
                                flex: 1,
                                paddingVertical: 10,
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: 12,
                            },
                            data.cinsiyet === option.key ? {
                                backgroundColor: "#1e293b",
                                shadowColor: "#0f172a",
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.05,
                                shadowRadius: 2,
                                elevation: 2,
                            } : {
                                backgroundColor: "transparent",
                            }
                        ]}
                    >
                        <Text
                            style={{
                                color: data.cinsiyet === option.key ? "#ffffff" : "#64748b",
                                fontWeight: data.cinsiyet === option.key ? "700" : "500",
                            }}
                        >
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

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
                className="bg-slate-50 p-4 rounded-2xl flex-row justify-between items-center mt-6 border border-slate-100"
                activeOpacity={0.7}
            >
                <Text className="text-[15px] text-slate-800 font-medium tracking-tight">
                    {activeAktivite?.label} <Text className="text-slate-400 font-normal">({activeAktivite?.desc})</Text>
                </Text>
                <Feather name="chevron-down" size={18} color="#94a3b8" />
            </TouchableOpacity>

            {/* Aktivite Modalı */}
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
                <View className="bg-white rounded-t-[3rem] p-6 pt-4 pb-14 shadow-2xl">
                    <View className="w-12 h-1.5 bg-slate-200 rounded-full self-center mb-8" />
                    
                    <Text className="text-xl font-bold text-slate-900 mb-6 text-center">Aktivite Seviyesi</Text>
                    
                    {aktiviteOptions.map((option) => {
                        const isSelected = data.aktiviteSeviyesi === option.key;
                        return (
                            <TouchableOpacity
                                key={option.key}
                                onPress={() => { setField("aktiviteSeviyesi", option.key); setModalVisible(null); }}
                                style={[
                                    {
                                        width: "100%",
                                        paddingVertical: 20,
                                        paddingHorizontal: 20,
                                        borderRadius: 16,
                                        marginBottom: 12,
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    },
                                    isSelected ? {
                                        backgroundColor: "rgba(238, 242, 255, 0.7)",
                                        borderWidth: 1,
                                        borderColor: "#e0e7ff",
                                    } : {
                                        backgroundColor: "transparent",
                                    }
                                ]}
                                activeOpacity={0.7}
                            >
                                <View>
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            fontWeight: "700",
                                            color: isSelected ? "#312e81" : "#64748b",
                                        }}
                                    >
                                        {option.label}
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: 12,
                                            marginTop: 4,
                                            color: isSelected ? "rgba(79, 70, 229, 0.7)" : "#94a3b8",
                                        }}
                                    >
                                        {option.desc}
                                    </Text>
                                </View>
                                {isSelected && <Feather name="check" size={20} color="#4338ca" />}
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
    return (
        <View className="flex-1">
            <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1.5 text-center">
                {label}
            </Text>
            <View className="bg-slate-50 rounded-[24px] px-1 py-3 items-center justify-center border border-slate-100">
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
                        className="font-black text-3xl text-slate-900 text-center p-0"
                    />
                    {unit ? <Text className="text-[10px] text-slate-400 font-bold ml-0.5">{unit}</Text> : null}
                </View>
            </View>
        </View>
    );
}
