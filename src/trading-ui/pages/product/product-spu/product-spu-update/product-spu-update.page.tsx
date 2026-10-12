import { Box, Stack, Typography } from '@mui/material';
import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { type Control, type FieldPath, type FieldValues, type Resolver, useForm, useWatch } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { STYLE } from '@/trading-ui/adapters/library';
import { CustomButton } from '../../../../components/button';
import { productListButtonPermission } from '../../product-permission.constants';
import useSWR from 'swr';
import { Announcement01, Archive, FolderSearch, InfoCircle, RefreshCcw01, Send01, XClose } from '@untitledui/icons';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { LabelFormPageHeader } from '../../../content-display/label/components';
import { ProductSpuPageSectionsFrame, ProductSpuSectionPanel } from '../components/product-spu-page-sections.component';
import {
  getProductApprovalStatusLabelVi,
  getProductLifecycleStatusLabelVi,
  hasRejectedCreateApproval,
  isPackagingLikeProductKind,
  isPendingCreateApproval,
  isPendingUpdateApproval,
  productUpdateRequestDtoSchema,
  ProductSpuSidebarKey,
} from '../product-spu.constant';
import { useProductSpuListBackNavigation } from '../utils/product-spu-list-navigation.util';
import { ProductSpuForm, ProductSpuSeoFormFields } from '../components/product-spu-form.component';
import ProductSpuPackagingRelationsEditor from '../components/product-spu-packaging-relations-editor.component';
import { ProductSpuMixMatchEditor } from '../components/product-spu-mix-match-editor.component';
import { ProductSpuPackagingSkuForm } from '../components/product-spu-packaging-sku-form.component';
import { normalizePackagingSkuUpsert, packagingVariationToSkuUpsert } from '../utils/product-spu-packaging-sku.utils';
import { ProductSpuVariantMatrix } from '../components/product-spu-variant-matrix.component';
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../../../components/styled';
import { ButtonIconContentComponent } from '../../../../components/button';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { getErrorMessage } from '../../../../common/utils';
import { LoadingComponent } from '../../../../components/loading/loading.component';
import { EmptyComponent } from '../../../../components/empty/empty.component';
import {
  attributeApi,
  brandApi,
  categoryApi,
  productApi,
  ProductKind,
  ProductSpuStatus,
  ProductUnitOfMeasure,
  seasonApi,
  type ProductPatchRequestDto,
  type ProductSkuMatrixLeafRowDto,
  type SkuMatrixPreviewRequestDto,
  type SkuMatrixPreviewResponseDto,
} from '../../../../apis';
import type { VariantMatrixFlatRow } from '../product-spu.interface';
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
import {
  extractVariantsFromPreviewMatrix,
  flattenSkuPreviewMatrixForTable,
  skuPreviewResponseMatchesRequest,
  skuPreviewResponseToAttributeDefs,
  variationMediaUrlsByVariantId,
} from '../utils/product-spu-sku-matrix-preview.utils';
import { parseNullableNumber } from '../utils/product-spu-pricing.utils';
import { orderedAttributeIdsFromProductDetail, selectedAttributeKeysFromProductDetail } from '../utils/product-spu-admin-detail.utils';
import { buildProductPatchBody } from '../utils/product-spu-patch-payload.utils';
import { isOnlyProductSkuApiFieldValidationError, mapProductSkuApiValidationErrors, mapRhfSkuRowErrorsToLeafFieldErrors } from '../utils/product-spu-sku-field-errors.utils';
import { buildProductSpuDetailHydrationKey, buildProductSpuDetailSwrKey, revalidateProductSpuDetail } from '../utils/product-spu-detail-cache.utils';
import { TagCommonComponent } from '../../../../components/tag';
import type { ProductSpuPageSection } from '../product-spu.interface';
import { CategoryStatus } from '../../../../apis/category/category.enum';
import { ROUTE_PATH } from '@/trading-ui/router/route.path';

type ProductSpuUpdateFormValues = ProductPatchRequestDto & { spuCode: string; productKind?: ProductKind };

const snapshotFormValues = (values: ProductSpuUpdateFormValues): ProductSpuUpdateFormValues => JSON.parse(JSON.stringify(values)) as ProductSpuUpdateFormValues;

const resolveSkuTaxRateOverridePayload = (row: ProductSkuMatrixLeafRowDto): number | null | undefined => {
  const taxRateOverride = row.taxRateOverride.trim();
  if (taxRateOverride !== '') return Number(taxRateOverride);
  return row.variationUuid ? null : undefined;
};

