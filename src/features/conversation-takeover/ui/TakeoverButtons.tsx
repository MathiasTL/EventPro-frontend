"use client";

import { useState } from "react";
import type { Conversation } from "@/entities/conversation";
import { Modal } from "@/shared/ui";
import { assignmentErrorMessage } from "../errors";
import { assignmentActions } from "../model";
import { useConversationAssignment } from "../use-conversation-assignment";

type Common = {
  conversation: Conversation;
  currentUserId: string;
  role: string | null | undefined;
};

const buttonBase = "inline-flex min-h-11 items-center justify-center rounded-lg px-3.5 text-[0.8125rem] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ep-magenta disabled:cursor-not-allowed disabled:opacity-60 lg:min-h-9";
/** Outline for secondary actions; solid ink for «Tomar», the action that claims the conversation. */
const outlineButton = `${buttonBase} border border-ep-line-strong bg-ep-pass text-ep-ink hover:bg-white`;
const solidButton = `${buttonBase} border border-ep-ink bg-ep-ink text-white hover:bg-ep-ink-2`;

/** Error text shown next to the button; the live region stays mounted so screen readers announce it. */
function ActionError({ message }: { message: string | null }) {
  return (
    <p role="alert" className={message ? "text-xs font-semibold text-ep-danger" : "sr-only"}>
      {message ?? ""}
    </p>
  );
}

/**
 * «Tomar» when nobody holds the conversation; «Reasignarme» (with confirmation) for a SUPERADMIN when
 * another encargado holds it. Renders nothing when the user has neither option, except a pending error message.
 */
export function TakeoverButton({ conversation, currentUserId, role, className = "", only }: Common & { className?: string; /** Limits the button to one of its two actions so each renders in exactly one place. */ only?: "take" | "reassign" }) {
  const actions = assignmentActions({ conversation, currentUserId, role });
  const canTake = actions.canTake && only !== "reassign";
  const canReassign = actions.canReassign && only !== "take";
  const mutation = useConversationAssignment(conversation.chatwoot_conversation_id, "takeover");
  const [confirming, setConfirming] = useState(false);

  const error = mutation.isError ? assignmentErrorMessage(mutation.error) : null;
  // After a 409 the refetch can hide the buttons: keep the error visible instead of unmounting it.
  if (!canTake && !canReassign) return error ? <div className={className}><ActionError message={error} /></div> : null;

  if (canTake) {
    return (
      <div className={`flex flex-col items-start gap-1 ${className}`}>
        <button type="button" className={solidButton} onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? "Tomando…" : "Tomar"}
        </button>
        <ActionError message={error} />
      </div>
    );
  }

  const holder = conversation.assigned_user_name ?? "otro encargado";
  return (
    <div className={`flex flex-col items-start gap-1 ${className}`}>
      <button type="button" className={outlineButton} onClick={() => setConfirming(true)} disabled={mutation.isPending}>
        {mutation.isPending ? "Reasignando…" : "Reasignarme"}
      </button>
      <ActionError message={error} />
      <Modal open={confirming} title="Reasignarme la conversación" onClose={() => setConfirming(false)}>
        <p className="text-sm text-ep-body">
          Esta conversación la atiende <strong>{holder}</strong>. Si continúas, pasará a tu nombre y {holder} dejará de poder responderla. La acción queda registrada.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className={outlineButton} onClick={() => setConfirming(false)}>Cancelar</button>
          <button
            type="button"
            className={solidButton}
            onClick={() => {
              setConfirming(false);
              mutation.mutate();
            }}
          >
            Reasignarme
          </button>
        </div>
      </Modal>
    </div>
  );
}

/** «Devolver al bot» for the assignee, or a SUPERADMIN on an assigned open conversation. */
export function ReleaseButton({ conversation, currentUserId, role, className = "" }: Common & { className?: string }) {
  const { canRelease } = assignmentActions({ conversation, currentUserId, role });
  const mutation = useConversationAssignment(conversation.chatwoot_conversation_id, "release");
  const [confirming, setConfirming] = useState(false);
  const error = mutation.isError ? assignmentErrorMessage(mutation.error) : null;
  if (!canRelease) return error ? <div className={className}><ActionError message={error} /></div> : null;
  const heldByMe = conversation.assigned_user_id === currentUserId;
  const holder = conversation.assigned_user_name ?? "el encargado asignado";
  return (
    <div className={`flex flex-col items-start gap-1 ${className}`}>
      <button type="button" className={outlineButton} onClick={() => setConfirming(true)} disabled={mutation.isPending}>
        {mutation.isPending ? "Devolviendo…" : "Devolver al bot"}
      </button>
      <ActionError message={error} />
      <Modal open={confirming} title="Devolver la conversación al bot" onClose={() => setConfirming(false)}>
        <p className="text-sm text-ep-body">
          Si continúas, el bot volverá a responder al cliente y {heldByMe ? "dejarás de responder" : <><strong>{holder}</strong> dejará de responder</>} desde el panel.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className={outlineButton} onClick={() => setConfirming(false)}>Cancelar</button>
          <button
            type="button"
            className={solidButton}
            onClick={() => {
              setConfirming(false);
              mutation.mutate();
            }}
          >
            Devolver al bot
          </button>
        </div>
      </Modal>
    </div>
  );
}

/** Header actions: «Reasignarme» and «Devolver al bot» when they apply; «Tomar» lives in the composer notice. */
export function TakeoverActions({ className = "", ...props }: Common & { className?: string }) {
  return (
    <div className={`flex flex-wrap items-start gap-2 ${className}`}>
      <TakeoverButton {...props} only="reassign" />
      <ReleaseButton {...props} />
    </div>
  );
}
