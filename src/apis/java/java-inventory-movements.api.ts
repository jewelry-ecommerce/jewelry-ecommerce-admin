import { backendRequest } from "@/apis/backend-request";
import { JAVA_OPERATIONS, type JavaOperationsPage } from "./java-operations.api";

export interface JavaInventoryMovement {
  id: number; skuId: number; skuCode: string; skuName: string; warehouseId: string;
  reason: string; quantityDelta: number; onHandBefore: number; onHandAfter: number;
  reservedAfter: number; reference?: string; note?: string; actorId?: number; createdDate: string;
}
export interface JavaMovementFilters { skuId: string; reason: string; from: string; to: string }
export const EMPTY_MOVEMENT_FILTERS: JavaMovementFilters = { skuId: "", reason: "", from: "", to: "" };
export function javaInventoryMovements(filters: JavaMovementFilters, page: number, take: number): Promise<JavaOperationsPage<JavaInventoryMovement>> {
  const query = new URLSearchParams({ page: String(page), take: String(take) });
  for (const [name, value] of Object.entries(filters)) if (value.trim()) query.set(name, value.trim());
  return backendRequest(`${JAVA_OPERATIONS.movements}?${query}`);
}
export function javaInventoryMovement(id: number): Promise<JavaInventoryMovement> {
  return backendRequest(`${JAVA_OPERATIONS.movements}/${id}`);
}
