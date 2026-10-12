import { importExportApi, type ImportJobResultRow } from '../../../apis';
import type { PreOrderSelectedSku } from './pre-order-campaign.interface';

export type PreOrderSkuImportResolvedData = {
  skuCode?: string;
  productId?: string;
  productVariantId?: string;
  productVariantName?: string;
  productVariantImageUrl?: string | null;
};

const getSkuKey = (sku: PreOrderSelectedSku): string => sku.skuCode.trim() || sku.productVariantId?.trim() || '';

export const mapSkuImportResultRowsToSelectedSkus = (rows: Array<ImportJobResultRow<PreOrderSkuImportResolvedData>>): PreOrderSelectedSku[] => {
  const skus: PreOrderSelectedSku[] = [];

  for (const row of rows) {
    const data = row.resolvedData ?? {};
    const skuCode = data.skuCode?.trim() ?? '';
    const productId = data.productId?.trim() ?? '';
    const productVariantId = data.productVariantId?.trim() ?? '';
    const productName = data.productVariantName?.trim() ?? '';
    if (!skuCode || !productName) continue;

    skus.push({
      skuCode,
      productName,
      productId: productId || undefined,
      productVariantId: productVariantId || undefined,
      imageUrl: data.productVariantImageUrl?.trim() ?? '',
      badgeProductScopeType: 'VARIANT',
    });
  }

  return skus;
};

/** Đọc OK rows từ IE — không fetch Excel fileUrl. */
export const loadSkusFromPreOrderSkuImportJob = async (jobId: string): Promise<PreOrderSelectedSku[]> => {
  const res = await importExportApi.getImportJobResultRows<PreOrderSkuImportResolvedData>(jobId, {
    status: 'OK',
    isPagination: false,
  });

  const skus = mapSkuImportResultRowsToSelectedSkus(res.list);
  if (!skus.length) {
    throw new Error('Không có SKU hợp lệ để áp dụng vào form.');
  }
  return skus;
};

export const mergePreOrderSelectedSkus = (currentSkus: PreOrderSelectedSku[], importedSkus: PreOrderSelectedSku[]): PreOrderSelectedSku[] => {
  const existingKeys = new Set(currentSkus.map(getSkuKey).filter(Boolean));
  const newItems = importedSkus.filter((item) => {
    const key = getSkuKey(item);
    return key && !existingKeys.has(key);
  });
  return [...currentSkus, ...newItems];
};
