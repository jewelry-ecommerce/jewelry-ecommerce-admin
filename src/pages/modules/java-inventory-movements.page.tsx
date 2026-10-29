import { Alert, LinearProgress, Stack } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useSWR from "swr";
import { javaInventoryMovements, EMPTY_MOVEMENT_FILTERS, type JavaMovementFilters } from "@/apis/java/java-inventory-movements.api";
import { JAVA_OPERATIONS } from "@/apis/java/java-operations.api";
import { WrapperComponent } from "@/components/wrapper/wrapper.component";
import { CustomButton } from "@/components/button/custom-button.component";
import { DataTable, DataTableContentCard, DataTableFilterCard, DataTablePagination } from "@/components/data-table";
import { ROUTE_PATH } from "@/router/route.path";
import { MovementDetail, MovementFilters } from "./java-inventory-movement.parts";
import { movementColumns } from "./java-inventory-movement.columns";

export default function JavaInventoryMovementsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(EMPTY_MOVEMENT_FILTERS), [page, setPage] = useState(1);
  const [take, setTake] = useState<number>(JAVA_OPERATIONS.pageSize), [selected, setSelected] = useState<number | null>(null);
  const invalid = (filters.skuId && (!Number.isSafeInteger(Number(filters.skuId)) || Number(filters.skuId) < 1))
    || (filters.from && filters.to && filters.from > filters.to);
  const { data, error, isLoading, mutate } = useSWR(invalid ? null : ["java-movements", filters, page, take],
    () => javaInventoryMovements(filters, page, take));
  const updateFilters = (value: JavaMovementFilters) => { setFilters(value); setPage(1); };
  return <WrapperComponent label="Lịch sử điều chỉnh tồn kho"><Stack gap={2}>
    <Stack direction="row" gap={2}>
      <CustomButton variant="outline" onClick={() => navigate(ROUTE_PATH.INVENTORY_STOCK_LIST)}>Tồn kho</CustomButton>
      <CustomButton variant="outline" onClick={() => void mutate()}>Làm mới</CustomButton>
    </Stack>
    <Alert severity="info">Lịch sử nhập và điều chỉnh thủ công. Biến động từ đơn hàng, giao và trả hàng chưa nằm trong bảng này.</Alert>
    <DataTableFilterCard><MovementFilters value={filters} onChange={updateFilters} /></DataTableFilterCard>
    {invalid && <Alert severity="warning">ID SKU phải là số nguyên dương; từ ngày phải trước hoặc bằng đến ngày.</Alert>}
    {error && <Alert severity="error">{error instanceof Error ? error.message : "Không tải được lịch sử kho."}</Alert>}
    {isLoading && <LinearProgress />}
    <DataTableContentCard><DataTable rows={invalid || isLoading ? [] : data?.list ?? []} columns={movementColumns}
      getRowId={row => row.id} onRowClick={row => setSelected(row.id)} emptyTitle="Chưa có điều chỉnh"
      emptyDescription="Lịch sử xuất hiện sau khi nhập hoặc điều chỉnh tồn kho." />
      <DataTablePagination page={page} pageSize={take} totalItems={data?.total ?? 0} itemLabel="điều chỉnh"
        onPageChange={setPage} onPageSizeChange={value => { setTake(value); setPage(1); }} />
    </DataTableContentCard>
    <MovementDetail id={selected} onClose={() => setSelected(null)} />
  </Stack></WrapperComponent>;
}
