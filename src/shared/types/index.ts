export type Role = "SUPERADMIN" | "ENCARGADO" | "OPERADOR";

export interface AuthUser {
  id: string;
  full_name: string;
  role: Role;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export type RefreshResponse = TokenPair;

export interface LoginResponse extends TokenPair {
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface ProblemDetail {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: FieldError[];
}

export type PaymentConcept = "ADVANCE" | "BALANCE" | "EXTENSION";

export type PaymentValidationStatus =
  | "PENDING_VERIFICATION"
  | "REQUIRES_MANUAL_APPROVAL"
  | "VERIFIED"
  | "REJECTED"
  | "REFUND_PENDING"
  | "REFUNDED";

export type PaymentAuditStatus = "UNREVIEWED" | "REVIEWED" | "FLAGGED";

export interface PaymentListItem {
  payment_id: string;
  quote_id: string | null;
  event_id: string | null;
  concept: PaymentConcept;
  payment_method: string | null;
  amount: number;
  validation_status: PaymentValidationStatus;
  audit_status: PaymentAuditStatus | null;
  created_at: string;
}

export interface PaymentDetail extends PaymentListItem {
  transaction_reference: string | null;
  rejection_reason: string | null;
  verified_by_user_id: string | null;
  registered_by_user_id: string | null;
  audited_by_user_id: string | null;
  audited_at: string | null;
  audit_notes: string | null;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  page_size: number;
  total: number;
}

export interface PaymentsQuery {
  validation_status?: PaymentValidationStatus | "";
  concept?: PaymentConcept | "";
  audit_status?: PaymentAuditStatus | "";
  quote_id?: string;
  page?: number;
  page_size?: number;
}

export interface VerifyPaymentRequest {
  status: "VERIFIED" | "REJECTED";
  rejection_reason?: string | null;
}

export interface VerifyPaymentResponse {
  payment_id: string;
  validation_status: PaymentValidationStatus;
  event_created_id: string | null;
  contract_status: string | null;
  reason?: string | null;
}

export interface AuditPaymentRequest {
  audit_status: "REVIEWED" | "FLAGGED";
  audit_notes?: string | null;
}

export interface RefundPaymentRequest {
  refund_method: string;
  transaction_reference?: string | null;
  notes?: string | null;
}
