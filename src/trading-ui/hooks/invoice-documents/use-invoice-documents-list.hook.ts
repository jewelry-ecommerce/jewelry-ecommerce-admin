import dayjs, { type Dayjs } from 'dayjs';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import {
  getInvoiceDocumentList,
  OrderTimeFilter,
  type IInvoiceDocumentItem,
  type IInvoiceDocumentListQuery,
  type InvoiceDocumentSortField,
  type InvoiceDocumentStatus,
  type InvoiceDocumentType,
} from '../../apis/order';
import { formatTimeFilterLabel } from '../../components/time-filter/shared-time-filter';
import type { DataTableSortDirection, DataTableStatusTab } from '../../components/data-table';
import { SnackbarType, useSnackbar } from '../use-snackbar.hook';

export type InvoiceDocumentStatusFilter = InvoiceDocumentStatus | 'ALL';
export type InvoiceDocumentTypeFilter = InvoiceDocumentType | 'ALL';
export type { InvoiceDocumentSortField };
export type InvoiceDocumentRow = IInvoiceDocumentItem & { stt?: number };

const INVOICE_DOCUMENTS_LIST_SWR_KEY = 'invoice-documents-list' as const;

const STATUS_OPTIONS: Array<{ value: InvoiceDocumentStatusFilter; label: string }> = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'WAITING_SIGN', label: 'Chờ ký' },
  { value: 'SIGNED', label: 'Đã ký' },
  { value: 'FAILED', label: 'Lỗi' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

const toSortDirection = (direction: DataTableSortDirection): 'ASC' | 'DESC' => (direction === 'asc' ? 'ASC' : 'DESC');

/** OMS chưa hỗ trợ Last90Days — map sang Custom + start/end. */
const resolveTimeFilterParams = (
  selectedTimeOption: OrderTimeFilter | null,
  customDateRange: { from: Dayjs; to: Dayjs } | null,
): Pick<IInvoiceDocumentListQuery, 'orderTimeFilter' | 'startDate' | 'endDate'> => {
  if (!selectedTimeOption) return {};

  if (selectedTimeOption === OrderTimeFilter.CUSTOM && customDateRange) {
    return {
      orderTimeFilter: OrderTimeFilter.CUSTOM,
      startDate: customDateRange.from.startOf('day').toISOString(),
      endDate: customDateRange.to.endOf('day').toISOString(),
    };
  }

  if (selectedTimeOption === OrderTimeFilter.LAST_90_DAYS) {
    const to = dayjs().endOf('day');
    const from = dayjs().subtract(89, 'day').startOf('day');
    return {
      orderTimeFilter: OrderTimeFilter.CUSTOM,
      startDate: from.toISOString(),
      endDate: to.toISOString(),
    };
  }

  return { orderTimeFilter: selectedTimeOption };
};

export const useInvoiceDocumentsList = () => {
  const { showSnackbar } = useSnackbar();
  const lastErrorMessageRef = useRef('');

  const [activeStatus, setActiveStatus] = useState<InvoiceDocumentStatusFilter>('ALL');
  const [searchValue, setSearchValue] = useState('');
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [documentTypeFilter, setDocumentTypeFilter] = useState<InvoiceDocumentTypeFilter>('ALL');
  const [sortField, setSortField] = useState<InvoiceDocumentSortField | null>('issuedAt');
  const [sortDirection, setSortDirection] = useState<DataTableSortDirection>('desc');
  const [selectedTimeOption, setSelectedTimeOption] = useState<OrderTimeFilter | null>(null);
  const [customDateRange, setCustomDateRange] = useState<{ from: Dayjs; to: Dayjs } | null>(null);
  const [isTimeRangeDialogOpen, setIsTimeRangeDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const selectedTimeLabel = useMemo(() => formatTimeFilterLabel(selectedTimeOption, customDateRange), [selectedTimeOption, customDateRange]);

  const requestParams = useMemo<IInvoiceDocumentListQuery>(() => {
    const timeParams = resolveTimeFilterParams(selectedTimeOption, customDateRange);
    return {
      page,
      pageSize,
      sortField: sortField ?? 'issuedAt',
      sortDirection: toSortDirection(sortDirection),
      ...(activeStatus !== 'ALL' ? { status: activeStatus } : {}),
      ...(documentTypeFilter !== 'ALL' ? { documentType: documentTypeFilter } : {}),
      ...(searchValue.trim() ? { search: searchValue.trim() } : {}),
      ...timeParams,
    };
  }, [activeStatus, customDateRange, documentTypeFilter, page, pageSize, searchValue, selectedTimeOption, sortDirection, sortField]);

  const requestParamsKey = useMemo(() => JSON.stringify(requestParams), [requestParams]);

  const { data, error, isLoading, isValidating, mutate } = useSWR([INVOICE_DOCUMENTS_LIST_SWR_KEY, requestParamsKey] as const, async () => await getInvoiceDocumentList(requestParams), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  useEffect(() => {
    const message = (error as { message?: string })?.message || '';
    if (!message || message === lastErrorMessageRef.current) return;
    lastErrorMessageRef.current = message;
    showSnackbar({
      type: SnackbarType.ERROR,
      message: message || 'Không tải được danh sách hóa đơn & chứng từ.',
    });
  }, [error, showSnackbar]);

  const rows = useMemo<InvoiceDocumentRow[]>(
    () =>
      (data?.data ?? []).map((row, index) => ({
        ...row,
        stt: (page - 1) * pageSize + index + 1,
        issuedAt: row.issuedAt ?? '',
        orderTrackingCode: row.orderTrackingCode ?? '',
        customerPhone: row.customerPhone ?? '',
        customerEmail: row.customerEmail ?? '',
        failedReason: row.failedReason ?? '',
        linkUrl: row.linkUrl ?? '',
      })),
    [data?.data, page, pageSize],
  );

  const totalItems = data?.total ?? 0;
  const statusCounts = data?.statusCounts;

  const statusTabs = useMemo<Array<DataTableStatusTab<InvoiceDocumentStatusFilter>>>(
    () =>
      STATUS_OPTIONS.map((option) => {
        const rawCount = option.value === 'ALL' ? (statusCounts?.ALL ?? totalItems) : (statusCounts?.[option.value] ?? 0);
        const count = Number(rawCount);
        return {
          value: option.value,
          label: option.label,
          count: Number.isFinite(count) ? count : 0,
        };
      }),
    [statusCounts, totalItems],
  );

  const resetToFirstPage = useCallback(() => {
    setSelectedRowIds([]);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((field: InvoiceDocumentSortField) => {
    setSelectedRowIds([]);
    setPage(1);
    setSortField((prevField) => {
      if (prevField !== field) {
        setSortDirection('asc');
        return field;
      }
      setSortDirection((prevDirection) => (prevDirection === 'asc' ? 'desc' : 'asc'));
      return field;
    });
  }, []);

  const handleToggleSelectRow = useCallback((rowId: string, checked: boolean) => {
    setSelectedRowIds((currentSelection) => {
      if (checked) return currentSelection.includes(rowId) ? currentSelection : [...currentSelection, rowId];
      return currentSelection.filter((id) => id !== rowId);
    });
  }, []);

  const handleToggleSelectAll = useCallback((checked: boolean, currentRows: InvoiceDocumentRow[]) => {
    const visibleRowIds = currentRows.map((row) => row.id);
    setSelectedRowIds((currentSelection) => {
      if (checked) return Array.from(new Set([...currentSelection, ...visibleRowIds]));
      return currentSelection.filter((id) => !visibleRowIds.includes(id));
    });
  }, []);

  return {
    rows,
    totalItems,
    page,
    pageSize,
    sortField,
    sortDirection,
    activeStatus,
    statusTabs,
    searchValue,
    selectedRowIds,
    selectedTimeLabel,
    selectedTimeOption,
    customDateRange,
    documentTypeFilter,
    isTimeRangeDialogOpen,
    isLoading,
    isValidating,
    mutate,
    setPage: (value: number) => {
      setSelectedRowIds([]);
      setPage(value);
    },
    setPageSize: (value: number) => {
      setSelectedRowIds([]);
      setPageSize(value);
    },
    setActiveStatus: (value: InvoiceDocumentStatusFilter) => {
      setSelectedRowIds([]);
      setActiveStatus(value);
    },
    setSearchValue: (value: string) => {
      setSelectedRowIds([]);
      setSearchValue(value);
    },
    setSelectedTimeOption: (value: OrderTimeFilter | null) => {
      setSelectedRowIds([]);
      setSelectedTimeOption(value);
    },
    setCustomDateRange: (value: { from: Dayjs; to: Dayjs } | null) => {
      setSelectedRowIds([]);
      setCustomDateRange(value);
    },
    setDocumentTypeFilter: (value: InvoiceDocumentTypeFilter) => {
      setSelectedRowIds([]);
      setDocumentTypeFilter(value);
    },
    setIsTimeRangeDialogOpen,
    resetToFirstPage,
    handleSortChange,
    handleToggleSelectRow,
    handleToggleSelectAll,
  };
};
