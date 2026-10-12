import { Box, Stack, Typography } from '@mui/material';
import { TaskAltOutlined } from '@mui/icons-material';
import { Eye, Upload01 } from '@untitledui/icons';
import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import { STYLE } from '@/trading-ui/adapters/library';
import useSWR from 'swr';
import { importExportApi, productSetApi, type ProductSetRow, type ProductSetStatus, type QueryProductSetDto } from '../../../apis';
import { TYPOGRAPHY_STYLES } from '../../../common/constant/typography.constant';
import { resolveTenantBrandProductDefaultImageSrc } from '../../../common/config/runtime-config';
import { getErrorMessage } from '../../../common/utils';
import { PermissionIconButton } from '../../../components/button';
import { DataTable, type DataTableColumn, DataTablePagination, DataTableToolbar, type DataTableToolbarAction } from '../../../components/data-table';
import { DialogConfirmComponent } from '../../../components/dialog';
import { EmptyComponent } from '../../../components/empty/empty.component';
import { LoadingComponent } from '../../../components/loading/loading.component';
import { StackRowAlignCenter } from '../../../components/styled';
import { TagCommonComponent } from '../../../components/tag';
import { TooltipOnHoverComponent } from '../../../components/tooltip/tooltip-on-hover.component';
import { WrapperComponent } from '../../../components/wrapper';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { useListPageViewAccess } from '../../../permissions/use-list-page-view-access.hook';
import { useNavigate } from 'react-router-dom';
import { getProductSetDetailPath } from '@/trading-ui/router/route.path';
import { PRODUCT_SET_PAGE_SCOPE, productSetButtonPermission } from '../product-permission.constants';
import { ProductSpuTaskManagerDrawer } from '../product-spu/components/product-spu-task-manager-drawer.component';
import { ProductSetImportDialog } from './components/product-set-import-dialog.component';
import { getProductSetStatusLabelVi, PRODUCT_SET_IMPORT_ROUTING_KEY, PRODUCT_SET_PAGE_SIZE_OPTIONS, STATUS_FILTER_ALL, STATUS_FILTER_OPTIONS } from './product-set.constant';
import { PAGE_TAKE_DEFAULT } from '../../../common/constant/page-take.constant';

const productDefaultImageSrc = resolveTenantBrandProductDefaultImageSrc();

const renderStatusTag = (status: ProductSetStatus) => {
  return <TagCommonComponent content={getProductSetStatusLabelVi(status)} border />;
};

