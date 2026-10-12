import type { CmsDemoPage } from "./cms-demo.interface";
import { backendRequest, toUiEntityIds } from "@/apis/backend-request";
import { pageWrite } from "./cms-backend.mapper";
import { getDataSourceMode, isJavaBackend } from "@/common/config/app.config";
import { javaCmsPages, javaSaveCmsPage } from '../java/java-cms.api';
export const CMS_DEMO_API_PATH = "/api/demo-cms/pages";
export const CMS_DEMO_CLIENT_URL = (import.meta.env.VITE_CMS_DEMO_CLIENT_URL || "http://localhost:3100").replace(/\/$/, "");

async function request<TResult>(body?: CmsDemoPage): Promise<TResult> {
  if (getDataSourceMode() === "HTTP" && isJavaBackend()) return (body ? javaSaveCmsPage(body) : javaCmsPages()) as Promise<TResult>;
  if (getDataSourceMode() === "HTTP") return requestBackend<TResult>(body);
  const response = await fetch(CMS_DEMO_API_PATH, {
    method: body ? "POST" : "GET",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const error: { message?: string } = await response.json().catch(() => ({}));
    throw new Error(error.message || "Không kết nối được CMS mock. Hãy chạy client dev server và khởi động lại admin.");
  }
  return response.json();
}
export const getCmsDemoPages = (): Promise<CmsDemoPage[]> => request<CmsDemoPage[]>();
export const saveCmsDemoPage = (page: CmsDemoPage): Promise<CmsDemoPage> => request<CmsDemoPage>(page);

async function requestBackend<TResult>(page?: CmsDemoPage): Promise<TResult> {
  const existing = page && /^[1-9]\d*$/.test(page.id);
  const path = "admin/cms/pages" + (existing ? "/" + page.id : "");
  const result = await backendRequest(path, page ? existing ? "PUT" : "POST" : "GET", page ? pageWrite(page) : undefined);
  return toUiEntityIds(result) as TResult;
}
