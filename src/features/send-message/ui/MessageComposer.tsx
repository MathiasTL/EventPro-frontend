"use client";

import { useId, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { sendErrorMessage } from "../errors";
import { ACCEPTED_FILE_TYPES, MAX_TEXT_LENGTH, formatFileSize, validateAttachment } from "../model";
import { useSendMessage } from "../use-send-message";

type Props = {
  conversationId: number;
  /** Name shown on the pending row; the sender is always the current assignee. */
  authorName: string | null;
  /**
   * When set the composer is disabled and this explanation (and optional action, e.g. «Tomar») is shown instead.
   * The caller owns the rules (window, assignment, mode); the server enforces them again.
   */
  blocked?: { reason: string; action?: ReactNode } | null;
};

export function MessageComposer({ conversationId, authorName, blocked = null }: Props) {
  const mutation = useSendMessage(conversationId, authorName);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const textId = useId();
  const reasonId = useId();

  const disabled = blocked !== null;
  const trimmed = text.trim();
  const canSend = !disabled && !mutation.isPending && (file !== null || trimmed.length > 0);
  const error = fileError ?? (mutation.isError ? sendErrorMessage(mutation.error) : null);

  function submit() {
    if (!canSend) return;
    const message = file
      ? ({ kind: "attachment", file, caption: trimmed || undefined } as const)
      : ({ kind: "text", content: trimmed } as const);
    mutation.mutate(message, {
      onSuccess: () => {
        setText("");
        setFile(null);
        if (fileInput.current) fileInput.current.value = "";
        textarea.current?.focus();
      },
    });
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    submit();
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends, Shift+Enter adds a line break; never while an IME composition is active.
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  }

  function pickFile(selected: File | undefined) {
    if (!selected) return;
    const problem = validateAttachment(selected);
    setFileError(problem);
    if (problem) {
      if (fileInput.current) fileInput.current.value = "";
      return;
    }
    mutation.reset();
    setFile(selected);
  }

  function clearFile() {
    setFile(null);
    setFileError(null);
    if (fileInput.current) fileInput.current.value = "";
    textarea.current?.focus();
  }

  return (
    <form onSubmit={onSubmit} className="border-t border-zinc-200 bg-white px-4 py-3" aria-label="Responder al cliente">
      {blocked && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5">
          <p id={reasonId} className="text-sm text-zinc-700">{blocked.reason}</p>
          {blocked.action}
        </div>
      )}
      {file && (
        <div className="mb-2 flex items-center justify-between gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-sm text-violet-900">
          <span className="min-w-0 truncate">{file.name} <span className="text-violet-700">({formatFileSize(file.size)})</span></span>
          <button type="button" onClick={clearFile} className="shrink-0 rounded px-1 text-violet-800 hover:bg-violet-100 focus-visible:outline-2 focus-visible:outline-violet-700" aria-label="Quitar el archivo adjunto">
            ✕
          </button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <input
          ref={fileInput}
          type="file"
          accept={ACCEPTED_FILE_TYPES.join(",")}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={event => pickFile(event.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={disabled || mutation.isPending}
          aria-label="Adjuntar imagen o PDF"
          title="Adjuntar imagen o PDF"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-700 transition hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.4 11.6-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <label htmlFor={textId} className="sr-only">Mensaje</label>
          <textarea
            id={textId}
            ref={textarea}
            value={text}
            onChange={event => setText(event.target.value)}
            onKeyDown={onKeyDown}
            disabled={disabled}
            aria-describedby={blocked ? reasonId : undefined}
            maxLength={MAX_TEXT_LENGTH}
            rows={1}
            placeholder={file ? "Agrega un texto al archivo (opcional)" : "Escribe un mensaje"}
            className="block max-h-40 min-h-10 w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none [field-sizing:content] focus:border-violet-600 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500"
          />
        </div>
        <button
          type="submit"
          disabled={!canSend}
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-violet-700 px-4 text-sm font-medium text-white transition hover:bg-violet-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700 disabled:cursor-not-allowed disabled:bg-violet-300"
        >
          {mutation.isPending ? "Enviando…" : "Enviar"}
        </button>
      </div>
      <p className="mt-1.5 text-xs text-zinc-500">Enter envía · Shift+Enter agrega una línea</p>
      <p role="alert" className={error ? "mt-1.5 text-sm font-medium text-red-700" : "sr-only"}>{error ?? ""}</p>
    </form>
  );
}
