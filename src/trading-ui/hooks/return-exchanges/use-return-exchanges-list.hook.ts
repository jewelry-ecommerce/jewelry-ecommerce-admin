import { type Dayjs } from 'dayjs';
import { isJavaBackend } from '@/common/config/app.config';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import { type DataTableSortDirection, type DataTableStatusTab } from '../../components/data-table';
import { getOrderReturnList, OrderReturnStatus, OrderType, type IOrderReturnListItem } from '../../apis/order';
import type { OrderTimeOptionValue } from '../../pages/order/order.types';
import { SnackbarType, useSnackbar } from '../use-snackbar.hook';
import type { ReturnExchangeAdvancedFilters } from '../../pages/order/returns-exchanges/parts/returns-exchanges-advanced-filter-dialog.part';
import { buildOrderTimeFilterPayload, formatTimeFilterLabel } from '../../components/time-filter/shared-time-filter';

export type ReturnSortField = 'createdAt' | 'updatedAt' | 'returnCode' | 'priceDifference';
export type ReturnQuickStatus =
  | 'ALL'
  | OrderReturnStatus.PENDING
  | OrderReturnStatus.COMPLETED
  | OrderReturnStatus.AWAITING_PICKUP
  | OrderReturnStatus.COLLECTION_FAILED
  | OrderReturnStatus.COLLECTED
  | OrderReturnStatus.INSPECTION
  | OrderReturnStatus.REJECTED
  | OrderReturnStatus.CANCELLED
  | OrderReturnStatus.STORED
  | OrderReturnStatus.AWAITING_EXCHANGE
  | OrderReturnStatus.EXCHANGE_RELEASED
  | OrderReturnStatus.REFUNDED;

export const RETURN_QUICK_STATUS_TABS: Array<{ value: ReturnQuickStatus; label: string }> = [
  { value: 'ALL', label: 'Tất cả' },
  { value: OrderReturnStatus.PENDING, label: 'Chờ xác nhận' },
  { value: OrderReturnStatus.AWAITING_PICKUP, label: 'Chờ thu hồi' },
  { value: OrderReturnStatus.COLLECTION_FAILED, label: 'Thu hồi thất bại' },
  { value: OrderReturnStatus.COLLECTED, label: 'Đã thu hồi' },
  { value: OrderReturnStatus.INSPECTION, label: 'Đang kiểm định' },
  { value: OrderReturnStatus.REJECTED, label: 'Từ chối' },
  { value: OrderReturnStatus.CANCELLED, label: 'Đã huỷ' },
  { value: OrderReturnStatus.STORED, label: 'Đã nhập kho' },
  { value: OrderReturnStatus.AWAITING_EXCHANGE, label: 'Chờ hàng đổi' },
  { value: OrderReturnStatus.EXCHANGE_RELEASED, label: 'Giải phóng đơn mới' },
  { value: OrderReturnStatus.REFUNDED, label: 'Hoàn tiền' },
];

const toOrderType = (direction: DataTableSortDirection): OrderType => (direction === 'asc' ? OrderType.ASC : OrderType.DESC);

export const ORDER_RETURN_LIST_SWR_KEY = 'order-return-list' as const;

const JAVA_RETURN_STATUS_TABS: Array<{ value: ReturnQuickStatus; label: string }> = [
  { value: 'ALL', label: 'Tất cả' },
  { value: OrderReturnStatus.PENDING, label: 'Chờ xác nhận' },
  { value: OrderReturnStatus.COMPLETED, label: 'Hoàn tất' },
  { value: OrderReturnStatus.REJECTED, label: 'Từ chối' },
  { value: OrderReturnStatus.CANCELLED, label: 'Đã hủy' },
];

