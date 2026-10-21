"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HandoffRequestedData } from "@/features/conversation-stream";
import { handoffReasonLabels } from "@/widgets/conversation-inbox";

type Notice = { key: number; conversationId: number; client: string; reason: string };

const MAX_NOTICES = 3;
const AUTO_DISMISS_MS = 15_000;

/** Non-blocking handoff notices rendered in an always-mounted polite live region (spec 09, 12.2). */
export function useHandoffNotices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((key: number) => setNotices(current => current.filter(notice => notice.key !== key)), []);

  const push = useCallback((data: HandoffRequestedData) => {
    const key = ++counter.current;
    const client = data.client.name?.trim() || data.client.phone || "Un cliente";
    const reason = data.handoff_reason ? handoffReasonLabels[data.handoff_reason] : "Pide atención de una persona";
    setNotices(current => [...current, { key, conversationId: data.chatwoot_conversation_id, client, reason }].slice(-MAX_NOTICES));
  }, []);

  return { notices, push, dismiss };
}

function NoticeItem({ notice, onOpen, onDismiss }: { notice: Notice; onOpen: (id: number) => void; onDismiss: (key: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(notice.key), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [notice.key, onDismiss]);
  return (
    <li className="pointer-events-auto flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950 shadow-lg">
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{notice.client} pide atención</p>
        <p className="mt-0.5 text-amber-900">{notice.reason}</p>
        <button type="button" onClick={() => { onOpen(notice.conversationId); onDismiss(notice.key); }} className="mt-2 rounded-md text-sm font-medium text-violet-800 underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-violet-700">
          Abrir conversación
        </button>
      </div>
      <button type="button" onClick={() => onDismiss(notice.key)} aria-label="Descartar aviso" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-amber-800 hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-violet-700">
        <span aria-hidden="true">✕</span>
      </button>
    </li>
  );
}

export function HandoffNotices({ notices, onOpen, onDismiss }: { notices: Notice[]; onOpen: (id: number) => void; onDismiss: (key: number) => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-30 sm:inset-x-auto sm:right-6 sm:w-96">
      <ul role="status" aria-live="polite" aria-label="Avisos de derivación" className="flex flex-col gap-2">
        {notices.map(notice => <NoticeItem key={notice.key} notice={notice} onOpen={onOpen} onDismiss={onDismiss} />)}
      </ul>
    </div>
  );
}
