import { RefreshRounded } from "@mui/icons-material";
import { Box, Stack } from "@mui/material";
import { useState } from "react";
import useSWR from "swr";

import { dashboardApi } from "@/apis";
import type { DashboardRange } from "@/apis/dashboard/dashboard.interface";
import { getErrorMessage } from "@/common/utils/get-error-message.util";
import { CustomButton } from "@/components/button/custom-button.component";
import { EmptyComponent } from "@/components/empty/empty.component";
import { SelectInput } from "@/components/form/select-input.component";
import { LoadingComponent } from "@/components/loading/loading.component";
import { WrapperComponent } from "@/components/wrapper/wrapper.component";
import { DASHBOARD_PAGE_SCOPE, dashboardButtonPermission } from "@/pages/dashboard/dashboard-permission.constants";
import { DASHBOARD_RANGE_OPTIONS, DEFAULT_DASHBOARD_RANGE } from "@/pages/dashboard/dashboard.constant";
import { DashboardCharts } from "@/pages/dashboard/components/dashboard-charts.part";
import { DashboardKpiList } from "@/pages/dashboard/components/dashboard-kpi-list.part";
import { DashboardLowStock } from "@/pages/dashboard/components/dashboard-low-stock.part";
import { DashboardRecentOrders } from "@/pages/dashboard/components/dashboard-recent-orders.part";
import { DashboardTopProducts } from "@/pages/dashboard/components/dashboard-top-products.part";
import { useListPageViewAccess } from "@/permissions/use-list-page-view-access.hook";
import { STYLE } from "@/theme/design-tokens";

const RANGE_SELECT_WIDTH = 180;
const REFRESH_ICON_SIZE = 16;

/** Overview screen: KPI row, revenue and order charts, then the three operational panels. */
const DashboardPage = () => {
  const canViewDashboard = useListPageViewAccess(DASHBOARD_PAGE_SCOPE, { redirectOnDeny: false });
  const [range, setRange] = useState<DashboardRange>(DEFAULT_DASHBOARD_RANGE);

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    canViewDashboard ? (["admin/dashboard/overview", range] as const) : null,
    () => dashboardApi.getOverview(range),
    { revalidateOnFocus: false },
  );

  const renderBody = () => {
    if (isLoading) return <LoadingComponent />;
    if (error) return <EmptyComponent variant="error" title="Không thể tải trang tổng quan" description={getErrorMessage(error)} />;
    if (!data)
      return <EmptyComponent title="Chưa có dữ liệu tổng quan" description="Chưa có dữ liệu được ghi nhận trong khoảng thời gian này." />;

    return (
      <Stack sx={{ gap: 2, pb: 3 }}>
        <DashboardKpiList kpis={data.kpis} />
        <DashboardCharts revenue={data.revenue} ordersByStatus={data.ordersByStatus} />
        <DashboardRecentOrders orders={data.recentOrders} />
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" } }}>
          <DashboardLowStock rows={data.lowStock} />
          <DashboardTopProducts rows={data.topProducts} />
        </Box>
      </Stack>
    );
  };

  if (!canViewDashboard) {
    return (
      <Stack sx={{ height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`, boxSizing: "border-box", minHeight: 0 }}>
        <WrapperComponent label="Tổng quan">
          <EmptyComponent
            variant="error"
            title="Bạn không có quyền xem trang tổng quan"
            description="Tài khoản hiện tại không được cấp quyền cho màn hình này."
          />
        </WrapperComponent>
      </Stack>
    );
  }

  return (
    <Stack sx={{ height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`, boxSizing: "border-box", minHeight: 0 }}>
      <WrapperComponent
        label="Tổng quan"
        description="Theo dõi doanh thu, đơn hàng và tình trạng danh mục sản phẩm."
        headerAside={
          <Stack direction="row" alignItems="flex-end" spacing={1}>
            <Box sx={{ width: RANGE_SELECT_WIDTH }}>
              <SelectInput
                label="Khoảng thời gian"
                value={range}
                options={DASHBOARD_RANGE_OPTIONS}
                onChange={(value) => setRange((current) => (value === "" ? current : value))}
              />
            </Box>
            <CustomButton
              variant="outline"
              startIcon={<RefreshRounded sx={{ fontSize: REFRESH_ICON_SIZE }} />}
              loading={isValidating && !isLoading}
              onClick={() => void mutate()}
              {...dashboardButtonPermission("refresh", "Làm mới trang tổng quan", "api_dashboard_overview")}
            >
              Làm mới
            </CustomButton>
          </Stack>
        }
        contentSx={{ overflow: "auto" }}
      >
        {renderBody()}
      </WrapperComponent>
    </Stack>
  );
};

export default DashboardPage;
