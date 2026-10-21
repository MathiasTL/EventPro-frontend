"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";

import { logoutRemote } from "@/shared/api/session";
import {
  clearSession,
  getRefreshToken,
  getToken,
  getUser,
  setSession,
  type SessionUser,
} from "@/shared/lib/auth-storage";

type AuthContextValue = {
  user: SessionUser | null;
  ready: boolean;
  startSession: (token: string, refreshToken: string, user: SessionUser | null) => void;
  logout: () => void;
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

  const startSession = useCallback((token: string, refreshToken: string, nextUser: SessionUser | null) => {
    setSession(token, refreshToken, nextUser);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    // Revoke the refresh token server-side (best effort), then drop the local session.
    void logoutRemote(getToken(), getRefreshToken());
    clearSession();
    setUser(null);
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
