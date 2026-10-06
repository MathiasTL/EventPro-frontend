import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { API_URL, AUTH_ENDPOINTS } from "@/shared/config";
import type { RefreshResponse } from "@/shared/types";
import { ApiError, toApiError } from "./errors";
import { tokenStore } from "./token-store";

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const NON_REFRESHABLE_PATHS = new Set<string>([
  AUTH_ENDPOINTS.login,
  AUTH_ENDPOINTS.refresh,
]);

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStore.getAccess();
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

let refreshPromise: Promise<string> | null = null;

export function refreshSession(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) {
    return Promise.reject(
      new ApiError({
        type: "https://errors.eventpro.pe/invalid-credentials",
        title: "No autorizado",
        status: 401,
        detail: "Tu sesión expiró. Inicia sesión nuevamente.",
      }),
    );
  }

  refreshPromise = axios
    .post<RefreshResponse>(`${API_URL}${AUTH_ENDPOINTS.refresh}`, {
      refresh_token: refreshToken,
    })
    .then(({ data }) => {
      tokenStore.setAccess(data.access_token);
      tokenStore.setRefresh(data.refresh_token);
      return data.access_token;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const canRetryWithRefresh =
      error.response?.status === 401 &&
      config !== undefined &&
      config._retry !== true &&
      config.url !== undefined &&
      !NON_REFRESHABLE_PATHS.has(config.url);

    if (canRetryWithRefresh && config) {
      config._retry = true;
      try {
        await refreshSession();
        return apiClient(config);
      } catch (refreshError) {
        tokenStore.clear();
        throw toApiError(refreshError);
      }
    }

    throw toApiError(error);
  },
);
