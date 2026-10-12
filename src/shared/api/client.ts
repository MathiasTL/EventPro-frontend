import { API_URL } from "@/shared/config/env";
import { clearSession, getToken } from "@/shared/lib/auth-storage";

export class ApiRequestError extends Error {
  status: number;
  code: string;

  constructor(status: number, detail: string, code: string) {
    super(detail);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
};

let unauthorizedHandler: (() => Promise<string | null>) | null = null;

/** Permite que la capa de sesión (AuthProvider) inyecte el intento de refresh sin que `shared` dependa de `entities`. */
export function registerUnauthorizedHandler(handler: (() => Promise<string | null>) | null): void {
  unauthorizedHandler = handler;
}

function problemCode(problemType: string | undefined): string {
  if (!problemType) return "request-failed";
  const parts = problemType.split("/");
  return parts[parts.length - 1] || "request-failed";
}

async function send(path: string, options: RequestOptions, token: string | null): Promise<Response> {
  const multipart = options.body instanceof FormData;
  const headers: Record<string, string> = multipart ? {} : { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  try {
    return await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: multipart ? options.body as FormData : options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store",
    });
  } catch {
    throw new ApiRequestError(0, "No se pudo conectar con EventPro. Comprueba que el backend esté disponible.", "network-error");
  }
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}, retrying = false): Promise<T> {
  const response = await send(path, options, getToken());

  if (response.status === 204) {
    return undefined as T;
  }

  const raw = await response.text();
  let data: unknown = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { if (response.ok) throw new ApiRequestError(response.status, "El servidor devolvió una respuesta inválida.", "invalid-response"); }

  if (!response.ok) {
    if (response.status === 401 && !retrying && unauthorizedHandler) {
      const refreshedToken = await unauthorizedHandler();
      if (refreshedToken) {
        return apiFetch<T>(path, options, true);
      }
    }
    if (response.status === 401) {
      clearSession();
    }
    const problem = (data ?? {}) as { detail?: string | { msg: string; loc: string[] }[]; type?: string };
    throw new ApiRequestError(
      response.status,
      typeof problem.detail === "string" ? problem.detail : Array.isArray(problem.detail) ? problem.detail.map(item => `${item.loc.slice(1).join(".")}: ${item.msg}`).join(" · ") : ({ 401: "Tu sesión venció. Inicia sesión otra vez.", 403: "No tienes permiso para esta acción.", 404: "El registro no existe.", 409: "No se puede realizar la acción por un conflicto.", 429: "Demasiados intentos. Espera un minuto y vuelve a intentar." } as Record<number, string>)[response.status] ?? "Error inesperado del servidor.",
      problemCode(problem.type),
    );
  }

  return data as T;
}
