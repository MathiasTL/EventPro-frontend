"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/app/providers/AuthProvider";
import { login as loginRequest } from "@/entities/auth/api";
import { Button, ErrorBanner, Field, Input } from "@/shared/ui";

export function LoginPage() {
  const router = useRouter();
  const { startSession } = useAuth();
  const [email, setEmail] = useState("admin@eventpro.pe");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const session = await loginRequest(email, password);
      startSession(session.access_token, session.user ?? null);
      router.replace("/panel/catalog");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm"
      >
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">EventPro</h1>
        <p className="mt-1 mb-6 text-sm text-zinc-500">Panel del encargado</p>

        <div className="flex flex-col gap-4">
          <Field label="Correo">
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="username"
            />
          </Field>
          <Field label="Contraseña">
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              autoComplete="current-password"
            />
          </Field>
          <ErrorBanner message={error} />
          <Button type="submit" disabled={loading}>
            {loading ? "Ingresando…" : "Ingresar"}
          </Button>
        </div>
      </form>
    </main>
  );
}
