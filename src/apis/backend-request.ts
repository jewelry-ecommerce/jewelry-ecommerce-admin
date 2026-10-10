
import { getApiBaseUrl } from "@/common/config/app.config";
import { store } from "@/redux/store.redux";
interface BackendErrorPayload {code?:string;message?:string|string[];dependencies?:Record<string,unknown>[]}
export class BackendHttpError extends Error {
  constructor(readonly code:string,message:string,readonly status:number,readonly dependencies?:Record<string,unknown>[]) {
    super(message);this.name='BackendHttpError';
  }
}
export async function backendRequest<TResult>(path: string, method = "GET", body?: unknown): Promise<TResult> {
  const token = store.getState().auth.accessToken;
  const multipart = body instanceof FormData;
  const response = await fetch(getApiBaseUrl().replace(/\/$/, "") + "/" + path, {
    method,
    headers: { Accept: "application/json", ...(multipart ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: "Bearer " + token } : {}) },
    body: body === undefined ? undefined : multipart ? body : JSON.stringify(body),
  });
  if (!response.ok) {
    const error: BackendErrorPayload = await response.json();
    const message=Array.isArray(error.message)?error.message.join(", "):error.message||"Không thể kết nối backend.";
    throw new BackendHttpError(error.code??"REQUEST_FAILED",message,response.status,error.dependencies);
  }
  return response.json();
}
export function toUiEntityIds(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(toUiEntityIds);
  if (typeof value !== "object" || value === null) return value;
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [
    key, typeof entry === "number" && (key === "id" || key.endsWith("Id")) ? String(entry) : toUiEntityIds(entry),
  ]));
}
