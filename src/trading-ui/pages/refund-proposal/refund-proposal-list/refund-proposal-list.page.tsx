import { FileDownloadOutlined, FilterListOutlined, KeyboardArrowDownRounded } from '@mui/icons-material';
import { LinearProgress, Stack } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { STYLE } from '@/trading-ui/adapters/library';
import { RefundProposalSourceType } from '../../../apis/refund-proposal';
import { downloadRemoteFile } from '../../../common/helpers';
import { copyTextToClipboard, getCopyFailureMessage } from '../../../common/utils';
import { getErrorMessage } from '../../../common/utils/string.utils';
import { DataTable, DataTableContentCard, DataTableFilterCard, DataTablePagination, DataTableStatusTabs, DataTableToolbar, type DataTableToolbarAction } from '../../../components/data-table';
import { WrapperComponent } from '../../../components/wrapper';
import { REFUND_PROPOSAL_INITIAL_ADVANCED_FILTERS, useRefundProposalList } from '../../../hooks/refund-proposal/use-refund-proposal-list.hook';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { ROUTE_PATH, getOrderDetailPath, getRefundProposalDetailPath } from '@/trading-ui/router/route.path';
import { RefundProposalAdvancedFilterDialogPart } from './parts/refund-proposal-advanced-filter-dialog.part';
import { getRefundProposalListColumns } from './parts/refund-proposal-list-columns.part';
import { useListPageViewAccess } from '../../../permissions/use-list-page-view-access.hook';
import { ORDER_REFUNDS_PAGE_SCOPE } from '../../order/order-permission.constants';
import { buildOrderRefundExportFiltersFromListState, resolveOrderRefundExportTopicConfigId } from '../refund-proposal-export.util';
import { getRefundProposalSourceType } from './refund-proposal-list.helpers';
import { importExportApi } from '../../../apis';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

