/**
 * Reads the `exp` claim (epoch seconds) of a JWT without verifying it.
 * Returns null when the token is missing or malformed.
 */
export function getTokenExpiry(token: string | null): number | null {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const exp = (JSON.parse(json) as { exp?: unknown }).exp;
    return typeof exp === "number" ? exp : null;
  } catch {
    return null;
  }
}

/** Seconds of life left in the token, or 0 when unknown or already expired. */
export function tokenSecondsLeft(token: string | null): number {
  const exp = getTokenExpiry(token);
  return exp === null ? 0 : Math.max(0, exp - Math.floor(Date.now() / 1000));
}
