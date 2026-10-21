import { API_URL } from "@/shared/config/env";
import { clearSession, getRefreshToken, getToken, setTokens } from "@/shared/lib/auth-storage";
import { tokenSecondsLeft } from "@/shared/lib/jwt";

type TokenPair = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

/** The session cannot be renewed (no, invalid, revoked or expired refresh token). Any other refresh failure is transient. */
export class SessionRejectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SessionRejectedError";
  }
}

let inFlight: Promise<string> | null = null;

async function requestRefresh(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new SessionRejectedError("No refresh token available");

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: "no-store",
  });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      // Refresh tokens are single-use: if the stored one changed, another tab already rotated it and its pair is valid.
      const stored = getRefreshToken();
      const accessToken = getToken();
      if (stored && stored !== refreshToken && accessToken) return accessToken;
      // The refresh token is invalid, revoked or expired: the session cannot be renewed.
      clearSession();
      throw new SessionRejectedError(`Session refresh rejected (${response.status})`);
    }
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

/**
 * Rotates the pair for the logout call only. It does not go through `refreshSession` because that one stores the
 * new pair, and the local session is cleared right after logout starts: storing would resurrect it.
 */
async function renewForLogout(refreshToken: string): Promise<TokenPair | null> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    });
    return response.ok ? ((await response.json()) as TokenPair) : null;
  } catch {
    return null;
  }
}

const postLogout = (accessToken: string, refreshToken: string) =>
  fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: "no-store",
  });

/**
 * Best-effort server-side logout; never throws. Tokens are passed in because local storage is cleared right after.
 * The endpoint needs a valid access token: when it is expired (or answers 401) the pair is renewed once and the
 * call is retried once. Any failure is ignored, the local session is cleared anyway.
 */
export async function logoutRemote(accessToken: string | null, refreshToken: string | null): Promise<void> {
  if (!accessToken || !refreshToken) return;
  try {
    let access = accessToken;
    let refresh = refreshToken;
    let renewed = false;
    const renew = async () => {
      renewed = true;
      const pair = await renewForLogout(refresh);
      if (!pair) return false;
      access = pair.access_token;
      refresh = pair.refresh_token;
      return true;
    };

    if (tokenSecondsLeft(access) === 0 && !(await renew())) return;
    const response = await postLogout(access, refresh);
    if (response.status === 401 && !renewed && (await renew())) await postLogout(access, refresh);
  } catch {
    // Offline or backend down: the local session is cleared anyway.
  }
}
