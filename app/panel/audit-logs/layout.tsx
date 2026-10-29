import type { ReactNode } from "react";
import { RequireRole } from "@/app/routes/RequireRole";

export default function AuditLayout({ children }: { children: ReactNode }) {
  return <RequireRole roles={["SUPERADMIN", "ENCARGADO"]}>{children}</RequireRole>;
}
