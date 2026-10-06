"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  login as loginApi,
  logout as logoutApi,
  refreshSession,
  tokenStore,
} from "@/shared/api";
import { decodeJwt, type JwtClaims } from "@/shared/lib/jwt";
import type { AuthUser, LoginRequest } from "@/shared/types";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  login: (credentials: LoginRequest) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function userFromToken(access: string): AuthUser | null {
  const claims: JwtClaims | null = decodeJwt(access);
  if (!claims) return null;
  return { id: claims.sub, full_name: "", role: claims.role };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let active = true;

    async function restore(): Promise<void> {
      if (!tokenStore.getRefresh()) {
        if (active) setStatus("unauthenticated");
        return;
      }
      try {
        const accessToken = await refreshSession();
        const restored = userFromToken(accessToken);
        if (!active) return;
        if (restored) {
          setUser(restored);
          setStatus("authenticated");
        } else {
          tokenStore.clear();
          setStatus("unauthenticated");
        }
      } catch {
        if (active) setStatus("unauthenticated");
      }
    }

    void restore();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    const data = await loginApi(credentials);
    setUser(data.user);
    setStatus("authenticated");
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await logoutApi();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo(
    () => ({ status, user, login, logout }),
    [status, user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
