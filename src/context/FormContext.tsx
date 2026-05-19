// src/context/FormContext.tsx
// 3.3: İki ayrı iç context — fiziksel ve diyet verileri birbirinden bağımsız re-render üretmez
import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { KullaniciProfil, Cinsiyet, AktiviteSeviyesi, Hedef, FizikselVeriler, DiyetVerileri } from "../types";
import type { GeneratedPlan } from "../types/diet";
import { calculateTDEE } from "../utils/calculations";

// --- Fiziksel Context ---
interface FizikselContextValue {
    fizikselVeriler: FizikselVeriler;
    setFizikselAlan: <K extends keyof FizikselVeriler>(name: K, value: FizikselVeriler[K]) => void;
    calculatedTDEE: number;
}

// --- Diyet Context ---
interface DiyetContextValue {
    diyetVerileri: DiyetVerileri;
    setDiyetAlan: <K extends keyof DiyetVerileri>(name: K, value: DiyetVerileri[K]) => void;
    generatedPlan: GeneratedPlan | null;
    setGeneratedPlan: React.Dispatch<React.SetStateAction<GeneratedPlan | null>>;
    dietStep: "select-plan" | "preferences" | "generating" | "result";
    setDietStep: React.Dispatch<React.SetStateAction<"select-plan" | "preferences" | "generating" | "result">>;
}

const FizikselContext = createContext<FizikselContextValue | null>(null);
const DiyetContext = createContext<DiyetContextValue | null>(null);

const DEFAULT_FIZIKSEL: FizikselVeriler = {
    boy: 175,
    kilo: 75,
    yas: 25,
    cinsiyet: "erkek" as Cinsiyet,
    yagOrani: 15,
    aktiviteSeviyesi: "hareketsiz (ofis işi)" as AktiviteSeviyesi,
    agirlikCalisiyorMu: false,
};

const DEFAULT_DIYET: DiyetVerileri = {
    diyetTipi: "standart",
    ogunSayisi: 3,
    alerjenler: [],
    kullanilanTakviyeler: [],
    hedef: "kilo_koruma" as Hedef,
};

export function FormProvider({ children }: { children: React.ReactNode }) {
    const [fizikselVeriler, setFizikselVerilerState] = useState<FizikselVeriler>(DEFAULT_FIZIKSEL);
    const [diyetVerileri, setDiyetVerileriState] = useState<DiyetVerileri>(DEFAULT_DIYET);
    const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
    const [dietStep, setDietStep] = useState<"select-plan" | "preferences" | "generating" | "result">("select-plan");

    const setFizikselAlan = useCallback(<K extends keyof FizikselVeriler>(
        name: K,
        value: FizikselVeriler[K]
    ) => {
        setFizikselVerilerState(prev => ({ ...prev, [name]: value }));
    }, []);

    const setDiyetAlan = useCallback(<K extends keyof DiyetVerileri>(
        name: K,
        value: DiyetVerileri[K]
    ) => {
        setDiyetVerileriState(prev => ({ ...prev, [name]: value }));
    }, []);

    const calculatedTDEE = useMemo(
        () => calculateTDEE(fizikselVeriler),
        [fizikselVeriler]
    );

    const fizikselValue = useMemo<FizikselContextValue>(
        () => ({ fizikselVeriler, setFizikselAlan, calculatedTDEE }),
        [fizikselVeriler, setFizikselAlan, calculatedTDEE]
    );

    const diyetValue = useMemo<DiyetContextValue>(
        () => ({ diyetVerileri, setDiyetAlan, generatedPlan, setGeneratedPlan, dietStep, setDietStep }),
        [diyetVerileri, setDiyetAlan, generatedPlan, dietStep]
    );

    return (
        <FizikselContext.Provider value={fizikselValue}>
            <DiyetContext.Provider value={diyetValue}>
                {children}
            </DiyetContext.Provider>
        </FizikselContext.Provider>
    );
}

// --- Odaklanmış hook'lar (yeni API) ---
export function useFizikselContext(): FizikselContextValue {
    const ctx = useContext(FizikselContext);
    if (!ctx) throw new Error("useFizikselContext must be used within FormProvider");
    return ctx;
}

export function useDiyetContext(): DiyetContextValue {
    const ctx = useContext(DiyetContext);
    if (!ctx) throw new Error("useDiyetContext must be used within FormProvider");
    return ctx;
}

// --- Geriye dönük uyumlu birleşik hook (mevcut tüketiciler için) ---
export function useFormContext() {
    const fiziksel = useFizikselContext();
    const diyet = useDiyetContext();

    return useMemo(() => ({
        formData: {
            fizikselVeriler: fiziksel.fizikselVeriler,
            diyetVerileri: diyet.diyetVerileri,
        } satisfies KullaniciProfil,
        setFizikselAlan: fiziksel.setFizikselAlan,
        setDiyetAlan: diyet.setDiyetAlan,
        calculatedTDEE: fiziksel.calculatedTDEE,
        generatedPlan: diyet.generatedPlan,
        setGeneratedPlan: diyet.setGeneratedPlan,
        dietStep: diyet.dietStep,
        setDietStep: diyet.setDietStep,
    }), [fiziksel, diyet]);
}
