import type { Dayjs } from 'dayjs';
import { type IOrderItem, type IOrderListItem, type IOrderListRequest, type OrderStatus as ApiOrderStatus, OrderTimeFilter, OrderReturnReason } from '../../apis/order';
import { mapOrderStatusFilterToApiOrderStatus, ORDER_API_SORT_DIRECTION_MAP, ORDER_API_SORT_FIELD_MAP, ORDER_SUPPORTED_STATUS_FILTERS } from '../../common/constant/order/order.constants';
import { type CustomerInfo, type Order, type OrderAdvancedFilters, type OrderShippingAddress, type OrderSortField, type OrderStatusFilter, type OrderTimeOptionValue, type SortDirection } from './order.types';
import { getMaskedPhone } from '../../common/utils/order/order.utils';
import { SHIPPING_CARRIER_OPTIONS } from '../../common/constant/order/create-order.constants';

const THUMBNAIL_PALETTE = [
  ['#E0F2FE', '#0284C7'],
  ['#FEF3C7', '#D97706'],
  ['#FCE7F3', '#DB2777'],
  ['#DCFCE7', '#16A34A'],
  ['#EDE9FE', '#7C3AED'],
  ['#DBEAFE', '#2563EB'],
] as const;

const getThumbnailSeed = (value: string) => {
  return value.split('').reduce((seed, character) => seed + character.charCodeAt(0), 0);
};

const getThumbnailTheme = (value: string) => {
  const theme = THUMBNAIL_PALETTE[getThumbnailSeed(value) % THUMBNAIL_PALETTE.length];

  return {
    thumbnailTone: theme[0],
    thumbnailAccent: theme[1],
  };
};

const getOrderItemName = (item: IOrderItem) => item.productName?.trim() || item.variationName || item.skuCode || 'Sản phẩm';

const mapApiOrderItemToViewItem = (item: IOrderItem) => ({
  id: item.id,
  name: getOrderItemName(item),
  sku: item.skuCode,
  quantity: item.quantity,
  imageUrl: item.image,
  ...getThumbnailTheme(item.skuCode || item.id),
});

const getCustomerDisplayName = (shippingAddress: OrderShippingAddress) => {
  return [shippingAddress.firstName].filter(Boolean).join(' ').trim();
};

export const mapShippingAddressToCustomerInfo = (shippingAddress: OrderShippingAddress, contactEmail?: string): CustomerInfo => {
  const phone = shippingAddress.receiverPhone.trim();
  const maskedPhone = getMaskedPhone(phone);
  const displayName = getCustomerDisplayName(shippingAddress);
  const secondarySegments = [displayName ? maskedPhone : null].filter(Boolean);
  const item = { contactEmail: contactEmail || 'Chưa có thông tin địa chỉ' } as Pick<IOrderListItem, 'contactEmail'>;

  return {
    id: shippingAddress.id,
    primaryText: displayName || maskedPhone || contactEmail || '--',
    secondaryText: secondarySegments.join(', ') || item.contactEmail || 'Chưa có thông tin địa chỉ',
    phone,
    maskedPhone,
    email: contactEmail ?? '',
  };
};

const mapListItemShippingAddress = (item: IOrderListItem): OrderShippingAddress => ({
  id: item.shippingAddressSnapshot?.id ?? '',
  firstName: item.shippingAddressSnapshot?.firstName?.trim() ?? '',
  lastName: item.shippingAddressSnapshot?.lastName?.trim() ?? '',
  receiverPhone: item.shippingAddressSnapshot?.receiverPhone?.trim() ?? '',
  provinceCode: item.shippingAddressSnapshot?.provinceCode ?? null,
  provinceName: item.shippingAddressSnapshot?.provinceName?.trim() ?? '',
  wardCode: item.shippingAddressSnapshot?.wardCode ?? null,
  wardName: item.shippingAddressSnapshot?.wardName?.trim() ?? '',
  addressLine: item.shippingAddressSnapshot?.addressLine?.trim() ?? '',
});

const getOrderBrand = (item: IOrderListItem) => {
  const tenantCode = item.tenantCode?.trim();

  if (!tenantCode) return '--';

  return tenantCode.replace(/-/g, ' ');
};

export const mapApiOrderListItemToOrder = (item: IOrderListItem): Order => {
  const shippingAddress = mapListItemShippingAddress(item);

  return {
    id: item.id,
    orderCode: item.orderCode,
    trackingCode: item.trackingCode,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    deliveredAt: item.deliveredAt ?? null,
    source: item.source,
    status: item.status,
    paymentStatus: item.paymentStatus,
    paymentMethod: item?.paymentMethod,
    isAllowCheck: Boolean(item.isAllowCheck),
    isDataValid: item.isDataValid,
    errorLog: item.errorLog,
    shippingMethod: item.shippingMethod,
    shippingCarrier: item.shippingCarrier || SHIPPING_CARRIER_OPTIONS[0].label,
    customer: mapShippingAddressToCustomerInfo(shippingAddress, item.contactEmail),
    shippingAddress,
    subtotal: item.subtotal ?? null,
    discountTotal: item.discountTotal ?? null,
    grandTotal: item.grandTotal ?? null,
    items: item.items.map(mapApiOrderItemToViewItem),
    shippingTrackingUrl: item.shippingTrackingUrl ?? '',
    brand: getOrderBrand(item),
    statusHistory: item.statusHistory,
    warehouseName: item.warehouseName ?? null,
    posMetadata: item.metadata?.pos
      ? {
          cashierId: item.metadata.pos.cashierId ?? null,
          cashierName: item.metadata.pos.cashierName ?? null,
          storeCode: item.metadata.pos.storeCode ?? null,
          shiftId: item.metadata.pos.shiftId ?? null,
          deviceId: item.metadata.pos.deviceId ?? null,
          sellers: item.metadata.pos.sellers ?? [],
        }
      : null,
  };
};

