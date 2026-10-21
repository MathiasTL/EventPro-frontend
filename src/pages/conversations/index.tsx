"use client";

import { Suspense, useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/app/providers/AuthProvider";
import { canAccessConversations } from "@/app/routes/roles";
import { activeManagersOptions } from "@/entities/user";
import { useConversationStream } from "@/features/conversation-stream";
import { Button } from "@/shared/ui";
import { ConversationInbox } from "@/widgets/conversation-inbox";
import { ConversationThread } from "@/widgets/conversation-thread";
import { HandoffNotices, useHandoffNotices } from "./handoff-notices";

const PARAM = "c";

export function ConversationsPage() {
  const { user, logout } = useAuth();
  // Role guard first: a rejected role never mounts the content, so no stream and no queries start.
  if (user && !canAccessConversations(user.role)) {
    return (
      <main className="p-10">
        <h1 className="text-xl font-semibold">Acceso restringido</h1>
        <p className="my-4">Las conversaciones requieren una cuenta de encargado o superadministrador.</p>
        <Button onClick={logout}>Cerrar sesión</Button>
      </main>
    );
  }
  if (!user) return null;
  return (
    <Suspense fallback={<p role="status" className="p-10 text-sm text-zinc-500">Cargando conversaciones…</p>}>
      <ConversationsWorkspace userId={user.id} userName={user.full_name} role={user.role} />
    </Suspense>
  );
}

function parseConversationId(value: string | null): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function ConversationsWorkspace({ userId, userName, role }: { userId: string; userName: string; role: string }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/panel/conversations";
  const searchParams = useSearchParams();
  const selectedId = parseConversationId(searchParams?.get(PARAM) ?? null);
  const listPane = useRef<HTMLDivElement>(null);
  const threadPane = useRef<HTMLDivElement>(null);
  const previousSelected = useRef(selectedId);

  const { notices, push, dismiss } = useHandoffNotices();
  const { status: streamStatus, retry: retryStream } = useConversationStream({ enabled: true, onHandoffRequested: push });

  const managers = useQuery({ ...activeManagersOptions(), enabled: role === "SUPERADMIN" });

  const select = useCallback((id: number | null) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (id === null) params.delete(PARAM); else params.set(PARAM, String(id));
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  // Narrow screens swap panes: move focus to the pane that just appeared.
  useEffect(() => {
    if (previousSelected.current === selectedId) return;
    const opened = selectedId !== null;
    previousSelected.current = selectedId;
    if (window.matchMedia("(min-width: 1024px)").matches) return;
    (opened ? threadPane : listPane).current?.focus();
  }, [selectedId]);

  return (
    <main className="mx-auto flex h-[calc(100dvh-2.75rem)] w-full max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6">
      <h1 className="text-xl font-bold tracking-tight">Conversaciones</h1>
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(20rem,26rem)_1fr]">
        <div ref={listPane} tabIndex={-1} className={`${selectedId ? "hidden lg:block" : "block"} min-h-0 outline-none`}>
          <ConversationInbox role={role} assigneeOptions={managers.data} selectedId={selectedId} onSelect={select} streamStatus={streamStatus} onStreamRetry={retryStream} />
        </div>
        <div ref={threadPane} tabIndex={-1} className={`${selectedId ? "block" : "hidden lg:block"} min-h-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white outline-none`}>
          {selectedId ? (
            <ConversationThread conversationId={selectedId} currentUserId={userId} currentUserName={userName} role={role} onBack={() => select(null)} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1 p-10 text-center">
              <h2 className="text-base font-semibold text-zinc-800">Selecciona una conversación</h2>
              <p className="text-sm text-zinc-500">Elige un chat de la lista para ver los mensajes y responder.</p>
            </div>
          )}
        </div>
      </div>
      <HandoffNotices notices={notices} onOpen={select} onDismiss={dismiss} />
    </main>
  );
}
