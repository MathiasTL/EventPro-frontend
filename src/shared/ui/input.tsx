import { useId, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, className, id, ...rest }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className="space-y-1">
      <label
        htmlFor={inputId}
        className="block font-label text-xs font-medium uppercase tracking-wide text-neutral"
      >
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={`w-full rounded-lg border bg-surface px-3 py-2 font-body text-sm text-primary outline-none placeholder:text-neutral/60 focus:border-secondary focus:ring-2 focus:ring-secondary/30 dark:bg-white/5 dark:text-white ${
          error ? "border-red-400" : "border-neutral/25 dark:border-white/15"
        } ${className ?? ""}`}
        {...rest}
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
