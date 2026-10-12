import { useEffect, useState } from 'react';
import { OrderType } from '@/trading-ui/adapters/library';
import { type IOrderCatalogProduct, getOrderProducts, OrderSortBy } from '../apis/order';
import { useDebouncedValue } from '../common/utils/order/create-order.utils';
export const useOrderCatalog = () => {
  const [productQuery, setProductQuery] = useState('');
  const debouncedQuery = useDebouncedValue(productQuery, 300);
  const [catalog, setCatalog] = useState<IOrderCatalogProduct[]>([]);
  const [loadedQuery, setLoadedQuery] = useState<string | null>(null);
  const catalogLoading = loadedQuery !== debouncedQuery;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await getOrderProducts({
          page: 1,
          take: 50,
          orderBy: OrderSortBy.UPDATED_AT,
          orderType: OrderType.DESC,
          search: debouncedQuery,
        });
        if (!cancelled) {
          setCatalog(res.list ?? []);
          setLoadedQuery(debouncedQuery);
        }
      } catch {
        if (!cancelled) {
          setCatalog([]);
          setLoadedQuery(debouncedQuery);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  return {
    productQuery,
    setProductQuery,
    catalog,
    catalogLoading,
  };
};
