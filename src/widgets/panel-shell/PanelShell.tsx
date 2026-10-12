"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/app/providers/AuthProvider";
import { Button } from "@/shared/ui";

type NavItem = { href: string; label: string; roles: string[] };

const NAV_ITEMS: NavItem[] = [
  { href: "/panel/solicitudes", label: "Solicitudes", roles: ["ENCARGADO", "SUPERADMIN"] },
  { href: "/panel/catalogo", label: "Catálogo", roles: ["ENCARGADO", "SUPERADMIN"] },
  { href: "/panel/sobrecupo", label: "Sobrecupo", roles: ["ENCARGADO", "SUPERADMIN"] },
  { href: "/panel/cronograma", label: "Cronograma", roles: ["ENCARGADO", "SUPERADMIN"] },
  { href: "/panel/pagos", label: "Pagos", roles: ["ENCARGADO", "SUPERADMIN"] },
  { href: "/panel/finanzas", label: "Finanzas", roles: ["ENCARGADO", "SUPERADMIN"] },
  { href: "/panel/usuarios", label: "Usuarios", roles: ["SUPERADMIN"] },
  { href: "/panel/auditoria", label: "Auditoría", roles: ["ENCARGADO", "SUPERADMIN"] },
];

const roleLabels: Record<string, string> = {
  SUPERADMIN: "Superadministrador",
  ENCARGADO: "Encargado",
};

export function PanelShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const items = NAV_ITEMS.filter(item => !user || item.roles.includes(user.role));

  const nav = (
    <nav aria-label="Módulos del panel" className="flex flex-col gap-1">
      {items.map(item => {
        const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMenuOpen(false)}
            aria-current={active ? "page" : undefined}
            className={`rounded-lg px-4 py-2.5 text-sm font-medium ${active ? "bg-violet-700 text-white" : "text-zinc-600 hover:bg-zinc-100"}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 sm:flex-row">
      <aside className="flex-shrink-0 border-b border-zinc-200 bg-white sm:flex sm:w-64 sm:flex-col sm:border-b-0 sm:border-r">
        <div className="flex items-center justify-between gap-3 px-6 py-5">
          <Link href="/panel" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-700 text-lg font-bold text-white">E</span>
            <div>
              <p className="text-lg font-bold tracking-tight">EventPro</p>
              <p className="text-xs text-zinc-500">Panel de operaciones</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(previous => !previous)}
            aria-expanded={menuOpen}
            aria-controls="panel-nav"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 sm:hidden"
          >
            {menuOpen ? "Cerrar" : "Menú"}
          </button>
        </div>
        <div
          id="panel-nav"
          className={`${menuOpen ? "block" : "hidden"} border-t border-zinc-200 px-3 py-3 sm:block sm:flex-1 sm:border-t-0 sm:py-4`}
        >
          {nav}
        </div>
        <div className="hidden border-t border-zinc-200 px-6 py-4 sm:block">
          <p className="text-sm font-medium">{user?.full_name}</p>
          <p className="text-xs text-zinc-500">{user ? roleLabels[user.role] ?? user.role : ""}</p>
          <Button variant="ghost" className="mt-3 w-full" onClick={logout}>Salir</Button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-zinc-200 bg-white px-6 py-4 sm:hidden">
          <div className="text-sm">
            <p className="font-medium">{user?.full_name}</p>
            <p className="text-xs text-zinc-500">{user ? roleLabels[user.role] ?? user.role : ""}</p>
          </div>
          <Button variant="ghost" onClick={logout}>Salir</Button>
        </header>
        <main className="flex-1 px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
