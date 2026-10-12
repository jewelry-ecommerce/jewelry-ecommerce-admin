import { FilterListOutlined } from '@mui/icons-material';
import { Stack, Typography } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';
import {
  bulkUpdateCustomerRequestStatus,
  CustomerRequestOrderType,
  CustomerRequestType,
  getCustomerRequestList,
  OrderSupportRequestStatus,
  type CustomerRequestListItem,
  type CustomerRequestListQuery,
  updateCustomerRequestStatus,
} from '../../apis/customer-request';
import { OrderTimeFilter } from '../../apis/order';
import { PAGE_TAKE_DEFAULT } from '../../common/constant/page-take.constant';
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';
import { formatDateTime, getErrorMessage } from '../../common/utils';
import { CustomButton } from '../../components/button';
import {
  DataTable,
  DataTableBulkActionBar,
  DataTableContentCard,
  DataTableFilterCard,
  DataTablePagination,
  DataTableToolbar,
  type DataTableColumn,
  type DataTableToolbarAction,
} from '../../components/data-table';
import { DialogConfirmComponent } from '../../components/dialog';
import { SelectInput } from '../../components/form';
import { createSharedTimeFilterToolbarAction, formatTimeFilterLabel, OrderTimeCustomRangeDialog, type SharedTimeRange } from '../../components/time-filter/shared-time-filter';
import { WrapperComponent } from '../../components/wrapper';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { usePermissionGate } from '../../permissions/use-permission-gate.hook';
import { buildCustomerRequestTimeParams, CUSTOMER_REQUEST_ALL_FILTER_VALUE, ORDER_SUPPORT_ORDER_TYPE_OPTIONS, ORDER_SUPPORT_STATUS_OPTIONS } from './customer-request.constants';
import { customerRequestOrderSupportButtonPermission } from './customer-request-permission.constants';
import { useCustomerRequestExport } from './use-customer-request-export.hook';

