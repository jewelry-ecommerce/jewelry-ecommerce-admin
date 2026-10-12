import { FilterListOutlined } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';
import {
  BackInStockRequestStatus,
  bulkUpdateCustomerRequestStatus,
  CustomerRequestType,
  getCustomerRequestList,
  type CustomerRequestListItem,
  type CustomerRequestListQuery,
  updateCustomerRequestStatus,
} from '../../apis/customer-request';
import { OrderTimeFilter } from '../../apis/order';
import { PAGE_TAKE_DEFAULT } from '../../common/constant/page-take.constant';
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';
import { formatDateTime, getErrorMessage } from '../../common/utils';
import { resolveTenantBrandProductDefaultImageSrc } from '../../common/config/runtime-config';
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
import { BACK_IN_STOCK_STATUS_OPTIONS, buildCustomerRequestTimeParams, CUSTOMER_REQUEST_ALL_FILTER_VALUE } from './customer-request.constants';
import { customerRequestBackInStockButtonPermission } from './customer-request-permission.constants';
import { useCustomerRequestExport } from './use-customer-request-export.hook';
import { StackRowAlignCenter } from '../../components/styled';

const productDefaultImageSrc = resolveTenantBrandProductDefaultImageSrc();

const CustomerRequestBackInStockPage = () => {
  const { showSnackbar } = useSnackbar();
  const [screenState, setScreenState] = useState({
    ...PAGE_TAKE_DEFAULT,
    keyword: '',
    status: CUSTOMER_REQUEST_ALL_FILTER_VALUE,
  });
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [selectedTimeOption, setSelectedTimeOption] = useState<OrderTimeFilter | null>(null);
  const [customDateRange, setCustomDateRange] = useState<SharedTimeRange>(null);
  const [timeDialogOpen, setTimeDialogOpen] = useState(false);
  const [bulkDialog, setBulkDialog] = useState<{
    data?: BackInStockRequestStatus;
    toggle: boolean;
  }>({ toggle: false });
  const [loading, setLoading] = useState(false);
  const query = useMemo<CustomerRequestListQuery>(
    () => ({
      page: screenState.page,
      take: screenState.take,
      ...(screenState.keyword.trim() ? { keyword: screenState.keyword.trim() } : {}),
      ...(screenState.status !== CUSTOMER_REQUEST_ALL_FILTER_VALUE ? { status: screenState.status } : {}),
      ...buildCustomerRequestTimeParams(selectedTimeOption, customDateRange),
    }),
    [customDateRange, screenState, selectedTimeOption],
  );
  const listSwr = useSWR(['customer-request', 'back-in-stock', query] as const, () => getCustomerRequestList('back-in-stock', query), { keepPreviousData: true });
  const rows = listSwr.data?.items ?? [];
  const updateStatusPermission = customerRequestBackInStockButtonPermission('update_status', 'Cập nhật trạng thái yêu cầu', [
    'api_customer_request_status_update',
    'api_customer_request_status_bulk_update',
  ]);
  const canUpdateStatus = usePermissionGate(updateStatusPermission);
  const { exportToolbarAction } = useCustomerRequestExport({
    kind: 'back-in-stock',
    page: screenState.page,
    pageSize: screenState.take,
    keyword: screenState.keyword,
    status: screenState.status,
    selectedTimeOption,
    customDateRange,
    selectedRowIds,
    visibleRowCount: rows.length,
    exportPermission: customerRequestBackInStockButtonPermission('export', 'Export yêu cầu liên hệ khi có hàng', 'api_customer_request_back_in_stock_export'),
  });
  const updateFilter = (next: Partial<typeof screenState>) => {
    setScreenState((current) => ({ ...current, ...next, page: next.page ?? PAGE_TAKE_DEFAULT.page }));
    setSelectedRowIds([]);
  };
  const updateStatus = useCallback(
    async (id: string, status: BackInStockRequestStatus) => {
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
  const submitBulk = useCallback(async () => {
    if (!bulkDialog.data) return;
    setLoading(true);
    try {
      await bulkUpdateCustomerRequestStatus({
        ids: selectedRowIds,
        type: CustomerRequestType.BACK_IN_STOCK,
        status: bulkDialog.data,
      });
      setSelectedRowIds([]);
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
        selectedOptionLabel: BACK_IN_STOCK_STATUS_OPTIONS.find((option) => option.value === screenState.status)?.label,
        options: BACK_IN_STOCK_STATUS_OPTIONS,
        onSelectOption: (status) => updateFilter({ status }),
      },
      exportToolbarAction,
    ],
    [customDateRange, exportToolbarAction, screenState.status, selectedTimeOption],
  );
  const columns = useMemo<Array<DataTableColumn<CustomerRequestListItem>>>(
    () => [
      {
        id: 'product',
        label: 'Sản phẩm yêu cầu',
        renderCell: (row) => (
          <StackRowAlignCenter gap={1}>
            <Box
              component="img"
              src={row.productImageUrlSnapshot || productDefaultImageSrc}
              alt={row.productNameSnapshot ?? row.skuCode ?? 'Sản phẩm'}
              onError={(event) => {
                event.currentTarget.src = productDefaultImageSrc;
              }}
              sx={{
                width: 48,
                height: 48,
                flexShrink: 0,
                borderRadius: 1,
                objectFit: 'contain',
              }}
            />
            <Stack gap={0.25}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold }}>{row.productNameSnapshot ?? '—'}</Typography>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>{[row.variantTextSnapshot, row.skuCode].filter(Boolean).join(' - ')}</Typography>
            </Stack>
          </StackRowAlignCenter>
        ),
      },
      { id: 'contactValue', label: 'Số điện thoại khách', width: 170, minWidth: 170, renderCell: (row) => row.contactValue },
      { id: 'requestedAt', label: 'Ngày yêu cầu', width: 170, minWidth: 170, renderCell: (row) => formatDateTime(row.requestedAt) },
      {
        id: 'status',
        label: 'Trạng thái',
        width: 300,
        minWidth: 300,
        renderCell: (row) => (
          <SelectInput
            value={row.status}
            options={BACK_IN_STOCK_STATUS_OPTIONS.slice(1)}
            onChange={(event) => void updateStatus(row.id, event.target.value as BackInStockRequestStatus)}
            disabled={loading || !canUpdateStatus}
          />
        ),
      },
    ],
    [canUpdateStatus, loading, updateStatus],
  );
  const allSelected = rows.length > 0 && rows.every((row) => selectedRowIds.includes(row.id));

  return (
    <WrapperComponent label="Liên hệ khi có hàng">
      <Stack>
        <DataTableFilterCard>
          <DataTableToolbar
            embedded
            searchValue={screenState.keyword}
            onSearchChange={(keyword) => updateFilter({ keyword })}
            searchPlaceholder="Tìm số điện thoại, SKU, tên sản phẩm..."
            actions={toolbarActions}
          />
        </DataTableFilterCard>
        <DataTableBulkActionBar
          selectableCount={rows.length}
          selectedCount={selectedRowIds.length}
          allSelected={allSelected}
          indeterminate={!allSelected && selectedRowIds.length > 0}
          onToggleAll={(checked) => setSelectedRowIds(checked ? rows.map((row) => row.id) : [])}
        >
          <CustomButton
            variant="outline"
            disabled={!selectedRowIds.length || loading}
            onClick={() =>
              setBulkDialog({
                data: BackInStockRequestStatus.NEW,
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
            containerSx={{ '& .MuiTable-root': { width: '100%' } }}
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
        onConfirm={() => void submitBulk()}
      >
        <SelectInput
          value={bulkDialog.data ?? BackInStockRequestStatus.NEW}
          options={BACK_IN_STOCK_STATUS_OPTIONS.slice(1)}
          onChange={(event) =>
            setBulkDialog({
              data: event.target.value as BackInStockRequestStatus,
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

export default CustomerRequestBackInStockPage;
