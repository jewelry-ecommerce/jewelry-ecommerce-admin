import { expect, test } from 'vitest';
import { javaProductSortedPage } from './java-product-sort';
import type { JavaPage, JavaProduct } from './java-catalog.types';
import { ProductSpuStatus } from '@/trading-ui/apis/product/product.enum';
import { OrderType } from '@/trading-ui/adapters/library';
const product = (id: number, updatedAt: string): JavaProduct => ({ id, updatedAt, createdAt: updatedAt, code: String(id), name: String(id), slug: String(id), status: ProductSpuStatus.DRAFT, categoryId: 1, categoryName: 'Test', categorySlug: 'test', skus: [], media: [], collections: [] });
const response: JavaPage<JavaProduct> = { list: [product(1, '2026-10-01'), product(2, '2026-10-11')], total: 2, pagination: { currentPage: 1, totalPage: 1, hasNextPage: false, hasPreviousPage: false } };
test('default UI sort orders the complete real result before pagination', () => {
  const result = javaProductSortedPage(response, { orderBy: 'updatedAt', orderType: OrderType.DESC, page: 1, take: 1 });
  expect(result.list.map(product => product.id)).toEqual([2]);
  expect(result).toMatchObject({ total: 2, pagination: { hasNextPage: true } });
  expect(response.list.map(product => product.id)).toEqual([1, 2]);
});
test('unsupported sort does not silently return server-default ordering', () => {
  expect(() => javaProductSortedPage(response, { orderBy: 'name' })).toThrow();
});
test('missing timestamp is not replaced with an invented date', () => {
  expect(() => javaProductSortedPage({ ...response, list: [product(1, '')] }, { orderBy: 'updatedAt' })).toThrow();
});
