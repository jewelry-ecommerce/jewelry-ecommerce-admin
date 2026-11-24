import { Box } from "@mui/material";
import { useMemo } from "react";

import type { DashboardOverview } from "@/apis/dashboard/dashboard.interface";
import { formatCompactNumber, formatCurrency, formatNumber } from "@/common/utils/format.util";
import { BarChartComponent } from "@/components/chart/bar-chart.component";
import { LineChartComponent } from "@/components/chart/line-chart.component";
import type { ChartSeries } from "@/components/chart/chart.interface";
import { EmptyComponent } from "@/components/empty/empty.component";
import { DashboardPanel } from "@/pages/dashboard/components/dashboard-panel.part";
import { ORDER_STATUS_LABELS } from "@/pages/dashboard/dashboard.constant";
import { COLOR } from "@/theme/design-tokens";

const CHART_HEIGHT = 220;

/** Series name from BE — accept both VI label and legacy English key. */
const isRevenueSeries = (name: string) => name === "Doanh thu" || name === "Revenue";

export interface DashboardChartsProps {
  revenue: DashboardOverview["revenue"];
  ordersByStatus: DashboardOverview["ordersByStatus"];
}

export const DashboardCharts = ({ revenue, ordersByStatus }: DashboardChartsProps) => {
  const revenueSeries = useMemo<ChartSeries[]>(
    () =>
      revenue.series
        .filter((entry) => isRevenueSeries(entry.name))
        .map((entry) => ({ name: "Doanh thu", values: entry.values, color: COLOR.BRAND[500] })),
    [revenue.series],
  );

  const orderStatusSeries = useMemo<ChartSeries[]>(
    () => [{ name: "Đơn hàng", values: ordersByStatus.map((entry) => entry.count), color: COLOR.NEUTRAL[700] }],
    [ordersByStatus],
  );

  const orderStatusLabels = useMemo(() => ordersByStatus.map((entry) => ORDER_STATUS_LABELS[entry.status]), [ordersByStatus]);

  return (
    <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 3fr) minmax(0, 2fr)" } }}>
      <DashboardPanel title="Xu hướng doanh thu" description="Doanh thu thuần của đơn đã xác nhận đến đã giao.">
        {revenueSeries.length === 0 ? (
          <EmptyComponent
            title="Chưa có doanh thu"
            description="Doanh thu xuất hiện khi đơn hàng đạt trạng thái đã xác nhận."
            sx={{ minHeight: CHART_HEIGHT }}
          />
        ) : (
          <LineChartComponent
            series={revenueSeries}
            labels={revenue.labels}
            height={CHART_HEIGHT}
            formatValue={(value) => formatCurrency(value)}
          />
        )}
      </DashboardPanel>

      <DashboardPanel title="Đơn theo trạng thái" description="Phân bố đơn hàng trong khoảng thời gian đang chọn.">
        {ordersByStatus.length === 0 ? (
          <EmptyComponent
            title="Chưa có đơn hàng"
            description="Biểu đồ sẽ cập nhật khi có đơn mới."
            sx={{ minHeight: CHART_HEIGHT }}
          />
        ) : (
          <BarChartComponent
            series={orderStatusSeries}
            labels={orderStatusLabels}
            height={CHART_HEIGHT}
            formatValue={(value) => (value >= 1000 ? formatCompactNumber(value) : formatNumber(value))}
          />
        )}
      </DashboardPanel>
    </Box>
  );
};
