import { Alert, MenuItem, Stack, TextField } from "@mui/material";
import { useState } from "react";
import useSWR from "swr";
import { WrapperComponent } from "@/components/wrapper/wrapper.component";
import { CustomButton } from "@/components/button/custom-button.component";
import { DataTable, DataTableFilterCard, DataTableContentCard, DataTableToolbar, DataTablePagination, type DataTableColumn, type DataTableRowId } from "@/components/data-table";
import { CUSTOMER_REQUEST_POLICY, javaCustomerRequests, javaCustomerRequestStatus, type JavaCustomerRequest } from "@/apis/java/java-customer-request.api";
const columns: DataTableColumn<JavaCustomerRequest>[] = [
  { id: "contact", label: "Thông tin liên hệ", renderCell: row => row.contactValue },
  { id: "product", label: "Sản phẩm / SKU", renderCell: row => [row.productNameSnapshot, row.skuCode].filter(Boolean).join(" · ") || "—" },
  { id: "order", label: "Mã đơn", renderCell: row => row.orderCode ?? "—" },
  { id: "status", label: "Trạng thái", renderCell: row => CUSTOMER_REQUEST_POLICY.statuses.find(status => status.value === row.status)?.label ?? row.status },
  { id: "created", label: "Thời gian yêu cầu", renderCell: row => new Date(row.requestedAt).toLocaleString("vi-VN") },
];
function useRequests(type: string, page: number, search: string, status: string) {
  return useSWR(["java-customer-requests", type, page, search, status], () => javaCustomerRequests(type, page, search, status));
}
export default function JavaCustomerRequestsPage() {
  const [type, setType] = useState<string>("BACK_IN_STOCK"), [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1), [search, setSearch] = useState("");
  const [selected, setSelected] = useState<DataTableRowId[]>([]), [nextStatus, setNextStatus] = useState("COMPLETED");
  const [error, setError] = useState(""), [busy, setBusy] = useState(false);
  const result = useRequests(type, page, search, status);
  const save = async () => {
    if (busy || !selected.length) return; setBusy(true); setError("");
    try { await javaCustomerRequestStatus(selected.map(String), type, nextStatus); setSelected([]); await result.mutate(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Không thể cập nhật yêu cầu."); }
    finally { setBusy(false); }
  };
  return <WrapperComponent label="Yêu cầu khách hàng"><Stack gap={2}>
    {(error || result.error) && <Alert severity="error">{error || (result.error instanceof Error ? result.error.message : "Không thể tải yêu cầu.")}</Alert>}
    <Stack direction="row" gap={2}>
      <TextField select size="small" label="Loại yêu cầu" value={type} onChange={event => { setType(event.target.value); setPage(1); setSelected([]); }}>
        {CUSTOMER_REQUEST_POLICY.types.map(row => <MenuItem key={row.value} value={row.value}>{row.label}</MenuItem>)}
      </TextField>
      <TextField select size="small" label="Trạng thái" value={status} onChange={event => { setStatus(event.target.value); setPage(1); setSelected([]); }}>
        <MenuItem value="ALL">Tất cả</MenuItem>{CUSTOMER_REQUEST_POLICY.statuses.map(row => <MenuItem key={row.value} value={row.value}>{row.label}</MenuItem>)}
      </TextField>
    </Stack>
    <DataTableFilterCard><DataTableToolbar embedded searchValue={search} onSearchChange={value => { setSearch(value); setPage(1); setSelected([]); }} searchPlaceholder="Tìm số điện thoại, email, mã SKU, mã đơn..." actions={[]} /></DataTableFilterCard>
    <Stack direction="row" gap={1} alignItems="center">
      <TextField select size="small" label="Cập nhật thành" value={nextStatus} onChange={event => setNextStatus(event.target.value)}>
        {CUSTOMER_REQUEST_POLICY.statuses.map(row => <MenuItem key={row.value} value={row.value}>{row.label}</MenuItem>)}
      </TextField>
      <CustomButton variant="primary" disabled={!selected.length || busy} onClick={() => void save()}>Cập nhật {selected.length} yêu cầu</CustomButton>
    </Stack>
    <DataTableContentCard><DataTable rows={result.data?.list ?? []} columns={columns} getRowId={row => row.id} selectable selectedRowIds={selected}
      onToggleSelectAll={(checked, rows) => setSelected(checked ? rows.map(row => row.id) : [])}
      onToggleSelectRow={(row, checked) => setSelected(previous => checked ? [...previous, row.id] : previous.filter(id => id !== row.id))}
      emptyTitle={result.isLoading ? "Đang tải..." : "Chưa có yêu cầu"} emptyDescription="Yêu cầu từ client sẽ xuất hiện tại đây." /></DataTableContentCard>
    <DataTablePagination page={page} pageSize={CUSTOMER_REQUEST_POLICY.pageTake} totalItems={result.data?.total ?? 0}
      onPageChange={value => { setPage(value); setSelected([]); }} onPageSizeChange={() => undefined} />
  </Stack></WrapperComponent>;
}
