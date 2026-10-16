
import { getApiBaseUrl, isJavaBackend } from "@/common/config/app.config";
import { unwrapJava, javaEnvelopeFailure } from "./java/java-envelope";
import { store } from "@/redux/store.redux";
import { refreshJavaAdminSession } from "./java/java-auth-session";
interface BackendErrorPayload {code?:string;message?:string|string[];dependencies?:Record<string,unknown>[]}
export class BackendHttpError extends Error {
  constructor(readonly code:string,message:string,readonly status:number,readonly dependencies?:Record<string,unknown>[]) {
    super(message);this.name='BackendHttpError';
  }
}
export async function backendRequest<TResult>(path: string, method = "GET", body?: unknown, retryAuth = true): Promise<TResult> {
  const token = store.getState().auth.accessToken;
  const multipart = body instanceof FormData;
  const response = await fetch(getApiBaseUrl().replace(/\/$/, "") + "/" + path, {
    method,
    headers: { Accept: "application/json", ...(multipart ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: "Bearer " + token } : {}) },
    body: body === undefined ? undefined : multipart ? body : JSON.stringify(body),
  });
  if (response.status === 401 && isJavaBackend() && retryAuth && token && !path.includes("auth/login") && !path.includes("auth/logout")) {
    const changed = store.getState().auth.accessToken !== token;
    if (changed || await refreshJavaAdminSession()) return backendRequest<TResult>(path, method, body, false);
  }
  if (!response.ok) {
    const error: BackendErrorPayload = await response.json();
    const failure=isJavaBackend()?javaEnvelopeFailure(error):undefined;
    if(failure)throw new BackendHttpError(failure.code,failure.message,response.status,error.dependencies);
    const message=Array.isArray(error.message)?error.message.join(", "):error.message||"Không thể kết nối backend.";
    throw new BackendHttpError(error.code??"REQUEST_FAILED",message,response.status,error.dependencies);
  }
  if (response.status === 204) return undefined as TResult;
  const payload = await response.json();
  const failure=isJavaBackend()?javaEnvelopeFailure(payload):undefined;
  if(failure) throw new BackendHttpError(failure.code,failure.message,failure.status);
  return isJavaBackend() ? unwrapJava<TResult>(payload) : payload;
}
export function toUiEntityIds(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(toUiEntityIds);
  if (typeof value !== "object" || value === null) return value;
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [
    key, typeof entry === "number" && (key === "id" || key.endsWith("Id")) ? String(entry) : toUiEntityIds(entry),
  ]));
}
