import type { Dayjs } from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as importExportApi from '../apis/import-export/import-export.api';
import { getShipmentList, type IShipmentListResponse } from '../apis/shipment';
import { downloadRemoteFile } from '../common/helpers';
import { copyTextToClipboard, getCopyFailureMessage, getCopySuccessMessage } from '../common/utils';
import { getErrorMessage } from '../common/utils/string.utils';
import type { DataTableStatusTab } from '../components/data-table';
import { SnackbarType, useSnackbar } from './use-snackbar.hook';
import { ROUTE_PATH, getOrderDetailPath } from '@/trading-ui/router/route.path';
import { createEmptyStatusCounts, mapApiShipmentListItemToShipment, mapShipmentSummaryToStatusCounts } from '../pages/shipping/shipping.mapper';
import { SHIPPING_STATUS_OPTIONS, SHIPPING_TRACKING_TAB_FILTER_MAP } from '../pages/shipping/shipping.constants';
import { buildShipmentExportFiltersFromListState, resolveShipmentExportTopicConfigId } from '../pages/shipping/shipment-export.util';
import type { OrderTimeOptionValue } from '../pages/order/order.types';
import { buildOrderTimeFilterPayload, formatTimeFilterLabel } from '../components/time-filter/shared-time-filter';
import { usePermissionContext } from '../permissions/permission.context';
import { ORDER_LIST_PAGE_SCOPE } from '../pages/order/order-permission.constants';
import type { Shipment, ShipmentSortField, ShipmentStatusFilter, SortDirection } from '../pages/shipping/shipping.types';
import { sortShipments } from '../pages/shipping/shipping.utils';
import { getShipmentTableColumns } from '../pages/shipping/shipping-table';

type ShipmentDataPageOptions = {
  canViewList?: boolean;
};

