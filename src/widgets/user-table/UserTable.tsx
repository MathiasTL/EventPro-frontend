"use client";

import { useState } from "react";
import { createUser, updateUser } from "@/entities/user/api";
import { ROLE_LABELS, type PanelUser, type UserRole } from "@/entities/user/types";
import { formatLimaDateTime } from "@/shared/lib/date";
import { Badge, Button, ErrorBanner, Field, Input, Modal, Select, Table } from "@/shared/ui";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+?\d{7,20}$/;

export function UserTable({
  users,
  currentUserId,
  onReload,
  onSuccess,
}: {
  users: PanelUser[];
  currentUserId: string;
  onReload: () => Promise<void>;
  onSuccess: (message: string) => void;
}) {
  const [editing, setEditing] = useState<PanelUser | null | undefined>(undefined);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setEditing(null)}>+ Nuevo usuario</Button>
      </div>
      <Table head={["Nombre", "Correo", "Teléfono", "Rol", "Estado", "Creado", "Acciones"]}>
        {users.map(user => (
          <tr key={user.id}>
            <td className="px-4 py-4 font-medium text-zinc-900">{user.full_name}</td>
            <td className="px-4 py-4 text-zinc-600">{user.email}</td>
            <td className="px-4 py-4 text-zinc-600">{user.phone}</td>
            <td className="px-4 py-4 text-zinc-600">{ROLE_LABELS[user.role]}</td>
            <td className="px-4 py-4"><Badge tone={user.is_active ? "success" : "neutral"}>{user.is_active ? "Activo" : "Inactivo"}</Badge></td>
            <td className="px-4 py-4 text-xs text-zinc-500">{formatLimaDateTime(user.created_at)}</td>
            <td className="px-4 py-4"><Button variant="ghost" onClick={() => setEditing(user)}>Editar</Button></td>
          </tr>
        ))}
      </Table>
      {editing !== undefined && (
        <UserFormModal
          user={editing}
          isSelf={editing?.id === currentUserId}
          onClose={() => setEditing(undefined)}
          onSaved={async (message) => { setEditing(undefined); await onReload(); onSuccess(message); }}
        />
      )}
    </div>
  );
}

function UserFormModal({
  user,
  isSelf,
  onClose,
  onSaved,
}: {
  user: PanelUser | null;
  isSelf: boolean;
  onClose: () => void;
  onSaved: (message: string) => Promise<void>;
}) {
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [role, setRole] = useState<UserRole>(user?.role ?? "ENCARGADO");
  const [isActive, setIsActive] = useState(user?.is_active ?? true);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = fullName.trim();
    if (name.length < 2) { setError("El nombre debe tener al menos 2 caracteres."); return; }
    if (!PHONE_PATTERN.test(phone.trim())) { setError("El teléfono debe tener entre 7 y 20 dígitos (puede empezar con +)."); return; }
    if (!user && !EMAIL_PATTERN.test(email.trim())) { setError("El correo no tiene un formato válido."); return; }
    if (!user && password.length < 8) { setError("La contraseña debe tener al menos 8 caracteres."); return; }
    if (password && password.length < 8) { setError("La nueva contraseña debe tener al menos 8 caracteres."); return; }
    setBusy(true); setError(null);
    try {
      if (user) {
        await updateUser(user.id, {
          full_name: name,
          phone: phone.trim(),
          role: isSelf ? undefined : role,
          is_active: isSelf ? undefined : isActive,
          password: password || undefined,
        });
        await onSaved("Usuario actualizado correctamente.");
      } else {
        await createUser({ full_name: name, email: email.trim(), phone: phone.trim(), role, password });
        await onSaved("Usuario creado correctamente.");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo guardar el usuario.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open title={user ? `Editar a ${user.full_name}` : "Nuevo usuario"} onClose={() => { if (!busy) onClose(); }}>
      <form onSubmit={submit} className="space-y-4">
        <fieldset disabled={busy} className="space-y-4 disabled:opacity-60">
          <Field label="Nombre completo">
            <Input value={fullName} onChange={event => setFullName(event.target.value)} required minLength={2} maxLength={120} />
          </Field>
          <Field label="Correo">
            <Input type="email" value={email} onChange={event => setEmail(event.target.value)} required disabled={!!user} maxLength={150} />
          </Field>
          {user && <p className="-mt-2 text-xs text-zinc-500">El correo no se puede cambiar desde aquí.</p>}
          <Field label="Teléfono">
            <Input value={phone} onChange={event => setPhone(event.target.value)} required placeholder="+519XXXXXXXX" maxLength={20} />
          </Field>
          <Field label="Rol">
            <Select value={role} onChange={event => setRole(event.target.value as UserRole)} disabled={isSelf}>
              {Object.entries(ROLE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </Select>
          </Field>
          {user && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isActive} disabled={isSelf} onChange={event => setIsActive(event.target.checked)} />
              Cuenta activa
            </label>
          )}
          {isSelf && <p className="text-xs text-amber-700">No puedes cambiar tu propio rol ni desactivar tu cuenta.</p>}
          <Field label={user ? "Nueva contraseña (opcional)" : "Contraseña"}>
            <Input type="password" value={password} onChange={event => setPassword(event.target.value)} required={!user} minLength={8} maxLength={128} placeholder={user ? "Déjalo en blanco para no cambiarla" : undefined} />
          </Field>
        </fieldset>
        <ErrorBanner message={error} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" disabled={busy} onClick={onClose}>Cancelar</Button>
          <Button disabled={busy}>{busy ? "Guardando…" : "Guardar"}</Button>
        </div>
      </form>
    </Modal>
  );
}
