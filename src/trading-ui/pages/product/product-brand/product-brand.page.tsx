import { Box, Stack } from '@mui/material';
import { WrapperComponent } from '../../../components/wrapper';
import { PRODUCT_BRAND_STATUS_OPTIONS, type ProductBrandStatusFilter } from './product-brand.constant';
import type { ProductBrand } from './product-brand.interface';
import { ProductBrandCard } from './components/product-brand-card.component';
import { ProductBrandCreatePart } from './parts/product-brand-create/product-brand-create.part';
import { ProductBrandUpdatePart } from './parts/product-brand-update/product-brand-update.part';
import { DataTableToolbar } from '../../../components/data-table/data-table-toolbar';
import { useCallback, useMemo, useState } from 'react';
import { type DataTableToolbarAction } from '../../../components/data-table/data-table.types';
import { Plus } from '@untitledui/icons';
import { ProductBrandDeactivateConfirmDialog } from './components/product-brand-deactivate-confirm-dialog.component';
import { ProductBrandDeleteConfirmDialog } from './components/product-brand-delete-confirm-dialog.component';
import { EmptyComponent } from '../../../components/empty/empty.component';
import { BrandStatus, brandApi, type Brand } from '../../../apis';
import useSWR, { useSWRConfig } from 'swr';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { getErrorMessage } from '../../../common/utils';
import { deleteBrand } from '../../../apis/brand/brand.api';
import { PRODUCT_LIST_PAGE_SCOPE } from '../product-permission.constants';
import { useListPageViewAccess } from '../../../permissions/use-list-page-view-access.hook';
import { productListButtonPermission } from '../product-permission.constants';

const ProductBrandPage = () => {
  const { showSnackbar } = useSnackbar();
  const { mutate } = useSWRConfig();
  const canViewList = useListPageViewAccess(PRODUCT_LIST_PAGE_SCOPE, { listApiCode: 'api_brand_list' });

  // state
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductBrandStatusFilter>('ALL');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState<{ data?: ProductBrand; toggle: boolean }>({
    toggle: false,
  });
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState<{ data?: ProductBrand; toggle: boolean }>({
    toggle: false,
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<{ data?: ProductBrand; toggle: boolean }>({
    toggle: false,
  });
  const [deleting, setDeleting] = useState(false);

  const brandListSwrKey = useMemo(() => ['product/admin/brands', 'list', searchValue.trim(), statusFilter] as const, [searchValue, statusFilter]);

  const { data: brandRes, isLoading } = useSWR(
    brandListSwrKey,
    ([, , search, status]) =>
      brandApi.getBrandList({
        isPagination: false,
        ...(search ? { search } : {}),
        ...(status !== 'ALL' ? { status } : {}),
      }),
    { revalidateOnFocus: false },
  );

  const brands = useMemo((): ProductBrand[] => {
    const list = brandRes?.list ?? [];
    return list.map((b: Brand) => ({
      id: b.id,
      code: b.code,
      name: b.name,
      logoUrl: b.image ?? undefined,
      websiteUrl: b.websiteUrl ?? undefined,
      status: String(b.status).toLowerCase() === 'inactive' ? BrandStatus.INACTIVE : BrandStatus.ACTIVE,
    }));
  }, [brandRes]);

  const refreshBrands = useCallback(async () => {
    await mutate((key) => Array.isArray(key) && key[0] === 'product/admin/brands');
  }, [mutate]);

  const handleDeactivateConfirm = useCallback(async () => {
    const b = isDeactivateDialogOpen.data;
    if (!b?.id) return;
    try {
      await brandApi.updateBrand(b.id, { status: 'Inactive' });
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Vô hiệu hóa thương hiệu thành công' });
      await refreshBrands();
      setIsDeactivateDialogOpen({ data: undefined, toggle: false });
    } catch (err) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(err) });
    }
  }, [isDeactivateDialogOpen.data, refreshBrands, showSnackbar]);

  const handleDeleteConfirm = useCallback(async () => {
    const b = isDeleteDialogOpen.data;
    if (!b?.id) return;
    setDeleting(true);
    try {
      await deleteBrand(b.id);
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Xoá thương hiệu thành công' });
      await refreshBrands();
      setIsDeleteDialogOpen({ data: undefined, toggle: false });
    } catch (err) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(err) });
    } finally {
      setDeleting(false);
    }
  }, [isDeleteDialogOpen.data, refreshBrands, showSnackbar]);

  const toolbarActions = useMemo<DataTableToolbarAction[]>(
    () => [
      {
        key: 'add',
        label: 'Tạo thương hiệu',
        variant: 'contained',
        icon: <Plus color="#FFFFFF" fontSize={18} />,
        onClick: () => setIsCreateDialogOpen(true),
        ...productListButtonPermission('create_brand', 'Tạo thương hiệu', 'api_brand_create'),
      },
    ],
    [],
  );

  if (!canViewList) return null;

  return (
    <WrapperComponent label="Danh sách thương hiệu">
      <Stack>
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
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            searchPlaceholder="Tìm theo Tên sản phẩm, Mã sản phẩm..."
            actions={toolbarActions}
            filterSelect={{
              value: statusFilter,
              onChange: (v) => setStatusFilter(v as ProductBrandStatusFilter),
              options: PRODUCT_BRAND_STATUS_OPTIONS,
            }}
          />
        </Box>

        {!isLoading && brands.length === 0 ? (
          <EmptyComponent />
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
            }}
          >
            {brands.map((b: ProductBrand) => (
              <ProductBrandCard
                key={b.id}
                brand={b}
                onEdit={() => setIsUpdateDialogOpen({ data: b, toggle: true })}
                onToggleStatus={(brand, nextIsActive) => {
                  if (brand.status === BrandStatus.ACTIVE && nextIsActive === false) {
                    setIsDeactivateDialogOpen({ data: brand, toggle: true });
                  }
                }}
                onDelete={(brand) => setIsDeleteDialogOpen({ data: brand, toggle: true })}
              />
            ))}
          </Box>
        )}

        <ProductBrandCreatePart open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} onSuccess={refreshBrands} />

        {isUpdateDialogOpen.toggle && (
          <ProductBrandUpdatePart
            open={isUpdateDialogOpen.toggle}
            brandId={isUpdateDialogOpen.data?.id ?? ''}
            initialValues={{
              ...isUpdateDialogOpen.data,
              status: isUpdateDialogOpen.data?.status ?? BrandStatus.ACTIVE,
            }}
            onClose={() => setIsUpdateDialogOpen({ data: undefined, toggle: false })}
            onSuccess={async () => {
              await refreshBrands();
              setIsUpdateDialogOpen({ data: undefined, toggle: false });
            }}
          />
        )}

        <ProductBrandDeactivateConfirmDialog
          open={isDeactivateDialogOpen.toggle}
          brandName={isDeactivateDialogOpen.data?.name}
          onDismiss={() => setIsDeactivateDialogOpen({ data: undefined, toggle: false })}
          onConfirm={handleDeactivateConfirm}
        />

        <ProductBrandDeleteConfirmDialog
          open={isDeleteDialogOpen.toggle}
          loading={deleting}
          brandName={isDeleteDialogOpen.data?.name}
          onDismiss={() => setIsDeleteDialogOpen({ data: undefined, toggle: false })}
          onConfirm={handleDeleteConfirm}
        />
      </Stack>
    </WrapperComponent>
  );
};

export default ProductBrandPage;
