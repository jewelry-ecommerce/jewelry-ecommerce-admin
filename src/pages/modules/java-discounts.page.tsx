import { Alert, Dialog, DialogContent, DialogTitle, Stack } from "@mui/material";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import useSWR from "swr";
import { WrapperComponent } from "@/components/wrapper/wrapper.component";
import { CustomButton } from "@/components/button/custom-button.component";
import { DataTable, DataTableToolbar, DataTableFilterCard, DataTableContentCard, type DataTableColumn } from "@/components/data-table";
import { JavaDiscountKind, javaDiscountList, javaDeleteDiscount, type JavaDiscount } from "@/apis/java/java-discount.api";
import { JavaDiscountForm } from "./java-discount-form.component";
function columns(remove: (row: JavaDiscount) => void): DataTableColumn<JavaDiscount>[] {
  return [
    { id: "name", label: "Tên / mã", renderCell: row => row.name ?? row.code ?? "—" },
    { id: "discount", label: "Ưu đãi", renderCell: row => row.discountType + " · " + Number(row.discountValue).toLocaleString("vi-VN") },
    { id: "status", label: "Trạng thái", renderCell: row => row.status },
    { id: "start", label: "Bắt đầu", renderCell: row => new Date(row.startsAt).toLocaleString("vi-VN") },
    { id: "end", label: "Kết thúc", renderCell: row => new Date(row.endsAt).toLocaleString("vi-VN") },
    { id: "remove", label: "", renderCell: row => <CustomButton variant="outline" onClick={() => remove(row)}>Xóa</CustomButton> },
  ];
}
export default function JavaDiscountsPage() {
  const { pathname } = useLocation(), kind = pathname.startsWith("/vouchers") ? JavaDiscountKind.VOUCHER : JavaDiscountKind.PROMOTION;
  const [search, setSearch] = useState(""), [selected, setSelected] = useState<JavaDiscount | null>(null);
  const [creating, setCreating] = useState(false), [deleting, setDeleting] = useState<JavaDiscount | null>(null);
  const [error, setError] = useState(""), [busy, setBusy] = useState(false);
  const result = useSWR(["java-discounts", kind], () => javaDiscountList(kind));
  const close = () => { setCreating(false); setSelected(null); };
  const remove = async () => {
    if (!deleting || busy) return; setBusy(true); setError("");
    try { await javaDeleteDiscount(kind, deleting.id); setDeleting(null); await result.mutate(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Không thể xóa."); }
    finally { setBusy(false); }
  };
  const rows = (result.data ?? []).filter(row => (row.name ?? row.code ?? "").toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
  return <WrapperComponent label={kind === JavaDiscountKind.PROMOTION ? "Chương trình khuyến mãi" : "Mã giảm giá"}><Stack gap={2}>
    {(error || result.error) && <Alert severity="error">{error || (result.error instanceof Error ? result.error.message : "Không thể tải danh sách.")}</Alert>}
    <DataTableFilterCard><DataTableToolbar embedded searchValue={search} onSearchChange={setSearch} searchPlaceholder="Tìm tên / mã..." actions={[{ key: "create", label: "Tạo mới", variant: "primary", onClick: () => setCreating(true) }]} /></DataTableFilterCard>
    <DataTableContentCard><DataTable rows={rows} columns={columns(setDeleting)} getRowId={row => row.id} onRowClick={setSelected} emptyTitle={result.isLoading ? "Đang tải..." : "Chưa có dữ liệu"} emptyDescription="Tạo mới và xuất bản để áp dụng tại client." /></DataTableContentCard>
    <Dialog open={creating || Boolean(selected)} onClose={close} fullWidth maxWidth="md"><DialogTitle>{creating ? "Tạo mới" : "Chỉnh sửa"}</DialogTitle>
      <DialogContent>{(creating || selected) && <JavaDiscountForm key={selected?.id ?? "new"} kind={kind} initial={selected ?? undefined} onSaved={() => { close(); void result.mutate(); }} />}</DialogContent></Dialog>
    <Dialog open={Boolean(deleting)} onClose={busy ? undefined : () => setDeleting(null)} fullWidth maxWidth="xs"><DialogTitle>Xác nhận xóa</DialogTitle>
      <DialogContent><Stack gap={2}><Alert severity="warning">Xóa {deleting?.name ?? deleting?.code}? Các cấu hình đang tham chiếu có thể không còn áp dụng.</Alert>
        <CustomButton variant="outline" disabled={busy} onClick={() => setDeleting(null)}>Hủy</CustomButton>
        <CustomButton variant="primary" disabled={busy} onClick={() => void remove()}>Xác nhận xóa</CustomButton>
      </Stack></DialogContent></Dialog>
  </Stack></WrapperComponent>;
}
