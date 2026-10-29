import { JAVA_OPERATIONS } from "@/apis/java/java-operations.api";
import type { JavaInventoryMovement } from "@/apis/java/java-inventory-movements.api";
import type { DataTableColumn } from "@/components/data-table";

export const movementReason = (reason: string): string => {
  const found = JAVA_OPERATIONS.adjustmentReasons.find(value => value === reason);
  return found ? JAVA_OPERATIONS.reasonLabels[found] : reason;
};
export const movementDate = (value: string): string => new Date(value).toLocaleString("vi-VN");
export const movementColumns: DataTableColumn<JavaInventoryMovement>[] = [
  { id: "time", label: "Thời gian", renderCell: row => movementDate(row.createdDate) },
  { id: "sku", label: "Mã SKU", renderCell: row => row.skuCode },
  { id: "name", label: "Tên SKU", renderCell: row => row.skuName },
  { id: "reason", label: "Lý do", renderCell: row => movementReason(row.reason) },
  { id: "delta", label: "Tăng / giảm", renderCell: row => `${row.quantityDelta > 0 ? "+" : ""}${row.quantityDelta}` },
  { id: "before", label: "Tồn trước", renderCell: row => row.onHandBefore },
  { id: "after", label: "Tồn sau", renderCell: row => row.onHandAfter },
  { id: "reference", label: "Số phiếu", renderCell: row => row.reference || "—" },
  { id: "actor", label: "ID người thực hiện", renderCell: row => row.actorId ?? "—" },
];
