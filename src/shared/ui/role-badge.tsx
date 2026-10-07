import type { Role } from "@/shared/types";

const ROLE_STYLES: Record<Role, string> = {
  SUPERADMIN: "bg-primary text-white",
  ENCARGADO: "bg-secondary text-white",
  OPERADOR: "bg-tertiary text-white",
};

export function RoleBadge({ role }: { role: Role }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-0.5 font-label text-xs font-semibold ${ROLE_STYLES[role]}`}
    >
      {role}
    </span>
  );
}
