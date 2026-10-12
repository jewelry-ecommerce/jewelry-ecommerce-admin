import { ContentCopyOutlined, CreditCardOutlined, EditOutlined, FileDownloadOutlined, FilterListOutlined, KeyboardArrowDownRounded, RemoveRedEyeOutlined, SendOutlined } from '@mui/icons-material';
import { Box, LinearProgress, Link, Stack, Tooltip, Typography } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { STYLE } from '@/trading-ui/adapters/library';
import useSWR from 'swr';
import { OrderTimeFilter } from '../../../../apis/order';
import { preOrderOrderApi, type PreOrderOrderListItem, type QueryPreOrderOrderDto } from '../../../../apis';
import * as importExportApi from '../../../../apis/import-export/import-export.api';
import { PreOrderOrderStatus } from '../../../../apis/pre-order-order';
import { PAGE_TAKE_DEFAULT } from '../../../../common/constant/page-take.constant';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { formatDateTime, getErrorMessage } from '../../../../common/utils';
import { downloadRemoteFile } from '../../../../common/helpers';
import { formatCurrency } from '../../../../common/utils/number.utils';
import { getMaskedPhone } from '../../../../common/utils/order/order.utils';
import { CustomButton, PermissionIconButton } from '../../../../components/button';
import {
  DataTable,
  DataTableBulkActionBar,
  DataTableContentCard,
  DataTableFilterCard,
  DataTablePagination,
  DataTableStatusTabs,
  DataTableToolbar,
  type DataTableColumn,
  type DataTableToolbarAction,
} from '../../../../components/data-table';
import { StatusPill } from '../../../../components/status-pill';
import { OrderTimeCustomRangeDialog, createSharedTimeFilterToolbarAction, formatTimeFilterLabel, type SharedTimeRange } from '../../../../components/time-filter/shared-time-filter';
import { WrapperComponent } from '../../../../components/wrapper';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { useListPageViewAccess } from '../../../../permissions/use-list-page-view-access.hook';
import { usePermissionGate } from '../../../../permissions/use-permission-gate.hook';
import { getPreOrderOrderDetailPath, getPreOrderOrderUpdatePath } from '@/trading-ui/router/route.path';
import {
  getPreOrderOrderStatusLabel,
  PRE_ORDER_ORDER_FILTER_STATUSES,
  PRE_ORDER_ORDER_PAGE_SIZE_OPTIONS,
  PRE_ORDER_ORDER_SEARCH_PLACEHOLDER,
  PRE_ORDER_ORDER_STATUS_PILL_CONFIG,
  PRE_ORDER_ORDER_STATUS_TAB_ORDER,
  type PreOrderOrderStatusTab,
} from '../pre-order-order.constants';
import { PRE_ORDER_ORDER_PAGE_SCOPE, preOrderOrderButtonPermission } from '../pre-order-order-permission.constants';
import {
  canEditPreOrderOrder,
  canMovePreOrderOrderToAwaitingPayment,
  canSendOrResendPreOrderOrderZns,
  getPreOrderOrderDisplayedSkus,
  getPreOrderOrderGrandTotal,
  getPreOrderOrderTotalQuantity,
  normalizePreOrderOrderStatus,
} from '../pre-order-order.utils';
import { buildPreOrderOrderCreatedRange } from '../pre-order-order-list-query.utils';
import {
  buildPreOrderExportFilters,
  resolvePreOrderExportTopicConfigId,
  PRE_ORDER_EXPORT_ROUTING_KEY,
  PRE_ORDER_ITEM_EXPORT_ROUTING_KEY,
  type PreOrderOrderExportScope,
} from '../pre-order-order-export.util';

const SEND_ZNS_BUTTON_SX = {
  bgcolor: 'rgba(37, 99, 235, 1)',
  color: '#FFFFFF',
  '&:hover': { bgcolor: 'rgba(29, 78, 216, 1)' },
  '&.Mui-disabled': { bgcolor: 'rgba(37, 99, 235, 0.4)', color: '#FFFFFF' },
};

