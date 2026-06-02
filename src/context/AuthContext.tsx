import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getConfiguredApiBaseUrl, parseApiError } from "../services/api";
import type { AuthUser } from "../types";

interface AuthResponse {
    user: AuthUser;
    token: string;
}

interface AuthContextValue {
    user: AuthUser | null;
    token: string | null;
    isLoading: boolean;
    signin: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>;
    signout: () => Promise<void>;
    authHeaders: () => Record<string, string>;
}

const storageKey = "genckal_auth_token";
const AuthContext = createContext<AuthContextValue | null>(null);

const getApiBaseUrlOrThrow = () => {
    const baseUrl = getConfiguredApiBaseUrl();
    if (!baseUrl) {
        throw new Error("API base URL yapılandırılmadı.");
    }

    return baseUrl;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const applyAuth = useCallback(async (auth: AuthResponse) => {
        await AsyncStorage.setItem(storageKey, auth.token);
        setToken(auth.token);
        setUser(auth.user);
    }, []);

    const signout = useCallback(async () => {
        await AsyncStorage.removeItem(storageKey);
        setToken(null);
        setUser(null);
    }, []);

    const authHeaders = useCallback((): Record<string, string> => (
        token ? { Authorization: `Bearer ${token}` } : {}
    ), [token]);

    useEffect(() => {
        let isActive = true;

        const hydrateAuth = async () => {
            const savedToken = await AsyncStorage.getItem(storageKey);
            if (!savedToken) {
                if (isActive) setIsLoading(false);
                return;
            }

            if (isActive) setToken(savedToken);
            try {
                const response = await fetch(`${getApiBaseUrlOrThrow()}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${savedToken}` },
                });
                if (!response.ok) throw new Error(await parseApiError(response));
                const data = await response.json() as { user: AuthUser };
                if (isActive) setUser(data.user);
            } catch {
                await AsyncStorage.removeItem(storageKey);
                if (isActive) {
                    setToken(null);
                    setUser(null);
                }
            } finally {
                if (isActive) setIsLoading(false);
            }
        };

        hydrateAuth();

        return () => {
            isActive = false;
        };
    }, []);

    const signin = useCallback(async (email: string, password: string) => {
        const response = await fetch(`${getApiBaseUrlOrThrow()}/api/auth/signin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
        });
        if (!response.ok) throw new Error(await parseApiError(response));
        await applyAuth(await response.json() as AuthResponse);
    }, [applyAuth]);

    const signup = useCallback(async (name: string, email: string, password: string) => {
        const response = await fetch(`${getApiBaseUrlOrThrow()}/api/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password }),
        });
        if (!response.ok) throw new Error(await parseApiError(response));
        await applyAuth(await response.json() as AuthResponse);
    }, [applyAuth]);

    const value = useMemo<AuthContextValue>(() => ({
        user,
        token,
        isLoading,
        signin,
        signup,
        signout,
        authHeaders,
    }), [user, token, isLoading, signin, signup, signout, authHeaders]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
}
