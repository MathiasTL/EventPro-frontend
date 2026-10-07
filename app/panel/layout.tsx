import { RequireAuth } from "@/app/routes/RequireAuth";

export default function PanelLayout({ children }: LayoutProps<"/panel">) {
  return <RequireAuth>{children}</RequireAuth>;
}
