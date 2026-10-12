import type { RuntimeSimulationLine } from './use-runtime-simulation';
import { getSchemaTypeLabel, getScopeLabel } from './promotion-simulation.helpers';

export interface LineDisplayInfo {
  readonly skuName: string;
  readonly skuCode: string;
  readonly skuImageUrl: string | null;
}

export const buildLineDisplayMap = (lines: readonly RuntimeSimulationLine[]): ReadonlyMap<string, LineDisplayInfo> => {
  const map = new Map<string, LineDisplayInfo>();
  lines.forEach((line) => {
    if (!line.skuId) return;
    map.set(line.lineId, {
      skuName: line.skuName?.trim() || 'Sản phẩm chưa đặt tên',
      skuCode: line.skuCode?.trim() || line.skuId,
      skuImageUrl: line.skuImageUrl ?? null,
    });
    map.set(line.skuId, {
      skuName: line.skuName?.trim() || 'Sản phẩm chưa đặt tên',
      skuCode: line.skuCode?.trim() || line.skuId,
      skuImageUrl: line.skuImageUrl ?? null,
    });
  });
  return map;
};

export const resolveVariantLabel = (lineId: string, skuId: string, lineMap: ReadonlyMap<string, LineDisplayInfo>): string => {
  const byLine = lineMap.get(lineId);
  if (byLine) return `${byLine.skuName} (${byLine.skuCode})`;
  const bySku = lineMap.get(skuId);
  if (bySku) return `${bySku.skuName} (${bySku.skuCode})`;
  return 'Biến thể không xác định';
};

export const resolveOfferTitle = (input: { readonly promotionSchemaName?: string; readonly promotionName?: string; readonly schemaType?: string }): string => {
  if (input.promotionSchemaName?.trim()) return input.promotionSchemaName.trim();
  if (input.schemaType) return getSchemaTypeLabel(input.schemaType);
  if (input.promotionName?.trim()) return input.promotionName.trim();
  return 'Ưu đãi';
};

export const resolveOfferSubtitle = (input: { readonly promotionName?: string; readonly scope?: string }): string => {
  const parts: string[] = [];
  if (input.promotionName?.trim()) parts.push(input.promotionName.trim());
  if (input.scope) parts.push(getScopeLabel(input.scope));
  return parts.join(' · ') || 'Chương trình khuyến mãi';
};
