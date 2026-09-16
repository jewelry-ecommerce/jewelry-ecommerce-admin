import type { Paginated } from "@/apis/product/product.interface";
import type {
  StockAdjustmentPayload,
  StockAdjustmentResult,
  StockLevel,
  StockLevelListQuery,
  StockMovement,
  StockMovementListQuery,
  StockMovementType,
  StockReceiptPayload,
  StockReceiptResult,
  Warehouse,
  WarehousePayload,
} from "@/apis/inventory/inventory.interface";
import { apiRequest } from "@/apis/transport";
import { STOCK_LEVELS, STOCK_MOVEMENTS, WAREHOUSES } from "@/mocks/data/inventory.data";
import { cloneDeep, matchesSearch, MockApiError, normalizeSearch, paginate, withLatency } from "@/mocks/mock-transport";

const DEFAULT_ACTOR = "admin.console";

const requireWarehouse = (warehouseId: string): Warehouse => {
  const warehouse = WAREHOUSES.find((entry) => entry.id === warehouseId);
  if (!warehouse) throw new MockApiError("WAREHOUSE_NOT_FOUND", `No warehouse matches the id ${warehouseId}.`, 404);
  return warehouse;
};

const requireStock = (warehouseId: string, skuCode: string): StockLevel => {
  const stock = STOCK_LEVELS.find((level) => level.warehouseId === warehouseId && level.skuCode === skuCode);
  if (!stock) throw new MockApiError("STOCK_LEVEL_NOT_FOUND", `SKU ${skuCode} is not stocked in warehouse ${warehouseId}.`, 404);
  return stock;
};

const nextMovementId = (): string => `mov-${String(STOCK_MOVEMENTS.length + 1).padStart(4, "0")}`;

/**
 * Applies a signed on-hand delta while preserving `available = onHand - reserved`, then records the
 * movement. This is the single place stock numbers change, so the invariant cannot drift.
 */
const applyStockDelta = (params: {
  stock: StockLevel;
  quantityDelta: number;
  type: StockMovementType;
  referenceCode: string | null;
  note: string;
  actor: string;
}): StockMovement => {
  const { stock, quantityDelta, type, referenceCode, note, actor } = params;
  const nextOnHand = stock.onHand + quantityDelta;

  if (nextOnHand < 0) {
    throw new MockApiError("STOCK_ON_HAND_NEGATIVE", `On-hand for ${stock.skuCode} cannot fall below zero (current ${stock.onHand}).`, 422);
  }
  if (nextOnHand < stock.reserved) {
    throw new MockApiError(
      "STOCK_BELOW_RESERVED",
      `On-hand for ${stock.skuCode} cannot fall below the ${stock.reserved} reserved units.`,
      422,
    );
  }

  const occurredAt = new Date().toISOString();
  stock.onHand = nextOnHand;
  stock.available = stock.onHand - stock.reserved;
  stock.updatedAt = occurredAt;

  const movement: StockMovement = {
    id: nextMovementId(),
    occurredAt,
    warehouseCode: stock.warehouseCode,
    skuCode: stock.skuCode,
    type,
    quantityDelta,
    onHandAfter: stock.onHand,
    reservedAfter: stock.reserved,
    referenceCode,
    note,
    actor,
  };
  STOCK_MOVEMENTS.push(movement);
  return movement;
};

/** GET admin/inventory/warehouses */
export const getWarehouseList = (): Promise<Warehouse[]> =>
  apiRequest({
    method: "GET",
    path: "admin/inventory/warehouses",
    mock: () => withLatency(() => cloneDeep(WAREHOUSES)),
  });

/** POST admin/inventory/warehouses */
export const createWarehouse = (payload: WarehousePayload): Promise<Warehouse> =>
  apiRequest({
    method: "POST",
    path: "admin/inventory/warehouses",
    body: payload,
    mock: () =>
      withLatency(() => {
        if (WAREHOUSES.some((warehouse) => warehouse.code === payload.code)) {
          throw new MockApiError("WAREHOUSE_CODE_TAKEN", `Warehouse code ${payload.code} already exists.`, 409);
        }
        if (payload.isDefault) WAREHOUSES.forEach((warehouse) => (warehouse.isDefault = false));

        const created: Warehouse = { id: `wh-${payload.code.toLowerCase()}`, ...payload };
        WAREHOUSES.push(created);
        return cloneDeep(created);
      }),
  });

/** PUT admin/inventory/warehouses/{warehouseId} */
export const updateWarehouse = (warehouseId: string, payload: WarehousePayload): Promise<Warehouse> =>
  apiRequest({
    method: "PUT",
    path: `admin/inventory/warehouses/${encodeURIComponent(warehouseId)}`,
    body: payload,
    mock: () =>
      withLatency(() => {
        const warehouse = requireWarehouse(warehouseId);
        if (payload.isDefault) WAREHOUSES.forEach((entry) => (entry.isDefault = entry.id === warehouseId));
        Object.assign(warehouse, payload, { isDefault: payload.isDefault ? true : warehouse.isDefault });
        return cloneDeep(warehouse);
      }),
  });

