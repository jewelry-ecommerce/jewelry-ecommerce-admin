import type { AdminProductDetailDto, Product, ProductVariation, SearchPinnedProduct } from '../../../../apis';
import { isoToStoredDateTime, storedDateTimeToIso } from '../../../../common/utils/date-format.util';
import { SEARCH_PINNED_SLOT_COUNT } from './search-pinned.constants';
import type { SearchPinnedRow } from './components/search-pinned-row-card.component';
import type { LabelDisplaySelectedProduct } from '../../label/label-display/label-display.interface';

export const isLandingPin = (row: SearchPinnedProduct) => row.keywordPattern == null;

export const fromApiDate = isoToStoredDateTime;

export const toIsoStart = storedDateTimeToIso;

export const toIsoEnd = storedDateTimeToIso;

export const createRowKey = () => `row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const pickDefaultVariation = (product: Product): ProductVariation | undefined => {
  const list = product.variations ?? [];
  if (list.length === 0) return undefined;
  const defId = product.defaultVariationId;
  return list.find((v) => v.id === defId) ?? list[0];
};

const mapProductToSelected = (product: Product | AdminProductDetailDto): LabelDisplaySelectedProduct | null => {
  const variation = pickDefaultVariation(product as Product);
  const productVariantId = variation?.id ?? product.defaultVariationId ?? '';
  if (!productVariantId) return null;

  const imageUrl = variation?.medias?.[0]?.url?.trim() || product.image?.trim() || '';

  return {
    productVariantId,
    productId: product.id,
    skuCode: (variation?.skuCode ?? product.spuCode ?? '').trim() || productVariantId,
    name: (variation?.name ?? product.name ?? '').trim() || product.spuCode,
    imageUrl,
  };
};

export const buildRowsFromPins = async (pins: SearchPinnedProduct[], loadProduct: (productId: string) => Promise<AdminProductDetailDto>): Promise<SearchPinnedRow[]> => {
  const sorted = [...pins].sort((a, b) => a.position - b.position);

  const rows = await Promise.all(
    sorted.slice(0, SEARCH_PINNED_SLOT_COUNT).map(async (pin) => {
      let product: LabelDisplaySelectedProduct | null = null;
      try {
        const detail = await loadProduct(pin.productId);
        product = mapProductToSelected(detail);
      } catch {
        product = null;
      }

      return {
        rowKey: pin.id,
        pinnedId: pin.id,
        product,
        position: pin.position,
        startDate: fromApiDate(pin.startDate),
        endDate: fromApiDate(pin.endDate),
      };
    }),
  );

  return rows;
};

export const firstFreePosition = (rows: SearchPinnedRow[]): number => {
  const used = new Set(rows.map((r) => r.position));
  for (let i = 0; i < SEARCH_PINNED_SLOT_COUNT; i += 1) {
    if (!used.has(i)) return i;
  }
  return rows.length;
};
