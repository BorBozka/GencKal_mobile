// src/context/FormContext.tsx
// Shared state between Calculator and Diet tabs
import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { KullaniciProfil, Cinsiyet, AktiviteSeviyesi, Hedef } from "../types";
import { calculateTDEE } from "../utils/calculations";

interface FormContextValue {
    formData: KullaniciProfil;
    setFizikselAlan: <K extends keyof KullaniciProfil["fizikselVeriler"]>(
        name: K,
        value: KullaniciProfil["fizikselVeriler"][K]
    ) => void;
    setDiyetAlan: <K extends keyof KullaniciProfil["diyetVerileri"]>(
        name: K,
        value: KullaniciProfil["diyetVerileri"][K]
    ) => void;
    calculatedTDEE: number;
}

const FormContext = createContext<FormContextValue | null>(null);

export function FormProvider({ children }: { children: React.ReactNode }) {
    const [formData, setFormData] = useState<KullaniciProfil>({
        fizikselVeriler: {
            boy: 175,
            kilo: 75,
            yas: 25,
            cinsiyet: "erkek" as Cinsiyet,
            yagOrani: 15,
            aktiviteSeviyesi: "hareketsiz (ofis işi)" as AktiviteSeviyesi,
            agirlikCalisiyorMu: false,
        },
        diyetVerileri: {
            diyetTipi: "standart",
            ogunSayisi: 3,
            alerjenler: [],
            kullanilanTakviyeler: [],
            hedef: "kilo_koruma" as Hedef,
        },
    });

    const setFizikselAlan = useCallback(<K extends keyof KullaniciProfil["fizikselVeriler"]>(
        name: K,
        value: KullaniciProfil["fizikselVeriler"][K]
    ) => {
        setFormData(prev => ({
            ...prev,
            fizikselVeriler: { ...prev.fizikselVeriler, [name]: value }
        }));
    }, []);

    const setDiyetAlan = useCallback(<K extends keyof KullaniciProfil["diyetVerileri"]>(
        name: K,
        value: KullaniciProfil["diyetVerileri"][K]
    ) => {
        setFormData(prev => ({
            ...prev,
            diyetVerileri: { ...prev.diyetVerileri, [name]: value }
        }));
    }, []);

    const calculatedTDEE = useMemo(
        () => calculateTDEE(formData.fizikselVeriler),
        [formData.fizikselVeriler]
    );

    const value = useMemo(() => ({
        formData,
        setFizikselAlan,
        setDiyetAlan,
        calculatedTDEE,
    }), [formData, setFizikselAlan, setDiyetAlan, calculatedTDEE]);

    return (
        <FormContext.Provider value={value}>
            {children}
        </FormContext.Provider>
    );
}

export function useFormContext() {
    const ctx = useContext(FormContext);
    if (!ctx) throw new Error("useFormContext must be used within FormProvider");
    return ctx;
}