/** GET admin/inventory/stock-levels */
export const getStockLevelList = (query: StockLevelListQuery = {}): Promise<Paginated<StockLevel>> =>
  apiRequest({
    method: "GET",
    path: "admin/inventory/stock-levels",
    query: { ...query },
    mock: () =>
      withLatency(() => {
        const search = normalizeSearch(query.search);
        const matched = STOCK_LEVELS.filter((level) => {
          if (query.warehouseId && level.warehouseId !== query.warehouseId) return false;
          if (query.lowStockOnly && level.available > level.reorderPoint) return false;
          return matchesSearch([level.skuCode, level.productName, level.variantLabel], search);
        });
        const page = paginate(matched, query.page ?? 1, query.take ?? 20);
        return { ...page, list: cloneDeep(page.list) };
      }),
  });

/** GET admin/inventory/stock-levels/low-stock */
export const getLowStockList = (): Promise<StockLevel[]> =>
  apiRequest({
    method: "GET",
    path: "admin/inventory/stock-levels/low-stock",
    mock: () => withLatency(() => cloneDeep(STOCK_LEVELS.filter((level) => level.available <= level.reorderPoint))),
  });

/** POST admin/inventory/adjustments */
export const adjustStock = ({
  warehouseId,
  skuCode,
  quantityDelta,
  reason,
  note,
  actor = DEFAULT_ACTOR,
}: StockAdjustmentPayload): Promise<StockAdjustmentResult> =>
  apiRequest({
    method: "POST",
    path: "admin/inventory/adjustments",
    body: { warehouseId, skuCode, quantityDelta, reason, note },
    mock: () =>
      withLatency(() => {
        if (quantityDelta === 0)
          throw new MockApiError("ADJUSTMENT_DELTA_ZERO", "An adjustment must move stock by a non-zero amount.", 422);
        requireWarehouse(warehouseId);
        const stock = requireStock(warehouseId, skuCode);
        const movement = applyStockDelta({
          stock,
          quantityDelta,
          type: "ADJUSTMENT",
          referenceCode: null,
          note: note.trim() ? `${reason} — ${note}` : reason,
          actor,
        });
        return { stock: cloneDeep(stock), movement: cloneDeep(movement) };
      }),
  });

/** POST admin/inventory/receipts */
export const createStockReceipt = ({
  warehouseId,
  referenceCode,
  lines,
  note,
  actor = DEFAULT_ACTOR,
}: StockReceiptPayload): Promise<StockReceiptResult> =>
  apiRequest({
    method: "POST",
    path: "admin/inventory/receipts",
    body: { warehouseId, referenceCode, lines, note },
    mock: () =>
      withLatency(() => {
        if (lines.length === 0) throw new MockApiError("RECEIPT_EMPTY", "A goods receipt needs at least one line.", 422);
        requireWarehouse(warehouseId);

        const invalidLine = lines.find((line) => line.quantity <= 0);
        if (invalidLine) throw new MockApiError("RECEIPT_QUANTITY_INVALID", `Quantity for ${invalidLine.skuCode} must be positive.`, 422);

        // Resolve every line before mutating so a bad SKU cannot leave a half-applied receipt.
        const targets = lines.map((line) => ({ stock: requireStock(warehouseId, line.skuCode), quantity: line.quantity }));
        const movements = targets.map(({ stock, quantity }) =>
          applyStockDelta({ stock, quantityDelta: quantity, type: "INBOUND", referenceCode: referenceCode, note, actor }),
        );

        return { stocks: cloneDeep(targets.map(({ stock }) => stock)), movements: cloneDeep(movements) };
      }),
  });

/** GET admin/inventory/movements */
export const getStockMovementList = (query: StockMovementListQuery = {}): Promise<Paginated<StockMovement>> =>
  apiRequest({
    method: "GET",
    path: "admin/inventory/movements",
    query: { ...query },
    mock: () =>
      withLatency(() => {
        const search = normalizeSearch(query.search);
        const matched = STOCK_MOVEMENTS.filter((movement) => {
          if (query.warehouseCode && movement.warehouseCode !== query.warehouseCode) return false;
          if (query.type && movement.type !== query.type) return false;
          return matchesSearch([movement.skuCode, movement.referenceCode, movement.note, movement.actor], search);
        }).sort((left, right) => right.occurredAt.localeCompare(left.occurredAt));

        const page = paginate(matched, query.page ?? 1, query.take ?? 20);
        return { ...page, list: cloneDeep(page.list) };
      }),
  });
