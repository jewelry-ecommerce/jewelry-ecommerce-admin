 
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { getWardsByProvinceCode, getProvinceList, type IProvince, type IWard } from '../apis/address';
import {
  cancelOrder,
  createOrder,
  getOrderProductDetail,
  getOrderProductVariations,
  getOrderDetail,
  getOrderWarehouses,
  mapOrderCustomerByPhoneItemToLookup,
  OrderCancellationReason,
  type OrderSource,
  PaymentMethod,
  ShippingMethod,
  syncManualOrderCartLineQuantity,
  updateOrder,
  type IOrder,
  type IOrderCustomerByPhoneItem,
  type IOrderProductDetail,
  type IOrderProductVariation,
  type IPromotion,
  type ICreateOrderResponse,
} from '../apis/order';
import { OrderKind, type OrderPurpose } from '../apis/order/order.enum';
import { ORDER_EDIT_PAGE_ALLOWED_STATUSES, isOrderCancellableStatus, ORDER_CANCEL_BLOCKED_STATUS_MESSAGE, shouldPromptCancelOriginalWhenCloningOrder } from '../common/constant/order/order.constants';
import { calculateGhnShippingFee } from '../apis/shipment';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
// code này được thêm vởi quân phạm
import { getOrderClonePath, getOrderDetailPath, ROUTE_PATH } from '@/trading-ui/router/route.path';
// code này được thêm vởi quân phạm
import { useCreateOrderForm } from '../hooks/use-create-order-form.hook';
import { useOrderCatalog } from '../hooks/use-order-catalog.hook';
import { getPosStoreList } from '../apis/pos/pos.api';
void getPosStoreList;
import type { CartLine, CreateOrderCatalogPickContext, CreateOrderFormValues, ShippingServiceOption, WarehouseOption } from '../pages/order/create-order/create-order.interface';
import {
  buildOrderItemsFromCartLines,
  computeCartSubtotal,
  buildOrderVariationMetaMap,
  CLONED_LINE_STOCK_PLACEHOLDER,
  normalizeVnPhone,
  orderItemsToCartLinesWithPackaging,
  parseMoneyAmount,
  parsePaymentMethod,
  resolveOrderCustomerFullName,
  resolveOrderPurpose,
  formatVnd,
} from '../common/utils/order/create-order.utils';
import { CART_LINE_SYNC_TIMEOUT_MS, PAYMENT_METHOD_OPTIONS, PAYMENT_METHOD_OPTIONS_EDIT, SHIPPING_CARRIER_OPTIONS } from '../common/constant/order/create-order.constants';
import { ORDER_SHIPPING_ADDRESS_DEBOUNCE_MS, ORDER_SHIPPING_DEFAULT_SHOP_ID, fetchOrderShippingServiceOptions } from '../common/utils/order/order-shipping-service.utils';
import { buildCustomerPaymentReturnUrl } from '../common/config/customer-payment-return-url.config';
import { buildAdminOrderCartProductFingerprint, useAdminOrderVoucher } from './order/use-admin-order-voucher.hook';
import { useOrderPricingQuote } from './order/use-order-pricing-quote.hook';
import { isOrderSummaryPromotion } from '../pages/order/order-detail/order-detail.helpers';
import type { SelectedAdminOrderVoucher } from '../pages/order/create-order/voucher/admin-order-voucher.mapper';
import { buildAdminOrderV2CreateRequest, buildAdminOrderV2Context, getAdminOrderConflictQuote } from '../common/utils/order/admin-order-v2.util';
import { useAdminOrderV2Pricing } from './order/use-admin-order-v2-pricing.hook';
import { useAdminOrderV2Submit } from './order/use-admin-order-v2-submit.hook';
import { ADMIN_ORDER_V2_MESSAGE } from '../common/constant/order/admin-order-v2.constants';

export type UseOrderDraftFormPageArgs = { mode: 'create'; cloneFromId: string | null } | { mode: 'edit'; orderId: string };

// code này được thêm vởi quân phạm
export interface CreatedOrderPaymentLink {
  orderId: string;
  orderCode: string;
  paymentUrl: string;
  paymentLinkExpiresAt?: string | null;
}
// code này được thêm vởi quân phạm

const DEFAULT_PICKUP_PHONE = '0900000000';
const DEFAULT_WAREHOUSE_UUID = '7f9c6f39-1b6d-4d65-9f34-2e5a9d2d8c10';
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DEFAULT_ITEM_DIMENSION = { length: 10, width: 10, height: 5, weight: 500 };
const ONLINE_PAYMENT_METHODS = new Set<PaymentMethod>([
  PaymentMethod.QR_CODE,
  PaymentMethod.CREDIT_CARD,
  PaymentMethod.DIGITAL_WALLET,
  PaymentMethod.MOMO_WALLET,
  PaymentMethod.ZALO_PAY,
  PaymentMethod.INSTALLMENT,
]);

const resolveAdminCreatePaymentMethod = (method: PaymentMethod | ''): PaymentMethod => (method === PaymentMethod.BANK_TRANSFER ? PaymentMethod.QR_CODE : (method as PaymentMethod));

const getSelectedWarehouse = (warehouseValue: string, options: WarehouseOption[]) => options.find((w) => String(w.value) === String(warehouseValue)) ?? null;

const buildPickupAddress = (warehouseValue: string, options: WarehouseOption[]) => {
  const warehouse = getSelectedWarehouse(warehouseValue, options);
  if (!warehouse) return undefined;
  const idStr = String(warehouse.value);
  return {
    warehouseId: UUID_V4_REGEX.test(idStr) ? idStr : DEFAULT_WAREHOUSE_UUID,
    ...(warehouse.code ? { warehouseCode: warehouse.code } : {}),
    warehouseName: warehouse.label,
    addressLine: warehouse.addressLine,
    provinceCode: warehouse.provinceCode,
    provinceName: warehouse.provinceName,
    phone: warehouse.phone || DEFAULT_PICKUP_PHONE,
    wardCode: warehouse.wardCode,
    wardName: warehouse.wardName,
  };
};

const mapShippingCarrierCode = (_carrierValue: string): string => {
  // const v = String(carrierValue ?? '')
  //   .trim()
  //   .toLowerCase();
  // if (v === 'viettelpost') return 'VTP';
  // if (v === 'jtexpress') return 'JTEXPRESS';
  return 'GHN';
};

const findShippingService = (value: string, options: ShippingServiceOption[]) => options.find((o) => o.value === value);

