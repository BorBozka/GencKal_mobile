import Constants from "expo-constants";

type ExpoApiConfig = {
    apiBaseUrl?: unknown;
    apiPort?: unknown;
};

const DEFAULT_API_PORT = 3000;
let hasWarnedMissingApiHost = false;
let hasWarnedInsecureApiUrl = false;

const trimTrailingSlash = (value: string) => value.replace(/\/$/, "");
const isDevelopment = typeof __DEV__ === "boolean" && __DEV__;

const getConfiguredApiPort = (extra: ExpoApiConfig | undefined) => {
    if (typeof extra?.apiPort === "number" && Number.isFinite(extra.apiPort)) {
        return String(extra.apiPort);
    }

    if (typeof extra?.apiPort === "string" && extra.apiPort.trim()) {
        return extra.apiPort.trim();
    }

    return String(DEFAULT_API_PORT);
};

const extractHostname = (hostUri: string) => {
    const withoutProtocol = hostUri.replace(/^[a-z][a-z\d+\-.]*:\/\//i, "");
    const withoutAuth = withoutProtocol.split("@").pop() ?? withoutProtocol;
    const hostWithPort = withoutAuth.split("/")[0];

    if (hostWithPort.startsWith("[")) {
        return hostWithPort.slice(1, hostWithPort.indexOf("]"));
    }

    return hostWithPort.split(":")[0];
};

const getBrowserHostname = () => {
    const location = (globalThis as { location?: { hostname?: unknown } }).location;
    return typeof location?.hostname === "string" ? location.hostname : "";
};

const getRuntimeApiHost = () => {
    const hostUri = Constants.expoConfig?.hostUri;
    const runtimeHost = typeof hostUri === "string" ? extractHostname(hostUri) : "";
    if (runtimeHost) {
        return runtimeHost;
    }

    const linkingUri = Constants.linkingUri;
    const linkingHost = typeof linkingUri === "string" ? extractHostname(linkingUri) : "";
    if (linkingHost) {
        return linkingHost;
    }

    return getBrowserHostname();
};

const warnMissingApiHost = () => {
    if (hasWarnedMissingApiHost) {
        return;
    }

    hasWarnedMissingApiHost = true;
    console.warn(
        "API base URL yapılandırılamadı. Constants.expoConfig.hostUri, Constants.linkingUri ve browser hostname boş; backend için app.json expo.extra.apiBaseUrl değerini ayarlayın."
    );
};

const warnInsecureApiUrl = (baseUrl: string) => {
    if (hasWarnedInsecureApiUrl) {
        return;
    }

    hasWarnedInsecureApiUrl = true;
    console.warn(
        `Güvensiz API base URL reddedildi: ${baseUrl}. Production için HTTPS kullanın.`
    );
};

const resolveApiBaseUrl = (baseUrl: string) => {
    const trimmedBaseUrl = trimTrailingSlash(baseUrl);
    const normalizedBaseUrl = trimmedBaseUrl.toLowerCase();
    if (normalizedBaseUrl.startsWith("https://")) {
        return trimmedBaseUrl;
    }

    if (isDevelopment && normalizedBaseUrl.startsWith("http://")) {
        return trimmedBaseUrl;
    }

    warnInsecureApiUrl(trimmedBaseUrl);
    return null;
};

export const getConfiguredApiBaseUrl = () => {
    const extra = Constants.expoConfig?.extra as ExpoApiConfig | undefined;
    const configuredBaseUrl = typeof extra?.apiBaseUrl === "string" ? extra.apiBaseUrl.trim() : "";
    if (configuredBaseUrl) {
        return resolveApiBaseUrl(configuredBaseUrl);
    }

    if (!isDevelopment) {
        warnMissingApiHost();
        return null;
    }

    const runtimeHost = getRuntimeApiHost();
    if (!runtimeHost) {
        warnMissingApiHost();
        return null;
    }

    return resolveApiBaseUrl(`http://${runtimeHost}:${getConfiguredApiPort(extra)}`);
};

export const getConfiguredApiBaseUrlOrThrow = () => {
    const baseUrl = getConfiguredApiBaseUrl();
    if (!baseUrl) {
        throw new Error("API base URL yapılandırılmadı.");
    }

    return baseUrl;
};

export async function parseApiError(response: Response): Promise<string> {
    const data = await response.json().catch(() => null);
    return data?.error || `Sunucu hatası (${response.status})`;
}
