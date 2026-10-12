import { axiosRequest } from '../../common/config';
import { mapOrderImportConfirmResponse, mapOrderImportValidateResponse } from './order-import.mapper';
import type { OrderImportConfirmApiResponse, OrderImportConfirmResult, OrderImportValidateApiResponse, OrderImportValidateResult } from './order-import.interface';

const ORDERS_BASE_PATH = 'order/orders';

/** POST orders/import/validate — upload Excel + nhận preview/session. */
export const postOrderImportValidate = async (file: File): Promise<OrderImportValidateResult> => {
  const formData = new FormData();
  formData.append('file', file);
  const response: OrderImportValidateApiResponse = await axiosRequest.post(`${ORDERS_BASE_PATH}/import/validate`, formData);
  return mapOrderImportValidateResponse(response);
};

/** POST orders/import/sessions/:sessionId/confirm — tạo IE job import. */
export const postOrderImportSessionConfirm = async (sessionId: string): Promise<OrderImportConfirmResult> => {
  const response: OrderImportConfirmApiResponse = await axiosRequest.post(`${ORDERS_BASE_PATH}/import/sessions/${sessionId}/confirm`);
  return mapOrderImportConfirmResponse(response);
};

/** GET orders/import/sessions/:sessionId/error-file — file lỗi/cảnh báo của session validate. */
export const getOrderImportSessionErrorFileBlob = async (sessionId: string): Promise<Blob> => {
  return await axiosRequest.get(`${ORDERS_BASE_PATH}/import/sessions/${sessionId}/error-file`, {
    responseType: 'blob',
  });
};
