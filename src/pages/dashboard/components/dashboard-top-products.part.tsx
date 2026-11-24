import { Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import type { DashboardTopProductRow } from "@/apis/dashboard/dashboard.interface";
import { TYPOGRAPHY_STYLES } from "@/common/constant/typography.constant";
import { formatCurrency, formatNumber } from "@/common/utils/format.util";
import { CustomButton } from "@/components/button/custom-button.component";
import { EmptyComponent } from "@/components/empty/empty.component";
import { ItemImage } from "@/components/item-image/item-image.component";
import { TypographyOneLine } from "@/components/styled/typography.style";
import { DashboardPanel } from "@/pages/dashboard/components/dashboard-panel.part";
import { dashboardButtonPermission } from "@/pages/dashboard/dashboard-permission.constants";
import { getProductDetailPath, ROUTE_PATH } from "@/router/route.path";
import { COLOR, STYLE } from "@/theme/design-tokens";

const THUMB_SIZE = 40;

export interface DashboardTopProductsProps {
  rows: DashboardTopProductRow[];
}

export const DashboardTopProducts = ({ rows }: DashboardTopProductsProps) => {
  const navigate = useNavigate();

  return (
    <DashboardPanel
      title="Sản phẩm bán chạy"
      description="Xếp theo doanh thu của các đơn có doanh thu."
      action={
        <CustomButton
          variant="outline"
          size="sm"
          onClick={() => navigate(ROUTE_PATH.PRODUCT_LIST)}
          {...dashboardButtonPermission("detail", "Mở danh sách sản phẩm", "api_product_list")}
        >
          Mở danh mục
        </CustomButton>
      }
    >
      {rows.length === 0 ? (
        <EmptyComponent title="Chưa có doanh số" description="Sản phẩm bán chạy hiện khi có đơn đã xác nhận." sx={{ minHeight: 160 }} />
      ) : (
        rows.map((row, index) => (
          <Stack
            key={row.productId}
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{
              p: 1,
              borderRadius: `${STYLE.BORDER_RADIUS_ELEMENT}px`,
              cursor: "pointer",
              minWidth: 0,
              "&:hover": { bgcolor: COLOR.NEUTRAL[50] },
            }}
            onClick={() => navigate(getProductDetailPath(row.productId))}
          >
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.bold, color: COLOR.NEUTRAL[400], width: 16, flexShrink: 0 }}>{index + 1}</Typography>
            <ItemImage src={row.image} alt={row.productName} size={THUMB_SIZE} />
            <Stack sx={{ flex: 1, minWidth: 0 }}>
              <TypographyOneLine sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: COLOR.NEUTRAL[900] }}>{row.productName}</TypographyOneLine>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: COLOR.NEUTRAL[500] }}>
                {row.categoryName} · đã bán {formatNumber(row.unitsSold)}
              </Typography>
            </Stack>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semiBold, color: COLOR.NEUTRAL[900], flexShrink: 0 }}>
              {formatCurrency(row.revenue)}
            </Typography>
          </Stack>
        ))
      )}
    </DashboardPanel>
  );
};
