import { RequireAuth } from "@/app/routes/RequireAuth";

export default function AgendaLayout({ children }: LayoutProps<"/agenda">) {
  return <RequireAuth>{children}</RequireAuth>;
}
