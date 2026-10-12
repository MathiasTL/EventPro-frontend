"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";

import { logout as logoutRequest, refresh as refreshRequest } from "@/entities/auth/api";
import { registerUnauthorizedHandler } from "@/shared/api/client";
import {
  clearSession,
  getRefreshToken,
  getUser,
  setSession,
  type SessionUser,
} from "@/shared/lib/auth-storage";

type Session = {
  access_token: string;
  refresh_token: string;
  user: SessionUser | null;
};

type AuthContextValue = {
  user: SessionUser | null;
  ready: boolean;
  startSession: (session: Session) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const subscribeReady = () => () => {};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(getUser);
  const ready = useSyncExternalStore(subscribeReady, () => true, () => false);

  useEffect(() => {
    const sync = () => setUser(getUser());
    window.addEventListener("eventpro:session", sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("eventpro:session", sync); window.removeEventListener("storage", sync); };
  }, []);

  const startSession = useCallback((session: Session) => {
    setSession(session);
    setUser(session.user);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try { await logoutRequest(refreshToken); } catch { /* revocamos localmente aunque el backend no responda */ }
    }
    clearSession();
    setUser(null);
  }, []);

  useEffect(() => {
    const handler = async (): Promise<string | null> => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) return null;
      try {
        const session = await refreshRequest(refreshToken);
        setSession({ access_token: session.access_token, refresh_token: session.refresh_token, user: getUser() });
        return session.access_token;
      } catch {
        clearSession();
        setUser(null);
        return null;
      }
    };
    registerUnauthorizedHandler(handler);
    return () => registerUnauthorizedHandler(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready, startSession, logout }),
    [user, ready, startSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
