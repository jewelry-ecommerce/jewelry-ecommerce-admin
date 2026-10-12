import type { Dayjs } from 'dayjs';
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { cancelOrder, getGuestOrderList, getOrderList, OrderCancellationReason, OrderStatus, OrderTimeFilter, recallOrder, syncGhnShipmentByClientCode } from '../apis/order';
import * as importExportApi from '../apis/import-export/import-export.api';
import { getErrorMessage } from '../common/utils/string.utils';
import { copyTextToClipboard, getCopyFailureMessage, getCopySuccessMessage } from '../common/utils';
import type { DataTableStatusTab } from '../components/data-table';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { isGuestUser } from '../permissions/login-access.utils';
import { type GlobalReduxState } from '../redux/store.interface';
import { ROUTE_PATH, getOrderClonePath, getOrderDetailPath, getOrderEditPath } from '@/trading-ui/router/route.path';
import { areAdvancedFiltersEqual, countActiveAdvancedFilters, createEmptyStatusCounts, mapOrderSummaryToStatusCounts, normalizeAdvancedFilters } from '../pages/order/order-data.helpers';
import { downloadRemoteFile } from '../common/helpers';
import {
  ORDER_EXPORT_ROUTING_KEY,
  ORDER_SUMMARY_EXPORT_ROUTING_KEY,
  buildOrderExportFiltersFromListState,
  isUnsupportedOrderExportStatusFilter,
  resolveOrderExportTopicConfigId,
} from '../pages/order/order-export.util';
import { buildOrderCustomerFboExportFiltersFromListState, resolveOrderCustomerFboExportTopicConfigId } from '../pages/order/order-customer-fbo-export.util';
import { buildOrderFastInvoiceExportFiltersFromListState, resolveOrderFastInvoiceExportTopicConfigId } from '../pages/order/order-fast-invoice-export.util';
import { formatTimeFilterLabel } from '../components/time-filter/shared-time-filter';
import {
  ORDER_INITIAL_ADVANCED_FILTERS,
  ORDER_ADJUSTMENT_ALLOWED_STATUSES,
  ORDER_ADJUSTMENT_BLOCKED_STATUS_MESSAGE,
  ORDER_STATUS_OPTIONS,
  isOrderCancellableStatus,
  ORDER_CANCEL_BLOCKED_STATUS_MESSAGE,
  shouldPromptCancelOriginalWhenCloningOrder,
} from '../common/constant/order/order.constants';
import { buildOrderListRequest, mapApiOrderListItemToOrder, mapShippingAddressToCustomerInfo } from '../pages/order/order.constant';
import { canCreateReturnExchangeRequest } from '../common/utils/order/order-return-exchange.utils';
import { getOrderTableColumns } from '../pages/order/order-table';
import type { Order, OrderAdvancedFilters, OrderShippingAddress, OrderSortField, OrderStatusFilter, OrderTimeOptionValue, SortDirection } from '../pages/order/order.types';
import { sortOrders } from '../common/utils/order/order.utils';

