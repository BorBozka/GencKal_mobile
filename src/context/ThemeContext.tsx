import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';

export type ThemeMode = 'aydinlik' | 'karanlik' | 'sistem';
export type AccentColor = 'indigo' | 'yesil' | 'kirmizi';

export interface ThemeColors {
    primary: string;         // Indigo-700 / Forest Green #355E3B
    primaryDark: string;     // Indigo-400 / Light green for dark mode readability
    brandDark: string;       // Indigo-500 / Green accent
    lightAccent: string;     // Indigo-50 / Light green tint
    lightAccentDark: string; // Indigo opacity backdrop / Green opacity backdrop
    textTint: string;        // Indigo-300 / Pastel green
    bgTint: string;          // Indigo-200 / Pastel green background
    shadow: string;          // Shadow color
}

export const ACCENT_PALETTES: Record<AccentColor, ThemeColors> = {
    indigo: {
        primary: "#4338ca",
        primaryDark: "#818cf8",
        brandDark: "#6366f1",
        lightAccent: "#eef2ff",
        lightAccentDark: "rgba(99, 102, 241, 0.15)",
        textTint: "#a5b4fc",
        bgTint: "#c7d2fe",
        shadow: "#4338ca"
    },
    yesil: {
        primary: "#355E3B",
        primaryDark: "#528F5B",
        brandDark: "#467A4E",
        lightAccent: "#f1f6f2",
        lightAccentDark: "rgba(82, 143, 91, 0.15)",
        textTint: "#a7d4b0",
        bgTint: "#cbe6d1",
        shadow: "#355E3B"
    },
    kirmizi: {
        primary: "#CC0000",
        primaryDark: "#ff4444",
        brandDark: "#e00000",
        lightAccent: "#fff0f0",
        lightAccentDark: "rgba(204, 0, 0, 0.15)",
        textTint: "#fca5a5",
        bgTint: "#fecaca",
        shadow: "#CC0000"
    }
};

export interface ThemeContextType {
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    isDark: boolean;
    accentColor: AccentColor;
    setAccentColor: (color: AccentColor) => void;
    colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@genckalculator_theme_mode';
const ACCENT_STORAGE_KEY = '@genckalculator_accent_color';
const LEGACY_THEME_STORAGE_KEY = '@genckal_theme_mode';
const LEGACY_ACCENT_STORAGE_KEY = '@genckal_accent_color';

const isThemeMode = (value: string | null): value is ThemeMode =>
    value === 'aydinlik' || value === 'karanlik' || value === 'sistem';

const isAccentColor = (value: string | null): value is AccentColor =>
    value === 'indigo' || value === 'yesil' || value === 'kirmizi';

export function ThemeProvider({ children }: { children: ReactNode }) {
    const { setColorScheme } = useNativeWindColorScheme();
    const [themeMode, setThemeModeState] = useState<ThemeMode>('sistem');
    const [accentColor, setAccentColorState] = useState<AccentColor>('indigo');
    const [isMounted, setIsMounted] = useState(false);

    // Track the real system scheme via Appearance API (unaffected by NativeWind overrides)
    const [systemScheme, setSystemScheme] = useState<'dark' | 'light'>(
        Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'
    );

    useEffect(() => {
        const listener = Appearance.addChangeListener(({ colorScheme: cs }) => {
            setSystemScheme(cs === 'dark' ? 'dark' : 'light');
        });
        return () => listener.remove();
    }, []);

    // Initial load from storage
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const [storedTheme, legacyTheme, storedAccent, legacyAccent] = await AsyncStorage.multiGet([
                    THEME_STORAGE_KEY,
                    LEGACY_THEME_STORAGE_KEY,
                    ACCENT_STORAGE_KEY,
                    LEGACY_ACCENT_STORAGE_KEY
                ]);

                const themeValue = storedTheme[1];
                const legacyThemeValue = legacyTheme[1];
                const resolvedTheme = isThemeMode(themeValue)
                    ? themeValue
                    : isThemeMode(legacyThemeValue)
                        ? legacyThemeValue
                        : null;
                if (resolvedTheme) {
                    setThemeModeState(resolvedTheme);
                    if (!isThemeMode(themeValue)) {
                        await AsyncStorage.setItem(THEME_STORAGE_KEY, resolvedTheme);
                    }
                }

                const accentValue = storedAccent[1];
                const legacyAccentValue = legacyAccent[1];
                const resolvedAccent = isAccentColor(accentValue)
                    ? accentValue
                    : isAccentColor(legacyAccentValue)
                        ? legacyAccentValue
                        : null;
                if (resolvedAccent) {
                    setAccentColorState(resolvedAccent);
                    if (!isAccentColor(accentValue)) {
                        await AsyncStorage.setItem(ACCENT_STORAGE_KEY, resolvedAccent);
                    }
                }
            } catch (error) {
                console.error("Failed to load theme/accent from storage", error);
            } finally {
                setIsMounted(true);
            }
        };
        loadTheme();
    }, []);

    // Sync NativeWind whenever themeMode or system scheme changes
    const applyToNativeWind = (mode: ThemeMode) => {
        if (mode === 'sistem') {
            // Let NativeWind follow the system natively
            setColorScheme('system');
        } else if (mode === 'karanlik') {
            setColorScheme('dark');
        } else {
            setColorScheme('light');
        }
    };

    useEffect(() => {
        if (!isMounted) return;
        applyToNativeWind(themeMode);
    }, [themeMode, systemScheme, isMounted]);

    const setThemeMode = async (mode: ThemeMode) => {
        setThemeModeState(mode);
        applyToNativeWind(mode);
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
        } catch (error) {
            console.error("Failed to save theme to storage", error);
        }
    };

    const setAccentColor = async (color: AccentColor) => {
        setAccentColorState(color);
        try {
            await AsyncStorage.setItem(ACCENT_STORAGE_KEY, color);
        } catch (error) {
            console.error("Failed to save accent color to storage", error);
        }
    };

    // isDark: direct computation, no dependency on NativeWind's potentially-stale state
    const isDark = themeMode === 'sistem'
        ? systemScheme === 'dark'
        : themeMode === 'karanlik';

    const colors = ACCENT_PALETTES[accentColor];

    if (!isMounted) {
        return null;
    }

    return (
        <ThemeContext.Provider value={{ themeMode, setThemeMode, isDark, accentColor, setAccentColor, colors }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
