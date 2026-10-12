import { FilterListOutlined } from '@mui/icons-material';
import { Stack } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';
import {
  bulkUpdateCustomerRequestStatus,
  CustomerRequestType,
  getCustomerRequestList,
  NewsletterRequestStatus,
  type CustomerRequestListItem,
  type CustomerRequestListQuery,
  updateCustomerRequestStatus,
} from '../../apis/customer-request';
import { OrderTimeFilter } from '../../apis/order';
import { PAGE_TAKE_DEFAULT } from '../../common/constant/page-take.constant';
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
import { buildCustomerRequestTimeParams, CUSTOMER_REQUEST_ALL_FILTER_VALUE, NEWSLETTER_STATUS_OPTIONS } from './customer-request.constants';
import { customerRequestNewsletterButtonPermission } from './customer-request-permission.constants';
import { useCustomerRequestExport } from './use-customer-request-export.hook';

const CustomerRequestNewsletterPage = () => {
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
    data?: NewsletterRequestStatus;
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
  const listSwr = useSWR(['customer-request', 'newsletter', query] as const, () => getCustomerRequestList('newsletter', query), { keepPreviousData: true });
  const rows = listSwr.data?.items ?? [];
  const updateStatusPermission = customerRequestNewsletterButtonPermission('update_status', 'Cập nhật trạng thái yêu cầu', [
    'api_customer_request_status_update',
    'api_customer_request_status_bulk_update',
  ]);
  const canUpdateStatus = usePermissionGate(updateStatusPermission);
  const { exportToolbarAction } = useCustomerRequestExport({
    kind: 'newsletter',
    page: screenState.page,
    pageSize: screenState.take,
    keyword: screenState.keyword,
    status: screenState.status,
    selectedTimeOption,
    customDateRange,
    selectedRowIds,
    visibleRowCount: rows.length,
    exportPermission: customerRequestNewsletterButtonPermission('export', 'Export đăng ký nhận tin', 'api_customer_request_newsletter_export'),
  });
  const updateFilter = (next: Partial<typeof screenState>) => {
    setScreenState((current) => ({ ...current, ...next, page: next.page ?? PAGE_TAKE_DEFAULT.page }));
    setSelectedRowIds([]);
  };
  const updateStatus = useCallback(
    async (id: string, status: NewsletterRequestStatus) => {
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
        type: CustomerRequestType.NEWSLETTER,
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
        selectedOptionLabel: NEWSLETTER_STATUS_OPTIONS.find((option) => option.value === screenState.status)?.label,
        options: NEWSLETTER_STATUS_OPTIONS,
        onSelectOption: (status) => updateFilter({ status }),
      },
      exportToolbarAction,
    ],
    [customDateRange, exportToolbarAction, screenState.status, selectedTimeOption],
  );
  const columns = useMemo<Array<DataTableColumn<CustomerRequestListItem>>>(
    () => [
      { id: 'contactValue', label: 'Email đăng ký', minWidth: 260, renderCell: (row) => row.contactValue },
      { id: 'requestedAt', label: 'Ngày đăng ký', minWidth: 180, renderCell: (row) => formatDateTime(row.requestedAt) },
      {
        id: 'status',
        label: 'Trạng thái',
        width: 300,
        minWidth: 300,
        renderCell: (row) => (
          <SelectInput
            value={row.status}
            options={NEWSLETTER_STATUS_OPTIONS.slice(1)}
            onChange={(event) => void updateStatus(row.id, event.target.value as NewsletterRequestStatus)}
            disabled={loading || !canUpdateStatus}
          />
        ),
      },
    ],
    [canUpdateStatus, loading, updateStatus],
  );
  const allSelected = rows.length > 0 && rows.every((row) => selectedRowIds.includes(row.id));

  return (
    <WrapperComponent label="Đăng ký nhận tin">
      <Stack>
        <DataTableFilterCard>
          <DataTableToolbar embedded searchValue={screenState.keyword} onSearchChange={(keyword) => updateFilter({ keyword })} searchPlaceholder="Tìm email..." actions={toolbarActions} />
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
                data: NewsletterRequestStatus.NEW,
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
            emptyTitle="Không có đăng ký"
          />
          <DataTablePagination
            page={screenState.page}
            pageSize={screenState.take}
            totalItems={listSwr.data?.total ?? 0}
            pageSizeOptions={[10, 20, 50, 100]}
            itemLabel="đăng ký"
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
          value={bulkDialog.data ?? NewsletterRequestStatus.NEW}
          options={NEWSLETTER_STATUS_OPTIONS.slice(1)}
          onChange={(event) =>
            setBulkDialog({
              data: event.target.value as NewsletterRequestStatus,
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

export default CustomerRequestNewsletterPage;
