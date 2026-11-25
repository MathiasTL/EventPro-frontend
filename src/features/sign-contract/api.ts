import { apiFetch } from "@/shared/api/client";
import { API_URL } from "@/shared/config/env";

type ContractSummary = {
  contract_number: string;
  client_full_name: string;
  event: {
    event_date: string;
    start_time: string;
    end_time: string;
    address: string;
    district: string;
    package_name: string;
    theme_name: string | null;
    client_observations: string | null;
  };
  total_amount: number | string;
  advance_paid: number | string;
  pending_balance: number | string;
};

export type OtpChallenge = {
  resend_available_in: number;
  phone_hint: string;
};

type OtpVerification = { otp_proof: string };
type SignatureResult = { contract_number: string };

const contractPath = (token: string) => `/contracts/sign/${encodeURIComponent(token)}`;

export function getPublicContract(token: string) {
  return apiFetch<ContractSummary>(contractPath(token), { publicAccess: true });
}

export function publicPdfUrl(token: string) {
  return `${API_URL}${contractPath(token)}/pdf`;
}

export function requestOtp(token: string) {
  return apiFetch<OtpChallenge>(`${contractPath(token)}/otp`, {
    method: "POST",
    publicAccess: true,
  });
}

export function verifyOtp(token: string, code: string) {
  return apiFetch<OtpVerification>(`${contractPath(token)}/otp/verify`, {
    method: "POST",
    body: { otp_code: code },
    publicAccess: true,
  });
}

export function submitSignature(token: string, proof: string, signature: string, name: string) {
  return apiFetch<SignatureResult>(contractPath(token), {
    method: "POST",
    publicAccess: true,
    body: {
      otp_proof: proof,
      signature_base64: signature,
      signer_full_name: name,
      accept_terms: true,
    },
  });
}
