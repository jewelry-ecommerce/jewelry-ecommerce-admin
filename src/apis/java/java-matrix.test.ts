import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./java-taxonomy.api', () => ({
  javaAttributeDetail: vi.fn(async (id: string) => ({
    id,
    name: 'Màu sắc',
    code: 'DEMO_COLOR',
    values: [
      { id: '11', value: 'Bạc', code: 'BAC' },
      { id: '12', value: 'Vàng hồng', code: 'VH' },
    ],
  })),
}));

import { flattenSkuPreviewMatrixForTable } from '@/trading-ui/pages/product/product-spu/utils/product-spu-sku-matrix-preview.utils';
import { javaMatrix } from './java-matrix';

describe('javaMatrix', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('emits Nest-style canonicalKey so SKU matrix flatten keeps leaves', async () => {
    const preview = await javaMatrix({
      attributes: [{ attributeId: '1', values: [{ valueUuid: '11' }, { valueUuid: '12' }] }],
    });

    expect(preview.matrix.map((node) => node.canonicalKey)).toEqual(['1:11', '1:12']);
    expect(flattenSkuPreviewMatrixForTable(preview).filter((row) => row.leaf)).toHaveLength(2);
  });
});
