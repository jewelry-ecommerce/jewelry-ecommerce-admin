import dayjs, { type Dayjs } from 'dayjs';
import { OrderType } from '@/trading-ui/adapters/library';
import {
  preOrderCampaignApi,
  type CreatePreOrderCampaignDto,
  type PreOrderCampaign,
  type PreOrderCampaignSkuSearchItem,
  type UpdatePreOrderCampaignDto,
  type WmsSkuSearchListItem,
  PreOrderCampaignStatus,
  PreOrderProductSourceType,
} from '../../../apis';
import {
  PRE_ORDER_CAMPAIGN_DEFAULT_MAX_PURCHASE_QTY,
  PRE_ORDER_CAMPAIGN_DEFAULT_PAYMENT_TIMEOUT_HOURS,
  PRE_ORDER_CAMPAIGN_NAME_MAX,
  PRE_ORDER_CAMPAIGN_SKU_SEARCH_PRODUCT_STATUSES,
} from './pre-order-campaign.constants';
import type { PreOrderCampaignFormEditableFlags, PreOrderCampaignFormMode, PreOrderCampaignFormValues, PreOrderSelectedSku } from './pre-order-campaign.interface';

const SKU_SEARCH_PAGE_TAKE = 100;
const SKU_SEARCH_MAX_PAGES = 50;
/** UUID (kể cả v7) — badge-flow / productScope.collectionIds bắt buộc UUID. */
const UUID_LIKE_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isUuidLike = (value: string): boolean => UUID_LIKE_PATTERN.test(value.trim());

const sanitizeProductSourceRefs = (refs: string[]): string[] => [...new Set(refs.map((id) => String(id).trim()).filter(isUuidLike))];

const resolveSkuImageUrl = (item: WmsSkuSearchListItem): string => {
  const fromRoot = item.image?.trim();
  if (fromRoot) return fromRoot;
  return item.medias?.[0]?.url?.trim() ?? item.medias?.[0]?.path?.trim() ?? '';
};

export const mapAdminSkuToSelected = (item: WmsSkuSearchListItem, badgeProductScopeType = 'VARIANT'): PreOrderSelectedSku | null => {
  const productVariantId = String(item.id ?? '').trim();
  if (!productVariantId) return null;
  const skuCode = String(item.skuCode ?? '').trim() || productVariantId;
  return {
    skuCode,
    productName: String(item.name ?? item.product?.name ?? '').trim() || skuCode,
    variationName:
      item.attributes
        ?.map((a) => a.value)
        .filter(Boolean)
        .join(' / ') || undefined,
    imageUrl: resolveSkuImageUrl(item) || undefined,
    productVariantId,
    productId: String(item.product?.id ?? '').trim() || undefined,
    badgeProductScopeType,
  };
};

const resolveCampaignSkuSearchImage = (item: PreOrderCampaignSkuSearchItem): string | undefined => {
  const fromRoot = item.image?.trim();
  if (fromRoot) return fromRoot;
  const fromMedia = item.medias?.[0]?.url?.trim() ?? item.medias?.[0]?.path?.trim();
  return fromMedia || undefined;
};

export const mapCampaignSkuSearchItemToSelected = (item: PreOrderCampaignSkuSearchItem, badgeProductScopeType: string): PreOrderSelectedSku | null => {
  const productVariantId = String(item.productVariantId ?? item.id ?? '').trim();
  const skuCode = String(item.skuCode ?? '').trim() || productVariantId;
  if (!skuCode) return null;

  const variationFromAttrs =
    item.attributes
      ?.map((a) => a.value)
      .filter(Boolean)
      .join(' / ') || undefined;

  return {
    skuCode,
    productName: String(item.productName ?? item.name ?? item.product?.name ?? '').trim() || skuCode,
    variationName: item.variationName ?? variationFromAttrs,
    imageUrl: resolveCampaignSkuSearchImage(item),
    productVariantId: productVariantId || undefined,
    productId: String(item.productId ?? item.product?.id ?? '').trim() || undefined,
    badgeProductScopeType: item.badgeProductScopeType ?? badgeProductScopeType,
    disabled: Boolean(item.disabled),
    disabledMessage: item.disabledMessage?.trim() || undefined,
  };
};

