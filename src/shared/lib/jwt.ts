import type { Role } from "@/shared/types";

export interface JwtClaims {
  sub: string;
  role: Role;
  exp: number;
}

export function decodeJwt(token: string): JwtClaims | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    const claims = JSON.parse(json) as Partial<JwtClaims>;
    if (typeof claims.sub !== "string" || typeof claims.role !== "string") {
      return null;
    }
    return claims as JwtClaims;
  } catch {
    return null;
  }
}
