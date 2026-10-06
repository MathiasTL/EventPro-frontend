"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/entities/session";
import { LoginForm } from "@/features/auth-login";
import { HOME_BY_ROLE } from "@/shared/config";

export function LoginPage() {
  const { status, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && user) {
      router.replace(HOME_BY_ROLE[user.role] ?? "/panel");
    }
  }, [status, user, router]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">EventPro</h1>
          <p className="text-sm text-zinc-500">Inicia sesión para continuar</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
