import { PanelNav } from "@/app/routes/PanelNav";
import { RequireRole } from "@/app/routes/RequireRole";

export default function PanelLayout({ children }: LayoutProps<"/panel">) {
  return (
    <RequireRole allow={["ENCARGADO", "SUPERADMIN"]} redirectTo="/agenda">
      <PanelNav />
      {children}
    </RequireRole>
  );
}
