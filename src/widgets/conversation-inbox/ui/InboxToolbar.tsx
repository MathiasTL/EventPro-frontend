import { useId, useState } from "react";
import { MAX_SEARCH_LENGTH, scopeOptions, type InboxFilterState, type ScopeFilter } from "../model";

export type AssigneeOption = { id: string; name: string };

type Props = {
  state: InboxFilterState;
  onChange: (patch: Partial<InboxFilterState>) => void;
  /** Present only for SUPERADMIN; the selector is hidden when `undefined`. */
  assigneeOptions?: AssigneeOption[];
};

const fieldClass = "h-11 w-full rounded-lg border border-ep-ink bg-white px-3 text-sm text-ep-ink placeholder:text-ep-mute focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ep-magenta lg:h-10";
// Native select restyled: no browser chrome, ink chevron from the `ep-select` class.
const selectClass = `${fieldClass} ep-select pr-9 lg:h-9`;

export function InboxToolbar({ state, onChange, assigneeOptions }: Props) {
  const [extraOpen, setExtraOpen] = useState(false);
  const extraId = useId();
  const searchId = useId();
  const assigneeId = useId();
  // The disclosure only exists on phones; its button reports how many of its filters are active.
  const extraActive = (state.includeResolved ? 1 : 0) + (state.assignedUserId ? 1 : 0);
  return (
    <div className="shrink-0">
      <div className="px-4 pb-3">
        <label htmlFor={searchId} className="sr-only">Buscar conversación</label>
        <input
          id={searchId}
          type="search"
          placeholder="Buscar por nombre o teléfono…"
          value={state.search}
          maxLength={MAX_SEARCH_LENGTH}
          onChange={event => onChange({ search: event.target.value })}
          className={fieldClass}
        />
      </div>
      <div className="flex items-end justify-between gap-2 border-b border-ep-line px-4">
        <div role="group" aria-label="Filtrar conversaciones" className="-mb-px flex min-w-0 gap-1 overflow-x-auto">
          {scopeOptions.map(option => {
            const active = state.scope === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ scope: option.value as ScopeFilter })}
                className={`min-h-11 shrink-0 border-b-2 px-2.5 text-[0.8125rem] whitespace-nowrap focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ep-magenta lg:min-h-10 ${active ? "border-ep-ink font-bold text-ep-ink" : "border-transparent font-medium text-ep-mute hover:text-ep-ink"}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <button
            type="button"
            aria-expanded={extraOpen}
            aria-controls={extraId}
            onClick={() => setExtraOpen(open => !open)}
            className="mb-px min-h-11 shrink-0 rounded-md px-2 text-[0.8125rem] font-semibold text-ep-ink focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ep-magenta lg:hidden"
          >
            Filtros{extraActive > 0 ? ` (${extraActive})` : ""}
          </button>
      </div>
      <div id={extraId} className={`${extraOpen ? "block" : "hidden"} space-y-3 border-b border-ep-line px-4 py-3 lg:flex lg:items-center lg:gap-4 lg:space-y-0 lg:py-2.5`}>
        {assigneeOptions && (
          <div className="flex min-w-0 flex-col gap-1 lg:flex-1">
            <label htmlFor={assigneeId} className="text-xs font-semibold text-ep-mute lg:sr-only">Encargado</label>
            <select id={assigneeId} value={state.assignedUserId} onChange={event => onChange({ assignedUserId: event.target.value })} className={selectClass}>
              <option value="">Todos los encargados</option>
              {assigneeOptions.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}
            </select>
          </div>
        )}
        <label className="flex min-h-11 shrink-0 items-center gap-2 text-sm text-ep-body lg:min-h-9">
          <input
            type="checkbox"
            className="h-[1.125rem] w-[1.125rem] accent-ep-magenta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ep-magenta"
            checked={state.includeResolved}
            onChange={event => onChange({ includeResolved: event.target.checked })}
          />
          Incluir resueltas
        </label>
      </div>
    </div>
  );
}
