import { Alert, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import useSWR from "swr";
import { CustomButton } from "@/components/button/custom-button.component";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { JAVA_OPERATIONS, javaAdminOrder, javaChangeOrder, type JavaAdminOrder, type JavaAdminOrderLine } from "@/apis/java/java-operations.api";

const lineColumns: DataTableColumn<JavaAdminOrderLine>[] = [
  { id: "name", label: "Sản phẩm", renderCell: row => row.name },
  { id: "sku", label: "SKU ID", renderCell: row => row.skuId },
  { id: "quantity", label: "Số lượng", renderCell: row => row.quantity },
  { id: "price", label: "Đơn giá", renderCell: row => Number(row.unitPrice).toLocaleString("vi-VN") + " đ" },
  { id: "total", label: "Thành tiền", renderCell: row => Number(row.lineTotal).toLocaleString("vi-VN") + " đ" },
];
function OrderInformation({ order }: { order: JavaAdminOrder }) {
  return <Stack gap={2}>
    <Typography>{order.shipRecipientName} · {order.shipPhone}</Typography>
    <Typography>{[order.shipAddressLine, order.shipWard, order.shipProvince].filter(Boolean).join(", ")}</Typography>
    <Typography>{order.status} · {order.paymentMethod} · {order.paymentStatus} · {Number(order.grandTotal).toLocaleString("vi-VN")} đ</Typography>
    <DataTable rows={order.items} columns={lineColumns} getRowId={row => row.id} tableMinWidth={600} />
    {order.timeline.map((event, index) => <Typography key={index}>{new Date(event.occurredAt).toLocaleString("vi-VN")} · {event.status} · {event.note}</Typography>)}
  </Stack>;
}
export function JavaOrderDetail({ code, onClose, onSaved }: { code: string | null; onClose: () => void; onSaved: () => void }) {
  const { data: order, error: loadError, mutate } = useSWR(code ? ["java-admin-order", code] : null, () => javaAdminOrder(code!));
  const [error, setError] = useState(""), [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(""), [note, setNote] = useState(""), [tracking, setTracking] = useState("");

  const save = async () => {
    if (!code || !status || busy) return;
    if (status === "CANCELLED" && !note.trim()) { setError("Nhập lý do hủy đơn."); return; }
    setBusy(true); setError("");
    try { await mutate(await javaChangeOrder(code, status, note, tracking || order?.trackingCode || ""), false); setStatus(""); onSaved(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Không thể cập nhật đơn hàng."); }
    finally { setBusy(false); }
  };
  return <Dialog open={Boolean(code)} onClose={busy ? undefined : onClose} maxWidth="md" fullWidth>
    <DialogTitle>Đơn hàng {code}</DialogTitle><DialogContent><Stack gap={2} sx={{ pt: 1 }}>
      {(error || loadError) && <Alert severity="error">{error || (loadError instanceof Error ? loadError.message : "Không thể đọc đơn hàng.")}</Alert>}
      {order ? <OrderInformation order={order} /> : !error && <Typography>Đang tải đơn hàng...</Typography>}
      {order && (JAVA_OPERATIONS.transitions[order.status] ?? []).length > 0 && <>
        <TextField select label="Trạng thái tiếp theo" value={status} onChange={event => setStatus(event.target.value)}>
          {(JAVA_OPERATIONS.transitions[order.status] ?? []).map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}
        </TextField>
        <TextField label="Mã vận đơn (nếu có)" value={tracking} onChange={event => setTracking(event.target.value)} />
        <TextField label="Ghi chú / lý do hủy" value={note} onChange={event => setNote(event.target.value)} />
      </>}
    </Stack></DialogContent><DialogActions>
      <CustomButton variant="outline" disabled={busy} onClick={onClose}>Đóng</CustomButton>
      <CustomButton variant="primary" disabled={busy || !status} onClick={() => void save()}>Cập nhật trạng thái</CustomButton>
    </DialogActions>
  </Dialog>;
}
