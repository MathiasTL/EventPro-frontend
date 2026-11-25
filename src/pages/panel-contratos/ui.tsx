import type { ContractStatus } from "@/entities/contract/api";
import { Badge, type Tone } from "@/shared/ui";

export const contractStatuses: Record<ContractStatus, { label: string; tone: Tone }> = {
  DRAFT: { label: "Borrador", tone: "neutral" },
  ISSUED: { label: "Pendiente de firma", tone: "progress" },
  SIGNED: { label: "Firmado", tone: "success" },
  VOIDED: { label: "Anulado", tone: "danger" },
};

export function ContractStatusBadge({ status }: { status: ContractStatus }) {
  const { label, tone } = contractStatuses[status];
  return <Badge tone={tone}>{label}</Badge>;
}

export function contractError(error: unknown) {
  return error instanceof Error ? error.message : "Ocurrió un error. Vuelve a intentarlo.";
}
