import { PanelNav } from "@/app/routes/PanelNav";
import { RequireAuth } from "@/app/routes/RequireAuth";

export default function PanelLayout({ children }: LayoutProps<"/panel">) {
  return (
    <RequireAuth>
      <PanelNav />
      {children}
    </RequireAuth>
  );
}
