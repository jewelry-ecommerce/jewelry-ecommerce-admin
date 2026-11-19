import { describe, expect, it, vi } from 'vitest';
import { ProductSkuStatus, ProductSpuStatus } from './product.enum';
import type { Product } from './product.entities';
import type { ProductFormSnapshot } from './product-form.mapper';
import type { SkuMatrixPreviewResponseDto } from './product.interface';
import { assembleJavaAdminProductDetail } from './java-admin-product-detail.mapper';

const product: Product = {
  id: '100',
  spuCode: 'CLOUD26-PENDANT-25',
  name: 'Pendant',
  slug: 'cloud26-pendant-25',
  status: ProductSpuStatus.PUBLISHED,
  brandId: null,
  categoryId: '4',
  createdAt: new Date('2026-10-23'),
  updatedAt: new Date('2026-10-23'),
  variations: [
    {
      id: '199',
      productId: '100',
      skuCode: 'CLOUD26-PENDANT-25-1',
      name: 'Pendant - Silver',
      slug: 'cloud26-pendant-25',
      price: '3770000',
      salePrice: null,
      stock: 14,
      status: ProductSkuStatus.ACTIVE,
    },
  ],
};

const form: ProductFormSnapshot = {
  id: '100',
  status: ProductSpuStatus.PUBLISHED,
  selected: ['1:11'],
  skus: [
    {
      uuid: '199',
      skuCode: 'CLOUD26-PENDANT-25-1',
      status: ProductSkuStatus.ACTIVE,
      medias: [],
      attributeValueUuids: ['11'],
      sellingPriceAfterTaxMinor: 3770000,
    },
  ],
  values: {
    spuCode: 'CLOUD26-PENDANT-25',
    name: 'Pendant',
    categoryUuid: '4',
    attributes: [{ attributeUuid: '1', valueUuids: ['11'] }],
    skus: [],
    metaTitle: 'SEO title',
  },
};

const matrix: SkuMatrixPreviewResponseDto = {
  attributeOrder: ['1'],
  attributes: { '1': { uuid: '1', name: 'Màu sắc', code: 'DEMO_COLOR' } },
  values: { '11': { uuid: '11', attributeId: '1', name: 'Bạc', code: 'BAC' } },
  matrix: [{ valueUuid: '11', children: [], canonicalKey: '11' }],
};

describe('assembleJavaAdminProductDetail', () => {
  it('fills variationAttributeValues and variantMatrix for update hydration', async () => {
    const preview = vi.fn().mockResolvedValue(matrix);
    const detail = await assembleJavaAdminProductDetail({
      product,
      form,
      preview,
      mixMatch: [],
    });

    expect(preview).toHaveBeenCalledOnce();
    expect(detail.metaTitle).toBe('SEO title');
    expect(detail.variantMatrix?.matrix).toHaveLength(1);
    expect(detail.variations?.[0]?.skuCode).toBe('CLOUD26-PENDANT-25-1');
    expect(detail.variations?.[0]?.variationAttributeValues?.[0]).toMatchObject({
      attributeValueId: '11',
      attributeValue: { attributeId: '1', value: 'Bạc' },
    });
  });
});
