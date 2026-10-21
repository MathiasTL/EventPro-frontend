import { API_URL } from "@/shared/config/env";
import { clearSession, getRefreshToken, setTokens } from "@/shared/lib/auth-storage";

type TokenPair = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

let inFlight: Promise<string> | null = null;

async function requestRefresh(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token available");

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: "no-store",
  });
  if (!response.ok) {
    // The refresh token is invalid, revoked or expired: the session cannot be renewed.
    if (response.status === 401 || response.status === 403) clearSession();
    throw new Error(`Session refresh failed (${response.status})`);
  }
  const pair = (await response.json()) as TokenPair;
  // Refresh tokens rotate: the previous one is revoked, so always store the new pair.
  setTokens(pair.access_token, pair.refresh_token);
  return pair.access_token;
}

/**
 * Renews the session using the stored refresh token. Single-flight: concurrent
 * callers share one in-flight request. Resolves with the new access token and
 * rejects when renewal fails.
 */
export function refreshSession(): Promise<string> {
  if (!inFlight) {
    inFlight = requestRefresh().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

/** Best-effort server-side logout; never throws. Tokens are passed in because local storage is cleared right after. */
export async function logoutRemote(accessToken: string | null, refreshToken: string | null): Promise<void> {
  if (!accessToken || !refreshToken) return;
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    });
  } catch {
    // Offline or backend down: the local session is cleared anyway.
  }
}
