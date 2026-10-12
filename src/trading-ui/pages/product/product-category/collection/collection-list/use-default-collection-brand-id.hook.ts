import { useMemo } from 'react';
import useSWR from 'swr';

import { brandApi } from '../../../../../apis';
import { getTenantCodeHeader } from '../../../../../common/config';

const DEFAULT_COLLECTION_BRAND_LIST_KEY = ['product/admin/brands', 'collection-default'] as const;

const resolveBrandIdForHeaderTenant = (brands: { id: string; code?: string; tenantCode?: string | null }[] | undefined) => {
  const list = brands ?? [];
  if (list.length === 0) return undefined;

  const headerTenant = getTenantCodeHeader();
  const matched = list.find((b) => b.tenantCode === headerTenant) ?? list.find((b) => b.code === headerTenant);

  return matched?.id ?? list[0]?.id;
};

export function useDefaultCollectionBrandId(enabled = true) {
  const headerTenantCode = getTenantCodeHeader();
  const { data, isLoading, error } = useSWR(enabled ? [...DEFAULT_COLLECTION_BRAND_LIST_KEY, headerTenantCode] : null, () => brandApi.getBrandList({ isPagination: false, page: 1, take: 100 }), {
    revalidateOnFocus: false,
  });

  const defaultBrandId = useMemo(() => resolveBrandIdForHeaderTenant(data?.list), [data?.list, headerTenantCode]);

  return { defaultBrandId, headerTenantCode, isLoading, error };
}
