"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/app/providers";
import { Button, RoleBadge } from "@/shared/ui";

export function AuthShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout(): Promise<void> {
    await logout();
    router.replace("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <span className="text-sm font-semibold tracking-tight">EventPro</span>
        <div className="flex items-center gap-3">
          {user ? <RoleBadge role={user.role} /> : null}
          {user && user.full_name ? (
            <span className="text-sm text-zinc-500">{user.full_name}</span>
          ) : null}
          <Button
            variant="ghost"
            type="button"
            onClick={() => void handleLogout()}
          >
            Cerrar sesión
          </Button>
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
