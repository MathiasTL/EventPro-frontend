"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";

import { useAuth } from "@/entities/auth/context";
import { Button } from "@/shared/ui";

export function RequireRole({
  allow,
  redirectTo = "/login",
  children,
}: {
  allow: string[];
  redirectTo?: string;
  children: ReactNode;
}) {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const allowed = !!user && allow.includes(user.role);

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
    else if (!allowed) router.replace(redirectTo);
  }, [ready, user, allowed, router, redirectTo]);

  if (!ready || !user) {
    return (
      <div className="flex flex-1 items-center justify-center p-10 text-sm text-ep-mute">
        Cargando sesión…
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-10 text-center">
        <h1 className="ep-cond text-2xl leading-none text-ep-ink">Acceso restringido</h1>
        <p className="text-sm text-ep-body">Tu rol no tiene acceso a esta sección.</p>
        <Button variant="ghost" onClick={logout}>Cerrar sesión</Button>
      </div>
    );
  }

  return <>{children}</>;
}
