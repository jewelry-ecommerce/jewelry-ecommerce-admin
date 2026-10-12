import { backendRequest } from "@/apis/backend-request";
export const CUSTOMER_REQUEST_POLICY = {
  path: "admin/customer-request", pageTake: 20,
  types: [{ value: "BACK_IN_STOCK", path: "back-in-stock", label: "Báo khi có hàng" },
    { value: "ORDER_SUPPORT", path: "order-support", label: "Hỗ trợ đơn hàng" },
    { value: "NEWSLETTER", path: "newsletter", label: "Đăng ký nhận tin" }],
  statuses: [{ value: "NEW", label: "Mới" }, { value: "UNPROCESSED", label: "Chưa xử lý" },
    { value: "CONTACTED", label: "Đã liên hệ" }, { value: "IN_PROGRESS", label: "Đang xử lý" }, { value: "COMPLETED", label: "Hoàn tất" }],
} as const;
export interface JavaCustomerRequest { id: string; type: string; status: string; contactChannel: string; contactValue: string;
  requestedAt: string; productId?: string; productVariantId?: string; skuCode?: string; productNameSnapshot?: string;
  productImageUrlSnapshot?: string; variantTextSnapshot?: string; orderCode?: string; orderType?: string }
export interface CustomerRequestPage { list: JavaCustomerRequest[]; total: number }
export function javaCustomerRequests(type: string, page: number, keyword: string, status: string): Promise<CustomerRequestPage> {
  const definition = CUSTOMER_REQUEST_POLICY.types.find(entry => entry.value === type);
  if (!definition) throw new Error("Loại yêu cầu không hợp lệ.");
  const query = new URLSearchParams({ page: String(page), take: String(CUSTOMER_REQUEST_POLICY.pageTake), keyword });
  if (status !== "ALL") query.set("status", status);
  return backendRequest(CUSTOMER_REQUEST_POLICY.path + "/" + definition.path + "?" + query);
}
export function javaCustomerRequestStatus(ids: string[], type: string, status: string): Promise<{ success: boolean }> {
  if (!ids.length || ids.some(id => !/^[1-9][0-9]*$/.test(id))) throw new Error("Chọn yêu cầu hợp lệ trước khi cập nhật.");
  return backendRequest(CUSTOMER_REQUEST_POLICY.path + "/status/bulk", "PATCH", { ids, type, status });
}
