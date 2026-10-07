"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/app/providers";
import { Button, RoleBadge } from "@/shared/ui";

const NAV = [
  { href: "/panel", label: "Bandeja de Leads" },
  { href: "/pagos", label: "Validación Pagos" },
  { href: "/agenda", label: "Cronograma" },
];

export function AuthShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout(): Promise<void> {
    await logout();
    router.replace("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background font-body text-sm text-on-surface">
      <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-6">
        <div className="flex items-center gap-5">
          <Link href="/panel" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-primary text-on-primary">
              <span className="material-symbols-outlined text-base">dashboard_customize</span>
            </span>
            <span className="font-headline text-[18px] font-bold tracking-tight">EventPro Ops</span>
            <span className="rounded border border-outline-variant bg-surface-container px-1.5 py-0.5 font-label text-[10px] font-semibold text-on-surface-variant">
              LIMA NODE
            </span>
          </Link>
          <div className="hidden items-center lg:flex">
            <nav className="flex items-center gap-5" aria-label="Principal">
              {NAV.map((item) => {
                const active = pathname === item.href || (item.href === "/pagos" && pathname?.startsWith("/pagos"));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      active
                        ? "border-b-2 border-primary pb-1 font-headline text-[15px] font-semibold text-primary"
                        : "rounded px-2 py-1 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user ? <RoleBadge role={user.role} /> : null}
          {user?.full_name ? (
            <span className="hidden font-headline text-[15px] xl:block">{user.full_name}</span>
          ) : null}
          <Button variant="ghost" type="button" onClick={() => void handleLogout()}>
            Cerrar sesión
          </Button>
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
