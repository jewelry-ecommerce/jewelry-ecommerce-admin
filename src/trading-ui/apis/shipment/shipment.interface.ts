import { type ShipmentCarrier } from './shipment.enum';

export interface IShipmentListItem {
  id: string;
  orderId: string;
  orderCode: string;
  trackingCode: string;
  sortCode?: string | null;
  createdAt: string;
  status?: string | null;
  carrier: ShipmentCarrier | string;
  carrierName?: string | null;
  orderCategory?: string | null;
  orderCategoryLabel?: string | null;
  trackingStatus?: string | null;
  trackingTab?: string | null;
  trackingTabLabel?: string | null;
  carrierRawStatus?: string | null;
  statusDetail?: string | null;
  codAmount?: string | number | null;
  estimatedFee?: string | number | null;
  actualFee?: string | number | null;
  feeDiff?: string | number | null;
  warehouseId?: string | null;
  warehouseName?: string | null;
}

export interface IShipmentListSummary {
  ALL?: number;
  awaitingPickup?: number;
  intransit?: number;
  incident?: number;
  awaitingReturn?: number;
  finished?: number;
  cancelled?: number;
  [key: string]: number | undefined;
}

export interface IShipmentListRequest {
  page: number;
  take: number;
  search?: string;
  trackingTab?: string;
  carrier?: ShipmentCarrier | string;
  orderCategory?: string;
  orderTimeFilter?: string;
  startDate?: string;
  endDate?: string;
}

export interface IShipmentListResponse {
  total: number;
  page: number;
  take: number;
  list: IShipmentListItem[];
  summary?: IShipmentListSummary;
}

export interface IShipmentDetail extends IShipmentListItem {
  createdByType?: string | null;
  updatedByType?: string | null;
  deletedByType?: string | null;
  createdById?: string | null;
  updatedById?: string | null;
  deletedById?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
  tenantCode?: string | null;
  status?: string | null;
  carrierServiceId?: number | null;
  carrierServiceTypeId?: number | null;
  receiverName?: string | null;
  receiverPhone?: string | null;
  requestPayload?: IShipmentRequestPayload | null;
  responsePayload?: IShipmentResponsePayload | null;
  orderContext?: IShipmentOrderContext | null;
  lastCarrierRawStatus?: string | null;
  lastCarrierDescription?: string | null;
  lastEventAt?: string | null;
  errorMessage?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  note?: string | null;
}

export interface IShipmentItemPreview {
  name: string;
  price: number;
  quantity: number;
}

export interface IShipmentRequestPayload {
  items: IShipmentItemPreview[];
  width: number;
  height: number;
  length: number;
  toName: string;
  weight: number;
  toPhone: string;
  fromName: string;
  codAmount: number;
  fromPhone: string;
  serviceId: number;
  toAddress: string;
  toWardName: string;
  fromAddress: string;
  warehouseId: string;
  fromWardName: string;
  requiredNote: string;
  orderCategory: string;
  paymentTypeId: number;
  serviceTypeId: number;
  insuranceValue: number;
  toProvinceName: string;
  clientOrderCode: string;
  fromProvinceName: string;
}

export interface IShipmentFeeBreakdown {
  r2s: number;
  coupon: number;
  return: number;
  cod_fee: number;
  insurance: number;
  station_do: number;
  station_pu: number;
  double_check: number;
  main_service: number;
  return_again: number;
  cod_failed_fee: number;
  document_return: number;
  double_check_deliver: number;
  change_to_address_fee: number;
  pick_remote_areas_fee: number;
  deliver_remote_areas_fee: number;
  pick_remote_areas_fee_return: number;
  deliver_remote_areas_fee_return: number;
}

export interface IShipmentResponsePayload {
  fee: IShipmentFeeBreakdown;
  sort_code: string;
  total_fee: number;
  order_code: string;
  trans_type: string;
  ward_encode: string;
  district_encode: string;
  operation_partner: string;
  expected_delivery_time: string;
}

export interface IShipmentOrderContext {
  width: number;
  height: number;
  length: number;
  toName: string;
  weight: number;
  toPhone: string;
  fromName: string;
  codAmount: number;
  fromPhone: string;
  serviceId: number;
  toAddress: string;
  toWardName: string;
  fromAddress: string;
  warehouseId: string;
  estimatedFee: string;
  fromWardName: string;
  itemsPreview: IShipmentItemPreview[];
  requiredNote: string;
  orderCategory: string;
  paymentTypeId: number;
  serviceTypeId: number;
  insuranceValue: number;
  toProvinceName: string;
  fromProvinceName: string;
}

export interface ICreateShipmentRequest {
  orderId: string;
  carrier?: ShipmentCarrier | string;
  note?: string;
}

export interface IGhnFeeCalculateItem {
  id: number;
  name: string;
  code: string;
  quantity: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  convert_weight: number;
  calculate_weight: number;
  image_ids: string[];
}

export interface IGhnFeeCalculateRequest {
  shopId: number;
  serviceId?: number;
  serviceTypeId?: number;
  fromWardIdV2: number;
  fromAddressV2: string;
  toWardIdV2: number;
  toAddressV2: string;
  height: number;
  length: number;
  width: number;
  weight: number;
  insuranceValue: number;
  coupon?: string;
  items: IGhnFeeCalculateItem[];
}

export interface IGhnFeeCalculateResponse {
  total?: number;
  totalFee?: number;
  total_fee?: number;
  fee?: number;
  service_fee?: number;
  serviceFee?: number;
}

export interface IUpdateShipmentRequest {
  carrier?: ShipmentCarrier | string;
  trackingCode?: string | null;
  trackingStatus?: string | null;
  note?: string;
}

export interface ICancelShipmentRequest {
  note?: string;
}

export interface IApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}