const MOVE_AWAITING_PAYMENT_BUTTON_SX = {
  bgcolor: 'rgba(251, 101, 20, 1)',
  color: '#FFFFFF',
  borderColor: 'rgba(251, 101, 20, 1)',
  '&:hover': { bgcolor: 'rgba(230, 90, 15, 1)', borderColor: 'rgba(230, 90, 15, 1)' },
  '&.Mui-disabled': { bgcolor: 'rgba(251, 101, 20, 0.4)', color: '#FFFFFF', borderColor: 'transparent' },
};

const PreOrderOrderListPage = () => {
  const canViewList = useListPageViewAccess(PRE_ORDER_ORDER_PAGE_SCOPE, { listApiCode: 'api_pre_order_order_list' });
  const canSendZnsGate = usePermissionGate(preOrderOrderButtonPermission('send_zns', 'Gửi ZNS đơn đặt trước', ['api_pre_order_order_send_zns', 'api_pre_order_order_bulk_send_zns']));
  const canResendZnsGate = usePermissionGate(preOrderOrderButtonPermission('resend_zns', 'Gửi lại ZNS đơn đặt trước', 'api_pre_order_order_resend_zns'));
  const canBulkSendZns = canSendZnsGate || canResendZnsGate;
  const canBulkMoveAwaiting = usePermissionGate(preOrderOrderButtonPermission('move_awaiting_payment', 'Chuyển chờ thanh toán đơn đặt trước', 'api_pre_order_order_move_awaiting_payment'));
  const showBulkActionBar = canBulkSendZns || canBulkMoveAwaiting;
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const [screenState, setScreenState] = useState({
    ...PAGE_TAKE_DEFAULT,
    take: 20,
    search: '',
    statuses: [] as PreOrderOrderStatus[],
  });
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [selectedTimeOption, setSelectedTimeOption] = useState<OrderTimeFilter | null>(null);
  const [customDateRange, setCustomDateRange] = useState<SharedTimeRange>(null);
  const [timeRangeDialogOpen, setTimeRangeDialogOpen] = useState(false);
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkMoving, setBulkMoving] = useState(false);
  const [exportSubmitting, setExportSubmitting] = useState(false);
  const [exportSkuSubmitting, setExportSkuSubmitting] = useState(false);

  const timeFilterPayload = useMemo(() => buildPreOrderOrderCreatedRange(selectedTimeOption, customDateRange), [customDateRange, selectedTimeOption]);
  const selectedTimeLabel = useMemo(() => formatTimeFilterLabel(selectedTimeOption, customDateRange), [customDateRange, selectedTimeOption]);

  const activeStatusTab = useMemo<PreOrderOrderStatusTab>(() => {
    if (screenState.statuses.length === 1) return screenState.statuses[0];
    return 'all';
  }, [screenState.statuses]);

  const statusFilterLabel = useMemo(() => {
    if (screenState.statuses.length === 0) return undefined;
    if (screenState.statuses.length === 1) return getPreOrderOrderStatusLabel(screenState.statuses[0]);
    return `Trạng thái (${screenState.statuses.length})`;
  }, [screenState.statuses]);

  const queryBody = useMemo((): QueryPreOrderOrderDto => {
    const keyword = screenState.search.trim();
    return {
      page: screenState.page,
      pageSize: screenState.take,
      sortField: 'createdAt',
      sortDirection: 'DESC',
      ...(keyword ? { keyword } : {}),
      ...(screenState.statuses.length > 0 ? { statuses: screenState.statuses } : {}),
      ...timeFilterPayload,
    };
  }, [screenState.page, screenState.search, screenState.statuses, screenState.take, timeFilterPayload]);

  const listSwr = useSWR(canViewList ? (['pre-order-orders', queryBody] as const) : null, () => preOrderOrderApi.getPreOrderOrderList(queryBody), {
    revalidateOnFocus: true,
    keepPreviousData: true,
  });

  const rows = listSwr.data?.list ?? [];
  const totalItems = listSwr.data?.total ?? listSwr.data?.pagination?.total ?? 0;
  const statusCounts = listSwr.data?.counts;
  const bulkBusy = bulkSending || bulkMoving;

  const selectedSendZnsRows = useMemo(() => rows.filter((row) => selectedRowIds.includes(row.id) && canSendOrResendPreOrderOrderZns(row.status, row.znsRetryCount)), [rows, selectedRowIds]);

  const isOnlyZnsFailedSelected = useMemo(() => {
    if (selectedSendZnsRows.length === 0) return false;
    return selectedSendZnsRows.every((row) => normalizePreOrderOrderStatus(row.status) === PreOrderOrderStatus.ZNS_FAILED);
  }, [selectedSendZnsRows]);

  const selectedMoveAwaitingRows = useMemo(() => rows.filter((row) => selectedRowIds.includes(row.id) && canMovePreOrderOrderToAwaitingPayment(row.status, row.znsRetryCount)), [rows, selectedRowIds]);

  const handleCopyCode = useCallback(
    async (code: string) => {
      try {
        await navigator.clipboard.writeText(code);
        showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã sao chép mã đơn' });
      } catch {
        showSnackbar({ type: SnackbarType.ERROR, message: 'Không thể sao chép mã đơn' });
      }
    },
    [showSnackbar],
  );

  const handleBulkSendZns = useCallback(async () => {
    if (!selectedSendZnsRows.length) {
      showSnackbar({ type: SnackbarType.ERROR, message: 'Chỉ gửi ZNS cho đơn ở trạng thái Đã có hàng hoặc Gửi ZNS lỗi và còn quota gửi ZNS' });
      return;
    }
    setBulkSending(true);
    try {
      await preOrderOrderApi.bulkSendPreOrderOrdersZns({
        preOrderIds: selectedSendZnsRows.map((row) => row.id),
      });
      showSnackbar({
        type: SnackbarType.SUCCESS,
        message: `Đã xếp hàng gửi ZNS cho ${selectedSendZnsRows.length} đơn. Trạng thái cập nhật khi xử lý xong — focus lại trang để làm mới.`,
      });
      setSelectedRowIds([]);
      await listSwr.mutate();
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setBulkSending(false);
    }
  }, [listSwr, selectedSendZnsRows, showSnackbar]);

  const handleBulkMoveAwaitingPayment = useCallback(async () => {
    if (!selectedMoveAwaitingRows.length) {
      showSnackbar({ type: SnackbarType.ERROR, message: 'Chỉ chuyển chờ thanh toán cho đơn đã hết quota gửi ZNS (≥ 4 lần)' });
      return;
    }
    setBulkMoving(true);
    try {
      await preOrderOrderApi.bulkMarkPreOrderOrdersAwaitingPayment({
        preOrderIds: selectedMoveAwaitingRows.map((row) => row.id),
      });
      showSnackbar({ type: SnackbarType.SUCCESS, message: `Đã chuyển chờ thanh toán cho ${selectedMoveAwaitingRows.length} đơn` });
      setSelectedRowIds([]);
      await listSwr.mutate();
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setBulkMoving(false);
    }
  }, [listSwr, selectedMoveAwaitingRows, showSnackbar]);

  const handleExportPreOrder = useCallback(
    async (scope: PreOrderOrderExportScope) => {
      if (exportSubmitting || exportSkuSubmitting) return;

      if (scope === 'selected') {
        const selectedOrders = rows.filter((row) => selectedRowIds.includes(row.id));
        if (!selectedOrders.length) {
          showSnackbar({ type: SnackbarType.WARNING, message: 'Không tìm thấy đơn đã chọn trên trang hiện tại. Hãy chọn lại hoặc đổi trang.' });
          return;
        }
      }

      if (scope === 'current-page' && !rows.length) {
        showSnackbar({ type: SnackbarType.WARNING, message: 'Không có dữ liệu để export ở trang hiện tại' });
        return;
      }

      setExportSubmitting(true);
      try {
        const topicConfigId = await resolvePreOrderExportTopicConfigId(PRE_ORDER_EXPORT_ROUTING_KEY);
        const job = await importExportApi.postExportTopicConfigs(topicConfigId, {
          filters: buildPreOrderExportFilters({
            queryBody,
            scope,
            selectedOrderIds: selectedRowIds,
            visibleOrders: rows,
          }),
        });

        const status = await importExportApi.waitImportExportJobFileUrl(job.jobId);
        const fileUrl = status.fileUrl?.trim();

        if (!fileUrl) {
          throw new Error('Export hoàn tất nhưng chưa có link tải file.');
        }

        await downloadRemoteFile(fileUrl, status.fileName?.trim() || 'export-don-dat-truoc.xlsx');

        showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã tải file export đơn đặt trước.' });
      } catch (error) {
        showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
      } finally {
        setExportSubmitting(false);
      }
    },
    [exportSkuSubmitting, exportSubmitting, queryBody, rows, selectedRowIds, showSnackbar],
  );

  const handleExportPreOrderSku = useCallback(
    async (scope: PreOrderOrderExportScope) => {
      if (exportSubmitting || exportSkuSubmitting) return;

      if (scope === 'selected') {
        const selectedOrders = rows.filter((row) => selectedRowIds.includes(row.id));
        if (!selectedOrders.length) {
          showSnackbar({ type: SnackbarType.WARNING, message: 'Không tìm thấy đơn đã chọn trên trang hiện tại. Hãy chọn lại hoặc đổi trang.' });
          return;
        }
      }

      if (scope === 'current-page' && !rows.length) {
        showSnackbar({ type: SnackbarType.WARNING, message: 'Không có dữ liệu để export ở trang hiện tại' });
        return;
      }

      setExportSkuSubmitting(true);
      try {
        const topicConfigId = await resolvePreOrderExportTopicConfigId(PRE_ORDER_ITEM_EXPORT_ROUTING_KEY);
        const job = await importExportApi.postExportTopicConfigs(topicConfigId, {
          filters: buildPreOrderExportFilters({
            queryBody,
            scope,
            selectedOrderIds: selectedRowIds,
            visibleOrders: rows,
          }),
        });

        const status = await importExportApi.waitImportExportJobFileUrl(job.jobId);
        const fileUrl = status.fileUrl?.trim();

        if (!fileUrl) {
          throw new Error('Export hoàn tất nhưng chưa có link tải file.');
        }

        await downloadRemoteFile(fileUrl, status.fileName?.trim() || 'export-sku-don-dat-truoc.xlsx');

        showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã tải file export SKU đơn đặt trước.' });
      } catch (error) {
        showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
      } finally {
        setExportSkuSubmitting(false);
      }
    },
    [exportSkuSubmitting, exportSubmitting, queryBody, rows, selectedRowIds, showSnackbar],
  );

  const toolbarActions = useMemo<DataTableToolbarAction[]>(
    () => [
      {
        ...createSharedTimeFilterToolbarAction({
          selectedTimeLabel,
          onSelectCustom: () => setTimeRangeDialogOpen(true),
          onSelectPreset: (value) => {
            setSelectedTimeOption(value as OrderTimeFilter);
            setCustomDateRange(null);
            setScreenState((prev) => ({ ...prev, page: PAGE_TAKE_DEFAULT.page }));
          },
        }),
        ...preOrderOrderButtonPermission('filter_time', 'Lọc thời gian đơn đặt trước', 'api_pre_order_order_list'),
      },
      {
        key: 'status-filter',
        label: 'Trạng thái',
        icon: <FilterListOutlined sx={{ fontSize: 18 }} />,
        multiSelect: true,
        selectedOptionValues: screenState.statuses,
        selectedOptionLabel: statusFilterLabel,
        options: PRE_ORDER_ORDER_FILTER_STATUSES.map((status) => ({ value: status, label: getPreOrderOrderStatusLabel(status) })),
        onToggleOption: (value) => {
          const status = value as PreOrderOrderStatus;
          setScreenState((prev) => {
            const filterSelected = prev.statuses.filter((item) => PRE_ORDER_ORDER_FILTER_STATUSES.includes(item));
            const exists = filterSelected.includes(status);
            const nextFilter = exists ? filterSelected.filter((item) => item !== status) : [...filterSelected, status];
            const nextStatuses = PRE_ORDER_ORDER_FILTER_STATUSES.filter((item) => nextFilter.includes(item));
            return { ...prev, statuses: nextStatuses, page: PAGE_TAKE_DEFAULT.page };
          });
        },
        menuMinWidth: 220,
        ...preOrderOrderButtonPermission('filter', 'Lọc danh sách đơn đặt trước', 'api_pre_order_order_list'),
      },
      {
        key: 'export',
        label: exportSubmitting ? 'Đang export…' : 'Export',
        icon: <FileDownloadOutlined sx={{ fontSize: 18 }} />,
        endIcon: <KeyboardArrowDownRounded sx={{ fontSize: 18 }} />,
        disabled: exportSubmitting || exportSkuSubmitting,
        options: [
          { value: 'all', label: 'Export tất cả' },
          { value: 'current-page', label: 'Export trang hiện tại' },
          { value: 'selected', label: 'Export đơn đã chọn' },
        ],
        onSelectOption: (value) => void handleExportPreOrder(value as PreOrderOrderExportScope),
        ...preOrderOrderButtonPermission('export', 'Export đơn đặt trước', 'api_pre_order_order_list'),
      },
      {
        key: 'export-sku',
        label: exportSkuSubmitting ? 'Đang export…' : 'Export SKU',
        icon: <FileDownloadOutlined sx={{ fontSize: 18 }} />,
        endIcon: <KeyboardArrowDownRounded sx={{ fontSize: 18 }} />,
        disabled: exportSubmitting || exportSkuSubmitting,
        options: [
          { value: 'all', label: 'Export tất cả' },
          { value: 'current-page', label: 'Export trang hiện tại' },
          { value: 'selected', label: 'Export đơn đã chọn' },
        ],
        onSelectOption: (value) => void handleExportPreOrderSku(value as PreOrderOrderExportScope),
        ...preOrderOrderButtonPermission('export', 'Export SKU đơn đặt trước', 'api_pre_order_order_list'),
      },
    ],
    [exportSkuSubmitting, exportSubmitting, handleExportPreOrder, handleExportPreOrderSku, screenState.statuses, selectedTimeLabel, statusFilterLabel],
  );

  const allPageSelected = rows.length > 0 && rows.every((row) => selectedRowIds.includes(row.id));
  const somePageSelected = rows.some((row) => selectedRowIds.includes(row.id));
  const showSendZnsButton = selectedRowIds.length === 0 || selectedSendZnsRows.length > 0;
  const columns = useMemo<Array<DataTableColumn<PreOrderOrderListItem>>>(
    () => [
      {
        id: 'preOrderCode',
        label: 'Mã đơn đặt trước',
        minWidth: 220,
        renderCell: (row) => (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Link
              component="button"
              type="button"
              underline="none"
              onClick={() => void navigate(getPreOrderOrderDetailPath(row.id))}
              sx={{ color: '#155DFC', ...TYPOGRAPHY_STYLES.base.bold, cursor: 'pointer', textAlign: 'left' }}
            >
              {row.preOrderCode}
            </Link>
            <Tooltip title="Sao chép mã đơn">
              <PermissionIconButton
                size="small"
                onClick={() => void handleCopyCode(row.preOrderCode)}
                sx={{ width: 24, height: 24, color: '#155DFC' }}
                {...preOrderOrderButtonPermission('copy_pre_order_code', 'Sao chép mã đơn đặt trước', 'api_pre_order_order_list')}
              >
                <ContentCopyOutlined sx={{ fontSize: 16 }} />
              </PermissionIconButton>
            </Tooltip>
          </Stack>
        ),
      },
      {
        id: 'createdAt',
        label: 'Ngày tạo',
        width: 160,
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#374151' }}>{formatDateTime(row.createdAt)}</Typography>,
      },
      {
        id: 'customer',
        label: 'Khách hàng',
        minWidth: 180,
        renderCell: (row) => (
          <Stack gap={0.25}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#111827' }}>{row.customerName?.trim() || '—'}</Typography>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>{getMaskedPhone(row.customerPhone) || '—'}</Typography>
          </Stack>
        ),
      },
      {
        id: 'products',
        label: 'Sản phẩm',
        minWidth: 200,
        renderCell: (row) => {
          const { skus, remainingCount } = getPreOrderOrderDisplayedSkus(row.items ?? []);
          if (!skus.length) return <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#9CA3AF' }}>—</Typography>;
          return (
            <Stack gap={0.25}>
              {skus.map((sku, index) => (
                <Typography key={`${sku}-${index}`} sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6A7282' }}>
                  {sku}
                  {index === skus.length - 1 && remainingCount > 0 ? (
                    <Box component="span" sx={{ color: '#9CA3AF', ml: 1 }}>
                      +{remainingCount} sản phẩm
                    </Box>
                  ) : null}
                </Typography>
              ))}
            </Stack>
          );
        },
      },
      {
        id: 'quantity',
        label: 'Số lượng',
        width: 100,
        align: 'center',
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#111827' }}>{getPreOrderOrderTotalQuantity(row)}</Typography>,
      },
      {
        id: 'grandTotal',
        label: 'Tổng tiền',
        width: 140,
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold }}>{formatCurrency(getPreOrderOrderGrandTotal(row))} ₫</Typography>,
      },
      {
        id: 'status',
        label: 'Trạng thái đơn',
        width: 150,
        renderCell: (row) => {
          const status = normalizePreOrderOrderStatus(row.status) ?? PreOrderOrderStatus.PRE_ORDERED;
          return <StatusPill status={status} config={PRE_ORDER_ORDER_STATUS_PILL_CONFIG} label={getPreOrderOrderStatusLabel(row.status)} />;
        },
      },
      {
        id: 'actions',
        label: '',
        width: 100,
        align: 'center',
        sticky: 'right',
        renderCell: (row) => {
          const editBlocked = !canEditPreOrderOrder(row.status);
          return (
            <Stack direction="row" gap={0.5} justifyContent="center">
              <PermissionIconButton
                size="small"
                onClick={() => void navigate(getPreOrderOrderDetailPath(row.id))}
                {...preOrderOrderButtonPermission('open_detail', 'Xem chi tiết đơn đặt trước', 'api_pre_order_order_detail')}
                sx={{ color: '#374151' }}
              >
                <RemoveRedEyeOutlined sx={{ fontSize: 18 }} />
              </PermissionIconButton>
              <PermissionIconButton
                size="small"
                disabled={editBlocked}
                onClick={() => void navigate(getPreOrderOrderUpdatePath(row.id))}
                {...preOrderOrderButtonPermission('edit', 'Chỉnh sửa đơn đặt trước', 'api_pre_order_order_update')}
                sx={{ color: editBlocked ? '#9CA3AF' : '#374151' }}
              >
                <EditOutlined sx={{ fontSize: 18 }} />
              </PermissionIconButton>
            </Stack>
          );
        },
      },
    ],
    [handleCopyCode, navigate],
  );

  if (!canViewList) return null;

  return (
    <Stack sx={{ height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`, boxSizing: 'border-box', minHeight: 0 }}>
      <WrapperComponent
        label="Danh sách đơn đặt trước"
        tabs={
          <DataTableStatusTabs
            tabs={[
              { value: 'all', label: 'Tất cả', count: statusCounts?.all ?? totalItems },
              ...PRE_ORDER_ORDER_STATUS_TAB_ORDER.map((status) => ({
                value: status,
                label: getPreOrderOrderStatusLabel(status),
                count: statusCounts?.[status] ?? 0,
              })),
            ]}
            activeValue={activeStatusTab}
            onChange={(value) =>
              setScreenState((prev) => ({
                ...prev,
                statuses: value === 'all' ? [] : [value as PreOrderOrderStatus],
                page: PAGE_TAKE_DEFAULT.page,
              }))
            }
          />
        }
      >
        <Stack gap={2} sx={{ flex: 1, minHeight: 0, minWidth: 0 }}>
          <DataTableFilterCard>
            <DataTableToolbar
              embedded
              searchValue={screenState.search}
              onSearchChange={(search) => setScreenState((prev) => ({ ...prev, search, page: PAGE_TAKE_DEFAULT.page }))}
              searchPlaceholder={PRE_ORDER_ORDER_SEARCH_PLACEHOLDER}
              actions={toolbarActions}
            />
          </DataTableFilterCard>

          {showBulkActionBar ? (
            <DataTableBulkActionBar
              selectableCount={rows.length}
              selectedCount={selectedRowIds.length}
              allSelected={allPageSelected}
              indeterminate={somePageSelected && !allPageSelected}
              onToggleAll={(checked) => setSelectedRowIds(checked ? rows.map((row) => row.id) : [])}
            >
              {canBulkSendZns && showSendZnsButton ? (
                <CustomButton
                  fullWidth={false}
                  variant="primary"
                  startIcon={<SendOutlined sx={{ fontSize: 18 }} />}
                  disabled={bulkBusy || selectedSendZnsRows.length === 0}
                  onClick={() => void handleBulkSendZns()}
                  sx={SEND_ZNS_BUTTON_SX}
                  {...preOrderOrderButtonPermission(isOnlyZnsFailedSelected ? 'resend_zns' : 'send_zns', isOnlyZnsFailedSelected ? 'Gửi lại ZNS đơn đặt trước' : 'Gửi ZNS đơn đặt trước', [
                    'api_pre_order_order_send_zns',
                    'api_pre_order_order_bulk_send_zns',
                    'api_pre_order_order_resend_zns',
                  ])}
                >
                  {bulkSending ? 'Đang gửi…' : isOnlyZnsFailedSelected ? 'Gửi lại ZNS' : 'Gửi ZNS'}
                </CustomButton>
              ) : null}
              {canBulkMoveAwaiting ? (
                <CustomButton
                  fullWidth={false}
                  variant="primary"
                  startIcon={<CreditCardOutlined sx={{ fontSize: 18 }} />}
                  disabled={bulkBusy || selectedMoveAwaitingRows.length === 0}
                  onClick={() => void handleBulkMoveAwaitingPayment()}
                  sx={MOVE_AWAITING_PAYMENT_BUTTON_SX}
                  {...preOrderOrderButtonPermission('move_awaiting_payment', 'Chuyển chờ thanh toán đơn đặt trước', 'api_pre_order_order_move_awaiting_payment')}
                >
                  {bulkMoving ? 'Đang chuyển…' : 'Chuyển chờ thanh toán'}
                </CustomButton>
              ) : null}
            </DataTableBulkActionBar>
          ) : null}

          {listSwr.isLoading ? <LinearProgress sx={{ height: 2, backgroundColor: '#F1F5F9', borderRadius: 1 }} /> : null}

          <DataTableContentCard>
            <DataTable
              rows={rows}
              columns={columns}
              getRowId={(row) => row.id}
              selectable
              selectedRowIds={selectedRowIds}
              onToggleSelectAll={(checked) => setSelectedRowIds(checked ? rows.map((row) => row.id) : [])}
              onToggleSelectRow={(row, checked) => setSelectedRowIds((prev) => (checked ? [...prev, row.id] : prev.filter((id) => id !== row.id)))}
              tableMinWidth={1200}
              containerSx={{ height: '100%', minHeight: 0 }}
              emptyTitle="Không có đơn đặt trước phù hợp"
              emptyDescription="Danh sách hiện không có dữ liệu theo bộ lọc đang chọn."
            />
          </DataTableContentCard>

          <DataTablePagination
            page={screenState.page}
            pageSize={screenState.take}
            totalItems={totalItems}
            pageSizeOptions={[...PRE_ORDER_ORDER_PAGE_SIZE_OPTIONS]}
            itemLabel="đơn"
            summaryMode="total"
            onPageChange={(page) => setScreenState((prev) => ({ ...prev, page }))}
            onPageSizeChange={(take) => setScreenState((prev) => ({ ...prev, take, page: PAGE_TAKE_DEFAULT.page }))}
          />
        </Stack>
      </WrapperComponent>

      <OrderTimeCustomRangeDialog
        open={timeRangeDialogOpen}
        initialRange={customDateRange}
        onClose={() => setTimeRangeDialogOpen(false)}
        onApply={(range) => {
          setSelectedTimeOption(OrderTimeFilter.CUSTOM);
          setCustomDateRange(range);
          setTimeRangeDialogOpen(false);
          setScreenState((prev) => ({ ...prev, page: PAGE_TAKE_DEFAULT.page }));
        }}
      />
    </Stack>
  );
};

export default PreOrderOrderListPage;
