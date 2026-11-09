import { useEffect, useRef } from "react";

import { isConversationClosed, leadStatusMeta, type Conversation } from "@/entities/conversation";
import { TakeoverActions } from "@/features/conversation-takeover";
import { windowState, type WindowState } from "../model";
import { useNow } from "../use-now";

type Props = {
  conversation: Conversation;
  currentUserId: string;
  role: string | null | undefined;
  onBack?: () => void;
  /** Moves keyboard and screen reader focus to the heading (narrow screens, right after opening a thread). */
  focusHeading?: boolean;
};

type Holder = { label: string; short: string; detail: string | null; block: string; chip: string };

/** Who holds the conversation: the colour and the text always agree. */
function holderFor(conversation: Conversation, currentUserId: string): Holder {
  if (conversation.mode === "BOT") {
    return { label: "Atiende el bot", short: "Bot", detail: null, block: "bg-ep-cobalt text-white", chip: "bg-ep-cobalt text-white" };
  }
  if (conversation.assigned_user_id === null) {
    return { label: "Sin asignar", short: "Libre", detail: "Esperando a una persona", block: "bg-ep-signal text-ep-ink", chip: "bg-ep-signal text-ep-ink" };
  }
  if (conversation.assigned_user_id === currentUserId) {
    return { label: "Atiendes tú", short: "Tú", detail: null, block: "bg-ep-magenta text-white", chip: "bg-ep-magenta text-white" };
  }
  const name = conversation.assigned_user_name ?? "otro encargado";
  return { label: `Atiende ${name}`, short: name, detail: null, block: "bg-ep-ink-2 text-ep-pass", chip: "bg-ep-ink text-ep-pass" };
}

function windowText(state: WindowState): string {
  return state.open ? `Ventana 24 h · cierra en ${state.remaining}` : "Ventana 24 h cerrada";
}

export function ThreadHeader({ conversation, currentUserId, role, onBack, focusHeading }: Props) {
  const { client } = conversation;
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (focusHeading) heading.current?.focus();
  }, [focusHeading]);
  const now = useNow();
  const name = client.name || client.phone;
  const holder = holderFor(conversation, currentUserId);
  const win = windowState(conversation, now);
  const text = windowText(win);
  const closed = isConversationClosed(conversation);
  return (
    <>
      <header className="shrink-0 border-b border-ep-line-strong bg-ep-pass lg:mx-7 lg:mt-5 lg:grid lg:grid-cols-[1fr_15.5rem] lg:overflow-hidden lg:rounded-lg lg:border">
        <div className="flex min-w-0 items-center gap-1.5 py-1 pl-1 pr-3 lg:block lg:px-5 lg:py-4">
          {onBack && (
            <button type="button" onClick={onBack} aria-label="Volver a la lista de conversaciones" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ep-ink hover:bg-ep-wash focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ep-magenta lg:hidden">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
          )}
          <div className="min-w-0 flex-1">
            <h2 ref={heading} tabIndex={-1} className="ep-cond truncate rounded text-xl leading-tight outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ep-magenta lg:my-1.5 lg:text-5xl lg:leading-[0.95]">{name}</h2>
            <p className="hidden items-center gap-x-4 text-base lg:flex">
              <span className="font-semibold tabular-nums tracking-[0.02em]">{client.phone}</span>
              <span className="flex items-center gap-1.5 text-[0.8125rem] text-ep-mute">
                <span aria-hidden="true" className="h-[9px] w-[9px] shrink-0 rounded-[2px] border-[1.5px] border-ep-mute" />
                <span className={closed ? "line-through decoration-[1.5px]" : undefined}>{leadStatusMeta[conversation.lead_status].label}</span>
                {closed && <span className="sr-only">(cerrada)</span>}
              </span>
            </p>
          </div>
          {/* Phone: holder and window collapse into two chips on the same line as the name. */}
          <div className="flex shrink-0 items-center gap-1 lg:hidden">
            <span className={`ep-cond max-w-20 truncate rounded-sm px-2 py-1 text-[0.8125rem] leading-none ${holder.chip}`} title={holder.label}>
              {holder.short}
              <span className="sr-only"> ({holder.label})</span>
            </span>
            <span className={`rounded-sm px-2 py-1 text-[0.8125rem] font-bold leading-none tabular-nums ${win.open ? (win.urgent ? "bg-ep-signal text-ep-ink" : "bg-ep-ink text-ep-pass") : "border border-ep-ink text-ep-ink"}`}>
              {win.open ? `24 h · ${win.remaining}` : "24 h cerrada"}
              <span className="sr-only"> ({win.open ? `Ventana de 24 h, cierra en ${win.remaining}` : "Ventana de 24 h cerrada"})</span>
            </span>
          </div>
        </div>
        <div className="hidden flex-col lg:flex">
          <div className={`ep-cond flex flex-1 flex-col justify-center px-[1.125rem] py-3.5 text-[1.4375rem] leading-[1.1] ${holder.block}`}>
            {holder.label}
            {holder.detail && <small className="mt-0.5 text-xs font-medium normal-case tracking-normal [font-stretch:100%]">{holder.detail}</small>}
          </div>
          <div className="bg-ep-ink px-[1.125rem] py-2.5 text-[0.78rem] text-white">
            <p className="tabular-nums">
              {win.open ? <>Ventana 24 h · cierra en <b className="text-[0.9375rem]">{win.remaining}</b></> : text}
            </p>
            <div className="mt-1.5 h-[3px] overflow-hidden rounded-sm bg-ep-ink-line" role="presentation">
              {win.open && <div className={`h-full rounded-sm ${win.urgent ? "bg-ep-signal" : "bg-ep-pass"}`} style={{ width: `${Math.max(2, Math.round(win.fraction * 100))}%` }} />}
            </div>
          </div>
        </div>
      </header>
      <TakeoverActions conversation={conversation} currentUserId={currentUserId} role={role} className="shrink-0 border-b border-ep-line bg-ep-pass px-4 py-3 empty:hidden lg:mx-7 lg:mt-3 lg:border-0 lg:bg-transparent lg:p-0" />
    </>
  );
}
