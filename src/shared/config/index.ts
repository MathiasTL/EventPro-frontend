import type { Role } from "@/shared/types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const API_PREFIX = "/api/v1";

export const AUTH_ENDPOINTS = {
  login: `${API_PREFIX}/auth/login`,
  refresh: `${API_PREFIX}/auth/refresh`,
  logout: `${API_PREFIX}/auth/logout`,
} as const;

export const PAYMENTS_ENDPOINTS = {
  list: `${API_PREFIX}/payments`,
  byId: (id: string) => `${API_PREFIX}/payments/${id}`,
  evidence: (id: string) => `${API_PREFIX}/payments/${id}/evidence`,
  verify: (id: string) => `${API_PREFIX}/payments/${id}/verify`,
  audit: (id: string) => `${API_PREFIX}/payments/${id}/audit`,
  refund: (id: string) => `${API_PREFIX}/payments/${id}/refund`,
} as const;

export const HOME_BY_ROLE: Record<Role, string> = {
  SUPERADMIN: "/panel",
  ENCARGADO: "/panel",
  OPERADOR: "/agenda",
};
