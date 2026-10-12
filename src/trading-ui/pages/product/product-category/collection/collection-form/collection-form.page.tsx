import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMatch, useNavigate } from 'react-router-dom';
import { STYLE } from '@/trading-ui/adapters/library';
import { CustomButton } from '../../../../../components/button';
import { productCollectionButtonPermission } from '../../../product-permission.constants';
import { Plus, Star01, XCircle } from '@untitledui/icons';

import { collectionApi, CollectionStatus } from '../../../../../apis';
import { getTenantCodeHeader } from '../../../../../common/config';
import { TYPOGRAPHY_STYLES } from '../../../../../common/constant/typography.constant';
import { getErrorMessage } from '../../../../../common/utils';
import { DataTable, DataTablePagination, DataTableToolbar, type DataTableToolbarAction } from '../../../../../components/data-table';
import { DialogConfirmComponent } from '../../../../../components/dialog/dialog-confirm.component';
import { EmptyComponent } from '../../../../../components/empty/empty.component';
import { TextInput } from '../../../../../components/form';
import { LoadingComponent } from '../../../../../components/loading/loading.component';
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../../../../components/styled';
import { SwitchContentElement } from '../../../../../components/switch/switch-content.element';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { ROUTE_PATH } from '@/trading-ui/router/route.path';
import { LabelFormPageHeader } from '../../../../content-display/label/components';
import { collectionCreateFormSchema } from '../collection-list/collection-list.constant';
import { COLLECTION_DETAIL_PAGE_SIZE_OPTIONS } from '../collection-detail/collection-detail.constant';
import type { CollectionDetailRow } from '../collection-detail/collection-detail.interface';
import { CollectionDetailCreatePart } from '../collection-detail/parts/collection-detail-create/collection-detail-create.part';
import { buildCollectionProductTableColumns, COLLECTION_PRODUCT_TABLE_MIN_WIDTH } from '../collection-detail/utils/collection-product-table-columns.util';
import type { CollectionFormMode, CollectionFormValues } from './collection-form.interface';
import { useCollectionFormState } from './use-collection-form-state.hook';

const DEFAULT_FORM_VALUES: CollectionFormValues = {
  name: '',
  description: '',
  status: CollectionStatus.ACTIVE,
};

const cardSurfaceSx = {
  border: '1px solid #E5E7EB',
  borderRadius: '12px',
  bgcolor: '#FFFFFF',
};

/** Chiều cao tối thiểu vùng bảng — tránh bị ép khi form phía trên chiếm chỗ. */
const COLLECTION_FORM_TABLE_MIN_HEIGHT = 480;

