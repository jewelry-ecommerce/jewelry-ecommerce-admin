import { getApiBaseUrl } from "@/common/config/app.config";
import { store } from "@/redux/store.redux";
import { clearAuth, setAuthTokens } from "@/redux/auth/auth.slice";
import { unwrapJava } from "./java-envelope";
interface RefreshedTokens { accessToken: string; refreshToken: string }
const AUTH_SESSION_POLICY = { refreshPath: "auth/refresh" };
let pendingRefresh: Promise<boolean> | null = null;
async function refresh(): Promise<boolean> {
  const previous = store.getState().auth.refreshToken;
  if (!previous) return false;
  const response = await fetch(getApiBaseUrl().replace(/\/$/, "") + "/" + AUTH_SESSION_POLICY.refreshPath, {
    method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ refreshToken: previous }),
  });
  if (store.getState().auth.refreshToken !== previous) return false;
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) store.dispatch(clearAuth());
    return false;
  }
  const tokens = unwrapJava<RefreshedTokens>(await response.json());
  if (!tokens.accessToken || !tokens.refreshToken) throw new Error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
  store.dispatch(setAuthTokens(tokens));
  return true;
}
export function refreshJavaAdminSession(): Promise<boolean> {
  if (pendingRefresh) return pendingRefresh;
  pendingRefresh = refresh().finally(() => { pendingRefresh = null; });
  return pendingRefresh;
}
