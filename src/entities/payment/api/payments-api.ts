import { apiClient } from "@/shared/api";
import { PAYMENTS_ENDPOINTS } from "@/shared/config";
import type {
  AuditPaymentRequest,
  Paginated,
  PaymentDetail,
  PaymentListItem,
  PaymentsQuery,
  RefundPaymentRequest,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
} from "@/shared/types";

function toSearchParams(query: PaymentsQuery): string {
  const params = new URLSearchParams();
  if (query.validation_status) params.set("validation_status", query.validation_status);
  if (query.concept) params.set("concept", query.concept);
  if (query.audit_status) params.set("audit_status", query.audit_status);
  if (query.quote_id) params.set("quote_id", query.quote_id);
  params.set("page", String(query.page ?? 1));
  params.set("page_size", String(query.page_size ?? 20));
  return params.toString();
}

export async function listPayments(query: PaymentsQuery): Promise<Paginated<PaymentListItem>> {
  const { data } = await apiClient.get<Paginated<PaymentListItem>>(
    `${PAYMENTS_ENDPOINTS.list}?${toSearchParams(query)}`,
  );
  return data;
}

export async function getPayment(id: string): Promise<PaymentDetail> {
  const { data } = await apiClient.get<PaymentDetail>(PAYMENTS_ENDPOINTS.byId(id));
  return data;
}

export async function getPaymentEvidenceBlob(id: string): Promise<{ blob: Blob; contentType: string | null }> {
  const { data, headers } = await apiClient.get<Blob>(PAYMENTS_ENDPOINTS.evidence(id), {
    responseType: "blob",
  });
  const contentType = (headers?.["content-type"] as string | undefined) ?? null;
  return { blob: data, contentType };
}

export async function verifyPayment(id: string, body: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
  const { data } = await apiClient.patch<VerifyPaymentResponse>(PAYMENTS_ENDPOINTS.verify(id), body);
  return data;
}

export async function auditPayment(id: string, body: AuditPaymentRequest): Promise<PaymentDetail> {
  const { data } = await apiClient.patch<PaymentDetail>(PAYMENTS_ENDPOINTS.audit(id), body);
  return data;
}

export async function refundPayment(id: string, body: RefundPaymentRequest): Promise<PaymentDetail> {
  const { data } = await apiClient.patch<PaymentDetail>(PAYMENTS_ENDPOINTS.refund(id), body);
  return data;
}