const RefundProposalListPage = () => {
  const canViewList = useListPageViewAccess(ORDER_REFUNDS_PAGE_SCOPE, { listApiCode: 'api_refund_proposal_list' });
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const d = useRefundProposalList({
    initialAdvancedFilters: REFUND_PROPOSAL_INITIAL_ADVANCED_FILTERS,
    pageSize: PAGE_SIZE_OPTIONS[0],
  });
  const [exportSubmitting, setExportSubmitting] = useState(false);

  const handleCopyProposalCode = useCallback(async (code: string) => {
    const copied = await copyTextToClipboard(code);
    if (copied) {
      showSnackbar({ type: SnackbarType.SUCCESS, message: `Đã sao chép mã ${code}` });
    } else {
      showSnackbar({ type: SnackbarType.WARNING, message: getCopyFailureMessage() });
    }
  }, []);

  const columns = useMemo(
    () =>
      getRefundProposalListColumns({
        onOpenDetail: (row) => navigate(getRefundProposalDetailPath(row.id)),
        onOpenOriginalOrder: (row) => {
          const originalOrderId = row.originalOrderId?.trim() || (getRefundProposalSourceType(row) === RefundProposalSourceType.CANCEL ? row.sourceId?.trim() : '') || '';
          if (!originalOrderId) {
            showSnackbar({ type: SnackbarType.WARNING, message: 'Không tìm thấy đơn hàng gốc của yêu cầu này.' });
            return;
          }
          void navigate(getOrderDetailPath(originalOrderId), { state: { fromPage: ROUTE_PATH.REFUND_PROPOSAL } });
        },
        onCopyProposalCode: (code) => void handleCopyProposalCode(code),
        onCopyOrderCode: (code) => void handleCopyProposalCode(code),
      }),
    [handleCopyProposalCode, navigate],
  );

  const handleExportRefundProposals = useCallback(
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
        const topicConfigId = await resolveOrderRefundExportTopicConfigId();
        const job = await importExportApi.postExportTopicConfigs(topicConfigId, {
          filters: buildOrderRefundExportFiltersFromListState({
            page: d.page,
            pageSize: d.pageSize,
            search: d.searchValue,
            activeStatus: d.activeStatus,
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

        await downloadRemoteFile(fileUrl, status.fileName?.trim() || 'export-hoan-tien.xlsx');

        showSnackbar({
          type: SnackbarType.SUCCESS,
          message: 'Đã tải file export.',
        });
      } catch (error) {
        showSnackbar({
          type: SnackbarType.ERROR,
          message: getErrorMessage(error) || 'Export yêu cầu hoàn tiền thất bại',
        });
      } finally {
        setExportSubmitting(false);
      }
    },
    [d],
  );

  const toolbarActions = useMemo<DataTableToolbarAction[]>(
    () => [
      {
        key: 'filter',
        label: 'Bộ lọc',
        ...ORDER_REFUNDS_PAGE_SCOPE,

        apiCode: 'api_refund_proposal_list',
        icon: <FilterListOutlined sx={{ fontSize: 18 }} />,
        selectedOptionLabel: (() => {
          const count = [d.appliedAdvancedFilters.paymentChannel, d.appliedAdvancedFilters.sourceType, d.appliedAdvancedFilters.brand.trim()].filter(Boolean).length;
          return count > 0 ? `Bộ lọc (${count})` : 'Bộ lọc';
        })(),
        onClick: () => d.setIsAdvancedFilterDialogOpen(true),
      },
      {
        key: 'export',
        label: 'Export',
        ...ORDER_REFUNDS_PAGE_SCOPE,

        icon: <FileDownloadOutlined sx={{ fontSize: 18 }} />,
        endIcon: <KeyboardArrowDownRounded sx={{ fontSize: 18 }} />,
        apiCode: 'api_refund_proposal_export',
        options: [
          { value: 'all', label: 'Export tất cả' },
          { value: 'current-page', label: 'Export trang hiện tại' },
          { value: 'selected', label: 'Export yêu cầu đã chọn' },
        ],
        onSelectOption: (value) => {
          if (value === 'all' || value === 'current-page' || value === 'selected') {
            void handleExportRefundProposals(value);
          }
        },
      },
    ],
    [d, handleExportRefundProposals],
  );

  if (!canViewList) return null;

  return (
    <Stack sx={{ height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`, boxSizing: 'border-box', minHeight: 0 }}>
      <WrapperComponent
        label="Danh sách yêu cầu hoàn tiền"
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
            <DataTableToolbar
              embedded
              searchValue={d.searchValue}
              onSearchChange={(value) => {
                d.setSearchValue(value);
                d.setPage(1);
              }}
              searchPlaceholder="Tìm theo Seva-ID, mã gốc, tên khách hàng, SĐT, email..."
              actions={toolbarActions}
            />
          </DataTableFilterCard>

          <RefundProposalAdvancedFilterDialogPart
            open={d.isAdvancedFilterDialogOpen}
            value={d.appliedAdvancedFilters}
            onClose={() => d.setIsAdvancedFilterDialogOpen(false)}
            onApply={(filters) => {
              d.setAppliedAdvancedFilters(filters);
              d.setIsAdvancedFilterDialogOpen(false);
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
              tableMinWidth={1400}
              containerSx={{ height: '100%', minHeight: 0 }}
              emptyTitle="Chưa có lệnh hoàn tiền nào"
              emptyDescription="Danh sách hiện không có dữ liệu theo bộ lọc đang chọn."
            />
          </DataTableContentCard>

          <DataTablePagination
            page={d.page}
            pageSize={d.pageSize}
            totalItems={d.totalItems}
            pageSizeOptions={[...PAGE_SIZE_OPTIONS]}
            itemLabel="yêu cầu hoàn tiền"
            summaryMode="total"
            onPageChange={d.setPage}
            onPageSizeChange={(size) => {
              d.setPageSize(size);
              d.setPage(1);
            }}
          />
        </Stack>
      </WrapperComponent>
    </Stack>
  );
};

export default RefundProposalListPage;
