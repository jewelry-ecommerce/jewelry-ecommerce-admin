import { AddRounded, FileDownloadOutlined, FileUploadOutlined, FilterListOutlined, KeyboardArrowDownRounded } from '@mui/icons-material';
import { LinearProgress, Stack } from '@mui/material';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { STYLE } from '@/trading-ui/adapters/library';
import { DataTable, DataTableContentCard, DataTableFilterCard, DataTablePagination, DataTableStatusTabs, DataTableToolbar, type DataTableToolbarAction } from '../../components/data-table';
import { WrapperComponent } from '../../components/wrapper';
import { ROUTE_PATH } from '@/trading-ui/router/route.path';
import { OrderRowActionMenu } from './components/order-row-action-menu';
import { CancelOrderDialog } from './components/cancel-order-dialog';
import { CancelOrderWithRefundDialog } from '../refund-proposal/components/cancel-order-with-refund-dialog.part';
import { CloneOrderConfirmDialog } from './components/clone-order-confirm-dialog';
import { OrderAdvancedFilterDialog } from './components/order-advanced-filter-dialog';
import { OrderImportDialog } from './components/order-import-dialog/order-import-dialog.component';
import { ORDER_PAGE_SIZE_OPTIONS } from '../../common/constant/order/order.constants';
import { shouldShowCancelWithRefund } from './order-detail/order-detail.helpers';
import type { OrderTimeOptionValue } from './order.types';
import { useOrderDataPage } from '../../hooks/use-order-data-page.hook';
import { OrderTimeCustomRangeDialog, createSharedTimeFilterToolbarAction } from '../../components/time-filter/shared-time-filter';
import { usePermissionContext } from '@/permissions/use-permission-context.hook';
import { useListPageViewAccess } from '../../permissions/use-list-page-view-access.hook';
import { ORDER_LIST_PAGE_SCOPE } from './order-permission.constants';

export { ORDER_LIST_PAGE_SCOPE };

