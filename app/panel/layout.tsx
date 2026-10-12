import { RequireRole } from "@/app/routes/RequireRole";
import { PanelShell } from "@/widgets/panel-shell/PanelShell";

export default function PanelLayout({ children }: LayoutProps<"/panel">) {
  return (
    <RequireRole allow={["ENCARGADO", "SUPERADMIN"]} redirectTo="/agenda">
      <PanelShell>{children}</PanelShell>
    </RequireRole>
  );
}
