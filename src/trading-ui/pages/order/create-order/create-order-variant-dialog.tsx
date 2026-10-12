import AddTaskRounded from '@mui/icons-material/AddTaskRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import { Alert, Box, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography, Chip } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getOrderProductVariations, type IOrderPackagingRelation, type IOrderProductDetail, type IOrderProductVariation, type IOrderProductVariationListItem } from '../../../apis/order';
import { QuantityNumberSpinner } from '../../../components/form';
import { CustomButton, PermissionIconButton } from '../../../components/button';

import { PRODUCT_SPU_DEFAULT_IMAGE_SRC } from '../../product/product-spu/product-spu.constant';
import { formatVnd, resolveCartLineCompareAtPrice, resolveCartLineSellingPrice, resolveOrderProductVariationPricing } from '../../../common/utils/order/create-order.utils';
import { AlertCircle } from '@untitledui/icons';
import { OrderPackagingRelations } from './components/order-packaging-relations.component';

const outlinedBtn = {
  height: 40,
  textTransform: 'none' as const,
  borderRadius: 2,
  borderColor: '#D0D5DD',
  color: '#111827',
  fontWeight: 600,
  fontSize: 13,
};

const primaryBtn = {
  height: 40,
  textTransform: 'none' as const,
  borderRadius: 2,
  backgroundColor: '#111827',
  fontWeight: 700,
  fontSize: 13,
  boxShadow: 'none',
  '&:hover': { backgroundColor: '#0B1220', boxShadow: 'none' },
};

export interface CreateOrderVariantDialogProps {
  open: boolean;
  productId: string | null;
  /** Từ catalog — API variations chỉ trả mảng biến thể, không có tên/ảnh SP gốc. */
  productName?: string;
  productImage?: string | null;
  packagingRelations?: IOrderPackagingRelation[];
  onClose: () => void;
  onAddToOrder: (payload: { variation: IOrderProductVariation; quantity: number; product: IOrderProductDetail }) => void;
}

interface AttrAxis {
  code: string;
  name: string;
  /** Các giá trị unique — thứ tự xuất hiện đầu tiên trong API response. */
  values: string[];
  sortedIndex: number;
}

const sortMedias = (medias: IOrderProductVariationListItem['medias']) => [...medias].sort((a, b) => a.sortOrder - b.sortOrder);

const sortAttrs = (attrs: IOrderProductVariationListItem['attributes']) => [...attrs].sort((a, b) => a.attributeCode.localeCompare(b.attributeCode));

/**
 * Tính các trục thuộc tính từ danh sách biến thể thô.
 * Mỗi trục = 1 attributeCode với toàn bộ giá trị unique theo thứ tự xuất hiện.
 */
const buildAttrAxes = (items: IOrderProductVariationListItem[]): AttrAxis[] => {
  const axisMap = new Map<string, AttrAxis>();
  for (const item of items) {
    const sorted = sortAttrs(item.attributes ?? []);
    sorted.forEach((attr, i) => {
      const val = (attr.value ?? '').trim();
      if (!val) return;
      if (!axisMap.has(attr.attributeCode)) {
        axisMap.set(attr.attributeCode, { code: attr.attributeCode, name: attr.attributeName, values: [], sortedIndex: i });
      }
      const entry = axisMap.get(attr.attributeCode)!;
      if (!entry.values.includes(val)) entry.values.push(val);
    });
  }
  return Array.from(axisMap.values()).sort((a, b) => a.sortedIndex - b.sortedIndex);
};

/** Auto-select giá trị đầu tiên của mọi trục (người dùng vẫn có thể đổi). */
const buildAutoSelections = (axes: AttrAxis[]): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const axis of axes) {
    if (axis.values.length > 0) result[axis.code] = axis.values[0];
  }
  return result;
};

/** Tìm biến thể khớp với selectedAttrs từ mảng sourceItems. */
const findVariationByAttrs = (items: IOrderProductVariationListItem[], selected: Record<string, string>): IOrderProductVariationListItem | null => {
  return (
    items.find((item) =>
      item.attributes.every((attr) => {
        const expected = selected[attr.attributeCode];
        return !expected || (attr.value ?? '').trim() === expected;
      }),
    ) ?? null
  );
};

