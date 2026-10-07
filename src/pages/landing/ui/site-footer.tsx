import Link from "next/link";

import { LOGIN_URL } from "@/shared/config";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="text-sm text-muted">
          © {new Date().getFullYear()} EventPro · Lima, Perú
        </p>

        <nav aria-label="Pie de página" className="flex flex-wrap gap-5">
          <a
            href="#como-funciona"
            className="text-sm text-muted transition hover:text-ink"
          >
            Cómo funciona
          </a>
          <Link
            href={LOGIN_URL}
            className="text-sm text-muted transition hover:text-ink"
          >
            Ingresar
          </Link>
        </nav>
      </div>
    </footer>
  );
}
