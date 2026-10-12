import { closestCenter, DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DeleteOutlineRounded } from '@mui/icons-material';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { ImageElement } from '@/trading-ui/adapters/library';
import { Plus } from '@untitledui/icons';
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import IconDrag02 from '../../../../assets/icon/icon-drag-02';
import { OrderType } from '@/trading-ui/adapters/library';
import useSWR from 'swr';
import { productApi, ProductKind, type Product, type ProductMixMatchItem } from '../../../../apis';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { ButtonIconContentComponent } from '../../../../components/button';
import { DialogComponent } from '../../../../components/dialog';
import { SearchInput } from '../../../../components/form';
import { LoadingComponent } from '../../../../components/loading/loading.component';
import { StackAlignEnd, StackRowAlignCenter, StackRowAlignJustCenter } from '../../../../components/styled';
import { CollectionDetailCatalogRow } from '../../product-category/collection/collection-detail/components/collection-detail-catalog-row.component';
import { PRODUCT_SPU_DEFAULT_IMAGE_SRC } from '../product-spu.constant';
import { formatProductMoney } from '../utils/product-spu-currency.utils';

const LIST_QUERY = {
  orderType: OrderType.DESC,
  orderBy: 'updatedAt' as const,
  isPagination: false,
  productKind: ProductKind.MERCHANDISE,
};

const THUMB_PX = 42;

const toMixMatchItem = (product: Product): ProductMixMatchItem => {
  const defaultVariation = product.variations?.find((variation) => variation.id === product.defaultVariationId) ?? product.variations?.[0];
  const sellingPrice = defaultVariation?.sellingPriceAfterTaxMinor;

  return {
    id: product.id,
    name: product.name,
    spuCode: product.spuCode,
    image: product.image ?? product.imageHover ?? null,
    sellingPriceAfterTaxMinor: sellingPrice !== null && sellingPrice !== undefined ? String(sellingPrice) : null,
  };
};

const getMixMatchPriceLabel = (item: ProductMixMatchItem): string => {
  const formatted = formatProductMoney(item.sellingPriceAfterTaxMinor);
  return formatted ? `${formatted}đ` : '—';
};

const MixMatchSelectedRow: React.FC<{
  item: ProductMixMatchItem;
  readOnly?: boolean;
  onRemove?: () => void;
}> = ({ item, readOnly, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: readOnly,
  });

  const rowStyle: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.92 : 1,
  };

  return (
    <StackRowAlignCenter ref={setNodeRef} style={rowStyle} sx={{ gap: 1.5, border: '1px solid #E5E7EB', borderRadius: 1.5, p: 1.25, bgcolor: '#FFF' }}>
      {readOnly ? null : (
        <Box {...attributes} {...listeners} aria-label="Kéo để sắp xếp" sx={{ cursor: 'grab', display: 'flex', alignItems: 'center', color: '#9CA3AF', flexShrink: 0 }}>
          <IconDrag02 />
        </Box>
      )}
      <StackRowAlignJustCenter width={THUMB_PX} height={THUMB_PX} borderRadius="8px" bgcolor="#F2F4F7" sx={{ overflow: 'hidden', flexShrink: 0 }}>
        <ImageElement url={item.image || PRODUCT_SPU_DEFAULT_IMAGE_SRC} sx={{ width: THUMB_PX, height: THUMB_PX, objectFit: 'contain' }} />
      </StackRowAlignJustCenter>
      <Stack sx={{ flex: 1, minWidth: 0, gap: 0.25 }}>
        <Typography noWrap sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>
          {item.name}
        </Typography>
        <Typography noWrap sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>
          Mã sản phẩm: {item.spuCode}
        </Typography>
      </Stack>
      <StackAlignEnd sx={{ flexShrink: 0, gap: 0 }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>{getMixMatchPriceLabel(item)}</Typography>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>đơn giá</Typography>
      </StackAlignEnd>
      {readOnly || !onRemove ? null : (
        <IconButton size="small" aria-label="Xóa sản phẩm" onClick={onRemove}>
          <DeleteOutlineRounded fontSize="small" />
        </IconButton>
      )}
    </StackRowAlignCenter>
  );
};

