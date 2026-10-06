"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/app/providers";
import { HOME_BY_ROLE } from "@/shared/config";
import type { Role } from "@/shared/types";
import { AuthShell } from "./auth-shell";

interface RoleGuardProps {
  roles: readonly Role[];
  children: ReactNode;
}

export function RoleGuard({ roles, children }: RoleGuardProps) {
  const { status, user } = useAuth();
  const router = useRouter();

  const authorized =
    status === "authenticated" && user !== null && roles.includes(user.role);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (user && !roles.includes(user.role)) {
      router.replace(HOME_BY_ROLE[user.role] ?? "/login");
    }
  }, [status, user, roles, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
        Cargando...
      </div>
    );
  }

  if (!authorized) return null;
  return <AuthShell>{children}</AuthShell>;
}

export function PanelGuard({ children }: { children: ReactNode }) {
  return (
    <RoleGuard roles={["SUPERADMIN", "ENCARGADO"] as const}>
      {children}
    </RoleGuard>
  );
}

export function AgendaGuard({ children }: { children: ReactNode }) {
  return <RoleGuard roles={["OPERADOR"] as const}>{children}</RoleGuard>;
}
