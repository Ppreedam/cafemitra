const configuredApiBaseUrl = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

export const API_BASE_URL = configuredApiBaseUrl || "http://localhost:8000";

function runtimeApiBaseUrl() {
  if (typeof window === "undefined") return API_BASE_URL;

  const { protocol, hostname } = window.location;
  const configuredIsLocalhost = configuredApiBaseUrl.includes("localhost") || configuredApiBaseUrl.includes("127.0.0.1");
  const pageIsLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
  if (configuredApiBaseUrl && (!configuredIsLocalhost || pageIsLocalhost)) return configuredApiBaseUrl;

  return `${protocol}//${hostname}:8000`;
}

let refreshInFlight: Promise<boolean> | null = null;

export function apiUrl(path: string) {
  const baseUrl = runtimeApiBaseUrl();
  const apiPath = path.startsWith("/") ? path : `/${path}`;

  if (baseUrl.endsWith("/api") && apiPath.startsWith("/api/")) {
    return `${baseUrl}${apiPath.slice(4)}`;
  }

  return `${baseUrl}${apiPath}`;
}

function normalizeApiBaseUrl(value?: string) {
  return value?.trim().replace(/\/+$/, "") || "";
}

export function getAuthToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("cafemitra_token") || "";
}

export function getRefreshToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("cafemitra_refresh_token") || "";
}

export function hasStoredSession() {
  return Boolean(getAuthToken() || getRefreshToken());
}

export function storeSession(data: {
  token?: string;
  refreshToken?: string;
  accessTokenExpiresAt?: string;
  refreshTokenExpiresAt?: string;
  user?: unknown;
  shop?: unknown;
}) {
  if (typeof window === "undefined") return;
  if (data.token) localStorage.setItem("cafemitra_token", data.token);
  if (data.refreshToken) localStorage.setItem("cafemitra_refresh_token", data.refreshToken);
  if (data.accessTokenExpiresAt) localStorage.setItem("cafemitra_token_expires_at", data.accessTokenExpiresAt);
  if (data.refreshTokenExpiresAt) localStorage.setItem("cafemitra_refresh_token_expires_at", data.refreshTokenExpiresAt);
  if (data.user) localStorage.setItem("cafemitra_user", JSON.stringify(data.user));
  if (data.shop) localStorage.setItem("cafemitra_shop", JSON.stringify(data.shop));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("cafemitra_token");
  localStorage.removeItem("cafemitra_refresh_token");
  localStorage.removeItem("cafemitra_token_expires_at");
  localStorage.removeItem("cafemitra_refresh_token_expires_at");
  localStorage.removeItem("cafemitra_user");
  localStorage.removeItem("cafemitra_shop");
  window.dispatchEvent(new Event("cafemitra:session-cleared"));
}

export async function refreshSession() {
  if (refreshInFlight) return refreshInFlight;

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    logoutToLogin();
    return false;
  }

  refreshInFlight = (async () => {
    try {
      const response = await fetch(apiUrl("/api/auth/refresh/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        logoutToLogin();
        return false;
      }

      const data = await response.json();
      storeSession(data);
      return Boolean(data.token);
    } catch {
      logoutToLogin();
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  if (isAccessTokenExpired() && getRefreshToken()) {
    await refreshSession();
  }

  const firstResponse = await fetchWithAuth(path, init);
  if (firstResponse.status !== 401) return firstResponse;

  const refreshed = await refreshSession();
  if (!refreshed) {
    return new Response(JSON.stringify({ message: "Session expired. Please login again." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return fetchWithAuth(path, init);
}

function fetchWithAuth(path: string, init: RequestInit) {
  const headers = new Headers(init.headers);
  const token = getAuthToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return fetch(apiUrl(path), {
    ...init,
    headers,
  });
}

function isAccessTokenExpired() {
  if (typeof window === "undefined") return false;
  const expiresAt = localStorage.getItem("cafemitra_token_expires_at");
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() <= Date.now() + 30_000;
}

function logoutToLogin() {
  clearSession();
  if (typeof window === "undefined") return;
  const currentPath = window.location.pathname;
  if (currentPath !== "/login" && currentPath !== "/register") {
    window.location.replace("/login");
  }
}
