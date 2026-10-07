import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "inverted" | "outlined" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-deep disabled:bg-neutral/40 dark:bg-white dark:text-primary-deep",
  secondary:
    "bg-secondary text-white hover:bg-[#6d28d9] disabled:bg-neutral/40",
  inverted:
    "bg-[#1e293b] text-white hover:bg-primary disabled:bg-neutral/40",
  outlined:
    "border border-primary/30 bg-white text-primary hover:bg-surface dark:bg-transparent dark:text-white",
  ghost: "text-neutral hover:bg-surface dark:text-zinc-300 dark:hover:bg-white/10",
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
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 font-label text-sm font-medium transition disabled:cursor-not-allowed ${VARIANT_STYLES[variant]} ${className ?? ""}`}
      {...rest}
    >
      {loading ? "Cargando..." : children}
    </button>
  );
}