const matrixLeafRowToSkuUpsert = (row: ProductSkuMatrixLeafRowDto) => {
  const taxRateOverridePayload = resolveSkuTaxRateOverridePayload(row);
  const sellingPriceAfterTaxMinor = parseNullableNumber(row.sellingPriceAfterTaxMinor);
  const costPriceAfterTaxMinor = parseNullableNumber(row.costPriceAfterTaxMinor);
  const compareAtPriceAfterTaxMinor = parseNullableNumber(row.compareAtPriceAfterTaxMinor);
  return {
    clientKey: row.rowId,
    uuid: row.variationUuid,
    skuCode: row.skuCode.trim(),
    status: row.status,
    compareAtPriceAfterTaxMinor,
    sellingPriceAfterTaxMinor: sellingPriceAfterTaxMinor ?? undefined,
    /** BE: null/0/missing = clear Giá nhập; PATCH omit (undefined) giữ giá cũ — phải gửi null khi xóa. */
    costPriceAfterTaxMinor,
    b2bWholesalePriceAfterTax: row.b2bWholesalePriceAfterTax.trim() !== '' ? Number(row.b2bWholesalePriceAfterTax) : undefined,
    ...(taxRateOverridePayload !== undefined ? { taxRateOverride: taxRateOverridePayload } : {}),
    attributeValueUuids: [...row.attributeValueUuids],
    medias: row.medias ?? [],
    weight: row.weight !== '' ? Number(row.weight) : undefined,
    length: row.length !== '' ? Number(row.length) : undefined,
    width: row.width !== '' ? Number(row.width) : undefined,
    height: row.height !== '' ? Number(row.height) : undefined,
  };
};

