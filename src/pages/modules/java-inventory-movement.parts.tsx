import { Alert, Dialog, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from "@mui/material";
import useSWR from "swr";
import { javaInventoryMovement, type JavaMovementFilters } from "@/apis/java/java-inventory-movements.api";
import { JAVA_OPERATIONS } from "@/apis/java/java-operations.api";
import { movementDate, movementReason } from "./java-inventory-movement.columns";
export function MovementFilters({ value, onChange }: { value: JavaMovementFilters; onChange: (value: JavaMovementFilters) => void }) {
  const change = (field: keyof JavaMovementFilters, entry: string) => onChange({ ...value, [field]: entry });
  return <Stack direction={{ xs: "column", md: "row" }} gap={2} sx={{ p: 2 }}>
    <TextField label="ID SKU" type="number" value={value.skuId} onChange={event => change("skuId", event.target.value)} />
    <TextField select label="Lý do" value={value.reason} onChange={event => change("reason", event.target.value)} sx={{ minWidth: 180 }}>
      <MenuItem value="">Tất cả</MenuItem>
      {JAVA_OPERATIONS.adjustmentReasons.map(reason => <MenuItem key={reason} value={reason}>{movementReason(reason)}</MenuItem>)}
    </TextField>
    <TextField type="date" label="Từ ngày" value={value.from} onChange={event => change("from", event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
    <TextField type="date" label="Đến ngày" value={value.to} onChange={event => change("to", event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
  </Stack>;
}
export function MovementDetail({ id, onClose }: { id: number | null; onClose: () => void }) {
  const { data, error, isLoading } = useSWR(id === null ? null : ["java-movement", id],
    ([, movementId]: [string, number]) => javaInventoryMovement(movementId));
  return <Dialog open={id !== null} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle>Chi tiết điều chỉnh #{id}</DialogTitle><DialogContent><Stack gap={2}>
      {isLoading && <Typography>Đang tải...</Typography>}
      {error && <Alert severity="error">{error instanceof Error ? error.message : "Không tải được chi tiết."}</Alert>}
      {data && <>
        <Typography>{data.skuCode} · {data.skuName} · Kho {data.warehouseId}</Typography>
        <Typography>{movementDate(data.createdDate)} · {movementReason(data.reason)}</Typography>
        <Typography>Tồn trước {data.onHandBefore} → Tồn sau {data.onHandAfter} · Thay đổi {data.quantityDelta}</Typography>
        <Typography>Đang giữ: {data.reservedAfter} · ID người thực hiện: {data.actorId ?? "—"}</Typography>
        <Typography>Số phiếu: {data.reference || "—"}</Typography>
        <Typography sx={{ whiteSpace: "pre-wrap" }}>Ghi chú: {data.note || "—"}</Typography>
      </>}
    </Stack></DialogContent>
  </Dialog>;
}
