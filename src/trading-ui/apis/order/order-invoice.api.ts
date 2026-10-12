import { axiosRequest } from '../../common/config/axios.config';
import type { IInvoiceDocumentItem, IInvoiceDocumentListQuery, IInvoiceDocumentListResponse, IInvoiceDocumentStatusCounts, IInvoiceSyncResponse } from './order-invoice.interface';

const INVOICES_BASE_PATH = 'order/order/invoices';

const EMPTY_STATUS_COUNTS: IInvoiceDocumentStatusCounts = {
  ALL: 0,
  WAITING_SIGN: 0,
  SIGNED: 0,
  FAILED: 0,
  CANCELLED: 0,
};

const normalizeListResponse = (raw: unknown): IInvoiceDocumentListResponse => {
  if (Array.isArray(raw)) {
    const data = raw as IInvoiceDocumentItem[];
    return {
      data,
      total: data.length,
      page: 1,
      pageSize: data.length || 20,
      statusCounts: { ...EMPTY_STATUS_COUNTS, ALL: data.length },
    };
  }

  const obj = (raw ?? {}) as Partial<IInvoiceDocumentListResponse>;
  const data = Array.isArray(obj.data) ? obj.data : [];
  const statusCounts = {
    ...EMPTY_STATUS_COUNTS,
    ...(obj.statusCounts ?? {}),
  };
  statusCounts.ALL = Number(statusCounts.ALL) || Number(obj.total) || data.length;

  return {
    data,
    total: Number(obj.total) || data.length,
    page: Number(obj.page) || 1,
    pageSize: Number(obj.pageSize) || 20,
    statusCounts,
  };
};

/** GET order/order/invoices — danh sách hóa đơn & chứng từ */
export const getInvoiceDocumentList = async (params?: IInvoiceDocumentListQuery): Promise<IInvoiceDocumentListResponse> => {
  const raw = await axiosRequest.get(INVOICES_BASE_PATH, { params });
  return normalizeListResponse(raw);
};

/** GET order/order/invoices/:id — chi tiết chứng từ */
export const getInvoiceDocumentDetail = async (id: string): Promise<IInvoiceDocumentItem> => await axiosRequest.get(`${INVOICES_BASE_PATH}/${encodeURIComponent(id)}`);

/** Retry sync HĐĐT bán (SVTran) khi tạo lỗi. */
export const syncOrderInvoice = async (orderId: string): Promise<IInvoiceSyncResponse> => await axiosRequest.post(`${INVOICES_BASE_PATH}/${encodeURIComponent(orderId)}/sync`);

/** Retry sync chứng từ trả (SRTran). */
export const syncOrderReturnInvoice = async (orderReturnId: string): Promise<IInvoiceSyncResponse> =>
  await axiosRequest.post(`${INVOICES_BASE_PATH}/returns/${encodeURIComponent(orderReturnId)}/sync`);
