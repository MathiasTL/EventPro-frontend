import Link from "next/link";

import { LOGIN_URL } from "@/shared/config";

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-700 text-lg font-bold text-white"
          >
            E
          </span>
          <span className="text-lg font-bold tracking-tight text-ink">
            EventPro
          </span>
        </Link>

        <nav aria-label="Principal" className="flex items-center gap-6">
          <a
            href="#como-funciona"
            className="text-sm text-muted transition hover:text-ink"
          >
            Cómo funciona
          </a>
          <Link
            href={LOGIN_URL}
            className="text-sm font-semibold text-ink transition hover:text-brand"
          >
            Ingresar
          </Link>
        </nav>
      </div>
    </header>
  );
}
