import { Alert, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import useSWR from "swr";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATH } from "@/router/route.path";
import { useJavaStockAdjustment } from "./use-java-stock-adjustment";
import { WrapperComponent } from "@/components/wrapper/wrapper.component";
import { CustomButton } from "@/components/button/custom-button.component";
import { DataTable, DataTableContentCard, DataTableFilterCard, DataTableToolbar, type DataTableColumn } from "@/components/data-table";
import { JAVA_OPERATIONS, javaStockLevels, type JavaStock } from "@/apis/java/java-operations.api";
const columns: DataTableColumn<JavaStock>[] = [
  { id: "code", label: "Mã SKU", renderCell: row => row.skuCode },
  { id: "name", label: "Tên", renderCell: row => row.name },
  { id: "warehouse", label: "Kho", renderCell: row => row.warehouseId },
  { id: "onHand", label: "Tồn thực tế", renderCell: row => row.onHand },
  { id: "reserved", label: "Đang giữ", renderCell: row => row.reserved },
  { id: "available", label: "Có thể bán", renderCell: row => row.available },
  { id: "status", label: "Trạng thái", renderCell: row => row.stockStatus },
];
function Adjustment({ stock, onClose, onSaved }: { stock: JavaStock | null; onClose: () => void; onSaved: () => void }) {
  const form = useJavaStockAdjustment(stock, onSaved, onClose);
  const { quantity, setQuantity, reason, setReason, error, busy, save } = form;
  return <Dialog open={Boolean(stock)} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
    <DialogTitle>Điều chỉnh tồn kho · {stock?.skuCode}</DialogTitle><DialogContent><Stack gap={2} sx={{ pt: 1 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <Typography>Tồn {stock?.onHand} · Đang giữ {stock?.reserved} · Có thể bán {stock?.available}</Typography>
      <TextField type="number" label="Số lượng tăng (+) / giảm (-)" disabled={busy} value={quantity} onChange={event => setQuantity(event.target.value)} />
      <TextField select label="Lý do" disabled={busy} value={reason} onChange={event => setReason(event.target.value)}>
        {JAVA_OPERATIONS.adjustmentReasons.map(value => <MenuItem key={value} value={value}>{JAVA_OPERATIONS.reasonLabels[value]}</MenuItem>)}
      </TextField>
      <TextField label="Số phiếu / mã tham chiếu" value={form.reference} disabled={busy}
        onChange={event => form.setReference(event.target.value)} inputProps={{ maxLength: JAVA_OPERATIONS.referenceMaxLength }} />
      <TextField label="Ghi chú" multiline value={form.note} disabled={busy}
        onChange={event => form.setNote(event.target.value)} inputProps={{ maxLength: JAVA_OPERATIONS.noteMaxLength }} />
    </Stack></DialogContent><DialogActions>
      <CustomButton variant="outline" onClick={onClose} disabled={busy}>Đóng</CustomButton>
      <CustomButton variant="primary" onClick={() => void save()} disabled={busy || !quantity}>Lưu điều chỉnh</CustomButton>
    </DialogActions>
  </Dialog>;
}
export default function JavaInventoryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState(""), [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState<JavaStock | null>(null);
  const { data: rows = [], error: loadError } = useSWR(["java-stock", search, revision], () => javaStockLevels(search));
  const error = loadError instanceof Error ? loadError.message : "";
  return <WrapperComponent label="Tồn kho sản phẩm"><Stack gap={2}>
    <Alert severity="info">Java hiện có một kho MAIN. Chọn SKU để nhập hoặc điều chỉnh tồn; số lượng đang giữ do đơn hàng quản lý.</Alert>
    {error && <Alert severity="error">{error}</Alert>}
    <DataTableFilterCard><DataTableToolbar embedded searchValue={search} onSearchChange={setSearch} searchPlaceholder="Tìm tên hoặc mã SKU..."
      actions={[{ key: "history", label: "Lịch sử điều chỉnh", onClick: () => navigate(ROUTE_PATH.INVENTORY_MOVEMENT_LIST) }]} /></DataTableFilterCard>
    <DataTableContentCard><DataTable rows={rows} columns={columns} getRowId={row => row.skuId} onRowClick={setSelected}
      emptyTitle="Không có SKU" emptyDescription={error ? "Kiểm tra kết nối Java." : "Tạo SKU trong PIM trước khi nhập tồn."} /></DataTableContentCard>
    <Adjustment key={selected?.skuId ?? "closed"} stock={selected} onClose={() => setSelected(null)} onSaved={() => setRevision(value => value + 1)} />
  </Stack></WrapperComponent>;
}