export const useShipmentDataPage = (options: ShipmentDataPageOptions = {}) => {
  const canViewList = options.canViewList ?? true;
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { canAccessAction, hasApiAccess } = usePermissionContext();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [statusCounts, setStatusCounts] = useState<Record<ShipmentStatusFilter, number>>(createEmptyStatusCounts);
  const [activeStatus, setActiveStatus] = useState<ShipmentStatusFilter>('all');
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortField, setSortField] = useState<ShipmentSortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedShipmentIds, setSelectedShipmentIds] = useState<string[]>([]);
  const [selectedTimeOption, setSelectedTimeOption] = useState<OrderTimeOptionValue | null>(null);
  const [customDateRange, setCustomDateRange] = useState<{ from: Dayjs; to: Dayjs } | null>(null);
  const [isTimeRangeDialogOpen, setIsTimeRangeDialogOpen] = useState(false);

  const visibleShipments = useMemo(() => {
    if (!sortField) return shipments;
    return sortShipments(shipments, sortField, sortDirection);
  }, [shipments, sortDirection, sortField]);
  const selectedTimeLabel = useMemo(() => formatTimeFilterLabel(selectedTimeOption, customDateRange), [customDateRange, selectedTimeOption]);
  const timeFilterPayload = useMemo(() => buildOrderTimeFilterPayload(selectedTimeOption, customDateRange), [customDateRange, selectedTimeOption]);

  const statusTabs = useMemo<Array<DataTableStatusTab<ShipmentStatusFilter>>>(() => {
    return SHIPPING_STATUS_OPTIONS.map((option) => ({
      value: option.value,
      label: option.label,
      count: statusCounts[option.value] || 0,
    }));
  }, [statusCounts]);

  useEffect(() => {
    setPage(1);
  }, [activeStatus, searchValue, pageSize, selectedTimeOption, customDateRange]);

  useEffect(() => {
    setSelectedShipmentIds([]);
  }, [activeStatus, searchValue, page, pageSize, selectedTimeOption, customDateRange]);

  const handleSortChange = useCallback((field: ShipmentSortField) => {
    setSortField((current) => {
      if (current === field) {
        setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'));
        return current;
      }
      setSortDirection('desc');
      return field;
    });
  }, []);

  const handleCopyTrackingCode = useCallback(
    async (shipment: Shipment) => {
      const copied = await copyTextToClipboard(shipment.trackingCode);
      showSnackbar({
        type: copied ? SnackbarType.SUCCESS : SnackbarType.ERROR,
        message: copied ? getCopySuccessMessage(shipment.trackingCode, 'Đã sao chép') : getCopyFailureMessage('mã vận đơn'),
      });
    },
    [showSnackbar],
  );

  const handleCopyOrderCode = useCallback(
    async (shipment: Shipment) => {
      const copied = await copyTextToClipboard(shipment.orderCode);
      showSnackbar({
        type: copied ? SnackbarType.SUCCESS : SnackbarType.ERROR,
        message: copied ? getCopySuccessMessage(shipment.orderCode, 'Đã sao chép') : getCopyFailureMessage('mã đơn hàng'),
      });
    },
    [showSnackbar],
  );

  const handleViewOrder = useCallback(
    (shipment: Shipment) => {
      navigate(getOrderDetailPath(shipment.orderId), {
        state: { fromPage: ROUTE_PATH.SHIPPING },
      });
    },
    [navigate],
  );

  // Link đích là trang Chi tiết đơn hàng (route guard: order.list.open_detail) — không phải action của tab shipping.
  const canViewOrder = canAccessAction(ORDER_LIST_PAGE_SCOPE.menuCode, ORDER_LIST_PAGE_SCOPE.tabCode, 'open_detail') && hasApiAccess('api_order_detail');

  const columns = useMemo(
    () =>
      getShipmentTableColumns({
        canViewOrder,
        onCopyOrderCode: handleCopyOrderCode,
        onCopyTrackingCode: handleCopyTrackingCode,
        onViewOrder: handleViewOrder,
      }),
    [canViewOrder, handleCopyOrderCode, handleCopyTrackingCode, handleViewOrder],
  );

  useEffect(() => {
    if (!canViewList) return;

    let isMounted = true;

    const fetchShipments = async () => {
      setIsLoading(true);
      try {
        const response = (await getShipmentList({
          page,
          take: pageSize,
          search: searchValue.trim() || undefined,
          trackingTab: SHIPPING_TRACKING_TAB_FILTER_MAP[activeStatus],
          ...timeFilterPayload,
        })) as IShipmentListResponse;

        if (!isMounted) return;

        setShipments(response.list.map(mapApiShipmentListItemToShipment));
        setTotalItems(response.total ?? 0);
        setStatusCounts(mapShipmentSummaryToStatusCounts(response.summary));
      } catch {
        if (!isMounted) return;
        setShipments([]);
        setTotalItems(0);
        setStatusCounts(createEmptyStatusCounts());
        showSnackbar({
          type: SnackbarType.ERROR,
          message: 'Không thể tải danh sách vận đơn. Vui lòng thử lại.',
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchShipments();

    return () => {
      isMounted = false;
    };
  }, [activeStatus, page, pageSize, searchValue, showSnackbar, timeFilterPayload, canViewList]);

  const handleToggleSelectShipment = useCallback((shipmentId: string, checked: boolean) => {
    setSelectedShipmentIds((currentSelection) => {
      if (checked) {
        return currentSelection.includes(shipmentId) ? currentSelection : [...currentSelection, shipmentId];
      }
      return currentSelection.filter((currentShipmentId) => currentShipmentId !== shipmentId);
    });
  }, []);

  const handleToggleSelectAll = useCallback((checked: boolean, currentRows: Shipment[]) => {
    const visibleShipmentIds = currentRows.map((shipment) => shipment.id);
    setSelectedShipmentIds((currentSelection) => {
      if (checked) {
        return Array.from(new Set([...currentSelection, ...visibleShipmentIds]));
      }
      return currentSelection.filter((shipmentId) => !visibleShipmentIds.includes(shipmentId));
    });
  }, []);

  const handleExportShipments = useCallback(
    async (type: 'all' | 'current-page' | 'selected') => {
      if (type === 'selected' && !selectedShipmentIds.length) {
        showSnackbar({ type: SnackbarType.WARNING, message: 'Vui lòng chọn ít nhất một vận đơn để export' });
        return;
      }

      if (type === 'selected') {
        const selectedShipments = visibleShipments.filter((shipment) => selectedShipmentIds.includes(shipment.id));
        if (!selectedShipments.length) {
          showSnackbar({
            type: SnackbarType.WARNING,
            message: 'Không tìm thấy dữ liệu vận đơn đã chọn trên trang hiện tại. Hãy chọn lại hoặc đổi trang.',
          });
          return;
        }
      }

      if (type === 'current-page' && !visibleShipments.length) {
        showSnackbar({ type: SnackbarType.WARNING, message: 'Không có dữ liệu để export ở trang hiện tại' });
        return;
      }

      try {
        setIsLoading(true);
        const topicConfigId = await resolveShipmentExportTopicConfigId();
        const job = await importExportApi.postExportTopicConfigs(topicConfigId, {
          filters: buildShipmentExportFiltersFromListState({
            page,
            pageSize,
            search: searchValue,
            activeStatus,
            selectedTimeOption,
            customDateRange,
            scope: type,
            selectedShipmentIds,
            visibleShipments,
          }),
        });

        const status = await importExportApi.waitImportExportJobFileUrl(job.jobId);
        const fileUrl = status.fileUrl?.trim();
        if (!fileUrl) {
          throw new Error('Export hoàn tất nhưng chưa có link tải file.');
        }

        await downloadRemoteFile(fileUrl, status.fileName?.trim() || 'export-van-don.xlsx');
        showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã tải file export.' });
      } catch (error) {
        showSnackbar({
          type: SnackbarType.ERROR,
          message: getErrorMessage(error) || 'Export vận đơn thất bại',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [activeStatus, customDateRange, page, pageSize, searchValue, selectedShipmentIds, selectedTimeOption, showSnackbar, visibleShipments],
  );

  return {
    activeStatus,
    columns,
    isLoading,
    page,
    pageSize,
    searchValue,
    selectedShipmentIds,
    selectedTimeLabel,
    selectedTimeOption,
    customDateRange,
    isTimeRangeDialogOpen,
    statusTabs,
    totalItems,
    visibleShipments,
    sortField,
    sortDirection,
    setActiveStatus,
    setPage,
    setPageSize,
    setSearchValue,
    setSelectedTimeOption,
    setCustomDateRange,
    setIsTimeRangeDialogOpen,
    handleSortChange,
    handleToggleSelectAll,
    handleToggleSelectShipment,
    handleExportShipments,
  };
};