const CollectionFormPage = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const editMatch = useMatch(ROUTE_PATH.PRODUCT_COLLECTION_EDIT);
  const mode: CollectionFormMode = editMatch ? 'edit' : 'create';
  const collectionId = editMatch?.params?.collectionId;

  const [loading, setLoading] = useState(false);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [singleDeleteRow, setSingleDeleteRow] = useState<CollectionDetailRow | null>(null);
  const [leaveUnsavedOpen, setLeaveUnsavedOpen] = useState(false);

  const formState = useCollectionFormState({ mode, collectionId });
  const tenantCode = getTenantCodeHeader();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty: isFormDirty },
  } = useForm<CollectionFormValues>({
    resolver: yupResolver(collectionCreateFormSchema),
    mode: 'onSubmit',
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const resetFormFromCollection = useCallback(() => {
    if (mode === 'edit' && formState.collection) {
      const c = formState.collection;
      reset({
        name: c.name,
        description: c.description ?? '',
        status: (c.status as CollectionStatus) ?? CollectionStatus.ACTIVE,
      });
      return;
    }
    reset(DEFAULT_FORM_VALUES);
  }, [formState.collection, mode, reset]);

  useEffect(() => {
    resetFormFromCollection();
  }, [resetFormFromCollection]);

  const isDirty = isFormDirty || formState.isProductDraftDirty;
  const canSubmitByTenant = Boolean(tenantCode);

  const pageTitle = mode === 'create' ? 'Tạo bộ sưu tập' : 'Chỉnh sửa bộ sưu tập';

  const goToList = useCallback(() => {
    navigate(ROUTE_PATH.PRODUCT_COLLECTION_LIST);
  }, [navigate]);

  const handleBack = useCallback(() => {
    if (isDirty) {
      setLeaveUnsavedOpen(true);
      return;
    }
    goToList();
  }, [goToList, isDirty]);

  const handleDiscard = useCallback(() => {
    resetFormFromCollection();
    formState.resetProductDraft();
  }, [formState, resetFormFromCollection]);

  const onSubmit = useCallback(
    async (values: CollectionFormValues) => {
      if (!tenantCode) {
        showSnackbar({ type: SnackbarType.ERROR, message: 'Chưa xác định tenant đăng nhập' });
        return;
      }

      setLoading(true);
      formState.setIsMutating(true);
      try {
        if (mode === 'create') {
          await collectionApi.createCollection({
            name: values.name.trim(),
            description: values.description?.trim() || undefined,
            status: values.status,
            productIds: formState.draftProductIds.length > 0 ? formState.draftProductIds : undefined,
          });
          showSnackbar({ type: SnackbarType.SUCCESS, message: 'Tạo bộ sưu tập thành công' });
          goToList();
          return;
        }

        if (!collectionId) throw new Error('Không tìm thấy ID bộ sưu tập');

        if (isFormDirty) {
          await collectionApi.updateCollection(collectionId, {
            name: values.name.trim(),
            description: values.description?.trim() || undefined,
            status: values.status,
          });
        }

        if (formState.isProductDraftDirty) {
          await formState.syncProductsAfterSave(collectionId, formState.collection ?? null);
          await formState.mutate();
        }

        showSnackbar({ type: SnackbarType.SUCCESS, message: 'Cập nhật bộ sưu tập thành công' });
        goToList();
      } catch (error) {
        showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
      } finally {
        setLoading(false);
        formState.setIsMutating(false);
      }
    },
    [collectionId, formState, goToList, isFormDirty, mode, showSnackbar, tenantCode],
  );

  const handleSave = useCallback(() => {
    void handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit]);

  const requestDeleteRow = useCallback((row: CollectionDetailRow) => {
    setSingleDeleteRow(row);
  }, []);

  const productTableActions = useMemo(
    () => ({
      onDelete: requestDeleteRow,
    }),
    [requestDeleteRow],
  );

  const toolbarActions = useMemo<DataTableToolbarAction[]>(
    () => [
      {
        key: 'add',
        label: 'Thêm sản phẩm',
        ...productCollectionButtonPermission(mode === 'edit' ? 'edit' : 'create', 'Thêm sản phẩm vào bộ sưu tập', mode === 'edit' ? 'api_collection_update' : 'api_collection_create'),
        variant: 'contained',
        icon: <Plus size={18} color="#FFFFFF" />,
        onClick: () => setAddProductOpen(true),
      },
    ],
    [mode],
  );

  const columns = useMemo(() => buildCollectionProductTableColumns(productTableActions), [productTableActions]);

  const showInitialLoading = mode === 'edit' && formState.isLoading;
  const isSaving = loading || formState.isMutating;
  const hasSelected = formState.selectedRowIds.length > 0;
  const totalRows = formState.filteredRows.length;
  const hasProducts = formState.pagedRows.length > 0;

  if (showInitialLoading) {
    return (
      <Stack sx={{ height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`, boxSizing: 'border-box', bgcolor: '#F9FAFB' }}>
        <LabelFormPageHeader title={pageTitle} onBack={handleBack} onCancel={handleBack} onSave={handleSave} loading disabled />
        <LoadingComponent />
      </Stack>
    );
  }

  return (
    <Stack
      sx={{
        height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`,
        boxSizing: 'border-box',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#F9FAFB',
        gap: 0,
      }}
    >
      <LabelFormPageHeader
        title={pageTitle}
        onBack={handleBack}
        onCancel={handleBack}
        onSave={handleSave}
        loading={isSaving}
        disabled={!isDirty || !canSubmitByTenant}
        cancelPermission={productCollectionButtonPermission(
          mode === 'edit' ? 'edit_cancel' : 'create_cancel',
          mode === 'edit' ? 'Hủy chỉnh sửa bộ sưu tập' : 'Hủy tạo bộ sưu tập',
          mode === 'edit' ? 'api_collection_update' : 'api_collection_create',
        )}
        savePermission={productCollectionButtonPermission(mode === 'edit' ? 'edit' : 'create', 'Lưu bộ sưu tập', mode === 'edit' ? 'api_collection_update' : 'api_collection_create')}
      />

      <Stack
        component="form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', p: 3, gap: 2, pb: 4 }}
      >
        <Box sx={{ ...cardSurfaceSx, p: 2 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: '#101828', mb: 2 }}>Thông tin chung</Typography>
          <Stack gap={2}>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <TextInput
                  label="Tên bộ sưu tập"
                  requiredMark
                  placeholder="VD: Summer"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                  name={field.name}
                  error={Boolean(fieldState.error)}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <TextInput
                  label="Mô tả"
                  placeholder="Mô tả bộ sưu tập"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                  name={field.name}
                  error={Boolean(fieldState.error)}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <StackRowAlignCenterJustBetween
              sx={{
                px: 2,
                py: 1.5,
                borderRadius: '10px',
                bgcolor: '#FEFCE8',
                border: '1px solid #EAB308',
                gap: 2,
              }}
            >
              <StackRowAlignCenter sx={{ gap: 1 }}>
                <Star01 size={18} color="#CA8A04" />
                <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#CA8A04' }}>Trạng thái</Typography>
              </StackRowAlignCenter>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <SwitchContentElement
                    content={field.value === CollectionStatus.ACTIVE ? 'Kích hoạt' : 'Vô hiệu hóa'}
                    name={field.name}
                    value={field.value === CollectionStatus.ACTIVE}
                    disabled={isSaving || !canSubmitByTenant}
                    onChange={(e) => {
                      const nextChecked = Boolean(e?.target?.value);
                      field.onChange(nextChecked ? CollectionStatus.ACTIVE : CollectionStatus.INACTIVE);
                    }}
                  />
                )}
              />
            </StackRowAlignCenterJustBetween>
          </Stack>
        </Box>

        <Stack sx={{ gap: 2, width: '100%' }}>
          <Box sx={{ p: '16px', border: '1px solid #E5E7EB', bgcolor: '#FFFFFF', borderRadius: '10px' }}>
            <DataTableToolbar
              embedded
              searchValue={formState.searchValue}
              onSearchChange={formState.setSearchValue}
              searchPlaceholder="Tìm theo Tên sản phẩm, Mã sản phẩm..."
              actions={toolbarActions}
            />
          </Box>

          {!hasProducts ? (
            <Stack
              sx={{
                minHeight: 320,
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #E5E7EB',
                borderRadius: '10px',
                bgcolor: '#FFFFFF',
              }}
            >
              <EmptyComponent />
            </Stack>
          ) : (
            <Stack sx={{ flexDirection: 'column', width: '100%', gap: 2 }}>
              <Box sx={{ ...cardSurfaceSx, px: 2, py: 1.5 }}>
                <StackRowAlignCenter gap={1.5} flexWrap="wrap">
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#344054' }}>{hasSelected ? `Đã chọn: ${formState.selectedRowIds.length}` : 'Chọn tất cả'}</Typography>
                  <CustomButton
                    variant="primary"
                    fullWidth={false}
                    startIcon={<XCircle size={20} />}
                    disabled={!hasSelected || isSaving}
                    onClick={() => setBulkDeleteOpen(true)}
                    {...productCollectionButtonPermission(mode === 'edit' ? 'edit' : 'create', 'Xóa sản phẩm khỏi bộ sưu tập', mode === 'edit' ? 'api_collection_update' : 'api_collection_create')}
                    sx={{
                      borderRadius: '10px',
                      bgcolor: '#DC2626',
                      color: '#FFFFFF',
                      boxShadow: 'none',
                      '&:disabled': { bgcolor: '#FECACA', color: '#FFFFFF' },
                    }}
                  >
                    Xoá sản phẩm
                  </CustomButton>
                </StackRowAlignCenter>
              </Box>

              <Stack
                sx={{
                  minHeight: COLLECTION_FORM_TABLE_MIN_HEIGHT,
                  borderRadius: '10px 10px 0 0',
                  border: '1px solid #E5E7EB',
                  borderBottom: '1px solid #E5E7EB',
                  overflow: 'hidden',
                  bgcolor: '#FFFFFF',
                }}
              >
                <DataTable
                  rows={formState.pagedRows}
                  columns={columns}
                  getRowId={(r) => r.id}
                  selectable
                  selectedRowIds={formState.selectedRowIds}
                  onToggleSelectAll={(checked, rows) => formState.setSelectedRowIds(checked ? rows.map((r) => r.id) : [])}
                  onToggleSelectRow={(row, checked) => formState.setSelectedRowIds((prev) => (checked ? [...prev, row.id] : prev.filter((id) => id !== row.id)))}
                  tableMinWidth={COLLECTION_PRODUCT_TABLE_MIN_WIDTH}
                  containerSx={{
                    minHeight: COLLECTION_FORM_TABLE_MIN_HEIGHT,
                    height: COLLECTION_FORM_TABLE_MIN_HEIGHT,
                    '& .MuiTable-root': { width: '100%', minWidth: COLLECTION_PRODUCT_TABLE_MIN_WIDTH },
                  }}
                  emptyTitle="Không có sản phẩm"
                  emptyDescription="Bộ sưu tập chưa có sản phẩm nào."
                />
              </Stack>

              <Box>
                <DataTablePagination
                  page={formState.page}
                  pageSize={formState.pageSize}
                  totalItems={totalRows}
                  pageSizeOptions={[...COLLECTION_DETAIL_PAGE_SIZE_OPTIONS]}
                  itemLabel="sản phẩm"
                  summaryMode="total"
                  onPageChange={formState.setPage}
                  onPageSizeChange={formState.setPageSize}
                />
              </Box>
            </Stack>
          )}
        </Stack>
      </Stack>

      <CollectionDetailCreatePart open={addProductOpen} existingProductIds={formState.draftProductIds} onClose={() => setAddProductOpen(false)} onConfirmAddProducts={formState.stageAddProducts} />

      <DialogConfirmComponent
        open={bulkDeleteOpen}
        loading={isSaving}
        onClose={() => (isSaving ? undefined : setBulkDeleteOpen(false))}
        title="Xác nhận xoá sản phẩm"
        highlight={{
          tone: 'danger',
          title: `Bạn đang xoá ${formState.selectedRowIds.length} sản phẩm khỏi bộ sưu tập`,
          description: 'Thay đổi sẽ được áp dụng khi bạn lưu bộ sưu tập.',
        }}
        cancelLabel="Quay lại"
        confirmLabel="Xác nhận xoá"
        confirmButtonProps={productCollectionButtonPermission(
          mode === 'edit' ? 'edit' : 'create',
          'Xác nhận xóa sản phẩm khỏi bộ sưu tập',
          mode === 'edit' ? 'api_collection_update' : 'api_collection_create',
        )}
        onCancel={() => setBulkDeleteOpen(false)}
        onConfirm={() => {
          void formState.handleDeleteSelected();
          setBulkDeleteOpen(false);
        }}
      />

      <DialogConfirmComponent
        open={Boolean(singleDeleteRow)}
        loading={isSaving}
        onClose={() => (isSaving ? undefined : setSingleDeleteRow(null))}
        title="Xác nhận xoá sản phẩm"
        highlight={{
          tone: 'danger',
          title: `Bạn đang xoá sản phẩm ${singleDeleteRow?.product.name ?? ''}`,
          description: 'Thay đổi sẽ được áp dụng khi bạn lưu bộ sưu tập.',
        }}
        cancelLabel="Quay lại"
        confirmLabel="Xác nhận xoá"
        confirmButtonProps={productCollectionButtonPermission(
          mode === 'edit' ? 'edit' : 'create',
          'Xác nhận xóa sản phẩm khỏi bộ sưu tập',
          mode === 'edit' ? 'api_collection_update' : 'api_collection_create',
        )}
        onCancel={() => setSingleDeleteRow(null)}
        onConfirm={() => {
          if (singleDeleteRow) formState.handleDeleteRow(singleDeleteRow);
          setSingleDeleteRow(null);
        }}
      />

      <DialogConfirmComponent
        open={leaveUnsavedOpen}
        loading={isSaving}
        onClose={() => (isSaving ? undefined : setLeaveUnsavedOpen(false))}
        title="Xác nhận thoát trang"
        highlight={{
          tone: 'info',
          title: 'Bạn có chắc chắn muốn thoát trang này?',
          description: 'Các thay đổi chưa được lưu sẽ bị mất. Bạn có thể lưu thay đổi trước khi thoát.',
        }}
        cancelLabel="Hủy"
        confirmLabel="Lưu"
        confirmVariant="primary"
        confirmButtonProps={productCollectionButtonPermission(
          mode === 'edit' ? 'edit' : 'create',
          'Lưu bộ sưu tập trước khi thoát',
          mode === 'edit' ? 'api_collection_update' : 'api_collection_create',
        )}
        onCancel={() => {
          handleDiscard();
          setLeaveUnsavedOpen(false);
          goToList();
        }}
        onConfirm={async () => {
          await handleSubmit(onSubmit)();
          setLeaveUnsavedOpen(false);
        }}
      />
    </Stack>
  );
};

export default CollectionFormPage;
