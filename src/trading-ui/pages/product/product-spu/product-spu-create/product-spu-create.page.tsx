import { Box, Stack, Typography } from '@mui/material';
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { type FieldPath, type Resolver, useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { STYLE } from '@/trading-ui/adapters/library';
import { CustomButton } from '../../../../components/button';
import { productListButtonPermission } from '../../product-permission.constants';
import useSWR from 'swr';
import { Announcement01, Archive, FolderSearch, InfoCircle } from '@untitledui/icons';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { LabelFormPageHeader } from '../../../content-display/label/components';
import { ProductSpuPageSectionsFrame, ProductSpuSectionPanel } from '../components/product-spu-page-sections.component';
import { isPackagingLikeProductKind, productCreateRequestDtoSchema, ProductSpuSidebarKey } from '../product-spu.constant';
import { ProductSpuPackagingSkuForm } from '../components/product-spu-packaging-sku-form.component';
import { ROUTE_PATH } from '@/trading-ui/router/route.path';
import {
  attributeApi,
  brandApi,
  categoryApi,
  PackagingType,
  productApi,
  ProductKind,
  seasonApi,
  ProductSkuStatus,
  type ProductCreateRequestDto,
  type ProductSkuCreateRequestDto,
  type ProductSkuMatrixLeafRowDto,
  ProductVariationSkuKind,
  type SkuMatrixPreviewRequestDto,
  type SkuMatrixPreviewResponseDto,
} from '../../../../apis';
import type { ProductSpuPageSection, VariantMatrixFlatRow } from '../product-spu.interface';
import {
  buildAppliedSummariesOrdered,
  buildAttributeTreeSelectOptions,
  buildProductAttributeAssignmentsFromSelection,
  buildSkuMatrixPreviewRequestDto,
  getActiveAttributeIdsInTreeOrder,
  mergeOrderedAttributeIds,
  orderedAttributeIdsToVariantAttributeDefs,
} from '../utils/product-spu-attribute-tree.utils';
import { buildCategoryTreeSelectOptions, findCategoryInTree } from '../utils/product-spu-category-tree.utils';
import { flattenSkuPreviewMatrixForTable, skuPreviewResponseMatchesRequest, skuPreviewResponseToAttributeDefs } from '../utils/product-spu-sku-matrix-preview.utils';
import { ProductSpuVariantMatrix } from '../components/product-spu-variant-matrix.component';
import ProductSpuPackagingRelationsEditor from '../components/product-spu-packaging-relations-editor.component';
import { ProductSpuMixMatchEditor } from '../components/product-spu-mix-match-editor.component';
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../../../components/styled';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { getErrorMessage } from '../../../../common/utils';
import { emptyProductSpuCreateForm, ProductSpuForm, ProductSpuSeoFormFields } from '../components/product-spu-form.component';
import { yupResolver } from '@hookform/resolvers/yup';
import { parseNullableNumber } from '../utils/product-spu-pricing.utils';
import { isOnlyProductSkuApiFieldValidationError, mapProductSkuApiValidationErrors, mapRhfSkuRowErrorsToLeafFieldErrors } from '../utils/product-spu-sku-field-errors.utils';
import { CategoryStatus } from '../../../../apis/category/category.enum';

const createDefaultPackagingSku = (productKind: ProductKind): ProductSkuCreateRequestDto => ({
  clientKey: 'packaging-default',
  skuCode: '',
  status: ProductSkuStatus.ACTIVE,
  skuKind: ProductVariationSkuKind.PACKAGING,
  compareAtPriceAfterTaxMinor: null,
  sellingPriceAfterTaxMinor: 0,
  costPriceAfterTaxMinor: 0,
  attributeValueUuids: [],
  medias: [],
  packagingBasePriceAfterTax: 0,
  packagingIncludedPriceAfterTax: 0,
  packagingIsVisible: false,
  packagingCanBeSold: false,
  packagingType: productKind === ProductKind.SHIPPING_PACKAGING ? PackagingType.CARTON_BOX : PackagingType.BOX,
});

const normalizePackagingCreatePayload = (values: ProductCreateRequestDto): ProductCreateRequestDto => {
  if (!isPackagingLikeProductKind(values.productKind)) return values;

  const [sku] = values.skus ?? [];
  if (!sku) return values;

  if (values.productKind === ProductKind.SHIPPING_PACKAGING) {
    return {
      ...values,
      attributes: [],
      categoryUuid: undefined,
      brandId: null,
      seasonUuid: undefined,
      metaTitle: undefined,
      metaDescription: undefined,
      metaKeywords: undefined,
      packagingRelations: undefined,
      skus: [
        {
          ...sku,
          clientKey: sku.clientKey ?? 'packaging-default',
          skuKind: ProductVariationSkuKind.PACKAGING,
          compareAtPriceAfterTaxMinor: null,
          sellingPriceAfterTaxMinor: 0,
          costPriceAfterTaxMinor: Number(sku.costPriceAfterTaxMinor ?? 0),
          attributeValueUuids: [],
          medias: sku.medias ?? [],
          packagingBasePriceAfterTax: 0,
          packagingIncludedPriceAfterTax: 0,
          packagingIsVisible: false,
          packagingCanBeSold: false,
          packagingType: sku.packagingType === PackagingType.BAG || sku.packagingType === PackagingType.CARTON_BOX ? sku.packagingType : PackagingType.CARTON_BOX,
        },
      ],
    };
  }

  const retailPrice = Number(sku.sellingPriceAfterTaxMinor ?? sku.packagingBasePriceAfterTax ?? 0);
  const compareAtPrice = Number(sku.compareAtPriceAfterTaxMinor ?? 0);
  return {
    ...values,
    attributes: [],
    categoryUuid: undefined,
    brandId: null,
    seasonUuid: undefined,
    metaTitle: undefined,
    metaDescription: undefined,
    metaKeywords: undefined,
    packagingRelations: undefined,
    skus: [
      {
        ...sku,
        clientKey: sku.clientKey ?? 'packaging-default',
        skuKind: ProductVariationSkuKind.PACKAGING,
        compareAtPriceAfterTaxMinor: compareAtPrice > retailPrice ? compareAtPrice : null,
        sellingPriceAfterTaxMinor: retailPrice,
        costPriceAfterTaxMinor: Number(sku.costPriceAfterTaxMinor ?? 0),
        attributeValueUuids: [],
        medias: sku.medias ?? [],
        packagingBasePriceAfterTax: retailPrice,
        packagingIncludedPriceAfterTax: Number(sku.packagingIncludedPriceAfterTax ?? 0),
        packagingIsVisible: Boolean(sku.packagingIsVisible),
        packagingCanBeSold: Boolean(sku.packagingCanBeSold),
        packagingType: sku.packagingType ?? PackagingType.BOX,
      },
    ],
  };
};

const ProductSpuCreatePage = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { control, handleSubmit, setValue, setError, clearErrors, formState } = useForm<ProductCreateRequestDto>({
    resolver: yupResolver(productCreateRequestDtoSchema) as unknown as Resolver<ProductCreateRequestDto>,
    defaultValues: emptyProductSpuCreateForm(),
  });
  const { errors } = formState;

  const categoryUuid = useWatch({ control, name: 'categoryUuid' });
  const productTaxRateOverride = useWatch({ control, name: 'taxRateOverride' });
  const productKind = useWatch({ control, name: 'productKind' }) ?? ProductKind.MERCHANDISE;
  const isPackagingProduct = isPackagingLikeProductKind(productKind);
  const isShippingPackagingProduct = productKind === ProductKind.SHIPPING_PACKAGING;
  const attributeTreeCategoryId = (categoryUuid ?? '').trim();

  const [selectedAttributes, setSelectedAttributes] = useState<readonly string[]>([]);
  const [orderedAttributeIds, setOrderedAttributeIds] = useState<string[]>([]);
  const [submittingAction, setSubmittingAction] = useState<'draft' | 'submit' | null>(null);
  const [skuMatrixAwaitingPreview, setSkuMatrixAwaitingPreview] = useState(false);
  const [attributeSelectOpen, setAttributeSelectOpen] = useState(false);
  const [heldSkuMatrixPreview, setHeldSkuMatrixPreview] = useState<{
    fingerprint: string;
    data: SkuMatrixPreviewResponseDto;
  } | null>(null);
  const [packagingRelationsDraft, setPackagingRelationsDraft] = useState<ProductCreateRequestDto['packagingRelations']>([]);
  const [productMixMatchDraft, setProductMixMatchDraft] = useState<string[]>([]);

  const previousProductKindRef = useRef(productKind);
  useEffect(() => {
    if (previousProductKindRef.current === productKind) return;
    previousProductKindRef.current = productKind;

    if (isPackagingLikeProductKind(productKind)) {
      setSelectedAttributes([]);
      setOrderedAttributeIds([]);
      setPackagingRelationsDraft([]);
      setValue('categoryUuid', undefined);
      setValue('seasonUuid', undefined);
      setValue('attributes', []);
      setValue('skus', [createDefaultPackagingSku(productKind)]);
      clearErrors(['categoryUuid', 'seasonUuid', 'attributes']);
      return;
    }

    setValue('skus', []);
  }, [clearErrors, productKind, setValue]);

  const prevCategoryForResetRef = useRef('');
  useEffect(() => {
    const cur = attributeTreeCategoryId;
    const prev = prevCategoryForResetRef.current;
    prevCategoryForResetRef.current = cur;
    if (!prev || !cur || prev === cur) return;
    setSelectedAttributes([]);
    setOrderedAttributeIds([]);
  }, [attributeTreeCategoryId]);

  const { data: categoryRes } = useSWR(['product/admin/categories', 'list'], () => categoryApi.getCategoryTree({ status: CategoryStatus.ACTIVE }), {
    revalidateOnFocus: false,
  });
  const { data: brandRes } = useSWR(['product/admin/brands', 'list'], () => brandApi.getBrandList({ isPagination: false }), { revalidateOnFocus: false });
  const { data: seasonRes } = useSWR(null, () => seasonApi.getAdminSeasonList({ isPagination: false }), { revalidateOnFocus: false });
  const attributeTreeSwrKey = attributeTreeCategoryId ? (['product/admin/attributes', 'tree', false, attributeTreeCategoryId] as const) : null;
  const { data: attributeTreeRes, isLoading: attributeTreeLoading } = useSWR(attributeTreeSwrKey, () => attributeApi.getAttributeTree({ isPagination: false, categoryId: attributeTreeCategoryId }), {
    revalidateOnFocus: false,
  });

  const categoryTreeOptions = useMemo(() => buildCategoryTreeSelectOptions(categoryRes ?? []), [categoryRes]);
  const seasonOptions = useMemo(() => (seasonRes?.list ?? []).map((item) => ({ value: item.id, label: item.name })), [seasonRes]);
  const selectedCategory = useMemo(() => findCategoryInTree(categoryRes ?? [], categoryUuid ?? ''), [categoryRes, categoryUuid]);
  const selectedCategoryTaxRateText = selectedCategory?.taxRate ?? '';
  const selectedCategoryTaxRate = useMemo(() => parseNullableNumber(selectedCategoryTaxRateText), [selectedCategoryTaxRateText]);

  const attributeTreeRows = attributeTreeRes?.list ?? [];
  const attributeTreeSelectOptions = useMemo(() => buildAttributeTreeSelectOptions(attributeTreeRows), [attributeTreeRows]);

  const skuMatrixLeafFieldErrors = useMemo(() => mapRhfSkuRowErrorsToLeafFieldErrors(errors.skus), [errors.skus]);

  const activeAttributeIdsInTreeOrder = useMemo(() => getActiveAttributeIdsInTreeOrder(attributeTreeRows, selectedAttributes), [attributeTreeRows, selectedAttributes]);
  const activeAttrMergeKeyRef = useRef<string>('__init__');
  useEffect(() => {
    const mergeKey = activeAttributeIdsInTreeOrder.join('|');
    if (mergeKey === activeAttrMergeKeyRef.current) return;
    activeAttrMergeKeyRef.current = mergeKey;
    setOrderedAttributeIds((prev) => mergeOrderedAttributeIds(prev, activeAttributeIdsInTreeOrder));
  }, [activeAttributeIdsInTreeOrder]);

  const appliedAttributeSummaries = useMemo(
    () => buildAppliedSummariesOrdered(attributeTreeRows, selectedAttributes, orderedAttributeIds),
    [attributeTreeRows, orderedAttributeIds, selectedAttributes],
  );

  const assignments = useMemo(() => buildProductAttributeAssignmentsFromSelection(attributeTreeRows, selectedAttributes), [attributeTreeRows, selectedAttributes]);

  useEffect(() => {
    setValue('attributes', assignments);
    if (assignments.length > 0) {
      clearErrors('attributes');
    }
  }, [assignments, clearErrors, setValue]);

  const deferredSelectedAttributes = useDeferredValue(selectedAttributes);
  const assignmentsForPreview = useMemo(() => buildProductAttributeAssignmentsFromSelection(attributeTreeRows, deferredSelectedAttributes), [attributeTreeRows, deferredSelectedAttributes]);

  const previewPayload = useMemo(() => buildSkuMatrixPreviewRequestDto(orderedAttributeIds, assignmentsForPreview), [assignmentsForPreview, orderedAttributeIds]);

  const previewSwrKey = useMemo(
    (): readonly ['product/admin/products/sku-matrix/preview', string] | null =>
      !attributeSelectOpen && previewPayload ? (['product/admin/products/sku-matrix/preview', JSON.stringify(previewPayload)] as const) : null,
    [attributeSelectOpen, previewPayload],
  );

  const {
    data: skuPreviewRes,
    isLoading: skuPreviewLoading,
    isValidating: skuPreviewValidating,
  } = useSWR(previewSwrKey, ([, bodyJson]) => productApi.postSkuMatrixPreview(JSON.parse(bodyJson) as SkuMatrixPreviewRequestDto), { revalidateOnFocus: false });

  const previewFingerprint = previewSwrKey?.[1];

  useEffect(() => {
    if (!previewPayload) setSkuMatrixAwaitingPreview(false);
  }, [previewPayload]);

  useEffect(() => {
    if (!previewSwrKey || !previewFingerprint) {
      setHeldSkuMatrixPreview(null);
      return;
    }
    if (skuPreviewRes) {
      setHeldSkuMatrixPreview({ fingerprint: previewFingerprint, data: skuPreviewRes });
    }
  }, [previewFingerprint, previewSwrKey, skuPreviewRes]);

  const resolvedSkuPreviewRes = useMemo((): SkuMatrixPreviewResponseDto | undefined => {
    if (!previewPayload || !previewFingerprint) return undefined;

    const matchesPayload = (value: SkuMatrixPreviewResponseDto | undefined): value is SkuMatrixPreviewResponseDto => Boolean(value && skuPreviewResponseMatchesRequest(value, previewPayload));

    if (matchesPayload(skuPreviewRes)) return skuPreviewRes;
    if (heldSkuMatrixPreview?.fingerprint === previewFingerprint && matchesPayload(heldSkuMatrixPreview.data)) {
      return heldSkuMatrixPreview.data;
    }

    return undefined;
  }, [heldSkuMatrixPreview, previewFingerprint, previewPayload, skuPreviewRes]);

  const skuMatrixPreviewFlatRows = useMemo((): VariantMatrixFlatRow[] | undefined => {
    if (!previewPayload || !resolvedSkuPreviewRes) return undefined;
    return flattenSkuPreviewMatrixForTable(resolvedSkuPreviewRes);
  }, [previewPayload, resolvedSkuPreviewRes]);

  const [heldSkuMatrixPreviewFlatRows, setHeldSkuMatrixPreviewFlatRows] = useState<readonly VariantMatrixFlatRow[]>();

  useEffect(() => {
    if (!previewPayload) {
      setHeldSkuMatrixPreviewFlatRows(undefined);
      return;
    }
    if (skuMatrixPreviewFlatRows) {
      setHeldSkuMatrixPreviewFlatRows(skuMatrixPreviewFlatRows);
    }
  }, [previewPayload, skuMatrixPreviewFlatRows]);

  const skuMatrixPreviewWasValidatingRef = useRef(false);
  useEffect(() => {
    if (skuMatrixPreviewWasValidatingRef.current && !skuPreviewValidating) {
      setSkuMatrixAwaitingPreview(false);
    }
    skuMatrixPreviewWasValidatingRef.current = skuPreviewValidating;
  }, [skuPreviewValidating]);

  const skuMatrixPreviewBlocking = Boolean(previewPayload && (skuMatrixAwaitingPreview || skuPreviewValidating || (skuPreviewLoading && !resolvedSkuPreviewRes)));

  const matrixDisplayAttributeOrder = useMemo(() => {
    if (resolvedSkuPreviewRes) return skuPreviewResponseToAttributeDefs(resolvedSkuPreviewRes);
    return orderedAttributeIdsToVariantAttributeDefs(attributeTreeRows, orderedAttributeIds);
  }, [attributeTreeRows, orderedAttributeIds, resolvedSkuPreviewRes]);

  const handleLeafSkuRowsChange = useCallback(
    (rows: readonly ProductSkuMatrixLeafRowDto[]) => {
      setValue(
        'skus',
        rows.map((row) => {
          const sellingPriceAfterTaxMinor = parseNullableNumber(row.sellingPriceAfterTaxMinor);
          const costPriceAfterTaxMinor = parseNullableNumber(row.costPriceAfterTaxMinor);
          const compareAtPriceAfterTaxMinor = parseNullableNumber(row.compareAtPriceAfterTaxMinor);
          return {
            clientKey: row.rowId,
            skuCode: row.skuCode.trim(),
            status: row.status,
            skuKind: ProductVariationSkuKind.PRODUCT,
            compareAtPriceAfterTaxMinor,
            sellingPriceAfterTaxMinor: sellingPriceAfterTaxMinor ?? undefined,
            /** BE: null/0/missing = clear Giá nhập; omit giữ giá cũ trên PATCH — gửi null khi xóa. */
            costPriceAfterTaxMinor,
            b2bWholesalePriceAfterTax: row.b2bWholesalePriceAfterTax.trim() !== '' ? Number(row.b2bWholesalePriceAfterTax) : undefined,
            ...(row.taxRateOverride.trim() !== '' ? { taxRateOverride: Number(row.taxRateOverride) } : {}),
            attributeValueUuids: [...row.attributeValueUuids],
            medias: row.medias ?? [],
            weight: row.weight !== '' ? Number(row.weight) : undefined,
            length: row.length !== '' ? Number(row.length) : undefined,
            width: row.width !== '' ? Number(row.width) : undefined,
            height: row.height !== '' ? Number(row.height) : undefined,
          };
        }),
      );
    },
    [setValue],
  );

  const onSelectedAttributesChange = useCallback((next: readonly string[]) => {
    setSelectedAttributes(next);
  }, []);

  const onReorderAppliedAttributes = useCallback((ids: string[]) => {
    setSkuMatrixAwaitingPreview(true);
    setOrderedAttributeIds(ids);
  }, []);

  const persistDraft = useCallback(
    async (values: ProductCreateRequestDto, shouldSubmit: boolean) => {
      setSubmittingAction(shouldSubmit ? 'submit' : 'draft');
      try {
        const brandId = isPackagingLikeProductKind(values.productKind) ? null : (brandRes?.list?.[0]?.id ?? '');
        const productInfos = values.productInfos?.map((item, index) => ({
          ...item,
          sortOrder: index,
        }));
        const normalizedValues = normalizePackagingCreatePayload({
          ...values,
          productInfos,
        });
        const draft = await productApi.postAdminProduct({
          ...normalizedValues,
          brandId,
          packagingRelations: isPackagingLikeProductKind(normalizedValues.productKind) ? undefined : packagingRelationsDraft?.length ? packagingRelationsDraft : undefined,
          productMixMatch: isPackagingLikeProductKind(normalizedValues.productKind) ? undefined : productMixMatchDraft.length ? productMixMatchDraft : undefined,
        });

        if (shouldSubmit) {
          await productApi.postAdminProductSubmit(draft.uuid);
          showSnackbar({ message: 'Đã tạo bản nháp và gửi yêu cầu duyệt.', type: SnackbarType.SUCCESS });
          navigate(ROUTE_PATH.PRODUCT_SPU_LIST);
          return;
        }

        showSnackbar({ message: 'Đã lưu bản nháp sản phẩm.', type: SnackbarType.SUCCESS });
        navigate(ROUTE_PATH.PRODUCT_SPU_LIST);
      } catch (error) {
        const mappedFieldErrors = mapProductSkuApiValidationErrors(error, 'create');
        if (mappedFieldErrors.length > 0) {
          for (const fieldError of mappedFieldErrors) {
            setError(fieldError.formPath as FieldPath<ProductCreateRequestDto>, { type: 'server', message: fieldError.message });
          }
        }
        if (!isOnlyProductSkuApiFieldValidationError(error)) {
          showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
        }
      } finally {
        setSubmittingAction(null);
      }
    },
    [brandRes, navigate, packagingRelationsDraft, productMixMatchDraft, setError, showSnackbar],
  );

  const handleSaveDraft = useCallback((values: ProductCreateRequestDto) => persistDraft(values, false), [persistDraft]);

  const handleSubmitApproval = useCallback((values: ProductCreateRequestDto) => persistDraft(values, true), [persistDraft]);

  const sectionBlocks = useMemo((): ProductSpuPageSection[] => {
    const blocks: Array<ProductSpuPageSection | null> = [
      {
        key: ProductSpuSidebarKey.GENERAL,
        content: (
          <ProductSpuSectionPanel title="Thông tin chung" icon={<InfoCircle size={20} color="#737373" />}>
            <ProductSpuForm
              control={control}
              categoryTreeOptions={categoryTreeOptions}
              seasonOptions={seasonOptions}
              categoryTaxRate={selectedCategoryTaxRateText}
              showProductKind
              hideTaxonomy={isPackagingProduct}
            />
          </ProductSpuSectionPanel>
        ),
      },
      isPackagingProduct
        ? {
            key: ProductSpuSidebarKey.VARIANTS,
            content: (
              <ProductSpuSectionPanel title={isShippingPackagingProduct ? 'Bao bì đóng gói (theo đơn)' : 'Biến thể bao bì'} icon={<Archive size={20} color="#737373" />}>
                <ProductSpuPackagingSkuForm control={control as never} fieldPrefix="skus.0" variant={isShippingPackagingProduct ? 'shipping_packaging' : 'retail_packaging'} />
              </ProductSpuSectionPanel>
            ),
          }
        : {
            key: ProductSpuSidebarKey.VARIANTS,
            content: (
              <ProductSpuSectionPanel title="Biến thể và tồn kho" icon={<Archive size={20} color="#737373" />}>
                <Stack>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#6B7280' }}>Thuộc tính</Typography>
                  <ProductSpuVariantMatrix
                    readOnly={false}
                    appliedAttributeSummaries={appliedAttributeSummaries}
                    attributeOrder={matrixDisplayAttributeOrder}
                    keyRows={[]}
                    attributeTreeOptions={attributeTreeSelectOptions}
                    selectedAttributes={selectedAttributes}
                    onSelectedAttributesChange={onSelectedAttributesChange}
                    onAttributeSelectOpenChange={setAttributeSelectOpen}
                    attributeTreeLoading={attributeTreeLoading}
                    categoryTaxRate={selectedCategoryTaxRate}
                    productTaxRateOverride={productTaxRateOverride ?? null}
                    appliedAttributesError={Boolean(errors.attributes)}
                    appliedAttributesErrorMessage={
                      errors.attributes && typeof errors.attributes === 'object' && 'message' in errors.attributes ? String((errors.attributes as { message?: string }).message) : undefined
                    }
                    skuMatrixPreviewFlatRows={previewPayload ? (skuMatrixPreviewFlatRows ?? heldSkuMatrixPreviewFlatRows) : undefined}
                    skuMatrixPreviewLoading={skuMatrixPreviewBlocking}
                    enableSortableAttributeSummaries
                    onReorderAppliedAttributes={onReorderAppliedAttributes}
                    onLeafSkuRowsChange={handleLeafSkuRowsChange}
                    skuMatrixLeafFieldErrors={skuMatrixLeafFieldErrors}
                  />
                </Stack>
              </ProductSpuSectionPanel>
            ),
          },
      isPackagingProduct
        ? null
        : {
            key: ProductSpuSidebarKey.PACKAGING,
            content: (
              <ProductSpuSectionPanel title="Bao bì/ hộp đựng đi kèm" icon={<Archive size={20} color="#737373" />}>
                <ProductSpuPackagingRelationsEditor productId={undefined} draftRelations={packagingRelationsDraft} onDraftRelationsChange={setPackagingRelationsDraft} />
              </ProductSpuSectionPanel>
            ),
          },
      isPackagingProduct
        ? null
        : {
            key: ProductSpuSidebarKey.MARKETING,
            content: (
              <ProductSpuSectionPanel title="Marketing & Loyalty" icon={<Announcement01 size={20} color="#737373" />}>
                <Stack gap={1.5}>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#344054' }}>Sản phẩm mua kèm (Cross - Sell)</Typography>
                  <ProductSpuMixMatchEditor value={productMixMatchDraft} onChange={setProductMixMatchDraft} />
                </Stack>
              </ProductSpuSectionPanel>
            ),
          },
      isPackagingProduct
        ? null
        : {
            key: ProductSpuSidebarKey.SEO,
            content: (
              <ProductSpuSectionPanel title="Cấu hình SEO" icon={<FolderSearch size={20} color="#737373" />}>
                <ProductSpuSeoFormFields control={control} />
              </ProductSpuSectionPanel>
            ),
          },
    ];
    return blocks.filter((block): block is ProductSpuPageSection => Boolean(block) && block?.key!==ProductSpuSidebarKey.PACKAGING);
  }, [
    appliedAttributeSummaries,
    attributeSelectOpen,
    attributeTreeLoading,
    attributeTreeSelectOptions,
    categoryTreeOptions,
    control,
    errors.attributes,
    handleLeafSkuRowsChange,
    heldSkuMatrixPreviewFlatRows,
    isPackagingProduct,
    matrixDisplayAttributeOrder,
    onReorderAppliedAttributes,
    onSelectedAttributesChange,
    packagingRelationsDraft,
    productMixMatchDraft,
    previewPayload,
    seasonOptions,
    selectedCategoryTaxRate,
    selectedCategoryTaxRateText,
    selectedAttributes,
    skuMatrixLeafFieldErrors,
    skuMatrixPreviewBlocking,
    skuMatrixPreviewFlatRows,
  ]);

  return (
    <Stack
      sx={{
        height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`,
        boxSizing: 'border-box',
        minHeight: 0,
        bgcolor: '#F9FAFB',
        gap: 0,
      }}
    >
      <LabelFormPageHeader variant="backOnly" onBack={() => navigate(ROUTE_PATH.PRODUCT_SPU_LIST)} />
      <StackRowAlignCenterJustBetween sx={{ px: 3, py: 2, backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES['2xl'].bold, color: '#101828' }}>Tạo sản phẩm</Typography>
        <StackRowAlignCenter gap={1}>
          <CustomButton
            variant="outline"
            fullWidth={false}
            onClick={() => navigate(ROUTE_PATH.PRODUCT_SPU_LIST)}
            sx={{
              textTransform: 'none',
              borderColor: '#101828',
              color: '#101828',
              '&:hover': { borderColor: '#101828' },
            }}
          >
            Hủy
          </CustomButton>
          <CustomButton
            variant="outline"
            fullWidth={false}
            disabled={submittingAction === 'draft'}
            onClick={() => void handleSubmit(handleSaveDraft)()}
            sx={{ textTransform: 'none', borderColor: '#101828', color: '#101828' }}
          >
            Lưu nháp
          </CustomButton>
          <CustomButton
            variant="primary"
            fullWidth={false}
            disabled={submittingAction === 'submit'}
            onClick={() => void handleSubmit(handleSubmitApproval)()}
            {...productListButtonPermission('submit', 'Xuất bản sản phẩm', 'api_product_submit')}
            sx={{
              textTransform: 'none',
              bgcolor: '#101828',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#101828', opacity: 0.92 },
            }}
          >
            Xuất bản
          </CustomButton>
        </StackRowAlignCenter>
      </StackRowAlignCenterJustBetween>
      <Box sx={{ flex: 1, minHeight: 0, p: 3, pt: 0 }}>
        <ProductSpuPageSectionsFrame sections={sectionBlocks} scrollAreaMaxHeight="calc(100vh - 220px)" sx={{ pt: 2 }} />
      </Box>
    </Stack>
  );
};

export default ProductSpuCreatePage;
