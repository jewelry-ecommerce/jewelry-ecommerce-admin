import { AddRounded, FileDownloadOutlined, FileUploadOutlined, FilterListOutlined, KeyboardArrowDownRounded, TaskAltOutlined } from '@mui/icons-material';
import { Box, Stack, TextField, Typography } from '@mui/material';
import { Archive, CheckCircleBroken, Edit02, Eye, FlipBackward, Globe01, RefreshCcw01, Send01, XCircle } from '@untitledui/icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { STYLE } from '@/trading-ui/adapters/library';
import { isJavaBackend } from '@/common/config/app.config';
import { JAVA_PRODUCT_IE, javaDownloadProductTemplate } from '@/apis/java/java-product-ie.api';
import useSWR from 'swr';
import {
  categoryApi,
  importExportApi,
  productApi,
  type AdminProductTimeFilter,
  JobProcessStatus,
  ProductApprovalActionType,
  ProductApprovalStatus,
  ProductSpuStatus,
  TopicAction,
  type Product,
  type QueryAdminProductDto,
} from '../../../../apis';
import { OrderType } from '../../../../apis/order';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { PAGE_TAKE_DEFAULT } from '../../../../common/constant/page-take.constant';
import { getErrorMessage } from '../../../../common/utils';
import { DataTable, type DataTableColumn, DataTablePagination, DataTableStatusTabs, DataTableToolbar, type DataTableToolbarAction } from '../../../../components/data-table';
import { DialogConfirmComponent } from '../../../../components/dialog';
import { EmptyComponent } from '../../../../components/empty/empty.component';
import { LoadingComponent } from '../../../../components/loading/loading.component';
import { StackRowAlignJustCenter } from '../../../../components/styled';
import { TagCommonComponent } from '../../../../components/tag';
import { OrderTimeCustomRangeDialog, createSharedTimeFilterToolbarAction, formatTimeFilterLabel, type SharedTimeRange } from '../../../../components/time-filter/shared-time-filter';
import { TooltipOnHoverComponent } from '../../../../components/tooltip/tooltip-on-hover.component';
import { WrapperComponent } from '../../../../components/wrapper';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { LABEL_CONTENT_PAGE_SIZE_OPTIONS } from '../../../content-display/label/label-content/label-content.constants';
import { OrderTimeFilter } from '../../../../apis/order';
import { getProductSpuDetailPath, getProductSpuUpdatePath, ROUTE_PATH } from '@/trading-ui/router/route.path';
import { ProductSpuAdvancedFilterDialog } from '../components/product-spu-advanced-filter-dialog.component';
import { ProductSpuImportDialog } from '../components/product-spu-import-dialog.component';
import { ProductSpuListBulkToolbar, type ProductSpuListBulkToolbarSegment } from '../components/product-spu-list-bulk-toolbar.component';
import { ProductSpuTaskManagerDrawer } from '../components/product-spu-task-manager-drawer.component';
import { getProductApprovalStatusLabelVi, getProductLifecycleStatusLabelVi, PRODUCT_SPU_APPROVAL_STATUS_TABS, PRODUCT_SPU_DEFAULT_IMAGE_SRC } from '../product-spu.constant';
import type { ProductSpuAdvancedFilters } from '../product-spu.interface';
import {
  buildAdminProductListTimeParams,
  buildProductExportFiltersFromListQuery,
  countActiveProductSpuAdvancedFilters,
  findProductSpuPriceRangeKeyFromMinMax,
  productSpuPriceRangeKeyToMinMax,
  type ProductListExportScope,
} from '../utils/product-spu-list-query.utils';
import { resolveProductVariationFboExportTopicConfigId } from '../utils/product-variation-fbo-export.util';
import { downloadRemoteFile } from '../../../../common/helpers';
import { applyProductSpuListUrlStateToScreen, buildProductSpuListSearchParams, parseProductSpuListUrlState, productSpuListUrlHasFilters } from '../utils/product-spu-list-url.utils';
import { buildProductSpuListReturnState } from '../utils/product-spu-list-navigation.util';
import { CategoryStatus } from '../../../../apis/category/category.enum';
import { PermissionIconButton } from '../../../../components/button';
import { useListPageViewAccess } from '../../../../permissions/use-list-page-view-access.hook';
import { PRODUCT_LIST_PAGE_SCOPE, productListButtonPermission } from '../../product-permission.constants';

const PRODUCT_SPU_EDIT_DISABLED_PENDING_MESSAGE = 'Sản phẩm đang có yêu cầu cho duyệt.';

type ProductSpuListQueryState = QueryAdminProductDto & {
  status?: ProductSpuStatus;
  approvalStatus?: ProductApprovalStatus;
  minPrice?: number;
  maxPrice?: number;
  timeFilter?: AdminProductTimeFilter;
  timeFrom?: string;
  timeTo?: string;
};

type ProductListTab = '' | ProductSpuStatus | ProductApprovalStatus;

const isApprovalStatusTab = (value: ProductListTab): value is ProductApprovalStatus => Object.values(ProductApprovalStatus).includes(value as ProductApprovalStatus);

interface ProductApprovalReviewItemRow {
  productUuid: string;
  approvalRequestUuid: string;
}

