import type { IOrder, IOrderReturnDetailResponse } from '../../../../apis/order';
import { OrderReturnReason, OrderReturnType } from '../../../../apis/order';
import { ShippingMethod } from '../../../../apis/order/order.enum';
import { getReturnLineUnitPrice, mapOrderToReturnExchangeSummary, parseAmount, RETURN_EXCHANGE_DEFAULT_SHIPPING_ADDRESS } from '../../../../common/constant/order/order.constants';
import type { ExchangeItem, ReturnExchangeOrderSummary, ReturnExchangeStepConfirmPartProps } from '../../order.types';
import { INITIAL_PICKUP_ADDRESS } from '../returns-exchanges-page.styles';

export type ReturnExchangeEditHydratedState = {
  orderSummary: ReturnExchangeOrderSummary;
  selectedReturnQtyByLineId: Record<string, number>;
  exchangeItems: ExchangeItem[];
  returnReason: OrderReturnReason | '';
  requestType: OrderReturnType | '';
  internalNote: string;
  evidenceImageUrls: string[];
  shipperNote: string;
  bankAccountHolder: string;
  bankAccountNumber: string;
  bankName: string;
  bankBranch: string;
  shippingMethod: ShippingMethod;
  carrierServiceId: number;
  pickupAddress: ReturnExchangeStepConfirmPartProps['pickupAddress'];
  shippingAddress: ReturnExchangeStepConfirmPartProps['shippingAddress'];
  returnShippingFee: number;
};

const isOrderReturnReason = (value: string): value is OrderReturnReason => Object.values(OrderReturnReason).includes(value as OrderReturnReason);

const isOrderReturnType = (value: string): value is OrderReturnType => Object.values(OrderReturnType).includes(value as OrderReturnType);

const parseReturnShippingMethod = (value: string | null | undefined): ShippingMethod => {
  if (value === ShippingMethod.STORE_PICKUP) return ShippingMethod.STORE_PICKUP;
  return ShippingMethod.STANDARD;
};

const mapPickupFromSnapshot = (snapshot: NonNullable<IOrderReturnDetailResponse['pickupAddressSnapshot']>): ReturnExchangeStepConfirmPartProps['pickupAddress'] => ({
  warehouseId: String(snapshot.warehouseId ?? ''),
  ...(snapshot.warehouseCode ? { warehouseCode: snapshot.warehouseCode } : {}),
  warehouseName: snapshot.warehouseName ?? '',
  addressLine: snapshot.addressLine ?? '',
  provinceCode: snapshot.provinceCode ?? 0,
  provinceName: snapshot.provinceName ?? '',
  phone: snapshot.phone ?? '',
  wardCode: snapshot.wardCode ?? 0,
  wardName: snapshot.wardName ?? '',
});

const mapShippingFromSnapshot = (snapshot: NonNullable<IOrderReturnDetailResponse['shippingAddressSnapshot']>): ReturnExchangeStepConfirmPartProps['shippingAddress'] => ({
  lastName: snapshot.lastName ?? RETURN_EXCHANGE_DEFAULT_SHIPPING_ADDRESS.lastName,
  firstName: snapshot.firstName ?? RETURN_EXCHANGE_DEFAULT_SHIPPING_ADDRESS.firstName,
  receiverPhone: snapshot.receiverPhone ?? RETURN_EXCHANGE_DEFAULT_SHIPPING_ADDRESS.receiverPhone,
  wardCode: snapshot.wardCode ?? RETURN_EXCHANGE_DEFAULT_SHIPPING_ADDRESS.wardCode,
  wardName: snapshot.wardName ?? RETURN_EXCHANGE_DEFAULT_SHIPPING_ADDRESS.wardName,
  addressLine: snapshot.addressLine ?? RETURN_EXCHANGE_DEFAULT_SHIPPING_ADDRESS.addressLine,
  provinceCode: snapshot.provinceCode ?? RETURN_EXCHANGE_DEFAULT_SHIPPING_ADDRESS.provinceCode,
  provinceName: snapshot.provinceName ?? RETURN_EXCHANGE_DEFAULT_SHIPPING_ADDRESS.provinceName,
});

/**
 * Gắn dữ liệu GET order-returns/:id + đơn gốc vào state form (3 bước).
 */
export const buildStateFromOrderReturnDetail = (detail: IOrderReturnDetailResponse, order: IOrder): ReturnExchangeEditHydratedState => {
  const orderSummary = mapOrderToReturnExchangeSummary(order);

  const selectedReturnQtyByLineId: Record<string, number> = {};
  for (const line of detail.returnItems ?? []) {
    const orderItemId = line.orderItemId?.trim();
    if (orderItemId) {
      selectedReturnQtyByLineId[orderItemId] = line.quantity;
    }
  }

  const returnProductIds = new Set((detail.returnItems ?? []).map((line) => line.productId).filter((id): id is string => Boolean(id?.trim())));

  const exchangeItems: ExchangeItem[] = (detail.exchangeItems ?? []).map((line) => ({
    productId: line.productId?.trim() ?? '',
    productName: line.productName,
    variantId: line.variationId?.trim() ?? '',
    sku: line.skuCode,
    quantity: line.quantity,
    priceSnapshot: getReturnLineUnitPrice(line),
    imageUrl: line.image ?? '',
    isSameProductExchange: Boolean(line.productId && returnProductIds.has(line.productId)),
  }));

  const reasonRaw = typeof detail.reason === 'string' ? detail.reason : '';
  const typeRaw = typeof detail.type === 'string' ? detail.type : '';

  const pickupAddress = detail.pickupAddressSnapshot ? mapPickupFromSnapshot(detail.pickupAddressSnapshot) : { ...INITIAL_PICKUP_ADDRESS };

  const shippingAddress = detail.shippingAddressSnapshot ? mapShippingFromSnapshot(detail.shippingAddressSnapshot) : RETURN_EXCHANGE_DEFAULT_SHIPPING_ADDRESS;

  const feeFromDetail = detail.returnShippingFee ?? parseAmount(detail.returnInboundShippingFeeNominal ?? detail.returnInboundShippingFee ?? 0);

  return {
    orderSummary,
    selectedReturnQtyByLineId,
    exchangeItems,
    returnReason: isOrderReturnReason(reasonRaw) ? reasonRaw : '',
    requestType: isOrderReturnType(typeRaw) ? typeRaw : '',
    internalNote: detail.note?.trim() ?? '',
    evidenceImageUrls: [...(detail.evidenceImageUrls ?? [])],
    shipperNote: detail.returnInboundShipperNote?.trim() ?? detail.shipperNote?.trim() ?? '',
    bankAccountHolder: detail.refundBankAccountHolder?.trim() ?? detail.bankAccountHolder?.trim() ?? '',
    bankAccountNumber: detail.refundBankAccountNumber?.trim() ?? detail.bankAccountNumber?.trim() ?? '',
    bankName: detail.refundBankName?.trim() ?? detail.bankName?.trim() ?? '',
    bankBranch: detail.refundBankBranch?.trim() ?? detail.bankBranch?.trim() ?? '',
    shippingMethod: parseReturnShippingMethod(detail.returnInboundShippingMethod ?? detail.shippingMethod ?? ShippingMethod.STANDARD),
    carrierServiceId: detail.returnInboundCarrierServiceId ?? detail.carrierServiceId ?? 53321,
    pickupAddress,
    shippingAddress,
    returnShippingFee: Number.isFinite(feeFromDetail) ? feeFromDetail : 0,
  };
};
