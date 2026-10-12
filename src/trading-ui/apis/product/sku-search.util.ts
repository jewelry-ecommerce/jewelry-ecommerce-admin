import { PRODUCT_SPU_DEFAULT_IMAGE_SRC } from '../../pages/product/product-spu/product-spu.constant';
import type { WmsSkuSearchListItem, WmsSkuSearchResponse } from './sku-search.interface';

type PriceCandidate = number | string | null | undefined;

const normalizePriceMinor = (value: PriceCandidate): string | null => {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return String(Math.trunc(parsed));
};

const isUsableImageString = (s: string): boolean => {
  const t = s.trim();
  if (t.length < 4) return false;
  if (t.toLowerCase() === 'string') return false;
  if (/^https?:\/\//i.test(t) || t.startsWith('/') || t.startsWith('data:')) return true;
  // Relative filename/path from BE/CDN (no scheme), e.g. `folder/img.png`
  return /\.(jpe?g|png|webp|gif|svg)(\?|$)/i.test(t);
};

/**
 * Prefer SKU `image`, then first usable media url, then attribute swatch image.
 * Ignores placeholder values like literal "string" from OpenAPI samples.
 */
export function resolveWmsSkuImageUrl(row: WmsSkuSearchListItem | null | undefined): string {
  if (!row) return PRODUCT_SPU_DEFAULT_IMAGE_SRC;
  if (row.image?.trim() && isUsableImageString(row.image)) {
    return row.image.trim();
  }

  const medias = row.medias;
  if (Array.isArray(medias)) {
    for (const m of medias) {
      if (!m || typeof m !== 'object') continue;
      const candidate = [m.url, m.image, m.path].find((x) => typeof x === 'string' && isUsableImageString(x));
      if (candidate) return candidate.trim();
    }
  }
  return PRODUCT_SPU_DEFAULT_IMAGE_SRC;
}

/** SKU display title — same precedence as warehouse SKU picker. */
export function resolveWmsSkuDisplayName(row: WmsSkuSearchListItem | null | undefined, fallback?: string): string {
  const fromRow = (row?.name ?? row?.product?.name ?? '').trim();
  if (fromRow) return fromRow;
  const fb = String(fallback ?? '').trim();
  if (fb) return fb;
  const code = String(row?.skuCode ?? '').trim();
  return code || '—';
}

export function resolveWmsSkuPriceMinor(row: WmsSkuSearchListItem | null | undefined): string {
  if (!row) return '0';

  const candidates: PriceCandidate[] = [
    row.salePriceMinor,
    row.salePrice,
    row.sellingPriceAfterTaxMinor,
    row.sellingPrice,
    row.priceMinor,
    row.price,
    row.unitPrice,
    row.retailPriceMinor,
    row.retailPrice,
    row.basePriceAfterTax,
    row.includedPriceAfterTax,
    row.basePrice,
    row.packaging?.salePrice,
    row.packaging?.sellingPriceAfterTaxMinor,
    row.packaging?.sellingPrice,
    row.packaging?.price,
    row.packaging?.unitPrice,
    row.packaging?.basePriceAfterTax,
    row.packaging?.includedPriceAfterTax,
    row.packaging?.basePrice,
  ];

  for (const candidate of candidates) {
    const normalized = normalizePriceMinor(candidate);
    if (normalized !== null) return normalized;
  }

  return '0';
}

const attrByCodes = (row: WmsSkuSearchListItem, codes: string[]): string => {
  const upper = codes.map((c) => c.toUpperCase());
  const hit = row.attributes?.find((a) => upper.includes((a.attributeCode ?? '').toUpperCase()));
  return hit?.value?.trim() ?? '';
};

export function extractWmsSkuManufacturer(row: WmsSkuSearchListItem): string {
  const direct = row.manufacturer?.trim();
  if (direct) return direct;
  return attrByCodes(row, ['MANUFACTURER', 'BRAND', 'NSX', 'THUONG_HIEU']);
}

export function extractWmsSkuUom(row: WmsSkuSearchListItem): string {
  const direct = (row.unitOfMeasure ?? row.unit)?.trim();
  if (direct) return direct;
  return attrByCodes(row, ['UOM', 'UNIT', 'DON_VI', 'DVT']);
}

export const normalizeSkuSearchList = (raw: WmsSkuSearchResponse | null | undefined): WmsSkuSearchListItem[] => {
  if (!raw) return [];
  return Array.isArray(raw.list) ? raw.list : [];
};
