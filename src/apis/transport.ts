import axios, { type AxiosRequestConfig } from "axios";
import { store } from "@/redux/store.redux";

import { getApiBaseUrl, getDataSourceMode, isJavaBackend } from "@/common/config/app.config";
import { unwrapJava } from "./java/java-envelope";

/**
 * Single transport boundary — mirrors `jewelry-commerce-client/src/utils/api/transport.ts`.
 *
 * Every API function declares the REST endpoint it will eventually call *and* the mock resolver that
 * serves it today. Switching `VITE_DATA_SOURCE` to `HTTP` routes the identical call to the backend
 * without touching a single page, hook or component.
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiDescriptor<TResult> = {
  /** HTTP verb the future backend will expose. */
  method: HttpMethod;
  /** Backend path relative to the API root, e.g. `admin/catalog/products`. */
  path: string;
  query?: Record<string, unknown>;
  body?: unknown;
  /** Mock resolver used while `VITE_DATA_SOURCE=MOCK`. */
  mock: () => Promise<TResult>;
};

/** Stable error contract: `{ code, message }` regardless of transport. */
export type ApiErrorPayload = {
  code: string;
  message: string;
};

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor({ code, message }: ApiErrorPayload, status = 400) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

const httpClient = axios.create({ timeout: 15000, withCredentials: false });

const dropEmptyQueryValues = (query: Record<string, unknown> | undefined): Record<string, unknown> | undefined => {
  if (!query) return undefined;
  const entries = Object.entries(query).filter(([, value]) => {
    if (value === undefined || value === null || value === "") return false;
    return !(Array.isArray(value) && value.length === 0);
  });
  return entries.length ? Object.fromEntries(entries) : undefined;
};

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as Partial<ApiErrorPayload> | undefined;
    return new ApiError(
      {
        code: payload?.code ?? "REQUEST_FAILED",
        message: payload?.message ?? error.message ?? "The request could not be completed.",
      },
      error.response?.status ?? 500,
    );
  }

  if (error instanceof Error) {
    const code = "code" in error && typeof error.code === "string" ? error.code : "UNEXPECTED_ERROR";
    const status = "status" in error && typeof error.status === "number" ? error.status : 500;
    return new ApiError({ code, message: error.message }, status);
  }

  return new ApiError({ code: "UNEXPECTED_ERROR", message: "Unexpected error." }, 500);
};

export const apiRequest = async <TResult>(descriptor: ApiDescriptor<TResult>): Promise<TResult> => {
  try {
    if (getDataSourceMode() === "MOCK") {
      return await descriptor.mock();
    }

    const config: AxiosRequestConfig = {
      baseURL: getApiBaseUrl(),
      method: descriptor.method,
      url: descriptor.path,
      params: dropEmptyQueryValues(descriptor.query),
      data: descriptor.body,
      headers: { Accept: "application/json", ...(store.getState().auth.accessToken ? { Authorization: "Bearer " + store.getState().auth.accessToken } : {}) },
    };

    const response = await httpClient.request<TResult>(config);
    return isJavaBackend() ? unwrapJava<TResult>(response.data) : response.data;
  } catch (error) {
    throw toApiError(error);
  }
};
