"use client";

import { Button, Input } from "@/shared/ui";

import { useLoginForm } from "../model/use-login-form";

export function LoginForm() {
  const {
    email,
    password,
    error,
    fieldErrors,
    loading,
    setEmail,
    setPassword,
    submit,
  } = useLoginForm();

  return (
    <form onSubmit={submit} className="w-full space-y-4">
      {error ? (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-300"
        >
          {error}
        </div>
      ) : null}
      <Input
        label="Correo"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={fieldErrors.email}
      />
      <Input
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={fieldErrors.password}
      />
      <Button type="submit" loading={loading} className="w-full">
        Ingresar
      </Button>
    </form>
  );
}
