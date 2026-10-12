import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import { type DataTableSortDirection, type DataTableStatusTab } from '../../components/data-table';
import {
  getRefundProposalList,
  type RefundProposalPaymentChannel,
  type RefundProposalSourceType,
  type RefundProposalStatus,
  type IRefundProposalListItem,
  type IRefundProposalListQuery,
  type RefundProposalSortBy,
} from '../../apis/refund-proposal';
import { REFUND_PROPOSAL_STATUS_TABS, type RefundProposalQuickStatus } from '../../common/constant/refund-proposal/refund-proposal.constants';
import { SnackbarType, useSnackbar } from '../use-snackbar.hook';

export type RefundProposalAdvancedFilters = {
  paymentChannel: RefundProposalPaymentChannel | '';
  sourceType: RefundProposalSourceType | '';
  brand: string;
};

export const REFUND_PROPOSAL_INITIAL_ADVANCED_FILTERS: RefundProposalAdvancedFilters = {
  paymentChannel: '',
  sourceType: '',
  brand: '',
};

const REFUND_PROPOSAL_LIST_SWR_KEY = 'refund-proposal-list' as const;

const toOrderType = (direction: DataTableSortDirection): 'ASC' | 'DESC' => (direction === 'asc' ? 'ASC' : 'DESC');

export type RefundProposalRow = IRefundProposalListItem & { stt: number };

export const useRefundProposalList = ({ initialAdvancedFilters, pageSize }: { initialAdvancedFilters: RefundProposalAdvancedFilters; pageSize: number }) => {
  const { showSnackbar } = useSnackbar();

  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState<number>(pageSize);
  const [sortField, setSortField] = useState<RefundProposalSortBy | null>('updatedAt');
  const [sortDirection, setSortDirection] = useState<DataTableSortDirection>('desc');
  const [activeStatus, setActiveStatus] = useState<RefundProposalQuickStatus>('ALL');
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [isAdvancedFilterDialogOpen, setIsAdvancedFilterDialogOpen] = useState(false);
  const [appliedAdvancedFilters, setAppliedAdvancedFilters] = useState<RefundProposalAdvancedFilters>(initialAdvancedFilters);
  const lastErrorMessageRef = useRef('');

  const requestParams = useMemo<IRefundProposalListQuery>(() => {
    const statusPayload = activeStatus !== 'ALL' ? (activeStatus as RefundProposalStatus) : undefined;
    return {
      page,
      take: currentPageSize,
      orderBy: sortField ?? 'updatedAt',
      orderType: toOrderType(sortDirection),
      ...(searchValue.trim() ? { search: searchValue.trim() } : {}),
      ...(statusPayload ? { status: statusPayload } : {}),
      ...(appliedAdvancedFilters.paymentChannel ? { paymentChannel: appliedAdvancedFilters.paymentChannel } : {}),
      ...(appliedAdvancedFilters.sourceType ? { sourceType: appliedAdvancedFilters.sourceType } : {}),
      ...(appliedAdvancedFilters.brand.trim() ? { brand: appliedAdvancedFilters.brand.trim() } : {}),
    };
  }, [activeStatus, appliedAdvancedFilters, currentPageSize, page, searchValue, sortDirection, sortField]);

  const requestParamsKey = useMemo(() => JSON.stringify(requestParams), [requestParams]);
  const { data, error, isLoading, mutate } = useSWR([REFUND_PROPOSAL_LIST_SWR_KEY, requestParamsKey] as const, async () => await getRefundProposalList(requestParams), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  useEffect(() => {
    const message = (error as { message?: string })?.message || '';
    if (!message || message === lastErrorMessageRef.current) return;
    lastErrorMessageRef.current = message;
    showSnackbar({ type: SnackbarType.ERROR, message: message || 'Không tải được danh sách hoàn tiền.' });
  }, [error, showSnackbar]);

  const rows = useMemo<RefundProposalRow[]>(
    () =>
      (data?.list ?? []).map((row, index) => ({
        ...row,
        stt: (page - 1) * currentPageSize + index + 1,
      })),
    [currentPageSize, data?.list, page],
  );

  const totalItems = data?.total ?? 0;

  /** Tự tính summary từ `list` khi BE chưa trả — đảm bảo badge tab vẫn đúng. */
  const summary = useMemo<Partial<Record<RefundProposalStatus | 'ALL', number>>>(() => {
    if (data?.summary) return data.summary;
    const list = data?.list ?? [];
    const fallback: Partial<Record<RefundProposalStatus | 'ALL', number>> = { ALL: list.length };
    list.forEach((item) => {
      const status = (item.proposalStatus ?? item.status) as RefundProposalStatus | undefined;
      if (!status) return;
      fallback[status] = (fallback[status] ?? 0) + 1;
    });
    return fallback;
  }, [data?.list, data?.summary]);

  const statusTabs = useMemo<Array<DataTableStatusTab<RefundProposalQuickStatus>>>(
    () =>
      REFUND_PROPOSAL_STATUS_TABS.map((tab) => {
        const rawCount = tab.value === 'ALL' ? (summary.ALL ?? totalItems) : (summary[tab.value as RefundProposalStatus] ?? 0);
        const count = Number(rawCount);
        return { value: tab.value, label: tab.label, count: Number.isFinite(count) ? count : 0 };
      }),
    [summary, totalItems],
  );

  const handleSortChange = useCallback((field: RefundProposalSortBy) => {
    setSelectedRowIds([]);
    setPage(1);
    setSortField((prev) => {
      if (prev !== field) {
        setSortDirection('asc');
        return field;
      }
      setSortDirection((prevDirection) => (prevDirection === 'asc' ? 'desc' : 'asc'));
      return field;
    });
  }, []);

  const handleToggleSelectRow = useCallback((rowId: string, checked: boolean) => {
    setSelectedRowIds((current) => (checked ? (current.includes(rowId) ? current : [...current, rowId]) : current.filter((id) => id !== rowId)));
  }, []);

  const handleToggleSelectAll = useCallback((checked: boolean, currentRows: RefundProposalRow[]) => {
    const visibleIds = currentRows.map((row) => row.id);
    setSelectedRowIds((current) => (checked ? Array.from(new Set([...current, ...visibleIds])) : current.filter((id) => !visibleIds.includes(id))));
  }, []);

  return {
    searchValue,
    setSearchValue: (value: string) => {
      setSelectedRowIds([]);
      setSearchValue(value);
    },
    page,
    setPage: (value: number) => {
      setSelectedRowIds([]);
      setPage(value);
    },
    pageSize: currentPageSize,
    setPageSize: (value: number) => {
      setSelectedRowIds([]);
      setCurrentPageSize(value);
    },
    sortField,
    sortDirection,
    activeStatus,
    setActiveStatus: (value: RefundProposalQuickStatus) => {
      setSelectedRowIds([]);
      setActiveStatus(value);
    },
    selectedRowIds,
    isAdvancedFilterDialogOpen,
    setIsAdvancedFilterDialogOpen,
    appliedAdvancedFilters,
    setAppliedAdvancedFilters: (value: RefundProposalAdvancedFilters) => {
      setSelectedRowIds([]);
      setAppliedAdvancedFilters(value);
    },
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
