import { expect, test } from "vitest";
import { JavaDiscountKind, JavaDiscountStatus, JavaDiscountType, validateJavaDiscount, type JavaDiscountBody } from "./java-discount.api";
const body: JavaDiscountBody = { name: "Sale", code: "SALE10", status: JavaDiscountStatus.PUBLISHED,
  discountType: JavaDiscountType.PERCENT, discountValue: 10, startsAt: "2026-10-01T00:00:00Z", endsAt: "2026-11-01T00:00:00Z", productIds: [12] };
test("published markdown/flat-price configuration uses real selected product IDs", () => {
  expect(() => validateJavaDiscount(JavaDiscountKind.PROMOTION, body)).not.toThrow();
  expect(() => validateJavaDiscount(JavaDiscountKind.PROMOTION, { ...body, discountType: JavaDiscountType.FLAT_PRICE, discountValue: 100000 })).not.toThrow();
});
test("promotion cannot be saved without target products", () => {
  expect(() => validateJavaDiscount(JavaDiscountKind.PROMOTION, { ...body, productIds: [] })).toThrow("sản phẩm");
});
test("reject percentage overflow and reversed dates before mutating Java", () => {
  expect(() => validateJavaDiscount(JavaDiscountKind.VOUCHER, { ...body, discountValue: 101 })).toThrow("100%");
  expect(() => validateJavaDiscount(JavaDiscountKind.VOUCHER, { ...body, startsAt: body.endsAt, endsAt: body.startsAt })).toThrow("thời gian");
});
test("voucher supports percent/fixed only, and usage count must be integral", () => {
  expect(() => validateJavaDiscount(JavaDiscountKind.VOUCHER, { ...body, discountType: JavaDiscountType.FLAT_PRICE })).toThrow("đồng giá");
  expect(() => validateJavaDiscount(JavaDiscountKind.VOUCHER, { ...body, usageLimit: 1.5 })).toThrow("số nguyên");
});
