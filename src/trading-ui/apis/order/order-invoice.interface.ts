import { type OrderTimeFilter } from './order.enum';

export type InvoiceDocumentStatus = 'WAITING_SIGN' | 'SIGNED' | 'FAILED' | 'CANCELLED';
export type InvoiceDocumentType = 'INVOICE' | 'RECEIPT';
export type InvoiceDocumentSortField = 'orderCode' | 'invoiceCode' | 'customerName' | 'totalAmount' | 'issuedAt';

export type IInvoiceDocumentItem = {
  id: string;
  orderCode: string;
  orderTrackingCode: string;
  invoiceCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  totalAmount: number;
  status: InvoiceDocumentStatus;
  failedReason: string;
  issuedAt: string | null;
  documentType: InvoiceDocumentType;
  linkUrl: string;
  orderId: string;
  orderReturnId: string | null;
  externalDocId: string | null;
};

export type IInvoiceDocumentListQuery = {
  status?: InvoiceDocumentStatus | 'ALL';
  documentType?: InvoiceDocumentType | 'ALL';
  search?: string;
  orderTimeFilter?: OrderTimeFilter;
  startDate?: string;
  endDate?: string;
  sortField?: InvoiceDocumentSortField;
  sortDirection?: 'ASC' | 'DESC';
  page?: number;
  pageSize?: number;
};

export type IInvoiceDocumentStatusCounts = Record<InvoiceDocumentStatus | 'ALL', number>;

export type IInvoiceDocumentListResponse = {
  data: IInvoiceDocumentItem[];
  total: number;
  page: number;
  pageSize: number;
  statusCounts: IInvoiceDocumentStatusCounts;
};

export type IInvoiceSyncStatus = 'ALREADY_CREATED' | 'SKIPPED' | 'SCHEDULED' | 'SYNCED';

export type IInvoiceSyncResponse = {
  orderId?: string;
  orderCode?: string;
  orderReturnId?: string;
  invoiceCreated: boolean;
  invoiceCreatedAt: string | null;
  outboxStatus: string | null;
  status: IInvoiceSyncStatus;
  message: string;
};
