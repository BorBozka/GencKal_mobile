import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getConfiguredApiBaseUrlOrThrow, parseApiError } from "../services/api";
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

const storageKey = "genckalculator_auth_token";
const legacyStorageKey = "genckal_auth_token";
const AuthContext = createContext<AuthContextValue | null>(null);
let secureStoreAvailable: boolean | null = null;

const isAuthUser = (value: unknown): value is AuthUser => {
    if (!value || typeof value !== "object") return false;
    const user = value as Record<string, unknown>;
    return typeof user.id === "string"
        && typeof user.name === "string"
        && typeof user.email === "string";
};

const isAuthResponse = (value: unknown): value is AuthResponse => {
    if (!value || typeof value !== "object") return false;
    const auth = value as Record<string, unknown>;
    return isAuthUser(auth.user) && typeof auth.token === "string" && auth.token.length > 0;
};

const parseAuthResponse = async (response: Response) => {
    const data: unknown = await response.json();
    if (!isAuthResponse(data)) {
        throw new Error("API'den geçersiz kimlik doğrulama yanıtı alındı.");
    }

    return data;
};

const canUseSecureTokenStorage = async () => {
    if (secureStoreAvailable !== null) {
        return secureStoreAvailable;
    }

    secureStoreAvailable = await SecureStore.isAvailableAsync().catch(() => false);
    return secureStoreAvailable;
};

const saveAuthToken = async (authToken: string) => {
    if (await canUseSecureTokenStorage()) {
        await SecureStore.setItemAsync(storageKey, authToken);
    }

    await AsyncStorage.removeItem(legacyStorageKey);
};

const readAuthToken = async () => {
    if (!await canUseSecureTokenStorage()) {
        await AsyncStorage.removeItem(legacyStorageKey);
        return null;
    }

    const secureToken = await SecureStore.getItemAsync(storageKey);
    if (secureToken) {
        return secureToken;
    }

    const legacySecureToken = await SecureStore.getItemAsync(legacyStorageKey);
    if (legacySecureToken) {
        await SecureStore.setItemAsync(storageKey, legacySecureToken);
        await SecureStore.deleteItemAsync(legacyStorageKey);
        return legacySecureToken;
    }

    const legacyToken = await AsyncStorage.getItem(legacyStorageKey);
    if (!legacyToken) {
        return null;
    }

    await SecureStore.setItemAsync(storageKey, legacyToken);
    await AsyncStorage.removeItem(legacyStorageKey);
    return legacyToken;
};

const deleteAuthToken = async () => {
    if (await canUseSecureTokenStorage()) {
        await SecureStore.deleteItemAsync(storageKey);
        await SecureStore.deleteItemAsync(legacyStorageKey);
    }

    await AsyncStorage.removeItem(legacyStorageKey);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const applyAuth = useCallback(async (auth: AuthResponse) => {
        await saveAuthToken(auth.token);
        setToken(auth.token);
        setUser(auth.user);
    }, []);

    const signout = useCallback(async () => {
        await deleteAuthToken();
        setToken(null);
        setUser(null);
    }, []);

    const authHeaders = useCallback((): Record<string, string> => (
        token ? { Authorization: `Bearer ${token}` } : {}
    ), [token]);

    useEffect(() => {
        let isActive = true;

        const hydrateAuth = async () => {
            try {
                const savedToken = await readAuthToken();
                if (!savedToken) {
                    return;
                }

                if (isActive) setToken(savedToken);
                const response = await fetch(`${getConfiguredApiBaseUrlOrThrow()}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${savedToken}` },
                });
                if (response.status === 401 || response.status === 403) {
                    await deleteAuthToken();
                    if (isActive) {
                        setToken(null);
                        setUser(null);
                    }
                    return;
                }
                if (!response.ok) throw new Error(await parseApiError(response));

                const data: unknown = await response.json();
                const responseUser = data && typeof data === "object"
                    ? (data as Record<string, unknown>).user
                    : null;
                if (!isAuthUser(responseUser)) {
                    throw new Error("API'den geçersiz kullanıcı yanıtı alındı.");
                }

                if (isActive) setUser(responseUser);
            } catch {
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
        const response = await fetch(`${getConfiguredApiBaseUrlOrThrow()}/api/auth/signin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
        });
        if (!response.ok) throw new Error(await parseApiError(response));
        await applyAuth(await parseAuthResponse(response));
    }, [applyAuth]);

    const signup = useCallback(async (name: string, email: string, password: string) => {
        const response = await fetch(`${getConfiguredApiBaseUrlOrThrow()}/api/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password }),
        });
        if (!response.ok) throw new Error(await parseApiError(response));
        await applyAuth(await parseAuthResponse(response));
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
