import { FileDownloadOutlined, FilterListOutlined, KeyboardArrowDownRounded } from '@mui/icons-material';
import { LinearProgress, Stack } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { STYLE } from '@/trading-ui/adapters/library';
import * as importExportApi from '../../../apis/import-export/import-export.api';
import { OrderTimeFilter, rejectOrderReturn, syncGhnShipmentByClientCode } from '../../../apis/order';
import { RETURN_EXCHANGE_INITIAL_ADVANCED_FILTERS, canReturnExchangeConfirmOrCancelOnList } from '../../../common/constant/order/order.constants';
import { downloadRemoteFile } from '../../../common/helpers';
import { copyTextToClipboard, getCopyFailureMessage } from '../../../common/utils';
import { getErrorMessage } from '../../../common/utils/string.utils';
import { DataTable, DataTableContentCard, DataTableFilterCard, DataTablePagination, DataTableStatusTabs, DataTableToolbar, type DataTableToolbarAction } from '../../../components/data-table';
import { OrderTimeCustomRangeDialog, createSharedTimeFilterToolbarAction } from '../../../components/time-filter/shared-time-filter';
import { WrapperComponent } from '../../../components/wrapper';
import { useReturnExchangesList } from '../../../hooks/return-exchanges/use-return-exchanges-list.hook';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { ROUTE_PATH, getOrderDetailPath, getReturnExchangeDetailPath, getReturnExchangeEditPath } from '@/trading-ui/router/route.path';
import type { OrderTimeOptionValue } from '../order.types';
import { ReturnExchangeAdvancedFilterDialogPart } from './parts/returns-exchanges-advanced-filter-dialog.part';
import { getReturnExchangesListColumns } from './parts/returns-exchanges-list-columns.part';
import { ReturnExchangesRejectDialogPart } from './parts/returns-exchanges-reject-dialog.part';
import { useListPageViewAccess } from '../../../permissions/use-list-page-view-access.hook';
import { ORDER_RETURNS_PAGE_SCOPE } from '../order-permission.constants';
import { buildOrderReturnExportFiltersFromListState, resolveOrderReturnExportTopicConfigId } from '../order-return-export.util';
import { buildOrderReturnFastExportFiltersFromListState, resolveOrderReturnFastExportTopicConfigId } from '../order-return-fast-export.util';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export const ReturnExchangeListPage = () => {
  const canViewList = useListPageViewAccess(ORDER_RETURNS_PAGE_SCOPE, { listApiCode: 'api_order_return_list' });
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const d = useReturnExchangesList({
    initialAdvancedFilters: RETURN_EXCHANGE_INITIAL_ADVANCED_FILTERS,
    pageSize: PAGE_SIZE_OPTIONS[0],
  });
  const [rejectDialogRow, setRejectDialogRow] = useState<(typeof d.rows)[number] | null>(null);
  const [rejectSubmitting, setRejectSubmitting] = useState(false);
  const [syncingOrderReturnId, setSyncingOrderReturnId] = useState<string | null>(null);
  const [exportSubmitting, setExportSubmitting] = useState(false);
  const { setSearchValue, setPage } = d;

  const handleCopyValue = useCallback(async (value: string, successMessage: string) => {
    const copied = await copyTextToClipboard(value);
    if (copied) {
      showSnackbar({ type: SnackbarType.SUCCESS, message: successMessage });
    } else {
      showSnackbar({ type: SnackbarType.WARNING, message: getCopyFailureMessage() });
    }
  }, []);

  const handleSyncOrderShipment = useCallback(
    async (row: (typeof d.rows)[number]) => {
      if (syncingOrderReturnId === row.id) return;

      const clientOrderCode = row.returnCode?.trim() || '';
      if (!clientOrderCode) {
        showSnackbar({
          type: SnackbarType.WARNING,
          message: 'Không tìm thấy mã yêu cầu để đồng bộ vận đơn.',
        });
        return;
      }

      setSyncingOrderReturnId(row.id);
      try {
        await syncGhnShipmentByClientCode(clientOrderCode);
        d.refreshList();
        showSnackbar({
          type: SnackbarType.SUCCESS,
          message: `Đã đồng bộ vận đơn cho yêu cầu ${clientOrderCode}.`,
        });
      } catch (error) {
        showSnackbar({
          type: SnackbarType.ERROR,
          message: (error as { message?: string })?.message || 'Không thể đồng bộ vận đơn. Vui lòng thử lại.',
        });
      } finally {
        setSyncingOrderReturnId(null);
      }
    },
    [d, syncingOrderReturnId],
  );

  const columns = useMemo(
    () =>
      getReturnExchangesListColumns({
        onOpenDetail: (row) => {
          void navigate(getReturnExchangeDetailPath(row.id));
        },
        onEditReturn: (row) => {
          void navigate(getReturnExchangeEditPath(row.id));
        },
        onConfirmRequest: (row) =>
          showSnackbar({
            type: SnackbarType.INFO,
            message: `Xác nhận yêu cầu đổi/trả ${row.returnCode} sẽ cập nhật tiếp.`,
          }),
        onCancelRequest: (row) => setRejectDialogRow(row),
        onCopyReturnCode: (code) => {
          void handleCopyValue(code, `Đã sao chép mã yêu cầu ${code}`);
        },
        onCopyOrderId: (orderCode) => {
          void handleCopyValue(orderCode, `Đã sao chép mã đơn gốc ${orderCode}`);
        },
        onOpenOriginalOrder: (row) => {
          const originalOrderId = row.originalOrderId?.trim() || row.orderId?.trim() || '';
          if (!originalOrderId) {
            showSnackbar({ type: SnackbarType.WARNING, message: 'Không tìm thấy đơn hàng gốc của yêu cầu này.' });
            return;
          }
          void navigate(getOrderDetailPath(originalOrderId), { state: { fromPage: ROUTE_PATH.EXCHANGE } });
        },
        onSyncOrderShipment: (row) => {
          void handleSyncOrderShipment(row);
        },
        syncingOrderReturnId,
      }),
    [handleCopyValue, handleSyncOrderShipment, syncingOrderReturnId],
  );

  const handleConfirmReject = useCallback(
    async (payload: { note: string }) => {
      if (!rejectDialogRow) return;
      if (!canReturnExchangeConfirmOrCancelOnList(rejectDialogRow.status)) {
        showSnackbar({
          type: SnackbarType.WARNING,
          message: 'Chỉ hủy được yêu cầu ở trạng thái Chờ xác nhận.',
        });
        setRejectDialogRow(null);
        return;
      }
      setRejectSubmitting(true);
      try {
        await rejectOrderReturn(rejectDialogRow.id, { note: payload.note });
        showSnackbar({ type: SnackbarType.SUCCESS, message: `Đã hủy yêu cầu ${rejectDialogRow.returnCode}` });
        setRejectDialogRow(null);
        d.refreshList();
      } catch (error) {
        showSnackbar({
          type: SnackbarType.ERROR,
          message: (error as { message?: string })?.message || 'Không thể hủy yêu cầu đổi/trả.',
        });
      } finally {
        setRejectSubmitting(false);
      }
    },
    [d, rejectDialogRow],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      setPage(1);
    },
    [setPage, setSearchValue],
  );

  const handleExportOrderReturns = useCallback(
    async (type: 'all' | 'current-page' | 'selected') => {
      if (exportSubmitting) return;

      if (type === 'selected' && !d.selectedRowIds.length) {
        showSnackbar({ type: SnackbarType.WARNING, message: 'Vui lòng chọn ít nhất một yêu cầu để export' });
        return;
      }

      if (type === 'selected') {
        const selectedRows = d.rows.filter((row) => d.selectedRowIds.includes(row.id));
        if (!selectedRows.length) {
          showSnackbar({
            type: SnackbarType.WARNING,
            message: 'Không tìm thấy dữ liệu đã chọn trên trang hiện tại.',
          });
          return;
        }
      }

      if (type === 'current-page' && !d.rows.length) {
        showSnackbar({ type: SnackbarType.WARNING, message: 'Không có dữ liệu để export ở trang hiện tại' });
        return;
      }

      setExportSubmitting(true);
      try {
        const topicConfigId = await resolveOrderReturnExportTopicConfigId();
        const job = await importExportApi.postExportTopicConfigs(topicConfigId, {
          filters: buildOrderReturnExportFiltersFromListState({
            page: d.page,
            pageSize: d.pageSize,
            search: d.searchValue,
            activeStatus: d.activeStatus,
            selectedTimeOption: d.selectedTimeOption,
            customDateRange: d.customDateRange,
            advancedFilters: d.appliedAdvancedFilters,
            scope: type,
            selectedRowIds: d.selectedRowIds,
            visibleRows: d.rows,
          }),
        });

        const status = await importExportApi.waitImportExportJobFileUrl(job.jobId);
        const fileUrl = status.fileUrl?.trim();

        if (!fileUrl) {
          throw new Error('Export hoàn tất nhưng chưa có link tải file.');
        }

        await downloadRemoteFile(fileUrl, status.fileName?.trim() || 'export-doi-tra.xlsx');

        showSnackbar({
          type: SnackbarType.SUCCESS,
          message: 'Đã tải file export.',
        });
      } catch (error) {
        showSnackbar({
          type: SnackbarType.ERROR,
          message: getErrorMessage(error) || 'Export yêu cầu đổi trả thất bại',
        });
      } finally {
        setExportSubmitting(false);
      }
    },
    [d, exportSubmitting, showSnackbar],
  );

  const handleExportOrderReturnFastFbo = useCallback(
    async (type: 'all' | 'current-page' | 'selected') => {
      if (exportSubmitting) return;

      if (type === 'selected' && !d.selectedRowIds.length) {
        showSnackbar({ type: SnackbarType.WARNING, message: 'Vui lòng chọn ít nhất một yêu cầu để export' });
        return;
      }

      if (type === 'selected') {
        const selectedRows = d.rows.filter((row) => d.selectedRowIds.includes(row.id));
        if (!selectedRows.length) {
          showSnackbar({
            type: SnackbarType.WARNING,
            message: 'Không tìm thấy dữ liệu đã chọn trên trang hiện tại.',
          });
          return;
        }
      }

      if (type === 'current-page' && !d.rows.length) {
        showSnackbar({ type: SnackbarType.WARNING, message: 'Không có dữ liệu để export ở trang hiện tại' });
        return;
      }

      setExportSubmitting(true);
      try {
        const topicConfigId = await resolveOrderReturnFastExportTopicConfigId();
        const job = await importExportApi.postExportTopicConfigs(topicConfigId, {
          filters: buildOrderReturnFastExportFiltersFromListState({
            page: d.page,
            pageSize: d.pageSize,
            search: d.searchValue,
            activeStatus: d.activeStatus,
            selectedTimeOption: d.selectedTimeOption,
            customDateRange: d.customDateRange,
            advancedFilters: d.appliedAdvancedFilters,
            scope: type,
            selectedRowIds: d.selectedRowIds,
            visibleRows: d.rows,
          }),
        });

        const status = await importExportApi.waitImportExportJobFileUrl(job.jobId);
        const fileUrl = status.fileUrl?.trim();

        if (!fileUrl) {
          throw new Error('Export hoàn tất nhưng chưa có link tải file.');
        }

        await downloadRemoteFile(fileUrl, status.fileName?.trim() || 'Phieu_nhap_hang_ban_bi_tra_lai.xlsx');

        showSnackbar({
          type: SnackbarType.SUCCESS,
          message: 'Đã tải file export Hàng Bán Trả Lại (Fast FBO).',
        });
      } catch (error) {
        showSnackbar({
          type: SnackbarType.ERROR,
          message: getErrorMessage(error) || 'Export Hàng Bán Trả Lại (Fast FBO) thất bại',
        });
      } finally {
        setExportSubmitting(false);
      }
    },
    [d, exportSubmitting, showSnackbar],
  );

  const toolbarActions = useMemo<DataTableToolbarAction[]>(
    () => [
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
      },
      {
        key: 'filter',
        label: 'Bộ lọc',
        ...ORDER_RETURNS_PAGE_SCOPE,

        apiCode: 'api_order_return_list',
        icon: <FilterListOutlined sx={{ fontSize: 18 }} />,
        selectedOptionLabel: (() => {
          const activeFilterCount = [d.appliedAdvancedFilters.orderCode, d.appliedAdvancedFilters.type, d.appliedAdvancedFilters.reason, d.appliedAdvancedFilters.status].filter(Boolean).length;
          return activeFilterCount > 0 ? `Bộ lọc (${activeFilterCount})` : 'Bộ lọc';
        })(),
        onClick: () => d.setIsAdvancedFilterDialogOpen(true),
      },
      {
        key: 'export',
        label: 'Export',
        ...ORDER_RETURNS_PAGE_SCOPE,

        icon: <FileDownloadOutlined sx={{ fontSize: 18 }} />,
        endIcon: <KeyboardArrowDownRounded sx={{ fontSize: 18 }} />,
        apiCode: 'api_order_return_export',
        options: [
          { value: 'all', label: 'Export tất cả' },
          { value: 'current-page', label: 'Export trang hiện tại' },
          { value: 'selected', label: 'Export đơn đã chọn' },
          { value: 'fast-fbo', label: 'Export Hàng Bán Trả Lại (Fast FBO)' },
        ],
        onSelectOption: (value) => {
          if (value === 'all' || value === 'current-page' || value === 'selected') {
            void handleExportOrderReturns(value);
            return;
          }
          if (value === 'fast-fbo') {
            const scope = d.selectedRowIds.length ? 'selected' : 'all';
            void handleExportOrderReturnFastFbo(scope);
          }
        },
      },
    ],
    [
      d.appliedAdvancedFilters.orderCode,
      d.appliedAdvancedFilters.reason,
      d.appliedAdvancedFilters.status,
      d.appliedAdvancedFilters.type,
      d.selectedTimeLabel,
      handleExportOrderReturns,
      handleExportOrderReturnFastFbo,
    ],
  );

  if (!canViewList) return null;

  return (
    <Stack sx={{ height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`, boxSizing: 'border-box', minHeight: 0 }}>
      <WrapperComponent
        label="Danh sách yêu cầu đổi trả"
        tabs={
          <DataTableStatusTabs
            tabs={d.statusTabs}
            activeValue={d.activeStatus}
            onChange={(value) => {
              d.setActiveStatus(value);
              d.setPage(1);
            }}
          />
        }
      >
        <Stack gap={2} sx={{ flex: 1, minHeight: 0, minWidth: 0 }}>
          <DataTableFilterCard>
            <DataTableToolbar embedded searchValue={d.searchValue} onSearchChange={handleSearchChange} searchPlaceholder="Tìm theo mã yêu cầu / mã đơn" actions={toolbarActions} />
          </DataTableFilterCard>

          <ReturnExchangeAdvancedFilterDialogPart
            open={d.isAdvancedFilterDialogOpen}
            value={d.appliedAdvancedFilters}
            onClose={() => d.setIsAdvancedFilterDialogOpen(false)}
            onApply={(filters) => {
              d.setAppliedAdvancedFilters(filters);
              d.setIsAdvancedFilterDialogOpen(false);
              d.setPage(1);
            }}
          />

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
              rows={d.rows}
              columns={columns}
              getRowId={(row) => row.id}
              selectable
              selectedRowIds={d.selectedRowIds}
              sortField={d.sortField ?? undefined}
              sortDirection={d.sortDirection}
              onSortChange={d.handleSortChange}
              onToggleSelectAll={d.handleToggleSelectAll}
              onToggleSelectRow={(row, checked) => d.handleToggleSelectRow(row.id, checked)}
              tableMinWidth={2600}
              containerSx={{ height: '100%', minHeight: 0 }}
              emptyTitle="Không có yêu cầu đổi trả phù hợp"
              emptyDescription="Danh sách hiện không có dữ liệu theo bộ lọc đang chọn."
            />
          </DataTableContentCard>

          <DataTablePagination
            page={d.page}
            pageSize={d.pageSize}
            totalItems={d.totalItems}
            pageSizeOptions={[...PAGE_SIZE_OPTIONS]}
            itemLabel="yêu cầu"
            summaryMode="total"
            onPageChange={d.setPage}
            onPageSizeChange={(size) => {
              d.setPageSize(size);
              d.setPage(1);
            }}
          />

          <ReturnExchangesRejectDialogPart
            open={Boolean(rejectDialogRow)}
            returnCode={rejectDialogRow?.returnCode ?? '—'}
            submitting={rejectSubmitting}
            onClose={() => {
              if (rejectSubmitting) return;
              setRejectDialogRow(null);
            }}
            onConfirm={(payload) => void handleConfirmReject(payload)}
          />
        </Stack>
      </WrapperComponent>
    </Stack>
  );
};