const getAttributeOptionImage = (items: IOrderProductVariationListItem[], sortedAttrIndex: number, value: string): string | null => {
  for (const row of items) {
    const sorted = sortAttrs(row.attributes ?? []);
    const attr = sorted[sortedAttrIndex];
    if ((attr?.value ?? '').trim() !== value.trim()) continue;
    const image = attr?.image?.trim();
    if (image) return image;
  }
  return null;
};

/** Map GET order/orders/product/{id}/variations (mảng) → IOrderProductDetail cho modal. */
const mapOrderVariationsApiToDetail = (
  productId: string,
  productName: string,
  productImage: string | undefined,
  items: IOrderProductVariationListItem[],
  fallbackPackagingRelations?: IOrderPackagingRelation[],
): IOrderProductDetail => {
  const heroImage = productImage?.trim() || (items[0] ? sortMedias(items[0].medias)[0]?.url : undefined) || '';

  const variations: IOrderProductVariation[] = items.map((row) => {
    const sorted = sortAttrs(row.attributes ?? []);
    const firstMedia = sortMedias(row.medias ?? [])[0]?.url?.trim();
    const pricing = resolveOrderProductVariationPricing(row);
    const rowPackaging = row.packagingRelations?.length ? row.packagingRelations : (fallbackPackagingRelations ?? []);
    return {
      id: row.id,
      skuCode: row.skuCode,
      unitPrice: pricing.unitPrice,
      salePrice: pricing.salePrice,
      customerDisplayPrice: pricing.customerDisplayPrice,
      stockQuantity: row.stock ?? 0,
      colorLabel: sorted[0]?.value?.trim() ? sorted[0].value : null,
      sizeLabel: sorted[1]?.value?.trim() ? sorted[1].value : null,
      weightLabel: null,
      imageUrl: firstMedia || null,
      weightGram: row.weightGram ?? 0,
      lengthCm: row.lengthCm ?? 0,
      widthCm: row.widthCm ?? 0,
      heightCm: row.heightCm ?? 0,
      packagingRelations: rowPackaging,
    };
  });

  return {
    id: productId,
    name: productName,
    image: heroImage,
    variations,
  };
};

type AttributeOptionControlProps = {
  value: string;
  selected: boolean;
  imageUrl: string | null;
  disabled?: boolean;
  onSelect: () => void;
};

const AttributeOptionControl = ({ value, selected, imageUrl, disabled = false, onSelect }: AttributeOptionControlProps) => {
  if (imageUrl) {
    return (
      <Box
        component="button"
        type="button"
        aria-label={value}
        onClick={onSelect}
        disabled={disabled}
        sx={{
          p: 0,
          width: 22,
          height: 22,
          border: selected ? '2px solid #111827' : '1px solid #E5E7EB',
          borderRadius: 1,
          bgcolor: '#fff',
          cursor: disabled ? 'default' : 'pointer',
          overflow: 'hidden',
          flexShrink: 0,
          opacity: disabled ? 0.5 : 1,
          '&:hover': { borderColor: disabled ? undefined : '#111827' },
        }}
      >
        <Box component="img" src={imageUrl} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </Box>
    );
  }

  return (
    <Chip
      label={value}
      onClick={disabled ? undefined : onSelect}
      sx={{
        fontWeight: 600,
        bgcolor: selected ? '#111827' : '#fff',
        color: selected ? '#fff' : '#111827',
        border: '1px solid #E5E7EB',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        '&:hover': { bgcolor: disabled ? undefined : selected ? '#0B1220' : '#F8FAFC' },
      }}
    />
  );
};

