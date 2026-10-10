import { closestCenter, DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DeleteOutlineRounded, DragIndicatorRounded } from '@mui/icons-material';
import { Box, Checkbox, CircularProgress, Stack, Typography } from '@mui/material';
import { Plus } from '@untitledui/icons';
import React, { useCallback, useMemo, useState } from 'react';
import { OrderType } from '@/trading-ui/adapters/library';
import useSWR from 'swr';
import { productApi, type Product } from '../../../../apis';
import { resolveTenantBrandProductDefaultImageSrc } from '../../../../common/config/runtime-config';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { ButtonIconContentComponent, PermissionIconButton } from '../../../../components/button';
import { contentButtonPermission } from '../../content-permission.constants';
import { DialogComponent } from '../../../../components/dialog';
import { SearchInput } from '../../../../components/form';
import { StackRowAlignCenter } from '../../../../components/styled';
import { normalizeMixMatchSkus, PRODUCT_LIST_BANNER_MAX_MIX_MATCH_SKUS, type ProductListMixMatchSku } from '../utils/cms-product-list-block.utils';

export interface CmsMixMatchSkuPickerProps {
  value: ProductListMixMatchSku[];
  error?: string;
  maxItems?: number;
  disabled?: boolean;
  onChange: (next: ProductListMixMatchSku[]) => void;
}

interface MixMatchSelectedProduct {
  productId: string;
  spuCode: string;
  name: string;
  imageUrl: string;
}

interface ProductIndex {
  byReferenceId: Map<string, MixMatchSelectedProduct>;
}

const PRODUCT_PICKER_KEY = ['cms-mix-match-admin-products', 'resolve'] as const;

const getProductImageUrl = (product: Product): string => product.image?.trim() || product.imageHover?.trim() || '';

const productDefaultImageSrc = resolveTenantBrandProductDefaultImageSrc();

const mapProductToSelectedProduct = (product: Product): MixMatchSelectedProduct | null => {
  const productId = product.id?.trim();
  if (!productId) return null;

  const spuCode = product.spuCode?.trim() || productId;
  return {
    productId,
    spuCode,
    name: product.name?.trim() || spuCode,
    imageUrl: getProductImageUrl(product),
  };
};

const addProductReference = (byReferenceId: Map<string, MixMatchSelectedProduct>, referenceId: string | null | undefined, product: MixMatchSelectedProduct) => {
  const normalizedReferenceId = referenceId?.trim();
  if (!normalizedReferenceId || byReferenceId.has(normalizedReferenceId)) return;
  byReferenceId.set(normalizedReferenceId, product);
};

const buildProductIndex = (products: Product[]): ProductIndex => {
  const selectedProducts = products.map(mapProductToSelectedProduct).filter((product): product is MixMatchSelectedProduct => Boolean(product));
  const selectedByProductId = new Map(selectedProducts.map((product) => [product.productId, product]));
  const byReferenceId = new Map<string, MixMatchSelectedProduct>();

  products.forEach((product) => {
    const selectedProduct = selectedByProductId.get(product.id);
    if (!selectedProduct) return;

    addProductReference(byReferenceId, product.id, selectedProduct);
    addProductReference(byReferenceId, product.defaultVariationId, selectedProduct);
    (product.variations ?? []).forEach((variation) => addProductReference(byReferenceId, variation.id, selectedProduct));
  });

  return { byReferenceId };
};

const useAdminProductList = (enabled: boolean) =>
  useSWR(
    enabled ? PRODUCT_PICKER_KEY : null,
    () =>
      productApi.getAdminProductList({
        orderType: OrderType.DESC,
        orderBy: 'updatedAt',
        isPagination: false,
      }),
    { revalidateOnFocus: false },
  );

const mapSelectedProductToMixMatchItem = (product: MixMatchSelectedProduct, index: number): ProductListMixMatchSku => ({
  variationId: product.productId,
  sortOrder: index,
});

