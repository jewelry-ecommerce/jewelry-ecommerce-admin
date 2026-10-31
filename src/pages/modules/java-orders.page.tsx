import { Alert, Stack } from "@mui/material";
import { useState } from "react";
import useSWR from "swr";
import { useParams, useNavigate } from "react-router-dom";
import { WrapperComponent } from "@/components/wrapper/wrapper.component";
import { DataTable, DataTableContentCard, DataTableFilterCard, DataTableToolbar, DataTablePagination, type DataTableColumn } from "@/components/data-table";
import { CustomButton } from "@/components/button/custom-button.component";
import { JAVA_OPERATIONS, javaAdminOrders, type JavaAdminOrder } from "@/apis/java/java-operations.api";
import { JavaOrderDetail } from "./java-order-detail.component";
const columns: DataTableColumn<JavaAdminOrder>[] = [
  { id: "code", label: "Mã đơn", renderCell: row => row.code },
  { id: "customer", label: "Khách hàng", renderCell: row => row.shipRecipientName },
  { id: "phone", label: "Điện thoại", renderCell: row => row.shipPhone },
  { id: "status", label: "Trạng thái", renderCell: row => row.status },
  { id: "payment", label: "Thanh toán", renderCell: row => row.paymentMethod + " · " + row.paymentStatus },
  { id: "total", label: "Tổng tiền", renderCell: row => Number(row.grandTotal).toLocaleString("vi-VN") + " đ" },
  { id: "created", label: "Đặt lúc", renderCell: row => new Date(row.placedAt).toLocaleString("vi-VN") },
];
function useOrders(page: number, search: string, revision: number) {
  const { data, error, isLoading } = useSWR(["java-orders", page, search, revision], () => javaAdminOrders(page, search, "ALL"));
  return { rows: data?.list ?? [], total: data?.total ?? 0, error: error instanceof Error ? error.message : "", loading: isLoading };
}
export default function JavaOrdersPage() {
  const { code } = useParams(); const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [page, setPage] = useState(1), [search, setSearch] = useState(""), [revision, setRevision] = useState(0);
  const result = useOrders(page, search, revision);
  return <WrapperComponent label="Danh sách đơn hàng"><Stack gap={2}>
    {result.error && <Alert severity="error">{result.error}</Alert>}
    <DataTableFilterCard><DataTableToolbar embedded searchValue={search} onSearchChange={value => { setSearch(value); setPage(1); }}
      searchPlaceholder="Tìm mã đơn, tên, số điện thoại..." actions={[{ key: "refresh", label: "Tải lại", variant: "outline",
        customNode: <CustomButton variant="outline" onClick={() => setRevision(value => value + 1)}>Tải lại</CustomButton> }]} /></DataTableFilterCard>
    <DataTableContentCard><DataTable rows={result.rows} columns={columns} getRowId={row => row.id}
      onRowClick={row => setSelected(row.code)} emptyTitle={result.loading ? "Đang tải..." : "Không có đơn hàng"}
      emptyDescription={result.error ? "Không thể tải đơn hàng. Vui lòng thử lại." : "Đơn đặt trên website sẽ xuất hiện tại đây."} /></DataTableContentCard>
    <DataTablePagination page={page} pageSize={JAVA_OPERATIONS.pageSize} totalItems={result.total}
      onPageChange={setPage} onPageSizeChange={() => undefined} />
    <JavaOrderDetail key={code ?? selected ?? "closed"} code={code ?? selected} onClose={() => { setSelected(null); if (code) navigate("/orders"); }}
      onSaved={() => setRevision(value => value + 1)} />
  </Stack></WrapperComponent>;
}
