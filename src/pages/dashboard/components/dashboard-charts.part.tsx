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

export interface DashboardChartsProps {
  revenue: DashboardOverview["revenue"];
  ordersByStatus: DashboardOverview["ordersByStatus"];
}

export const DashboardCharts = ({ revenue, ordersByStatus }: DashboardChartsProps) => {
  const revenueSeries = useMemo<ChartSeries[]>(
    () =>
      revenue.series
        .filter((entry) => entry.name === "Revenue")
        .map((entry) => ({ name: entry.name, values: entry.values, color: COLOR.BRAND[500] })),
    [revenue.series],
  );

  const orderStatusSeries = useMemo<ChartSeries[]>(
    () => [{ name: "Orders", values: ordersByStatus.map((entry) => entry.count), color: COLOR.NEUTRAL[700] }],
    [ordersByStatus],
  );

  const orderStatusLabels = useMemo(() => ordersByStatus.map((entry) => ORDER_STATUS_LABELS[entry.status]), [ordersByStatus]);

  return (
    <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 3fr) minmax(0, 2fr)" } }}>
      <DashboardPanel title="Revenue trend" description="Net revenue of confirmed through delivered orders.">
        {revenueSeries.length === 0 ? (
          <EmptyComponent
            title="No revenue yet"
            description="Revenue appears once an order reaches the confirmed state."
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

      <DashboardPanel title="Orders by status" description="Where the current order book sits.">
        {ordersByStatus.length === 0 ? (
          <EmptyComponent
            title="No orders yet"
            description="The distribution fills in as orders arrive."
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
