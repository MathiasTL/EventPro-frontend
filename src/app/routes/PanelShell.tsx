"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/entities/auth/context";
import { canAccessConversations } from "@/app/routes/roles";
import { Wordmark } from "@/shared/ui/Wordmark";

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

/**
 * Panel frame: an ink rail on the left (desktop) or a compact ink top bar with a menu disclosure (phone).
 * Only managers and superadmins get the navigation (other roles see the restricted notice of their page).
 */
export function PanelShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname() ?? "";
  const [openFor, setOpenFor] = useState<string | null>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const navId = useId();
  // The drawer closes by itself on navigation: it is open only for the pathname it was opened on.
  const open = openFor === pathname;

  if (!user || !canAccessConversations(user.role)) return <div className="ep-panel flex min-h-0 flex-1 flex-col">{children}</div>;

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape" && open) {
      event.stopPropagation();
      setOpenFor(null);
      menuButton.current?.focus();
    }
  }

  return (
    <div className="ep-panel flex min-h-0 flex-1 flex-col bg-ep-wash lg:flex-row" onKeyDown={onKeyDown}>
      <div className="flex h-12 shrink-0 items-center justify-between bg-ep-ink pl-4 pr-2 lg:hidden sticky top-0 z-40">
        <Wordmark />
        <button
          ref={menuButton}
          type="button"
          aria-expanded={open}
          aria-controls={navId}
          onClick={() => setOpenFor(open ? null : pathname)}
          className="flex h-11 min-w-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold text-ep-pass focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ep-pass"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
            {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
          Menú
        </button>
      </div>
      <aside
        id={navId}
        className={`${open ? "flex" : "hidden"} fixed inset-x-0 bottom-0 top-12 z-30 flex-col overflow-y-auto bg-ep-ink px-3 pb-4 pt-3 text-ep-rail-text lg:static lg:z-auto lg:flex lg:h-dvh lg:w-52 lg:shrink-0 lg:pt-5 lg:sticky lg:top-0`}
      >
        <div className="hidden px-2 pb-5 lg:block"><Wordmark /></div>
        <nav aria-label="Secciones del panel" className="flex flex-col gap-0.5">
          {links.filter(link => link.visible(user.role)).map(link => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center gap-2.5 rounded-md px-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ep-pass lg:min-h-9 ${active ? "bg-ep-pass font-bold text-ep-ink focus-visible:outline-ep-magenta" : "hover:bg-ep-ink-2 hover:text-ep-pass"}`}
              >
                <span aria-hidden="true" className={`h-1.5 w-1.5 shrink-0 rounded-[2px] border-[1.5px] ${active ? "border-ep-magenta bg-ep-magenta" : "border-ep-ink-mute"}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-ep-ink-line px-2 pt-3.5 text-sm">
          <span className="min-w-0 truncate" title={user.full_name}>{user.full_name}</span>
          <button
            type="button"
            onClick={logout}
            className="flex min-h-11 shrink-0 items-center rounded-md border border-ep-ink-mute px-3 text-xs font-semibold text-ep-pass hover:bg-ep-ink-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ep-pass lg:min-h-8"
          >
            Salir
          </button>
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
