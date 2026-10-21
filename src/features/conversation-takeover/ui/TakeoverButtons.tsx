"use client";

import { useState } from "react";
import type { Conversation } from "@/entities/conversation";
import { Button, Modal } from "@/shared/ui";
import { assignmentErrorMessage } from "../errors";
import { assignmentActions } from "../model";
import { useConversationAssignment } from "../use-conversation-assignment";

type Common = {
  conversation: Conversation;
  currentUserId: string;
  role: string | null | undefined;
};

/** Error text shown next to the button; the live region stays mounted so screen readers announce it. */
function ActionError({ message }: { message: string | null }) {
  return (
    <p role="alert" className={message ? "text-xs font-medium text-red-700" : "sr-only"}>
      {message ?? ""}
    </p>
  );
}

/**
 * «Tomar» when nobody holds the conversation; «Reasignarme» (with confirmation) for a SUPERADMIN when
 * another encargado holds it. Renders nothing when the user has neither option, except a pending error message.
 */
export function TakeoverButton({ conversation, currentUserId, role, className = "" }: Common & { className?: string }) {
  const { canTake, canReassign } = assignmentActions({ conversation, currentUserId, role });
  const mutation = useConversationAssignment(conversation.chatwoot_conversation_id, "takeover");
  const [confirming, setConfirming] = useState(false);

  const error = mutation.isError ? assignmentErrorMessage(mutation.error) : null;
  // After a 409 the refetch can hide the buttons: keep the error visible instead of unmounting it.
  if (!canTake && !canReassign) return error ? <div className={className}><ActionError message={error} /></div> : null;

  if (canTake) {
    return (
      <div className={`flex flex-col items-start gap-1 ${className}`}>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? "Tomando…" : "Tomar"}
        </Button>
        <ActionError message={error} />
      </div>
    );
  }

  const holder = conversation.assigned_user_name ?? "otro encargado";
  return (
    <div className={`flex flex-col items-start gap-1 ${className}`}>
      <Button variant="ghost" onClick={() => setConfirming(true)} disabled={mutation.isPending}>
        {mutation.isPending ? "Reasignando…" : "Reasignarme"}
      </Button>
      <ActionError message={error} />
      <Modal open={confirming} title="Reasignarme la conversación" onClose={() => setConfirming(false)}>
        <p className="text-sm text-zinc-700">
          Esta conversación la atiende <strong>{holder}</strong>. Si continúas, pasará a tu nombre y {holder} dejará de poder responderla. La acción queda registrada.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirming(false)}>Cancelar</Button>
          <Button
            onClick={() => {
              setConfirming(false);
              mutation.mutate();
            }}
          >
            Reasignarme
          </Button>
        </div>
      </Modal>
    </div>
  );
}

/** «Devolver al bot» for the assignee, or a SUPERADMIN on an assigned open conversation. */
export function ReleaseButton({ conversation, currentUserId, role, className = "" }: Common & { className?: string }) {
  const { canRelease } = assignmentActions({ conversation, currentUserId, role });
  const mutation = useConversationAssignment(conversation.chatwoot_conversation_id, "release");
  const error = mutation.isError ? assignmentErrorMessage(mutation.error) : null;
  if (!canRelease) return error ? <div className={className}><ActionError message={error} /></div> : null;
  return (
    <div className={`flex flex-col items-start gap-1 ${className}`}>
      <Button variant="ghost" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
        {mutation.isPending ? "Devolviendo…" : "Devolver al bot"}
      </Button>
      <ActionError message={error} />
    </div>
  );
}

/** Header actions: any of the three buttons that applies to this user and conversation. */
export function TakeoverActions(props: Common) {
  return (
    <div className="flex flex-wrap items-start gap-2">
      <TakeoverButton {...props} />
      <ReleaseButton {...props} />
    </div>
  );
}
