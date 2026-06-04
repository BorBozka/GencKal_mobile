import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "./ThemeContext";

type DialogActionStyle = "default" | "cancel" | "destructive";

interface DialogAction {
    label: string;
    style?: DialogActionStyle;
    onPress?: () => void | Promise<void>;
}

interface DialogOptions {
    title: string;
    message?: string;
    icon?: keyof typeof Ionicons.glyphMap | null;
    actions?: DialogAction[];
}

interface AppDialogContextValue {
    showDialog: (options: DialogOptions) => void;
}

const AppDialogContext = createContext<AppDialogContextValue | null>(null);

export function AppDialogProvider({ children }: { children: React.ReactNode }) {
    const { isDark, colors } = useTheme();
    const [dialog, setDialog] = useState<DialogOptions | null>(null);
    const [isActionRunning, setIsActionRunning] = useState(false);

    const closeDialog = useCallback(() => {
        if (isActionRunning) return;
        setDialog(null);
    }, [isActionRunning]);

    const showDialog = useCallback((options: DialogOptions) => {
        setDialog(options);
    }, []);

    const actions = dialog?.actions?.length
        ? dialog.actions
        : [{ label: "Tamam", style: "default" as const }];

    const value = useMemo<AppDialogContextValue>(() => ({ showDialog }), [showDialog]);

    return (
        <AppDialogContext.Provider value={value}>
            {children}
            <Modal
                visible={dialog !== null}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={closeDialog}
            >
                <Pressable
                    onPress={closeDialog}
                    style={{
                    flex: 1,
                    backgroundColor: "rgba(2, 6, 23, 0.58)",
                    justifyContent: "center",
                    paddingHorizontal: 24,
                    }}
                >
                    <Pressable
                        onPress={(event) => event.stopPropagation()}
                        style={{
                        borderRadius: 24,
                        padding: 20,
                        backgroundColor: isDark ? "#0f172a" : "#ffffff",
                        borderWidth: 1,
                        borderColor: isDark ? "#1e293b" : "#e2e8f0",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 12 },
                        shadowOpacity: isDark ? 0.35 : 0.12,
                        shadowRadius: 24,
                        elevation: 12,
                        }}
                    >
                        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: dialog?.icon === null ? 0 : 14 }}>
                            {dialog?.icon !== null && (
                                <View style={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: 14,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: isDark ? colors.lightAccentDark : colors.lightAccent,
                                }}>
                                    <Ionicons
                                        name={dialog?.icon || "information-circle-outline"}
                                        size={22}
                                        color={isDark ? colors.primaryDark : colors.primary}
                                    />
                                </View>
                            )}
                            <View style={{ flex: 1 }}>
                                <Text style={{
                                    fontSize: 18,
                                    lineHeight: 24,
                                    fontWeight: "800",
                                    color: isDark ? "#f8fafc" : "#0f172a",
                                }}>
                                    {dialog?.title}
                                </Text>
                                {dialog?.message && (
                                    <Text style={{
                                        marginTop: 8,
                                        fontSize: 14,
                                        lineHeight: 21,
                                        fontWeight: "500",
                                        color: isDark ? "#94a3b8" : "#64748b",
                                    }}>
                                        {dialog.message}
                                    </Text>
                                )}
                            </View>
                        </View>

                        <View style={{ flexDirection: "row", gap: 10, marginTop: 22 }}>
                            {actions.map((action) => {
                                const isCancel = action.style === "cancel";
                                const isDestructive = action.style === "destructive";
                                const backgroundColor = isDestructive
                                    ? "#dc2626"
                                    : isCancel
                                        ? (isDark ? "#1e293b" : "#f1f5f9")
                                        : (isDark ? colors.brandDark : colors.primary);
                                const textColor = isCancel
                                    ? (isDark ? "#cbd5e1" : "#475569")
                                    : "#ffffff";

                                return (
                                    <TouchableOpacity
                                        key={action.label}
                                        activeOpacity={0.78}
                                        disabled={isActionRunning}
                                        onPress={async () => {
                                            setIsActionRunning(true);
                                            try {
                                                setDialog(null);
                                                await action.onPress?.();
                                            } finally {
                                                setIsActionRunning(false);
                                            }
                                        }}
                                        style={{
                                            flex: 1,
                                            minHeight: 46,
                                            borderRadius: 15,
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor,
                                            opacity: isActionRunning ? 0.72 : 1,
                                        }}
                                    >
                                        <Text style={{ color: textColor, fontSize: 14, fontWeight: "800" }}>
                                            {action.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </AppDialogContext.Provider>
    );
}

export function useAppDialog(): AppDialogContextValue {
    const context = useContext(AppDialogContext);
    if (!context) {
        throw new Error("useAppDialog must be used within AppDialogProvider");
    }

    return context;
}
