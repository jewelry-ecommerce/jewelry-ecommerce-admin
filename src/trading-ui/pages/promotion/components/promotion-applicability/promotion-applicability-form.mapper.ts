import { PromotionSalesChannel, StoreSelectionMode, type PosStore } from '../../../../apis';
import { isJavaBackend } from '@/common/config/app.config';

export const PROMOTION_SALES_CHANNEL_LABEL: Record<PromotionSalesChannel, string> = {
  [PromotionSalesChannel.ONLINE]: 'Online',
  [PromotionSalesChannel.POS]: 'POS',
};

export const STORE_SELECTION_MODE_LABEL: Record<StoreSelectionMode, string> = {
  [StoreSelectionMode.ALL]: 'Tất cả cửa hàng',
  [StoreSelectionMode.MANUAL]: 'Chọn cụ thể',
  [StoreSelectionMode.GROUP]: 'Theo nhóm cửa hàng',
};

export const APPLICABILITY_CHANNEL_OPTIONS = [
  { value: PromotionSalesChannel.ONLINE, label: PROMOTION_SALES_CHANNEL_LABEL[PromotionSalesChannel.ONLINE] },
  { value: PromotionSalesChannel.POS, label: PROMOTION_SALES_CHANNEL_LABEL[PromotionSalesChannel.POS] },
].filter(option => !isJavaBackend() || option.value === PromotionSalesChannel.ONLINE);

/**
 * GROUP is intentionally absent: the store directory has no group concept yet,
 * so there is nothing for the author to pick. The backend still supports it and
 * an existing GROUP config round-trips through the form untouched.
 */
export const APPLICABILITY_STORE_MODE_OPTIONS = [
  { value: StoreSelectionMode.ALL, label: STORE_SELECTION_MODE_LABEL[StoreSelectionMode.ALL] },
  { value: StoreSelectionMode.MANUAL, label: STORE_SELECTION_MODE_LABEL[StoreSelectionMode.MANUAL] },
];

export const formatStoreOptionLabel = (store: PosStore): string => (store.name ? `${store.code} — ${store.name}` : store.code);

/** MUI multi-select hands back `string | string[]` depending on the event. */
export const parseMultiSelectValues = (raw: unknown): string[] => {
  if (Array.isArray(raw)) return raw.map((value) => String(value));
  if (typeof raw === 'string') return raw ? raw.split(',') : [];
  return [];
};
