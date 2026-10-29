// @vitest-environment jsdom
import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import type { JavaStock } from "@/apis/java/java-operations.api";
import { useJavaStockAdjustment } from "./use-java-stock-adjustment";
const mocks = vi.hoisted(() => ({ adjust: vi.fn(), saved: vi.fn(), close: vi.fn() }));
vi.mock("@/apis/java/java-operations.api", () => ({ javaAdjustStock: mocks.adjust }));
const stock: JavaStock = { skuId: 8, productId: 1, skuCode: "R-8", name: "Nhẫn", warehouseId: "MAIN", onHand: 10, reserved: 1, available: 9, stockStatus: "IN_STOCK" };
const observed = vi.fn<(state: ReturnType<typeof useJavaStockAdjustment>) => void>();
let root: Root, container: HTMLDivElement;
function current() {
  const state = observed.mock.lastCall?.[0];
  if (!state) throw new Error("Hook not rendered");
  return state;
}
function Harness() {
  const state = useJavaStockAdjustment(stock, mocks.saved, mocks.close);
  useEffect(() => { observed(state); }, [state]);
  return null;
}
beforeEach(async () => {
  vi.clearAllMocks(); mocks.adjust.mockReset();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  container = document.createElement("div"); root = createRoot(container);
  await act(async () => root.render(<Harness />));
  await act(async () => current().setQuantity("2"));
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); });
test("network retry keeps its key; editing payload starts a new attempt", async () => {
  mocks.adjust.mockRejectedValue(new Error("Timeout"));
  await act(async () => current().save());
  await act(async () => current().save());
  const first = mocks.adjust.mock.calls[0][3].idempotencyKey;
  expect(mocks.adjust.mock.calls[1][3].idempotencyKey).toBe(first);
  expect(mocks.close).not.toHaveBeenCalled();
  await act(async () => current().setQuantity("3"));
  await act(async () => current().save());
  expect(mocks.adjust.mock.calls[2][3].idempotencyKey).not.toBe(first);
});
test("double click makes one request and closes only after success", async () => {
  mocks.adjust.mockResolvedValue(stock);
  await act(async () => { await Promise.all([current().save(), current().save()]); });
  expect(mocks.adjust).toHaveBeenCalledTimes(1);
  expect(mocks.saved).toHaveBeenCalledTimes(1);
  expect(mocks.close).toHaveBeenCalledTimes(1);
});
