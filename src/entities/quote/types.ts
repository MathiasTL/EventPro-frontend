export type QuoteStatus = "SENT" | "PAYMENT_STARTED" | "CONVERTED" | "EXPIRED" | "CANCELLED";

export const quoteStatusLabels: Record<QuoteStatus, string> = {
  SENT: "Enviada",
  PAYMENT_STARTED: "Pago iniciado",
  CONVERTED: "Convertida en reserva",
  EXPIRED: "Vencida",
  CANCELLED: "Cancelada",
};

// Pydantic serializa Decimal como cadena para conservar la precisión monetaria.
export type QuoteMoney = string;
export type QuotePaymentConcept = "ADVANCE" | "BALANCE" | "EXTENSION";
export type QuotePaymentStatus = "PENDING_VERIFICATION" | "REQUIRES_MANUAL_APPROVAL" | "VERIFIED" | "REJECTED" | "REFUND_PENDING" | "REFUNDED";
export type QuoteClient = { id: string; full_name: string; phone: string };
export type QuoteListItem = {
  quote_id: string;
  client: QuoteClient;
  event_date: string;
  package_name: string;
  total_amount: QuoteMoney;
  status: QuoteStatus;
  expires_at: string;
};
export type QuotePage = { items: QuoteListItem[]; page: number; page_size: number; total: number };
export type QuoteFilters = {
  status?: QuoteStatus | "";
  client_id?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  page_size?: number;
};
export type QuoteDetail = {
  quote_id: string;
  client: QuoteClient;
  source: "WHATSAPP" | "MANUAL";
  event_date: string;
  event_time: string;
  location_address: string;
  location_district: string;
  package: { id: string; name: string; base_price: QuoteMoney };
  theme: { id: string; name: string } | null;
  extras: { extra_id: string; name: string; quantity: number; unit_price: QuoteMoney; subtotal: QuoteMoney }[];
  services_subtotal: QuoteMoney;
  final_mobility_amount: QuoteMoney;
  mobility_overridden: boolean;
  total_amount: QuoteMoney;
  advance_amount: QuoteMoney;
  pending_balance: QuoteMoney;
  status: QuoteStatus;
  sent_at: string;
  expires_at: string;
  observations: string | null;
  payments: { payment_id: string; concept: QuotePaymentConcept; validation_status: QuotePaymentStatus }[];
  event_id: string | null;
};
