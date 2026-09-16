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
export const WAREHOUSES: Warehouse[] = [
  {
    id: "wh-hcm-main",
    code: "WH-HCM",
    name: "Ho Chi Minh City — main vault",
    city: "Ho Chi Minh City",
    address: "45 Dong Khoi, District 1",
    isDefault: true,
    isActive: true,
  },
  {
    id: "wh-hn-salon",
    code: "WH-HN",
    name: "Hanoi — salon stock",
    city: "Hanoi",
    address: "18 Ly Thai To, Hoan Kiem",
    isDefault: false,
    isActive: true,
  },
  {
    id: "wh-dn-salon",
    code: "WH-DN",
    name: "Da Nang — salon stock",
    city: "Da Nang",
    address: "9 Bach Dang, Hai Chau",
    isDefault: false,
    isActive: true,
  },
];

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

export const STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: "mov-0001",
    occurredAt: "2026-09-01T02:10:00.000Z",
    warehouseCode: "WH-HCM",
    skuCode: "RING-DIA-001",
    type: "INBOUND",
    quantityDelta: 6,
    onHandAfter: 9,
    reservedAfter: 0,
    referenceCode: "GRN-2026-0142",
    note: "Received from the workshop.",
    actor: "warehouse.staff",
  },
  {
    id: "mov-0002",
    occurredAt: "2026-09-04T03:20:00.000Z",
    warehouseCode: "WH-HCM",
    skuCode: "RING-DIA-001",
    type: "RESERVE",
    quantityDelta: 0,
    onHandAfter: 9,
    reservedAfter: 1,
    referenceCode: "ORD-2026-0841",
    note: "Reserved on order confirmation.",
    actor: "system",
  },
  {
    id: "mov-0003",
    occurredAt: "2026-09-05T07:45:00.000Z",
    warehouseCode: "WH-HCM",
    skuCode: "RING-DIA-001",
    type: "COMMIT",
    quantityDelta: -1,
    onHandAfter: 8,
    reservedAfter: 0,
    referenceCode: "ORD-2026-0841",
    note: "Committed on dispatch.",
    actor: "system",
  },
  {
    id: "mov-0004",
    occurredAt: "2026-09-06T04:05:00.000Z",
    warehouseCode: "WH-HCM",
    skuCode: "EARR-HOP-001",
    type: "RELEASE",
    quantityDelta: 0,
    onHandAfter: 30,
    reservedAfter: 0,
    referenceCode: "ORD-2026-0877",
    note: "Reservation released after cancellation.",
    actor: "system",
  },
  {
    id: "mov-0005",
    occurredAt: "2026-09-07T06:30:00.000Z",
    warehouseCode: "WH-HCM",
    skuCode: "BRAC-SAP-001",
    type: "ADJUSTMENT",
    quantityDelta: -1,
    onHandAfter: 2,
    reservedAfter: 0,
    referenceCode: null,
    note: "Cycle count correction.",
    actor: "inventory.lead",
  },
  {
    id: "mov-0006",
    occurredAt: "2026-09-08T01:15:00.000Z",
    warehouseCode: "WH-HCM",
    skuCode: "CHRM-CLV-001",
    type: "INBOUND",
    quantityDelta: 24,
    onHandAfter: 49,
    reservedAfter: 1,
    referenceCode: "GRN-2026-0151",
    note: "Charm restock.",
    actor: "warehouse.staff",
  },
];
