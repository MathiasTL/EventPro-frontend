import type { ReactNode } from "react";
import { RequireRole } from "@/app/routes/RequireRole";

export default function UsersLayout({ children }: { children: ReactNode }) {
  return <RequireRole roles={["SUPERADMIN"]}>{children}</RequireRole>;
}
