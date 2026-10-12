import { FileDownloadOutlined, FilterListOutlined, KeyboardArrowDownRounded } from '@mui/icons-material';
import { LinearProgress, Stack } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { STYLE } from '@/trading-ui/adapters/library';
import * as importExportApi from '../../apis/import-export/import-export.api';
import { OrderTimeFilter, syncOrderInvoice, syncOrderReturnInvoice } from '../../apis/order';
import { downloadRemoteFile } from '../../common/helpers';
import { copyTextToClipboard, getCopyFailureMessage } from '../../common/utils';
import { getErrorMessage } from '../../common/utils/string.utils';
import {
  DataTable,
  DataTableBulkActionBar,
  DataTableContentCard,
  DataTableFilterCard,
  DataTablePagination,
  DataTableStatusTabs,
  DataTableToolbar,
  type DataTableToolbarAction,
} from '../../components/data-table';
import { OrderTimeCustomRangeDialog, createSharedTimeFilterToolbarAction } from '../../components/time-filter/shared-time-filter';
import { WrapperComponent } from '../../components/wrapper';
import { type InvoiceDocumentRow, type InvoiceDocumentTypeFilter, useInvoiceDocumentsList } from '../../hooks/invoice-documents/use-invoice-documents-list.hook';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { useListPageViewAccess } from '../../permissions/use-list-page-view-access.hook';
import { getInvoiceDocumentDetailPath } from '@/trading-ui/router/route.path';
import { ORDER_INVOICE_PAGE_SCOPE } from '../order/order-permission.constants';
import { buildOrderInvoiceExportFiltersFromListState, resolveOrderInvoiceExportTopicConfigId } from './invoice-documents-export.util';
import { INVOICE_DOCUMENTS_TABLE_MIN_WIDTH, getInvoiceDocumentsListColumns } from './parts/invoice-documents-list-columns.part';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

const DOCUMENT_TYPE_OPTIONS: ReadonlyArray<{ value: InvoiceDocumentTypeFilter; label: string }> = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'INVOICE', label: 'Hóa đơn' },
  { value: 'RECEIPT', label: 'Chứng từ' },
];

