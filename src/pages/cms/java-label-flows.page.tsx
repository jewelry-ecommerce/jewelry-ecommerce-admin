import { Alert, Dialog, DialogContent, DialogTitle, Stack } from "@mui/material";
import { useState } from "react";
import useSWR from "swr";
import { WrapperComponent } from "@/components/wrapper/wrapper.component";
import { DataTable, DataTableToolbar, DataTableFilterCard, DataTableContentCard, DataTablePagination, type DataTableColumn } from "@/components/data-table";
import { badgeApi, type BadgeFlowDetail } from "@/trading-ui/apis/badge";
import { JavaLabelFlowForm } from "./java-label-flow-form.component";
const columns: DataTableColumn<BadgeFlowDetail>[] = [
  { id: "name", label: "Tên cấu hình", renderCell: row => row.name },
  { id: "status", label: "Trạng thái", renderCell: row => row.status },
  { id: "rule", label: "Phạm vi", renderCell: row => row.ruleType ?? "—" },
  { id: "labels", label: "Nhãn áp dụng", renderCell: row => row.rules.map(rule => rule.template?.name).filter(Boolean).join(", ") },
  { id: "active", label: "Đang hiển thị", renderCell: row => row.isActive ? "Có" : "Không" },
];
export default function JavaLabelFlowsPage() {
  const [page, setPage] = useState(1), [take, setTake] = useState(20);
  const [selected, setSelected] = useState<BadgeFlowDetail | null>(null), [creating, setCreating] = useState(false);
  const result = useSWR(["java-badge-flows", page, take], () => badgeApi.getListBadgeFlow({ page, take }));
  const close = () => { setSelected(null); setCreating(false); };
  return <WrapperComponent label="Cấu hình nhãn dán"><Stack gap={2}>
    {result.error && <Alert severity="error">{result.error instanceof Error ? result.error.message : "Không thể tải cấu hình."}</Alert>}
    <DataTableFilterCard><DataTableToolbar searchValue="" onSearchChange={() => undefined} embedded searchPlaceholder="Java chưa hỗ trợ tìm kiếm cấu hình"
      actions={[{ key: "create", label: "Tạo cấu hình", variant: "primary", onClick: () => setCreating(true) }]} /></DataTableFilterCard>
    <DataTableContentCard><DataTable rows={result.data?.list ?? []} columns={columns} getRowId={row => row.id} onRowClick={setSelected}
      emptyTitle={result.isLoading ? "Đang tải..." : "Chưa có cấu hình nhãn"} emptyDescription="Tạo mẫu nhãn trước, sau đó chọn phạm vi áp dụng tại đây." /></DataTableContentCard>
    <DataTablePagination page={page} pageSize={take} totalItems={result.data?.total ?? 0} onPageChange={setPage} onPageSizeChange={value => { setTake(value); setPage(1); }} />
    <Dialog open={creating || Boolean(selected)} onClose={close} maxWidth="lg" fullWidth><DialogTitle>{creating ? "Tạo cấu hình nhãn" : "Chỉnh sửa cấu hình nhãn"}</DialogTitle>
      <DialogContent>{(creating || selected) && <JavaLabelFlowForm key={selected?.id ?? "new"} initial={selected ?? undefined}
        onClose={close} onSaved={() => { close(); void result.mutate(); }} />}</DialogContent>
    </Dialog>
  </Stack></WrapperComponent>;
}
