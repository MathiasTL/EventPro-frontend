import axios from "axios";

import { API_URL, AUTH_ENDPOINTS } from "@/shared/config";
import type { LoginRequest, LoginResponse } from "@/shared/types";
import { apiClient, refreshSession } from "./client";
import { tokenStore } from "./token-store";

export async function login(
  credentials: LoginRequest,
): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>(
    AUTH_ENDPOINTS.login,
    credentials,
  );
  tokenStore.setAccess(data.access_token);
  tokenStore.setRefresh(data.refresh_token);
  return data;
}

export async function logout(): Promise<void> {
  try {
    const refreshToken = tokenStore.getRefresh();
    if (tokenStore.getAccess() && refreshToken) {
      const accessToken = await refreshSession();
      await axios.post(
        `${API_URL}${AUTH_ENDPOINTS.logout}`,
        { refresh_token: tokenStore.getRefresh() },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
    }
  } catch {
    // Revocación best-effort: la sesión local se cierra aunque falle el backend.
  } finally {
    tokenStore.clear();
  }
}
