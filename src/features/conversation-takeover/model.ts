import type { Conversation } from "@/entities/conversation";

export type AssignmentContext = {
  conversation: Pick<Conversation, "mode" | "status" | "assigned_user_id">;
  currentUserId: string;
  role: string | null | undefined;
};

export type AssignmentActions = {
  /** Nobody holds it: bot, resolved or open without assignee. */
  canTake: boolean;
  /** SUPERADMIN taking it over from another encargado. */
  canReassign: boolean;
  /** Assignee or SUPERADMIN, only while a human conversation is open (D18). */
  canRelease: boolean;
};

/** Which actions the current user may offer (spec 09, 6.3 to 6.6). The server stays the authority. */
export function assignmentActions({ conversation, currentUserId, role }: AssignmentContext): AssignmentActions {
  const assignee = conversation.assigned_user_id;
  const open = conversation.mode === "HUMAN" && conversation.status === "open";
  const mine = assignee !== null && assignee === currentUserId;
  const superadmin = role === "SUPERADMIN";
  return {
    canTake: assignee === null,
    canReassign: superadmin && assignee !== null && !mine,
    canRelease: open && (mine || (superadmin && assignee !== null)),
  };
}
