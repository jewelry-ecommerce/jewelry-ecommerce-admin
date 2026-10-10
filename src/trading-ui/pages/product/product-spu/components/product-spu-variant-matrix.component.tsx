import { Box, Stack, Tab, Tabs, Typography } from '@mui/material';
import { memo, useCallback, useEffect, useMemo, useState, Fragment, type CSSProperties, type FC } from 'react';
import { closestCenter, DndContext, type DragEndEvent } from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconArrowDown } from '../../../../assets/icon';
import type { DataTableColumn } from '@/components/data-table';
import { DataTable } from '@/components/data-table';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { TagCommonComponent } from '../../../../components/tag';
import { SelectAttributeTreeInput } from '../../../../components/form/select-attribute-tree-input';
import { StackRowAlignCenter } from '../../../../components/styled';
import { useProductSpuVariantMatrix } from '../hooks/use-product-spu-variant-matrix.hook';
import type { AppliedAttributeSummary, ProductSpuSkuLeafFieldErrors, ProductSpuVariantMatrixProps, VariantMatrixRowVm } from '../product-spu.interface';
import { isStrictDescendantPath, variantMatrixLeafRowsToSkuMatrixDtos } from '../utils/product-spu-variant-matrix.utils';
import { ProductSpuMatrixFieldCell } from './product-spu-page-sections.component';
import { SwitchContentElement } from '../../../../components/switch/switch-content.element';
import IconDrag02 from '../../../../assets/icon/icon-drag-02';
import { LoadingComponent } from '../../../../components/loading/loading.component';
import { InfoCircle } from '@untitledui/icons';
import { PermissionIconButton } from '../../../../components/button';
import { DialogComponent } from '../../../../components/dialog';

import { TextFieldUpload } from '../../../../components/text-field-upload/text-field-upload.component';
import { EmptyComponent } from '@/components/empty/empty.component';
import { uploadMultipleImages } from '../../../../common/utils/image-upload.utils';
import { MediaVisibility } from '../../../../apis/file';
import {
  getProductSkuStatusLabelVi,
  mapTaxSourceDisplayLabel,
  PRODUCT_SPU_DEFAULT_IMAGE_SRC,
  PRODUCT_SPU_VARIANT_MEDIA_MAX_FILE_BYTES,
  PRODUCT_SPU_VARIANT_MEDIA_UPLOAD_HINT,
} from '../product-spu.constant';
import { ProductSkuStatus } from '@/trading-ui/apis/pim';
import { SnackbarType, useSnackbar } from '../../../../hooks/use-snackbar.hook';

const SortableAppliedAttributeSummaryRow: FC<{ summary: AppliedAttributeSummary }> = ({ summary }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: summary.attributeId,
  });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    width: '100%',
    ...(isDragging ? { boxShadow: '0 0 0 2px rgba(17,24,39,0.22)' } : {}),
  };
  return (
    <StackRowAlignCenter ref={setNodeRef} style={style} {...attributes} {...listeners} gap={1} sx={{ borderRadius: 1, py: 0.5 }}>
      <IconDrag02 />
      <StackRowAlignCenter gap={0.25} sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#000' }}>{summary.label}:</Typography>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#000' }}>{summary.valuesText}</Typography>
      </StackRowAlignCenter>
    </StackRowAlignCenter>
  );
};

