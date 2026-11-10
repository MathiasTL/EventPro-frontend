import { PanelShell } from "@/app/routes/PanelShell";
import { RequireRole } from "@/app/routes/RequireRole";

export default function PanelLayout({ children }: LayoutProps<"/panel">) {
  return (
    <RequireRole allow={["ENCARGADO", "SUPERADMIN"]} redirectTo="/agenda">
      <PanelShell>{children}</PanelShell>
    </RequireRole>
  );
}
