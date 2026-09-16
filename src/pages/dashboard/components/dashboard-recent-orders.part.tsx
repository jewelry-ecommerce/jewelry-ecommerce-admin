import { Stack, Typography } from "@mui/material";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import type { DashboardRecentOrder } from "@/apis/dashboard/dashboard.interface";
import { TYPOGRAPHY_STYLES } from "@/common/constant/typography.constant";
import { formatCurrency, formatDateTime } from "@/common/utils/format.util";
import { CustomButton } from "@/components/button/custom-button.component";
import { DataTable } from "@/components/data-table/data-table.component";
import type { DataTableColumn } from "@/components/data-table/data-table.types";
import { StatusPill } from "@/components/status-pill/status-pill.component";
import { DashboardPanel } from "@/pages/dashboard/components/dashboard-panel.part";
import { dashboardButtonPermission } from "@/pages/dashboard/dashboard-permission.constants";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES, PAYMENT_STATUS_LABELS } from "@/pages/dashboard/dashboard.constant";
import { getOrderDetailPath, ROUTE_PATH } from "@/router/route.path";
import { COLOR } from "@/theme/design-tokens";

const TABLE_MIN_WIDTH = 720;

export interface DashboardRecentOrdersProps {
  orders: DashboardRecentOrder[];
}

export const DashboardRecentOrders = ({ orders }: DashboardRecentOrdersProps) => {
  const navigate = useNavigate();

  const columns = useMemo<DataTableColumn<DashboardRecentOrder>[]>(
    () => [
      {
        id: "code",
        label: "Order",
        minWidth: 160,
        renderCell: (row) => (
          <Stack sx={{ minWidth: 0 }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semiBold, color: COLOR.NEUTRAL[900] }}>{row.code}</Typography>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: COLOR.NEUTRAL[500] }}>
              {PAYMENT_STATUS_LABELS[row.paymentStatus]}
            </Typography>
          </Stack>
        ),
      },
      {
        id: "customerName",
        label: "Customer",
        minWidth: 180,
        renderCell: (row) => (
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: COLOR.NEUTRAL[700] }}>{row.customerName}</Typography>
        ),
      },
      {
        id: "status",
        label: "Status",
        width: 150,
        renderCell: (row) => <StatusPill label={ORDER_STATUS_LABELS[row.status]} tone={ORDER_STATUS_TONES[row.status]} />,
      },
      {
        id: "grandTotal",
        label: "Total",
        align: "right",
        width: 150,
        renderCell: (row) => (
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: COLOR.NEUTRAL[900] }}>{formatCurrency(row.grandTotal)}</Typography>
        ),
      },
      {
        id: "placedAt",
        label: "Placed",
        width: 160,
        renderCell: (row) => (
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: COLOR.NEUTRAL[500] }}>{formatDateTime(row.placedAt)}</Typography>
        ),
      },
    ],
    [],
  );

  return (
    <DashboardPanel
      title="Recent orders"
      description="The eight most recent orders across every channel."
      action={
        <CustomButton
          variant="outline"
          size="sm"
          onClick={() => navigate(ROUTE_PATH.ORDER_LIST)}
          {...dashboardButtonPermission("detail", "Open the order list", "api_order_list")}
        >
          View all orders
        </CustomButton>
      }
    >
      <DataTable
        rows={orders}
        columns={columns}
        getRowId={(row) => row.code}
        tableMinWidth={TABLE_MIN_WIDTH}
        onRowClick={(row) => navigate(getOrderDetailPath(row.code))}
        emptyTitle="No orders yet"
        emptyDescription="Orders appear here as soon as the storefront takes one."
      />
    </DashboardPanel>
  );
};
