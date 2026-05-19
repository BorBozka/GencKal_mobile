// src/components/InputPanel.tsx
// Web'deki <input type="range"> → @react-native-community/slider dönüşümü (Aydınlık tema kilidi)
import React from "react";
import { View, Text, TextInput } from "react-native";
import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";
import type { KullaniciProfil } from "../types";

export interface InputPanelProps {
    data: KullaniciProfil["fizikselVeriler"];
    setField: <K extends keyof KullaniciProfil["fizikselVeriler"]>(
        name: K,
        value: KullaniciProfil["fizikselVeriler"][K]
    ) => void;
}

const sliderConfig = [
    { name: "boy" as const, label: "Boy", unit: "cm", min: 120, max: 220 },
    { name: "kilo" as const, label: "Kilo", unit: "kg", min: 30, max: 160 },
    { name: "yagOrani" as const, label: "Yağ Oranı", unit: "%", min: 1, max: 60 },
] as const;

export default function InputPanel({ data, setField }: InputPanelProps) {
    // Haptic ref — useEffect yerine ilk erişimde lazy-init (3.10)
    const lastHapticValues = React.useRef<Record<string, number>>({});

    // 3.2: Her slider için yerel state — context'i her piksel hareketinde değil,
    // yalnızca sürükleme bittiğinde (onSlidingComplete) güncelle
    const [localVals, setLocalVals] = React.useState<Record<string, number>>(() => {
        const init: Record<string, number> = {};
        sliderConfig.forEach(s => { init[s.name] = data[s.name] || 0; });
        return init;
    });

    // data prop değişirse (context dışından — örn. reset) yerel state'i sync et
    React.useEffect(() => {
        setLocalVals(prev => {
            const next = { ...prev };
            sliderConfig.forEach(s => { next[s.name] = data[s.name] || 0; });
            return next;
        });
    }, [data]);

    return (
        <View className="w-full">
            {sliderConfig.map((slider) => {
                const val = data[slider.name] || 0;
                return (
                    <View key={slider.name} className="mb-10">
                        {/* Üst Satır: Label + Değer */}
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-base font-bold text-slate-700 tracking-wide">
                                {slider.label}
                            </Text>
                            <View className="flex-row items-baseline bg-slate-100 rounded-xl px-4 py-2 mr-2">
                                <TextInput
                                    keyboardType="numeric"
                                    value={val > 0 ? String(val) : ""}
                                    onChangeText={(text) => {
                                        const num = parseInt(text, 10);
                                        if (!isNaN(num)) {
                                            // 2.5: Klavye girişini slider sınırlarıyla sınırla
                                            const clamped = Math.max(slider.min, Math.min(slider.max, num));
                                            setField(slider.name, clamped);
                                        } else if (text === "") {
                                            setField(slider.name, 0);
                                        }
                                    }}
                                    className="text-2xl font-black text-slate-900 leading-none min-w-[50px] text-right p-0"
                                />
                                {slider.unit ? (
                                    <Text className="text-sm text-slate-500 font-bold ml-1">
                                        {slider.unit}
                                    </Text>
                                ) : null}
                            </View>
                        </View>

                        {/* Slider */}
                        <View className="w-full py-1">
                            <Slider
                                minimumValue={slider.min}
                                maximumValue={slider.max}
                                step={1}
                                value={Math.max(slider.min, localVals[slider.name] ?? val)}
                                onValueChange={(v) => {
                                    const rounded = Math.round(v);
                                    setLocalVals(prev => ({ ...prev, [slider.name]: rounded }));
                                    // Haptic: yalnızca değer değiştiğinde tetikle
                                    if (lastHapticValues.current[slider.name] !== rounded) {
                                        lastHapticValues.current[slider.name] = rounded;
                                        Haptics.selectionAsync().catch(() => {});
                                    }
                                }}
                                onSlidingComplete={(v) => {
                                    // 3.2: Context’e yalnızca sürükleme bitince yaz
                                    const rounded = Math.round(v);
                                    const clamped = Math.max(slider.min, Math.min(slider.max, rounded));
                                    setField(slider.name, clamped);
                                }}
                                minimumTrackTintColor="#4338ca"
                                maximumTrackTintColor="rgba(0,0,0,0.1)"
                                thumbTintColor="#4338ca"
                                style={{ height: 40, width: "100%" }}
                            />
                        </View>

                        {/* Alt Satır: Min/Max */}
                        <View className="flex-row justify-between mt-0.5">
                            <Text className="text-xs text-slate-400 font-medium">
                                {slider.min} {slider.unit}
                            </Text>
                            <Text className="text-xs text-slate-400 font-medium">
                                {slider.max} {slider.unit}
                            </Text>
                        </View>
                    </View>
                );
            })}
        </View>
    );
}
