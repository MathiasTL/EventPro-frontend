"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/app/providers/AuthProvider";

export function RequireRole({ roles, children }: { roles: readonly string[]; children: ReactNode }) {
  const { user, ready } = useAuth();
  if (!ready || !user) return <p role="status" className="p-8">Cargando sesión…</p>;
  if (!roles.includes(user.role)) return <main className="p-8"><h1 className="text-xl font-semibold">Acceso restringido</h1><p className="mt-3">Tu cuenta no tiene permisos para acceder a esta sección.</p></main>;
  return children;
}