const InvoiceDocumentsListPage = () => {
  const navigate = useNavigate();
  const canViewList = useListPageViewAccess(ORDER_INVOICE_PAGE_SCOPE, { listApiCode: 'api_invoice_list' });
  const d = useInvoiceDocumentsList();
  const { showSnackbar } = useSnackbar();
  const [exportSubmitting, setExportSubmitting] = useState(false);
  const [syncingDocumentId, setSyncingDocumentId] = useState<string | null>(null);

  const handleSearchChange = (value: string) => {
    d.setSearchValue(value);
    d.resetToFirstPage();
  };

  const handleCopy = async (value: string, typeLabel: string) => {
    const copied = await copyTextToClipboard(value);
    if (copied) {
      showSnackbar({ type: SnackbarType.SUCCESS, message: `Đã sao chép ${typeLabel}: ${value}` });
      return;
    }
    showSnackbar({ type: SnackbarType.WARNING, message: getCopyFailureMessage() });
  };

  const handleSyncInvoice = useCallback(
    async (row: InvoiceDocumentRow) => {
      if (syncingDocumentId === row.id) return;

      setSyncingDocumentId(row.id);
      try {
        const result = row.documentType === 'RECEIPT' ? await syncOrderReturnInvoice(row.orderReturnId as string) : await syncOrderInvoice(row.orderId);

        showSnackbar({
          type: SnackbarType.SUCCESS,
          message:
            result.status === 'SCHEDULED'
              ? result.message || `Đã xếp hàng đồng bộ hóa đơn cho ${row.orderCode}. Đang cập nhật danh sách…`
              : result.message || `Đã đồng bộ hóa đơn cho ${row.orderCode}`,
        });

        // Sync có thể trả SCHEDULED (RMQ) — refresh ngay thường vẫn thấy FAILED, nên poll vài lần.
        const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));
        let latest = await d.mutate();
        if (result.status === 'SCHEDULED') {
          for (let attempt = 0; attempt < 5; attempt += 1) {
            await sleep(1500);
            latest = await d.mutate();
            const rows = latest?.data ?? [];
            const updated = rows.find((item) => item.id === row.id);
            if (!updated || updated.status !== 'FAILED') break;
          }
        }
      } catch (error) {
        showSnackbar({
          type: SnackbarType.ERROR,
          message: getErrorMessage(error) || 'Không thể đồng bộ hóa đơn. Vui lòng thử lại.',
        });
      } finally {
        setSyncingDocumentId(null);
      }
    },
    [d, showSnackbar, syncingDocumentId],
  );

  const columns = useMemo(
    () =>
      getInvoiceDocumentsListColumns({
        onCopyOrderCode: (value) => void handleCopy(value, 'mã vận đơn'),
        onCopyInvoiceCode: (value) => void handleCopy(value, 'mã hóa đơn'),
        onOpenDetail: (row) => navigate(getInvoiceDocumentDetailPath(row.id)),
        onSyncInvoice: (row) => {
          void handleSyncInvoice(row);
        },
        syncingDocumentId,
      }),
    [handleSyncInvoice, navigate, syncingDocumentId],
  );

  const handleExportInvoiceDocuments = useCallback(
    async (type: 'all' | 'current-page' | 'selected') => {
      if (exportSubmitting) return;

      if (type === 'selected' && !d.selectedRowIds.length) {
        showSnackbar({ type: SnackbarType.WARNING, message: 'Vui lòng chọn ít nhất một chứng từ để export' });
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
        const topicConfigId = await resolveOrderInvoiceExportTopicConfigId();
        const job = await importExportApi.postExportTopicConfigs(topicConfigId, {
          filters: buildOrderInvoiceExportFiltersFromListState({
            page: d.page,
            pageSize: d.pageSize,
            search: d.searchValue,
            activeStatus: d.activeStatus,
            documentTypeFilter: d.documentTypeFilter,
            selectedTimeOption: d.selectedTimeOption,
            customDateRange: d.customDateRange,
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

        await downloadRemoteFile(fileUrl, status.fileName?.trim() || 'export-hoa-don.xlsx');

        showSnackbar({
          type: SnackbarType.SUCCESS,
          message: 'Đã tải file export.',
        });
      } catch (error) {
        showSnackbar({
          type: SnackbarType.ERROR,
          message: getErrorMessage(error) || 'Export hóa đơn & chứng từ thất bại',
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
            d.setSelectedTimeOption(value as OrderTimeFilter);
            d.setCustomDateRange(null);
            d.resetToFirstPage();
          },
        }),
      },
      {
        key: 'document-type',
        label: 'Loại chứng từ',
        ...ORDER_INVOICE_PAGE_SCOPE,
        apiCode: 'api_invoice_list',
        icon: <FilterListOutlined sx={{ fontSize: 18 }} />,
        selectedOptionLabel: DOCUMENT_TYPE_OPTIONS.find((option) => option.value === d.documentTypeFilter)?.label || 'Tất cả',
        options: DOCUMENT_TYPE_OPTIONS,
        onSelectOption: (value) => {
          d.setDocumentTypeFilter(value as InvoiceDocumentTypeFilter);
          d.resetToFirstPage();
        },
      },
      {
        key: 'export',
        label: 'Export',
        ...ORDER_INVOICE_PAGE_SCOPE,
        icon: <FileDownloadOutlined sx={{ fontSize: 18 }} />,
        endIcon: <KeyboardArrowDownRounded sx={{ fontSize: 18 }} />,
        apiCode: 'api_invoice_export',
        options: [
          { value: 'all', label: 'Export tất cả' },
          { value: 'current-page', label: 'Export trang hiện tại' },
          { value: 'selected', label: 'Export chứng từ đã chọn' },
        ],
        onSelectOption: (value) => {
          if (value === 'all' || value === 'current-page' || value === 'selected') {
            void handleExportInvoiceDocuments(value);
          }
        },
      },
    ],
    [d, handleExportInvoiceDocuments],
  );

  if (!canViewList) return null;

  const showLoadingBar = d.isLoading || d.isValidating || exportSubmitting;
  const allPageSelected = d.rows.length > 0 && d.rows.every((row) => d.selectedRowIds.includes(row.id));
  const somePageSelected = d.rows.some((row) => d.selectedRowIds.includes(row.id));

  return (
    <Stack sx={{ height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`, boxSizing: 'border-box', minHeight: 0 }}>
      <WrapperComponent
        label="Hóa đơn & Chứng từ"
        tabs={
          <DataTableStatusTabs
            tabs={d.statusTabs}
            activeValue={d.activeStatus}
            onChange={(value) => {
              d.setActiveStatus(value);
              d.resetToFirstPage();
            }}
          />
        }
      >
        <Stack gap={2} sx={{ flex: 1, minHeight: 0, minWidth: 0 }}>
          <DataTableFilterCard>
            <DataTableToolbar
              embedded
              searchValue={d.searchValue}
              onSearchChange={handleSearchChange}
              searchPlaceholder="Tìm theo mã đơn, mã hóa đơn, tên khách hàng, SĐT, email..."
              actions={toolbarActions}
            />
          </DataTableFilterCard>

          <DataTableBulkActionBar
            selectableCount={d.rows.length}
            selectedCount={d.selectedRowIds.length}
            allSelected={allPageSelected}
            indeterminate={somePageSelected && !allPageSelected}
            onToggleAll={(checked) => d.handleToggleSelectAll(checked, d.rows)}
          />

          <OrderTimeCustomRangeDialog
            open={d.isTimeRangeDialogOpen}
            initialRange={d.customDateRange}
            onClose={() => d.setIsTimeRangeDialogOpen(false)}
            onApply={(range) => {
              d.setSelectedTimeOption(OrderTimeFilter.CUSTOM);
              d.setCustomDateRange(range);
              d.setIsTimeRangeDialogOpen(false);
              d.resetToFirstPage();
            }}
          />

          <LinearProgress
            sx={{
              height: 2,
              backgroundColor: '#F1F5F9',
              borderRadius: 1,
              visibility: showLoadingBar ? 'visible' : 'hidden',
            }}
          />

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
              tableMinWidth={INVOICE_DOCUMENTS_TABLE_MIN_WIDTH}
              containerSx={{ height: '100%', minHeight: 0 }}
              emptyTitle="Không có chứng từ phù hợp"
              emptyDescription="Danh sách hiện không có dữ liệu theo bộ lọc đang chọn."
            />
          </DataTableContentCard>

          <DataTablePagination
            page={d.page}
            pageSize={d.pageSize}
            totalItems={d.totalItems}
            pageSizeOptions={[...PAGE_SIZE_OPTIONS]}
            itemLabel="hóa đơn & chứng từ"
            summaryMode="total"
            onPageChange={d.setPage}
            onPageSizeChange={(size) => {
              d.setPageSize(size);
              d.resetToFirstPage();
            }}
          />
        </Stack>
      </WrapperComponent>
    </Stack>
  );
};

export default InvoiceDocumentsListPage;
