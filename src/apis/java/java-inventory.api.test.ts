import { beforeEach, expect, test, vi } from "vitest";
vi.mock("@/common/config/app.config", () => ({ isJavaBackend: () => true, getApiBaseUrl: () => "https://java.test/api/v1" }));
vi.mock("@/redux/store.redux", () => ({ store: { getState: () => ({ auth: { accessToken: "test-token" } }) } }));
vi.mock("./java-auth-session", () => ({ refreshJavaAdminSession: vi.fn(async () => true) }));
import { javaAdjustStock } from "./java-operations.api";
import { javaInventoryMovements, javaInventoryMovement } from "./java-inventory-movements.api";
const fetchMock = vi.fn();
const success = (data: unknown) => new Response(JSON.stringify({ status: 200, data }), { status: 200 });
beforeEach(() => { vi.clearAllMocks(); vi.stubGlobal("fetch", fetchMock); });

test("stock adjustment preserves the same idempotency key and body after auth refresh", async () => {
  fetchMock.mockResolvedValueOnce(new Response("{}", { status: 401 })).mockResolvedValueOnce(success({ skuId: 8, onHand: 12 }));
  await javaAdjustStock(8, 2, "RECEIPT", { reference: "PN-001", note: "Nhập bù", idempotencyKey: "stock-attempt-001" });
  expect(fetchMock).toHaveBeenCalledTimes(2);
  for (const [, request] of fetchMock.mock.calls) {
    expect(request.headers["Idempotency-Key"]).toBe("stock-attempt-001");
    expect(JSON.parse(request.body)).toEqual({ skuId: 8, quantityDelta: 2, reason: "RECEIPT", reference: "PN-001", note: "Nhập bù" });
  }
});
test.each([[0, "CORRECTION"], [-1, "RECEIPT"], [1, "DAMAGE"], [1.2, "CORRECTION"]])(
  "invalid delta %s / %s never changes stock", (delta, reason) => {
    expect(() => javaAdjustStock(Number(8), Number(delta), String(reason))).toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });
test("ledger filters and one-based page are sent; Java pagination is normalized", async () => {
  fetchMock.mockResolvedValueOnce(success({ content: [{ id: 4 }], page: 2, size: 20, totalElements: 21, totalPages: 2 }));
  const result = await javaInventoryMovements({ skuId: "8", reason: "RECEIPT", from: "2026-10-01", to: "2026-10-29" }, 2, 20);
  const url = new URL(fetchMock.mock.calls[0][0]);
  expect(Object.fromEntries(url.searchParams)).toEqual({ page: "2", take: "20", skuId: "8", reason: "RECEIPT", from: "2026-10-01", to: "2026-10-29" });
  expect(result).toMatchObject({ list: [{ id: 4 }], total: 21 });
});
test("movement detail errors remain visible instead of becoming an empty success", async () => {
  fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ status: 403, errors: [{ code: "FORBIDDEN", message: "Không có quyền" }] }), { status: 403 }));
  await expect(javaInventoryMovement(4)).rejects.toMatchObject({ status: 403, code: "FORBIDDEN" });
});
