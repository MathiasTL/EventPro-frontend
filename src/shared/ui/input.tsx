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
        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/30 dark:bg-zinc-900 dark:text-zinc-100 ${
          error ? "border-red-400" : "border-zinc-300 dark:border-zinc-700"
        } ${className ?? ""}`}
        {...rest}
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
