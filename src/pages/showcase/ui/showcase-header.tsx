"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Wordmark } from "@/shared/ui/Wordmark";

const navigation = [
  { href: "#problema", label: "Problema" },
  { href: "#flujo", label: "Cómo funciona" },
  { href: "#producto", label: "Producto" },
  { href: "#arquitectura", label: "Arquitectura" },
] as const;

function Logo() {
  return (
    <Link href="/" aria-label="EventPro, volver al inicio" className="showcase-logo">
      <Wordmark tone="dark" />
    </Link>
  );
}

export function ShowcaseHeader() {
  const menuRef = useRef<HTMLDetailsElement>(null);

  function closeMenu() {
    if (menuRef.current) menuRef.current.open = false;
  }

  return (
    <header className="showcase-header">
      <div className="showcase-header-inner">
        <Logo />

        <nav aria-label="Navegación principal" className="showcase-desktop-nav">
          {navigation.map(({ href, label }) => (
            <a key={href} href={href} className="showcase-nav-link">
              {label}
            </a>
          ))}
        </nav>

        <div className="showcase-header-actions">
          <Link href="/la-tremenda" className="showcase-client-link">
            Ver sitio del cliente <ArrowUpRight aria-hidden="true" size={17} />
          </Link>
          <Link href="/login" className="showcase-panel-link">
            Ingresar al panel
          </Link>
        </div>

        <details
          ref={menuRef}
          className="showcase-mobile-menu"
          onKeyDown={(event) => {
            if (event.key === "Escape" && menuRef.current?.open) {
              closeMenu();
              menuRef.current.querySelector("summary")?.focus();
            }
          }}
        >
          <summary>Menú <span aria-hidden="true" className="showcase-menu-lines" /></summary>
          <nav aria-label="Navegación móvil" className="showcase-mobile-nav">
            {navigation.map(({ href, label }) => (
              <a key={href} href={href} onClick={closeMenu}>
                {label}
              </a>
            ))}
            <Link href="/la-tremenda" onClick={closeMenu}>Ver sitio del cliente</Link>
            <Link href="/login" onClick={closeMenu}>Ingresar al panel</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
