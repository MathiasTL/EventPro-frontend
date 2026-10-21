"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/app/providers/AuthProvider";
import { canAccessConversations } from "@/app/routes/roles";

const links = [
  { href: "/panel/catalog", label: "Catálogo", visible: () => true },
  { href: "/panel/conversations", label: "Conversaciones", visible: canAccessConversations },
];

/** Panel section links; only managers and superadmins get a navigation bar (other roles see the restricted notice). */
export function PanelNav() {
  const { user } = useAuth();
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
    </nav>
  );
}
