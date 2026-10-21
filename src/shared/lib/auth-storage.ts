export type SessionUser = {
  id: string;
  full_name: string;
  role: string;
};

const TOKEN_KEY = "eventpro.access_token";
const REFRESH_KEY = "eventpro.refresh_token";
const USER_KEY = "eventpro.user";

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

export function getToken(): string | null {
  if (!hasWindow()) return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (!hasWindow()) return null;
  return window.localStorage.getItem(REFRESH_KEY);
}

export function getUser(): SessionUser | null {
  if (!hasWindow()) return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

/** Replaces the stored token pair (refresh tokens rotate) without touching the user. */
export function setTokens(token: string, refreshToken: string): void {
  if (!hasWindow()) return;
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function setSession(token: string, refreshToken: string, user: SessionUser | null): void {
  if (!hasWindow()) return;
  setTokens(token, refreshToken);
  if (user) {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else window.localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("eventpro:session"));
}

export function clearSession(): void {
  if (!hasWindow()) return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("eventpro:session"));
}
