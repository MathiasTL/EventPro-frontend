"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/entities/auth/context";
import { canAccessConversations } from "@/app/routes/roles";
import { Button } from "@/shared/ui";

const links = [
  { href: "/panel/solicitudes", label: "Solicitudes", visible: () => true },
  { href: "/panel/catalogo", label: "Catálogo", visible: () => true },
  { href: "/panel/sobrecupo", label: "Sobrecupo", visible: () => true },
  { href: "/panel/cronograma", label: "Cronograma", visible: () => true },
  { href: "/panel/pagos", label: "Pagos", visible: () => true },
  { href: "/panel/finanzas", label: "Finanzas", visible: () => true },
  { href: "/panel/usuarios", label: "Usuarios", visible: (role: string) => role === "SUPERADMIN" },
  { href: "/panel/auditoria", label: "Auditoría", visible: () => true },
  { href: "/panel/conversations", label: "Conversaciones", visible: canAccessConversations },
  { href: "/panel/quotes", label: "Cotizaciones", visible: canAccessConversations },
];

/** Single panel header: section links plus user name and logout; only managers and superadmins get a navigation bar (other roles see the restricted notice). */
export function PanelNav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  if (!user || !canAccessConversations(user.role)) return null;
  return (
    <nav aria-label="Secciones del panel" className="flex h-11 shrink-0 items-center gap-1 border-b border-zinc-200 bg-white px-4 sm:px-6">
      {links.filter(link => link.visible(user.role)).map(link => {
        const active = (pathname ?? "").startsWith(link.href);
        return (
          <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} className={`rounded-lg px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-violet-700 ${active ? "bg-violet-50 text-violet-800" : "text-zinc-600 hover:bg-zinc-50"}`}>
            {link.label}
          </Link>
        );
      })}
      <div className="ml-auto flex items-center gap-3 text-sm">
        <span className="hidden text-zinc-700 sm:inline">{user.full_name}</span>
        <Button variant="ghost" onClick={logout}>Salir</Button>
      </div>
    </nav>
  );
}
