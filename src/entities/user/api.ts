import { apiFetch } from "@/shared/api/client";
import type { PageResponse } from "@/shared/types/api";
import type { CreateUserRequest, UpdateUserRequest, UserOption, UserReadResponse } from "./types";

export function listUsers(params: string) { return apiFetch<PageResponse<UserReadResponse>>(`/users?${params}`); }
export function getUser(id: string) { return apiFetch<UserReadResponse>(`/users/${encodeURIComponent(id)}`); }
export function createUser(body: CreateUserRequest) { return apiFetch<UserReadResponse>("/users", { method: "POST", body }); }
export function updateUser(id: string, body: UpdateUserRequest) { return apiFetch<UserReadResponse>(`/users/${encodeURIComponent(id)}`, { method: "PATCH", body }); }

/** SUPERADMIN only (the endpoint is RBAC-restricted); `page_size` 100 is the backend maximum. */
export async function listActiveManagers(): Promise<UserOption[]> {
  const page = await apiFetch<PageResponse<UserReadResponse>>("/users?role=ENCARGADO&is_active=true&page_size=100");
  return page.items.map(user => ({ id: user.id, name: user.full_name }));
}
