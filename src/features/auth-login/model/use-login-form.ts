import { useCallback, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/entities/session";
import { ApiError } from "@/shared/api";
import { HOME_BY_ROLE } from "@/shared/config";

interface UseLoginFormResult {
  email: string;
  password: string;
  error: string | null;
  fieldErrors: Record<string, string>;
  loading: boolean;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  submit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

export function useLoginForm(): UseLoginFormResult {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const submit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      setFieldErrors({});
      setLoading(true);
      try {
        const user = await login({ email: email.trim(), password });
        router.replace(HOME_BY_ROLE[user.role] ?? "/panel");
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.detail);
          if (err.fieldErrors && err.fieldErrors.length > 0) {
            const map: Record<string, string> = {};
            for (const fieldError of err.fieldErrors) {
              const key = fieldError.field.replace(/^body\./, "");
              map[key] = fieldError.message;
            }
            setFieldErrors(map);
          }
        } else {
          setError("No se pudo iniciar sesión. Inténtalo de nuevo.");
        }
      } finally {
        setLoading(false);
      }
    },
    [email, password, login, router],
  );

  return {
    email,
    password,
    error,
    fieldErrors,
    loading,
    setEmail,
    setPassword,
    submit,
  };
}
