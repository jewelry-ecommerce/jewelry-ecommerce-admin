import { AddRounded, EditOutlined } from "@mui/icons-material";
import { Stack } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PermissionIconButton } from "@/components/button/permission-icon-button.component";
import type { CmsDemoPage } from "@/apis/cms-demo/cms-demo.interface";
import { getCmsPageEditPath, ROUTE_PATH } from "@/router/route.path";
import { DataTable, DataTableContentCard, DataTableFilterCard, DataTableToolbar, type DataTableColumn } from "@/components/data-table";
import { StatusPill } from "@/components/status-pill/status-pill.component";
import { CMS_DEMO_STATUS_LABELS } from "./cms-demo.constants";
function columns(edit: (id: string) => void): DataTableColumn<CmsDemoPage>[] {
  return [
    { id: "name", label: "Tên trang", renderCell: (page) => page.name },
    { id: "slug", label: "Đường dẫn", renderCell: (page) => "/" + page.slug },
    { id: "locale", label: "Ngôn ngữ", renderCell: (page) => page.locale || "vi-VN" },
    {
      id: "status",
      label: "Trạng thái",
      renderCell: (page) => (
        <StatusPill label={CMS_DEMO_STATUS_LABELS[page.status]} tone={page.status === "PUBLISHED" ? "success" : "neutral"} />
      ),
    },
    { id: "blocks", label: "Số khối", renderCell: (page) => page.blocks.length },
    {
      id: "actions",
      label: "",
      width: 90,
      sticky: "right",
      renderCell: (page) => (
        <PermissionIconButton aria-label="Chỉnh sửa trang CMS" onClick={() => edit(page.id)}>
          <EditOutlined />
        </PermissionIconButton>
      ),
    },
  ];
}
export function CmsPageList({ pages }: { pages: CmsDemoPage[] }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const rows = pages.filter((page) => (page.name + " " + page.slug).toLocaleLowerCase("vi").includes(search.toLocaleLowerCase("vi")));
  return (
    <Stack gap={2} sx={{ flex: 1, minHeight: 0 }}>
      <DataTableFilterCard>
        <DataTableToolbar
          embedded
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Tìm theo tên, đường dẫn trang..."
          actions={[
            {
              key: "create",
              label: "Tạo trang mới",
              variant: "primary",
              icon: <AddRounded />,
              onClick: () => navigate(ROUTE_PATH.CMS_PAGE_CREATE),
            },
          ]}
        />
      </DataTableFilterCard>
      <DataTableContentCard>
        <DataTable
          rows={rows}
          columns={columns((id) => navigate(getCmsPageEditPath(id)))}
          getRowId={(page) => page.id}
          onRowClick={(page) => navigate(getCmsPageEditPath(page.id))}
          emptyTitle="Chưa có trang CMS"
          emptyDescription="Bấm Tạo trang mới để bắt đầu. Không có trang hoặc block mẫu."
        />
      </DataTableContentCard>
    </Stack>
  );
}
