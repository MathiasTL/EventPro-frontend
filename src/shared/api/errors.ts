import axios from "axios";

import type { FieldError, ProblemDetail } from "@/shared/types";

export class ApiError extends Error {
  readonly status: number;
  readonly type: string;
  readonly detail: string;
  readonly instance?: string;
  readonly fieldErrors?: FieldError[];

  constructor(problem: ProblemDetail) {
    super(problem.detail ?? problem.title);
    this.name = "ApiError";
    this.status = problem.status;
    this.type = problem.type ?? "";
    this.detail = problem.detail ?? problem.title;
    this.instance = problem.instance;
    this.fieldErrors = problem.errors;
  }
}

function isProblemDetail(data: unknown): data is ProblemDetail {
  return (
    typeof data === "object" &&
    data !== null &&
    "title" in data &&
    "status" in data
  );
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data;
    if (isProblemDetail(data)) return new ApiError(data);
    return new ApiError({
      type: "https://errors.eventpro.pe/network-error",
      title: "Error de comunicación",
      status: error.response?.status ?? 0,
      detail: error.response ? error.message : "No se pudo conectar con el servidor.",
    });
  }

  return new ApiError({
    type: "https://errors.eventpro.pe/unexpected-error",
    title: "Error inesperado",
    status: 0,
    detail: error instanceof Error ? error.message : "Error desconocido.",
  });
}
