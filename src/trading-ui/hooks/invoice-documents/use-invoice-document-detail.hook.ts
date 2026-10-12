import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import { getInvoiceDocumentDetail, type IInvoiceDocumentItem } from '../../apis/order';
import { SnackbarType, useSnackbar } from '../use-snackbar.hook';

const INVOICE_DOCUMENT_DETAIL_SWR_KEY = 'invoice-document-detail' as const;

export const useInvoiceDocumentDetail = () => {
  const params = useParams<{ invoiceId?: string }>();
  const invoiceId = (params.invoiceId ?? '').trim();
  const { showSnackbar } = useSnackbar();
  const lastErrorMessageRef = useRef('');

  const swrKey = invoiceId ? ([INVOICE_DOCUMENT_DETAIL_SWR_KEY, invoiceId] as const) : null;
  const { data, error, isLoading } = useSWR(swrKey, async () => await getInvoiceDocumentDetail(invoiceId), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  useEffect(() => {
    const message = (error as { message?: string })?.message || '';
    if (!message || message === lastErrorMessageRef.current) return;
    lastErrorMessageRef.current = message;
    showSnackbar({ type: SnackbarType.ERROR, message: message || 'Không tải được chi tiết hóa đơn & chứng từ.' });
  }, [error, showSnackbar]);

  return {
    invoiceId,
    detail: data as IInvoiceDocumentItem | undefined,
    isLoading,
    loadError: (error as { message?: string })?.message || '',
  };
};
