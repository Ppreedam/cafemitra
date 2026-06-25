export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export function apiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
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
}

export async function refreshSession() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearSession();
    return false;
  }

  const response = await fetch(apiUrl("/api/auth/refresh/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    clearSession();
    return false;
  }

  const data = await response.json();
  storeSession(data);
  return Boolean(data.token);
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const firstResponse = await fetchWithAuth(path, init);
  if (firstResponse.status !== 401) return firstResponse;

  const refreshed = await refreshSession();
  if (!refreshed) return firstResponse;

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