const ProductSpuListPage = () => {
  const canViewList = useListPageViewAccess(PRODUCT_LIST_PAGE_SCOPE, { listApiCode: 'api_product_list' });
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSnackbar } = useSnackbar();
  const didHydrateListFromUrl = useRef(false);
  const skipNextUrlSync = useRef(false);

  const [screenState, setScreenState] = useState<ProductSpuListQueryState>({
    ...PAGE_TAKE_DEFAULT,
    search: '',
  });
  const [selectedTimeOption, setSelectedTimeOption] = useState<OrderTimeFilter | null>(null);
  const [customDateRange, setCustomDateRange] = useState<SharedTimeRange>(null);
  const [timeRangeDialogOpen, setTimeRangeDialogOpen] = useState(false);
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [taskManagerOpen, setTaskManagerOpen] = useState(false);
  const [importSubmitting, setImportSubmitting] = useState(false);
  const [exportSubmitting, setExportSubmitting] = useState(false);
  const productExportInFlightRef = useRef(false);
  const [importKnownFileNames, setImportKnownFileNames] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<ProductListTab>('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [rejectReason, setRejectReason] = useState('');
  const [approveDialog, setApproveDialog] = useState({ toggle: false });
  const [rejectDialog, setRejectDialog] = useState({ toggle: false });
  const [cancelApprovalDialog, setCancelApprovalDialog] = useState({ toggle: false });
  const [submitApprovalDialog, setSubmitApprovalDialog] = useState({ toggle: false });
  const [archiveBulkDialog, setArchiveBulkDialog] = useState({ toggle: false });
  const [publishBulkDialog, setPublishBulkDialog] = useState({ toggle: false });
  const [discontinueBulkDialog, setDiscontinueBulkDialog] = useState({ toggle: false });
  const [restoreBulkDialog, setRestoreBulkDialog] = useState({ toggle: false });
  const [restoreDiscontinuedBulkDialog, setRestoreDiscontinuedBulkDialog] = useState({
    toggle: false,
  });
  const [approvalBulkLoading, setApprovalBulkLoading] = useState(false);
  const [lifecycleBulkLoading, setLifecycleBulkLoading] = useState(false);

  useEffect(() => {
    if (didHydrateListFromUrl.current) return;
    didHydrateListFromUrl.current = true;
    if (!productSpuListUrlHasFilters(searchParams)) return;

    const hydrated = applyProductSpuListUrlStateToScreen(parseProductSpuListUrlState(searchParams));
    skipNextUrlSync.current = true;
    setScreenState((prev) => ({ ...prev, ...hydrated.screenState }));
    setActiveTab(hydrated.activeTab as ProductListTab);
    setSelectedTimeOption(hydrated.selectedTimeOption);
    setCustomDateRange(hydrated.customDateRange);
  }, [searchParams]);

  const listQueryParams = useMemo((): ProductSpuListQueryState => {
    const timeParams = buildAdminProductListTimeParams(selectedTimeOption, customDateRange);
    const tabApprovalStatus = isApprovalStatusTab(activeTab) ? activeTab : undefined;
    const tabStatus = activeTab && !tabApprovalStatus ? (activeTab as ProductSpuStatus) : undefined;
    const advancedStatus = screenState.status && screenState.status !== ProductSpuStatus.ALL ? screenState.status : undefined;
    const advancedApprovalStatus = screenState.approvalStatus || undefined;

    return {
      ...screenState,
      ...(timeParams as Pick<ProductSpuListQueryState, 'timeFilter' | 'timeFrom' | 'timeTo'>),
      search: screenState.search?.trim() || undefined,
      status: tabApprovalStatus ? undefined : (tabStatus ?? advancedStatus),
      approvalStatus: tabApprovalStatus ?? advancedApprovalStatus,
      hasPendingApproval: undefined,
      isPagination: true,
      orderBy: 'updatedAt',
      orderType: OrderType.DESC,
    };
  }, [activeTab, customDateRange, screenState, selectedTimeOption]);

  useEffect(() => {
    if (skipNextUrlSync.current) {
      skipNextUrlSync.current = false;
      return;
    }

    const nextParams = buildProductSpuListSearchParams({
      page: Number(screenState.page) || PAGE_TAKE_DEFAULT.page,
      take: Number(screenState.take) || PAGE_TAKE_DEFAULT.take,
      search: screenState.search ?? '',
      activeTab,
      selectedTimeOption,
      customDateRange,
      advancedFilters: {
        categoryUuid: screenState.categoryUuid ?? '',
        priceRangeKey: findProductSpuPriceRangeKeyFromMinMax(screenState.minPrice, screenState.maxPrice),
        status: screenState.status ?? ProductSpuStatus.ALL,
        approvalStatus: screenState.approvalStatus ?? '',
      },
    });
    const nextQuery = nextParams.toString();
    if (nextQuery === searchParams.toString()) return;
    setSearchParams(nextParams, { replace: true });
  }, [
    activeTab,
    customDateRange,
    screenState.approvalStatus,
    screenState.categoryUuid,
    screenState.maxPrice,
    screenState.minPrice,
    screenState.page,
    screenState.search,
    screenState.status,
    screenState.take,
    searchParams,
    selectedTimeOption,
    setSearchParams,
  ]);

  const productListReturnState = useMemo(() => buildProductSpuListReturnState(location.pathname, location.search), [location.pathname, location.search]);

  const { data: categoryListRes } = useSWR(
    advancedFilterOpen ? (['product/admin/categories', 'filter-dropdown'] as const) : null,
    () => categoryApi.getCategoryTree({ compact: true, status: CategoryStatus.ACTIVE }),
    {
      revalidateOnFocus: false,
    },
  );
  const ieTopicConfigsEnabled = !isJavaBackend() && (importOpen || taskManagerOpen);
  const { data: ieTopicConfigs } = useSWR(ieTopicConfigsEnabled ? (['ie', 'topic-configs'] as const) : null, () => importExportApi.getImportExportTopicConfigs(), { revalidateOnFocus: false });
  const productImportTopicConfigId = useMemo(() => isJavaBackend() ? JAVA_PRODUCT_IE.importTopic : ieTopicConfigs?.find((c) => c.routingKey === 'import.product')?.id ?? ieTopicConfigs?.[0]?.id ?? null, [ieTopicConfigs]);
  const productExportTopicConfigId = useMemo(
    () =>
      isJavaBackend() ? JAVA_PRODUCT_IE.exportTopic : ieTopicConfigs?.find((c) => c.routingKey === 'export.product' && c.workerQueueProfile?.action === TopicAction.EXPORT)?.id ??
      ieTopicConfigs?.find((c) => c.workerQueueProfile?.action === TopicAction.EXPORT)?.id ??
      null,
    [ieTopicConfigs],
  );

  const resolveProductImportTopicConfigId = useCallback(async (): Promise<string | null> => {
    if (productImportTopicConfigId) return productImportTopicConfigId;
    const configs = await importExportApi.getImportExportTopicConfigs();
    return configs.find((c) => c.routingKey === 'import.product')?.id ?? configs[0]?.id ?? null;
  }, [productImportTopicConfigId]);

  const resolveProductExportTopicConfigId = useCallback(async (): Promise<string | null> => {
    if (productExportTopicConfigId) return productExportTopicConfigId;
    const configs = await importExportApi.getImportExportTopicConfigs();
    return (
      configs.find((c) => c.routingKey === 'export.product' && c.workerQueueProfile?.action === TopicAction.EXPORT)?.id ??
      configs.find((c) => c.workerQueueProfile?.action === TopicAction.EXPORT)?.id ??
      null
    );
  }, [productExportTopicConfigId]);

  const {
    data: ieJobsRes,
    mutate: mutateIeJobs,
    isLoading: ieJobsLoading,
  } = useSWR(
    taskManagerOpen && productImportTopicConfigId ? (['ie', 'jobs', productImportTopicConfigId, 1, 50] as const) : null,
    () =>
      importExportApi.getImportExportListJobs({
        topicConfigId: productImportTopicConfigId!,
        isPagination: true,
      }),
    {
      revalidateOnFocus: false,
      // Do not use SWR refreshInterval(fn) that returns >0 when data is undefined —
      // that schedules a redundant 2nd jobs fetch right after the initial load.
      refreshInterval: 0,
    },
  );

  const hasActiveIeJobs = useMemo(() => {
    const list = ieJobsRes?.list ?? [];
    return list.some((job) => job.status === JobProcessStatus.PENDING || job.status === JobProcessStatus.PROCESSING);
  }, [ieJobsRes?.list]);

  useEffect(() => {
    if (!taskManagerOpen || !hasActiveIeJobs) return;
    const timerId = window.setInterval(() => {
      void mutateIeJobs();
    }, 2500);
    return () => window.clearInterval(timerId);
  }, [hasActiveIeJobs, mutateIeJobs, taskManagerOpen]);

  const taskManagerJobsLoading = taskManagerOpen && (ieTopicConfigs === undefined || (Boolean(productImportTopicConfigId) && ieJobsLoading));

  const productsSwr = useSWR(
    ['product/admin', JSON.stringify(listQueryParams)] as const,
    () =>
      productApi.getAdminProductList({
        ...listQueryParams,
        page: Number(listQueryParams.page) || PAGE_TAKE_DEFAULT.page,
        take: Number(listQueryParams.take) || PAGE_TAKE_DEFAULT.take,
      }),
    { revalidateOnFocus: false, keepPreviousData: true },
  );

  const openTaskManager = useCallback(() => {
    setTaskManagerOpen(true);
  }, []);

  const rows = (productsSwr.data?.list ?? []) as Product[];
  const totalItems = productsSwr.data?.total ?? productsSwr.data?.pagination?.total ?? 0;
  const counts = productsSwr.data?.counts ?? {
    all: totalItems,
    draft: 0,
    unpublished: 0,
    published: 0,
    discontinued: 0,
    archived: 0,
    hasPendingApproval: 0,
    approvalApproved: 0,
    approvalRejected: 0,
    approvalCancelled: 0,
  };
  const approvalStatusTabCounts = useMemo<Record<ProductApprovalStatus, number>>(
    () => ({
      [ProductApprovalStatus.PENDING]: counts.hasPendingApproval,
      [ProductApprovalStatus.APPROVED]: counts.approvalApproved,
      [ProductApprovalStatus.REJECTED]: counts.approvalRejected,
      [ProductApprovalStatus.CANCELLED]: counts.approvalCancelled,
    }),
    [counts],
  );

  const categoryOptions = useMemo(() => (categoryListRes ?? []).map((category) => ({ value: category.id, label: category.name })), [categoryListRes]);
  const advancedFilterValue = useMemo<ProductSpuAdvancedFilters>(
    () => ({
      categoryUuid: screenState.categoryUuid ?? '',
      priceRangeKey: findProductSpuPriceRangeKeyFromMinMax(screenState.minPrice, screenState.maxPrice),
      status: screenState.status ?? ProductSpuStatus.ALL,
      approvalStatus: screenState.approvalStatus ?? '',
    }),
    [screenState.approvalStatus, screenState.categoryUuid, screenState.maxPrice, screenState.minPrice, screenState.status],
  );

  const selectedFilterLabel = useMemo(() => {
    const activeFilterCount = countActiveProductSpuAdvancedFilters(advancedFilterValue);
    return activeFilterCount > 0 ? `Bộ lọc (${activeFilterCount})` : 'Bộ lọc';
  }, [advancedFilterValue]);

  const pendingRowsOnPage = useMemo(() => rows.filter((row) => row.approval?.hasPending && row.approval.requestId), [rows]);

  const draftRowsOnPage = useMemo(() => rows.filter((row) => row.status === ProductSpuStatus.DRAFT && !row.approval?.hasPending), [rows]);

  const unpublishedRowsOnPage = useMemo(() => rows.filter((row) => row.status === ProductSpuStatus.UNPUBLISHED && !row.approval?.hasPending), [rows]);

  const publishedRowsOnPage = useMemo(() => rows.filter((row) => row.status === ProductSpuStatus.PUBLISHED && !row.approval?.hasPending), [rows]);

  const discontinuedRowsOnPage = useMemo(() => rows.filter((row) => row.status === ProductSpuStatus.DISCONTINUED && !row.approval?.hasPending), [rows]);

  const archivedRowsOnPage = useMemo(() => rows.filter((row) => row.status === ProductSpuStatus.ARCHIVED && !row.approval?.hasPending), [rows]);

  const selectedPendingIds = useMemo(() => selectedProductIds.filter((id) => pendingRowsOnPage.some((row) => row.id === id)), [pendingRowsOnPage, selectedProductIds]);

  const selectedDraftIds = useMemo(() => selectedProductIds.filter((id) => draftRowsOnPage.some((row) => row.id === id)), [draftRowsOnPage, selectedProductIds]);

  const selectedUnpublishedIds = useMemo(() => selectedProductIds.filter((id) => unpublishedRowsOnPage.some((row) => row.id === id)), [selectedProductIds, unpublishedRowsOnPage]);

  const selectedPublishedIds = useMemo(() => selectedProductIds.filter((id) => publishedRowsOnPage.some((row) => row.id === id)), [publishedRowsOnPage, selectedProductIds]);

  const selectedDiscontinuedIds = useMemo(() => selectedProductIds.filter((id) => discontinuedRowsOnPage.some((row) => row.id === id)), [discontinuedRowsOnPage, selectedProductIds]);

  const selectedArchivedIds = useMemo(() => selectedProductIds.filter((id) => archivedRowsOnPage.some((row) => row.id === id)), [archivedRowsOnPage, selectedProductIds]);

  const isAllPendingSelected = pendingRowsOnPage.length > 0 && pendingRowsOnPage.every((row) => selectedProductIds.includes(row.id));
  const isPendingSelectIndeterminate = pendingRowsOnPage.some((row) => selectedProductIds.includes(row.id)) && !isAllPendingSelected;

  const isAllDraftSelected = draftRowsOnPage.length > 0 && draftRowsOnPage.every((row) => selectedProductIds.includes(row.id));
  const isDraftSelectIndeterminate = draftRowsOnPage.some((row) => selectedProductIds.includes(row.id)) && !isAllDraftSelected;

  const isAllUnpublishedSelected = unpublishedRowsOnPage.length > 0 && unpublishedRowsOnPage.every((row) => selectedProductIds.includes(row.id));
  const isUnpublishedSelectIndeterminate = unpublishedRowsOnPage.some((row) => selectedProductIds.includes(row.id)) && !isAllUnpublishedSelected;

  const isAllPublishedSelected = publishedRowsOnPage.length > 0 && publishedRowsOnPage.every((row) => selectedProductIds.includes(row.id));
  const isPublishedSelectIndeterminate = publishedRowsOnPage.some((row) => selectedProductIds.includes(row.id)) && !isAllPublishedSelected;

  const isAllDiscontinuedSelected = discontinuedRowsOnPage.length > 0 && discontinuedRowsOnPage.every((row) => selectedProductIds.includes(row.id));
  const isDiscontinuedSelectIndeterminate = discontinuedRowsOnPage.some((row) => selectedProductIds.includes(row.id)) && !isAllDiscontinuedSelected;

  const isAllArchivedSelected = archivedRowsOnPage.length > 0 && archivedRowsOnPage.every((row) => selectedProductIds.includes(row.id));
  const isArchivedSelectIndeterminate = archivedRowsOnPage.some((row) => selectedProductIds.includes(row.id)) && !isAllArchivedSelected;

  const selectedTimeLabel = useMemo(() => formatTimeFilterLabel(selectedTimeOption, customDateRange), [customDateRange, selectedTimeOption]);

  const handleStartProductImport = useCallback(
    async (file: File) => {
      let importTopicConfigId: string | null;
      try {
        importTopicConfigId = await resolveProductImportTopicConfigId();
      } catch (err) {
        showSnackbar({ message: getErrorMessage(err), type: SnackbarType.ERROR });
        return;
      }
      if (!importTopicConfigId) {
        showSnackbar({
          type: SnackbarType.ERROR,
          message: 'Chưa có cấu hình import (topic-config). Vui lòng thử lại sau.',
        });
        return;
      }
      setImportSubmitting(true);
      try {
        const job = await importExportApi.postImportTopicConfigs(importTopicConfigId, file);
        setImportKnownFileNames((prev) => ({ ...prev, [job.jobId]: file.name }));
        setImportOpen(false);
        openTaskManager();
        showSnackbar({
          type: SnackbarType.SUCCESS,
          message: 'Đã gửi file import. Theo dõi tiến trình trong Trình quản lý tác vụ.',
        });
        await mutateIeJobs();
        if (isJavaBackend()) await productsSwr.mutate();
      } catch (err) {
        showSnackbar({ message: getErrorMessage(err), type: SnackbarType.ERROR });
      } finally {
        setImportSubmitting(false);
      }
    },
    [mutateIeJobs, openTaskManager, resolveProductImportTopicConfigId, showSnackbar, productsSwr],
  );

  const handleProductExport = useCallback(
    async (scope: ProductListExportScope) => {
      if (productExportInFlightRef.current) return;
      if (listQueryParams.approvalStatus) {
        showSnackbar({
          type: SnackbarType.WARNING,
          message: 'Export chưa hỗ trợ lọc theo trạng thái duyệt. Vui lòng chuyển sang tab trạng thái sản phẩm.',
        });
        return;
      }

      let exportTopicConfigId: string | null;
      try {
        exportTopicConfigId = await resolveProductExportTopicConfigId();
      } catch (err) {
        showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(err) });
        return;
      }
      if (!exportTopicConfigId) {
        showSnackbar({
          type: SnackbarType.ERROR,
          message: 'Chưa tải được cấu hình export. Thử lại sau vài giây.',
        });
        return;
      }

      if (scope !== 'all' && !rows.length) {
        showSnackbar({ type: SnackbarType.WARNING, message: 'Không có dữ liệu để export ở trang hiện tại' });
        return;
      }
      if (scope === 'selected' && !selectedProductIds.length) {
        showSnackbar({ type: SnackbarType.WARNING, message: 'Vui lòng chọn ít nhất một sản phẩm để export' });
        return;
      }

      productExportInFlightRef.current = true;
      setExportSubmitting(true);
      try {
        const job = await importExportApi.postExportTopicConfigs(exportTopicConfigId, {
          filters: buildProductExportFiltersFromListQuery(listQueryParams, scope, selectedProductIds),
        });
        const status = await importExportApi.waitImportExportJobFileUrl(job.jobId);
        const fileUrl = status.fileUrl!.trim();

        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = status.fileName?.trim() || 'export-san-pham.xlsx';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã tải file export.' });
      } catch (err) {
        showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(err) });
      } finally {
        productExportInFlightRef.current = false;
        setExportSubmitting(false);
      }
    },
    [listQueryParams, resolveProductExportTopicConfigId, rows.length, selectedProductIds, showSnackbar],
  );

  const handleProductVariationFboExport = useCallback(async () => {
    if (productExportInFlightRef.current) return;
    if (listQueryParams.approvalStatus) {
      showSnackbar({
        type: SnackbarType.WARNING,
        message: 'Export chưa hỗ trợ lọc theo trạng thái duyệt. Vui lòng chuyển sang tab trạng thái sản phẩm.',
      });
      return;
    }

    const scope: ProductListExportScope = selectedProductIds.length ? 'selected' : 'all';

    productExportInFlightRef.current = true;
    setExportSubmitting(true);
    try {
      const topicConfigId = await resolveProductVariationFboExportTopicConfigId();
      const job = await importExportApi.postExportTopicConfigs(topicConfigId, {
        filters: buildProductExportFiltersFromListQuery(listQueryParams, scope, selectedProductIds),
      });
      const status = await importExportApi.waitImportExportJobFileUrl(job.jobId);
      const fileUrl = status.fileUrl!.trim();
      await downloadRemoteFile(fileUrl, status.fileName?.trim() || 'Danh_Muc_Vat_Tu_FBO.xlsx');
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã tải file Export cho Fast FBO.' });
    } catch (err) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(err) });
    } finally {
      productExportInFlightRef.current = false;
      setExportSubmitting(false);
    }
  }, [listQueryParams, selectedProductIds, showSnackbar]);

  const buildApprovalReviewItems = useCallback(
    (ids: readonly string[]): ProductApprovalReviewItemRow[] =>
      ids
        .map((productUuid) => {
          const row = rows.find((item) => item.id === productUuid);
          return row?.approval?.requestId ? { productUuid, approvalRequestUuid: row.approval.requestId } : null;
        })
        .filter((item): item is ProductApprovalReviewItemRow => Boolean(item)),
    [rows],
  );

  const handleApplyTimeRange = useCallback((range: NonNullable<SharedTimeRange>) => {
    setCustomDateRange(range);
    setSelectedTimeOption(OrderTimeFilter.CUSTOM);
    setTimeRangeDialogOpen(false);
    setScreenState((prev) => ({ ...prev, page: PAGE_TAKE_DEFAULT.page }));
  }, []);

  const handleSelectTimePreset = useCallback((value: OrderTimeFilter) => {
    setSelectedTimeOption(value);
    setCustomDateRange(null);
    setScreenState((prev) => ({ ...prev, page: PAGE_TAKE_DEFAULT.page }));
  }, []);

  const handleToggleSelectAll = useCallback((checked: boolean, currentRows: Product[]) => {
    const ids = currentRows.map((row) => row.id);
    setSelectedProductIds((prev) => (checked ? Array.from(new Set([...prev, ...ids])) : prev.filter((id) => !ids.includes(id))));
  }, []);

  const handleConfirmApprove = useCallback(async () => {
    const items = buildApprovalReviewItems(selectedPendingIds);
    try {
      await productApi.postAdminProductApprovalReview({ items, decision: ProductApprovalActionType.APPROVE });
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã duyệt sản phẩm.' });
      setApproveDialog({ toggle: false });
      setSelectedProductIds([]);
      await productsSwr.mutate();
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    }
  }, [buildApprovalReviewItems, productsSwr, selectedPendingIds, showSnackbar]);

  const handleConfirmReject = useCallback(async () => {
    const reason = rejectReason.trim();
    if (!reason) return;

    const items = buildApprovalReviewItems(selectedPendingIds);
    try {
      await productApi.postAdminProductApprovalReview({
        items,
        reason,
        decision: ProductApprovalActionType.REJECT,
      });
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã từ chối yêu cầu duyệt.' });
      setRejectDialog({ toggle: false });
      setRejectReason('');
      setSelectedProductIds([]);
      await productsSwr.mutate();
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    }
  }, [buildApprovalReviewItems, productsSwr, rejectReason, selectedPendingIds, showSnackbar]);

  const handleConfirmCancelApprovalRequests = useCallback(async () => {
    const items = buildApprovalReviewItems(selectedPendingIds);
    setApprovalBulkLoading(true);
    try {
      await Promise.all(items.map((item) => productApi.postAdminProductApprovalCancel(item.approvalRequestUuid)));
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã hủy yêu cầu duyệt.' });
      setCancelApprovalDialog({ toggle: false });
      setSelectedProductIds([]);
      await productsSwr.mutate();
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setApprovalBulkLoading(false);
    }
  }, [buildApprovalReviewItems, productsSwr, selectedPendingIds, showSnackbar]);

  const handleConfirmSubmitApprovalRequests = useCallback(async () => {
    if (!selectedDraftIds.length) return;
    setApprovalBulkLoading(true);
    try {
      await Promise.all(selectedDraftIds.map((id) => productApi.postAdminProductSubmit(id)));
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã gửi yêu cầu duyệt.' });
      setSubmitApprovalDialog({ toggle: false });
      setSelectedProductIds([]);
      await productsSwr.mutate();
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setApprovalBulkLoading(false);
    }
  }, [productsSwr, selectedDraftIds, showSnackbar]);

  const handleConfirmBulkPublish = useCallback(async () => {
    if (!selectedUnpublishedIds.length) return;
    setLifecycleBulkLoading(true);
    try {
      await Promise.all(selectedUnpublishedIds.map((id) => productApi.patchAdminProductStatus(id, { status: ProductSpuStatus.PUBLISHED })));
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã xuất bản các sản phẩm đã chọn.' });
      setPublishBulkDialog({ toggle: false });
      setSelectedProductIds([]);
      await productsSwr.mutate();
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setLifecycleBulkLoading(false);
    }
  }, [productsSwr, selectedUnpublishedIds, showSnackbar]);

  const handleConfirmBulkDiscontinue = useCallback(async () => {
    if (!selectedPublishedIds.length) return;
    setLifecycleBulkLoading(true);
    try {
      await Promise.all(selectedPublishedIds.map((id) => productApi.patchAdminProductStatus(id, { status: ProductSpuStatus.DISCONTINUED })));
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã ngừng kinh doanh các sản phẩm đã chọn.' });
      setDiscontinueBulkDialog({ toggle: false });
      setSelectedProductIds([]);
      await productsSwr.mutate();
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setLifecycleBulkLoading(false);
    }
  }, [productsSwr, selectedPublishedIds, showSnackbar]);

  const handleConfirmBulkArchive = useCallback(async () => {
    if (!selectedPublishedIds.length) return;
    setLifecycleBulkLoading(true);
    try {
      await Promise.all(selectedPublishedIds.map((id) => productApi.patchAdminProductStatus(id, { status: ProductSpuStatus.ARCHIVED })));
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã lưu trữ các sản phẩm đã chọn.' });
      setArchiveBulkDialog({ toggle: false });
      setSelectedProductIds([]);
      await productsSwr.mutate();
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setLifecycleBulkLoading(false);
    }
  }, [productsSwr, selectedPublishedIds, showSnackbar]);

  const handleConfirmBulkRestorePublished = useCallback(async () => {
    if (!selectedDiscontinuedIds.length) return;
    setLifecycleBulkLoading(true);
    try {
      await Promise.all(selectedDiscontinuedIds.map((id) => productApi.patchAdminProductStatus(id, { status: ProductSpuStatus.PUBLISHED })));
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã khôi phục kinh doanh các sản phẩm đã chọn.' });
      setRestoreDiscontinuedBulkDialog({ toggle: false });
      setSelectedProductIds([]);
      await productsSwr.mutate();
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setLifecycleBulkLoading(false);
    }
  }, [productsSwr, selectedDiscontinuedIds, showSnackbar]);

  const handleConfirmBulkRestoreUnpublished = useCallback(async () => {
    if (!selectedArchivedIds.length) return;
    setLifecycleBulkLoading(true);
    try {
      await Promise.all(selectedArchivedIds.map((id) => productApi.patchAdminProductStatus(id, { status: ProductSpuStatus.UNPUBLISHED })));
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã khôi phục các sản phẩm (chưa xuất bản).' });
      setRestoreBulkDialog({ toggle: false });
      setSelectedProductIds([]);
      await productsSwr.mutate();
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setLifecycleBulkLoading(false);
    }
  }, [productsSwr, selectedArchivedIds, showSnackbar]);

  const toolbarActions = useMemo<DataTableToolbarAction[]>(
    () => [
      createSharedTimeFilterToolbarAction({
        selectedTimeLabel,
        onSelectCustom: () => setTimeRangeDialogOpen(true),
        onSelectPreset: handleSelectTimePreset,
      }),
      {
        key: 'filter',
        label: 'Bộ lọc',
        selectedOptionLabel: selectedFilterLabel,
        icon: <FilterListOutlined sx={{ fontSize: 18 }} />,
        onClick: () => setAdvancedFilterOpen(true),
      },
      {
        key: 'import',
        label: 'Import',
        variant: 'outlined',
        icon: <FileUploadOutlined sx={{ fontSize: 18 }} />,
        onClick: () => setImportOpen(true),
      },
      {
        key: 'export',
        label: 'Export',
        ...productListButtonPermission('export', 'Export danh sách sản phẩm', 'api_product_cost_export'),
        variant: 'outlined',
        icon: <FileDownloadOutlined sx={{ fontSize: 18 }} />,
        endIcon: <KeyboardArrowDownRounded sx={{ fontSize: 18 }} />,
        disabled: exportSubmitting,
        options: [
          { value: 'all', label: 'Export tất cả' },
          { value: 'current-page', label: 'Export trang hiện tại' },
          { value: 'selected', label: 'Export sản phẩm đã chọn' },
          { value: 'fast-fbo', label: 'Export cho Fast FBO' },
        ],
        onSelectOption: (value) => {
          if (value === 'fast-fbo') {
            void handleProductVariationFboExport();
            return;
          }
          if (value === 'all' || value === 'current-page' || value === 'selected') {
            void handleProductExport(value);
          }
        },
      },
      {
        key: 'add',
        label: 'Tạo sản phẩm',
        variant: 'contained',
        icon: <AddRounded sx={{ fontSize: 18 }} />,
        onClick: () => navigate(ROUTE_PATH.PRODUCT_SPU_CREATE),
      },
      {
        key: 'task-manager',
        label: 'Xem trình quản lý tác vụ',
        ...productListButtonPermission('task_manager', 'Xem trình quản lý tác vụ import', 'api_product_list'),
        icon: <TaskAltOutlined sx={{ fontSize: 18 }} />,
        onClick: () => openTaskManager(),
      },
    ],
    [exportSubmitting, handleProductExport, handleProductVariationFboExport, handleSelectTimePreset, navigate, openTaskManager, productListReturnState, selectedFilterLabel, selectedTimeLabel],
  );

  const bulkToolbarPrimarySegments = useMemo((): ProductSpuListBulkToolbarSegment[] => {
    const pending: ProductSpuListBulkToolbarSegment = {
      id: 'pending',
      checkboxChecked: isAllPendingSelected,
      checkboxIndeterminate: isPendingSelectIndeterminate,
      onSelectAllChange: (checked) => handleToggleSelectAll(checked, pendingRowsOnPage),
      title: 'Đang chờ duyệt',
      titleTooltip: 'Chọn tất cả đang chờ duyệt trên trang này',
      selectedCount: selectedPendingIds.length,
      actions: [
        {
          id: 'approve',
          label: 'Duyệt',
          icon: <CheckCircleBroken size={18} />,
          color: '#079455',
          disabled: selectedPendingIds.length === 0,
          onClick: () => setApproveDialog({ toggle: true }),
          permission: productListButtonPermission('approve', 'Duyệt sản phẩm', 'api_product_approval_review'),
        },
        {
          id: 'reject',
          label: 'Từ chối',
          icon: <XCircle size={18} />,
          color: '#DC2626',
          disabled: selectedPendingIds.length === 0,
          onClick: () => setRejectDialog({ toggle: true }),
          permission: productListButtonPermission('reject', 'Từ chối duyệt sản phẩm', 'api_product_approval_review'),
        },
        {
          id: 'cancel',
          label: 'Hủy yêu cầu',
          icon: <FlipBackward size={18} />,
          color: '#6B7280',
          disabled: selectedPendingIds.length === 0,
          onClick: () => setCancelApprovalDialog({ toggle: true }),
          permission: productListButtonPermission('cancel_approval', 'Hủy yêu cầu duyệt sản phẩm', 'api_product_submit'),
        },
      ],
    };

    const draft: ProductSpuListBulkToolbarSegment = {
      id: 'draft',
      checkboxChecked: isAllDraftSelected,
      checkboxIndeterminate: isDraftSelectIndeterminate,
      onSelectAllChange: (checked) => handleToggleSelectAll(checked, draftRowsOnPage),
      title: 'Bản nháp',
      titleTooltip: 'Chọn tất cả bản nháp trên trang này',
      selectedCount: selectedDraftIds.length,
      actions: [
        {
          id: 'submit',
          label: 'Gửi duyệt',
          icon: <Send01 size={18} />,
          color: '#2563EB',
          disabled: selectedDraftIds.length === 0,
          onClick: () => setSubmitApprovalDialog({ toggle: true }),
          permission: productListButtonPermission('submit', 'Gửi duyệt sản phẩm', 'api_product_submit'),
        },
      ],
    };

    if (unpublishedRowsOnPage.length === 0) {
      return [pending, draft];
    }

    const unpublished: ProductSpuListBulkToolbarSegment = {
      id: 'unpublished',
      checkboxChecked: isAllUnpublishedSelected,
      checkboxIndeterminate: isUnpublishedSelectIndeterminate,
      onSelectAllChange: (checked) => handleToggleSelectAll(checked, unpublishedRowsOnPage),
      title: 'Ngừng xuất bản',
      titleTooltip: 'Chọn tất cả ngừng xuất bản trên trang này',
      selectedCount: selectedUnpublishedIds.length,
      actions: [
        {
          id: 'publish',
          label: 'Xuất bản',
          icon: <Globe01 size={18} />,
          color: '#079455',
          disabled: selectedUnpublishedIds.length === 0,
          onClick: () => setPublishBulkDialog({ toggle: true }),
          permission: productListButtonPermission('publish', 'Xuất bản sản phẩm', 'api_product_update'),
        },
      ],
    };

    return [pending, draft, unpublished];
  }, [
    draftRowsOnPage,
    isAllDraftSelected,
    isAllPendingSelected,
    isAllUnpublishedSelected,
    isDraftSelectIndeterminate,
    isPendingSelectIndeterminate,
    isUnpublishedSelectIndeterminate,
    pendingRowsOnPage,
    selectedDraftIds.length,
    selectedPendingIds.length,
    selectedUnpublishedIds.length,
    unpublishedRowsOnPage,
    handleToggleSelectAll,
  ]);

  const bulkToolbarSecondarySegments = useMemo((): ProductSpuListBulkToolbarSegment[] | undefined => {
    const out: ProductSpuListBulkToolbarSegment[] = [];
    if (publishedRowsOnPage.length > 0) {
      out.push({
        id: 'published',
        checkboxChecked: isAllPublishedSelected,
        checkboxIndeterminate: isPublishedSelectIndeterminate,
        onSelectAllChange: (checked) => handleToggleSelectAll(checked, publishedRowsOnPage),
        title: 'Đã xuất bản',
        titleTooltip: 'Chọn tất cả đã xuất bản trên trang này',
        selectedCount: selectedPublishedIds.length,
        actions: [
          {
            id: 'discontinue',
            label: 'Ngừng kinh doanh',
            icon: <XCircle size={18} />,
            color: '#DC6803',
            disabled: selectedPublishedIds.length === 0,
            onClick: () => setDiscontinueBulkDialog({ toggle: true }),
            permission: productListButtonPermission('discontinue', 'Ngừng kinh doanh sản phẩm', 'api_product_update'),
          },
          {
            id: 'archive',
            label: 'Lưu trữ',
            icon: <Archive size={18} />,
            color: '#EA580C',
            disabled: selectedPublishedIds.length === 0,
            onClick: () => setArchiveBulkDialog({ toggle: true }),
            permission: productListButtonPermission('archive', 'Lưu trữ sản phẩm', 'api_product_update'),
          },
        ],
      });
    }
    if (discontinuedRowsOnPage.length > 0) {
      out.push({
        id: 'discontinued',
        checkboxChecked: isAllDiscontinuedSelected,
        checkboxIndeterminate: isDiscontinuedSelectIndeterminate,
        onSelectAllChange: (checked) => handleToggleSelectAll(checked, discontinuedRowsOnPage),
        title: 'Ngừng kinh doanh',
        titleTooltip: 'Chọn tất cả ngừng kinh doanh trên trang này',
        selectedCount: selectedDiscontinuedIds.length,
        actions: [
          {
            id: 'restore-published',
            label: 'Khôi phục kinh doanh',
            icon: <RefreshCcw01 size={18} />,
            color: '#2563EB',
            disabled: selectedDiscontinuedIds.length === 0,
            onClick: () => setRestoreDiscontinuedBulkDialog({ toggle: true }),
            permission: productListButtonPermission('restore_published', 'Khôi phục kinh doanh sản phẩm', 'api_product_update'),
          },
        ],
      });
    }
    if (archivedRowsOnPage.length > 0) {
      out.push({
        id: 'archived',
        checkboxChecked: isAllArchivedSelected,
        checkboxIndeterminate: isArchivedSelectIndeterminate,
        onSelectAllChange: (checked) => handleToggleSelectAll(checked, archivedRowsOnPage),
        title: 'Lưu trữ',
        titleTooltip: 'Chọn tất cả lưu trữ trên trang này',
        selectedCount: selectedArchivedIds.length,
        actions: [
          {
            id: 'restore',
            label: 'Khôi phục',
            icon: <RefreshCcw01 size={18} />,
            color: '#2563EB',
            disabled: selectedArchivedIds.length === 0,
            onClick: () => setRestoreBulkDialog({ toggle: true }),
            permission: productListButtonPermission('restore', 'Khôi phục sản phẩm', 'api_product_update'),
          },
        ],
      });
    }
    return out.length ? out : undefined;
  }, [
    archivedRowsOnPage,
    discontinuedRowsOnPage,
    handleToggleSelectAll,
    isAllArchivedSelected,
    isAllDiscontinuedSelected,
    isAllPublishedSelected,
    isArchivedSelectIndeterminate,
    isDiscontinuedSelectIndeterminate,
    isPublishedSelectIndeterminate,
    publishedRowsOnPage,
    selectedArchivedIds.length,
    selectedDiscontinuedIds.length,
    selectedPublishedIds.length,
  ]);

  const columns = useMemo<Array<DataTableColumn<Product>>>(
    () => [
      {
        id: 'image',
        label: 'Ảnh',
        width: 100,
        renderCell: (row) =>
          row.image ? (
            <Box component="img" src={row.image} alt={row.name} sx={{ width: 48, height: 48, objectFit: 'contain' }} />
          ) : (
            <Box component="img" src={PRODUCT_SPU_DEFAULT_IMAGE_SRC} alt="product-default" sx={{ width: 48, height: 48, objectFit: 'contain' }} />
          ),
      },
      {
        id: 'spuCode',
        label: 'Mã sản phẩm',
        width: 180,
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' }}>{row.spuCode}</Typography>,
      },
      {
        id: 'name',
        label: 'Tên sản phẩm',
        width: 250,
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' }}>{row.name}</Typography>,
      },
      {
        id: 'category',
        label: 'Danh mục',
        width: 200,
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' }}>{row.category?.name ?? '—'}</Typography>,
      },
      {
        id: 'status',
        label: 'Trạng thái sản phẩm',
        width: 180,
        renderCell: (row) => <TagCommonComponent content={getProductLifecycleStatusLabelVi(row.status)} border />,
      },
      {
        id: 'approval',
        label: 'Trạng thái yêu cầu',
        width: 220,
        renderCell: (row) => <TagCommonComponent content={getProductApprovalStatusLabelVi(row.approval, row.status)} />,
      },
      {
        id: 'actions',
        label: '',
        width: 100,
        align: 'center',
        sticky: 'right',
        renderCell: (row) => {
          const editBlockedByPending = row.approval?.hasPending;

          return (
            <StackRowAlignJustCenter sx={{ gap: 1.5 }}>
              <TooltipOnHoverComponent content="Xem chi tiết">
                <PermissionIconButton
                  size="small"
                  onClick={() => navigate(getProductSpuDetailPath(row.id), { state: productListReturnState })}
                  {...productListButtonPermission('open_detail', 'Xem chi tiết sản phẩm', 'api_product_detail')}
                  sx={{ color: '#374151' }}
                >
                  <Eye size={18} />
                </PermissionIconButton>
              </TooltipOnHoverComponent>
              {editBlockedByPending ? (
                <TooltipOnHoverComponent content={PRODUCT_SPU_EDIT_DISABLED_PENDING_MESSAGE}>
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      cursor: 'not-allowed',
                      opacity: 0.45,
                      lineHeight: 0,
                    }}
                  >
                    <Edit02 size={18} color="#374151" />
                  </Box>
                </TooltipOnHoverComponent>
              ) : (
                <TooltipOnHoverComponent content="Chỉnh sửa">
                  <PermissionIconButton
                    size="small"
                    onClick={() => navigate(getProductSpuUpdatePath(row.id), { state: productListReturnState })}
                    {...productListButtonPermission('edit', 'Chỉnh sửa sản phẩm', 'api_product_update')}
                    sx={{ color: '#374151' }}
                  >
                    <Edit02 size={18} />
                  </PermissionIconButton>
                </TooltipOnHoverComponent>
              )}
            </StackRowAlignJustCenter>
          );
        },
      },
    ],
    [navigate, productListReturnState],
  );

  if (!canViewList) return null;

  return (
    <Stack
      sx={{
        height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`,
        boxSizing: 'border-box',
        minHeight: 0,
      }}
    >
      <WrapperComponent
        label="Danh sách sản phẩm"
        tabs={
          <DataTableStatusTabs
            tabs={[
              { value: '', label: 'Tất cả', count: counts.all },
              { value: ProductSpuStatus.DRAFT, label: 'Bản nháp', count: counts.draft },
              ...PRODUCT_SPU_APPROVAL_STATUS_TABS.map((tab) => ({
                value: tab.value,
                label: tab.label,
                count: approvalStatusTabCounts[tab.value],
              })),
              { value: ProductSpuStatus.PUBLISHED, label: 'Xuất bản', count: counts.published },
              { value: ProductSpuStatus.UNPUBLISHED, label: 'Ngừng xuất bản', count: counts.unpublished },
              { value: ProductSpuStatus.DISCONTINUED, label: 'Ngừng kinh doanh', count: counts.discontinued },
              { value: ProductSpuStatus.ARCHIVED, label: 'Lưu trữ', count: counts.archived },
            ]}
            activeValue={activeTab}
            onChange={(value) => {
              setActiveTab(value as ProductListTab);
              setSelectedProductIds([]);
              setScreenState((prev) => ({ ...prev, page: PAGE_TAKE_DEFAULT.page }));
            }}
          />
        }
      >
        <Stack sx={{ flex: 1, minHeight: 0, minWidth: 0 }}>
          <Box sx={{ p: 2, border: '1px solid #E5E7EB', bgcolor: '#FFFFFF', borderRadius: '10px' }}>
            <DataTableToolbar
              embedded
              searchValue={screenState.search || ''}
              onSearchChange={(value) => setScreenState((prev) => ({ ...prev, search: value, page: PAGE_TAKE_DEFAULT.page }))}
              searchPlaceholder="Tìm theo tên sản phẩm, mã sản phẩm..."
              actions={toolbarActions}
            />
          </Box>

          {selectedProductIds.length > 0 ? <ProductSpuListBulkToolbar primarySegments={bulkToolbarPrimarySegments} secondarySegments={bulkToolbarSecondarySegments} /> : null}

          {productsSwr.isLoading && !productsSwr.data ? (
            <LoadingComponent />
          ) : rows.length === 0 ? (
            <EmptyComponent />
          ) : (
            <Stack sx={{ flex: 1, minHeight: 0, flexDirection: 'column', width: '100%' }}>
              <Stack
                sx={{
                  flex: 1,
                  minHeight: 0,
                  borderRadius: '10px 10px 0 0',
                  border: '1px solid #E5E7EB',
                  overflow: 'hidden',
                  bgcolor: '#FFFFFF',
                }}
              >
                <DataTable
                  rows={rows}
                  columns={columns}
                  getRowId={(row) => row.id}
                  containerSx={{ flex: 1, minHeight: 0, height: '100%' }}
                  emptyTitle="Không có sản phẩm phù hợp"
                  emptyDescription="Thử đổi từ khóa tìm kiếm hoặc bộ lọc."
                  selectable
                  isRowSelectable={(row: Product) =>
                    Boolean(row.approval?.hasPending) ||
                    (row.status === ProductSpuStatus.DRAFT && !row.approval?.hasPending) ||
                    (row.status === ProductSpuStatus.UNPUBLISHED && !row.approval?.hasPending) ||
                    (row.status === ProductSpuStatus.PUBLISHED && !row.approval?.hasPending) ||
                    (row.status === ProductSpuStatus.DISCONTINUED && !row.approval?.hasPending) ||
                    (row.status === ProductSpuStatus.ARCHIVED && !row.approval?.hasPending)
                  }
                  selectedRowIds={selectedProductIds}
                  onToggleSelectAll={handleToggleSelectAll}
                  onToggleSelectRow={(row, checked) => {
                    setSelectedProductIds((prev) => (checked ? (prev.includes(row.id) ? prev : [...prev, row.id]) : prev.filter((id) => id !== row.id)));
                  }}
                />
              </Stack>
              <DataTablePagination
                page={screenState.page}
                pageSize={screenState.take}
                totalItems={totalItems}
                pageSizeOptions={[...LABEL_CONTENT_PAGE_SIZE_OPTIONS]}
                itemLabel="sản phẩm"
                summaryMode="total"
                onPageChange={(page) => setScreenState((prev) => ({ ...prev, page }))}
                onPageSizeChange={(take) => setScreenState((prev) => ({ ...prev, take, page: PAGE_TAKE_DEFAULT.page }))}
              />
            </Stack>
          )}
        </Stack>
      </WrapperComponent>

      <DialogConfirmComponent
        open={approveDialog.toggle}
        onClose={() => setApproveDialog({ toggle: false })}
        title="Xác nhận duyệt"
        cancelLabel="Quay lại"
        confirmLabel="Xác nhận duyệt"
        confirmVariant="primary"
        confirmButtonProps={productListButtonPermission('approve', 'Xác nhận duyệt sản phẩm', 'api_product_approval_review')}
        onCancel={() => setApproveDialog({ toggle: false })}
        onConfirm={() => void handleConfirmApprove()}
        highlight={{
          tone: 'info',
          title: `Bạn đang duyệt ${selectedPendingIds.length} sản phẩm.`,
          description: 'Thao tác này sẽ áp dụng dữ liệu đã được gửi cho yêu cầu.',
        }}
      />

      <DialogConfirmComponent
        open={rejectDialog.toggle}
        onClose={() => setRejectDialog({ toggle: false })}
        title="Từ chối duyệt"
        cancelLabel="Quay lại"
        confirmLabel="Xác nhận từ chối"
        confirmVariant="danger"
        confirmButtonProps={{
          disabled: !rejectReason.trim(),
          ...productListButtonPermission('reject', 'Xác nhận từ chối duyệt sản phẩm', 'api_product_approval_review'),
        }}
        onCancel={() => setRejectDialog({ toggle: false })}
        onConfirm={() => void handleConfirmReject()}
        highlight={{
          tone: 'danger',
          title: `Bạn đang từ chối ${selectedPendingIds.length} yêu cầu.`,
          description: 'Sản phẩm bản nháp bi từ chối sẽ quay lại trạng thái bản nháp.',
        }}
      >
        <Stack gap={1}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#344054' }}>
            Lý do từ chối{' '}
            <Box component="span" sx={{ color: '#F04438' }}>
              *
            </Box>
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Nhập lý do từ chối"
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
          />
        </Stack>
      </DialogConfirmComponent>

      <DialogConfirmComponent
        open={cancelApprovalDialog.toggle}
        loading={approvalBulkLoading}
        onClose={() => !approvalBulkLoading && setCancelApprovalDialog({ toggle: false })}
        title="Hủy yêu cầu duyệt"
        cancelLabel="Quay lại"
        confirmLabel="Xác nhận hủy"
        confirmVariant="danger"
        confirmButtonProps={productListButtonPermission('cancel_approval', 'Xác nhận hủy yêu cầu duyệt sản phẩm', 'api_product_submit')}
        onCancel={() => !approvalBulkLoading && setCancelApprovalDialog({ toggle: false })}
        onConfirm={() => void handleConfirmCancelApprovalRequests()}
        highlight={{
          tone: 'danger',
          title: `Hủy yêu cầu duyệt cho ${selectedPendingIds.length} sản phẩm?`,
          description: 'Yêu cầu tạo mới bi hủy sẽ giữ sản phẩm ở trạng thái bản nháp. Yêu cầu cập nhật bi hủy sẽ giữ dữ liệu hiện tại.',
        }}
      />

      <DialogConfirmComponent
        open={submitApprovalDialog.toggle}
        loading={approvalBulkLoading}
        onClose={() => !approvalBulkLoading && setSubmitApprovalDialog({ toggle: false })}
        title="Gửi yêu cầu duyệt"
        cancelLabel="Quay lại"
        confirmLabel="Xác nhận gửi"
        confirmVariant="primary"
        confirmButtonProps={productListButtonPermission('submit', 'Xác nhận gửi duyệt sản phẩm', 'api_product_submit')}
        onCancel={() => !approvalBulkLoading && setSubmitApprovalDialog({ toggle: false })}
        onConfirm={() => void handleConfirmSubmitApprovalRequests()}
        highlight={{
          tone: 'info',
          title: `Gửi yêu cầu duyệt cho ${selectedDraftIds.length} sản phẩm?`,
          description: 'Sản phẩm vẫn giữ Trạng thái Nháp cho đến khi duyệt thành công.',
        }}
      />

      <DialogConfirmComponent
        open={publishBulkDialog.toggle}
        loading={lifecycleBulkLoading}
        onClose={() => !lifecycleBulkLoading && setPublishBulkDialog({ toggle: false })}
        title="Xuất bản hàng loạt"
        cancelLabel="Quay lại"
        confirmLabel="Xác nhận xuất bản"
        confirmVariant="primary"
        confirmButtonProps={productListButtonPermission('publish', 'Xác nhận xuất bản sản phẩm', 'api_product_update')}
        onCancel={() => !lifecycleBulkLoading && setPublishBulkDialog({ toggle: false })}
        onConfirm={() => void handleConfirmBulkPublish()}
        highlight={{
          tone: 'info',
          title: `Xuất bản ${selectedUnpublishedIds.length} sản phẩm?`,
          description: 'Các sản phẩm đang ngừng xuất bản sẽ chuyển sang trạng thái đã xuất bản.',
        }}
      />

      <DialogConfirmComponent
        open={discontinueBulkDialog.toggle}
        loading={lifecycleBulkLoading}
        onClose={() => !lifecycleBulkLoading && setDiscontinueBulkDialog({ toggle: false })}
        title="Ngừng kinh doanh hàng loạt"
        cancelLabel="Quay lại"
        confirmLabel="Xác nhận ngừng kinh doanh"
        confirmVariant="danger"
        confirmButtonProps={productListButtonPermission('discontinue', 'Xác nhận ngừng kinh doanh sản phẩm', 'api_product_update')}
        onCancel={() => !lifecycleBulkLoading && setDiscontinueBulkDialog({ toggle: false })}
        onConfirm={() => void handleConfirmBulkDiscontinue()}
        highlight={{
          tone: 'danger',
          title: `Ngừng kinh doanh ${selectedPublishedIds.length} sản phẩm?`,
          description: 'Sản phẩm vẫn hiển thị để tham khảo nhưng sẽ bị khóa mọi thao tác giao dịch, giỏ hàng và khuyến mãi.',
        }}
      />

      <DialogConfirmComponent
        open={archiveBulkDialog.toggle}
        loading={lifecycleBulkLoading}
        onClose={() => !lifecycleBulkLoading && setArchiveBulkDialog({ toggle: false })}
        title="Lưu trữ hàng loạt"
        cancelLabel="Quay lại"
        confirmLabel="Xác nhận lưu trữ"
        confirmVariant="danger"
        confirmButtonProps={productListButtonPermission('archive', 'Xác nhận lưu trữ sản phẩm', 'api_product_update')}
        onCancel={() => !lifecycleBulkLoading && setArchiveBulkDialog({ toggle: false })}
        onConfirm={() => void handleConfirmBulkArchive()}
        highlight={{
          tone: 'danger',
          title: `Lưu trữ ${selectedPublishedIds.length} sản phẩm?`,
          description: 'Sản phẩm đã xuất bản sẽ chuyển sang lưu trữ và không còn hiển thị ở kênh bán.',
        }}
      />

      <DialogConfirmComponent
        open={restoreDiscontinuedBulkDialog.toggle}
        loading={lifecycleBulkLoading}
        onClose={() => !lifecycleBulkLoading && setRestoreDiscontinuedBulkDialog({ toggle: false })}
        title="Khôi phục kinh doanh hàng loạt"
        cancelLabel="Quay lại"
        confirmLabel="Xác nhận khôi phục kinh doanh"
        confirmVariant="primary"
        confirmButtonProps={productListButtonPermission('restore_published', 'Xác nhận khôi phục kinh doanh sản phẩm', 'api_product_update')}
        onCancel={() => !lifecycleBulkLoading && setRestoreDiscontinuedBulkDialog({ toggle: false })}
        onConfirm={() => void handleConfirmBulkRestorePublished()}
        highlight={{
          tone: 'info',
          title: `Khôi phục kinh doanh ${selectedDiscontinuedIds.length} sản phẩm?`,
          description: 'Sản phẩm sẽ quay lại trạng thái hiển thị và có thể giao dịch lại trên kênh bán.',
        }}
      />

      <DialogConfirmComponent
        open={restoreBulkDialog.toggle}
        loading={lifecycleBulkLoading}
        onClose={() => !lifecycleBulkLoading && setRestoreBulkDialog({ toggle: false })}
        title="Khôi phục hàng loạt"
        cancelLabel="Quay lại"
        confirmLabel="Xác nhận khôi phục"
        confirmVariant="primary"
        confirmButtonProps={productListButtonPermission('restore', 'Xác nhận khôi phục sản phẩm', 'api_product_update')}
        onCancel={() => !lifecycleBulkLoading && setRestoreBulkDialog({ toggle: false })}
        onConfirm={() => void handleConfirmBulkRestoreUnpublished()}
        highlight={{
          tone: 'info',
          title: `Khôi phục ${selectedArchivedIds.length} sản phẩm?`,
          description: 'Sản phẩm lưu trữ sẽ chuyển về trạng thái chưa xuất bản (có thể chỉnh sửa và xuất bản lại).',
        }}
      />

      <ProductSpuAdvancedFilterDialog
        open={advancedFilterOpen}
        onClose={() => setAdvancedFilterOpen(false)}
        value={advancedFilterValue}
        categoryOptions={categoryOptions}
        onApply={(filters) => {
          const price = productSpuPriceRangeKeyToMinMax(filters.priceRangeKey);
          setScreenState((prev) => ({
            ...prev,
            categoryUuid: filters.categoryUuid || undefined,
            approvalStatus: filters.approvalStatus || undefined,
            status: filters.status && filters.status !== ProductSpuStatus.ALL ? (filters.status as ProductSpuStatus) : undefined,
            minPrice: price.minPrice ?? undefined,
            maxPrice: price.maxPrice ?? undefined,
            page: PAGE_TAKE_DEFAULT.page,
          }));
        }}
        onReset={() => {
          setScreenState((prev) => ({
            ...prev,
            categoryUuid: undefined,
            approvalStatus: undefined,
            status: undefined,
            minPrice: undefined,
            maxPrice: undefined,
            page: PAGE_TAKE_DEFAULT.page,
          }));
        }}
      />

      <OrderTimeCustomRangeDialog open={timeRangeDialogOpen} initialRange={customDateRange} onClose={() => setTimeRangeDialogOpen(false)} onApply={handleApplyTimeRange} />

      <ProductSpuImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        submitting={importSubmitting}
        onDownloadTemplate={() => {
            if (isJavaBackend()) {
              void javaDownloadProductTemplate().catch(error => showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) }));
              return;
            }
          const link = document.createElement('a');
          link.href = '/pim/Import_Product_Template.xlsx';
          link.download = 'Import_Product_Template.xlsx';
          link.rel = 'noopener noreferrer';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã kích hoạt tải file mẫu.' });
        }}
        onStartImport={handleStartProductImport}
      />

      <ProductSpuTaskManagerDrawer
        open={taskManagerOpen}
        onClose={() => setTaskManagerOpen(false)}
        jobs={ieJobsRes ?? { list: [], total: 0 }}
        loading={taskManagerJobsLoading}
        knownFileNames={importKnownFileNames}
      />
    </Stack>
  );
};

export default ProductSpuListPage;