const parseCarrierServiceId = (value: string, options: ShippingServiceOption[]): number | undefined => {
  const sel = findShippingService(value, options);
  if (sel?.serviceId && sel.serviceId > 0) return sel.serviceId;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

const buildPromotionIds = (promoCodeValue: string, voucherCodes: string[] = []): string[] => {
  const codes = voucherCodes.length > 0 ? voucherCodes : promoCodeValue.trim() ? [promoCodeValue.trim()] : [];
  return codes;
};

const mapOrderPromotionsToSelectedVouchers = (promotions: IPromotion[] | undefined): SelectedAdminOrderVoucher[] => {
  const codes = new Set<string>();
  const selected: SelectedAdminOrderVoucher[] = [];

  for (const promotion of promotions ?? []) {
    if (!isOrderSummaryPromotion(promotion)) continue;
    const code = String(promotion.code ?? '').trim();
    if (!code || codes.has(code)) continue;
    codes.add(code);
    selected.push({
      voucherCodeId: String(promotion.id ?? code),
      code,
      codeMask: code,
      title: code,
      benefitSummary: '',
    });
  }

  return selected;
};

type CartLineStockSyncResult = {
  nextLines: CartLine[];
  hasOutOfStock: boolean;
  hasInsufficientStock: boolean;
  hasUnverifiedStock: boolean;
};

export function useOrderDraftFormPage(args: UseOrderDraftFormPageArgs) {
  const navigate = useNavigate();
  const isEditMode = args.mode === 'edit';
  const orderId = args.mode === 'edit' ? args.orderId : undefined;
  const cloneFromId = args.mode === 'create' ? args.cloneFromId : null;
  const isCloneMode = Boolean(cloneFromId) && !isEditMode;
  const isCreateOnlyMode = !isEditMode && !isCloneMode;

  const { showSnackbar } = useSnackbar();

  const [prefillLoading, setPrefillLoading] = useState(Boolean((isEditMode && orderId) || cloneFromId));
  const [cloneSource, setCloneSource] = useState<{ id: string; orderCode: string } | null>(null);
  const [editBaselineSubtotal, setEditBaselineSubtotal] = useState<number | null>(null);
  const [editBaselineGrandTotal, setEditBaselineGrandTotal] = useState<number | null>(null);
  const [editBaselineShippingFee, setEditBaselineShippingFee] = useState<number | null>(null);
  const [editBaselineDiscountTotal, setEditBaselineDiscountTotal] = useState<number | null>(null);
  const [editTotalsDirty, setEditTotalsDirty] = useState(false);
  const [editOrderDetail, setEditOrderDetail] = useState<IOrder | null>(null);
  const [editSaveDialogOpen, setEditSaveDialogOpen] = useState(false);
  const [cancelOrderDialogOpen, setCancelOrderDialogOpen] = useState(false);
  const [cancelOrderSubmitting, setCancelOrderSubmitting] = useState(false);
  const [cloneConfirmDialogOpen, setCloneConfirmDialogOpen] = useState(false);
  const [cloneConfirmSubmitting, setCloneConfirmSubmitting] = useState(false);
  const [editProductPickerOpen, setEditProductPickerOpen] = useState(false);
  // code này được thêm vởi quân phạm
  const [createdPaymentLink, setCreatedPaymentLink] = useState<CreatedOrderPaymentLink | null>(null);
  // code này được thêm vởi quân phạm

  const { productQuery, setProductQuery, catalog, catalogLoading } = useOrderCatalog();
  const [variantProduct, setVariantProduct] = useState<CreateOrderCatalogPickContext | null>(null);

  const [cartLines, setCartLines] = useState<CartLine[]>([]);

  const [cartQuantitySyncingLineKey, setCartQuantitySyncingLineKey] = useState<string | null>(null);

  const [provinces, setProvinces] = useState<IProvince[]>([]);
  const [warehouseOptions, setWarehouseOptions] = useState<WarehouseOption[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        // OMS lấy kho từ WMS và đổi sẵn mã tỉnh/phường sang mã GHN — cùng nguồn kho với đơn web.
        const list = await getOrderWarehouses();
        if (!cancelled) {
          setWarehouseOptions(
            list
              .filter((w) => Boolean(w.warehouseId))
              .map((w) => ({
                value: String(w.warehouseId),
                label: w.warehouseName || w.warehouseCode || String(w.warehouseId),
                code: w.warehouseCode,
                addressLine: w.addressLine ?? '',
                provinceCode: w.provinceCode ?? 0,
                provinceName: w.provinceName ?? '',
                wardCode: w.wardCode ?? 0,
                wardName: w.wardName ?? '',
                phone: w.phone || DEFAULT_PICKUP_PHONE,
              })),
          );
        }
      } catch (error) {
        console.error('Failed to fetch order warehouses:', error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  const [wards, setWards] = useState<IWard[]>([]);
  const [provinceName, setProvinceName] = useState('');
  const [wardName, setWardName] = useState('');

  const {
    control,
    handleSubmit: submitWithRHF,
    setValue,
    getValues,
    clearErrors,
    trigger,
    formState: { isValid },
  } = useCreateOrderForm();

  const provinceCode = useWatch({ control, name: 'provinceCode' });
  const wardCode = useWatch({ control, name: 'wardCode' });
  const receiverPhone = useWatch({ control, name: 'receiverPhone' });
  const firstName = useWatch({ control, name: 'firstName' });
  const warehouseId = useWatch({ control, name: 'warehouseId' });
  const shippingCarrier = useWatch({ control, name: 'shippingCarrier' });
  const shippingService = useWatch({ control, name: 'shippingService' });
  const paymentMethodRaw = useWatch({ control, name: 'paymentMethod' });
  const toAddressLine = useWatch({ control, name: 'addressLine' });

  // Kho đang chọn không có trong danh sách OMS (mặc định form, đơn cũ) thì chọn kho OMS trả về đầu tiên.
  useEffect(() => {
    if (warehouseOptions.length === 0 || getSelectedWarehouse(String(warehouseId), warehouseOptions)) return;
    setValue('warehouseId', String(warehouseOptions[0].value), { shouldValidate: true });
  }, [setValue, warehouseId, warehouseOptions]);

  const [promoCode, setPromoCode] = useState('');
  const [orderCustomerId, setOrderCustomerId] = useState<string | null>(null);
  const [shippingFee, setShippingFee] = useState(0);
  const [shippingServiceOptions, setShippingServiceOptions] = useState<ShippingServiceOption[]>([]);
  const [shippingServiceLoading, setShippingServiceLoading] = useState(false);
  const [shippingServiceFetchFailed, setShippingServiceFetchFailed] = useState(false);
  const shippingServiceRequestIdRef = useRef(0);
  const [submitting, setSubmitting] = useState(false);
  const notifiedPricingEvaluationRef = useRef<string | null>(null);
  const pendingVoucherSeedRef = useRef<SelectedAdminOrderVoucher[] | null>(null);
  const lastCartProductFingerprintRef = useRef<string | null>(null);

  const buildPrefillCartLinesFromOrder = useCallback(async (detail: IOrder): Promise<CartLine[]> => {
    const productIds = Array.from(new Set(detail.items.map((item) => item.productId?.trim()).filter((id): id is string => Boolean(id))));
    const variationsByProduct = await Promise.all(
      productIds.map(async (productId) => {
        try {
          const variations = await getOrderProductVariations(productId);
          return { productId, variations };
        } catch {
          try {
            const productDetail = await getOrderProductDetail(productId);
            return {
              productId,
              variations: productDetail.variations.map((variation) => ({
                id: variation.id,
                stock: variation.stockQuantity,
                skuCode: variation.skuCode,
                slug: '',
                name: '',
                price: String(variation.salePrice ?? variation.unitPrice ?? 0),
                status: '',
                medias: [],
                attributes: [],
                packagingRelations: variation.packagingRelations,
              })),
            };
          } catch {
            return null;
          }
        }
      }),
    );

    const variationMeta = buildOrderVariationMetaMap(variationsByProduct);
    return orderItemsToCartLinesWithPackaging(detail, variationMeta);
  }, []);

  const syncCartLinesWithLiveStock = useCallback(async (lines: CartLine[]): Promise<CartLineStockSyncResult> => {
    const productIds = Array.from(new Set(lines.map((line) => line.productId.trim()).filter(Boolean)));
    if (productIds.length <= 0) {
      return {
        nextLines: lines,
        hasOutOfStock: false,
        hasInsufficientStock: false,
        hasUnverifiedStock: lines.some((line) => line.variation.stockQuantity === CLONED_LINE_STOCK_PLACEHOLDER),
      };
    }

    const stockByVariationId = new Map<string, number>();
    const variationsByProduct = await Promise.all(
      productIds.map(async (productId) => {
        try {
          const variations = await getOrderProductVariations(productId);
          return { productId, variations };
        } catch {
          try {
            const detail = await getOrderProductDetail(productId);
            return {
              productId,
              variations: detail.variations.map((variation) => ({
                id: variation.id,
                stock: variation.stockQuantity,
                skuCode: variation.skuCode,
                slug: '',
                name: '',
                price: String(variation.salePrice ?? variation.unitPrice ?? 0),
                status: '',
                medias: [],
                attributes: [],
              })),
            };
          } catch {
            return null;
          }
        }
      }),
    );

    variationsByProduct.forEach((item) => {
      if (!item) return;
      item.variations.forEach((variation) => {
        if (stockByVariationId.has(variation.id)) return;
        stockByVariationId.set(variation.id, Math.max(0, Number(variation.stock ?? 0)));
      });
    });

    let hasOutOfStock = false;
    let hasInsufficientStock = false;
    let hasUnverifiedStock = false;
    const nextLines = lines.map((line) => {
      const liveStock = stockByVariationId.get(line.variation.id);
      if (liveStock == null) {
        if (line.variation.stockQuantity === CLONED_LINE_STOCK_PLACEHOLDER) {
          hasUnverifiedStock = true;
          // Không xác thực được tồn kho line clone -> ép về 0 để UI khóa tăng/giảm.
          return {
            ...line,
            variation: {
              ...line.variation,
              stockQuantity: 0,
            },
          };
        }
        return line;
      }

      if (liveStock <= 0) hasOutOfStock = true;
      if (liveStock > 0 && line.quantity > liveStock) hasInsufficientStock = true;
      return {
        ...line,
        quantity: liveStock > 0 ? Math.min(line.quantity, liveStock) : line.quantity,
        variation: {
          ...line.variation,
          stockQuantity: liveStock,
        },
      };
    });

    return { nextLines, hasOutOfStock, hasInsufficientStock, hasUnverifiedStock };
  }, []);

  const shippingContext = useMemo(() => {
    const wh = getSelectedWarehouse(String(warehouseId), warehouseOptions);
    const fromAddress = wh?.addressLine?.trim() ?? '';
    const fromWard = Number(wh?.wardCode ?? 0);
    const toWard = Number(wardCode || 0);
    const toAddress = String(toAddressLine ?? '').trim();
    const isReady = Boolean(fromAddress) && fromWard > 0 && toWard > 0 && Boolean(toAddress);
    return { fromAddress, fromWard, toWard, toAddress, isReady };
  }, [warehouseId, wardCode, toAddressLine, warehouseOptions]);

  const totalWeightGrams = useMemo(
    () =>
      Math.max(
        0,
        cartLines.reduce((sum, line) => sum + Math.max(0, Number(line.variation.weightGram ?? 0)) * line.quantity, 0),
      ),
    [cartLines],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await getProvinceList();
        if (!cancelled) setProvinces(res.list ?? []);
      } catch {
        if (!cancelled) setProvinces([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const idToLoad = isEditMode ? orderId : cloneFromId;
    if (!idToLoad) {
      setPrefillLoading(false);
      return;
    }

    let cancelled = false;
    setPrefillLoading(true);
    setEditTotalsDirty(false);

    void (async () => {
      try {
        const detail = await getOrderDetail(idToLoad);
        if (cancelled) return;

        if (isEditMode && !ORDER_EDIT_PAGE_ALLOWED_STATUSES.includes(detail.status)) {
          showSnackbar({
            type: SnackbarType.WARNING,
            message: 'Chỉ chỉnh sửa đơn khi đơn ở trạng thái Chờ xác nhận.',
          });
          navigate(ROUTE_PATH.ORDER, { replace: true });
          return;
        }

        const addr = detail.shippingAddressSnapshot;
        if (addr?.provinceCode != null) {
          try {
            const wardsRes = await getWardsByProvinceCode(Number(addr.provinceCode));
            if (!cancelled) setWards(wardsRes.list ?? []);
          } catch {
            if (!cancelled) setWards([]);
          }
        }

        setProvinceName(addr?.provinceName ?? '');
        setWardName(addr?.wardName ?? '');
        setValue('crmSearch', '', { shouldValidate: true });
        setValue('receiverPhone', String(addr?.receiverPhone ?? '').trim(), { shouldValidate: true });
        setValue('firstName', resolveOrderCustomerFullName(addr), { shouldValidate: true });
        setValue('addressLine', addr?.addressLine ?? '', { shouldValidate: true });
        setValue('provinceCode', addr?.provinceCode != null ? Number(addr.provinceCode) : '', { shouldValidate: true });
        setValue('wardCode', addr?.wardCode != null ? Number(addr.wardCode) : '', { shouldValidate: true });
        setValue('contactEmail', detail.contactEmail ?? '');
        setValue('source', detail.source ?? '', { shouldValidate: true });
        setValue('note', detail.note ?? '');
        setValue('notePayment', detail.notePayment ?? '');
        setValue('paymentMethod', parsePaymentMethod(detail.paymentMethod), { shouldValidate: true });
        setValue('purpose', resolveOrderPurpose(detail), { shouldValidate: true });
        setValue('internalNote', '');
        setValue('paymentReceivedAmount', '');
        setValue('transactionRef', '');

        setShippingFee(parseMoneyAmount(detail.shippingFee));
        const promoCodeFromOrder = detail.promotions?.[0]?.code;
        setPromoCode(promoCodeFromOrder ? String(promoCodeFromOrder) : '');
        if (detail.customerId) {
          setOrderCustomerId(detail.customerId);
        }
        const prefilledCartLines = await buildPrefillCartLinesFromOrder(detail);
        if (cancelled) return;

        let nextCartLines = prefilledCartLines;
        if (isCloneMode) {
          const stockSync = await syncCartLinesWithLiveStock(prefilledCartLines);
          if (cancelled) return;
          nextCartLines = stockSync.nextLines;
          if (stockSync.hasOutOfStock) {
            showSnackbar({
              type: SnackbarType.WARNING,
              message: 'Có sản phẩm đã hết hàng trong đơn sao chép. Vui lòng thay thế hoặc xóa sản phẩm này.',
            });
          } else if (stockSync.hasInsufficientStock) {
            showSnackbar({
              type: SnackbarType.WARNING,
              message: 'Tồn kho đã thay đổi. Hệ thống đã tự điều chỉnh lại số lượng theo tồn hiện tại.',
            });
          } else if (stockSync.hasUnverifiedStock) {
            showSnackbar({
              type: SnackbarType.WARNING,
              message: 'Không xác thực được tồn kho một số sản phẩm. Hệ thống đã khóa thao tác số lượng cho các dòng này.',
            });
          }
        }
        setCartLines(nextCartLines);
        pendingVoucherSeedRef.current = mapOrderPromotionsToSelectedVouchers(detail.promotions);

        if (isCloneMode) setCloneSource({ id: detail.id, orderCode: detail.orderCode });
        if (isEditMode || isCloneMode) {
          setEditOrderDetail(detail);
          setEditBaselineSubtotal(parseMoneyAmount(detail.subtotal));
          setEditBaselineGrandTotal(parseMoneyAmount(detail.grandTotal));
          setEditBaselineShippingFee(parseMoneyAmount(detail.shippingFee));
          setEditBaselineDiscountTotal(parseMoneyAmount(detail.discountTotal));
        }
      } catch {
        if (!cancelled) {
          showSnackbar({ type: SnackbarType.ERROR, message: 'Không tải được chi tiết đơn hàng.' });
          navigate(ROUTE_PATH.ORDER, { replace: true });
        }
      } finally {
        if (!cancelled) setPrefillLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [buildPrefillCartLinesFromOrder, cloneFromId, isCloneMode, isEditMode, orderId, setValue, syncCartLinesWithLiveStock]);

  useEffect(() => {
    if (provinceCode === '') {
      setWards([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await getWardsByProvinceCode(Number(provinceCode));
        if (!cancelled) setWards(res.list ?? []);
      } catch {
        if (!cancelled) setWards([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [provinceCode]);

  const adminOrderVoucher = useAdminOrderVoucher({
    enabled: true,
    cartLines,
    customerId: orderCustomerId,
  });

  useEffect(() => {
    if (prefillLoading) return;
    const pending = pendingVoucherSeedRef.current;
    if (pending == null) return;
    pendingVoucherSeedRef.current = null;
    if (pending.length > 0) {
      adminOrderVoucher.seedSelectedVouchers(pending);
    } else {
      adminOrderVoucher.clearSelectedVouchers();
    }
  }, [adminOrderVoucher.clearSelectedVouchers, adminOrderVoucher.seedSelectedVouchers, prefillLoading]);

  useEffect(() => {
    const fingerprint = buildAdminOrderCartProductFingerprint(cartLines);
    const previous = lastCartProductFingerprintRef.current;
    if (previous === null) {
      lastCartProductFingerprintRef.current = fingerprint;
      return;
    }
    if (previous === fingerprint) return;
    lastCartProductFingerprintRef.current = fingerprint;
    if (previous !== '') {
      setPromoCode('');
    }
  }, [cartLines]);

  const quoteCouponCodes = useMemo(() => {
    const voucherCodes = adminOrderVoucher.selectedVoucherCodes.map((code) => code.trim()).filter(Boolean);
    if (voucherCodes.length > 0) return voucherCodes;
    const trimmedPromo = promoCode.trim();
    return trimmedPromo ? [trimmedPromo] : [];
  }, [adminOrderVoucher.selectedVoucherCodes, promoCode]);

  const quotePaymentMethod = useMemo(() => (paymentMethodRaw ? resolveAdminCreatePaymentMethod(paymentMethodRaw) : PaymentMethod.COD), [paymentMethodRaw]);
  const adminOrderV2Context = useMemo(() => {
    if (!isCreateOnlyMode) return null;
    return buildAdminOrderV2Context({
      cartLines,
      receiverPhone,
      firstName,
      provinceCode,
      provinceName,
      wardCode,
      wardName,
      addressLine: toAddressLine,
      couponCodes: quoteCouponCodes,
    });
  }, [cartLines, firstName, isCreateOnlyMode, provinceCode, provinceName, quoteCouponCodes, receiverPhone, toAddressLine, wardCode, wardName]);

  const legacyPricingQuote = useOrderPricingQuote({
    enabled: !isCreateOnlyMode,
    cartLines,
    couponCodes: quoteCouponCodes,
    paymentMethod: quotePaymentMethod,
    shippingFee,
  });
  const adminOrderPricingQuote = useAdminOrderV2Pricing({
    enabled: isCreateOnlyMode && Boolean(adminOrderV2Context && paymentMethodRaw),
    context: adminOrderV2Context,
    paymentMethod: quotePaymentMethod,
  });
  const adminOrderV2Quote = adminOrderPricingQuote.quote;
  const activePricingQuote = isCreateOnlyMode ? adminOrderV2Quote : legacyPricingQuote.quote;

  useEffect(() => {
    if (!adminOrderV2Quote || notifiedPricingEvaluationRef.current === adminOrderV2Quote.pricingEvaluationId) return;
    notifiedPricingEvaluationRef.current = adminOrderV2Quote.pricingEvaluationId;
    adminOrderVoucher.retainSelectedVoucherCodes(adminOrderV2Quote.couponCodes);
    const rejectedOutcome = adminOrderV2Quote.couponOutcomes.find((outcome) => outcome.status === 'REJECTED');
    if (!rejectedOutcome) return;
    const reasons = rejectedOutcome.reasonCodes?.join(', ') || 'Không còn đủ điều kiện áp dụng';
    showSnackbar({
      type: SnackbarType.WARNING,
      message: `Voucher ${rejectedOutcome.normalizedCouponCode} không áp dụng: ${reasons}.`,
    });
  }, [adminOrderV2Quote, adminOrderVoucher.retainSelectedVoucherCodes]);

  // Recompute shipping fee from selected service / GHN fee API.
  useEffect(() => {
    if (isEditMode || isCreateOnlyMode) return;

    const selectedService = findShippingService(shippingService, shippingServiceOptions);
    if (!selectedService) {
      setShippingFee(0);
      return;
    }
    setShippingFee(selectedService.fee);
    if (!shippingContext.isReady || cartLines.length === 0) {
      setShippingFee(0);
      return;
    }
    const serviceId = selectedService.serviceId ?? (Number.isFinite(Number(selectedService.value)) ? Number(selectedService.value) : undefined);

    let cancelled = false;
    void (async () => {
      try {
        const totalQuantity = cartLines.reduce((sum, l) => sum + l.quantity, 0);
        const weight = Math.max(DEFAULT_ITEM_DIMENSION.weight, totalQuantity * DEFAULT_ITEM_DIMENSION.weight);
        const insuranceValue = 0;
        const feeRes = await calculateGhnShippingFee({
          shopId: ORDER_SHIPPING_DEFAULT_SHOP_ID,
          serviceId,
          serviceTypeId: selectedService.serviceTypeId,
          fromWardIdV2: shippingContext.fromWard,
          fromAddressV2: shippingContext.fromAddress,
          toWardIdV2: shippingContext.toWard,
          toAddressV2: shippingContext.toAddress,
          ...DEFAULT_ITEM_DIMENSION,
          weight,
          insuranceValue,
          coupon: undefined,
          items: cartLines.map((l, i) => ({
            id: i + 1,
            name: l.productName || l.variation.skuCode || `Item ${i + 1}`,
            code: l.variation.skuCode || `SKU-${i + 1}`,
            quantity: l.quantity,
            convert_weight: DEFAULT_ITEM_DIMENSION.weight,
            calculate_weight: DEFAULT_ITEM_DIMENSION.weight,
            ...DEFAULT_ITEM_DIMENSION,
            image_ids: [],
          })),
        });
        if (cancelled) return;
        const nextFee = Number(feeRes?.total ?? feeRes?.totalFee ?? feeRes?.total_fee ?? feeRes?.fee ?? selectedService.fee);
        if (Number.isFinite(nextFee) && nextFee >= 0) setShippingFee(nextFee);
      } catch {
        /* keep fallback fee from selected service */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [adminOrderVoucher.selectedVoucherCodes, cartLines, isCreateOnlyMode, isEditMode, promoCode, shippingContext, shippingService, shippingServiceOptions]);

  const resetShippingServiceState = useCallback(() => {
    setShippingServiceOptions([]);
    setValue('shippingService', '', { shouldValidate: false });
    clearErrors('shippingService');
    setShippingFee(0);
    setShippingServiceFetchFailed(false);
    setShippingServiceLoading(false);
  }, [clearErrors, setValue]);

  const loadShippingServiceOptions = useCallback(async () => {
    if (isEditMode || isCreateOnlyMode) return;

    if (!shippingCarrier || !shippingContext.isReady) {
      resetShippingServiceState();
      return;
    }

    const requestId = ++shippingServiceRequestIdRef.current;
    setShippingServiceLoading(true);
    setShippingServiceFetchFailed(false);

    try {
      const mapped = await fetchOrderShippingServiceOptions({
        fromWardIdV2: shippingContext.fromWard,
        fromAddressV2: shippingContext.fromAddress,
        toWardIdV2: shippingContext.toWard,
        toAddressV2: shippingContext.toAddress,
        totalWeightGrams,
      });
      if (requestId !== shippingServiceRequestIdRef.current) return;

      setShippingServiceOptions(mapped);
      setShippingServiceFetchFailed(false);
      if (mapped.length <= 0) {
        setValue('shippingService', '', { shouldValidate: true });
      } else if (!mapped.some((o) => o.value === shippingService)) {
        setValue('shippingService', mapped[0]?.value ?? '', { shouldValidate: true });
        clearErrors('shippingService');
      } else {
        await trigger('shippingService');
      }
    } catch {
      if (requestId !== shippingServiceRequestIdRef.current) return;
      setShippingServiceOptions([]);
      setValue('shippingService', '', { shouldValidate: false });
      clearErrors('shippingService');
      setShippingFee(0);
      setShippingServiceFetchFailed(true);
    } finally {
      if (requestId === shippingServiceRequestIdRef.current) {
        setShippingServiceLoading(false);
      }
    }
  }, [clearErrors, isCreateOnlyMode, isEditMode, resetShippingServiceState, setValue, shippingCarrier, shippingContext, shippingService, totalWeightGrams, trigger]);

  const handleSyncShippingServices = useCallback(() => {
    void loadShippingServiceOptions();
  }, [loadShippingServiceOptions]);

  // Fetch shipping services (debounced) when carrier/address change.
  useEffect(() => {
    if (isEditMode || isCreateOnlyMode) return;

    if (!shippingCarrier || !shippingContext.isReady) {
      resetShippingServiceState();
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadShippingServiceOptions();
    }, ORDER_SHIPPING_ADDRESS_DEBOUNCE_MS);

    return () => {
      shippingServiceRequestIdRef.current += 1;
      window.clearTimeout(timeoutId);
    };
  }, [isCreateOnlyMode, isEditMode, loadShippingServiceOptions, resetShippingServiceState, shippingCarrier, shippingContext.isReady]);

  const markEditTotalsDirty = useCallback(() => {
    if (isEditMode) setEditTotalsDirty(true);
  }, [isEditMode]);

  const subtotal = useMemo(
    () => activePricingQuote?.subtotal ?? computeCartSubtotal(cartLines, { useOrderMerchandiseUnitPrice: isEditMode || isCloneMode }),
    [activePricingQuote, cartLines, isCloneMode, isEditMode],
  );
  const discountTotal = useMemo(() => {
    if (activePricingQuote) return activePricingQuote.discountTotal;
    if (!editOrderDetail || (!isEditMode && !isCloneMode)) return 0;
    return parseMoneyAmount(editOrderDetail.discountTotal);
  }, [activePricingQuote, editOrderDetail, isCloneMode, isEditMode]);
  const preDiscountTotal = subtotal + shippingFee;
  const orderSummarySubtotal = isEditMode && !editTotalsDirty && editBaselineSubtotal != null && !activePricingQuote ? editBaselineSubtotal : subtotal;
  const orderSummaryShippingFee = useMemo(() => {
    if (activePricingQuote) return activePricingQuote.shippingFee;
    if (isEditMode && !editTotalsDirty && editBaselineShippingFee != null) return editBaselineShippingFee;
    return shippingFee;
  }, [activePricingQuote, editBaselineShippingFee, editTotalsDirty, isEditMode, shippingFee]);
  const orderSummaryPreDiscountTotal = orderSummarySubtotal + orderSummaryShippingFee;
  const grandTotal = useMemo(() => {
    if (activePricingQuote) return activePricingQuote.grandTotal;
    const computed = Math.max(0, preDiscountTotal - discountTotal);
    if (isEditMode && editOrderDetail && !editTotalsDirty) {
      return parseMoneyAmount(editOrderDetail.grandTotal);
    }
    return computed;
  }, [activePricingQuote, discountTotal, editOrderDetail, editTotalsDirty, isEditMode, preDiscountTotal]);

  const handleAdminOrderPaymentLink = useCallback((created: ICreateOrderResponse) => {
    if (!created.paymentUrl) return;
    setCreatedPaymentLink({
      orderId: created.orderId,
      orderCode: created.orderCode,
      paymentUrl: created.paymentUrl,
      paymentLinkExpiresAt: created.paymentLinkExpiresAt ?? null,
    });
  }, []);

  const adminOrderV2Submit = useAdminOrderV2Submit({
    onPaymentLink: handleAdminOrderPaymentLink,
    onPriceChanged: (error) => {
      const conflictQuote = getAdminOrderConflictQuote(error);
      if (!conflictQuote || !adminOrderPricingQuote.acceptQuote(conflictQuote)) {
        adminOrderPricingQuote.refreshQuote();
      }
    },
  });

  const couponSelectionMatchesQuote = useMemo(() => {
    if (!adminOrderV2Quote) return false;
    const selectedCodes = quoteCouponCodes.map((code) => code.toUpperCase()).sort();
    const appliedCodes = adminOrderV2Quote.couponCodes.map((code) => code.toUpperCase()).sort();
    return selectedCodes.length === appliedCodes.length && selectedCodes.every((code, index) => code === appliedCodes[index]);
  }, [adminOrderV2Quote, quoteCouponCodes]);

  const createOrderPricingSummary = useMemo(
    () => ({
      subtotal: adminOrderV2Quote?.subtotal ?? null,
      shippingFee: adminOrderV2Quote?.shippingCustomerFee ?? null,
      discountTotal: adminOrderV2Quote?.discountTotal ?? null,
      grandTotal: adminOrderV2Quote?.grandTotal ?? null,
      shippingBreakdown: {
        baseFee: adminOrderV2Quote?.shippingBaseFee ?? null,
        discount: adminOrderV2Quote?.shippingDiscount ?? null,
        customerFee: adminOrderV2Quote?.shippingCustomerFee ?? null,
      },
      pricingReady: Boolean(adminOrderV2Quote && couponSelectionMatchesQuote && !adminOrderPricingQuote.isQuoting && !adminOrderPricingQuote.quoteError),
    }),
    [adminOrderPricingQuote.isQuoting, adminOrderPricingQuote.quoteError, adminOrderV2Quote, couponSelectionMatchesQuote],
  );
  // this money đã thanh toán
  const amountReceived = useMemo(() => {
    if (!editOrderDetail || (!isEditMode && !isCloneMode)) return null;
    const raw = editOrderDetail.amountReceived;
    if (raw == null || raw === '') return null;
    return parseMoneyAmount(raw);
  }, [editOrderDetail, isCloneMode, isEditMode]);
  const editTotalDelta = useMemo(() => (editBaselineGrandTotal == null ? 0 : grandTotal - editBaselineGrandTotal), [editBaselineGrandTotal, grandTotal]);

  const provinceOptions = useMemo(() => provinces.map((p) => ({ value: p.code, label: p.name })), [provinces]);
  const wardOptions = useMemo(() => wards.map((w) => ({ value: w.code, label: w.name })), [wards]);

  const pickCustomerFromPhoneLookup = useCallback(
    (item: IOrderCustomerByPhoneItem, normalized: string) => {
      const res = mapOrderCustomerByPhoneItemToLookup(item, normalized);
      setOrderCustomerId(item.id);
      setValue('crmSearch', normalized, { shouldValidate: true });
      setValue('receiverPhone', res.receiverPhone ?? normalized, { shouldValidate: true });
      const customerName = res.firstName?.trim() || res.fullName?.trim() || '';
      if (customerName) {
        setValue('firstName', customerName, { shouldValidate: true });
      }
      setValue('contactEmail', res.contactEmail ?? '');
      setValue('provinceCode', res.provinceCode ?? '', { shouldValidate: true });
      setProvinceName(res.provinceCode != null ? (res.provinceName ?? '') : '');
      setValue('wardCode', res.wardCode ?? '', { shouldValidate: true });
      setWardName(res.wardCode != null ? (res.wardName ?? '') : '');
      setValue('addressLine', res.addressLine ?? '', { shouldValidate: true });
    },
    [setValue],
  );

  const handleAddLine = useCallback(
    (payload: { variation: IOrderProductVariation; quantity: number; product: IOrderProductDetail }) => {
      const { variation, quantity, product } = payload;
      const lineCap = Math.max(0, variation.stockQuantity);
      const qty = Math.min(quantity, lineCap);
      markEditTotalsDirty();
      setCartLines((lines) => {
        const existing = lines.find((l) => l.variation.id === variation.id);
        if (existing) {
          const nextQty = Math.min(existing.quantity + qty, lineCap);
          return lines.map((l) => (l.variation.id === variation.id ? { ...l, quantity: nextQty } : l));
        }
        return [
          ...lines,
          {
            key: `${variation.id}-${Date.now()}`,
            productId: product.id,
            productName: product.name,
            image: product.image,
            variation,
            quantity: qty,
          },
        ];
      });
    },
    [markEditTotalsDirty],
  );

  const commitCartLineQuantity = useCallback(
    (lineKey: string, desiredQty: number) => {
      const row = cartLines.find((r) => r.key === lineKey);
      if (!row) return;
      const cap = Math.max(0, row.variation.stockQuantity);
      const next = cap <= 0 ? 0 : Math.max(1, Math.min(cap, Math.round(desiredQty)));
      const prev = row.quantity;
      if (next === prev) return;

      markEditTotalsDirty();
      setCartLines((rows) => rows.map((r) => (r.key === lineKey ? { ...r, quantity: next } : r)));
      if (next < prev) return;

      setCartQuantitySyncingLineKey(lineKey);
      void (async () => {
        let timeoutId: number | undefined;
        try {
          const timeoutPromise = new Promise<never>((_, rej) => {
            timeoutId = window.setTimeout(() => rej(new Error('timeout')), CART_LINE_SYNC_TIMEOUT_MS);
          });
          await Promise.race([syncManualOrderCartLineQuantity(row.variation.id, next), timeoutPromise]);
        } catch {
          setCartLines((rows) => rows.map((r) => (r.key === lineKey ? { ...r, quantity: prev } : r)));
          showSnackbar({ type: SnackbarType.ERROR, message: 'Kết nối gián đoạn' });
        } finally {
          if (timeoutId !== undefined) window.clearTimeout(timeoutId);
          setCartQuantitySyncingLineKey((k) => (k === lineKey ? null : k));
        }
      })();
    },
    [cartLines, markEditTotalsDirty],
  );

  const removeCartLineByKey = useCallback(
    (lineKey: string) => {
      markEditTotalsDirty();
      setCartLines((rows) => rows.filter((r) => r.key !== lineKey));
    },
    [markEditTotalsDirty],
  );

  const removeCartLinesByProductId = useCallback(
    (productId: string) => {
      markEditTotalsDirty();
      setCartLines((rows) => rows.filter((r) => r.productId !== productId));
    },
    [markEditTotalsDirty],
  );

  const handleProvinceChange = useCallback(
    (rawValue: string | number, onChange: (value: number | '') => void) => {
      const parsed = rawValue === '' ? NaN : Number(rawValue);
      const code = Number.isFinite(parsed) && parsed > 0 ? parsed : '';
      onChange(code);
      setProvinceName(code === '' ? '' : (provinces.find((p) => p.code === code)?.name ?? ''));
      setValue('wardCode', '');
      setWardName('');
    },
    [provinces, setValue],
  );

  const handleWardChange = useCallback(
    (rawValue: string | number, onChange: (value: number | '') => void) => {
      const parsed = rawValue === '' ? NaN : Number(rawValue);
      const code = Number.isFinite(parsed) && parsed > 0 ? parsed : '';
      onChange(code);
      setWardName(code === '' ? '' : (wards.find((w) => w.code === code)?.name ?? ''));
    },
    [wards],
  );

  const buildOrderBasePayload = useCallback(
    (v: CreateOrderFormValues, phone: string) => {
      const selectedProvinceName = provinceName || provinces.find((p) => p.code === v.provinceCode)?.name || '';
      const selectedWardName = wardName || wards.find((w) => w.code === v.wardCode)?.name || '';
      const selectedService = findShippingService(v.shippingService, shippingServiceOptions);
      return {
        items: buildOrderItemsFromCartLines(cartLines),
        receiverPhone: phone,
        provinceCode: Number(v.provinceCode),
        provinceName: selectedProvinceName,
        wardCode: Number(v.wardCode),
        wardName: selectedWardName,
        addressLine: v.addressLine.trim(),
        firstName: v.firstName.trim(),
        shippingMethod: ShippingMethod.STANDARD,
        shippingCarrier: mapShippingCarrierCode(v.shippingCarrier),
        carrierServiceId: parseCarrierServiceId(v.shippingService, shippingServiceOptions),
        estimatedDeliveryAt: selectedService?.estimatedDeliveryAt,
        shippingFee,
        pickupAddress: buildPickupAddress(v.warehouseId, warehouseOptions),
        promotionIds: buildPromotionIds(promoCode, adminOrderVoucher.selectedVoucherCodes),
        notePayment: v.notePayment.trim() || undefined,
        contactEmail: v.contactEmail.trim() || undefined,
        source: v.source as OrderSource,
        purpose: v.purpose as OrderPurpose,
      };
    },
    [adminOrderVoucher.selectedVoucherCodes, cartLines, promoCode, provinceName, provinces, shippingFee, shippingServiceOptions, wardName, wards, warehouseOptions],
  );

  const handleConfirmEditSave = useCallback(async () => {
    if (!orderId) return;
    setEditSaveDialogOpen(false);
    if (cartLines.length === 0) {
      showSnackbar({ type: SnackbarType.WARNING, message: 'Vui lòng thêm ít nhất một sản phẩm.' });
      return;
    }
    const v = getValues();
    const phone = normalizeVnPhone(v.receiverPhone);
    if (!phone) {
      showSnackbar({ type: SnackbarType.WARNING, message: 'Số điện thoại không hợp lệ.' });
      return;
    }
    setSubmitting(true);
    try {
      const mergedNote = [v.note?.trim(), v.internalNote?.trim()].filter(Boolean).join('\n\n');
      await updateOrder(orderId, { ...buildOrderBasePayload(v, phone), note: mergedNote || undefined });
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã cập nhật đơn hàng.' });
      navigate(ROUTE_PATH.ORDER);
    } catch (e) {
      showSnackbar({
        type: SnackbarType.ERROR,
        message: (e as { message?: string })?.message || 'Cập nhật đơn thất bại.',
      });
    } finally {
      setSubmitting(false);
    }
  }, [buildOrderBasePayload, cartLines, getValues, orderId]);

  const onSubmitOrder = useCallback(async () => {
    if (cartLines.length === 0) {
      showSnackbar({ type: SnackbarType.WARNING, message: 'Vui lòng thêm ít nhất một sản phẩm.' });
      return;
    }
    const v = getValues();
    const phone = normalizeVnPhone(v.receiverPhone);
    if (!phone) {
      showSnackbar({ type: SnackbarType.WARNING, message: 'Số điện thoại không hợp lệ.' });
      return;
    }
    if (isEditMode && orderId) {
      setEditSaveDialogOpen(true);
      return;
    }

    if (isCloneMode) {
      const stockSync = await syncCartLinesWithLiveStock(cartLines);
      setCartLines(stockSync.nextLines);
      if (stockSync.hasUnverifiedStock) {
        showSnackbar({
          type: SnackbarType.WARNING,
          message: 'Không thể xác thực tồn kho của một số sản phẩm. Vui lòng mở lại màn sao chép và thử lại.',
        });
        return;
      }
      if (stockSync.hasOutOfStock) {
        showSnackbar({
          type: SnackbarType.WARNING,
          message: 'Có sản phẩm đã hết hàng, không thể sao chép đơn. Vui lòng bỏ sản phẩm hết hàng.',
        });
        return;
      }
      if (stockSync.hasInsufficientStock) {
        showSnackbar({
          type: SnackbarType.WARNING,
          message: 'Tồn kho đã thay đổi, hệ thống đã điều chỉnh lại số lượng theo tồn hiện tại.',
        });
        return;
      }
    }

    if (isCreateOnlyMode) {
      const operationId = adminOrderPricingQuote.operationId;
      if (!adminOrderV2Context || !adminOrderV2Quote || !operationId || !v.source || !createOrderPricingSummary.pricingReady) {
        showSnackbar({ type: SnackbarType.WARNING, message: ADMIN_ORDER_V2_MESSAGE.QUOTE_REQUIRED });
        return;
      }
      const paymentMethod = resolveAdminCreatePaymentMethod(v.paymentMethod);
      const request = buildAdminOrderV2CreateRequest({
        values: v,
        context: adminOrderV2Context,
        quote: adminOrderV2Quote,
        operationId,
        paymentMethod,
        source: v.source,
        ...(ONLINE_PAYMENT_METHODS.has(paymentMethod) ? { returnUrl: buildCustomerPaymentReturnUrl() } : {}),
      });
      await adminOrderV2Submit.submit(request);
      return;
    }

    setSubmitting(true);
    try {
      const paymentMethod = resolveAdminCreatePaymentMethod(v.paymentMethod);
      const isOnlinePayment = ONLINE_PAYMENT_METHODS.has(paymentMethod);
      const created = await createOrder({
        ...buildOrderBasePayload(v, phone),
        orderKind: OrderKind.NORMAL,
        paymentMethod,
        ...(isOnlinePayment ? { returnUrl: buildCustomerPaymentReturnUrl() } : {}),
        note: v.note.trim() || undefined,
      });
      if (created.error) {
        showSnackbar({ type: SnackbarType.WARNING, message: created.error });
      }
      showSnackbar({
        type: SnackbarType.SUCCESS,
        message: isCloneMode ? 'Đã sao chép đơn hàng.' : 'Đã tạo đơn hàng.',
      });
      if (created.paymentUrl) {
        setCreatedPaymentLink({
          orderId: created.orderId,
          orderCode: created.orderCode,
          paymentUrl: created.paymentUrl,
          paymentLinkExpiresAt: created.paymentLinkExpiresAt ?? null,
        });
        return;
      }
      // code này được thêm vởi quân phạm
      navigate(ROUTE_PATH.ORDER);
    } catch (e) {
      showSnackbar({
        type: SnackbarType.ERROR,
        message: (e as { message?: string })?.message || 'Tạo đơn thất bại.',
      });
    } finally {
      setSubmitting(false);
    }
  }, [
    adminOrderV2Context,
    adminOrderV2Quote,
    adminOrderV2Submit,
    buildOrderBasePayload,
    cartLines,
    createOrderPricingSummary.pricingReady,
    getValues,
    isCloneMode,
    isCreateOnlyMode,
    isEditMode,
    orderId,
    adminOrderPricingQuote.operationId,
    syncCartLinesWithLiveStock,
  ]);

  const handleCreateOrder = useCallback(() => {
    if (isCreateOnlyMode && adminOrderV2Submit.hasUncertainAttempt) {
      void adminOrderV2Submit.retryPending();
      return;
    }
    void submitWithRHF(onSubmitOrder)();
  }, [adminOrderV2Submit, isCreateOnlyMode, onSubmitOrder, submitWithRHF]);

  // code này được thêm vởi quân phạm
  const handleCloseCreatedPaymentLink = useCallback(() => {
    const orderIdToOpen = createdPaymentLink?.orderId;
    setCreatedPaymentLink(null);
    navigate(orderIdToOpen ? getOrderDetailPath(orderIdToOpen) : ROUTE_PATH.ORDER);
  }, [createdPaymentLink?.orderId, navigate]);
  // code này được thêm vởi quân phạm

  const handleCloneFromEdit = useCallback(() => {
    if (!orderId) return;
    if (editOrderDetail && shouldPromptCancelOriginalWhenCloningOrder(editOrderDetail.status)) {
      setCloneConfirmDialogOpen(true);
      return;
    }
    navigate(getOrderClonePath(orderId));
  }, [editOrderDetail, navigate, orderId]);

  const handleCloseCloneConfirmDialog = useCallback(() => {
    if (!cloneConfirmSubmitting) setCloneConfirmDialogOpen(false);
  }, [cloneConfirmSubmitting]);

  const handleConfirmCloneFromEdit = useCallback(
    async (shouldCancelOriginal: boolean) => {
      if (!orderId) return;
      setCloneConfirmSubmitting(true);
      try {
        if (shouldCancelOriginal) {
          await cancelOrder(orderId, {
            cancellationReason: OrderCancellationReason.CHANGE_MIND,
            note: 'Đã sao chép sang đơn mới',
          });
        }
        setCloneConfirmDialogOpen(false);
        navigate(getOrderClonePath(orderId));
      } catch (e) {
        showSnackbar({
          type: SnackbarType.ERROR,
          message: (e as { message?: string })?.message || 'Không thể hủy đơn gốc trước khi sao chép.',
        });
      } finally {
        setCloneConfirmSubmitting(false);
      }
    },
    [orderId],
  );

  const handleConfirmCancelOrder = useCallback(
    async (payload: { reason: string }) => {
      if (!orderId) return;
      if (!editOrderDetail || !isOrderCancellableStatus(editOrderDetail.status)) {
        showSnackbar({
          type: SnackbarType.WARNING,
          message: ORDER_CANCEL_BLOCKED_STATUS_MESSAGE,
        });
        setCancelOrderDialogOpen(false);
        return;
      }
      setCancelOrderSubmitting(true);
      try {
        const note = payload.reason.trim();
        await cancelOrder(orderId, {
          cancellationReason: OrderCancellationReason.OTHER,
          ...(note ? { note } : {}),
        });
        setCancelOrderDialogOpen(false);
        showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã hủy đơn hàng.' });
        navigate(ROUTE_PATH.ORDER);
      } catch (e) {
        showSnackbar({
          type: SnackbarType.ERROR,
          message: (e as { message?: string })?.message || 'Không hủy được đơn.',
        });
      } finally {
        setCancelOrderSubmitting(false);
      }
    },
    [editOrderDetail, orderId],
  );

  const handleSelectProductFromEditPicker = useCallback((ctx: CreateOrderCatalogPickContext) => {
    setVariantProduct(ctx);
  }, []);

  const lineCountLabel = `${cartLines.reduce((s, l) => s + l.quantity, 0)} món • ${new Set(cartLines.map((l) => l.variation.skuCode)).size} SKU`;
  const selectedProductIds = useMemo(() => Array.from(new Set(cartLines.map((l) => l.productId))), [cartLines]);

  const paymentMethodFieldOptions = isEditMode || isCloneMode ? PAYMENT_METHOD_OPTIONS_EDIT : PAYMENT_METHOD_OPTIONS;
  const hasCloneStockIssue = useMemo(() => {
    if (!isCloneMode) return false;
    return cartLines.some((line) => {
      if (line.variation.stockQuantity === CLONED_LINE_STOCK_PLACEHOLDER) return true;
      const lineCap = Math.max(0, Number(line.variation.stockQuantity));
      return lineCap <= 0 || line.quantity > lineCap;
    });
  }, [cartLines, isCloneMode]);
  // Không chặn theo `isValid` để nút "Lưu thay đổi" luôn hiện rõ khi user chỉnh địa chỉ.
  // RHF (`submitWithRHF`) tự validate khi click; nếu invalid sẽ highlight field lỗi và không submit.
  const editPrimaryDisabled = submitting || prefillLoading || cartLines.length === 0;
  const clonePrimaryDisabled = submitting || prefillLoading || !isValid || cartLines.length === 0 || hasCloneStockIssue;

  const createOrderVoucher = useMemo(
    () => ({
      selectedVouchers: adminOrderVoucher.selectedVouchers,
      checkoutContext: isCreateOnlyMode ? null : adminOrderVoucher.promotionVoucherCheckoutContext,
      adminOrderContext: isCreateOnlyMode ? adminOrderV2Context : null,
      disabled: isCreateOnlyMode ? !adminOrderV2Context : cartLines.length === 0,
      onToggleVoucher: adminOrderVoucher.handleVoucherToggle,
      onApplyValidatedVoucher: adminOrderVoucher.handleVoucherApply,
    }),
    [adminOrderV2Context, adminOrderVoucher, cartLines.length, isCreateOnlyMode],
  );

  return {
    navigate,
    isEditMode,
    orderId,
    prefillLoading,
    cloneSource,
    editOrderDetail,
    editBaselineSubtotal,
    editBaselineGrandTotal,
    editBaselineShippingFee,
    editBaselineDiscountTotal,
    editSaveDialogOpen,
    setEditSaveDialogOpen,
    cancelOrderDialogOpen,
    setCancelOrderDialogOpen,
    cancelOrderSubmitting,
    cloneConfirmDialogOpen,
    cloneConfirmSubmitting,
    editProductPickerOpen,
    setEditProductPickerOpen,
    // code này được thêm vởi quân phạm
    createdPaymentLink,
    // code này được thêm vởi quân phạm
    productQuery,
    setProductQuery,
    catalog,
    catalogLoading,
    variantProduct,
    setVariantProduct,
    cartLines,
    cartQuantitySyncingLineKey,
    control,
    isValid,
    promoCode,
    setPromoCode,
    shippingFee: orderSummaryShippingFee,
    submitting: isCreateOnlyMode ? adminOrderV2Submit.submitting : submitting,
    pickCustomerFromPhoneLookup,
    handleAddLine,
    commitCartLineQuantity,
    removeCartLineByKey,
    removeCartLinesByProductId,
    provinceOptions,
    wardOptions,
    shippingCarrierOptions: SHIPPING_CARRIER_OPTIONS,
    warehouseOptions,
    shippingServiceOptions,
    shippingServiceLoading,
    shippingServiceFetchFailed,
    handleSyncShippingServices,
    handleProvinceChange,
    handleWardChange,
    handleConfirmEditSave,
    handleCreateOrder,
    // code này được thêm vởi quân phạm
    handleCloseCreatedPaymentLink,
    // code này được thêm vởi quân phạm
    handleCloneFromEdit,
    handleCloseCloneConfirmDialog,
    handleConfirmCloneFromEdit,
    handleConfirmCancelOrder,
    handleSelectProductFromEditPicker,
    lineCountLabel,
    selectedProductIds,
    paymentMethodFieldOptions,
    editPrimaryDisabled,
    clonePrimaryDisabled,
    subtotal: orderSummarySubtotal,
    discountTotal,
    preDiscountTotal: orderSummaryPreDiscountTotal,
    grandTotal,
    createOrderPricingSummary,
    pricingPending: adminOrderPricingQuote.isQuoting,
    pricingError: adminOrderPricingQuote.quoteError,
    createOrderVoucher,
    amountReceived,
    editTotalDelta,
    formatVnd,
  };
}
