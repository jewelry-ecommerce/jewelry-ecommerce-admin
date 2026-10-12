import { importExportApi, type ImportJobResultRow } from '../../../../apis';
import type { LabelDisplaySelectedProduct } from './label-display.interface';

export type BadgeSkuResolvedData = {
  skuCode?: string;
  productId?: string;
  productVariantId?: string;
  productVariantName?: string;
  productVariantImageUrl?: string | null;
  categoryIds?: string[];
  collectionIds?: string[];
};

const getProductKey = (product: LabelDisplaySelectedProduct): string => product.productVariantId || product.skuCode;

export const mapBadgeSkuResultRowsToSelectedProducts = (rows: Array<ImportJobResultRow<BadgeSkuResolvedData>>): LabelDisplaySelectedProduct[] => {
  const products: LabelDisplaySelectedProduct[] = [];

  for (const row of rows) {
    const data = row.resolvedData ?? {};
    const skuCode = data.skuCode?.trim() ?? '';
    const productId = data.productId?.trim() ?? '';
    const productVariantId = data.productVariantId?.trim() ?? '';
    const name = data.productVariantName?.trim() ?? '';
    if (!skuCode || !productId || !productVariantId || !name) continue;

    products.push({
      skuCode,
      productId,
      productVariantId,
      name,
      imageUrl: data.productVariantImageUrl?.trim() ?? '',
    });
  }

  return products;
};

/** Đọc OK rows từ IE — không fetch Excel fileUrl. */
export const loadProductsFromBadgeSkuImportJob = async (jobId: string): Promise<LabelDisplaySelectedProduct[]> => {
  const res = await importExportApi.getImportJobResultRows<BadgeSkuResolvedData>(jobId, {
    status: 'OK',
    isPagination: false,
  });

  const products = mapBadgeSkuResultRowsToSelectedProducts(res.list);
  if (!products.length) {
    throw new Error('Không có SKU hợp lệ để áp dụng vào form.');
  }
  return products;
};

export const mergeLabelDisplaySelectedProducts = (currentProducts: LabelDisplaySelectedProduct[], importedProducts: LabelDisplaySelectedProduct[]): LabelDisplaySelectedProduct[] => {
  const existingKeys = new Set(currentProducts.map(getProductKey).filter(Boolean));
  const newItems = importedProducts.filter((item) => {
    const key = getProductKey(item);
    return key && !existingKeys.has(key);
  });
  return [...currentProducts, ...newItems];
};