export const CreateOrderVariantDialog = ({ open, productId, productName, productImage, packagingRelations, onClose, onAddToOrder }: CreateOrderVariantDialogProps) => {
  const [detail, setDetail] = useState<IOrderProductDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sourceItems, setSourceItems] = useState<IOrderProductVariationListItem[]>([]);
  const [attrAxes, setAttrAxes] = useState<AttrAxis[]>([]);
  /** selectedAttrs: { [attributeCode]: selectedValue } */
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [showVariantHint, setShowVariantHint] = useState(false);

  useEffect(() => {
    if (!open || !productId) return;
    let cancelled = false;

    setLoading(true);
    setLoadError(null);
    setDetail(null);
    setSourceItems([]);
    setAttrAxes([]);
    setSelectedAttrs({});
    setQuantity(1);
    setShowVariantHint(false);

    void (async () => {
      try {
        const items = await getOrderProductVariations(productId);
        if (cancelled) return;

        const axes = buildAttrAxes(items);
        const autoSelections = buildAutoSelections(axes);

        setSourceItems(items);
        setAttrAxes(axes);
        setSelectedAttrs(autoSelections);

        const name = productName?.trim() || 'Sản phẩm';
        const mapped = mapOrderVariationsApiToDetail(productId, name, productImage ?? undefined, items, packagingRelations);
        setDetail(mapped);
      } catch {
        if (!cancelled) setLoadError('Không tải được biến thể sản phẩm.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, productId, productName, productImage, packagingRelations]);

  /** Các trục có 2+ giá trị → user phải chọn. */
  const requiredAxes = useMemo(() => attrAxes.filter((ax) => ax.values.length > 1), [attrAxes]);
  const hasMissingRequiredAttributes = requiredAxes.some((ax) => !selectedAttrs[ax.code]);

  /** Biến thể khớp trong sourceItems. */
  const resolvedItem = useMemo(() => {
    if (sourceItems.length === 0 || hasMissingRequiredAttributes) return null;
    return findVariationByAttrs(sourceItems, selectedAttrs);
  }, [sourceItems, selectedAttrs, hasMissingRequiredAttributes]);

  /** IOrderProductVariation tương ứng (dùng cho cart/pricing). */
  const resolved = useMemo(() => {
    if (!resolvedItem || !detail) return null;
    return (detail.variations ?? []).find((v) => v.id === resolvedItem.id) ?? null;
  }, [resolvedItem, detail]);

  /** Ảnh preview theo biến thể đã resolve hoặc ảnh đại diện SP. */
  const previewImageUrl = useMemo(() => {
    if (!detail) return PRODUCT_SPU_DEFAULT_IMAGE_SRC;
    if (resolved?.imageUrl?.trim()) return resolved.imageUrl.trim();
    return detail.image?.trim() || PRODUCT_SPU_DEFAULT_IMAGE_SRC;
  }, [detail, resolved]);

  const maxQty = resolved ? Math.max(0, resolved.stockQuantity) : 0;

  useEffect(() => {
    if (maxQty < 1) return;
    setQuantity((q) => Math.min(Math.max(1, q), maxQty));
  }, [maxQty]);

  const selectionComplete = resolved !== null && maxQty > 0 && quantity >= 1 && quantity <= maxQty;

  const infoVisible = Boolean(resolved && resolved.stockQuantity > 0 && !hasMissingRequiredAttributes);
  const displayPrice = resolved ? resolveCartLineSellingPrice(resolved) : 0;
  const compareAtPrice = resolved ? resolveCartLineCompareAtPrice(resolved) : null;
  const handleAdd = useCallback(() => {
    if (!detail || !resolved || resolved.stockQuantity <= 0) {
      setShowVariantHint(true);
      return;
    }
    if (hasMissingRequiredAttributes) {
      setShowVariantHint(true);
      return;
    }
    if (quantity < 1 || quantity > resolved.stockQuantity) return;
    const lineImage = (resolved.imageUrl?.trim() || detail.image || PRODUCT_SPU_DEFAULT_IMAGE_SRC).trim();
    onAddToOrder({ variation: resolved, quantity, product: { ...detail, image: lineImage } });
    onClose();
  }, [detail, resolved, hasMissingRequiredAttributes, quantity, onAddToOrder, onClose]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, border: '1px solid #E5E7EB' } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', pr: 1, pb: 1 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: 18, color: '#111827', pr: 2 }}>{detail?.name ?? 'Đang tải...'}</Typography>
          {detail?.subtitle ? <Typography sx={{ fontSize: 13, color: '#64748B', mt: 0.5 }}>{detail.subtitle}</Typography> : null}
        </Box>
        <PermissionIconButton onClick={onClose} size="small" aria-label="Đóng">
          <CloseRounded />
        </PermissionIconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: '#EAECF0' }}>
        {loadError ? (
          <Alert severity="error">{loadError}</Alert>
        ) : (
          <Stack spacing={2.5}>
            {/* Ảnh preview */}
            <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <Box component="img" src={previewImageUrl || PRODUCT_SPU_DEFAULT_IMAGE_SRC} alt="" sx={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
            </Box>

            {loading ? <Typography fontSize={14}>Đang tải biến thể...</Typography> : null}

            {/* Thông tin biến thể đã chọn */}
            {infoVisible && resolved ? (
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography fontSize={13} color="text.secondary">
                      SKU
                    </Typography>
                    <Typography fontSize={13} fontWeight={700}>
                      {resolved.skuCode}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography fontSize={13} color="text.secondary">
                      Giá
                    </Typography>
                    <Typography fontSize={13} fontWeight={700}>
                      {formatVnd(displayPrice)}
                      {compareAtPrice && compareAtPrice > displayPrice ? (
                        <Typography component="span" sx={{ ml: 1, color: '#94A3B8', textDecoration: 'line-through' }}>
                          {formatVnd(compareAtPrice)}
                        </Typography>
                      ) : null}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography fontSize={13} color="text.secondary">
                      Tồn kho
                    </Typography>
                    <Typography fontSize={13} fontWeight={600} color="#16A34A">
                      Còn {resolved.stockQuantity} sản phẩm
                    </Typography>
                  </Stack>
                  {resolved.weightLabel ? (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontSize={13} color="text.secondary">
                        Trọng lượng
                      </Typography>
                      <Typography fontSize={13}>{resolved.weightLabel}</Typography>
                    </Stack>
                  ) : null}
                </Stack>
              </Box>
            ) : null}

            {/* Trục thuộc tính — auto-select giá trị đầu tiên mọi trục; trục 1 giá trị bị lock */}
            {attrAxes.map((axis, axisIndex) => {
              const isSingleValue = axis.values.length === 1;
              return (
                <Box key={axis.code}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1 }}>
                    {axis.name}{' '}
                    {!isSingleValue ? (
                      <Box component="span" sx={{ color: 'error.main' }}>
                        *
                      </Box>
                    ) : null}
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {axis.values.map((val) => (
                      <AttributeOptionControl
                        key={val}
                        value={val}
                        selected={selectedAttrs[axis.code] === val}
                        imageUrl={getAttributeOptionImage(sourceItems, axisIndex, val)}
                        disabled={isSingleValue}
                        onSelect={() => {
                          setSelectedAttrs((prev) => ({ ...prev, [axis.code]: val }));
                          setShowVariantHint(false);
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              );
            })}

            {/* Số lượng */}
            <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" useFlexGap>
              <Typography fontWeight={600} fontSize={14} sx={{ flexShrink: 0 }}>
                Số lượng
              </Typography>
              <QuantityNumberSpinner value={quantity} min={1} max={resolved ? Math.max(1, maxQty) : 1} disabled={!resolved || maxQty < 1} onCommit={setQuantity} />
              {resolved ? (
                <Typography fontSize={13} color="text.secondary">
                  (Tối đa: {maxQty})
                </Typography>
              ) : null}
            </Stack>

            {/* Cảnh báo */}
            {hasMissingRequiredAttributes || showVariantHint || (resolved && resolved.stockQuantity <= 0) ? (
              <Alert icon={<AlertCircle />} severity="warning" sx={{ bgcolor: '#FFFBEB', border: '1px solid #FEE685', borderRadius: '10px', mt: '6px !important' }}>
                {resolved && resolved.stockQuantity <= 0
                  ? 'Biến thể này đã hết hàng.'
                  : `Vui lòng chọn đầy đủ: ${requiredAxes
                      .filter((ax) => !selectedAttrs[ax.code])
                      .map((ax) => ax.name)
                      .join(', ')}`}
              </Alert>
            ) : null}

            {resolved?.packagingRelations?.length ? <OrderPackagingRelations relations={resolved.packagingRelations} merchandiseQuantity={quantity} /> : null}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <CustomButton fullWidth={false} variant="outline" onClick={onClose} sx={outlinedBtn}>
          Huỷ
        </CustomButton>
        <CustomButton fullWidth={false} variant="primary" startIcon={<AddTaskRounded />} disabled={!selectionComplete || !!loadError} onClick={handleAdd} sx={primaryBtn}>
          Thêm vào đơn
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};
