"use client";

import { useAuth } from "@/app/providers/AuthProvider";
import { Button, ComingSoon } from "@/shared/ui";

export function UsuariosPage() {
  const { user, logout } = useAuth();

  if (user && user.role !== "SUPERADMIN") {
    return (
      <main className="mx-auto max-w-5xl p-10 text-center">
        <h1 className="text-xl font-semibold">Acceso restringido</h1>
        <p className="my-4 text-sm text-zinc-500">Este módulo requiere una cuenta de superadministrador.</p>
        <Button variant="ghost" onClick={logout}>Cerrar sesión</Button>
      </main>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-700">Panel de operaciones</p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Usuarios</h1>
        <p className="mt-2 text-sm text-zinc-500">Alta, baja y cambio de contraseña de cuentas del panel.</p>
      </div>
      <ComingSoon
        title="Módulo en construcción"
        description="Aquí se gestionarán las cuentas del sistema (GET/POST /users, PATCH /users/{id})."
      />
    </div>
  );
}
