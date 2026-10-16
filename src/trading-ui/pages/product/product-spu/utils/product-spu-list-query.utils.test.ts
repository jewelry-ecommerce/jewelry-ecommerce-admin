import { expect, test } from 'vitest';
import { buildProductExportFiltersFromListQuery } from './product-spu-list-query.utils';

test('export retains brand, season and approval filters from the displayed list', () => {
  const filters = { brandId: '8', seasonUuid: '9', hasPendingApproval: false };
  const query = { ...filters, page: 1, take: 20 };
  expect(buildProductExportFiltersFromListQuery(query, 'all')).toMatchObject({ ...filters, isPagination: false });
});
