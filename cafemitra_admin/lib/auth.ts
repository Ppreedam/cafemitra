const TOKEN_KEY = "repetigo_admin_token";
const REFRESH_TOKEN_KEY = "repetigo_admin_refresh_token";
const ACCESS_EXPIRES_KEY = "repetigo_admin_token_expires_at";
const REFRESH_EXPIRES_KEY = "repetigo_admin_refresh_token_expires_at";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(token: string, refreshToken: string, accessTokenExpiresAt?: string, refreshTokenExpiresAt?: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  if (accessTokenExpiresAt) window.localStorage.setItem(ACCESS_EXPIRES_KEY, accessTokenExpiresAt);
  if (refreshTokenExpiresAt) window.localStorage.setItem(REFRESH_EXPIRES_KEY, refreshTokenExpiresAt);
}

export function clearTokens() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(ACCESS_EXPIRES_KEY);
  window.localStorage.removeItem(REFRESH_EXPIRES_KEY);
}

// True once the access token is expired or about to expire (30s buffer) -
// used to refresh proactively before a request, not just react to a 401.
export function isAccessTokenExpired(): boolean {
  if (typeof window === "undefined") return false;
  const expiresAt = window.localStorage.getItem(ACCESS_EXPIRES_KEY);
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() <= Date.now() + 30_000;
}
