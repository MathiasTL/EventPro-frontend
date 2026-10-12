import { apiFetch } from "@/shared/api/client";
import type { PageResponse } from "@/shared/types/api";
import type { PanelUser, UserRole } from "./types";

export type UserFilters = {
  role?: UserRole;
  is_active?: boolean;
  q?: string;
  page?: number;
  page_size?: number;
};

export type CreateUserInput = {
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
  password: string;
};

export type UpdateUserInput = Partial<{
  full_name: string;
  phone: string;
  role: UserRole;
  is_active: boolean;
  password: string;
}>;

export function listUsers(filters: UserFilters = {}): Promise<PageResponse<PanelUser>> {
  const params = new URLSearchParams();
  if (filters.role) params.set("role", filters.role);
  if (filters.is_active !== undefined) params.set("is_active", String(filters.is_active));
  if (filters.q) params.set("q", filters.q);
  params.set("page", String(filters.page ?? 1));
  params.set("page_size", String(filters.page_size ?? 20));
  return apiFetch<PageResponse<PanelUser>>(`/users?${params.toString()}`);
}

export function createUser(input: CreateUserInput): Promise<PanelUser> {
  return apiFetch<PanelUser>("/users", { method: "POST", body: input });
}

export function updateUser(id: string, input: UpdateUserInput): Promise<PanelUser> {
  return apiFetch<PanelUser>(`/users/${id}`, { method: "PATCH", body: input });
}
