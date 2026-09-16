import { Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import type { DashboardLowStockRow } from "@/apis/dashboard/dashboard.interface";
import { TYPOGRAPHY_STYLES } from "@/common/constant/typography.constant";
import { formatNumber } from "@/common/utils/format.util";
import { CustomButton } from "@/components/button/custom-button.component";
import { EmptyComponent } from "@/components/empty/empty.component";
import { StatusPill } from "@/components/status-pill/status-pill.component";
import { TypographyOneLine } from "@/components/styled/typography.style";
import { DashboardPanel } from "@/pages/dashboard/components/dashboard-panel.part";
import { dashboardButtonPermission } from "@/pages/dashboard/dashboard-permission.constants";
import { ROUTE_PATH } from "@/router/route.path";
import { COLOR, STYLE } from "@/theme/design-tokens";

export interface DashboardLowStockProps {
  rows: DashboardLowStockRow[];
}

/** SKUs whose available quantity has reached the reorder point. */
export const DashboardLowStock = ({ rows }: DashboardLowStockProps) => {
  const navigate = useNavigate();

  return (
    <DashboardPanel
      title="Replenishment needed"
      description="Available quantity at or below the reorder point."
      action={
        <CustomButton
          variant="outline"
          size="sm"
          onClick={() => navigate(ROUTE_PATH.INVENTORY_STOCK_LIST)}
          {...dashboardButtonPermission("detail", "Open stock levels", "api_inventory_stock_list")}
        >
          Open inventory
        </CustomButton>
      }
    >
      {rows.length === 0 ? (
        <EmptyComponent
          title="Every SKU is above its reorder point"
          description="Nothing needs replenishing right now."
          sx={{ minHeight: 160 }}
        />
      ) : (
        rows.map((row) => (
          <Stack
            key={`${row.warehouseCode}-${row.skuCode}`}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1.5}
            sx={{ p: 1.5, borderRadius: `${STYLE.BORDER_RADIUS_ELEMENT}px`, bgcolor: COLOR.NEUTRAL[50], minWidth: 0 }}
          >
            <Stack sx={{ minWidth: 0 }}>
              <TypographyOneLine sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: COLOR.NEUTRAL[900] }}>{row.productName}</TypographyOneLine>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: COLOR.NEUTRAL[500] }}>
                {row.skuCode} · {row.warehouseCode}
              </Typography>
            </Stack>
            <Stack alignItems="flex-end" spacing={0.5} sx={{ flexShrink: 0 }}>
              <StatusPill label={`${formatNumber(row.available)} left`} tone={row.available <= 0 ? "danger" : "warning"} />
              <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: COLOR.NEUTRAL[400] }}>
                Reorder at {formatNumber(row.reorderPoint)}
              </Typography>
            </Stack>
          </Stack>
        ))
      )}
    </DashboardPanel>
  );
};
