import type { Role } from "@/shared/types";

const ROLE_STYLES: Record<Role, string> = {
  SUPERADMIN:
    "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200",
  ENCARGADO:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
  OPERADOR:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
};

export function RoleBadge({ role }: { role: Role }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_STYLES[role]}`}
    >
      {role}
    </span>
  );
}
