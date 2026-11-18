import { apiFetch, apiFetchBlob } from "@/shared/api/client";

export type ContractStatus = "DRAFT" | "ISSUED" | "SIGNED" | "VOIDED";

type Contract = {
  contract_id: string;
  contract_number: string;
  event_id: string;
  status: ContractStatus;
  is_manual_mode: boolean;
  custom_clauses: string | null;
  signature_token_expires_at: string | null;
  signed_at: string | null;
  created_at: string;
};

export type ContractDetail = Contract & { client_observations: string | null };

type ContractPage = {
  items: Contract[];
  page: number;
  page_size: number;
  total: number;
};

export type ContractFilters = {
  status: ContractStatus | "";
  mode: "" | "manual" | "automatic";
  page: number;
};

export const contractKeys = {
  all: ["contracts"] as const,
  list: (filters: ContractFilters) => ["contracts", "list", filters] as const,
  detail: (id: string) => ["contracts", "detail", id] as const,
};

const path = (id: string) => `/contracts/${encodeURIComponent(id)}`;

export function listContracts(filters: ContractFilters) {
  const params = new URLSearchParams({ page: String(filters.page) });
  if (filters.status) params.set("status", filters.status);
  if (filters.mode) params.set("is_manual_mode", String(filters.mode === "manual"));
  return apiFetch<ContractPage>(`/contracts?${params}`);
}

export function getContract(id: string) {
  return apiFetch<ContractDetail>(path(id));
}

export function downloadContractPdf(id: string) {
  return apiFetchBlob(`${path(id)}/pdf`);
}

export function issueContract(eventId: string) {
  return apiFetch<Contract>("/contracts", { method: "POST", body: { event_id: eventId } });
}

export function resendContractLink(id: string) {
  return apiFetch<Contract>(`${path(id)}/resend-link`, { method: "POST" });
}

export function updateContractObservations(id: string, observations: string | null) {
  return apiFetch<Contract>(`${path(id)}/observations`, {
    method: "PATCH",
    body: { client_observations: observations },
  });
}

export function voidContract(id: string, reason: string) {
  return apiFetch<Contract>(`${path(id)}/void`, { method: "POST", body: { reason } });
}
