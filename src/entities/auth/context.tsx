"use client";

import { createContext, useContext } from "react";
import type { SessionUser } from "@/shared/lib/auth-storage";

export type Session = {
  access_token: string;
  refresh_token: string;
  user: SessionUser | null;
};

export type AuthContextValue = {
  user: SessionUser | null;
  ready: boolean;
  startSession: (session: Session) => void;
  logout: () => Promise<void>;
};

/**
 * El Provider real (estado, efectos de sincronización, registro del refresh)
 * vive en app/providers/AuthProvider.tsx — es la capa de composición de la app.
 * El contexto y el hook viven aquí para que pages/widgets/features puedan
 * consumir la sesión sin depender de la capa `app` (regla de dirección de FSD).
 */
export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