const SortableProductRow: React.FC<{
  item: ProductListMixMatchSku & { product?: MixMatchSelectedProduct };
  onRemove: (referenceId: string) => void;
  readOnly?: boolean;
}> = ({ item, onRemove, readOnly = false }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.variationId,
    disabled: readOnly,
  });
  const title = item.product?.name || item.variationId;
  const subtitle = item.product ? `Mã sản phẩm: ${item.product.spuCode}` : item.variationId;

  return (
    <StackRowAlignCenter
      ref={setNodeRef}
      sx={{
        gap: 1,
        border: '1px solid #E5E7EB',
        borderRadius: 1.5,
        p: 1,
        bgcolor: '#FFF',
        opacity: isDragging ? 0.8 : 1,
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      {!readOnly ? (
        <Box {...attributes} {...listeners} sx={{ display: 'flex', color: '#98A2B3', cursor: 'grab', flexShrink: 0 }}>
          <DragIndicatorRounded fontSize="small" />
        </Box>
      ) : null}
      <Box component="img" src={item.product?.imageUrl || productDefaultImageSrc} alt="" sx={{ width: 42, height: 42, objectFit: 'contain', borderRadius: 1, bgcolor: '#F3F4F6' }} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography noWrap sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>
          {title}
        </Typography>
        <Typography noWrap sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>
          {subtitle}
        </Typography>
      </Box>
      {!readOnly ? (
        <PermissionIconButton size="small" aria-label="Xóa sản phẩm" onClick={() => onRemove(item.variationId)} {...contentButtonPermission('cms_remove_sku', 'Xóa sản phẩm', 'api_cms_page_update')}>
          <DeleteOutlineRounded fontSize="small" />
        </PermissionIconButton>
      ) : null}
    </StackRowAlignCenter>
  );
};

const CmsMixMatchProductDialog: React.FC<{
  open: boolean;
  maxItems: number;
  initialSelected: MixMatchSelectedProduct[];
  products: Product[];
  isLoadingProducts: boolean;
  onClose: () => void;
  onApply: (next: MixMatchSelectedProduct[]) => void;
}> = ({ open, maxItems, initialSelected, products, isLoadingProducts, onClose, onApply }) => {
  if (!open) return null;

  return <CmsMixMatchProductDialogContent maxItems={maxItems} initialSelected={initialSelected} products={products} isLoadingProducts={isLoadingProducts} onClose={onClose} onApply={onApply} />;
};

const CmsMixMatchProductDialogContent: React.FC<{
  maxItems: number;
  initialSelected: MixMatchSelectedProduct[];
  products: Product[];
  isLoadingProducts: boolean;
  onClose: () => void;
  onApply: (next: MixMatchSelectedProduct[]) => void;
}> = ({ maxItems, initialSelected, products, isLoadingProducts, onClose, onApply }) => {
  const [search, setSearch] = useState('');
  const [selectedMap, setSelectedMap] = useState<Map<string, MixMatchSelectedProduct>>(() => new Map(initialSelected.map((product) => [product.productId, product])));
  const trimmedSearch = search.trim();
  const { data: searchData, isLoading: isSearching } = useSWR(
    trimmedSearch ? (['cms-mix-match-admin-product-list', trimmedSearch] as const) : null,
    () =>
      productApi.getAdminProductList({
        orderType: OrderType.DESC,
        orderBy: 'updatedAt',
        search: trimmedSearch,
        isPagination: false,
      }),
    { revalidateOnFocus: false },
  );
  const sourceProducts = useMemo(() => trimmedSearch ? (searchData?.list ?? []) : products, [trimmedSearch, searchData?.list, products]);
  const isLoading = trimmedSearch ? isSearching : isLoadingProducts;
  const rows = useMemo(() => sourceProducts.map(mapProductToSelectedProduct).filter((product): product is MixMatchSelectedProduct => Boolean(product)), [sourceProducts]);

  const [previousSelection, setPreviousSelection] = useState(initialSelected);
  if (previousSelection !== initialSelected) {
    setPreviousSelection(initialSelected);
    const next = new Map(selectedMap);
    initialSelected.forEach((product) => next.set(product.productId, product));
    setSelectedMap(next);
  }

  const toggleProduct = useCallback(
    (product: MixMatchSelectedProduct, checked: boolean) => {
      setSelectedMap((current) => {
        const next = new Map(current);
        if (checked && next.size < maxItems) next.set(product.productId, product);
        if (!checked) next.delete(product.productId);
        return next;
      });
    },
    [maxItems],
  );

  const handleApply = useCallback(() => {
    onApply(Array.from(selectedMap.values()).slice(0, maxItems));
    onClose();
  }, [maxItems, onApply, onClose, selectedMap]);

  return (
    <DialogComponent
      open
      onClose={onClose}
      title="Thêm sản phẩm"
      maxWidth="sm"
      buttonLeft={{ content: 'Hủy', variant: 'outlined', onClick: onClose }}
      buttonRight={{ content: 'Áp dụng', variant: 'contained', onClick: handleApply }}
    >
      <Stack spacing={2} sx={{ minHeight: 0, maxHeight: 'min(60vh, 520px)', display: 'flex', flexDirection: 'column' }}>
        <SearchInput debounceMs={320} placeholder="Tìm theo tên sản phẩm, mã sản phẩm..." onDebouncedChange={setSearch} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, flexShrink: 0 }} />
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#475467', flexShrink: 0 }}>
          Đã chọn: {selectedMap.size}/{maxItems} sản phẩm
        </Typography>
        <ProductDialogRows rows={rows} isLoading={isLoading} selectedMap={selectedMap} maxItems={maxItems} onToggleProduct={toggleProduct} />
      </Stack>
    </DialogComponent>
  );
};

