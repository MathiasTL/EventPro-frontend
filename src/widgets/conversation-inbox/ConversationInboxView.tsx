import type { Ref } from "react";
import type { Conversation } from "@/entities/conversation";
import type { ConversationStreamStatus } from "@/features/conversation-stream";
import { Button } from "@/shared/ui";
import { isHandoffPending, type InboxFilterState } from "./model";
import { ConversationRow } from "./ui/ConversationRow";
import { InboxEmpty, InboxError, ListSkeleton, StreamIndicator } from "./ui/InboxStates";
import { InboxToolbar, type AssigneeOption } from "./ui/InboxToolbar";

export type ConversationInboxViewProps = {
  filterState: InboxFilterState;
  onFilterChange: (patch: Partial<InboxFilterState>) => void;
  onClearFilters: () => void;
  assigneeOptions?: AssigneeOption[];
  conversations: Conversation[];
  currentUserId: string;
  /** Ref for the page title so the page can return focus to it on phones. */
  headingRef?: Ref<HTMLHeadingElement>;
  selectedId?: number | null;
  hrefFor: (conversationId: number) => string;
  loading: boolean;
  /** Set when the last query failed; previously loaded rows stay visible. */
  error: { unavailable: boolean } | null;
  onRetry: () => void;
  retrying: boolean;
  filtered: boolean;
  hasNextPage: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  streamStatus?: ConversationStreamStatus;
  /** Restarts the stream after it gave up (status `error`). */
  onStreamRetry?: () => void;
};

/** Presentational inbox: no queries, everything arrives through props. */
export function ConversationInboxView(props: ConversationInboxViewProps) {
  const { conversations, loading, error, headingRef } = props;
  const pending = conversations.filter(isHandoffPending).length;
  return (
    <section aria-label="Bandeja de conversaciones" className="flex h-full min-h-0 flex-col overflow-hidden border-ep-line bg-ep-pass lg:border-r">
      <h1 ref={headingRef} tabIndex={-1} className="ep-cond w-fit shrink-0 rounded px-4 pb-3.5 pt-5 text-[1.875rem] leading-none outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ep-magenta">Conversaciones</h1>
      <InboxToolbar state={props.filterState} onChange={props.onFilterChange} assigneeOptions={props.assigneeOptions} />
      <StreamIndicator status={props.streamStatus} onRetry={props.onStreamRetry} />
      <p aria-live="polite" className={pending > 0 ? "border-b border-ep-signal-line bg-ep-signal-field px-4 py-2 text-sm font-bold text-ep-ink" : "sr-only"}>
        {pending > 0 ? `${pending} ${pending === 1 ? "derivación pendiente" : "derivaciones pendientes"} de atención` : ""}
      </p>
      <div className="ep-scroll min-h-0 flex-1 overflow-y-auto">
        {error && <InboxError unavailable={error.unavailable} onRetry={props.onRetry} retrying={props.retrying} />}
        {loading && conversations.length === 0 && !error ? <ListSkeleton />
          : conversations.length === 0 ? (!error && <InboxEmpty filtered={props.filtered} onClear={props.onClearFilters} />)
          : (
            <>
              <ul>
                {conversations.map(conversation => (
                  <ConversationRow
                    key={conversation.chatwoot_conversation_id}
                    conversation={conversation}
                    currentUserId={props.currentUserId}
                    selected={conversation.chatwoot_conversation_id === props.selectedId}
                    href={props.hrefFor(conversation.chatwoot_conversation_id)}
                  />
                ))}
              </ul>
              {props.hasNextPage && (
                <div className="flex justify-center p-4">
                  <Button variant="ghost" onClick={props.onLoadMore} disabled={props.loadingMore}>{props.loadingMore ? "Cargando…" : "Cargar más"}</Button>
                </div>
              )}
            </>
          )}
      </div>
    </section>
  );
}
