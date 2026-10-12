import { FileDownloadOutlined, KeyboardArrowDownRounded } from '@mui/icons-material';
import { LinearProgress, Stack } from '@mui/material';
import { useMemo } from 'react';
import { STYLE } from '@/trading-ui/adapters/library';
import { OrderTimeFilter } from '../../apis/order';
import { DataTable, DataTableContentCard, DataTableFilterCard, DataTablePagination, DataTableStatusTabs, DataTableToolbar, type DataTableToolbarAction } from '../../components/data-table';
import { OrderTimeCustomRangeDialog, createSharedTimeFilterToolbarAction } from '../../components/time-filter/shared-time-filter';
import { WrapperComponent } from '../../components/wrapper';
import type { OrderTimeOptionValue } from '../order/order.types';
import { SHIPPING_PAGE_SIZE_OPTIONS } from './shipping.constants';
import { useShipmentDataPage } from '../../hooks/use-shipment-data-page.hook';
import { useListPageViewAccess } from '../../permissions/use-list-page-view-access.hook';
import { ORDER_SHIPPING_PAGE_SCOPE } from '../order/order-permission.constants';

const ShippingPage = () => {
  const canViewList = useListPageViewAccess(ORDER_SHIPPING_PAGE_SCOPE, { listApiCode: 'api_shipment_list' });
  const d = useShipmentDataPage({ canViewList });

  const toolbarActions = useMemo<DataTableToolbarAction[]>(() => {
    return [
      {
        ...createSharedTimeFilterToolbarAction({
          selectedTimeLabel: d.selectedTimeLabel,
          onSelectCustom: () => d.setIsTimeRangeDialogOpen(true),
          onSelectPreset: (value) => {
            d.setSelectedTimeOption(value as OrderTimeOptionValue);
            d.setCustomDateRange(null);
            d.setPage(1);
          },
        }),
        ...ORDER_SHIPPING_PAGE_SCOPE,

        apiCode: 'api_shipment_list',
      },
      {
        key: 'export',
        label: 'Export',
        ...ORDER_SHIPPING_PAGE_SCOPE,

        apiCode: 'api_shipment_export',
        icon: <FileDownloadOutlined sx={{ fontSize: 18 }} />,
        endIcon: <KeyboardArrowDownRounded sx={{ fontSize: 18 }} />,
        options: [
          { value: 'all', label: 'Export tất cả' },
          { value: 'current-page', label: 'Export trang hiện tại' },
          { value: 'selected', label: 'Export vận đơn đã chọn' },
        ],
        onSelectOption: (value) => {
          if (value === 'all' || value === 'current-page' || value === 'selected') {
            void d.handleExportShipments(value);
          }
        },
      },
    ];
  }, [d]);

  if (!canViewList) return null;

  return (
    <Stack sx={{ height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`, boxSizing: 'border-box', minHeight: 0 }}>
      <WrapperComponent label="Vận chuyển & Giao nhận" tabs={<DataTableStatusTabs tabs={d.statusTabs} activeValue={d.activeStatus} onChange={d.setActiveStatus} />}>
        <Stack gap={2} sx={{ flex: 1, minHeight: 0, minWidth: 0 }}>
          <DataTableFilterCard>
            <DataTableToolbar embedded searchValue={d.searchValue} onSearchChange={d.setSearchValue} searchPlaceholder="Tìm theo mã vận đơn hoặc mã đơn" actions={toolbarActions} />
          </DataTableFilterCard>

          <OrderTimeCustomRangeDialog
            open={d.isTimeRangeDialogOpen}
            initialRange={d.customDateRange}
            onClose={() => d.setIsTimeRangeDialogOpen(false)}
            onApply={(range) => {
              d.setSelectedTimeOption(OrderTimeFilter.CUSTOM);
              d.setCustomDateRange(range);
              d.setIsTimeRangeDialogOpen(false);
              d.setPage(1);
            }}
          />

          {d.isLoading ? <LinearProgress sx={{ height: 2, backgroundColor: '#F1F5F9', borderRadius: 1 }} /> : null}

          <DataTableContentCard>
            <DataTable
              rows={d.visibleShipments}
              columns={d.columns}
              getRowId={(shipment) => shipment.id}
              selectable
              selectedRowIds={d.selectedShipmentIds}
              sortField={d.sortField ?? undefined}
              sortDirection={d.sortDirection}
              onSortChange={d.handleSortChange}
              onToggleSelectAll={d.handleToggleSelectAll}
              onToggleSelectRow={(shipment, checked) => d.handleToggleSelectShipment(shipment.id, checked)}
              tableMinWidth={1420}
              containerSx={{ height: '100%', minHeight: 0 }}
              emptyTitle="Không tìm thấy đơn hàng nào"
              emptyDescription="Vui lòng thử lại với từ khóa khác hoặc bỏ lọc"
            />
          </DataTableContentCard>

          <DataTablePagination
            page={d.page}
            pageSize={d.pageSize}
            totalItems={d.totalItems}
            pageSizeOptions={SHIPPING_PAGE_SIZE_OPTIONS}
            itemLabel="vận đơn"
            summaryMode="total"
            onPageChange={d.setPage}
            onPageSizeChange={d.setPageSize}
          />
        </Stack>
      </WrapperComponent>
    </Stack>
  );
};

export default ShippingPage;
