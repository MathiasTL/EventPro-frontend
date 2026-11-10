"use client";
import { useEffect, useId, useRef } from "react";

import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

type ButtonVariant = "primary" | "ghost" | "danger";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ep-magenta";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  const styles: Record<ButtonVariant, string> = {
    primary: "bg-ep-ink text-white hover:bg-ep-ink-2",
    ghost: "border border-ep-line-strong bg-ep-pass text-ep-ink hover:bg-white",
    danger: "bg-ep-danger text-white hover:brightness-90",
  };
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center rounded-lg px-3.5 text-[0.8125rem] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 lg:min-h-10 ${focusRing} ${styles[variant]} ${className}`}
      {...props}
    />
  );
}

const fieldClass = `w-full rounded-lg border border-ep-ink bg-white px-3 text-sm text-ep-ink placeholder:text-ep-mute disabled:opacity-60 ${focusRing} focus-visible:outline-offset-1`;

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`min-h-11 lg:min-h-10 ${fieldClass} ${className}`} {...props} />;
}

export function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`ep-select min-h-11 pr-9 lg:min-h-10 ${fieldClass} ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`min-h-11 py-2 ${fieldClass} ${className}`} {...props} />;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-ep-ink">{label}</span>
      {children}
    </label>
  );
}

export type Tone = "neutral" | "progress" | "success" | "warning" | "danger";

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  const tones: Record<Tone, string> = {
    neutral: "border-transparent bg-ep-neutral-field text-ep-body",
    progress: "border-transparent bg-ep-progress-field text-ep-progress",
    success: "border-transparent bg-ep-success-field text-ep-success",
    warning: "border-ep-signal-line bg-ep-signal-field text-ep-ink",
    danger: "border-transparent bg-ep-danger-field text-ep-danger",
  };
  return (
    <span className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-ep-line bg-ep-pass">
      <table className="w-full border-collapse text-sm text-ep-ink tabular-nums">
        <thead className="border-b border-ep-line text-left text-xs text-ep-mute">
          <tr>
            {head.map((column) => (
              <th key={column} className="px-4 py-3 font-semibold">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ep-line">{children}</tbody>
      </table>
    </div>
  );
}

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => { if (open) dialog.current?.showModal(); else dialog.current?.close(); }, [open]);
  return (
    <dialog ref={dialog} aria-labelledby={titleId} onCancel={event => { event.preventDefault(); onClose(); }} className="m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-xl border border-ep-line bg-ep-pass p-0 text-ep-ink backdrop:bg-ep-ink/50">
      {open && <div className="p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id={titleId} className="text-lg font-semibold text-ep-ink">{title}</h2>
          <button type="button" onClick={onClose} className={`-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ep-mute hover:text-ep-ink ${focusRing}`} aria-label="Cerrar">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        {children}
      </div>}
    </dialog>
  );
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg border border-ep-danger bg-ep-danger-field px-3 py-2 text-sm text-ep-danger">{message}</p>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <p className="rounded-lg border border-dashed border-ep-line-strong p-6 text-center text-sm text-ep-mute">{message}</p>;
}

/** Page title block. The title is a section name, so it takes the condensed caps; the eyebrow is a quiet caption. */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        {eyebrow && <p className="text-xs font-medium text-ep-mute">{eyebrow}</p>}
        <h1 className="ep-cond text-3xl leading-none text-ep-ink sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-prose text-[0.8125rem] leading-snug text-ep-body">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

type NoticeTone = "success" | "error" | "warning" | "info";

/** Inline feedback banner. Errors are announced assertively (role=alert), the rest politely (role=status). */
export function Notice({ tone, children }: { tone: NoticeTone; children: ReactNode }) {
  const tones: Record<NoticeTone, string> = {
    success: "border-ep-success bg-ep-success-field text-ep-success",
    error: "border-ep-danger bg-ep-danger-field text-ep-danger",
    warning: "border-ep-signal-line bg-ep-signal-field text-ep-ink",
    info: "border-ep-cobalt-line bg-ep-cobalt-field text-ep-ink",
  };
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`rounded-lg border px-3 py-2 text-sm ${tones[tone]}`}>
      {children}
    </div>
  );
}

export function LoadingState({ label = "Cargando…" }: { label?: string }) {
  return <p role="status" className="py-6 text-center text-sm text-ep-mute">{label}</p>;
}

/** Flat pass-white section container. */
export function Panel({ className = "", ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={`rounded-lg border border-ep-line bg-ep-pass p-4 sm:p-7 ${className}`} {...props} />;
}

/** Panel holding filter controls laid out in a wrapping row. */
export function FilterBar({ className = "", ...props }: HTMLAttributes<HTMLElement>) {
  return <Panel className={`flex flex-wrap items-end gap-3 ${className}`} {...props} />;
}

/** Panel page container: shared gutters (16px phone, 28px desktop), top/bottom padding and a max width for dense tables. */
export function Page({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`mx-auto w-full max-w-6xl space-y-6 px-4 py-6 lg:px-7 lg:py-7 ${className}`} {...props} />;
}
