import { Edit02, Plus, Trash01 } from "@untitledui/icons";
import type { Placement } from "@/trading-ui/apis/banner/banner.entities";
import { PermissionIconButton } from "@/trading-ui/components/button/permission-icon-button";
import { DataTable, DataTableContentCard, DataTableFilterCard, DataTableToolbar, type DataTableColumn } from "@/components/data-table";
import { Stack } from "@mui/material";
import { isJavaBackend } from "@/common/config/app.config";
interface Props {
  rows: Placement[];
  search: string;
  setSearch: (value: string) => void;
  create: () => void;
  edit: (code: string) => void;
  remove: (id: string) => void;
}
const labels: Record<string, string> = { GRID: "Lưới", SLIDER: "Trượt ngang", DOUBLE_BANNER: "Hai khung" };
function columns(props: Props): DataTableColumn<Placement>[] {
  return [
    { id: "code", label: "Mã vị trí", renderCell: (row) => row.code },
    { id: "name", label: "Tên vị trí", renderCell: (row) => row.name },
    { id: "displayType", label: "Kiểu hiển thị", renderCell: (row) => labels[row.displayType] || row.displayType },
    {
      id: "actions",
      label: "",
      width: 100,
      sticky: "right",
      renderCell: (row) => (
        <>
          <PermissionIconButton aria-label="Chỉnh sửa banner" onClick={() => props.edit(row.code)}>
            <Edit02 size={18} />
          </PermissionIconButton>
          <PermissionIconButton disabled={isJavaBackend()} title={isJavaBackend() ? "Java chưa hỗ trợ xóa vị trí banner" : undefined} aria-label="Xóa vị trí banner" onClick={() => props.remove(row.id)}>
            <Trash01 size={18} />
          </PermissionIconButton>
        </>
      ),
    },
  ];
}
export function CmsBannerList(props: Props) {
  return (
    <Stack gap={2} sx={{ flex: 1, minHeight: 0 }}>
      <DataTableFilterCard>
        <DataTableToolbar
          embedded
          searchValue={props.search}
          onSearchChange={props.setSearch}
          searchPlaceholder="Tìm theo mã, tên vị trí banner..."
          actions={[
            {
              key: "create",
              label: "Tạo nội dung banner",
              variant: "primary",
              icon: <Plus size={18} />,
              onClick: props.create,
            },
          ]}
        />
      </DataTableFilterCard>
      <DataTableContentCard>
        <DataTable
          rows={props.rows}
          columns={columns(props)}
          getRowId={(row) => row.id}
          emptyTitle="Chưa có vị trí banner"
          emptyDescription="Tạo nội dung banner rồi gắn vào block của trang CMS."
        />
      </DataTableContentCard>
    </Stack>
  );
}
