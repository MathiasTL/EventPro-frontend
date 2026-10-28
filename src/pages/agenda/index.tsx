"use client";

import { useAuth } from "@/entities/auth/context";
import { Button } from "@/shared/ui";
import { OperatorAgenda } from "@/widgets/operator-agenda/OperatorAgenda";

export function AgendaPage() {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen bg-zinc-50">
      <header className="flex items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-4">
        <div>
          <p className="text-lg font-bold tracking-tight text-zinc-900">Mi agenda</p>
          <p className="text-xs text-zinc-500">{user?.full_name}</p>
        </div>
        <Button variant="ghost" onClick={logout}>Salir</Button>
      </header>
      <div className="mx-auto max-w-2xl space-y-5 px-3 py-5 sm:px-6 sm:py-8">
        <OperatorAgenda />
      </div>
    </main>
  );
}
