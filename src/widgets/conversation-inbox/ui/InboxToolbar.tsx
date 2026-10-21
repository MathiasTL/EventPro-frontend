import { Field, Input, Select } from "@/shared/ui";
import { scopeOptions, type InboxFilterState, type ScopeFilter } from "../model";

export type AssigneeOption = { id: string; name: string };

type Props = {
  state: InboxFilterState;
  onChange: (patch: Partial<InboxFilterState>) => void;
  /** Present only for SUPERADMIN; the selector is hidden when `undefined`. */
  assigneeOptions?: AssigneeOption[];
};

export function InboxToolbar({ state, onChange, assigneeOptions }: Props) {
  return (
    <div className="space-y-3 border-b border-zinc-200 p-4">
      <Field label="Buscar conversación">
        <Input
          type="search"
          placeholder="Nombre o teléfono…"
          value={state.search}
          maxLength={100}
          onChange={event => onChange({ search: event.target.value })}
        />
      </Field>
      <div role="group" aria-label="Filtrar conversaciones" className="flex flex-wrap gap-1.5">
        {scopeOptions.map(option => {
          const active = state.scope === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange({ scope: option.value as ScopeFilter })}
              className={`rounded-full border px-3 py-1 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700 ${active ? "border-violet-700 bg-violet-700 text-white" : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {assigneeOptions && (
        <Field label="Encargado">
          <Select value={state.assignedUserId} onChange={event => onChange({ assignedUserId: event.target.value })}>
            <option value="">Todos los encargados</option>
            {assigneeOptions.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}
          </Select>
        </Field>
      )}
      <label className="flex items-center gap-2 text-sm text-zinc-700">
        <input
          type="checkbox"
          className="h-4 w-4 accent-violet-700"
          checked={state.includeResolved}
          onChange={event => onChange({ includeResolved: event.target.checked })}
        />
        Incluir resueltas
      </label>
    </div>
  );
}