/** Materialize SKU từ collection/category qua POST `/order/pre-order/campaigns/skus/search`. */
export const resolveSkusFromProductSource = async (
  productSourceType: PreOrderProductSourceType | '',
  productSourceRefs: string[],
  options?: { badgeTemplateId?: string; activeFrom?: string | null; activeTo?: string | null },
): Promise<PreOrderSelectedSku[]> => {
  if (!productSourceType || productSourceType === PreOrderProductSourceType.VARIANT) return [];

  const refs = [...new Set(productSourceRefs.map((id) => String(id).trim()).filter(isUuidLike))];
  if (refs.length === 0) return [];

  const badgeTemplateId = options?.badgeTemplateId?.trim() || undefined;
  const activeFrom = options?.activeFrom?.trim() || undefined;
  const activeTo = options?.activeTo?.trim() || undefined;

  const bySkuCode = new Map<string, PreOrderSelectedSku>();

  for (let page = 1; page <= SKU_SEARCH_MAX_PAGES; page += 1) {
    const response = await preOrderCampaignApi.searchPreOrderCampaignSkus({
      orderBy: 'createdAt',
      orderType: OrderType.DESC,
      page,
      take: SKU_SEARCH_PAGE_TAKE,
      isPagination: true,
      badgeTemplateId,
      activeFrom,
      activeTo,
      productStatuses: [...PRE_ORDER_CAMPAIGN_SKU_SEARCH_PRODUCT_STATUSES],
      ...(productSourceType === PreOrderProductSourceType.COLLECTION ? { collectionIds: refs } : { categoryIds: refs }),
    });

    for (const item of response.list ?? []) {
      const mapped = mapCampaignSkuSearchItemToSelected(item, 'VARIANT');
      if (mapped && !mapped.disabled) bySkuCode.set(mapped.skuCode, mapped);
    }

    const loaded = response.list?.length ?? 0;
    if (loaded < SKU_SEARCH_PAGE_TAKE || bySkuCode.size >= (response.total ?? 0)) break;
  }

  return [...bySkuCode.values()];
};

export const canDeletePreOrderCampaign = (status: PreOrderCampaignStatus): boolean => status === PreOrderCampaignStatus.DRAFT || status === PreOrderCampaignStatus.PAUSED;

/** Ended không cho chỉnh sửa. Các trạng thái còn lại mở form edit với quyền field theo `getPreOrderCampaignEditableFlags`. */
export const canEditPreOrderCampaign = (status: PreOrderCampaignStatus): boolean => status !== PreOrderCampaignStatus.ENDED;

const EDITABLE_LOCKED: PreOrderCampaignFormEditableFlags = {
  name: false,
  startAt: false,
  endAt: false,
  expectedAvailableAt: false,
  productScope: false,
  badgeTemplate: false,
  isActive: false,
  save: false,
};

const EDITABLE_FULL: PreOrderCampaignFormEditableFlags = {
  name: true,
  startAt: true,
  endAt: true,
  expectedAvailableAt: true,
  productScope: true,
  badgeTemplate: true,
  isActive: true,
  save: true,
};

/** Active / Scheduled / Paused: cho sửa tên, kéo dài end, thời gian mở bán dự kiến, label, On/Off; khóa SKU + startAt. */
const EDITABLE_RUNNING_LIMITED: PreOrderCampaignFormEditableFlags = {
  name: true,
  startAt: false,
  endAt: true,
  expectedAvailableAt: true,
  productScope: false,
  badgeTemplate: true,
  isActive: true,
  save: true,
};

/**
 * Rule chỉnh sửa campaign (US cập nhật chiến dịch):
 * - Draft / create: sửa toàn bộ (tên, SKU, start-end, thời gian mở bán dự kiến, On/Off).
 * - Active / Scheduled / Paused: sửa tên, kéo dài end, thời gian mở bán dự kiến, On/Off; khóa thêm/xóa SKU và startAt.
 * - Ended / view: khóa toàn bộ.
 */