const ProductSpuUpdatePage = () => {
  const navigate = useNavigate();
  const goBackToList = useProductSpuListBackNavigation();
  const { spuId } = useParams<{ spuId: string }>();
  const { showSnackbar } = useSnackbar();
  const { control, handleSubmit, reset, setValue, setError, getValues, clearErrors, formState } = useForm<ProductSpuUpdateFormValues>({
    resolver: yupResolver(productUpdateRequestDtoSchema) as Resolver<ProductSpuUpdateFormValues>,
    defaultValues: {
      spuCode: '',
      productKind: ProductKind.MERCHANDISE,
      unitOfMeasure: ProductUnitOfMeasure.EACH,
      name: '',
      categoryUuid: '',
      brandId: '',
      seasonUuid: '',
      taxRateOverride: undefined,
      description: '',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      attributes: [],
      skus: { upsert: [] },
      productInfos: [],
      productMixMatch: [],
    },
  });

  const { isDirty, errors } = formState;
  const formBaselineRef = useRef<ProductSpuUpdateFormValues | null>(null);

  const watchedCategoryUuid = useWatch({ control, name: 'categoryUuid' });
  const watchedProductTaxRateOverride = useWatch({ control, name: 'taxRateOverride' });
  const watchedProductMixMatch = useWatch({ control, name: 'productMixMatch' });

  const [matrixMode, setMatrixMode] = useState<'fromDetail' | 'fromPreview'>('fromDetail');
  const [selectedAttributes, setSelectedAttributes] = useState<readonly string[]>([]);
  const [orderedAttributeIds, setOrderedAttributeIds] = useState<string[]>([]);
  const [submittingAction, setSubmittingAction] = useState<'save' | 'submit' | null>(null);
  const [skuMatrixAwaitingPreview, setSkuMatrixAwaitingPreview] = useState(false);
  const [attributeSelectOpen, setAttributeSelectOpen] = useState(false);
  const [, startMatrixTransition] = useTransition();
  const [heldSkuMatrixPreview, setHeldSkuMatrixPreview] = useState<{
    fingerprint: string;
    data: SkuMatrixPreviewResponseDto;
  } | null>(null);
  const hydratedForSpuRef = useRef<string | null>(null);
  const activeAttrMergeKeyRef = useRef<string>('__init__');
  const allowSkuLeafSyncToDirtyRef = useRef(false);
  const attributesTouchDirtyRef = useRef(false);
  const formBaselineAppliedRef = useRef<string | null>(null);

  const detailSwr = useSWR(spuId ? buildProductSpuDetailSwrKey(spuId) : null, () => productApi.getAdminProductDetail(spuId!), {
    revalidateOnFocus: false,
    revalidateOnMount: true,
  });
  const detail = detailSwr.data;
  const isPackagingProduct = isPackagingLikeProductKind(detail?.productKind);
  const isShippingPackagingProduct = detail?.productKind === ProductKind.SHIPPING_PACKAGING;

  const attributeTreeCategoryId = useMemo(() => {
    const fromForm = (watchedCategoryUuid ?? '').trim();
    if (fromForm) return fromForm;
    return String(detail?.category?.id ?? detail?.categoryId ?? '').trim();
  }, [watchedCategoryUuid, detail?.category?.id, detail?.categoryId]);

  const { data: categoryRes } = useSWR(['product/admin/categories', 'list'], () => categoryApi.getCategoryTree({ status: CategoryStatus.ACTIVE }), {
    revalidateOnFocus: false,
  });
  const { data: seasonRes } = useSWR(null, () => seasonApi.getAdminSeasonList({ isPagination: false }), { revalidateOnFocus: false });
  const { data: brandRes } = useSWR(['product/admin/brands', 'list'], () => brandApi.getBrandList({ isPagination: false }), { revalidateOnFocus: false });
  const attributeTreeSwrKey = attributeTreeCategoryId ? (['product/admin/attributes', 'tree', false, attributeTreeCategoryId] as const) : null;
  const { data: attributeTreeRes, isLoading: attributeTreeLoading } = useSWR(attributeTreeSwrKey, () => attributeApi.getAttributeTree({ isPagination: false, categoryId: attributeTreeCategoryId }), {
    revalidateOnFocus: false,
  });

  const categoryTreeOptions = useMemo(() => buildCategoryTreeSelectOptions(categoryRes ?? []), [categoryRes]);
  const seasonOptions = useMemo(() => (seasonRes?.list ?? []).map((item) => ({ value: item.id, label: item.name })), [seasonRes]);
  const selectedCategory = useMemo(() => findCategoryInTree(categoryRes ?? [], attributeTreeCategoryId), [attributeTreeCategoryId, categoryRes]);
  const selectedCategoryTaxRateText = selectedCategory?.taxRate ?? detail?.category?.taxRate ?? '';
  const selectedCategoryTaxRate = useMemo(() => parseNullableNumber(selectedCategoryTaxRateText), [selectedCategoryTaxRateText]);

  const attributeTreeRows = attributeTreeRes?.list ?? [];
  const attributeTreeSelectOptions = useMemo(() => buildAttributeTreeSelectOptions(attributeTreeRows), [attributeTreeRows]);
  const skuMatrixLeafFieldErrors = useMemo(() => mapRhfSkuRowErrorsToLeafFieldErrors(errors.skus?.upsert), [errors.skus?.upsert]);

  useEffect(() => {
    hydratedForSpuRef.current = null;
    allowSkuLeafSyncToDirtyRef.current = false;
    formBaselineAppliedRef.current = null;
  }, [spuId]);

  useEffect(() => {
    if (!detail || !spuId) return;

    const hydrationKey = buildProductSpuDetailHydrationKey(spuId, detail);
    if (hydratedForSpuRef.current === hydrationKey) return;

    allowSkuLeafSyncToDirtyRef.current = false;
    hydratedForSpuRef.current = hydrationKey;
    formBaselineAppliedRef.current = null;
    const isPackaging = isPackagingLikeProductKind(detail.productKind);
    const packagingSku = detail.variations?.[0];

    reset({
      spuCode: detail.spuCode ?? '',
      productKind: (detail.productKind as ProductKind | undefined) ?? ProductKind.MERCHANDISE,
      unitOfMeasure:
        (detail.unitOfMeasure as ProductUnitOfMeasure | undefined) && Object.values(ProductUnitOfMeasure).includes(detail.unitOfMeasure as ProductUnitOfMeasure)
          ? (detail.unitOfMeasure as ProductUnitOfMeasure)
          : ProductUnitOfMeasure.EACH,
      name: detail.name,
      categoryUuid: detail.category?.id ?? detail.categoryId,
      brandId: brandRes?.list?.[0]?.id ?? detail.brandId ?? '',
      seasonUuid: isPackaging ? undefined : (detail.season?.id ?? detail.seasonId ?? ''),
      taxRateOverride: detail.taxRateOverride ?? undefined,
      description: detail.description ?? '',
      metaTitle: detail.metaTitle ?? '',
      metaDescription: detail.metaDescription ?? '',
      metaKeywords: detail.metaKeywords ?? '',
      weight: detail.weight ?? undefined,
      length: detail.length ?? undefined,
      width: detail.width ?? undefined,
      height: detail.height ?? undefined,
      attributes: [],
      skus: {
        upsert: isPackaging && packagingSku ? [packagingVariationToSkuUpsert(packagingSku)] : [],
      },
      productInfos: (detail.productInfos ?? []).map((info, index) => ({
        title: info.title,
        description: info.description,
        sortOrder: info.sortOrder ?? index,
      })),
      productMixMatch: (detail.productMixMatch ?? []).map((item) => item.id),
    });

    if (isPackaging) {
      setSelectedAttributes([]);
      setOrderedAttributeIds([]);
      setMatrixMode('fromDetail');
      activeAttrMergeKeyRef.current = '';
    } else {
      const selected = selectedAttributeKeysFromProductDetail(detail);
      const ordered = orderedAttributeIdsFromProductDetail(detail);
      setSelectedAttributes(selected);
      setOrderedAttributeIds(ordered);
      setMatrixMode('fromDetail');
      activeAttrMergeKeyRef.current = getActiveAttributeIdsInTreeOrder(attributeTreeRows, selected).join('|');
    }
  }, [attributeTreeRows, brandRes, detail, reset, spuId]);

  const activeAttributeIdsInTreeOrder = useMemo(() => getActiveAttributeIdsInTreeOrder(attributeTreeRows, selectedAttributes), [attributeTreeRows, selectedAttributes]);

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
    if (isPackagingProduct) return;
    const touch = attributesTouchDirtyRef.current;
    attributesTouchDirtyRef.current = false;
    setValue('attributes', assignments, { shouldDirty: touch });
    if (assignments.length > 0) {
      clearErrors('attributes');
    }
  }, [assignments, clearErrors, isPackagingProduct, setValue]);

  const deferredSelectedAttributes = useDeferredValue(selectedAttributes);
  const assignmentsForPreview = useMemo(() => buildProductAttributeAssignmentsFromSelection(attributeTreeRows, deferredSelectedAttributes), [attributeTreeRows, deferredSelectedAttributes]);

  const previewPayload = useMemo(() => buildSkuMatrixPreviewRequestDto(orderedAttributeIds, assignmentsForPreview), [assignmentsForPreview, orderedAttributeIds]);

  const previewVariantsFromDetail = useMemo(() => (detail?.variantMatrix?.matrix ? extractVariantsFromPreviewMatrix(detail.variantMatrix.matrix) : []), [detail?.variantMatrix?.matrix]);

  const previewBody = useMemo((): SkuMatrixPreviewRequestDto | null => {
    if (!previewPayload) return null;
    return previewVariantsFromDetail.length ? ({ ...previewPayload, variants: previewVariantsFromDetail } as SkuMatrixPreviewRequestDto) : previewPayload;
  }, [previewPayload, previewVariantsFromDetail]);

  const previewSwrKey = useMemo((): readonly ['product/admin/products/sku-matrix/preview', string] | null => {
    if (attributeSelectOpen) return null;
    if (matrixMode !== 'fromPreview' || !previewBody) return null;
    return ['product/admin/products/sku-matrix/preview', JSON.stringify(previewBody)] as const;
  }, [attributeSelectOpen, matrixMode, previewBody]);

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
    if (matrixMode !== 'fromPreview' || !previewPayload || !previewFingerprint) return undefined;

    const matchesPayload = (value: SkuMatrixPreviewResponseDto | undefined): value is SkuMatrixPreviewResponseDto => Boolean(value && skuPreviewResponseMatchesRequest(value, previewPayload));

    if (matchesPayload(skuPreviewRes)) return skuPreviewRes;
    if (heldSkuMatrixPreview?.fingerprint === previewFingerprint && matchesPayload(heldSkuMatrixPreview.data)) {
      return heldSkuMatrixPreview.data;
    }

    return undefined;
  }, [heldSkuMatrixPreview, matrixMode, previewFingerprint, previewPayload, skuPreviewRes]);

  const skuMatrixPreviewFlatRows = useMemo((): VariantMatrixFlatRow[] | undefined => {
    if (matrixMode === 'fromDetail' && detail?.variantMatrix) {
      return flattenSkuPreviewMatrixForTable(detail.variantMatrix, {
        mediaUrlsByVariantId: variationMediaUrlsByVariantId(detail.variations),
      });
    }
    if (matrixMode === 'fromPreview') {
      if (!previewPayload) return undefined;
      if (!resolvedSkuPreviewRes) return [];
      return flattenSkuPreviewMatrixForTable(resolvedSkuPreviewRes, {
        mediaUrlsByVariantId: variationMediaUrlsByVariantId(detail?.variations),
      });
    }
    return undefined;
  }, [detail?.variantMatrix, detail?.variations, matrixMode, previewPayload, resolvedSkuPreviewRes]);

  /** Một lần sau khi attrs + (SKU từ detail nếu có ma trận) đã vào form — coi là mặc định, isDirty = false. */
  useEffect(() => {
    if (!spuId || !detail) return;

    const hydrationKey = buildProductSpuDetailHydrationKey(spuId, detail);
    if (hydratedForSpuRef.current !== hydrationKey) return;
    if (formBaselineAppliedRef.current === hydrationKey) return;

    const attrLen = getValues('attributes')?.length ?? 0;
    const skuLen = getValues('skus')?.upsert?.length ?? 0;
    const hasVariantMatrix = Boolean(detail.variantMatrix?.matrix);

    if (isPackagingProduct) {
      if (skuLen === 0) return;
    } else {
      if (attrLen === 0) return;
      if (matrixMode === 'fromDetail' && hasVariantMatrix && skuLen === 0) return;
    }

    const baselineValues = getValues();
    reset(baselineValues);
    formBaselineRef.current = snapshotFormValues(baselineValues);
    formBaselineAppliedRef.current = hydrationKey;
    allowSkuLeafSyncToDirtyRef.current = true;
  }, [assignments, detail, getValues, isPackagingProduct, matrixMode, reset, skuMatrixPreviewFlatRows, spuId]);

  const skuMatrixPreviewWasValidatingRef = useRef(false);
  useEffect(() => {
    if (skuMatrixPreviewWasValidatingRef.current && !skuPreviewValidating) {
      setSkuMatrixAwaitingPreview(false);
    }
    skuMatrixPreviewWasValidatingRef.current = skuPreviewValidating;
  }, [skuPreviewValidating]);

  const skuMatrixPreviewBlocking = Boolean(matrixMode === 'fromPreview' && previewPayload && (skuMatrixAwaitingPreview || skuPreviewValidating || (skuPreviewLoading && !resolvedSkuPreviewRes)));

  const matrixDisplayAttributeOrder = useMemo(() => {
    if (matrixMode === 'fromDetail' && detail?.variantMatrix) {
      return skuPreviewResponseToAttributeDefs(detail.variantMatrix);
    }
    if (resolvedSkuPreviewRes) return skuPreviewResponseToAttributeDefs(resolvedSkuPreviewRes);
    return orderedAttributeIdsToVariantAttributeDefs(attributeTreeRows, orderedAttributeIds);
  }, [attributeTreeRows, detail?.variantMatrix, matrixMode, orderedAttributeIds, resolvedSkuPreviewRes]);

  const handleLeafSkuRowsChange = useCallback(
    (rows: readonly ProductSkuMatrixLeafRowDto[]) => {
      setValue('skus', { upsert: rows.map(matrixLeafRowToSkuUpsert) }, { shouldDirty: allowSkuLeafSyncToDirtyRef.current });
    },
    [setValue],
  );

  const pendingCreate = isPendingCreateApproval(detail?.approval);
  const pendingUpdate = isPendingUpdateApproval(detail?.approval);
  const isDraft = detail?.status === ProductSpuStatus.DRAFT;
  const isArchived = detail?.status === ProductSpuStatus.ARCHIVED;
  const isReadonly = Boolean(isArchived || detail?.approval?.hasPending);
  const canPublish = detail?.status === ProductSpuStatus.UNPUBLISHED && !detail?.approval?.hasPending;
  const canDiscontinue = detail?.status === ProductSpuStatus.PUBLISHED && !detail?.approval?.hasPending;
  const canArchive = detail?.status === ProductSpuStatus.PUBLISHED && !detail?.approval?.hasPending;
  const canRestorePublished = detail?.status === ProductSpuStatus.DISCONTINUED && !detail?.approval?.hasPending;
  const canRestoreUnpublished = detail?.status === ProductSpuStatus.ARCHIVED && !detail?.approval?.hasPending;
  const canCancelPending = Boolean(detail?.approval?.hasPending && detail.approval.requestId);

  const onSelectedAttributesChange = useCallback(
    (next: readonly string[]) => {
      if (isReadonly) return;
      attributesTouchDirtyRef.current = true;
      setSelectedAttributes(next);
      startMatrixTransition(() => {
        setMatrixMode('fromPreview');
        setSkuMatrixAwaitingPreview(true);
      });
    },
    [isReadonly],
  );

  const onReorderAppliedAttributes = useCallback(
    (ids: string[]) => {
      if (isReadonly) return;
      attributesTouchDirtyRef.current = true;
      startMatrixTransition(() => {
        setMatrixMode('fromPreview');
        setSkuMatrixAwaitingPreview(true);
        setOrderedAttributeIds(ids);
      });
    },
    [isReadonly],
  );

  const submitPatch = useCallback(
    async (values: ProductSpuUpdateFormValues, submitCreateApproval: boolean) => {
      if (!spuId || !detail) return;

      setSubmittingAction(submitCreateApproval ? 'submit' : 'save');
      try {
        const brandId = brandRes?.list?.[0]?.id ?? values.brandId ?? '';
        const currentValues = { ...values, brandId };

        if (isPackagingLikeProductKind(values.productKind) && currentValues.skus?.upsert?.length) {
          currentValues.skus.upsert = currentValues.skus.upsert.map((item) => normalizePackagingSkuUpsert(item, values.productKind));
        }

        const patchBody = buildProductPatchBody(formBaselineRef.current ?? {}, currentValues);

        if (patchBody.productInfos) {
          patchBody.productInfos = patchBody.productInfos.map((item, index) => ({
            ...item,
            sortOrder: index,
          }));
        }

        if (Object.keys(patchBody).length === 0 && !submitCreateApproval) {
          showSnackbar({ message: 'Không có thay đổi để lưu.', type: SnackbarType.INFO });
          return;
        }

        if (Object.keys(patchBody).length > 0) {
          await productApi.patchAdminProduct(spuId, patchBody);
        }

        if (submitCreateApproval) {
          await productApi.postAdminProductSubmit(spuId);
          showSnackbar({ message: 'Đã cập nhật draft và gửi yêu cầu duyệt.', type: SnackbarType.SUCCESS });
          void goBackToList();
        } else if (isDraft) {
          showSnackbar({ message: 'Đã lưu bản nháp.', type: SnackbarType.SUCCESS });
        } else {
          showSnackbar({ message: 'Đã tạo yêu cầu cập nhật và chờ duyệt.', type: SnackbarType.SUCCESS });
          void goBackToList();
        }

        await revalidateProductSpuDetail(spuId);
      } catch (error) {
        const mappedFieldErrors = mapProductSkuApiValidationErrors(error, 'update');
        if (mappedFieldErrors.length > 0) {
          for (const fieldError of mappedFieldErrors) {
            setError(fieldError.formPath as FieldPath<ProductSpuUpdateFormValues>, { type: 'server', message: fieldError.message });
          }
        }
        if (!isOnlyProductSkuApiFieldValidationError(error)) {
          showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
        }
      } finally {
        setSubmittingAction(null);
      }
    },
    [brandRes, detail, goBackToList, isDraft, setError, showSnackbar, spuId],
  );

  const handleSave = useCallback((values: ProductSpuUpdateFormValues) => submitPatch(values, false), [submitPatch]);

  const handleSubmitDraftApproval = useCallback((values: ProductSpuUpdateFormValues) => submitPatch(values, true), [submitPatch]);

  const handlePublish = useCallback(async () => {
    if (!spuId || !canPublish) return;
    try {
      await productApi.patchAdminProductStatus(spuId, { status: ProductSpuStatus.PUBLISHED });
      showSnackbar({ message: 'Đã xuất bản sản phẩm.', type: SnackbarType.SUCCESS });
      await revalidateProductSpuDetail(spuId);
    } catch (error) {
      showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
    }
  }, [canPublish, detailSwr, showSnackbar, spuId]);

  const handleArchive = useCallback(async () => {
    if (!spuId || !canArchive) return;
    try {
      await productApi.patchAdminProductStatus(spuId, { status: ProductSpuStatus.ARCHIVED });
      showSnackbar({ message: 'Đã lưu trữ sản phẩm.', type: SnackbarType.SUCCESS });
      await revalidateProductSpuDetail(spuId);
    } catch (error) {
      showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
    }
  }, [canArchive, detailSwr, showSnackbar, spuId]);

  const handleDiscontinue = useCallback(async () => {
    if (!spuId || !canDiscontinue) return;
    try {
      await productApi.patchAdminProductStatus(spuId, { status: ProductSpuStatus.DISCONTINUED });
      showSnackbar({ message: 'Đã chuyển sản phẩm sang ngừng kinh doanh.', type: SnackbarType.SUCCESS });
      await revalidateProductSpuDetail(spuId);
    } catch (error) {
      showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
    }
  }, [canDiscontinue, detailSwr, showSnackbar, spuId]);

  const handleRestorePublished = useCallback(async () => {
    if (!spuId || !canRestorePublished) return;
    try {
      await productApi.patchAdminProductStatus(spuId, { status: ProductSpuStatus.PUBLISHED });
      showSnackbar({ message: 'Đã khôi phục kinh doanh sản phẩm.', type: SnackbarType.SUCCESS });
      await revalidateProductSpuDetail(spuId);
    } catch (error) {
      showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
    }
  }, [canRestorePublished, detailSwr, showSnackbar, spuId]);

  const handleRestoreUnpublished = useCallback(async () => {
    if (!spuId || !canRestoreUnpublished) return;
    try {
      await productApi.patchAdminProductStatus(spuId, { status: ProductSpuStatus.UNPUBLISHED });
      showSnackbar({ message: 'Đã khôi phục sản phẩm (chưa xuất bản).', type: SnackbarType.SUCCESS });
      await revalidateProductSpuDetail(spuId);
    } catch (error) {
      showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
    }
  }, [canRestoreUnpublished, detailSwr, showSnackbar, spuId]);

  const handleCancelPendingApproval = useCallback(async () => {
    if (!spuId || !detail?.approval?.requestId) return;
    try {
      await productApi.postAdminProductApprovalCancel(detail.approval.requestId);
      showSnackbar({ message: 'Đã hủy yêu cầu duyệt.', type: SnackbarType.SUCCESS });
      await revalidateProductSpuDetail(spuId);
    } catch (error) {
      showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
    }
  }, [detail?.approval?.requestId, showSnackbar, spuId]);

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
              isUpdate
              hideTaxonomy={isPackagingProduct}
              disabled={isReadonly}
            />
          </ProductSpuSectionPanel>
        ),
      },
      isPackagingProduct
        ? {
            key: ProductSpuSidebarKey.VARIANTS,
            content: (
              <ProductSpuSectionPanel title={isShippingPackagingProduct ? 'Bao bì đóng gói (theo đơn)' : 'Biến thể bao bì'} icon={<Archive size={20} color="#737373" />}>
                <ProductSpuPackagingSkuForm
                  control={control as unknown as Control<FieldValues>}
                  fieldPrefix="skus.upsert.0"
                  disabled={isReadonly}
                  variant={isShippingPackagingProduct ? 'shipping_packaging' : 'retail_packaging'}
                />
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
                    isUpdate
                    readOnly={isReadonly}
                    appliedAttributeSummaries={appliedAttributeSummaries}
                    attributeOrder={matrixDisplayAttributeOrder}
                    keyRows={[]}
                    attributeTreeOptions={attributeTreeSelectOptions}
                    selectedAttributes={selectedAttributes}
                    onSelectedAttributesChange={onSelectedAttributesChange}
                    onAttributeSelectOpenChange={setAttributeSelectOpen}
                    attributeTreeLoading={attributeTreeLoading}
                    categoryTaxRate={selectedCategoryTaxRate}
                    productTaxRateOverride={watchedProductTaxRateOverride ?? null}
                    appliedAttributesError={Boolean(errors.attributes)}
                    appliedAttributesErrorMessage={
                      errors.attributes && typeof errors.attributes === 'object' && 'message' in errors.attributes ? String((errors.attributes as { message?: string }).message) : undefined
                    }
                    skuMatrixPreviewFlatRows={skuMatrixPreviewFlatRows}
                    skuMatrixPreviewLoading={skuMatrixPreviewBlocking}
                    enableSortableAttributeSummaries={!isReadonly}
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
                {spuId ? (
                  <ProductSpuPackagingRelationsEditor
                    productId={spuId}
                    productKind={detail?.productKind}
                    relations={detail?.packagingRelations ?? []}
                    disabled={isReadonly}
                    onSaved={() => void revalidateProductSpuDetail(spuId!)}
                  />
                ) : null}
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
                  <ProductSpuMixMatchEditor
                    value={watchedProductMixMatch ?? []}
                    resolvedItems={detail?.productMixMatch}
                    onChange={(next) => setValue('productMixMatch', next, { shouldDirty: true })}
                    readOnly={isReadonly}
                    excludeProductId={spuId}
                  />
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
                <ProductSpuSeoFormFields control={control} disabled={isReadonly} />
              </ProductSpuSectionPanel>
            ),
          },
    ];

    return blocks.filter((block): block is ProductSpuPageSection => Boolean(block) && block?.key!==ProductSpuSidebarKey.PACKAGING);
  }, [
    appliedAttributeSummaries,
    attributeTreeLoading,
    attributeTreeSelectOptions,
    categoryTreeOptions,
    control,
    detail,
    detail?.pendingApproval,
    detail?.packagingRelations,
    detail?.productMixMatch,
    isPackagingProduct,
    isShippingPackagingProduct,
    detail?.variations,
    errors.attributes,
    detailSwr,
    handleLeafSkuRowsChange,
    isReadonly,
    matrixDisplayAttributeOrder,
    onReorderAppliedAttributes,
    onSelectedAttributesChange,
    pendingUpdate,
    seasonOptions,
    selectedCategoryTaxRate,
    selectedCategoryTaxRateText,
    selectedAttributes,
    skuMatrixLeafFieldErrors,
    skuMatrixPreviewBlocking,
    skuMatrixPreviewFlatRows,
    spuId,
    setValue,
    watchedProductMixMatch,
  ]);

  if (!spuId || (detailSwr.error && !detail)) {
    return <EmptyComponent />;
  }

  if (detailSwr.isLoading && !detail) {
    return <LoadingComponent size="large" />;
  }

  return (
    <React.Fragment>
      <Stack
        sx={{
          height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`,
          boxSizing: 'border-box',
          minHeight: 0,
          bgcolor: '#F9FAFB',
          gap: 0,
        }}
      >
        <LabelFormPageHeader variant="backOnly" onBack={goBackToList} />
        <StackRowAlignCenterJustBetween sx={{ px: 3, py: 2, backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
          <Stack gap={0.75}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES['2xl'].bold, color: '#101828' }}>Cập nhật sản phẩm</Typography>
            <StackRowAlignCenter gap={1}>
              <TagCommonComponent border content={getProductLifecycleStatusLabelVi(detail?.status ?? ProductSpuStatus.DRAFT)} />
              <TagCommonComponent content={getProductApprovalStatusLabelVi(detail?.approval, detail?.status)} />
            </StackRowAlignCenter>
          </Stack>
          <StackRowAlignCenter gap={1}>
            {canPublish ? (
              <ButtonIconContentComponent
                content="Xuất bản"
                icon={<Send01 size={18} color="#101828" />}
                onClick={() => void handlePublish()}
                {...productListButtonPermission('publish', 'Xuất bản sản phẩm', 'api_product_update')}
                sx={{ color: '#101828', border: '1px solid #111827', padding: '8px 12px' }}
              />
            ) : null}
            {canDiscontinue ? (
              <ButtonIconContentComponent
                content="Ngừng kinh doanh"
                icon={<XClose size={18} color="#101828" />}
                onClick={() => void handleDiscontinue()}
                {...productListButtonPermission('discontinue', 'Ngừng kinh doanh sản phẩm', 'api_product_update')}
                sx={{ color: '#101828', border: '1px solid #111827', padding: '8px 12px' }}
              />
            ) : null}
            {canArchive ? (
              <ButtonIconContentComponent
                content="Lưu trữ"
                icon={<Archive size={18} color="#101828" />}
                onClick={() => void handleArchive()}
                {...productListButtonPermission('archive', 'Lưu trữ sản phẩm', 'api_product_update')}
                sx={{ color: '#101828', border: '1px solid #111827', padding: '8px 12px' }}
              />
            ) : null}
            {canRestorePublished ? (
              <ButtonIconContentComponent
                content="Khôi phục kinh doanh"
                icon={<RefreshCcw01 size={18} color="#101828" />}
                onClick={() => void handleRestorePublished()}
                {...productListButtonPermission('restore_published', 'Khôi phục kinh doanh sản phẩm', 'api_product_update')}
                sx={{ color: '#101828', border: '1px solid #111827', padding: '8px 12px' }}
              />
            ) : null}
            {canRestoreUnpublished ? (
              <ButtonIconContentComponent
                content="Khôi phục"
                icon={<RefreshCcw01 size={18} color="#101828" />}
                onClick={() => void handleRestoreUnpublished()}
                {...productListButtonPermission('restore', 'Khôi phục sản phẩm', 'api_product_update')}
                sx={{ color: '#101828', border: '1px solid #111827', padding: '8px 12px' }}
              />
            ) : null}
            {canCancelPending ? (
              <ButtonIconContentComponent
                content="Hủy yêu cầu"
                icon={<XClose size={18} color="#B42318" />}
                onClick={() => void handleCancelPendingApproval()}
                {...productListButtonPermission('cancel_approval', 'Hủy yêu cầu duyệt sản phẩm', 'api_product_submit')}
                sx={{ color: '#B42318', border: '1px solid #B42318', padding: '8px 12px' }}
              />
            ) : null}
            {!isReadonly ? (
              <CustomButton
                variant="primary"
                fullWidth={false}
                disabled={Boolean(submittingAction) || !isDirty}
                onClick={() => void handleSubmit(handleSave)()}
                sx={{
                  textTransform: 'none',
                  bgcolor: '#101828',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#101828', opacity: 0.92 },
                }}
              >
                {isDraft ? 'Lưu nháp' : 'Cập nhật'}
              </CustomButton>
            ) : null}
            {isDraft && !pendingCreate ? (
              <CustomButton
                variant="outline"
                fullWidth={false}
                disabled={submittingAction === 'submit'}
                onClick={() => void handleSubmit(handleSubmitDraftApproval)()}
                {...productListButtonPermission('submit', 'Xuất bản sản phẩm', 'api_product_submit')}
                sx={{ textTransform: 'none', borderColor: '#101828', color: '#101828' }}
              >
                Xuất bản
              </CustomButton>
            ) : null}
            {!isReadonly ? (
              <CustomButton variant="outline" fullWidth={false} onClick={() => navigate(ROUTE_PATH.PRODUCT_SPU_LIST)} sx={{ color: '#101828', border: '1px solid #111827', padding: '8px 12px' }}>
                Hủy
              </CustomButton>
            ) : null}
          </StackRowAlignCenter>
        </StackRowAlignCenterJustBetween>

        {pendingCreate ? (
          <Box sx={{ px: 3, py: 2, bgcolor: '#FFFAEB', borderBottom: '1px solid #FDE68A' }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#B54708' }}>Bản nháp đang chờ duyệt tạo mới. Hủy yêu cầu nếu cần sửa tiếp.</Typography>
          </Box>
        ) : null}

        {hasRejectedCreateApproval(detail?.approval, detail?.status) ? (
          <Box sx={{ px: 3, py: 2, bgcolor: '#FEF3F2', borderBottom: '1px solid #FDA29B' }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#B42318' }}>Yêu cầu tạo mới trước đó bị từ chối. Bạn có thể chỉnh sửa bản nháp và gửi lại.</Typography>
            {detail?.approval?.rejectedReason ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#B42318' }}>Lý do: {detail.approval.rejectedReason}</Typography> : null}
          </Box>
        ) : null}

        <Box sx={{ flex: 1, minHeight: 0, p: 3, pt: 0 }}>
          <ProductSpuPageSectionsFrame sections={sectionBlocks} scrollAreaMaxHeight="calc(100vh - 220px)" sx={{ pt: 2 }} />
        </Box>
      </Stack>
    </React.Fragment>
  );
};

export default ProductSpuUpdatePage;
