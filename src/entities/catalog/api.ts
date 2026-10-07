import { apiFetch } from "@/shared/api/client";
import type { ListResponse } from "@/shared/types/api";
import type { Resource, ResourceKind } from "./types";

const path = (kind: ResourceKind) => kind === "crews" ? "/crews" : `/catalog/${kind}`;
export const listResources = (kind: ResourceKind) => apiFetch<ListResponse<Resource>>(`${path(kind)}${kind === "crews" ? "" : "?include_inactive=true"}`);
export const saveResource = (kind: ResourceKind, body: Record<string, unknown>, id?: string) => apiFetch<Resource>(`${path(kind)}${id ? `/${id}` : ""}`, { method: id ? "PATCH" : "POST", body });
export const deactivateResource = (kind: ResourceKind, id: string) => kind === "crews"
  ? saveResource(kind, { is_active: false }, id)
  : apiFetch<Resource>(`${path(kind)}/${id}`, { method: "DELETE" });
export const setThemes = (id: string, theme_ids: string[]) => apiFetch(`/catalog/packages/${id}/themes`, { method: "PUT", body: { theme_ids } });
export const setInventory = (id: string, items: { inventory_item_id: string; quantity: number }[]) => apiFetch(`/catalog/packages/${id}/inventory-items`, { method: "PUT", body: { items } });