export const isSupportedOrderStatusFilter = (value: OrderStatusFilter): value is ApiOrderStatus => {
  return ORDER_SUPPORTED_STATUS_FILTERS.some((status) => status === value);
};

export const resolveOrderListStatusParams = (activeStatus: OrderStatusFilter): Pick<IOrderListRequest, 'orderStatus'> => {
  const orderStatus = mapOrderStatusFilterToApiOrderStatus(activeStatus);
  return orderStatus ? { orderStatus } : {};
};

const buildTimeFilterPayload = (
  selectedTimeOption: OrderTimeOptionValue,
  customDateRange: { from: Dayjs; to: Dayjs } | null,
): Partial<Pick<IOrderListRequest, 'orderTimeFilter' | 'startDate' | 'endDate'>> => {
  if (selectedTimeOption === OrderTimeFilter.CUSTOM) {
    if (!customDateRange) {
      return { orderTimeFilter: undefined };
    }

    return {
      orderTimeFilter: OrderTimeFilter.CUSTOM,
      startDate: customDateRange.from.toISOString(),
      endDate: customDateRange.to.toISOString(),
    };
  }

  /** Today, Yesterday, Last7Days, … — backend chỉ cần `orderTimeFilter`, không gửi startDate/endDate. */
  return { orderTimeFilter: selectedTimeOption };
};

const buildAdvancedFilterPayload = (advancedFilters: OrderAdvancedFilters) => {
  const warehouseId = advancedFilters.warehouseId.trim();
  const createdById = advancedFilters.createdById.trim();
  const skuCode = advancedFilters.skuCode.trim();
  const provinceName = advancedFilters.provinceName.trim();

  return {
    source: advancedFilters.source || undefined,
    paymentStatus: advancedFilters.paymentStatus || undefined,
    warehouseId: warehouseId || undefined,
    createdById: createdById || undefined,
    skuCode: skuCode || undefined,
    provinceName: provinceName || undefined,
    dateField: advancedFilters.dateField || undefined,
  };
};

export const buildOrderListRequest = ({
  page,
  pageSize,
  search,
  activeStatus,
  sortField,
  sortDirection,
  selectedTimeOption,
  customDateRange,
  advancedFilters,
}: {
  page: number;
  pageSize: number;
  search: string;
  activeStatus: OrderStatusFilter;
  sortField: OrderSortField | null;
  sortDirection: SortDirection;
  selectedTimeOption: OrderTimeOptionValue | null;
  customDateRange: { from: Dayjs; to: Dayjs } | null;
  advancedFilters: OrderAdvancedFilters;
}): IOrderListRequest => {
  const sortBy = sortField ? ORDER_API_SORT_FIELD_MAP[sortField] : undefined;
  const timeFilterPayload = selectedTimeOption ? buildTimeFilterPayload(selectedTimeOption, customDateRange) : { orderTimeFilter: undefined };
  const filterPayload = buildAdvancedFilterPayload(advancedFilters);

  return {
    page,
    take: pageSize,
    search: search.trim() || undefined,
    orderBy: sortBy,
    orderType: sortBy ? ORDER_API_SORT_DIRECTION_MAP[sortDirection] : undefined,
    ...resolveOrderListStatusParams(activeStatus),
    ...timeFilterPayload,
    ...filterPayload,
  };
};

export const isServerSortableField = (field: OrderSortField) => Boolean(ORDER_API_SORT_FIELD_MAP[field]);

//viết hàm convert lý do theo OrderReturnReason
export const mapOrderReturnReason = (reason: OrderReturnReason) => {
  switch (reason) {
    case OrderReturnReason.CHANGED_MIND:
      return 'Đổi ý';
    case OrderReturnReason.DEFECTIVE_PRODUCT:
      return 'Hàng bị lỗi (rớt đá, móp...)';
    case OrderReturnReason.WRONG_ORDER_DELIVERED:
      return 'Giao nhầm đơn';
    case OrderReturnReason.EMPTY_BOX_DELIVERED:
      return 'Giao thùng rỗng';
    case OrderReturnReason.MISSING_ITEMS_DELIVERED:
      return 'Giao thiếu hàng';
    case OrderReturnReason.WRONG_PRODUCT_DELIVERED:
      return 'Giao sai sản phẩm';
    case OrderReturnReason.PRODUCT_NOT_AS_DESCRIBED:
      return 'Hàng khác với mô tả';
  }
};

export const LinkGHN = 'https://donhang.ghn.vn/?order_code=';

export const formatLinkGHN = (orderCode: string) => `${LinkGHN}${orderCode}`;

/** URL tra cứu 3PL: ưu tiên BE, fallback GHN từ mã vận đơn. */
export const resolveShippingTrackingUrl = (trackingCode?: string | null, shippingTrackingUrl?: string | null): string => {
  const explicit = shippingTrackingUrl?.trim();
  if (explicit) return explicit;
  const code = trackingCode?.trim();
  return code ? formatLinkGHN(code) : '';
};