const OrderDataPage = () => {
  const navigate = useNavigate();
  const canViewList = useListPageViewAccess(ORDER_LIST_PAGE_SCOPE, { listApiCode: 'api_order_list' });
  const { hasApiAccess } = usePermissionContext();
  const canEditOrder = hasApiAccess('api_order_update');
  const canViewOrder = hasApiAccess('api_order_detail');
  const canCloneOrder = hasApiAccess('api_order_duplicate');
  const canCreateReturn = hasApiAccess('api_order_return_create');
  const canRecallOrder = hasApiAccess('api_order_recall');
  const canCancelOrder = hasApiAccess('api_order_cancel');
  const canOpenMoreActions = canCloneOrder || canCreateReturn || canRecallOrder || canCancelOrder;
  const d = useOrderDataPage({ canEditOrder, canViewOrder, canOpenMoreActions, canViewList });
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const toolbarActions = useMemo<DataTableToolbarAction[]>(() => {
    return [
      {
        ...createSharedTimeFilterToolbarAction({
          selectedTimeLabel: d.selectedTimeLabel,
          onSelectCustom: () => d.setIsTimeRangeDialogOpen(true),
          onSelectPreset: (value) => {
            d.setSelectedTimeOption(value as OrderTimeOptionValue);
            d.setCustomDateRange(null);
          },
        }),
      },
      {
        key: 'filter',
        label: 'Bộ lọc',
        ...ORDER_LIST_PAGE_SCOPE,

        apiCode: 'api_order_list',
        selectedOptionLabel: d.selectedFilterLabel,
        icon: <FilterListOutlined sx={{ fontSize: 18 }} />,
        onClick: d.handleOpenAdvancedFilterDialog,
      },
      {
        key: 'import',
        label: 'Import',
        ...ORDER_LIST_PAGE_SCOPE,

        icon: <FileUploadOutlined sx={{ fontSize: 18 }} />,
        apiCode: 'api_order_import',
        onClick: () => setImportDialogOpen(true),
      },
      {
        key: 'export',
        label: 'Export',
        ...ORDER_LIST_PAGE_SCOPE,

        icon: <FileDownloadOutlined sx={{ fontSize: 18 }} />,
        endIcon: <KeyboardArrowDownRounded sx={{ fontSize: 18 }} />,
        apiCode: 'api_order_export',
        options: [
          { value: 'all', label: 'Export tất cả' },
          { value: 'current-page', label: 'Export trang hiện tại' },
          { value: 'selected', label: 'Export đơn đã chọn' },
        ],
        onSelectOption: (value) => {
          if (value === 'all' || value === 'current-page' || value === 'selected') {
            void d.handleExportOrders(value, 'order');
          }
        },
      },
      {
        key: 'export-sku',
        label: 'Export SKU',
        ...ORDER_LIST_PAGE_SCOPE,

        icon: <FileDownloadOutlined sx={{ fontSize: 18 }} />,
        endIcon: <KeyboardArrowDownRounded sx={{ fontSize: 18 }} />,
        apiCode: 'api_order_export',
        options: [
          { value: 'all', label: 'Export tất cả' },
          { value: 'current-page', label: 'Export trang hiện tại' },
          { value: 'selected', label: 'Export đơn đã chọn' },
          { value: 'customer-fbo', label: 'Export khách hàng cho FBO' },
          { value: 'fast-fbo', label: 'Export đơn hàng cho Fast FBO' },
        ],
        onSelectOption: (value) => {
          if (value === 'customer-fbo') {
            void d.handleExportOrderCustomerFbo();
            return;
          }
          if (value === 'fast-fbo') {
            void d.handleExportOrderFastFbo();
            return;
          }
          if (value === 'all' || value === 'current-page' || value === 'selected') {
            void d.handleExportOrders(value, 'sku');
          }
        },
      },
      {
        key: 'create',
        label: 'Tạo đơn hàng',
        ...ORDER_LIST_PAGE_SCOPE,

        variant: 'contained',
        icon: <AddRounded sx={{ fontSize: 18 }} />,
        apiCode: 'api_order_create',
        onClick: () => navigate(ROUTE_PATH.ORDER_CREATE),
      },
    ];
  }, [d, navigate]);

  if (!canViewList) return null;

  return (
    <Stack sx={{ height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`, boxSizing: 'border-box', minHeight: 0 }}>
      <WrapperComponent label="Danh sách đơn hàng" tabs={<DataTableStatusTabs tabs={d.statusTabs} activeValue={d.activeStatus} onChange={d.setActiveStatus} />}>
        <Stack gap={2} sx={{ flex: 1, minHeight: 0, minWidth: 0 }}>
          <DataTableFilterCard>
            <DataTableToolbar embedded searchValue={d.searchValue} onSearchChange={d.setSearchValue} searchPlaceholder="Tìm theo mã đơn" actions={toolbarActions} />
          </DataTableFilterCard>

          <OrderAdvancedFilterDialog open={d.isAdvancedFilterDialogOpen} value={d.appliedAdvancedFilters} onClose={d.handleCloseAdvancedFilterDialog} onApply={d.handleApplyAdvancedFilters} />

          <OrderTimeCustomRangeDialog open={d.isTimeRangeDialogOpen} initialRange={d.customDateRange} onClose={() => d.setIsTimeRangeDialogOpen(false)} onApply={d.handleApplyTimeRange} />

          <OrderImportDialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} />

          {d.isLoading ? <LinearProgress sx={{ height: 2, backgroundColor: '#F1F5F9', borderRadius: 1 }} /> : null}

          <DataTableContentCard>
            <DataTable
              rows={d.visibleOrders}
              columns={d.columns}
              getRowId={(order) => order.id}
              selectable
              selectedRowIds={d.selectedOrderIds}
              sortField={d.sortField ?? undefined}
              sortDirection={d.sortDirection}
              onSortChange={d.handleSortChange}
              tableMinWidth={2120}
              containerSx={{ height: '100%', minHeight: 0 }}
              emptyTitle="Không có đơn hàng phù hợp"
              emptyDescription="Danh sách hiện không có dữ liệu theo bộ lọc đang chọn."
              onToggleSelectAll={d.handleToggleSelectAll}
              onToggleSelectRow={(order, checked) => d.handleToggleSelectOrder(order.id, checked)}
            />
          </DataTableContentCard>

          <DataTablePagination
            page={d.page}
            pageSize={d.pageSize}
            totalItems={d.totalItems}
            pageSizeOptions={ORDER_PAGE_SIZE_OPTIONS}
            itemLabel="đơn hàng"
            summaryMode="total"
            onPageChange={d.setPage}
            onPageSizeChange={d.setPageSize}
          />

          <OrderRowActionMenu
            anchorEl={d.orderActionMenuAnchor}
            open={Boolean(d.orderActionMenuAnchor)}
            onClose={d.handleCloseOrderActionMenu}
            onCloneOrder={d.handleRequestCloneFromMenu}
            onCreateReturnExchange={d.handleCreateReturnExchangeFromMenu}
            canCreateReturnExchange={d.canCreateReturnExchangeFromMenu}
            onAdjustOrder={d.handleRequestAdjustFromMenu}
            canAdjustOrder={d.canAdjustOrderFromMenu}
            onCancelOrder={d.handleRequestCancelFromMenu}
            canCancelOrder={d.canCancelOrderFromMenu}
          />

          {d.cancelConfirmOrder &&
          shouldShowCancelWithRefund({
            status: d.cancelConfirmOrder.status,
            paymentStatus: d.cancelConfirmOrder.paymentStatus,
            paymentMethod: d.cancelConfirmOrder.paymentMethod,
          }) ? (
            <CancelOrderWithRefundDialog open order={d.cancelConfirmOrder} onClose={d.handleCloseCancelConfirmDialog} onSuccess={d.handleCancelOrderRefundSuccess} />
          ) : (
            <CancelOrderDialog
              open={Boolean(d.cancelConfirmOrder)}
              orderCode={d.cancelConfirmOrder?.orderCode ?? '—'}
              submitting={d.cancelConfirmSubmitting}
              onClose={d.handleCloseCancelConfirmDialog}
              onConfirm={(payload) => void d.handleConfirmCancelFromMenu(payload)}
            />
          )}

          <CloneOrderConfirmDialog
            open={Boolean(d.cloneConfirmOrder)}
            orderCode={d.cloneConfirmOrder?.orderCode ?? '—'}
            submitting={d.cloneConfirmSubmitting}
            onClose={d.handleCloseCloneConfirmDialog}
            onConfirmKeepOriginal={() => void d.handleConfirmCloneFromMenu(false)}
            onConfirmCancelOriginal={() => void d.handleConfirmCloneFromMenu(true)}
          />
        </Stack>
      </WrapperComponent>
    </Stack>
  );
};

export default OrderDataPage;
