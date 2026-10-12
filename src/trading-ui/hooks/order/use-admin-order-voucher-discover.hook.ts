import { useEffect, useMemo, useRef, useState } from 'react';
import type { PromotionVoucherCheckoutContext, PromotionVoucherDiscoverSectionDto } from '../../apis/promotion/promotion.interface';
import { discoverAdminOrderPromotionVouchers, discoverOrderPromotionVouchers, type IAdminOrderV2Context } from '../../apis/order';
import { serializeAdminOrderV2Context } from '../../common/utils/order/admin-order-v2.util';
import { buildDiscoverOrderPromotionVouchersRequest } from '../../common/utils/order/admin-order-voucher.helpers';
import { serializePromotionVoucherCheckoutContext } from '../../pages/order/create-order/voucher/admin-order-voucher.mapper';

const VOUCHER_DISCOVER_DEBOUNCE_MS = 400;

interface UseAdminOrderVoucherDiscoverResult {
  sections: PromotionVoucherDiscoverSectionDto[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
}

export function useAdminOrderVoucherDiscover(
  isOpen: boolean,
  checkoutContext?: PromotionVoucherCheckoutContext | null,
  adminOrderContext?: IAdminOrderV2Context | null,
): UseAdminOrderVoucherDiscoverResult {
  const [sections, setSections] = useState<PromotionVoucherDiscoverSectionDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestIdRef = useRef(0);
  const sectionsRef = useRef(sections);
  const checkoutContextRef = useRef(checkoutContext);
  const adminOrderContextRef = useRef(adminOrderContext);
  const lastFetchedContextKeyRef = useRef<string | null>(null);

  const checkoutContextKey = useMemo(() => serializeAdminOrderV2Context(adminOrderContext ?? null) || serializePromotionVoucherCheckoutContext(checkoutContext), [adminOrderContext, checkoutContext]);

  useEffect(() => {
    sectionsRef.current = sections;
    checkoutContextRef.current = checkoutContext;
    adminOrderContextRef.current = adminOrderContext;
  }, [adminOrderContext, checkoutContext, sections]);

  useEffect(() => {
    if (!isOpen) return;

    const hasCachedSections = sectionsRef.current.length > 0;
    const contextUnchanged = lastFetchedContextKeyRef.current === checkoutContextKey;

    if (hasCachedSections && contextUnchanged) {
      return;
    }

    const shouldDebounce = hasCachedSections && !contextUnchanged;
    let debounceTimer: ReturnType<typeof setTimeout> | undefined;

    const fetchVouchers = () => {
      const requestId = ++requestIdRef.current;
      const hadCachedSections = sectionsRef.current.length > 0;

      const run = async () => {
        if (!hadCachedSections) {
          setIsLoading(true);
        } else {
          setIsRefreshing(true);
        }
        setError(null);

        try {
          const currentAdminContext = adminOrderContextRef.current;
          const response = currentAdminContext
            ? await discoverAdminOrderPromotionVouchers(currentAdminContext)
            : await discoverOrderPromotionVouchers(buildDiscoverOrderPromotionVouchersRequest(checkoutContextRef.current));

          if (requestId !== requestIdRef.current) return;

          setSections(response.sections ?? []);
          lastFetchedContextKeyRef.current = checkoutContextKey;
        } catch {
          if (requestId !== requestIdRef.current) return;

          if (!hadCachedSections) {
            setError('Không thể tải danh sách voucher. Vui lòng thử lại.');
            setSections([]);
          }
        } finally {
          if (requestId === requestIdRef.current) {
            setIsLoading(false);
            setIsRefreshing(false);
          }
        }
      };

      void run();
    };

    if (shouldDebounce) {
      setIsRefreshing(true);
      debounceTimer = setTimeout(fetchVouchers, VOUCHER_DISCOVER_DEBOUNCE_MS);
    } else {
      fetchVouchers();
    }

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        setIsRefreshing(false);
      }
      requestIdRef.current += 1;
    };
  }, [isOpen, checkoutContextKey]);

  return { sections, isLoading, isRefreshing, error };
}
