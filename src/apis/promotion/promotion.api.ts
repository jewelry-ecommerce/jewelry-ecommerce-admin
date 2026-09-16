import type { Paginated } from "@/apis/product/product.interface";
import type {
  Promotion,
  PromotionListQuery,
  PromotionPayload,
  Voucher,
  VoucherListQuery,
  VoucherPayload,
} from "@/apis/promotion/promotion.interface";
import { apiRequest } from "@/apis/transport";
import { PROMOTIONS, VOUCHERS } from "@/mocks/data/promotion.data";
import { cloneDeep, matchesSearch, MockApiError, normalizeSearch, paginate, withLatency } from "@/mocks/mock-transport";

const requirePromotion = (promotionId: string): Promotion => {
  const promotion = PROMOTIONS.find((entry) => entry.id === promotionId);
  if (!promotion) throw new MockApiError("PROMOTION_NOT_FOUND", `No promotion matches the id ${promotionId}.`, 404);
  return promotion;
};

const requireVoucher = (voucherId: string): Voucher => {
  const voucher = VOUCHERS.find((entry) => entry.id === voucherId);
  if (!voucher) throw new MockApiError("VOUCHER_NOT_FOUND", `No voucher matches the id ${voucherId}.`, 404);
  return voucher;
};

const assertWindowValid = (startAt: string, endAt: string): void => {
  if (startAt >= endAt) throw new MockApiError("PROMOTION_WINDOW_INVALID", "The end date must be after the start date.", 422);
};

/** GET admin/promotions */
export const getPromotionList = (query: PromotionListQuery = {}): Promise<Paginated<Promotion>> =>
  apiRequest({
    method: "GET",
    path: "admin/promotions",
    query: { ...query },
    mock: () =>
      withLatency(() => {
        const search = normalizeSearch(query.search);
        const matched = PROMOTIONS.filter((promotion) => {
          if (query.status && promotion.status !== query.status) return false;
          if (query.scope && promotion.scope !== query.scope) return false;
          return matchesSearch([promotion.name, promotion.code, promotion.description], search);
        });
        const page = paginate(matched, query.page ?? 1, query.take ?? 20);
        return { ...page, list: cloneDeep(page.list) };
      }),
  });

/** GET admin/promotions/{promotionId} */
export const getPromotionDetail = (promotionId: string): Promise<Promotion> =>
  apiRequest({
    method: "GET",
    path: `admin/promotions/${encodeURIComponent(promotionId)}`,
    mock: () => withLatency(() => cloneDeep(requirePromotion(promotionId))),
  });

/** POST admin/promotions */
export const createPromotion = (payload: PromotionPayload): Promise<Promotion> =>
  apiRequest({
    method: "POST",
    path: "admin/promotions",
    body: payload,
    mock: () =>
      withLatency(() => {
        if (PROMOTIONS.some((promotion) => promotion.code === payload.code)) {
          throw new MockApiError("PROMOTION_CODE_TAKEN", `Promotion code ${payload.code} already exists.`, 409);
        }
        assertWindowValid(payload.startAt, payload.endAt);

        const created: Promotion = { id: `promo-${payload.code.toLowerCase()}`, bannerImage: null, ...payload };
        PROMOTIONS.push(created);
        return cloneDeep(created);
      }),
  });

/** PUT admin/promotions/{promotionId} */
export const updatePromotion = (promotionId: string, payload: PromotionPayload): Promise<Promotion> =>
  apiRequest({
    method: "PUT",
    path: `admin/promotions/${encodeURIComponent(promotionId)}`,
    body: payload,
    mock: () =>
      withLatency(() => {
        const promotion = requirePromotion(promotionId);
        assertWindowValid(payload.startAt, payload.endAt);
        Object.assign(promotion, payload);
        return cloneDeep(promotion);
      }),
  });

/** DELETE admin/promotions/{promotionId} */
export const deletePromotion = (promotionId: string): Promise<{ success: true }> =>
  apiRequest({
    method: "DELETE",
    path: `admin/promotions/${encodeURIComponent(promotionId)}`,
    mock: () =>
      withLatency(() => {
        const index = PROMOTIONS.findIndex((promotion) => promotion.id === promotionId);
        if (index < 0) throw new MockApiError("PROMOTION_NOT_FOUND", `No promotion matches the id ${promotionId}.`, 404);
        PROMOTIONS.splice(index, 1);
        return { success: true as const };
      }),
  });

/** GET admin/vouchers */
export const getVoucherList = (query: VoucherListQuery = {}): Promise<Paginated<Voucher>> =>
  apiRequest({
    method: "GET",
    path: "admin/vouchers",
    query: { ...query },
    mock: () =>
      withLatency(() => {
        const search = normalizeSearch(query.search);
        const matched = VOUCHERS.filter((voucher) => {
          if (query.status && voucher.status !== query.status) return false;
          if (query.discountType && voucher.discountType !== query.discountType) return false;
          return matchesSearch([voucher.name, voucher.code, voucher.description], search);
        });
        const page = paginate(matched, query.page ?? 1, query.take ?? 20);
        return { ...page, list: cloneDeep(page.list) };
      }),
  });

/** GET admin/vouchers/{voucherId} */
export const getVoucherDetail = (voucherId: string): Promise<Voucher> =>
  apiRequest({
    method: "GET",
    path: `admin/vouchers/${encodeURIComponent(voucherId)}`,
    mock: () => withLatency(() => cloneDeep(requireVoucher(voucherId))),
  });

/** POST admin/vouchers */
export const createVoucher = (payload: VoucherPayload): Promise<Voucher> =>
  apiRequest({
    method: "POST",
    path: "admin/vouchers",
    body: payload,
    mock: () =>
      withLatency(() => {
        if (VOUCHERS.some((voucher) => voucher.code.toUpperCase() === payload.code.toUpperCase())) {
          throw new MockApiError("VOUCHER_CODE_TAKEN", `Voucher code ${payload.code} already exists.`, 409);
        }
        assertWindowValid(payload.startAt, payload.endAt);

        const created: Voucher = { id: `vou-${payload.code.toLowerCase()}`, usedCount: 0, ...payload };
        VOUCHERS.push(created);
        return cloneDeep(created);
      }),
  });

/** PUT admin/vouchers/{voucherId} */
export const updateVoucher = (voucherId: string, payload: VoucherPayload): Promise<Voucher> =>
  apiRequest({
    method: "PUT",
    path: `admin/vouchers/${encodeURIComponent(voucherId)}`,
    body: payload,
    mock: () =>
      withLatency(() => {
        const voucher = requireVoucher(voucherId);
        assertWindowValid(payload.startAt, payload.endAt);
        if (payload.usageLimit < voucher.usedCount) {
          throw new MockApiError(
            "VOUCHER_LIMIT_BELOW_USAGE",
            `The usage limit cannot drop below the ${voucher.usedCount} redemptions already made.`,
            422,
          );
        }
        Object.assign(voucher, payload);
        return cloneDeep(voucher);
      }),
  });

/** DELETE admin/vouchers/{voucherId} */
export const deleteVoucher = (voucherId: string): Promise<{ success: true }> =>
  apiRequest({
    method: "DELETE",
    path: `admin/vouchers/${encodeURIComponent(voucherId)}`,
    mock: () =>
      withLatency(() => {
        const index = VOUCHERS.findIndex((voucher) => voucher.id === voucherId);
        if (index < 0) throw new MockApiError("VOUCHER_NOT_FOUND", `No voucher matches the id ${voucherId}.`, 404);
        VOUCHERS.splice(index, 1);
        return { success: true as const };
      }),
  });
