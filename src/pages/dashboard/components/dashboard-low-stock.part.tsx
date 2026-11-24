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
      title="Cần nhập thêm hàng"
      description="Tồn khả dụng bằng hoặc dưới điểm đặt hàng lại."
      action={
        <CustomButton
          variant="outline"
          size="sm"
          onClick={() => navigate(ROUTE_PATH.INVENTORY_STOCK_LIST)}
          {...dashboardButtonPermission("detail", "Mở tồn kho", "api_inventory_stock_list")}
        >
          Mở tồn kho
        </CustomButton>
      }
    >
      {rows.length === 0 ? (
        <EmptyComponent
          title="Mọi SKU đều trên điểm đặt hàng lại"
          description="Hiện không có mặt hàng nào cần nhập thêm."
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
              <StatusPill label={`Còn ${formatNumber(row.available)}`} tone={row.available <= 0 ? "danger" : "warning"} />
              <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: COLOR.NEUTRAL[400] }}>
                Đặt lại khi ≤ {formatNumber(row.reorderPoint)}
              </Typography>
            </Stack>
          </Stack>
        ))
      )}
    </DashboardPanel>
  );
};