export const useReturnExchangesList = ({ initialAdvancedFilters, pageSize }: { initialAdvancedFilters: ReturnExchangeAdvancedFilters; pageSize: number }) => {
  const { showSnackbar } = useSnackbar();

  const [searchValue, setSearchValueState] = useState('');
  const [page, setPageState] = useState(1);
  const [currentPageSize, setCurrentPageSizeState] = useState<number>(pageSize);
  const [sortField, setSortField] = useState<ReturnSortField | null>('updatedAt');
  const [sortDirection, setSortDirection] = useState<DataTableSortDirection>('desc');
  const [activeStatus, setActiveStatusState] = useState<ReturnQuickStatus>('ALL');
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [selectedTimeOption, setSelectedTimeOptionState] = useState<OrderTimeOptionValue | null>(null);
  const [customDateRange, setCustomDateRangeState] = useState<{ from: Dayjs; to: Dayjs } | null>(null);
  const [isTimeRangeDialogOpen, setIsTimeRangeDialogOpen] = useState(false);
  const [isAdvancedFilterDialogOpen, setIsAdvancedFilterDialogOpen] = useState(false);
  const [appliedAdvancedFilters, setAppliedAdvancedFiltersState] = useState<ReturnExchangeAdvancedFilters>(initialAdvancedFilters);
  const lastErrorMessageRef = useRef('');

  const selectedTimeLabel = useMemo(() => {
    return formatTimeFilterLabel(selectedTimeOption, customDateRange);
  }, [customDateRange, selectedTimeOption]);

  const clearSelectedRows = useCallback(() => {
    setSelectedRowIds((prev) => (prev.length === 0 ? prev : []));
  }, []);

  const setSearchValue = useCallback(
    (value: string) => {
      clearSelectedRows();
      setSearchValueState(value);
    },
    [clearSelectedRows],
  );

  const setPage = useCallback(
    (value: number) => {
      clearSelectedRows();
      setPageState(value);
    },
    [clearSelectedRows],
  );

  const setPageSize = useCallback(
    (value: number) => {
      clearSelectedRows();
      setCurrentPageSizeState(value);
    },
    [clearSelectedRows],
  );

  const setActiveStatus = useCallback(
    (value: ReturnQuickStatus) => {
      clearSelectedRows();
      setActiveStatusState(value);
    },
    [clearSelectedRows],
  );

  const setSelectedTimeOption = useCallback(
    (value: OrderTimeOptionValue | null) => {
      clearSelectedRows();
      setSelectedTimeOptionState(value);
    },
    [clearSelectedRows],
  );

  const setCustomDateRange = useCallback(
    (value: { from: Dayjs; to: Dayjs } | null) => {
      clearSelectedRows();
      setCustomDateRangeState(value);
    },
    [clearSelectedRows],
  );

  const setAppliedAdvancedFilters = useCallback(
    (value: ReturnExchangeAdvancedFilters) => {
      clearSelectedRows();
      setAppliedAdvancedFiltersState(value);
    },
    [clearSelectedRows],
  );

  const requestParams = useMemo(() => {
    const timeRangePayload = buildOrderTimeFilterPayload(selectedTimeOption, customDateRange);
    const statusPayload = activeStatus !== 'ALL' ? (activeStatus as OrderReturnStatus) : appliedAdvancedFilters.status || undefined;
    const typePayload = appliedAdvancedFilters.type ? appliedAdvancedFilters.type : undefined;

    return {
      page,
      take: currentPageSize,
      orderBy: sortField ?? 'updatedAt',
      orderType: toOrderType(sortDirection),
      ...(searchValue.trim() ? { search: searchValue.trim() } : {}),
      ...(statusPayload ? { status: statusPayload } : {}),
      ...(appliedAdvancedFilters.orderId.trim() ? { orderId: appliedAdvancedFilters.orderId.trim() } : {}),
      ...(typePayload ? { type: typePayload } : {}),
      ...(appliedAdvancedFilters.reason ? { reason: appliedAdvancedFilters.reason } : {}),
      ...timeRangePayload,
    };
  }, [activeStatus, appliedAdvancedFilters, currentPageSize, customDateRange, page, searchValue, selectedTimeOption, sortDirection, sortField]);

  const requestParamsKey = useMemo(() => JSON.stringify(requestParams), [requestParams]);
  const { data, error, isLoading, mutate } = useSWR([ORDER_RETURN_LIST_SWR_KEY, requestParamsKey] as const, async () => await getOrderReturnList(requestParams), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  useEffect(() => {
    const message = (error as { message?: string })?.message || '';
    if (!message || message === lastErrorMessageRef.current) return;
    lastErrorMessageRef.current = message;
    showSnackbar({
      type: SnackbarType.ERROR,
      message: message || 'Không tải được danh sách yêu cầu đổi trả.',
    });
  }, [error, showSnackbar]);

  const rows = useMemo(
    () =>
      (data?.list ?? []).map((row: IOrderReturnListItem, index: number) => ({
        ...row,
        stt: (page - 1) * currentPageSize + index + 1,
      })),
    [currentPageSize, data?.list, page],
  );

  const totalItems = data?.total ?? 0;
  const summary = data?.summary ?? {};

  const statusTabs = useMemo<Array<DataTableStatusTab<ReturnQuickStatus>>>(
    () =>
      (isJavaBackend() ? JAVA_RETURN_STATUS_TABS : RETURN_QUICK_STATUS_TABS).map((tab) => {
        if (tab.value === 'ALL') {
          const allCount = Number(summary.ALL ?? totalItems);
          return {
            value: tab.value,
            label: tab.label,
            count: Number.isFinite(allCount) ? allCount : 0,
          };
        }

        const statusCount = Number(summary[tab.value] ?? 0);
        return {
          value: tab.value,
          label: tab.label,
          count: Number.isFinite(statusCount) ? statusCount : 0,
          // highlighted: tab.value === 'RecallFailed',
        };
      }),
    [summary, totalItems],
  );

  const handleSortChange = useCallback(
    (field: ReturnSortField) => {
      clearSelectedRows();
      setPageState(1);
      setSortField((prevField) => {
        if (prevField !== field) {
          setSortDirection('asc');
          return field;
        }
        setSortDirection((prevDirection) => (prevDirection === 'asc' ? 'desc' : 'asc'));
        return field;
      });
    },
    [clearSelectedRows],
  );

  const handleToggleSelectRow = useCallback((rowId: string, checked: boolean) => {
    setSelectedRowIds((currentSelection) => {
      if (checked) {
        return currentSelection.includes(rowId) ? currentSelection : [...currentSelection, rowId];
      }
      return currentSelection.filter((currentRowId) => currentRowId !== rowId);
    });
  }, []);

  const handleToggleSelectAll = useCallback((checked: boolean, currentRows: Array<IOrderReturnListItem & { stt: number }>) => {
    const visibleRowIds = currentRows.map((row) => row.id);
    setSelectedRowIds((currentSelection) => {
      if (checked) {
        return Array.from(new Set([...currentSelection, ...visibleRowIds]));
      }
      return currentSelection.filter((rowId) => !visibleRowIds.includes(rowId));
    });
  }, []);

  return {
    searchValue,
    setSearchValue,
    page,
    setPage,
    pageSize: currentPageSize,
    setPageSize,
    sortField,
    sortDirection,
    activeStatus,
    setActiveStatus,
    selectedRowIds,
    selectedTimeOption,
    setSelectedTimeOption,
    customDateRange,
    setCustomDateRange,
    isTimeRangeDialogOpen,
    setIsTimeRangeDialogOpen,
    isAdvancedFilterDialogOpen,
    setIsAdvancedFilterDialogOpen,
    appliedAdvancedFilters,
    setAppliedAdvancedFilters,
    selectedTimeLabel,
    rows,
    totalItems,
    isLoading,
    statusTabs,
    handleSortChange,
    handleToggleSelectRow,
    handleToggleSelectAll,
    refreshList: () => void mutate(),
  };
};