const isExpressOrder = (order: Order): boolean => {
  const carrier = String(order.shippingCarrier ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
  return carrier.includes('express') || carrier.includes('hoa toc') || carrier.includes('nhanh');
};

type OrderDataPagePermissions = {
  canEditOrder?: boolean;
  canViewOrder?: boolean;
  canOpenMoreActions?: boolean;
  canViewList?: boolean;
};

export const useOrderDataPage = (permissions: OrderDataPagePermissions = {}) => {
  const canViewList = permissions.canViewList ?? true;
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { user } = useSelector((state: GlobalReduxState) => state.auth);
  const isGuest = isGuestUser(user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [statusCounts, setStatusCounts] = useState<Record<OrderStatusFilter, number>>(createEmptyStatusCounts);
  const [activeStatus, setActiveStatus] = useState<OrderStatusFilter>('all');
  const [searchValue, setSearchValue] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortField, setSortField] = useState<OrderSortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedTimeOption, setSelectedTimeOption] = useState<OrderTimeOptionValue | null>(OrderTimeFilter.LAST_30_DAYS);
  const [customDateRange, setCustomDateRange] = useState<{ from: Dayjs; to: Dayjs } | null>(null);
  const [isTimeRangeDialogOpen, setIsTimeRangeDialogOpen] = useState(false);
  const [appliedAdvancedFilters, setAppliedAdvancedFilters] = useState<OrderAdvancedFilters>({
    ...ORDER_INITIAL_ADVANCED_FILTERS,
  });
  const [isAdvancedFilterDialogOpen, setIsAdvancedFilterDialogOpen] = useState(false);
  const [orderActionMenuAnchor, setOrderActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [orderActionMenuOrder, setOrderActionMenuOrder] = useState<Order | null>(null);
  const [cloneConfirmOrder, setCloneConfirmOrder] = useState<Order | null>(null);
  const [cloneConfirmSubmitting, setCloneConfirmSubmitting] = useState(false);
  const [cancelConfirmOrder, setCancelConfirmOrder] = useState<Order | null>(null);
  const [syncingOrderId, setSyncingOrderId] = useState<string | null>(null);
  const [cancelConfirmSubmitting, setCancelConfirmSubmitting] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [exportSubmitting, setExportSubmitting] = useState(false);

  const visibleOrders = useMemo(() => {
    if (!sortField) {
      return orders;
    }
    return sortOrders(orders, sortField, sortDirection);
  }, [orders, sortDirection, sortField]);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const statusTabs = useMemo<Array<DataTableStatusTab<OrderStatusFilter>>>(() => {
    return ORDER_STATUS_OPTIONS.map((option) => ({
      value: option.value,
      label: option.label,
      count: statusCounts[option.value] || 0,
      highlighted: option.highlighted,
    }));
  }, [statusCounts]);

  const selectedTimeLabel = useMemo(() => {
    return formatTimeFilterLabel(selectedTimeOption, customDateRange);
  }, [customDateRange, selectedTimeOption]);

  const selectedFilterLabel = useMemo(() => {
    const activeFilterCount = countActiveAdvancedFilters(appliedAdvancedFilters);
    return activeFilterCount > 0 ? `Bộ lọc (${activeFilterCount})` : 'Bộ lọc';
  }, [appliedAdvancedFilters]);

  useEffect(() => {
    setPage(1);
  }, [activeStatus, appliedAdvancedFilters, searchValue, pageSize, selectedTimeOption, customDateRange]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    setSelectedOrderIds([]);
  }, [page, pageSize, activeStatus, appliedAdvancedFilters, searchValue, selectedTimeOption, customDateRange]);

  useEffect(() => {
    setStatusCounts(createEmptyStatusCounts());
  }, [appliedAdvancedFilters, searchValue, selectedTimeOption, customDateRange]);

  const showStubNotification = useCallback(
    (message: string) => {
      showSnackbar({
        type: SnackbarType.INFO,
        message,
      });
    },
    [showSnackbar],
  );

  useEffect(() => {
    if (!isGuest && !canViewList) return;

    let isMounted = true;

    const fetchOrders = async () => {
      setIsLoading(true);

      try {
        const listRequest = buildOrderListRequest({
          page,
          pageSize,
          search: searchValue,
          activeStatus,
          sortField,
          sortDirection,
          selectedTimeOption,
          customDateRange,
          advancedFilters: appliedAdvancedFilters,
        });
        const response = isGuest ? await getGuestOrderList(listRequest) : await getOrderList(listRequest);

        if (!isMounted) return;

        const mappedOrders = response.list.map(mapApiOrderListItemToOrder);
        const nextStatusCounts = mapOrderSummaryToStatusCounts(response.summary);
        // Chỉ fallback đếm tay trên trang hiện tại khi BE không trả `summary`.
        // Không fallback khi BE trả số 0 hợp lệ (ví dụ `EXPRESS: 0`).
        const summaryProvided = Boolean(response.summary);
        if (!summaryProvided) {
          nextStatusCounts.express = mappedOrders.filter(isExpressOrder).length;
          nextStatusCounts.shippingCombined = mappedOrders.filter((order) => order.status === OrderStatus.SHIPPING).length;
          nextStatusCounts.returnCombined = mappedOrders.filter((order) => order.status === OrderStatus.RETURNED).length;
        }
        setStatusCounts(nextStatusCounts);

        if (activeStatus === 'express') {
          const expressOrders = mappedOrders.filter(isExpressOrder);
          setOrders(expressOrders);
          setTotalItems(summaryProvided ? nextStatusCounts.express : expressOrders.length);
          return;
        }

        setOrders(mappedOrders);
        setTotalItems(response.total);
      } catch (error) {
        if (!isMounted) return;

        setOrders([]);
        setTotalItems(0);
        showSnackbar({
          type: SnackbarType.ERROR,
          message: (error as { message?: string })?.message || 'Không thể tải danh sách đơn hàng',
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchOrders();

    return () => {
      isMounted = false;
    };
  }, [activeStatus, appliedAdvancedFilters, searchValue, page, pageSize, selectedTimeOption, customDateRange, showSnackbar, sortDirection, sortField, reloadToken, isGuest, canViewList]);

  const handleOpenAdvancedFilterDialog = useCallback(() => {
    setIsAdvancedFilterDialogOpen(true);
  }, []);

  const handleCloseAdvancedFilterDialog = useCallback(() => {
    setIsAdvancedFilterDialogOpen(false);
  }, []);

  const handleApplyAdvancedFilters = useCallback(
    (draft: OrderAdvancedFilters) => {
      const nextAdvancedFilters = normalizeAdvancedFilters(draft);
      if (!areAdvancedFiltersEqual(appliedAdvancedFilters, nextAdvancedFilters)) {
        setAppliedAdvancedFilters(nextAdvancedFilters);
      }
      setIsAdvancedFilterDialogOpen(false);
    },
    [appliedAdvancedFilters],
  );

  const handleApplyTimeRange = useCallback((range: { from: Dayjs; to: Dayjs }) => {
    setCustomDateRange(range);
    setSelectedTimeOption(OrderTimeFilter.CUSTOM);
    setIsTimeRangeDialogOpen(false);
  }, []);

  const handleSortChange = useCallback(
    (field: OrderSortField) => {
      if (sortField !== field) {
        setSortField(field);
        setSortDirection('asc');
        return;
      }

      if (sortDirection === 'asc') {
        setSortDirection('desc');
        return;
      }

      // Click lần 3: clear sort, trả về mặc định từ backend/list.
      setSortField(null);
      setSortDirection('asc');
    },
    [sortDirection, sortField],
  );

  const handleToggleSelectOrder = useCallback((orderId: string, checked: boolean) => {
    setSelectedOrderIds((currentSelection) => {
      if (checked) {
        return currentSelection.includes(orderId) ? currentSelection : [...currentSelection, orderId];
      }
      return currentSelection.filter((currentOrderId) => currentOrderId !== orderId);
    });
  }, []);

  const handleToggleSelectAll = useCallback((checked: boolean, currentRows: Order[]) => {
    const visibleOrderIds = currentRows.map((order) => order.id);
    setSelectedOrderIds((currentSelection) => {
      if (checked) {
        return Array.from(new Set([...currentSelection, ...visibleOrderIds]));
      }
      return currentSelection.filter((orderId) => !visibleOrderIds.includes(orderId));
    });
  }, []);

  const handleCopyOrderCode = useCallback(
    async (order: Order) => {
      const copied = await copyTextToClipboard(order.orderCode);
      if (copied) {
        showSnackbar({
          type: SnackbarType.SUCCESS,
          message: getCopySuccessMessage(order.orderCode),
        });
      } else {
        showSnackbar({
          type: SnackbarType.WARNING,
          message: getCopyFailureMessage(order.orderCode),
        });
      }
    },
    [showSnackbar],
  );

  const handleSyncOrderShipment = useCallback(
    async (order: Order) => {
      if (syncingOrderId === order.id) return;

      setSyncingOrderId(order.id);
      try {
        await syncGhnShipmentByClientCode(order.orderCode);
        setReloadToken((currentToken) => currentToken + 1);
        showSnackbar({
          type: SnackbarType.SUCCESS,
          message: `Đã đồng bộ vận đơn cho đơn ${order.orderCode}.`,
        });
      } catch (error) {
        showSnackbar({
          type: SnackbarType.ERROR,
          message: (error as { message?: string })?.message || 'Không thể đồng bộ vận đơn. Vui lòng thử lại.',
        });
      } finally {
        setSyncingOrderId(null);
      }
    },
    [showSnackbar, syncingOrderId],
  );

  const handleUpdateOrderShippingAddress = useCallback(
    (orderId: string, shippingAddress: OrderShippingAddress) => {
      setOrders((currentOrders) =>
        currentOrders.map((order) => {
          if (order.id !== orderId) {
            return order;
          }
          return {
            ...order,
            shippingAddress,
            customer: mapShippingAddressToCustomerInfo(shippingAddress, order.customer.email),
          };
        }),
      );

      showSnackbar({
        type: SnackbarType.SUCCESS,
        message: 'Đã cập nhật dữ liệu đơn hàng',
      });
    },
    [showSnackbar],
  );

  const handleOpenOrderActionMenu = useCallback((order: Order, event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setOrderActionMenuAnchor(event.currentTarget);
    setOrderActionMenuOrder(order);
  }, []);

  const handleCloseOrderActionMenu = useCallback(() => {
    setOrderActionMenuAnchor(null);
    setOrderActionMenuOrder(null);
  }, []);

  const handleRequestCloneFromMenu = useCallback(() => {
    if (!orderActionMenuOrder) return;
    if (shouldPromptCancelOriginalWhenCloningOrder(orderActionMenuOrder.status)) {
      setCloneConfirmOrder(orderActionMenuOrder);
    } else {
      navigate(getOrderClonePath(orderActionMenuOrder.id));
    }
    handleCloseOrderActionMenu();
  }, [handleCloseOrderActionMenu, navigate, orderActionMenuOrder]);

  const handleCloseCloneConfirmDialog = useCallback(() => {
    if (cloneConfirmSubmitting) return;
    setCloneConfirmOrder(null);
  }, [cloneConfirmSubmitting]);

  const handleConfirmCloneFromMenu = useCallback(
    async (shouldCancelOriginal: boolean) => {
      if (!cloneConfirmOrder) return;
      setCloneConfirmSubmitting(true);
      try {
        if (shouldCancelOriginal) {
          await cancelOrder(cloneConfirmOrder.id, {
            cancellationReason: OrderCancellationReason.CHANGE_MIND,
            note: 'Đã sao chép sang đơn mới',
          });
        }
        setCloneConfirmOrder(null);
        navigate(getOrderClonePath(cloneConfirmOrder.id));
      } catch (error) {
        showSnackbar({
          type: SnackbarType.ERROR,
          message: (error as { message?: string })?.message || 'Không thể hủy đơn gốc trước khi sao chép.',
        });
      } finally {
        setCloneConfirmSubmitting(false);
      }
    },
    [cloneConfirmOrder, navigate, showSnackbar],
  );

  const canAdjustOrderFromMenu = useMemo(() => {
    if (!orderActionMenuOrder) return false;
    return ORDER_ADJUSTMENT_ALLOWED_STATUSES.includes(orderActionMenuOrder.status);
  }, [orderActionMenuOrder]);

  const canCancelOrderFromMenu = useMemo(() => {
    if (!orderActionMenuOrder) return false;
    return isOrderCancellableStatus(orderActionMenuOrder.status);
  }, [orderActionMenuOrder]);

  const canCreateReturnExchangeFromMenu = useMemo(() => {
    if (!orderActionMenuOrder) return false;
    return canCreateReturnExchangeRequest(orderActionMenuOrder);
  }, [orderActionMenuOrder]);

  const handleCreateReturnExchangeFromMenu = useCallback(() => {
    if (!orderActionMenuOrder || !canCreateReturnExchangeRequest(orderActionMenuOrder)) {
      handleCloseOrderActionMenu();
      return;
    }

    navigate(`${ROUTE_PATH.EXCHANGE}?orderId=${encodeURIComponent(orderActionMenuOrder.id)}`);
    handleCloseOrderActionMenu();
  }, [handleCloseOrderActionMenu, navigate, orderActionMenuOrder]);

  const handleRequestAdjustFromMenu = useCallback(async () => {
    if (!orderActionMenuOrder) return;

    if (!ORDER_ADJUSTMENT_ALLOWED_STATUSES.includes(orderActionMenuOrder.status)) {
      showSnackbar({
        type: SnackbarType.WARNING,
        message: ORDER_ADJUSTMENT_BLOCKED_STATUS_MESSAGE,
      });
      handleCloseOrderActionMenu();
      return;
    }

    const orderIdToAdjust = orderActionMenuOrder.id;
    handleCloseOrderActionMenu();

    try {
      await recallOrder(orderIdToAdjust);
      setReloadToken((t) => t + 1);
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã gửi lệnh thu hồi đơn.' });
    } catch (error) {
      showSnackbar({
        type: SnackbarType.ERROR,
        message: (error as { message?: string })?.message || 'Không thể tạo lệnh thu hồi đơn. Vui lòng thử lại.',
      });
    }
  }, [handleCloseOrderActionMenu, orderActionMenuOrder, showSnackbar]);

  const handleRequestCancelFromMenu = useCallback(() => {
    if (!orderActionMenuOrder) return;

    if (!isOrderCancellableStatus(orderActionMenuOrder.status)) {
      showSnackbar({
        type: SnackbarType.WARNING,
        message: ORDER_CANCEL_BLOCKED_STATUS_MESSAGE,
      });
      handleCloseOrderActionMenu();
      return;
    }

    setCancelConfirmOrder(orderActionMenuOrder);
    handleCloseOrderActionMenu();
  }, [handleCloseOrderActionMenu, orderActionMenuOrder, showSnackbar]);

  const handleCloseCancelConfirmDialog = useCallback(() => {
    if (cancelConfirmSubmitting) return;
    setCancelConfirmOrder(null);
  }, [cancelConfirmSubmitting]);

  const handleConfirmCancelFromMenu = useCallback(
    async (payload: { reason: string }) => {
      if (!cancelConfirmOrder) return;
      setCancelConfirmSubmitting(true);
      try {
        const note = payload.reason.trim();
        await cancelOrder(cancelConfirmOrder.id, {
          cancellationReason: OrderCancellationReason.OTHER,
          ...(note ? { note } : {}),
        });

        setCancelConfirmOrder(null);
        setReloadToken((currentToken) => currentToken + 1);
        setSelectedOrderIds((currentSelection) => currentSelection.filter((id) => id !== cancelConfirmOrder.id));
        showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã hủy đơn hàng.' });
      } catch (error) {
        showSnackbar({
          type: SnackbarType.ERROR,
          message: (error as { message?: string })?.message || 'Không hủy được đơn.',
        });
      } finally {
        setCancelConfirmSubmitting(false);
      }
    },
    [cancelConfirmOrder, showSnackbar],
  );

  /** Đóng cancel dialog và trigger reload — dùng cho luồng "Hủy + Hoàn tiền" sau khi cả 2 bước thành công. */
  const handleCancelOrderRefundSuccess = useCallback(() => {
    setCancelConfirmOrder(null);
    setReloadToken((currentToken) => currentToken + 1);
    setSelectedOrderIds((currentSelection) => (cancelConfirmOrder ? currentSelection.filter((id) => id !== cancelConfirmOrder.id) : currentSelection));
  }, [cancelConfirmOrder]);

  const handleEditOrder = useCallback(
    (order: Order) => {
      if (order.status !== OrderStatus.PENDING) {
        showSnackbar({
          type: SnackbarType.WARNING,
          message: 'Chỉ chỉnh sửa khi đơn ở trạng thái Chờ xác nhận.',
        });
        return;
      }
      navigate(getOrderEditPath(order.id));
    },
    [navigate, showSnackbar],
  );

  const handleExportOrders = useCallback(
    /** rowMode `order`: nút Export (1 dòng = 1 đơn); `sku`: nút Export SKU (1 dòng = 1 dòng hàng). */
    async (type: 'all' | 'current-page' | 'selected', rowMode: 'order' | 'sku' = 'sku') => {
      if (exportSubmitting) return;

      if (isUnsupportedOrderExportStatusFilter(activeStatus)) {
        showSnackbar({
          type: SnackbarType.WARNING,
          message: 'Export chưa hỗ trợ tab Giao hỏa tốc. Vui lòng chuyển sang tab trạng thái khác.',
        });
        return;
      }

      if (type === 'selected' && !selectedOrderIds.length) {
        showSnackbar({
          type: SnackbarType.WARNING,
          message: 'Vui lòng chọn ít nhất một đơn hàng để export',
        });
        return;
      }

      if (type === 'selected') {
        const selectedOrders = visibleOrders.filter((order) => selectedOrderIds.includes(order.id));
        if (!selectedOrders.length) {
          showSnackbar({
            type: SnackbarType.WARNING,
            message: 'Không tìm thấy dữ liệu đơn đã chọn trên trang hiện tại. Hãy chọn lại hoặc đổi trang.',
          });
          return;
        }
      }

      if (type === 'current-page' && !visibleOrders.length) {
        showSnackbar({
          type: SnackbarType.WARNING,
          message: 'Không có dữ liệu để export ở trang hiện tại',
        });
        return;
      }

      setExportSubmitting(true);
      try {
        const topicConfigId = await resolveOrderExportTopicConfigId(rowMode === 'order' ? ORDER_SUMMARY_EXPORT_ROUTING_KEY : ORDER_EXPORT_ROUTING_KEY);
        const job = await importExportApi.postExportTopicConfigs(topicConfigId, {
          filters: buildOrderExportFiltersFromListState({
            page,
            pageSize,
            search: searchValue,
            activeStatus,
            selectedTimeOption,
            customDateRange,
            advancedFilters: appliedAdvancedFilters,
            scope: type,
            selectedOrderIds,
            visibleOrders,
          }),
        });

        const status = await importExportApi.waitImportExportJobFileUrl(job.jobId);
        const fileUrl = status.fileUrl?.trim();

        if (!fileUrl) {
          throw new Error('Export hoàn tất nhưng chưa có link tải file.');
        }
        await downloadRemoteFile(fileUrl, status.fileName?.trim() || (rowMode === 'order' ? 'export-don-hang.xlsx' : 'export-don-hang-sku.xlsx'));

        showSnackbar({
          type: SnackbarType.SUCCESS,
          message: 'Đã tải file export.',
        });
      } catch (error) {
        showSnackbar({
          type: SnackbarType.ERROR,
          message: getErrorMessage(error),
        });
      } finally {
        setExportSubmitting(false);
      }
    },
    [activeStatus, appliedAdvancedFilters, customDateRange, exportSubmitting, page, pageSize, searchValue, selectedOrderIds, selectedTimeOption, showSnackbar, visibleOrders],
  );

  const handleExportOrderCustomerFbo = useCallback(async () => {
    if (exportSubmitting) return;

    if (isUnsupportedOrderExportStatusFilter(activeStatus)) {
      showSnackbar({
        type: SnackbarType.WARNING,
        message: 'Export chưa hỗ trợ tab Giao hỏa tốc. Vui lòng chuyển sang tab trạng thái khác.',
      });
      return;
    }

    const scope: 'all' | 'selected' = selectedOrderIds.length ? 'selected' : 'all';

    if (scope === 'selected') {
      const selectedOrders = visibleOrders.filter((order) => selectedOrderIds.includes(order.id));
      if (!selectedOrders.length) {
        showSnackbar({
          type: SnackbarType.WARNING,
          message: 'Không tìm thấy dữ liệu đơn đã chọn trên trang hiện tại. Hãy chọn lại hoặc đổi trang.',
        });
        return;
      }
    }

    setExportSubmitting(true);
    try {
      const topicConfigId = await resolveOrderCustomerFboExportTopicConfigId();
      const job = await importExportApi.postExportTopicConfigs(topicConfigId, {
        filters: buildOrderCustomerFboExportFiltersFromListState({
          page,
          pageSize,
          search: searchValue,
          activeStatus,
          selectedTimeOption,
          customDateRange,
          advancedFilters: appliedAdvancedFilters,
          scope,
          selectedOrderIds,
          visibleOrders,
        }),
      });

      const status = await importExportApi.waitImportExportJobFileUrl(job.jobId);
      const fileUrl = status.fileUrl?.trim();

      if (!fileUrl) {
        throw new Error('Export hoàn tất nhưng chưa có link tải file.');
      }

      await downloadRemoteFile(fileUrl, status.fileName?.trim() || 'Danh_muc_khach_hang.xlsx');

      showSnackbar({
        type: SnackbarType.SUCCESS,
        message: 'Đã tải file Export khách hàng cho FBO.',
      });
    } catch (error) {
      showSnackbar({
        type: SnackbarType.ERROR,
        message: getErrorMessage(error),
      });
    } finally {
      setExportSubmitting(false);
    }
  }, [activeStatus, appliedAdvancedFilters, customDateRange, exportSubmitting, page, pageSize, searchValue, selectedOrderIds, selectedTimeOption, showSnackbar, visibleOrders]);

  const handleExportOrderFastFbo = useCallback(async () => {
    if (exportSubmitting) return;

    if (isUnsupportedOrderExportStatusFilter(activeStatus)) {
      showSnackbar({
        type: SnackbarType.WARNING,
        message: 'Export chưa hỗ trợ tab Giao hỏa tốc. Vui lòng chuyển sang tab trạng thái khác.',
      });
      return;
    }

    const scope: 'all' | 'selected' = selectedOrderIds.length ? 'selected' : 'all';

    if (scope === 'selected') {
      const selectedOrders = visibleOrders.filter((order) => selectedOrderIds.includes(order.id));
      if (!selectedOrders.length) {
        showSnackbar({
          type: SnackbarType.WARNING,
          message: 'Không tìm thấy dữ liệu đơn đã chọn trên trang hiện tại. Hãy chọn lại hoặc đổi trang.',
        });
        return;
      }
    }

    setExportSubmitting(true);
    try {
      const topicConfigId = await resolveOrderFastInvoiceExportTopicConfigId();
      const job = await importExportApi.postExportTopicConfigs(topicConfigId, {
        filters: buildOrderFastInvoiceExportFiltersFromListState({
          page,
          pageSize,
          search: searchValue,
          activeStatus,
          selectedTimeOption,
          customDateRange,
          advancedFilters: appliedAdvancedFilters,
          scope,
          selectedOrderIds,
          visibleOrders,
        }),
      });

      const status = await importExportApi.waitImportExportJobFileUrl(job.jobId);
      const fileUrl = status.fileUrl?.trim();

      if (!fileUrl) {
        throw new Error('Export hoàn tất nhưng chưa có link tải file.');
      }

      await downloadRemoteFile(fileUrl, status.fileName?.trim() || 'Hoa_don_ban_hang.xlsx');

      showSnackbar({
        type: SnackbarType.SUCCESS,
        message: 'Đã tải file Export đơn hàng cho Fast FBO.',
      });
    } catch (error) {
      showSnackbar({
        type: SnackbarType.ERROR,
        message: getErrorMessage(error),
      });
    } finally {
      setExportSubmitting(false);
    }
  }, [activeStatus, appliedAdvancedFilters, customDateRange, exportSubmitting, page, pageSize, searchValue, selectedOrderIds, selectedTimeOption, showSnackbar, visibleOrders]);

  const columns = useMemo(
    () =>
      getOrderTableColumns({
        onCopyOrderCode: handleCopyOrderCode,
        onEditOrder: handleEditOrder,
        onViewOrder: (order) => navigate(getOrderDetailPath(order.id)),
        onMoreActions: handleOpenOrderActionMenu,
        onUpdateOrderShippingAddress: handleUpdateOrderShippingAddress,
        onSyncOrderShipment: handleSyncOrderShipment,
        syncingOrderId,
        canEditOrder: permissions.canEditOrder ?? true,
        canViewOrder: permissions.canViewOrder ?? true,
        canOpenMoreActions: permissions.canOpenMoreActions ?? true,
      }),
    [handleCopyOrderCode, handleEditOrder, handleOpenOrderActionMenu, handleSyncOrderShipment, handleUpdateOrderShippingAddress, navigate, permissions, syncingOrderId],
  );

  return {
    orders,
    visibleOrders,
    totalItems,
    isLoading: isLoading || exportSubmitting,
    activeStatus,
    setActiveStatus,
    searchValue,
    setSearchValue,
    selectedOrderIds,
    page,
    setPage,
    pageSize,
    setPageSize,
    sortField,
    sortDirection,
    customDateRange,
    setCustomDateRange,
    isTimeRangeDialogOpen,
    setIsTimeRangeDialogOpen,
    appliedAdvancedFilters,
    isAdvancedFilterDialogOpen,
    statusTabs,
    columns,
    selectedTimeLabel,
    selectedFilterLabel,
    setSelectedTimeOption,
    handleOpenAdvancedFilterDialog,
    showStubNotification,
    handleExportOrders,
    handleExportOrderCustomerFbo,
    handleExportOrderFastFbo,
    orderActionMenuAnchor,
    handleCloseOrderActionMenu,
    cloneConfirmOrder,
    cloneConfirmSubmitting,
    cancelConfirmOrder,
    cancelConfirmSubmitting,
    handleCloseCloneConfirmDialog,
    handleRequestCloneFromMenu,
    handleConfirmCloneFromMenu,
    handleCloseCancelConfirmDialog,
    handleRequestCancelFromMenu,
    handleConfirmCancelFromMenu,
    handleCancelOrderRefundSuccess,
    canCreateReturnExchangeFromMenu,
    handleCreateReturnExchangeFromMenu,
    canAdjustOrderFromMenu,
    canCancelOrderFromMenu,
    handleRequestAdjustFromMenu,
    handleSortChange,
    handleToggleSelectAll,
    handleToggleSelectOrder,
    handleCloseAdvancedFilterDialog,
    handleApplyAdvancedFilters,
    handleApplyTimeRange,
  };
};