export const getPreOrderCampaignEditableFlags = (mode: PreOrderCampaignFormMode, status?: PreOrderCampaignStatus): PreOrderCampaignFormEditableFlags => {
  if (mode === 'view') return EDITABLE_LOCKED;
  if (status === PreOrderCampaignStatus.ENDED) return EDITABLE_LOCKED;

  if (mode === 'create' || !status || status === PreOrderCampaignStatus.DRAFT) {
    return EDITABLE_FULL;
  }

  if (status === PreOrderCampaignStatus.ACTIVE || status === PreOrderCampaignStatus.SCHEDULED || status === PreOrderCampaignStatus.PAUSED) {
    return EDITABLE_RUNNING_LIMITED;
  }

  return EDITABLE_LOCKED;
};

export const inferDisplayStatus = (isActive: boolean, startAt: Dayjs | null, endAt: Dayjs | null, now = dayjs()): PreOrderCampaignStatus => {
  if (!isActive) {
    if (!startAt || now.isBefore(startAt)) return PreOrderCampaignStatus.DRAFT;
    return PreOrderCampaignStatus.PAUSED;
  }
  if (endAt && now.isAfter(endAt)) return PreOrderCampaignStatus.ENDED;
  if (startAt && now.isBefore(startAt)) return PreOrderCampaignStatus.SCHEDULED;
  return PreOrderCampaignStatus.ACTIVE;
};

export const mapCampaignToFormValues = (campaign: PreOrderCampaign): PreOrderCampaignFormValues => ({
  name: campaign.name ?? '',
  startAt: campaign.startAt ?? null,
  endAt: campaign.endAt ?? null,
  expectedAvailableAt: campaign.expectedStockAt ?? campaign.expectedAvailableAt ?? null,
  isActive: Boolean(campaign.isActive),
  productSourceType: campaign.productSourceType ?? '',
  productSourceRefs: campaign.productSourceRefs ?? [],
  skus: (campaign.skus ?? []).map((sku) => ({
    skuCode: sku.skuCode,
    productName: sku.productName ?? sku.skuCode,
    variationName: sku.variationName,
    imageUrl: sku.image ?? undefined,
    productVariantId: sku.productVariantId,
    badgeProductScopeType: sku.badgeProductScopeType,
  })),
  badgeTemplateId: campaign.badgeTemplateId ?? '',
  status: campaign.status,
});

/**
 * SKU lưu luôn ở cấp biến thể. `badgeProductScopeType` trên từng SKU phải là VARIANT
 * (khớp contract create/update). Scope Collection/Category nằm ở productSourceType + productSourceRefs.
 * Gửi COLLECTION/CATEGORY trên SKU khiến badge-flow nhầm collectionIds = skuCode → lỗi UUID.
 */
export const mapSelectedSkusToPayload = (values: PreOrderCampaignFormValues) =>
  values.skus.map((sku) => ({
    skuCode: sku.skuCode,
    productVariantId: sku.productVariantId,
    productName: sku.productName,
    variationName: sku.variationName,
    image: sku.imageUrl,
    badgeProductScopeType: 'VARIANT',
  }));

export const validatePreOrderCampaignForm = (values: PreOrderCampaignFormValues, mode: PreOrderCampaignFormMode, editable: PreOrderCampaignFormEditableFlags): string | null => {
  const name = values.name.trim();
  if (!name) return 'Vui lòng nhập tên chiến dịch.';
  if (name.length > PRE_ORDER_CAMPAIGN_NAME_MAX) return `Tên chiến dịch tối đa ${PRE_ORDER_CAMPAIGN_NAME_MAX} ký tự.`;

  if (!values.startAt) return 'Vui lòng chọn thời gian bắt đầu.';
  if (!values.endAt) return 'Vui lòng chọn thời gian kết thúc.';

  const start = dayjs(values.startAt);
  const end = dayjs(values.endAt);
  if (!start.isValid() || !end.isValid()) return 'Thời gian không hợp lệ.';
  if (!end.isAfter(start)) return 'Thời gian kết thúc phải sau thời gian bắt đầu.';

  if (values.productSourceType === PreOrderProductSourceType.COLLECTION || values.productSourceType === PreOrderProductSourceType.CATEGORY) {
    const refs = sanitizeProductSourceRefs(values.productSourceRefs);
    if (refs.length === 0) {
      return values.productSourceType === PreOrderProductSourceType.COLLECTION ? 'Vui lòng chọn ít nhất một bộ sưu tập hợp lệ (UUID).' : 'Vui lòng chọn ít nhất một danh mục hợp lệ (UUID).';
    }
  }

  if (editable.startAt && (mode === 'create' || mode === 'edit')) {
    if (start.isBefore(dayjs())) return 'Thời gian bắt đầu không được chọn trong quá khứ.';
  }

  if (editable.expectedAvailableAt && values.expectedAvailableAt) {
    const expected = dayjs(values.expectedAvailableAt);
    if (expected.isValid() && expected.isBefore(dayjs())) return 'Thời gian mở bán dự kiến không được chọn trong quá khứ.';
  }

  return null;
};
/** Guard cứng trước khi gọi API create/update. */
export const assertSkusReadyForApi = (values: PreOrderCampaignFormValues): string | null => {
  if (values.skus.length === 0) {
    return 'Chiến dịch cần ít nhất 1 SKU. Vui lòng chọn biến thể từ danh sách bên trái.';
  }
  return null;
};

