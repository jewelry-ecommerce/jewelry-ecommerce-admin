import { Alert, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import useSWR from "swr";
import { WrapperComponent } from "@/components/wrapper/wrapper.component";
import { CustomButton } from "@/components/button/custom-button.component";
import { DataTable, DataTableContentCard, DataTableFilterCard, DataTableToolbar, type DataTableColumn } from "@/components/data-table";
import { JAVA_OPERATIONS, javaStockLevels, javaAdjustStock, type JavaStock } from "@/apis/java/java-operations.api";
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
  const [quantity, setQuantity] = useState(""), [reason, setReason] = useState("RECEIPT");
  const [error, setError] = useState(""), [busy, setBusy] = useState(false);

  const save = async () => {
    if (!stock || busy) return; setBusy(true); setError("");
    try { await javaAdjustStock(stock.skuId, Number(quantity), reason); onSaved(); onClose(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Không thể điều chỉnh tồn kho."); }
    finally { setBusy(false); }
  };
  return <Dialog open={Boolean(stock)} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
    <DialogTitle>Điều chỉnh tồn kho · {stock?.skuCode}</DialogTitle><DialogContent><Stack gap={2} sx={{ pt: 1 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <Typography>Tồn {stock?.onHand} · Đang giữ {stock?.reserved} · Có thể bán {stock?.available}</Typography>
      <TextField type="number" label="Số lượng tăng (+) / giảm (-)" value={quantity} onChange={event => setQuantity(event.target.value)} />
      <TextField select label="Lý do" value={reason} onChange={event => setReason(event.target.value)}>
        {JAVA_OPERATIONS.adjustmentReasons.map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}
      </TextField>
    </Stack></DialogContent><DialogActions>
      <CustomButton variant="outline" onClick={onClose} disabled={busy}>Đóng</CustomButton>
      <CustomButton variant="primary" onClick={() => void save()} disabled={busy || !quantity}>Lưu điều chỉnh</CustomButton>
    </DialogActions>
  </Dialog>;
}
export default function JavaInventoryPage() {
  const [search, setSearch] = useState(""), [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState<JavaStock | null>(null);
  const { data: rows = [], error: loadError } = useSWR(["java-stock", search, revision], () => javaStockLevels(search));
  const error = loadError instanceof Error ? loadError.message : "";
  return <WrapperComponent label="Tồn kho sản phẩm"><Stack gap={2}>
    <Alert severity="info">Java hiện có một kho MAIN. Chọn SKU để nhập hoặc điều chỉnh tồn; số lượng đang giữ do đơn hàng quản lý.</Alert>
    {error && <Alert severity="error">{error}</Alert>}
    <DataTableFilterCard><DataTableToolbar embedded searchValue={search} onSearchChange={setSearch} searchPlaceholder="Tìm tên hoặc mã SKU..." actions={[]} /></DataTableFilterCard>
    <DataTableContentCard><DataTable rows={rows} columns={columns} getRowId={row => row.skuId} onRowClick={setSelected}
      emptyTitle="Không có SKU" emptyDescription={error ? "Kiểm tra kết nối Java." : "Tạo SKU trong PIM trước khi nhập tồn."} /></DataTableContentCard>
    <Adjustment key={selected?.skuId ?? "closed"} stock={selected} onClose={() => setSelected(null)} onSaved={() => setRevision(value => value + 1)} />
  </Stack></WrapperComponent>;
}
