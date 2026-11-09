"use client";

import { Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/entities/auth/context";
import { canAccessConversations } from "@/app/routes/roles";
import { activeManagersOptions } from "@/entities/user";
import { useConversationStream } from "@/features/conversation-stream";
import { Button } from "@/shared/ui";
import { ConversationInbox } from "@/widgets/conversation-inbox";
import { ConversationThread } from "@/widgets/conversation-thread";
import { HandoffNotices, useHandoffNotices } from "./handoff-notices";

const PARAM = "c";
const WIDE_QUERY = "(min-width: 1024px)";

function subscribeWide(onChange: () => void) {
  const query = window.matchMedia(WIDE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function ConversationsPage() {
  const { user, logout } = useAuth();
  // Role guard first: a rejected role never mounts the content, so no stream and no queries start.
  if (user && !canAccessConversations(user.role)) {
    return (
      <main className="p-10">
        <h1 className="ep-cond text-3xl">Acceso restringido</h1>
        <p className="my-4">Las conversaciones requieren una cuenta de encargado o superadministrador.</p>
        <Button onClick={logout}>Cerrar sesión</Button>
      </main>
    );
  }
  if (!user) return null;
  return (
    <Suspense fallback={<p role="status" className="p-10 text-sm text-ep-mute">Cargando conversaciones…</p>}>
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
  const heading = useRef<HTMLHeadingElement>(null);
  const threadPane = useRef<HTMLDivElement>(null);
  const previousSelected = useRef(selectedId);
  const isWide = useSyncExternalStore(subscribeWide, () => window.matchMedia(WIDE_QUERY).matches, () => true);
  // True once the user opened a thread from the list (not on a direct load of `?c=`), so the heading takes focus.
  const [prevSelectedId, setPrevSelectedId] = useState(selectedId);
  const [openedFromList, setOpenedFromList] = useState(false);
  if (prevSelectedId !== selectedId) {
    setPrevSelectedId(selectedId);
    setOpenedFromList(selectedId !== null);
  }

  const { notices, push, dismiss } = useHandoffNotices();
  const { status: streamStatus, retry: retryStream } = useConversationStream({ enabled: true, onHandoffRequested: push });

  const managers = useQuery({ ...activeManagersOptions(), enabled: role === "SUPERADMIN" });

  // Single place that builds workspace URLs: current path, every other param preserved, `c` set or removed.
  const hrefFor = useCallback((id: number | null) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (id === null) params.delete(PARAM); else params.set(PARAM, String(id));
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  const select = useCallback((id: number | null) => {
    router.push(hrefFor(id), { scroll: false });
  }, [hrefFor, router]);

  // Narrow screens swap panes: the control that held focus disappears, so move focus to a visible target.
  // Opening: the pane takes focus at once (the thread is still loading), then the thread heading takes over
  // as soon as the header mounts. Returning: the page heading, since the list pane has no single focus target.
  useEffect(() => {
    if (previousSelected.current === selectedId) return;
    const opened = selectedId !== null;
    previousSelected.current = selectedId;
    if (window.matchMedia(WIDE_QUERY).matches) return;
    if (opened) threadPane.current?.focus(); else heading.current?.focus();
  }, [selectedId]);

  return (
    <main className="flex h-[calc(100dvh-3rem)] w-full bg-ep-wash lg:h-dvh">
      <div className={`${selectedId ? "hidden lg:block" : "block"} min-h-0 w-full lg:w-[25rem] lg:shrink-0`}>
        <ConversationInbox role={role} assigneeOptions={managers.data} currentUserId={userId} headingRef={heading} selectedId={selectedId} hrefFor={hrefFor} streamStatus={streamStatus} onStreamRetry={retryStream} />
      </div>
      <div ref={threadPane} tabIndex={-1} className={`${selectedId ? "block" : "hidden lg:block"} min-h-0 min-w-0 flex-1 overflow-hidden outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ep-magenta`}>
        {selectedId ? (
          <ConversationThread conversationId={selectedId} currentUserId={userId} currentUserName={userName} role={role} onBack={() => select(null)} focusHeading={openedFromList && !isWide} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 p-10 text-center">
            <h2 className="ep-cond text-2xl">Selecciona una conversación</h2>
            <p className="text-sm text-ep-mute">Elige un chat de la lista para ver los mensajes y responder.</p>
          </div>
        )}
      </div>
      <HandoffNotices notices={notices} onOpen={select} onDismiss={dismiss} />
    </main>
  );
}
