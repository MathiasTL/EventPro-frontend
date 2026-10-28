"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/entities/auth/context";
import { listUsers } from "@/entities/user/api";
import { ROLE_LABELS, type PanelUser, type UserRole } from "@/entities/user/types";
import { UserTable } from "@/widgets/user-table/UserTable";
import { Button, EmptyState, ErrorBanner, Field, Input, Select } from "@/shared/ui";

const PAGE_SIZE = 20;

type FilterDraft = { role: UserRole | ""; isActive: "" | "true" | "false"; q: string };
const EMPTY_FILTERS: FilterDraft = { role: "", isActive: "", q: "" };

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

  return <UsuariosPageContent currentUserId={user?.id ?? ""} />;
}

function UsuariosPageContent({ currentUserId }: { currentUserId: string }) {
  const [draft, setDraft] = useState<FilterDraft>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<FilterDraft>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<PanelUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const query = {
    role: applied.role || undefined,
    is_active: applied.isActive === "" ? undefined : applied.isActive === "true",
    q: applied.q.trim() || undefined,
    page,
    page_size: PAGE_SIZE,
  };

  async function load() {
    try {
      const result = await listUsers(query);
      setItems(result.items);
      setTotal(result.total);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    listUsers(query)
      .then(result => { if (!cancelled) { setItems(result.items); setTotal(result.total); setError(null); } })
      .catch(caught => { if (!cancelled) setError(caught instanceof Error ? caught.message : "No se pudieron cargar los usuarios."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applied, page]);

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setSuccess(null);
    setApplied(draft);
    setPage(1);
  }

  function goToPage(next: number) {
    setLoading(true);
    setPage(next);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-700">Panel de operaciones</p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Usuarios</h1>
        <p className="mt-2 text-sm text-zinc-500">Alta, edición y activación de cuentas del panel.</p>
      </div>

      <form onSubmit={applyFilters} className="flex flex-wrap items-end gap-4 rounded-2xl border border-zinc-200 bg-white p-4">
        <Field label="Buscar">
          <Input value={draft.q} onChange={event => setDraft({ ...draft, q: event.target.value })} placeholder="Nombre, correo o teléfono" className="w-56" />
        </Field>
        <Field label="Rol">
          <Select value={draft.role} onChange={event => setDraft({ ...draft, role: event.target.value as UserRole | "" })} className="w-44">
            <option value="">Todos los roles</option>
            {Object.entries(ROLE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </Select>
        </Field>
        <Field label="Estado">
          <Select value={draft.isActive} onChange={event => setDraft({ ...draft, isActive: event.target.value as "" | "true" | "false" })} className="w-36">
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </Select>
        </Field>
        <Button type="submit" disabled={loading}>{loading ? "Filtrando…" : "Filtrar"}</Button>
      </form>

      {success && <p role="status" className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{success}</p>}
      <ErrorBanner message={error} />

      {loading ? (
        <p role="status" className="py-12 text-center text-sm text-zinc-500">Cargando usuarios…</p>
      ) : !error && items.length === 0 ? (
        <EmptyState message="No hay usuarios que coincidan con los filtros aplicados." />
      ) : !error && (
        <>
          <UserTable users={items} currentUserId={currentUserId} onReload={load} onSuccess={setSuccess} />
          {total > PAGE_SIZE && (
            <div className="flex items-center justify-end gap-3">
              <Button variant="ghost" disabled={page === 1} onClick={() => goToPage(page - 1)}>Anterior</Button>
              <span className="text-sm text-zinc-600">Página {page} de {Math.ceil(total / PAGE_SIZE)}</span>
              <Button variant="ghost" disabled={page * PAGE_SIZE >= total} onClick={() => goToPage(page + 1)}>Siguiente</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