const CustomerRequestOrderSupportPage = () => {
  const { showSnackbar } = useSnackbar();
  const [screenState, setScreenState] = useState({
    ...PAGE_TAKE_DEFAULT,
    keyword: '',
    status: CUSTOMER_REQUEST_ALL_FILTER_VALUE,
    orderType: CUSTOMER_REQUEST_ALL_FILTER_VALUE,
  });
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [selectedTimeOption, setSelectedTimeOption] = useState<OrderTimeFilter | null>(null);
  const [customDateRange, setCustomDateRange] = useState<SharedTimeRange>(null);
  const [timeDialogOpen, setTimeDialogOpen] = useState(false);
  const [bulkDialog, setBulkDialog] = useState<{
    data?: OrderSupportRequestStatus;
    toggle: boolean;
  }>({ toggle: false });
  const [loading, setLoading] = useState(false);

  const query = useMemo<CustomerRequestListQuery>(
    () => ({
      page: screenState.page,
      take: screenState.take,
      ...(screenState.keyword.trim() ? { keyword: screenState.keyword.trim() } : {}),
      ...(screenState.status !== CUSTOMER_REQUEST_ALL_FILTER_VALUE ? { status: screenState.status } : {}),
      ...(screenState.orderType !== CUSTOMER_REQUEST_ALL_FILTER_VALUE ? { orderType: screenState.orderType as CustomerRequestOrderType } : {}),
      ...buildCustomerRequestTimeParams(selectedTimeOption, customDateRange),
    }),
    [customDateRange, screenState, selectedTimeOption],
  );
  const listSwr = useSWR(['customer-request', 'order-support', query] as const, () => getCustomerRequestList('order-support', query), { keepPreviousData: true });
  const rows = listSwr.data?.items ?? [];
  const updateStatusPermission = customerRequestOrderSupportButtonPermission('update_status', 'Cập nhật trạng thái yêu cầu', [
    'api_customer_request_status_update',
    'api_customer_request_status_bulk_update',
  ]);
  const canUpdateStatus = usePermissionGate(updateStatusPermission);
  const { exportToolbarAction } = useCustomerRequestExport({
    kind: 'order-support',
    page: screenState.page,
    pageSize: screenState.take,
    keyword: screenState.keyword,
    status: screenState.status,
    orderType: screenState.orderType,
    selectedTimeOption,
    customDateRange,
    selectedRowIds,
    visibleRowCount: rows.length,
    exportPermission: customerRequestOrderSupportButtonPermission('export', 'Export yêu cầu hỗ trợ đơn hàng', 'api_customer_request_order_support_export'),
  });

  const resetSelection = () => setSelectedRowIds([]);
  const updateFilter = (next: Partial<typeof screenState>) => {
    setScreenState((current) => ({
      ...current,
      ...next,
      page: next.page ?? PAGE_TAKE_DEFAULT.page,
    }));
    resetSelection();
  };
  const updateStatus = useCallback(
    async (id: string, status: OrderSupportRequestStatus) => {
      setLoading(true);
      try {
        await updateCustomerRequestStatus(id, { status });
        await listSwr.mutate();
        showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã cập nhật trạng thái.' });
      } catch (error) {
        showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
      } finally {
        setLoading(false);
      }
    },
    [listSwr],
  );
  const submitBulkUpdate = useCallback(async () => {
    if (!bulkDialog.data) return;
    setLoading(true);
    try {
      await bulkUpdateCustomerRequestStatus({
        ids: selectedRowIds,
        type: CustomerRequestType.ORDER_SUPPORT,
        status: bulkDialog.data,
      });
      resetSelection();
      setBulkDialog({ toggle: false });
      await listSwr.mutate();
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã cập nhật trạng thái hàng loạt.' });
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  }, [bulkDialog.data, listSwr, selectedRowIds]);

  const toolbarActions = useMemo<DataTableToolbarAction[]>(
    () => [
      createSharedTimeFilterToolbarAction({
        selectedTimeLabel: formatTimeFilterLabel(selectedTimeOption, customDateRange),
        onSelectCustom: () => setTimeDialogOpen(true),
        onSelectPreset: (value) => {
          setSelectedTimeOption(value);
          setCustomDateRange(null);
          updateFilter({});
        },
      }),
      {
        key: 'status',
        label: 'Trạng thái',
        icon: <FilterListOutlined sx={{ fontSize: 18 }} />,
        selectedOptionLabel: ORDER_SUPPORT_STATUS_OPTIONS.find((option) => option.value === screenState.status)?.label,
        options: ORDER_SUPPORT_STATUS_OPTIONS,
        onSelectOption: (value) => updateFilter({ status: value }),
      },
      {
        key: 'order-type',
        label: 'Loại đơn hàng',
        icon: <FilterListOutlined sx={{ fontSize: 18 }} />,
        selectedOptionLabel: ORDER_SUPPORT_ORDER_TYPE_OPTIONS.find((option) => option.value === screenState.orderType)?.label,
        options: ORDER_SUPPORT_ORDER_TYPE_OPTIONS,
        onSelectOption: (value) => updateFilter({ orderType: value }),
      },
      exportToolbarAction,
    ],
    [customDateRange, exportToolbarAction, screenState.orderType, screenState.status, selectedTimeOption],
  );
  const columns = useMemo<Array<DataTableColumn<CustomerRequestListItem>>>(
    () => [
      { id: 'orderCode', label: 'Mã đơn hàng', minWidth: 180, renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold }}>{row.orderCode ?? '—'}</Typography> },
      { id: 'orderType', label: 'Loại đơn hàng', minWidth: 160, renderCell: (row) => (row.orderType === CustomerRequestOrderType.PRE_ORDER ? 'Đơn đặt trước' : 'Đơn hàng') },
      { id: 'contactValue', label: 'Số điện thoại yêu cầu', minWidth: 180, renderCell: (row) => row.contactValue },
      { id: 'requestedAt', label: 'Ngày yêu cầu', minWidth: 180, renderCell: (row) => formatDateTime(row.requestedAt) },
      {
        id: 'status',
        label: 'Trạng thái',
        width: 300,
        minWidth: 300,
        renderCell: (row) => (
          <SelectInput
            value={row.status}
            options={ORDER_SUPPORT_STATUS_OPTIONS.slice(1)}
            onChange={(event) => void updateStatus(row.id, event.target.value as OrderSupportRequestStatus)}
            disabled={loading || !canUpdateStatus}
          />
        ),
      },
    ],
    [canUpdateStatus, loading, updateStatus],
  );
  const allSelected = rows.length > 0 && rows.every((row) => selectedRowIds.includes(row.id));
  const someSelected = rows.some((row) => selectedRowIds.includes(row.id));
  const toggleAll = (checked: boolean) => setSelectedRowIds(checked ? rows.map((row) => row.id) : []);

  return (
    <WrapperComponent label="Hỗ trợ đơn hàng">
      <Stack>
        <DataTableFilterCard>
          <DataTableToolbar
            embedded
            searchValue={screenState.keyword}
            onSearchChange={(keyword) => updateFilter({ keyword })}
            searchPlaceholder="Tìm số điện thoại hoặc mã đơn..."
            actions={toolbarActions}
          />
        </DataTableFilterCard>
        <DataTableBulkActionBar selectableCount={rows.length} selectedCount={selectedRowIds.length} allSelected={allSelected} indeterminate={someSelected && !allSelected} onToggleAll={toggleAll}>
          <CustomButton
            variant="outline"
            disabled={!selectedRowIds.length || loading}
            onClick={() =>
              setBulkDialog({
                data: OrderSupportRequestStatus.NEW,
                toggle: true,
              })
            }
            {...updateStatusPermission}
          >
            Cập nhật trạng thái
          </CustomButton>
        </DataTableBulkActionBar>
        <DataTableContentCard>
          <DataTable
            rows={rows}
            columns={columns}
            getRowId={(row) => row.id}
            selectable
            selectedRowIds={selectedRowIds}
            onToggleSelectRow={(row, checked) => setSelectedRowIds((current) => (checked ? [...new Set([...current, row.id])] : current.filter((id) => id !== row.id)))}
            onToggleSelectAll={(checked, visibleRows) => setSelectedRowIds(checked ? visibleRows.map((row) => row.id) : [])}
            emptyTitle="Không có yêu cầu"
          />
          <DataTablePagination
            page={screenState.page}
            pageSize={screenState.take}
            totalItems={listSwr.data?.total ?? 0}
            pageSizeOptions={[10, 20, 50, 100]}
            itemLabel="yêu cầu"
            summaryMode="total"
            onPageChange={(page) => updateFilter({ page })}
            onPageSizeChange={(take) => updateFilter({ take })}
          />
        </DataTableContentCard>
      </Stack>
      <DialogConfirmComponent
        open={bulkDialog.toggle}
        title="Cập nhật trạng thái hàng loạt"
        cancelLabel="Hủy"
        confirmLabel="Cập nhật"
        confirmVariant="primary"
        loading={loading}
        onCancel={() => setBulkDialog({ toggle: false })}
        onConfirm={() => void submitBulkUpdate()}
      >
        <SelectInput
          value={bulkDialog.data ?? OrderSupportRequestStatus.NEW}
          options={ORDER_SUPPORT_STATUS_OPTIONS.slice(1)}
          onChange={(event) =>
            setBulkDialog({
              data: event.target.value as OrderSupportRequestStatus,
              toggle: true,
            })
          }
        />
      </DialogConfirmComponent>
      <OrderTimeCustomRangeDialog
        open={timeDialogOpen}
        initialRange={customDateRange}
        onClose={() => setTimeDialogOpen(false)}
        onApply={(range) => {
          setCustomDateRange(range);
          setSelectedTimeOption(OrderTimeFilter.CUSTOM);
          updateFilter({});
          setTimeDialogOpen(false);
        }}
      />
    </WrapperComponent>
  );
};

export default CustomerRequestOrderSupportPage;
