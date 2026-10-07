import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "ghost";
export type ActionVariant = ButtonVariant | "whatsapp" | "inverse";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

export const VARIANT_STYLES: Record<ActionVariant, string> = {
  primary:
    "bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-400 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white",
  ghost:
    "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
  whatsapp:
    "bg-whatsapp text-whatsapp-ink hover:brightness-110 disabled:bg-zinc-400 disabled:text-white dark:disabled:bg-zinc-600",
  inverse:
    "bg-white text-zinc-900 hover:bg-zinc-100 dark:bg-white dark:text-zinc-900",
};

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed ${VARIANT_STYLES[variant]} ${className ?? ""}`}
      {...rest}
    >
      {loading ? "Cargando..." : children}
    </button>
  );
}
