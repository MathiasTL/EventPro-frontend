/** Roles allowed to use the conversation inbox (spec 09, section 12; OPERADOR never sees it). */
export const CONVERSATION_ROLES = ["ENCARGADO", "SUPERADMIN"] as const;

export const canAccessConversations = (role: string | null | undefined): boolean =>
  CONVERSATION_ROLES.some(allowed => allowed === role);
