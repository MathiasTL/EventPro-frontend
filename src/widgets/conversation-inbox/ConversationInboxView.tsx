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
  selectedId?: number | null;
  onSelect: (conversationId: number) => void;
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
  const { conversations, loading, error } = props;
  const pending = conversations.filter(isHandoffPending).length;
  return (
    <section aria-label="Bandeja de conversaciones" className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <InboxToolbar state={props.filterState} onChange={props.onFilterChange} assigneeOptions={props.assigneeOptions} />
      <StreamIndicator status={props.streamStatus} onRetry={props.onStreamRetry} />
      <p aria-live="polite" className={pending > 0 ? "border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900" : "sr-only"}>
        {pending > 0 ? `${pending} ${pending === 1 ? "derivación pendiente" : "derivaciones pendientes"} de atención` : ""}
      </p>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {error && <InboxError unavailable={error.unavailable} onRetry={props.onRetry} retrying={props.retrying} />}
        {loading && conversations.length === 0 && !error ? <ListSkeleton />
          : conversations.length === 0 ? (!error && <InboxEmpty filtered={props.filtered} onClear={props.onClearFilters} />)
          : (
            <>
              <ul className="divide-y divide-zinc-100">
                {conversations.map(conversation => (
                  <ConversationRow
                    key={conversation.chatwoot_conversation_id}
                    conversation={conversation}
                    selected={conversation.chatwoot_conversation_id === props.selectedId}
                    onSelect={props.onSelect}
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
