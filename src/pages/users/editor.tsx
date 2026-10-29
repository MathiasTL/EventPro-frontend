"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/app/providers/AuthProvider";
import { createUser, getUser, updateUser, roleLabels } from "@/entities/user";
import type { UpdateUserRequest, UserReadResponse, UserRole } from "@/entities/user";
import { Button, ErrorBanner, Field, Input, Select } from "@/shared/ui";
import { AdminPage, formatTimestamp } from "@/shared/ui/admin";

export function NewUserPage() { return <AdminPage title="Crear usuario" description="Crea una cuenta para un integrante del equipo."><UserEditor /></AdminPage>; }

export function UserDetailPage() {
  const id = useParams<{ id: string }>()?.id;
  const query = useQuery({ queryKey: ["users", "detail", id], queryFn: () => getUser(id!), enabled: !!id, retry: false });
  return <AdminPage title="Detalle del usuario" description="Consulta y actualiza los datos y permisos de la cuenta.">
    {query.isPending ? <p role="status">Cargando usuario…</p> : query.isError ? <><ErrorBanner message={query.error.message} /><Button variant="ghost" onClick={() => query.refetch()}>Reintentar</Button></> : <UserEditor key={`${id}:${query.data.role}:${query.data.is_active}`} existing={query.data} />}
  </AdminPage>;
}

function UserEditor({ existing }: { existing?: UserReadResponse }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const cache = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const self = existing?.id === user?.id;
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const full_name = String(data.get("full_name")).trim();
    const phone = String(data.get("phone")).trim();
    const role = (self ? existing!.role : String(data.get("role"))) as UserRole;
    const is_active = self ? existing!.is_active : data.get("is_active") === "true";
    const password = String(data.get("password") ?? "");
    const patch: UpdateUserRequest = {};
    if (existing) {
      if (full_name !== existing.full_name) patch.full_name = full_name;
      if (phone !== existing.phone) patch.phone = phone;
      if (!self && role !== existing.role) patch.role = role;
      if (!self && is_active !== existing.is_active) patch.is_active = is_active;
      if (password) patch.password = password;
      if (!Object.keys(patch).length) { setError("No hay cambios para guardar."); return; }
    }
    if (existing && ((role !== existing.role) || (is_active !== existing.is_active) || password) && !window.confirm("¿Confirmas los cambios de acceso? Cambiar la contraseña o desactivar la cuenta revocará sus sesiones de renovación.")) return;
    setBusy(true); setError(null); setSuccess(false);
    try {
      const saved = existing
        ? await updateUser(existing.id, patch)
        : await createUser({ full_name, phone, role, email: String(data.get("email")).trim(), password });
      await cache.invalidateQueries({ queryKey: ["users"] });
      await cache.invalidateQueries({ queryKey: ["audit-logs"] });
      // Password changes revoke refresh credentials; force a fresh login for this account.
      if (self && password) { logout(); router.replace("/login"); return; }
      setSuccess(true);
      const passwordInput = form.elements.namedItem("password");
      if (passwordInput instanceof HTMLInputElement) passwordInput.value = "";
      if (!existing) router.replace(`/panel/users/${saved.id}`);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "No se pudo guardar el usuario."); }
    finally { setBusy(false); }
  }
  return <section className="max-w-2xl rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
    <Link href="/panel/users" className="text-sm text-violet-700 underline">Volver a usuarios</Link>
    {existing && <p className="mt-3 text-xs text-zinc-500">Creado el {formatTimestamp(existing.created_at)}</p>}
    <form className="mt-5 space-y-4" onSubmit={save}>
      <ErrorBanner message={error} />{success && <p role="status" className="text-sm text-emerald-700">Usuario actualizado correctamente.</p>}
      <fieldset disabled={busy} className="space-y-4">
        <Field label="Nombre completo"><Input name="full_name" required minLength={2} maxLength={120} defaultValue={existing?.full_name} autoComplete="name" /></Field>
        <Field label="Correo electrónico"><Input name="email" type="email" required maxLength={150} defaultValue={existing?.email} disabled={!!existing} autoComplete="email" /></Field>
        <Field label="Teléfono"><Input name="phone" type="tel" pattern="\+?[0-9]{7,20}" required maxLength={20} defaultValue={existing?.phone} placeholder="+51987654321" autoComplete="tel" /></Field>
        <Field label="Rol"><Select name="role" defaultValue={existing?.role ?? "ENCARGADO"} disabled={self}>{Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></Field>
        {existing && <Field label="Estado"><Select name="is_active" defaultValue={String(existing.is_active)} disabled={self}><option value="true">Activo</option><option value="false">Inactivo</option></Select></Field>}
        {self && <p className="text-sm text-zinc-500">No puedes desactivar tu cuenta ni cambiar tu propio rol.</p>}
        <Field label={existing ? "Nueva contraseña (opcional)" : "Contraseña"}><Input name="password" type="password" required={!existing} minLength={8} maxLength={128} autoComplete="new-password" /></Field>
        <p className="text-xs text-zinc-500">La contraseña debe tener entre 8 y 128 caracteres.</p>
        <Button type="submit">{busy ? "Guardando…" : existing ? "Guardar cambios" : "Crear usuario"}</Button>
      </fieldset>
    </form>
  </section>;
}