const ProductSpuVariantMatrixInner: FC<ProductSpuVariantMatrixProps> = ({
  readOnly = false,
  isUpdate = false,
  appliedAttributeSummaries,
  attributeOrder,
  keyRows,
  attributeTreeOptions,
  appliedAttributesError = false,
  appliedAttributesErrorMessage,
  selectedAttributes,
  onSelectedAttributesChange,
  onAttributeSelectOpenChange,
  attributeTreeLoading = false,
  categoryTaxRate,
  productTaxRateOverride,
  skuMatrixPreviewFlatRows,
  skuMatrixPreviewLoading = false,
  enableSortableAttributeSummaries = false,
  onReorderAppliedAttributes,
  onLeafSkuRowsChange,
  skuMatrixLeafFieldErrors,
}) => {
  const usePreviewFlat = skuMatrixPreviewFlatRows !== undefined;
  const showSkuMatrixTable = usePreviewFlat ? skuMatrixPreviewFlatRows!.length > 0 : keyRows.length > 0 && attributeOrder.length > 0;

  const handleDragEndReorder = useCallback(
    (e: DragEndEvent) => {
      const { active, over } = e;
      if (!over || active.id === over.id) return;
      const ids = appliedAttributeSummaries.map((s) => s.attributeId);
      const oldIndex = ids.indexOf(String(active.id));
      const newIndex = ids.indexOf(String(over.id));
      if (oldIndex < 0 || newIndex < 0) return;
      onReorderAppliedAttributes?.(arrayMove(ids, oldIndex, newIndex));
    },
    [appliedAttributeSummaries, onReorderAppliedAttributes],
  );

  const { visibleFlatVm, collapsedGroupRowIds, toggleCollapsedRow, patchField, onParentCascadeFieldBlur, flatVm } = useProductSpuVariantMatrix({
    readOnly,
    attributeOrder,
    keyRows,
    categoryTaxRate,
    productTaxRateOverride,
    previewMatrixFlatRows: skuMatrixPreviewFlatRows,
  });

  const leafRowIdToFieldErrors = useMemo(() => {
    const map = new Map<string, ProductSpuSkuLeafFieldErrors>();
    const errs = skuMatrixLeafFieldErrors;
    if (!errs?.length) return map;
    const leaves = flatVm.filter((r) => !r.isGroup && r.leafAttributeValueUuids?.length);
    leaves.forEach((r, i) => {
      const rowErr = errs[i];
      if (rowErr) map.set(r.id, rowErr);
    });
    return map;
  }, [flatVm, skuMatrixLeafFieldErrors]);

  const leafFieldError = useCallback((rowId: string, field: keyof ProductSpuSkuLeafFieldErrors) => leafRowIdToFieldErrors.get(rowId)?.[field], [leafRowIdToFieldErrors]);
  const isSkuCodeLocked = useCallback(
    (row: VariantMatrixRowVm): boolean => {
      if (!isUpdate || readOnly) return false;
      if (!row.isGroup) {
        return Boolean(row.sourceVariationUuid?.trim());
      }
      return flatVm.some((r) => !r.isGroup && Boolean(r.sourceVariationUuid?.trim()) && isStrictDescendantPath(row.pathValues, r.pathValues));
    },
    [flatVm, isUpdate, readOnly],
  );

  const { showSnackbar } = useSnackbar();
  const [mediaDialogRowId, setMediaDialogRowId] = useState<string | null>(null);
  const [mediaDialogTab, setMediaDialogTab] = useState<'upload' | 'library'>('upload');
  const [mediaDialogExistingUrls, setMediaDialogExistingUrls] = useState<string[]>([]);
  const [mediaDialogNewFiles, setMediaDialogNewFiles] = useState<File[]>([]);
  const [mediaDialogNewPreviewUrls, setMediaDialogNewPreviewUrls] = useState<string[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);

  const mediaDialogRow = useMemo(() => (mediaDialogRowId ? (flatVm.find((r) => r.id === mediaDialogRowId) ?? null) : null), [flatVm, mediaDialogRowId]);

  const openMediaDialog = useCallback(
    (rowId: string) => {
      const row = flatVm.find((r) => r.id === rowId);
      if (!row || readOnly) return;
      setMediaDialogTab('upload');
      setMediaDialogRowId(rowId);
      setMediaDialogExistingUrls([...(row.medias ?? [])]);
      setMediaDialogNewFiles([]);
      setMediaDialogNewPreviewUrls([]);
    },
    [flatVm, readOnly],
  );

  const closeMediaDialog = useCallback(() => {
    setMediaLoading(false);
    setMediaDialogNewPreviewUrls((prev) => {
      for (const url of prev) {
        try {
          URL.revokeObjectURL(url);
        } catch {
          console.error('Error revoking object URL', url);
        }
      }
      return [];
    });
    setMediaDialogRowId(null);
  }, []);

  const handleUploadMediaFile = useCallback(async (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setMediaDialogNewFiles((prev) => [...prev, file]);
    setMediaDialogNewPreviewUrls((prev) => [...prev, previewUrl]);
  }, []);

  const handleSaveMediaDialog = useCallback(async () => {
    if (!mediaDialogRowId) return;
    setMediaLoading(true);
    try {
      const files = [...mediaDialogNewFiles];
      let uploadedUrls: string[] = [];
      if (files.length) {
        const uploaded = await uploadMultipleImages(files.map((file) => ({ file, visibility: MediaVisibility.PUBLIC })));
        uploadedUrls = uploaded.map((item) => item.asset.publicUrl).filter((u) => Boolean(u));
      }
      patchField(mediaDialogRowId, 'medias', [...mediaDialogExistingUrls, ...uploadedUrls]);
      closeMediaDialog();
    } finally {
      setMediaLoading(false);
    }
  }, [closeMediaDialog, mediaDialogExistingUrls, mediaDialogNewFiles, mediaDialogRowId, patchField]);

  useEffect(() => {
    if (!onLeafSkuRowsChange) return;
    onLeafSkuRowsChange(variantMatrixLeafRowsToSkuMatrixDtos(flatVm));
  }, [flatVm, onLeafSkuRowsChange]);

  const columns = useMemo<Array<DataTableColumn<VariantMatrixRowVm>>>(() => {
    const cascadeGroupNumericTooltip = (row: VariantMatrixRowVm) => (row.isGroup && row.descendantRowCount > 0 ? `Áp dụng giá trị này cho ${row.descendantRowCount} biến thể bên dưới` : undefined);

    return [
      {
        id: 'variant',
        label: 'Biến thể',
        width: 200,
        sticky: 'left',
        renderCell: (row) => {
          const expanded = !collapsedGroupRowIds.has(row.id);
          const canEditLeafMedia = !row.isGroup && Boolean(row.leafAttributeValueUuids?.length);
          const leafMediaUrls = canEditLeafMedia ? (row.medias ?? []) : [];
          const extraMediaCount = canEditLeafMedia && leafMediaUrls.length > 1 ? leafMediaUrls.length - 1 : 0;
          const canOpenMedia = !readOnly;
          return (
            <StackRowAlignCenter sx={{ pl: row.depth * 2, minWidth: 0 }}>
              {row.isGroup ? (
                <Box
                  component="span"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleCollapsedRow(row.id);
                  }}
                  role="button"
                  tabIndex={readOnly ? -1 : 0}
                  onKeyDown={(e) => {
                    if (readOnly) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleCollapsedRow(row.id);
                    }
                  }}
                  sx={{
                    width: 26,
                    height: 26,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1,
                    flexShrink: 0,
                    cursor: readOnly ? 'default' : 'pointer',
                    opacity: readOnly ? 0.5 : 1,
                    pointerEvents: readOnly ? 'none' : 'auto',
                    '& svg': {
                      transition: 'transform 160ms ease',
                      transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    },
                    '&:hover': { bgcolor: readOnly ? undefined : 'rgba(16,24,40,0.04)' },
                  }}
                >
                  <IconArrowDown width={20} height={20} />
                </Box>
              ) : (
                <Box sx={{ width: 26, height: 26, flexShrink: 0 }} />
              )}
              {canEditLeafMedia ? (
                <Box
                  role={canOpenMedia ? 'button' : undefined}
                  tabIndex={canOpenMedia ? 0 : -1}
                  onClick={() => {
                    if (!canOpenMedia) return;
                    openMediaDialog(row.id);
                  }}
                  onKeyDown={(e) => {
                    if (!canOpenMedia) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openMediaDialog(row.id);
                    }
                  }}
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 1,
                    flexShrink: 0,
                    overflow: 'hidden',
                    cursor: canOpenMedia ? 'pointer' : 'default',
                    opacity: canOpenMedia ? 1 : 0.55,
                    pointerEvents: canOpenMedia ? 'auto' : 'none',
                    border: leafMediaUrls.length ? '1px solid' : '1px dashed',
                    borderColor: leafMediaUrls.length ? 'divider' : '#D0D5DD',
                    bgcolor: leafMediaUrls.length ? 'grey.100' : '#F9FAFB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#98A2B3',
                  }}
                >
                  <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                    <Box component="img" alt="" src={leafMediaUrls[0] ?? PRODUCT_SPU_DEFAULT_IMAGE_SRC} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {leafMediaUrls.length > 1 ? (
                      <Box
                        sx={{
                          position: 'absolute',
                          right: 4,
                          bottom: 4,
                          px: 0.75,
                          py: 0.25,
                          borderRadius: 1,
                          bgcolor: 'rgba(16, 24, 40, 0.80)',
                          color: '#fff',
                          fontSize: 11,
                          fontWeight: 700,
                          lineHeight: 1.2,
                        }}
                      >
                        +{extraMediaCount}
                      </Box>
                    ) : null}
                  </Box>
                </Box>
              ) : null}
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>{row.label}</Typography>
                {row.isGroup ? <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>{row.descendantRowCount} biến thể</Typography> : null}
              </Box>
            </StackRowAlignCenter>
          );
        },
      },
      {
        id: 'sku',
        label: 'Mã biến thể',
        width: 180,
        renderCell: (row) => (
          <ProductSpuMatrixFieldCell
            readOnly={readOnly}
            disabled={isSkuCodeLocked(row)}
            type="text"
            value={row.skuCode}
            onChange={(v) => patchField(row.id, 'skuCode', v)}
            placeholder="VD: SP00001"
            onBlur={row.isGroup ? () => onParentCascadeFieldBlur(row.id, 'skuCode') : undefined}
            error={Boolean(leafFieldError(row.id, 'skuCode'))}
            errorMessage={leafFieldError(row.id, 'skuCode')}
          />
        ),
      },
      {
        id: 'status',
        label: 'Trạng thái biến thể',
        width: 120,
        renderCell: (row) =>
          readOnly ? (
            <TagCommonComponent content={getProductSkuStatusLabelVi(row.status as ProductSkuStatus)} />
          ) : (
            <SwitchContentElement
              name={`sku-status-${row.id}`}
              content="Kích hoạt"
              value={row.status === ProductSkuStatus.ACTIVE}
              onChange={(ev: { target?: { value?: boolean } }) => patchField(row.id, 'status', ev?.target?.value ? ProductSkuStatus.ACTIVE : ProductSkuStatus.INACTIVE)}
              disabled={readOnly}
            />
          ),
      },
      {
        id: 'effectiveTaxRate',
        label: 'Thuế hiệu lực (%)',
        width: 140,
        renderCell: (row) => <ProductSpuMatrixFieldCell readOnly={readOnly} disabled type="number" value={row.effectiveTaxRate} onChange={() => undefined} />,
      },
      {
        id: 'taxRateOverride',
        label: 'Thuế ghi đè biến thể (%)',
        width: 160,
        renderCell: (row) => (
          <ProductSpuMatrixFieldCell
            readOnly={readOnly}
            disabled={readOnly}
            type="number"
            value={row.taxRateOverride}
            onChange={(v) => patchField(row.id, 'taxRateOverride', v)}
            placeholder="Để trống = waterfall"
            onBlur={row.isGroup ? () => onParentCascadeFieldBlur(row.id, 'taxRateOverride') : undefined}
            numericTooltip={cascadeGroupNumericTooltip(row)}
          />
        ),
      },
      {
        id: 'taxSource',
        label: 'Nguồn thuế',
        width: 130,
        renderCell: (row) => <ProductSpuMatrixFieldCell readOnly={readOnly} disabled type="text" value={mapTaxSourceDisplayLabel(row.taxSource)} onChange={() => undefined} />,
      },
      {
        id: 'costPriceAfterTaxMinor',
        label: 'Giá nhập (sau thuế)',
        width: 190,
        renderCell: (row) => (
          <ProductSpuMatrixFieldCell
            readOnly={readOnly}
            disabled={readOnly}
            type="currency"
            prefix="đ"
            value={row.costPriceAfterTaxMinor}
            onChange={(v) => patchField(row.id, 'costPriceAfterTaxMinor', v)}
            placeholder="VD: 1.100.000"
            onBlur={row.isGroup ? () => onParentCascadeFieldBlur(row.id, 'costPriceAfterTaxMinor') : undefined}
            numericTooltip={cascadeGroupNumericTooltip(row)}
            error={Boolean(leafFieldError(row.id, 'costPriceAfterTaxMinor'))}
            errorMessage={leafFieldError(row.id, 'costPriceAfterTaxMinor')}
          />
        ),
      },
      {
        id: 'costPriceBeforeTaxMinor',
        label: 'Giá nhập (trước thuế)',
        width: 190,
        renderCell: (row) => <ProductSpuMatrixFieldCell readOnly={readOnly} disabled type="currency" prefix="đ" value={row.costPriceBeforeTaxMinor} onChange={() => undefined} />,
      },
      {
        id: 'compareAtPriceAfterTaxMinor',
        label: 'Giá gạch (sau thuế)',
        width: 190,
        renderCell: (row) => (
          <ProductSpuMatrixFieldCell
            readOnly={readOnly}
            disabled={readOnly}
            type="currency"
            prefix="đ"
            value={row.compareAtPriceAfterTaxMinor}
            onChange={(v) => patchField(row.id, 'compareAtPriceAfterTaxMinor', v)}
            placeholder="VD: 1.200.000"
            onBlur={row.isGroup ? () => onParentCascadeFieldBlur(row.id, 'compareAtPriceAfterTaxMinor') : undefined}
            numericTooltip={cascadeGroupNumericTooltip(row)}
            error={Boolean(leafFieldError(row.id, 'compareAtPriceAfterTaxMinor'))}
            errorMessage={leafFieldError(row.id, 'compareAtPriceAfterTaxMinor')}
          />
        ),
      },
      {
        id: 'compareAtPriceBeforeTaxMinor',
        label: 'Giá gạch (trước thuế)',
        width: 190,
        renderCell: (row) => <ProductSpuMatrixFieldCell readOnly={readOnly} disabled type="currency" prefix="đ" value={row.compareAtPriceBeforeTaxMinor} onChange={() => undefined} />,
      },
      {
        id: 'sellingPriceAfterTaxMinor',
        label: 'Giá bán (sau thuế)',
        width: 210,
        renderCell: (row) => (
          <ProductSpuMatrixFieldCell
            readOnly={readOnly}
            disabled={readOnly}
            type="currency"
            prefix="đ"
            value={row.sellingPriceAfterTaxMinor}
            onChange={(v) => patchField(row.id, 'sellingPriceAfterTaxMinor', v)}
            placeholder="VD: 1.100.000"
            onBlur={row.isGroup ? () => onParentCascadeFieldBlur(row.id, 'sellingPriceAfterTaxMinor') : undefined}
            numericTooltip={cascadeGroupNumericTooltip(row)}
            error={Boolean(leafFieldError(row.id, 'sellingPriceAfterTaxMinor'))}
            errorMessage={leafFieldError(row.id, 'sellingPriceAfterTaxMinor')}
          />
        ),
      },
      {
        id: 'sellingPriceBeforeTaxMinor',
        label: 'Giá bán (trước thuế)',
        width: 190,
        renderCell: (row) => <ProductSpuMatrixFieldCell readOnly={readOnly} disabled type="currency" prefix="đ" value={row.sellingPriceBeforeTaxMinor} onChange={() => undefined} />,
      },
      {
        id: 'b2bWholesalePriceAfterTax',
        label: 'Giá sỉ B2B (sau thuế)',
        width: 210,
        renderCell: (row) => (
          <ProductSpuMatrixFieldCell
            readOnly={readOnly}
            disabled={readOnly}
            type="currency"
            prefix="đ"
            value={row.b2bWholesalePriceAfterTax}
            onChange={(v) => patchField(row.id, 'b2bWholesalePriceAfterTax', v)}
            placeholder="Không bắt buộc"
            onBlur={row.isGroup ? () => onParentCascadeFieldBlur(row.id, 'b2bWholesalePriceAfterTax') : undefined}
            numericTooltip={cascadeGroupNumericTooltip(row)}
          />
        ),
      },
      {
        id: 'b2bWholesalePriceBeforeTax',
        label: 'Giá sỉ B2B (trước thuế)',
        width: 210,
        renderCell: (row) => <ProductSpuMatrixFieldCell readOnly={readOnly} disabled type="currency" prefix="đ" value={row.b2bWholesalePriceBeforeTax} onChange={() => undefined} />,
      },
      {
        id: 'weight',
        label: 'Trọng lượng',
        width: 200,
        renderCell: (row) => (
          <ProductSpuMatrixFieldCell
            readOnly={readOnly}
            disabled={readOnly}
            type="number"
            prefix="g"
            value={row.weight}
            onChange={(v) => patchField(row.id, 'weight', v)}
            placeholder="VD: 1000"
            onBlur={row.isGroup ? () => onParentCascadeFieldBlur(row.id, 'weight') : undefined}
            numericTooltip={cascadeGroupNumericTooltip(row)}
          />
        ),
      },
      {
        id: 'length',
        label: 'Chiều dài',
        width: 200,
        renderCell: (row) => (
          <ProductSpuMatrixFieldCell
            readOnly={readOnly}
            disabled={readOnly}
            type="number"
            prefix="cm"
            value={row.length}
            onChange={(v) => patchField(row.id, 'length', v)}
            placeholder="VD: 100"
            onBlur={row.isGroup ? () => onParentCascadeFieldBlur(row.id, 'length') : undefined}
            numericTooltip={cascadeGroupNumericTooltip(row)}
          />
        ),
      },
      {
        id: 'width',
        label: 'Chiều rộng',
        width: 200,
        renderCell: (row) => (
          <ProductSpuMatrixFieldCell
            readOnly={readOnly}
            disabled={readOnly}
            type="number"
            prefix="cm"
            value={row.width}
            onChange={(v) => patchField(row.id, 'width', v)}
            placeholder="VD: 100"
            onBlur={row.isGroup ? () => onParentCascadeFieldBlur(row.id, 'width') : undefined}
            numericTooltip={cascadeGroupNumericTooltip(row)}
          />
        ),
      },
      {
        id: 'height',
        label: 'Chiều cao',
        width: 200,
        renderCell: (row) => (
          <ProductSpuMatrixFieldCell
            readOnly={readOnly}
            disabled={readOnly}
            type="number"
            prefix="cm"
            value={row.height}
            onChange={(v) => patchField(row.id, 'height', v)}
            placeholder="VD: 100"
            onBlur={row.isGroup ? () => onParentCascadeFieldBlur(row.id, 'height') : undefined}
            numericTooltip={cascadeGroupNumericTooltip(row)}
          />
        ),
      },
    ];
  }, [collapsedGroupRowIds, isSkuCodeLocked, leafFieldError, onParentCascadeFieldBlur, openMediaDialog, patchField, readOnly, toggleCollapsedRow]);

  return (
    <Stack sx={{ width: '100%', minWidth: 0, maxWidth: '100%' }}>
      <Stack sx={{ p: 2, backgroundColor: '#F5F9FF', borderRadius: '10px' }}>
        {!readOnly && (
          <SelectAttributeTreeInput
            label="Thuộc tính áp dụng"
            requiredMark
            options={attributeTreeOptions}
            value={selectedAttributes}
            onChange={onSelectedAttributesChange}
            onOpen={() => onAttributeSelectOpenChange?.(true)}
            onClose={() => onAttributeSelectOpenChange?.(false)}
            disabled={readOnly || attributeTreeLoading}
            error={appliedAttributesError}
            errorMessage={appliedAttributesErrorMessage}
          />
        )}
        <StackRowAlignCenter gap={1}>
          <InfoCircle size={20} color="#6B7280" />
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#6B7280' }}>Thứ tự sắp xếp ở đây sẽ là cơ sở để phân nhóm trong ma trận bên dưới.</Typography>
        </StackRowAlignCenter>
        {!readOnly && enableSortableAttributeSummaries ? (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEndReorder} modifiers={[restrictToVerticalAxis, restrictToParentElement]}>
            <SortableContext items={appliedAttributeSummaries.map((s) => s.attributeId)} strategy={verticalListSortingStrategy}>
              <Stack sx={{ gap: 0.75 }}>
                {appliedAttributeSummaries.map((summary) => (
                  <SortableAppliedAttributeSummaryRow key={summary.attributeId} summary={summary} />
                ))}
              </Stack>
            </SortableContext>
          </DndContext>
        ) : (
          appliedAttributeSummaries.map((summary) => (
            <StackRowAlignCenter gap={1} key={summary.attributeId}>
              <IconDrag02 />
              <StackRowAlignCenter gap={0.25}>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#000' }}>{summary.label}:</Typography>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#000' }}>{summary.valuesText}</Typography>
              </StackRowAlignCenter>
            </StackRowAlignCenter>
          ))
        )}
      </Stack>
      {usePreviewFlat && skuMatrixPreviewLoading && !showSkuMatrixTable ? (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 6, minHeight: 160 }}>
          <LoadingComponent size="large" />
        </Stack>
      ) : null}
      {showSkuMatrixTable ? (
        <Fragment>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#6B7280' }}>Ma trận biến thể</Typography>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              minWidth: 0,
              maxWidth: '100%',
              overflow: 'hidden',
              border: '1px solid #E5E7EB',
              borderRadius: '10px',
              bgcolor: '#FFFFFF',
            }}
          >
            {usePreviewFlat && skuMatrixPreviewLoading ? (
              <Stack
                alignItems="center"
                justifyContent="center"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 10,
                  bgcolor: 'rgba(255,255,255,0.88)',
                  borderRadius: '10px',
                  pointerEvents: 'none',
                }}
              >
                <LoadingComponent size="large" sx={{ flex: 0, minHeight: 'auto', py: 0 }} />
              </Stack>
            ) : null}
            <DataTable
              rows={visibleFlatVm}
              columns={columns}
              getRowId={(r) => r.id}
              tableMinWidth={4300}
              containerSx={{
                width: '100%',
                maxHeight: 520,
                overflow: 'auto',
              }}
            />
          </Box>
        </Fragment>
      ) : null}

      <DialogComponent
        open={Boolean(mediaDialogRowId)}
        onClose={mediaLoading ? undefined : closeMediaDialog}
        title="Chọn ảnh"
        maxWidth="md"
        fullWidth
        buttonRight={{
          content: mediaLoading ? 'Đang lưu' : 'Lưu',
          variant: 'contained',
          onClick: handleSaveMediaDialog,
          disabled: mediaLoading,
          loading: mediaLoading,
        }}
      >
        <Stack>
          <Tabs
            value={mediaDialogTab}
            onChange={(_, v) => setMediaDialogTab(v as 'upload' | 'library')}
            sx={{
              width: '100%',
              '& .MuiTabs-flexContainer': { width: '100%' },
              '& .MuiTabs-indicator': { bgcolor: '#101828', height: 2 },
            }}
          >
            <Tab
              value="upload"
              label="Upload"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                color: '#101828',
                '&.Mui-selected': { color: '#101828' },
              }}
            />
            <Tab
              value="library"
              label="Thư viện ảnh"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                color: '#101828',
                '&.Mui-selected': { color: '#101828' },
              }}
            />
          </Tabs>

          {mediaDialogTab === 'upload' ? (
            <Stack>
              <TextFieldUpload
                label={mediaDialogRow ? `Ảnh biến thể: ${mediaDialogRow.label}` : 'Ảnh biến thể'}
                value=""
                onChange={() => undefined}
                accept="image/*"
                maxFileSizeBytes={PRODUCT_SPU_VARIANT_MEDIA_MAX_FILE_BYTES}
                onPickFile={handleUploadMediaFile}
                onFileReject={(reason) => showSnackbar({ type: SnackbarType.ERROR, message: reason })}
                hintText={PRODUCT_SPU_VARIANT_MEDIA_UPLOAD_HINT}
              />

              <Stack direction="row" gap={1} flexWrap="wrap">
                {[...mediaDialogExistingUrls, ...mediaDialogNewPreviewUrls].map((url, index) => (
                  <Box key={`${url}-${index}`} sx={{ position: 'relative', width: 84, height: 84 }}>
                    <Box
                      component="img"
                      src={url}
                      alt=""
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: 1.5,
                        border: '1px solid #E4E7EC',
                      }}
                    />
                    <PermissionIconButton
                      size="small"
                      onClick={() => {
                        if (!mediaDialogRowId) return;
                        const existingCount = mediaDialogExistingUrls.length;
                        if (index < existingCount) {
                          setMediaDialogExistingUrls((prev) => prev.filter((_, i) => i !== index));
                          return;
                        }
                        const localIndex = index - existingCount;
                        setMediaDialogNewFiles((prev) => prev.filter((_, i) => i !== localIndex));
                        setMediaDialogNewPreviewUrls((prev) => {
                          const target = prev[localIndex];
                          if (target) {
                            try {
                              URL.revokeObjectURL(target);
                            } catch {
                              console.error('Error revoking object URL', target);
                            }
                          }
                          return prev.filter((_, i) => i !== localIndex);
                        });
                      }}
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        width: 20,
                        height: 20,
                        bgcolor: '#FFFFFF',
                        border: '1px solid #E4E7EC',
                      }}
                    >
                      <Typography sx={{ fontSize: 12, lineHeight: 1 }}>x</Typography>
                    </PermissionIconButton>
                  </Box>
                ))}
              </Stack>

              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085' }}>Đã chọn: {mediaDialogExistingUrls.length + mediaDialogNewPreviewUrls.length} ảnh</Typography>
            </Stack>
          ) : (
            <Box sx={{ minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EmptyComponent />
            </Box>
          )}
        </Stack>
      </DialogComponent>
    </Stack>
  );
};

export const ProductSpuVariantMatrix = memo(ProductSpuVariantMatrixInner);
