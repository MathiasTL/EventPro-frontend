"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { listUsers, roleLabels } from "@/entities/user";
import { parsePage } from "@/shared/lib/pagination";
import { Badge, Button, EmptyState, ErrorBanner, Field, Input, Select, Table } from "@/shared/ui";
import { AdminPage, Pagination } from "@/shared/ui/admin";

export function UsersPage() { return <Suspense fallback={<p className="p-8">Cargando usuarios…</p>}><UsersList /></Suspense>; }

function UsersList() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const page = parsePage(params?.get("page"));
  const search = new URLSearchParams();
  for (const key of ["q", "role", "is_active"]) { const value = params?.get(key); if (value) search.set(key, value); }
  search.set("page", String(page)); search.set("page_size", "20");
  const query = useQuery({ queryKey: ["users", "list", search.toString()], queryFn: () => listUsers(search.toString()), retry: false });
  function navigate(next: URLSearchParams) { router.push(`${pathname}?${next}`); }
  return <AdminPage title="Usuarios" description="Administra las cuentas del equipo y sus permisos de acceso.">
    <div className="flex justify-end"><Link className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-medium text-white" href="/panel/users/new">Crear usuario</Link></div>
    <form key={params?.toString()} className="grid items-end gap-4 rounded-xl border border-zinc-200 bg-white p-4 sm:grid-cols-4" onSubmit={event => { event.preventDefault(); const data = new FormData(event.currentTarget); const next = new URLSearchParams(); for (const key of ["q", "role", "is_active"]) { const value = String(data.get(key) ?? "").trim(); if (value) next.set(key, value); } navigate(next); }}>
      <Field label="Buscar"><Input name="q" maxLength={100} defaultValue={params?.get("q") ?? ""} placeholder="Nombre, correo o teléfono" /></Field>
      <Field label="Rol"><Select name="role" defaultValue={params?.get("role") ?? ""}><option value="">Todos</option>{Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></Field>
      <Field label="Estado"><Select name="is_active" defaultValue={params?.get("is_active") ?? ""}><option value="">Todos</option><option value="true">Activo</option><option value="false">Inactivo</option></Select></Field><Button>Aplicar filtros</Button>
    </form>
    {query.isPending ? <p role="status">Cargando usuarios…</p> : query.isError ? <div className="space-y-3"><ErrorBanner message={query.error.message} /><Button variant="ghost" onClick={() => query.refetch()}>Reintentar</Button></div> : <>
      {query.data.items.length ? <Table head={["Usuario", "Contacto", "Rol", "Estado", "Acciones"]}>{query.data.items.map(user => <tr key={user.id}><td className="px-4 py-3 font-medium">{user.full_name}</td><td className="px-4 py-3">{user.email}<br />{user.phone}</td><td className="px-4 py-3">{roleLabels[user.role] ?? user.role}</td><td className="px-4 py-3"><Badge tone={user.is_active ? "success" : "neutral"}>{user.is_active ? "Activo" : "Inactivo"}</Badge></td><td className="px-4 py-3"><Link className="font-medium text-violet-700 underline" href={`/panel/users/${user.id}`}>Ver y editar<span className="sr-only"> a {user.full_name}</span></Link></td></tr>)}</Table> : <EmptyState message="No hay usuarios que coincidan con los filtros." />}
      <Pagination page={page} total={query.data.total} pageSize={20} busy={query.isFetching} onPage={value => { search.set("page", String(value)); navigate(search); }} />
    </>}
  </AdminPage>;
}