/** Chỉ serialize khi đủ giá trị + dayjs hợp lệ (tránh `"Invalid Date"` gửi lên BE). */
const toIsoDateTimeOrThrow = (value: string | null, fieldLabel: string): string => {
  if (!value) throw new Error(`${fieldLabel} is required`);
  const parsed = dayjs(value);
  if (!parsed.isValid()) throw new Error(`${fieldLabel} is invalid`);
  return parsed.toISOString();
};

const toIsoDateTimeIfValid = (value: string): string | undefined => {
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.toISOString() : undefined;
};

export const buildCreatePayload = (values: PreOrderCampaignFormValues): CreatePreOrderCampaignDto => {
  const expectedStockAt = values.expectedAvailableAt ? (toIsoDateTimeIfValid(values.expectedAvailableAt) ?? null) : null;
  return {
    name: values.name.trim(),
    startAt: toIsoDateTimeOrThrow(values.startAt, 'startAt'),
    endAt: toIsoDateTimeOrThrow(values.endAt, 'endAt'),
    expectedStockAt,
    isActive: values.isActive,
    productSourceType: (values.productSourceType || PreOrderProductSourceType.VARIANT) as PreOrderProductSourceType,
    productSourceRefs: sanitizeProductSourceRefs(values.productSourceRefs),
    badgeTemplateId: values.badgeTemplateId.trim() || null,
    maxPurchaseQty: PRE_ORDER_CAMPAIGN_DEFAULT_MAX_PURCHASE_QTY,
    paymentTimeoutHours: PRE_ORDER_CAMPAIGN_DEFAULT_PAYMENT_TIMEOUT_HOURS,
    skus: mapSelectedSkusToPayload(values),
  };
};

export const buildUpdatePayload = (values: PreOrderCampaignFormValues, editable: PreOrderCampaignFormEditableFlags): UpdatePreOrderCampaignDto => {
  // Draft / full edit: cùng shape body với create (khớp PATCH contract).
  if (editable.productScope && editable.startAt && editable.endAt) {
    return buildCreatePayload(values);
  }

  // Active / Scheduled / Paused: chỉ patch field được mở.
  const payload: UpdatePreOrderCampaignDto = {
    name: values.name.trim(),
    isActive: values.isActive,
  };

  if (editable.endAt && values.endAt) {
    const endAt = toIsoDateTimeIfValid(values.endAt);
    if (endAt) payload.endAt = endAt;
  }
  if (editable.expectedAvailableAt) {
    payload.expectedStockAt = values.expectedAvailableAt ? (toIsoDateTimeIfValid(values.expectedAvailableAt) ?? null) : null;
  }
  if (editable.badgeTemplate) {
    payload.badgeTemplateId = values.badgeTemplateId.trim() || null;
  }

  return payload;
};

/** Factory — gọi mỗi lần mở form create; không prefill thời gian. */
export const createEmptyPreOrderCampaignForm = (): PreOrderCampaignFormValues => ({
  name: '',
  startAt: null,
  endAt: null,
  expectedAvailableAt: null,
  isActive: false,
  productSourceType: '',
  productSourceRefs: [],
  skus: [],
  badgeTemplateId: '',
  status: PreOrderCampaignStatus.DRAFT,
});
