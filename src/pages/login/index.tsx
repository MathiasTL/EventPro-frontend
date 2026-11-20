import { BrandPanel } from "./ui/brand-panel";
import { LoginForm } from "./ui/login-form";

export function LoginPage() {
  return (
    <main className="ep-login ep-panel">
      <BrandPanel />
      <LoginForm />
    </main>
  );
}
