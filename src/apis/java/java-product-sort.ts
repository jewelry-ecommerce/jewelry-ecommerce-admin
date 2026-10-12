import type { ProductQuery } from '@/trading-ui/apis/product/product.interface';
import { type JavaPage, type JavaProduct, JAVA_CATALOG_PATH } from './java-catalog.types';
import { unsupportedJavaFields } from './java-unsupported';
const SORT_POLICY = { fields: ['createdAt', 'updatedAt'], defaultField: 'updatedAt', ascending: 'ASC', descending: 'DESC' } as const;
export function javaProductSortedPage(response: JavaPage<JavaProduct>, query: ProductQuery): JavaPage<JavaProduct> {
  const field = query.orderBy ?? SORT_POLICY.defaultField;
  const direction = query.orderType ?? SORT_POLICY.descending;
  if (!SORT_POLICY.fields.some(key => key === field) || ![SORT_POLICY.ascending, SORT_POLICY.descending].some(value => value === direction))
    unsupportedJavaFields(JAVA_CATALOG_PATH + '/products', ['orderBy/orderType']);
  const dateKey = field === 'createdAt' ? 'createdAt' : 'updatedAt';
  if (response.list.some(product => !Number.isFinite(Date.parse(product[dateKey]))))
    unsupportedJavaFields(JAVA_CATALOG_PATH + '/products', [dateKey]);
  const sorted = [...response.list].sort((left, right) =>
    (Date.parse(left[dateKey]) - Date.parse(right[dateKey])) * (direction === SORT_POLICY.ascending ? 1 : -1));
  const page = query.isPagination === false ? 1 : query.page ?? 1, take = query.take ?? 20;
  return { total: sorted.length, list: query.isPagination === false ? sorted : sorted.slice((page - 1) * take, page * take),
    pagination: { currentPage: page, totalPage: Math.ceil(sorted.length / take), hasNextPage: query.isPagination !== false && page * take < sorted.length,
      hasPreviousPage: query.isPagination !== false && page > 1 } };
}
