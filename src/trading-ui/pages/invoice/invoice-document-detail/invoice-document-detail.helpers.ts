import type { InvoiceDocumentStatus, InvoiceDocumentType } from '../../../apis/order';

export const INVOICE_DOCUMENT_STATUS_META: Record<InvoiceDocumentStatus, { label: string; sx: Record<string, string> }> = {
  WAITING_SIGN: {
    label: 'Chờ ký',
    sx: { color: '#A16207', backgroundColor: '#FEF9C3', border: '1px solid #FDE68A' },
  },
  SIGNED: {
    label: 'Đã ký',
    sx: { color: '#15803D', backgroundColor: '#DCFCE7', border: '1px solid #BBF7D0' },
  },
  FAILED: {
    label: 'Lỗi',
    sx: { color: '#BE123C', backgroundColor: '#FFE4E6', border: '1px solid #FECDD3' },
  },
  CANCELLED: {
    label: 'Đã hủy',
    sx: { color: '#6B7280', backgroundColor: '#F3F4F6', border: '1px solid #E5E7EB' },
  },
};

export const INVOICE_DOCUMENT_TYPE_LABELS: Record<InvoiceDocumentType, string> = {
  INVOICE: 'Hóa đơn',
  RECEIPT: 'Chứng từ',
};

export const getInvoiceDocumentStatusMeta = (status: InvoiceDocumentStatus) =>
  INVOICE_DOCUMENT_STATUS_META[status] ?? {
    label: status,
    sx: { color: '#6B7280', backgroundColor: '#F3F4F6', border: '1px solid #E5E7EB' },
  };

export const getInvoiceDocumentTypeLabel = (documentType: InvoiceDocumentType) => INVOICE_DOCUMENT_TYPE_LABELS[documentType] ?? documentType;
