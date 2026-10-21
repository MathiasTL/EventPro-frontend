import { apiFetch } from "@/shared/api/client";
import type { PageResponse } from "@/shared/types/api";
import type { UserOption, UserReadResponse } from "./types";

/** SUPERADMIN only (the endpoint is RBAC-restricted); `page_size` 100 is the backend maximum. */
export async function listActiveManagers(): Promise<UserOption[]> {
  const page = await apiFetch<PageResponse<UserReadResponse>>("/users?role=ENCARGADO&is_active=true&page_size=100");
  return page.items.map(user => ({ id: user.id, name: user.full_name }));
}
