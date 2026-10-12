import { axiosRequest } from '../../common/config/axios.config';
import {
  type IApiResponse,
  type ICancelShipmentRequest,
  type ICreateShipmentRequest,
  type IShipmentDetail,
  type IGhnFeeCalculateRequest,
  type IGhnFeeCalculateResponse,
  type IShipmentListRequest,
  type IShipmentListResponse,
  type IUpdateShipmentRequest,
} from './shipment.interface';

const SHIPMENT_BASE_PATH = 'shipping/shipments';

export const getShipmentList = async (request?: IShipmentListRequest): Promise<IShipmentListResponse> =>
  await axiosRequest.get(`${SHIPMENT_BASE_PATH}`, {
    params: request
      ? {
          ...request,
          ...(request.search?.trim() ? { search: request.search.trim() } : {}),
        }
      : undefined,
  });

export const getShipmentDetail = async (shipmentId: string): Promise<IShipmentDetail> => await axiosRequest.get(`${SHIPMENT_BASE_PATH}/${shipmentId}`);

export const createShipment = async (request: ICreateShipmentRequest): Promise<IApiResponse<IShipmentDetail>> => await axiosRequest.post(`${SHIPMENT_BASE_PATH}`, request);

export const updateShipment = async (shipmentId: string, request: IUpdateShipmentRequest): Promise<IApiResponse<IShipmentDetail>> =>
  await axiosRequest.put(`${SHIPMENT_BASE_PATH}/${shipmentId}`, request);

export const cancelShipment = async (shipmentId: string, request: ICancelShipmentRequest): Promise<IApiResponse<IShipmentDetail>> =>
  await axiosRequest.post(`${SHIPMENT_BASE_PATH}/${shipmentId}/cancel`, request);

export const calculateGhnShippingFee = async (request: IGhnFeeCalculateRequest): Promise<IGhnFeeCalculateResponse> => await axiosRequest.post('/order/orders/fee/calculate', request);
