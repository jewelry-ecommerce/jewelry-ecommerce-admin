import { backendRequest } from "@/apis/backend-request";
export enum JavaDiscountKind { PROMOTION = "PROMOTION", VOUCHER = "VOUCHER" }
export enum JavaDiscountType { PERCENT = "PERCENT", FIXED = "FIXED", FLAT_PRICE = "FLAT_PRICE" }
export enum JavaDiscountStatus { DRAFT = "DRAFT", PUBLISHED = "PUBLISHED" }
export const JAVA_DISCOUNT_POLICY = { paths: { PROMOTION: "admin/promotions", VOUCHER: "admin/vouchers" }, percentMaximum: 100, productPickerLimit: 100 };
export interface JavaDiscount { id: number; createdDate?:string; name?: string; code?: string; discountType: JavaDiscountType; discountValue: number;
  maxDiscountAmount?: number | null; minOrderValue?: number | null; usageLimit?: number | null; usedCount?: number;
  startsAt: string; endsAt: string; status: JavaDiscountStatus; productIds?: number[] }
export type JavaDiscountBody = Omit<JavaDiscount, "id" | "usedCount">;
export function javaDiscountList(kind: JavaDiscountKind): Promise<JavaDiscount[]> {
  return backendRequest(JAVA_DISCOUNT_POLICY.paths[kind]);
}
export function validateJavaDiscount(kind: JavaDiscountKind, body: JavaDiscountBody): void {
  if (!(kind === JavaDiscountKind.PROMOTION ? body.name?.trim() : body.code?.trim())) throw new Error("Nhập tên chương trình / mã giảm giá.");
  const amount = Number(body.discountValue);
  if (!Number.isFinite(amount) || amount < 0) throw new Error("Giá trị giảm giá phải là số không âm.");
  if (body.discountType === JavaDiscountType.PERCENT && amount > JAVA_DISCOUNT_POLICY.percentMaximum) throw new Error("Tỷ lệ giảm không vượt quá 100%.");
  const start = Date.parse(body.startsAt), end = Date.parse(body.endsAt);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) throw new Error("Chọn thời gian bắt đầu và kết thúc hợp lệ.");
  for (const value of [body.maxDiscountAmount, body.minOrderValue, body.usageLimit])
    if (value != null && (!Number.isFinite(value) || value < 0)) throw new Error("Giới hạn và giá trị tối thiểu không được âm.");
  if (body.usageLimit != null && !Number.isInteger(body.usageLimit)) throw new Error("Giới hạn lượt dùng phải là số nguyên.");
  if (kind === JavaDiscountKind.VOUCHER && body.discountType === JavaDiscountType.FLAT_PRICE) throw new Error("Mã giảm giá không hỗ trợ đồng giá.");
  if (kind === JavaDiscountKind.PROMOTION && (!body.productIds?.length || body.productIds.some(id => !Number.isSafeInteger(id) || id < 1)))
    throw new Error("Chọn sản phẩm áp dụng hợp lệ.");
}
export async function javaSaveDiscount(kind: JavaDiscountKind, body: JavaDiscountBody, id?: number): Promise<JavaDiscount> {
  validateJavaDiscount(kind, body);
  return backendRequest(JAVA_DISCOUNT_POLICY.paths[kind] + (id ? "/" + id : ""), id ? "PUT" : "POST", body);
}
export function javaDeleteDiscount(kind: JavaDiscountKind, id: number): Promise<void> {
  return backendRequest(JAVA_DISCOUNT_POLICY.paths[kind] + "/" + id, "DELETE");
}
