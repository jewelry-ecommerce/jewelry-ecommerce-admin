import { PaidOutlined, PersonAddAlt1Outlined, ShoppingCartOutlined, TrendingUpRounded } from "@mui/icons-material";
import { Box } from "@mui/material";
import type { ReactNode } from "react";

import type { DashboardKpi } from "@/apis/dashboard/dashboard.interface";
import { KpiCard } from "@/components/kpi-card/kpi-card.component";
import { formatKpiDelta, formatKpiValue } from "@/pages/dashboard/dashboard.constant";

const ICON_SIZE = 18;

/** Icon per KPI key. An unknown key simply renders without an icon rather than breaking the row. */
const KPI_ICONS: Record<string, ReactNode> = {
  net_revenue: <PaidOutlined sx={{ fontSize: ICON_SIZE }} />,
  order_count: <ShoppingCartOutlined sx={{ fontSize: ICON_SIZE }} />,
  average_order_value: <TrendingUpRounded sx={{ fontSize: ICON_SIZE }} />,
  new_customers: <PersonAddAlt1Outlined sx={{ fontSize: ICON_SIZE }} />,
};

export interface DashboardKpiListProps {
  kpis: DashboardKpi[];
}

export const DashboardKpiList = ({ kpis }: DashboardKpiListProps) => (
  <Box
    sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" } }}
  >
    {kpis.map((kpi) => (
      <KpiCard
        key={kpi.key}
        label={kpi.label}
        value={formatKpiValue(kpi)}
        delta={formatKpiDelta(kpi.deltaPercent)}
        deltaTone={kpi.deltaTone}
        icon={KPI_ICONS[kpi.key]}
        caption={kpi.caption}
      />
    ))}
  </Box>
);
