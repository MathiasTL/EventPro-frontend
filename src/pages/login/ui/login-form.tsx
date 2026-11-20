"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

import { login as loginRequest } from "@/entities/auth/api";
import { useAuth } from "@/entities/auth/context";
import { Button, ErrorBanner, Field, Input } from "@/shared/ui";

export function LoginForm() {
  const router = useRouter();
  const { startSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const session = await loginRequest(email, password);
      startSession(session.access_token, session.refresh_token, session.user ?? null);
      router.replace(session.user?.role === "OPERADOR" ? "/agenda" : "/panel");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="ep-login-form-side" aria-labelledby="login-title">
      <div className="ep-login-form-wrap">
        <div className="ep-login-form-heading">
          <span>ACCESO AL PANEL</span>
          <h2 id="login-title">Te damos la bienvenida.</h2>
          <p>Ingresa con tu cuenta del equipo para continuar.</p>
        </div>
        <form className="ep-login-form" onSubmit={handleSubmit}>
          <Field label="Correo electrónico">
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="username" className="ep-login-input" />
          </Field>
          <div className="ep-login-password-field">
            <Field label="Contraseña">
              <Input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete="current-password" className="ep-login-input ep-login-password-input" />
            </Field>
            <button
              type="button"
              className="ep-login-password-toggle"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
            </button>
          </div>
          <div className="ep-login-error" aria-live="polite" aria-atomic="true">
            <ErrorBanner message={error} />
          </div>
          <Button type="submit" disabled={loading} className="ep-login-submit">
            {loading ? "Ingresando…" : "Ingresar al panel"}
          </Button>
        </form>
        <Link href="/" className="ep-login-return"><ArrowLeft size={18} aria-hidden="true" /> Volver al inicio</Link>
      </div>
    </section>
  );
}
