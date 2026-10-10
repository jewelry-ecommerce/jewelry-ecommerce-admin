import type { StockLevel, StockMovement, Warehouse } from "@/apis/inventory/inventory.interface";
import { ALL_VARIANTS, findProductById } from "./catalog.data";
import { ORDERS } from "./order.data";

/**
 * Inventory fixtures derived from the catalog so the two never drift.
 *
 * On-hand starts from the variant's seeded stock plus its outstanding reservations, and reserved is
 * computed from orders that have claimed stock but not yet shipped. `available` is then always
 * `onHand - reserved`, which is the invariant the admin stock screens demonstrate.
 */
export const WAREHOUSES: Warehouse[] = [];

/** Statuses whose stock is reserved but not yet dispatched. */
const RESERVING_STATUSES = new Set(["PENDING", "CONFIRMED", "PREPARING", "PACKED"]);

const buildReservedBySku = (): Map<string, number> => {
  const reserved = new Map<string, number>();
  for (const order of ORDERS) {
    if (!RESERVING_STATUSES.has(order.status)) continue;
    for (const line of order.lines) {
      reserved.set(line.skuCode, (reserved.get(line.skuCode) ?? 0) + line.quantity);
    }
  }
  return reserved;
};

const RESERVED_BY_SKU = buildReservedBySku();

export const STOCK_LEVELS: StockLevel[] = ALL_VARIANTS.map((variant) => {
  const product = findProductById(variant.productId);
  const reserved = RESERVED_BY_SKU.get(variant.skuCode) ?? 0;
  // The seeded availability is what the storefront should see, so on-hand carries the reservations.
  const onHand = variant.availableStock + reserved;

  return {
    warehouseId: "wh-hcm-main",
    warehouseCode: "WH-HCM",
    skuCode: variant.skuCode,
    variantId: variant.id,
    productId: variant.productId,
    productName: product?.name ?? variant.name,
    variantLabel: [variant.metalColorLabel, variant.sizeLabel].filter(Boolean).join(" · "),
    onHand,
    reserved,
    available: onHand - reserved,
    reorderPoint: variant.salePrice > 40000000 ? 2 : 6,
    updatedAt: "2026-09-08T02:00:00.000Z",
  };
});

export const findStockBySku = (skuCode: string): StockLevel | undefined => STOCK_LEVELS.find((level) => level.skuCode === skuCode);

export const LOW_STOCK_LEVELS: StockLevel[] = STOCK_LEVELS.filter((level) => level.available <= level.reorderPoint);

export const STOCK_MOVEMENTS: StockMovement[] = [];