const ProductSetListPage = () => {
  const navigate = useNavigate();
  const canViewList = useListPageViewAccess(PRODUCT_SET_PAGE_SCOPE, { redirectOnDeny: false });
  const { showSnackbar } = useSnackbar();

  // State bộ lọc & phân trang
  const [screenState, setScreenState] = useState<QueryProductSetDto>({
    ...PAGE_TAKE_DEFAULT,
    search: '',
  });

  // State Dialogs
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; data?: ProductSetRow }>({
    open: false,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [taskManagerOpen, setTaskManagerOpen] = useState(false);
  const [importKnownFileNames, setImportKnownFileNames] = useState<Record<string, string>>({});

  const { data: topicConfigs } = useSWR(taskManagerOpen ? (['ie', 'topic-configs', PRODUCT_SET_IMPORT_ROUTING_KEY] as const) : null, () => importExportApi.getImportExportTopicConfigs(), {
    revalidateOnFocus: false,
  });
  const productSetImportTopicConfigId = useMemo(() => topicConfigs?.find((config) => config.routingKey === PRODUCT_SET_IMPORT_ROUTING_KEY)?.id ?? null, [topicConfigs]);
  const {
    data: importJobs,
    isLoading: importJobsLoading,
    isValidating: importJobsRefreshing,
    mutate: mutateImportJobs,
  } = useSWR(
    taskManagerOpen && productSetImportTopicConfigId ? (['ie', 'jobs', productSetImportTopicConfigId] as const) : null,
    () =>
      importExportApi.getImportExportListJobs({
        topicConfigId: productSetImportTopicConfigId!,
        isPagination: true,
      }),
    { revalidateOnFocus: false },
  );

  const taskManagerLoading = taskManagerOpen && (topicConfigs === undefined || (Boolean(productSetImportTopicConfigId) && importJobsLoading));

  // Fetch danh sách Set
  const { data, isLoading, mutate } = useSWR(
    ['product/admin/product-sets', screenState.page, screenState.take, screenState.search, screenState.status],
    () =>
      productSetApi.getAdminProductSetList({
        page: screenState.page,
        take: screenState.take,
        search: screenState.search?.trim() || undefined,
        status: screenState.status || undefined,
      }),
    { revalidateOnFocus: false },
  );

  const rows = data?.list ?? [];
  const totalItems = data?.total ?? data?.pagination?.total ?? 0;
  const statusFilterValue = screenState.status ?? STATUS_FILTER_ALL;

  // Xóa Set
  const handleDeleteConfirm = useCallback(async () => {
    const id = deleteConfirm.data?.id;
    if (!id || isDeleting) return;
    setIsDeleting(true);
    try {
      await productSetApi.deleteAdminProductSet(id);
      await mutate();
      showSnackbar({ message: 'Xóa bộ sản phẩm thành công', type: SnackbarType.SUCCESS });
      setDeleteConfirm({ open: false, data: undefined });
    } catch (error) {
      showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
    } finally {
      setIsDeleting(false);
    }
  }, [deleteConfirm.data?.id, isDeleting, mutate, showSnackbar]);

  // Xử lý Import Excel qua Queue
  const handleStartImport = useCallback(
    async (file: File) => {
      setIsImporting(true);
      try {
        const configs = await importExportApi.getImportExportTopicConfigs();
        const setConfig = configs.find((c) => c.routingKey === PRODUCT_SET_IMPORT_ROUTING_KEY);
        if (!setConfig) {
          throw new Error(`Chưa cấu hình topic ${PRODUCT_SET_IMPORT_ROUTING_KEY} trong hệ thống.`);
        }

        const job = await importExportApi.postImportTopicConfigs(setConfig.id, file);
        setImportKnownFileNames((current) => ({ ...current, [job.jobId]: file.name }));
        showSnackbar({
          message: 'Đã gửi file vào hàng đợi import. Đang xử lý...',
          type: SnackbarType.INFO,
        });

        // Chờ kết quả xử lý từ Queue
        const jobResult = await importExportApi.waitImportExportJobFileUrl(job.jobId);
        if (jobResult?.fileUrl) {
          showSnackbar({
            message: 'Import bộ sản phẩm hoàn tất!',
            type: SnackbarType.SUCCESS,
          });
        } else {
          showSnackbar({
            message: 'Import hoàn tất.',
            type: SnackbarType.SUCCESS,
          });
        }

        setImportOpen(false);
        await mutate();
      } catch (error) {
        showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
      } finally {
        setIsImporting(false);
      }
    },
    [mutate, showSnackbar],
  );

  // Cấu hình Toolbar Actions
  const toolbarActions = useMemo<DataTableToolbarAction[]>(
    () => [
      {
        key: 'import',
        label: 'Import Excel',
        variant: 'outlined',
        icon: <Upload01 size={18} color="#374151" />,
        onClick: () => setImportOpen(true),
        ...productSetButtonPermission('import', 'Import Bộ sản phẩm', 'api_product_set_import'),
      },
      {
        key: 'task-manager',
        label: 'Xem trình quản lý tác vụ',
        icon: <TaskAltOutlined sx={{ fontSize: 18 }} />,
        onClick: () => setTaskManagerOpen(true),
        ...productSetButtonPermission('import', 'Xem trình quản lý tác vụ import Bộ sản phẩm', 'api_product_set_import'),
      },
    ],
    [],
  );

  const columns = useMemo<DataTableColumn<ProductSetRow>[]>(
    () => [
      {
        id: 'productSet',
        label: 'Bộ sản phẩm',
        renderCell: (row) => (
          <StackRowAlignCenter gap={1}>
            <Box
              component="img"
              src={row.images[0] || productDefaultImageSrc}
              alt={row.name || row.code || 'Bộ sản phẩm'}
              onError={(event) => {
                event.currentTarget.src = productDefaultImageSrc;
              }}
              sx={{
                width: 48,
                height: 48,
                flexShrink: 0,
                borderRadius: 1,
                objectFit: 'contain',
              }}
            />
            <Stack gap={0.25}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold }}>{row.name}</Typography>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>{row.code}</Typography>
            </Stack>
          </StackRowAlignCenter>
        ),
      },
      {
        id: 'productCount',
        label: 'Số món',
        align: 'center',
        width: 90,
        renderCell: (row) => (
          <Box
            sx={{
              display: 'inline-block',
              px: 1.5,
              py: 0.5,
              bgcolor: '#EFF6FF',
              color: '#1D4ED8',
              borderRadius: 1,
              ...TYPOGRAPHY_STYLES.xs.bold,
            }}
          >
            {row.productCount || 0} SPU
          </Box>
        ),
      },
      {
        id: 'status',
        label: 'Trạng thái',
        width: 140,
        renderCell: (row) => renderStatusTag(row.status),
      },
      {
        id: 'createdAt',
        label: 'Ngày tạo',
        width: 140,
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#4B5563' }}>{row.createdAt ? dayjs(row.createdAt).format('DD/MM/YYYY HH:mm') : '—'}</Typography>,
      },
      {
        id: 'actions',
        label: '',
        align: 'center',
        width: 120,
        renderCell: (row) => (
          <TooltipOnHoverComponent content="Xem chi tiết">
            <PermissionIconButton
              size="small"
              onClick={() => navigate(getProductSetDetailPath(row.id))}
              {...productSetButtonPermission('detail', 'Xem chi tiết', 'api_product_set_detail')}
              sx={{ color: '#4B5563' }}
            >
              <Eye size={18} />
            </PermissionIconButton>
          </TooltipOnHoverComponent>
        ),
      },
    ],
    [],
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
      <WrapperComponent label="Bộ sản phẩm">
        <Stack sx={{ flex: 1, minHeight: 0, flexDirection: 'column', width: '100%' }}>
          {/* Thanh công cụ tìm kiếm và bộ lọc */}
          <Box
            sx={{
              p: '16px',
              border: '1px solid #E5E7EB',
              bgcolor: '#FFFFFF',
              borderRadius: '10px',
            }}
          >
            <DataTableToolbar
              embedded
              searchValue={screenState.search || ''}
              onSearchChange={(v) => setScreenState((prev) => ({ ...prev, search: v, page: 1 }))}
              searchPlaceholder="Tìm theo Mã Set, Tên Set, Slug..."
              actions={toolbarActions}
              filterSelect={{
                value: statusFilterValue,
                width: 180,
                options: STATUS_FILTER_OPTIONS,
                onChange: (value) =>
                  setScreenState((prev) => ({
                    ...prev,
                    status: value === STATUS_FILTER_ALL ? undefined : (value as ProductSetStatus),
                    page: 1,
                  })),
              }}
            />
          </Box>

          {isLoading ? (
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
                  borderBottom: '1px solid #E5E7EB',
                  overflow: 'hidden',
                  bgcolor: '#FFFFFF',
                }}
              >
                <DataTable
                  rows={rows}
                  columns={columns}
                  getRowId={(row) => row.id}
                  containerSx={{ flex: 1, minHeight: 0, height: '100%' }}
                  onRowClick={(row) => navigate(getProductSetDetailPath(row.id))}
                  emptyTitle="Không có bộ sản phẩm nào"
                />
              </Stack>
              <DataTablePagination
                totalItems={totalItems}
                page={screenState.page || 1}
                pageSize={screenState.take || 20}
                pageSizeOptions={PRODUCT_SET_PAGE_SIZE_OPTIONS}
                itemLabel="bộ sản phẩm"
                summaryMode="total"
                onPageChange={(page) => setScreenState((prev) => ({ ...prev, page }))}
                onPageSizeChange={(take) => setScreenState((prev) => ({ ...prev, take, page: 1 }))}
              />
            </Stack>
          )}
        </Stack>
      </WrapperComponent>

      {/* Dialog Import Excel */}
      <ProductSetImportDialog
        open={importOpen}
        submitting={isImporting}
        onClose={() => {
          if (!isImporting) setImportOpen(false);
        }}
        onStartImport={handleStartImport}
      />

      <ProductSpuTaskManagerDrawer
        open={taskManagerOpen}
        onClose={() => setTaskManagerOpen(false)}
        jobs={importJobs ?? { list: [], total: 0 }}
        loading={taskManagerLoading}
        knownFileNames={importKnownFileNames}
        refreshing={importJobsRefreshing}
        onRefresh={() => void mutateImportJobs()}
      />

      {/* Dialog xác nhận xóa */}
      <DialogConfirmComponent
        open={deleteConfirm.open}
        loading={isDeleting}
        onClose={() => {
          if (!isDeleting) setDeleteConfirm({ open: false, data: undefined });
        }}
        title="Xóa bộ sản phẩm"
        highlight={{
          tone: 'danger',
          title: `Bạn đang xóa bộ sản phẩm [${deleteConfirm.data?.code || ''}] ${deleteConfirm.data?.name || ''}`,
          description: 'Thao tác này sẽ xóa mềm bộ sản phẩm khỏi hệ thống.',
        }}
        cancelLabel="Hủy"
        confirmLabel="Xác nhận xóa"
        confirmVariant="danger"
        confirmButtonProps={productSetButtonPermission('delete', 'Xác nhận xóa bộ sản phẩm')}
        onCancel={() => {
          if (!isDeleting) setDeleteConfirm({ open: false, data: undefined });
        }}
        onConfirm={handleDeleteConfirm}
      />
    </Stack>
  );
};

export default ProductSetListPage;
