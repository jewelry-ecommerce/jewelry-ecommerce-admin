import { backendRequest } from "@/apis/backend-request";
export const JAVA_OPERATIONS = {
  orders: "admin/orders", stock: "admin/inventory/stock-levels", adjustments: "admin/inventory/adjustments",
  movements: "admin/inventory/movements",
  pageSize: 20, adjustmentReasons: ["RECEIPT", "DAMAGE", "CORRECTION"],
  reasonLabels: { RECEIPT: "Nhập hàng", DAMAGE: "Hàng hỏng", CORRECTION: "Điều chỉnh" },
  referenceMaxLength: 100, noteMaxLength: 500,
  transitions: { PENDING: ["CONFIRMED", "CANCELLED"], CONFIRMED: ["SHIPPING", "CANCELLED"],
    SHIPPING: ["DELIVERED", "CANCELLED"], DELIVERED: [], CANCELLED: [], RETURNED: [] } as Record<string, string[]>,
} as const;
export interface JavaAdminOrderLine { id: number; name: string; skuId: number; quantity: number; unitPrice: number; lineTotal: number; imageUrl?: string }
export interface JavaAdminOrder {
  id: number; code: string; status: string; paymentStatus: string; paymentMethod: string; grandTotal: number;
  shipRecipientName: string; shipPhone: string; shipProvince: string; shipWard: string; shipAddressLine: string;
  trackingCode?: string; note?: string; placedAt: string; items: JavaAdminOrderLine[];
  timeline: { status: string; note?: string; occurredAt: string }[];
}
export interface JavaStock { skuId: number; productId: number; skuCode: string; name: string; warehouseId: string;
  onHand: number; reserved: number; available: number; stockStatus: string }
export interface JavaOperationsPage<T> { list: T[]; total: number }
export function javaAdminOrders(page: number, search: string, status: string): Promise<JavaOperationsPage<JavaAdminOrder>> {
  const query = new URLSearchParams({ page: String(page), take: String(JAVA_OPERATIONS.pageSize), search: '', status: '', paymentStatus: '' });
  if (search.trim()) query.set("search", search.trim());
  if (status !== "ALL") query.set("status", status);
  return backendRequest(JAVA_OPERATIONS.orders + "?" + query);
}
export function javaAdminOrder(code: string): Promise<JavaAdminOrder> {
  return backendRequest(JAVA_OPERATIONS.orders + "/" + encodeURIComponent(code));
}
export function javaChangeOrder(code: string, status: string, note: string, trackingCode: string): Promise<JavaAdminOrder> {
  return backendRequest(JAVA_OPERATIONS.orders + "/" + encodeURIComponent(code) + "/status", "PATCH", { status, note, trackingCode });
}
export function javaStockLevels(search: string): Promise<JavaStock[]> {
  return backendRequest(JAVA_OPERATIONS.stock + "?search=" + encodeURIComponent(search));
}
export interface JavaStockAdjustmentOptions { reference?: string; note?: string; idempotencyKey: string }
export function javaAdjustStock(skuId: number, quantityDelta: number, reason: string, options?: JavaStockAdjustmentOptions): Promise<JavaStock> {
  if (!Number.isSafeInteger(quantityDelta) || quantityDelta === 0) throw new Error("Số lượng điều chỉnh phải là số nguyên khác 0.");
  if ((reason === "RECEIPT" && quantityDelta < 0) || (reason === "DAMAGE" && quantityDelta > 0)) {
    throw new Error("Nhập hàng phải tăng tồn; hàng hỏng phải giảm tồn.");
  }
  return backendRequest(JAVA_OPERATIONS.adjustments, "POST", { skuId, quantityDelta, reason,
    reference: options?.reference, note: options?.note }, true,
    options ? { "Idempotency-Key": options.idempotencyKey } : {});
}