const ProductDialogRows: React.FC<{
  rows: MixMatchSelectedProduct[];
  isLoading: boolean;
  selectedMap: Map<string, MixMatchSelectedProduct>;
  maxItems: number;
  onToggleProduct: (product: MixMatchSelectedProduct, checked: boolean) => void;
}> = ({ rows, isLoading, selectedMap, maxItems, onToggleProduct }) => (
  <Stack sx={{ flex: 1, minHeight: 0, overflowY: 'auto', border: '1px solid #E5E7EB', borderRadius: 2 }}>
    {isLoading ? (
      <Stack sx={{ alignItems: 'center', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={20} />
      </Stack>
    ) : rows.length === 0 ? (
      <Stack sx={{ alignItems: 'center', justifyContent: 'center', py: 4 }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>Không tìm thấy sản phẩm phù hợp.</Typography>
      </Stack>
    ) : (
      rows.map((product) => {
        const checked = selectedMap.has(product.productId);
        const disabled = !checked && selectedMap.size >= maxItems;

        return (
          <StackRowAlignCenter
            key={product.productId}
            gap={1.5}
            onClick={() => {
              if (disabled) return;
              onToggleProduct(product, !checked);
            }}
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: '1px solid #F3F4F6',
              alignItems: 'flex-start',
              cursor: disabled ? 'default' : 'pointer',
              '&:last-of-type': { borderBottom: 'none' },
              '&:hover': disabled ? undefined : { bgcolor: '#F9FAFB' },
            }}
          >
            <Checkbox size="small" checked={checked} disabled={disabled} tabIndex={-1} disableRipple sx={{ mt: 0.5 }} />
            <Box component="img" src={product.imageUrl || productDefaultImageSrc} alt="" sx={{ width: 48, height: 48, borderRadius: 1, objectFit: 'contain', flexShrink: 0, bgcolor: '#F3F4F6' }} />
            <Stack sx={{ flex: 1, minWidth: 0, gap: 0.5 }}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827', fontWeight: 600 }}>{product.name}</Typography>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>Mã sản phẩm: {product.spuCode}</Typography>
            </Stack>
          </StackRowAlignCenter>
        );
      })
    )}
  </Stack>
);

export const CmsMixMatchSkuPicker: React.FC<CmsMixMatchSkuPickerProps> = ({ value, error, maxItems = PRODUCT_LIST_BANNER_MAX_MIX_MATCH_SKUS, disabled = false, onChange }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewByProductId, setPreviewByProductId] = useState<Record<string, MixMatchSelectedProduct>>({});
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const normalizedItems = useMemo(() => normalizeMixMatchSkus(value).slice(0, maxItems), [maxItems, value]);
  const needsProductList = dialogOpen || normalizedItems.length > 0;
  const { data: productListData, isLoading: isLoadingProductList } = useAdminProductList(needsProductList);
  const productIndex = useMemo(() => buildProductIndex(productListData?.list ?? []), [productListData?.list]);
  const isLimitReached = normalizedItems.length >= maxItems;

  const resolveProduct = useCallback(
    (referenceId: string): MixMatchSelectedProduct | undefined => previewByProductId[referenceId] ?? productIndex.byReferenceId.get(referenceId),
    [previewByProductId, productIndex.byReferenceId],
  );

  const dialogInitialSelected = useMemo(() => {
    const selectedByProductId = new Map<string, MixMatchSelectedProduct>();
    normalizedItems.forEach((item) => {
      const product = resolveProduct(item.variationId);
      if (product) selectedByProductId.set(product.productId, product);
    });
    return Array.from(selectedByProductId.values());
  }, [normalizedItems, resolveProduct]);

  const displayItems = useMemo(
    () =>
      normalizedItems.map((item) => ({
        ...item,
        product: resolveProduct(item.variationId),
      })),
    [normalizedItems, resolveProduct],
  );

  const handleDialogApply = (selectedProducts: MixMatchSelectedProduct[]) => {
    setPreviewByProductId((current) => {
      const next = { ...current };
      selectedProducts.forEach((product) => {
        next[product.productId] = product;
      });
      return next;
    });
    onChange(selectedProducts.slice(0, maxItems).map(mapSelectedProductToMixMatchItem));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = normalizedItems.findIndex((item) => item.variationId === active.id);
    const newIndex = normalizedItems.findIndex((item) => item.variationId === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(normalizedItems, oldIndex, newIndex).map((item, index) => ({ ...item, sortOrder: index })));
  };

  return (
    <Stack gap={1}>
      <StackRowAlignCenter sx={{ justifyContent: 'space-between', gap: 1 }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#344054' }}>Chọn sản phẩm</Typography>
        {!disabled ? <ButtonIconContentComponent icon={<Plus size={20} color="#737373" />} content="Thêm sản phẩm" disabled={isLimitReached} onClick={() => setDialogOpen(true)} /> : null}
      </StackRowAlignCenter>

      {error ? <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#B42318' }}>{error}</Typography> : null}
      {isLimitReached ? <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>Đã đạt giới hạn tối đa {maxItems} sản phẩm cho một bộ.</Typography> : null}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={normalizedItems.map((item) => item.variationId)} strategy={verticalListSortingStrategy}>
          <Stack gap={1}>
            {displayItems.map((item) => (
              <SortableProductRow
                key={item.variationId}
                item={item}
                readOnly={disabled}
                onRemove={(referenceId) => onChange(normalizedItems.filter((current) => current.variationId !== referenceId))}
              />
            ))}
          </Stack>
        </SortableContext>
      </DndContext>

      <CmsMixMatchProductDialog
        open={dialogOpen}
        maxItems={maxItems}
        initialSelected={dialogInitialSelected}
        products={productListData?.list ?? []}
        isLoadingProducts={isLoadingProductList}
        onClose={() => setDialogOpen(false)}
        onApply={handleDialogApply}
      />
    </Stack>
  );
};
