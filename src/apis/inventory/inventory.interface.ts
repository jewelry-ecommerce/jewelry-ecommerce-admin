/**
 * Inventory contract mirroring `jewelry-commerce-client/src/utils/api/inventory/inventory.interface.ts`.
 *
 * Invariant: `available = onHand - reserved`. Every mutation in `inventory.api.ts` keeps that
 * identity true and appends a `StockMovement`.
 */
export type Warehouse = {
  id: string;
  code: string;
  name: string;
  city: string;
  address: string;
  isDefault: boolean;
  isActive: boolean;
};

export type StockLevel = {
  warehouseId: string;
  warehouseCode: string;
  skuCode: string;
  variantId: string;
  productId: string;
  productName: string;
  variantLabel: string;
  onHand: number;
  reserved: number;
  /** Always `onHand - reserved`. */
  available: number;
  reorderPoint: number;
  updatedAt: string;
};

export type StockMovementType = "INBOUND" | "ADJUSTMENT" | "RESERVE" | "RELEASE" | "COMMIT" | "RETURN";

export type StockMovement = {
  id: string;
  occurredAt: string;
  warehouseCode: string;
  skuCode: string;
  type: StockMovementType;
  quantityDelta: number;
  onHandAfter: number;
  reservedAfter: number;
  referenceCode: string | null;
  note: string;
  actor: string;
};

export type StockAdjustmentPayload = {
  warehouseId: string;
  skuCode: string;
  /** Signed delta applied to on-hand quantity. */
  quantityDelta: number;
  reason: string;
  note: string;
  actor?: string;
};

export type StockReceiptLine = {
  skuCode: string;
  quantity: number;
};

export type StockReceiptPayload = {
  warehouseId: string;
  referenceCode: string;
  lines: StockReceiptLine[];
  note: string;
  actor?: string;
};

/* ------------------------------------------------------------------------------------------------
 * Admin-side contracts
 * ---------------------------------------------------------------------------------------------- */

export type StockLevelListQuery = {
  page?: number;
  take?: number;
  search?: string;
  warehouseId?: string;
  /** Only rows at or below their reorder point. */
  lowStockOnly?: boolean;
};

export type StockMovementListQuery = {
  page?: number;
  take?: number;
  search?: string;
  warehouseCode?: string;
  type?: StockMovementType;
};

export type WarehousePayload = {
  code: string;
  name: string;
  city: string;
  address: string;
  isDefault: boolean;
  isActive: boolean;
};

export type StockAdjustmentResult = {
  stock: StockLevel;
  movement: StockMovement;
};

export type StockReceiptResult = {
  stocks: StockLevel[];
  movements: StockMovement[];
};
