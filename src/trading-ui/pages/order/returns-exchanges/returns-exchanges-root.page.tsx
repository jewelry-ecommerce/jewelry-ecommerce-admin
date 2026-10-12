import { useSearchParams } from 'react-router-dom';
import ReturnExchangeEditPage from './returns-exchanges-edit/returns-exchanges-edit.page';
import ReturnExchangePage from './returns-exchanges.page';
import { ReturnExchangeListPage } from './returns-exchanges-list.page';
import ReturnExchangeDetailPage from './returns-exchanges-detail/returns-exchanges-detail.page';

const ReturnExchangeRootPage = () => {
  const [searchParams] = useSearchParams();
  const returnId = searchParams.get('returnId')?.trim() || '';
  const detailId = searchParams.get('detailId')?.trim() || '';
  const orderId = searchParams.get('orderId')?.trim() || '';

  if (returnId) {
    return <ReturnExchangeEditPage />;
  }

  if (detailId) {
    return <ReturnExchangeDetailPage />;
  }

  if (orderId) {
    return <ReturnExchangePage />;
  }

  return <ReturnExchangeListPage />;
};

export default ReturnExchangeRootPage;