const MixMatchPickDialog: React.FC<{
  open: boolean;
  excludeProductId?: string;
  selectedIds: string[];
  onClose: () => void;
  onApply: (pickedIds: string[], products: Product[]) => void;
}> = ({ open, excludeProductId, selectedIds, onClose, onApply }) => {
  const [search, setSearch] = useState('');
  const [pickedIds, setPickedIds] = useState<Set<string>>(() => new Set(selectedIds));

  const { data, isLoading } = useSWR(open ? (['product-spu-mix-match-pick', search] as const) : null, () =>
    productApi.getAdminProductList({
      ...LIST_QUERY,
      search: search.trim() || undefined,
    }),
  );

  const products = useMemo(() => (data?.list ?? []).filter((product) => product.id !== excludeProductId), [data?.list, excludeProductId]);

  useEffect(() => {
    if (!open) return;
    setPickedIds(new Set(selectedIds));
    setSearch('');
  }, [open, selectedIds]);

  if (!open) return null;

  const toggleId = (id: string, checked: boolean) => {
    setPickedIds((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  return (
    <DialogComponent
      open
      onClose={onClose}
      title="Thêm sản phẩm"
      maxWidth="md"
      buttonLeft={{ content: 'Hủy', variant: 'outlined', onClick: onClose }}
      buttonRight={{
        content: 'Áp dụng',
        variant: 'contained',
        onClick: () => {
          onApply([...pickedIds], products);
          onClose();
        },
      }}
    >
      <Stack gap={2} sx={{ minHeight: 0, maxHeight: 'min(60vh, 520px)' }}>
        <SearchInput debounceMs={320} placeholder="Tìm theo tên sản phẩm, mã sản phẩm..." onDebouncedChange={setSearch} />
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#475467' }}>Đã chọn: {pickedIds.size} sản phẩm</Typography>
        <Stack sx={{ flex: 1, minHeight: 0, overflowY: 'auto', gap: 1.5 }}>
          {isLoading ? (
            <LoadingComponent size="small" />
          ) : products.length === 0 ? (
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085', py: 2, textAlign: 'center' }}>Không tìm thấy sản phẩm phù hợp.</Typography>
          ) : (
            products.map((product) => (
              <CollectionDetailCatalogRow key={product.id} product={product} checked={pickedIds.has(product.id)} onToggleChecked={(checked) => toggleId(product.id, checked)} />
            ))
          )}
        </Stack>
      </Stack>
    </DialogComponent>
  );
};

export interface ProductSpuMixMatchEditorProps {
  value: string[];
  resolvedItems?: ProductMixMatchItem[];
  onChange?: (next: string[]) => void;
  readOnly?: boolean;
  excludeProductId?: string;
}

export const ProductSpuMixMatchEditor = ({ value, resolvedItems, onChange, readOnly = false, excludeProductId }: ProductSpuMixMatchEditorProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pickedItems, setPickedItems] = useState<ProductMixMatchItem[]>([]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const itemById = useMemo(() => {
    const map = new Map<string, ProductMixMatchItem>();
    [...(resolvedItems ?? []), ...pickedItems].forEach((item) => map.set(item.id, item));
    return map;
  }, [pickedItems, resolvedItems]);

  const displayItems = useMemo(() => value.map((id) => itemById.get(id)).filter((item): item is ProductMixMatchItem => Boolean(item)), [itemById, value]);

  const handleDialogApply = (pickedIds: string[], listProducts: Product[]) => {
    const fromList = new Map(listProducts.map((product) => [product.id, toMixMatchItem(product)]));
    const nextItems = pickedIds.map((id) => fromList.get(id) ?? itemById.get(id)).filter((item): item is ProductMixMatchItem => Boolean(item));
    setPickedItems(nextItems);
    onChange?.(pickedIds);
  };

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (readOnly || !onChange) return;
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = value.findIndex((id) => id === active.id);
      const newIndex = value.findIndex((id) => id === over.id);
      if (oldIndex < 0 || newIndex < 0) return;

      onChange(arrayMove(value, oldIndex, newIndex));
    },
    [onChange, readOnly, value],
  );

  const selectedRows = (
    <Stack gap={1}>
      {displayItems.map((item) => (
        <MixMatchSelectedRow key={item.id} item={item} readOnly={readOnly} onRemove={readOnly ? undefined : () => onChange?.(value.filter((id) => id !== item.id))} />
      ))}
    </Stack>
  );

  return (
    <Stack gap={1}>
      {readOnly ? null : <ButtonIconContentComponent icon={<Plus size={20} color="#737373" />} content="Thêm sản phẩm" onClick={() => setDialogOpen(true)} sx={{ width: 'fit-content' }} />}

      {displayItems.length === 0 ? (
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085' }}>Chưa chọn sản phẩm mua kèm.</Typography>
      ) : readOnly ? (
        selectedRows
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEnd}>
          <SortableContext items={value} strategy={verticalListSortingStrategy}>
            {selectedRows}
          </SortableContext>
        </DndContext>
      )}

      <MixMatchPickDialog open={dialogOpen} excludeProductId={excludeProductId} selectedIds={value} onClose={() => setDialogOpen(false)} onApply={handleDialogApply} />
    </Stack>
  );
};
