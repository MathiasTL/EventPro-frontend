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
    <main className="flex flex-1 flex-col items-center justify-center bg-surface p-6 dark:bg-[#020617]">
      <div className="w-full max-w-sm space-y-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-white/5">
        <div className="space-y-1 text-center">
          <p className="font-label text-xs uppercase tracking-widest text-secondary">EventPro Wireframe Engine</p>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-primary dark:text-white">EventPro</h1>
          <p className="font-body text-sm text-neutral">Inicia sesión para continuar</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
