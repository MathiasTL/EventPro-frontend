import { apiFetch } from "@/shared/api/client";
import type { ContractStatus } from "./api";

export type ManualContractResult = {
  contract_id: string;
  contract_number: string;
  contract_status: ContractStatus;
  services_subtotal: number | string;
  total_amount: number | string;
  advance_amount: number | string;
  pending_balance: number | string;
};

export function createManualContract(payload: string, evidence: File, key: string) {
  const body = new FormData();
  body.append("payload", payload);
  body.append("advance_evidence_file", evidence);
  return apiFetch<ManualContractResult>("/contracts/manual", {
    method: "POST",
    body,
    headers: { "Idempotency-Key": key },
  });
}
