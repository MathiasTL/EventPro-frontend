import { apiFetch } from "@/shared/api/client";
import type { SessionUser } from "@/shared/lib/auth-storage";

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user?: SessionUser;
};

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}
