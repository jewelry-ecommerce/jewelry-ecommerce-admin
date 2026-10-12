import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTE_PATH } from '@/trading-ui/router/route.path';

export function useProductSpuListBackNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(() => {
    const returnPath = (location.state as { productListReturnPath?: string } | null)?.productListReturnPath;
    if (returnPath) {
      navigate(returnPath);
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(ROUTE_PATH.PRODUCT_SPU_LIST);
  }, [location.state, navigate]);
}

export function buildProductSpuListReturnState(pathname: string, search: string) {
  return { productListReturnPath: `${pathname}${search}` };
}
