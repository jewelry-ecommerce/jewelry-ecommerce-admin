// File này dùng để chọn hàng trả/đổi và tạo phiếu bằng hợp đồng OMS đã được release.
// Kiến thức: tắt quote thôi chưa đủ; phí ship, loại phiếu, nút tạo và quyền API phải cùng quay về luồng cũ.
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ArrowBack } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import useSWRInfinite from 'swr/infinite';
import { calculateGhnShippingFee } from '../../../apis/shipment';
import { ADMIN_ORDER_RETURN_EXCHANGE_V2_ENABLED } from '../../../common/constant/order/order-return-release.constants';
import { formatCurrency } from '../../../common/utils/number.utils';
import { ORDER_SHIPPING_DEFAULT_SHOP_ID } from '../../../common/utils/order/order-shipping-service.utils';
import { OrderReturnReason, OrderReturnType, PaymentStatus, createOrderReturn, getOrderDetail, getOrderProducts } from '../../../apis/order';
import { commitAdminOrderReturn } from '../../../apis/order/order.api';
import type { IAdminOrderReturnQuoteRequest } from '../../../apis/order/order.interface';
import { PaymentMethod, ShippingMethod } from '../../../apis/order/order.enum';
import { CustomButton } from '../../../components/button';
import { orderReturnsButtonPermission } from '../order-permission.constants';
import { PageStateComponent } from '../../../components/empty';
import { ORDER_RETURN_LIST_SWR_KEY } from '../../../hooks/return-exchanges/use-return-exchanges-list.hook';
import { useOrderShippingServiceOptions } from '../../../hooks/use-order-shipping-service-options.hook';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import {
  EXCHANGE_CATALOG_PAGE_SIZE,
  RETURN_EXCHANGE_DEFAULT_SHIPPING_ADDRESS,
  RETURN_REASON_OPTIONS,
  calculatePriceDiff,
  clampQty,
  deriveReturnItems,
  getRequestTypeOptions,
  mapOrderToReturnExchangeShippingAddress,
  mapOrderToReturnExchangeSummary,
  validateExchangeItems,
  validateReturnItems,
} from '../../../common/constant/order/order.constants';
import { type ExchangeItem, type ReturnExchangeFlowStep, type ReturnExchangeOrderSummary, type ReturnExchangeShippingServiceOption, type ReturnableOrderLine } from '../order.types';
import { type NormalizedOrderShippingServiceOption } from '../../../common/utils/order/order-shipping-service.utils';
import { ReturnExchangeStepConfirmPart } from './parts/returns-exchanges-step-confirm.part';
import { useAdminOrderReturnQuote } from './use-admin-order-return-quote.hook';
import { mapWarehouseOptionToPickupAddress, useReturnExchangeWarehouseOptions } from './use-return-exchange-warehouse-options.hook';
import { getReturnSafeError, isReturnQuoteStale } from './order-return-error.util';
import { ReturnExchangeStepExchangePart } from './parts/returns-exchanges-step-exchange.part';
import { ReturnExchangeStepReturnPart } from './parts/returns-exchanges-step-return.part';
import { ReturnExchangeStepperPart } from './parts/returns-exchanges-stepper.part';
import { CreateOrderVariantDialog } from '../create-order/create-order-variant-dialog';
import {
  DEFAULT_ITEM_DIMENSION,
  INITIAL_PICKUP_ADDRESS,
  sxBackNav,
  sxCardFooterWrap,
  sxFooter,
  sxFooterBtn,
  sxHeaderBackRow,
  sxHeaderTitleRow,
  sxLoadingHint,
  sxMainColumn,
  sxPage,
  sxStepError,
  sxStepScrollRegion,
  sxTitle,
} from './returns-exchanges-page.styles';

// Form này giữ cả hai luồng; cờ release tắt luồng mới để Production không gọi API chưa có trên OMS.
const ReturnExchangePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { mutate: mutateSwr } = useSWRConfig();
  const orderId = searchParams.get('orderId')?.trim() || '';
  const { showSnackbar } = useSnackbar();
  const [step, setStep] = useState<ReturnExchangeFlowStep>(1);
  const [orderSummary, setOrderSummary] = useState<ReturnExchangeOrderSummary | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [selectedReturnQtyByLineId, setSelectedReturnQtyByLineId] = useState<Record<string, number>>({});
  const [exchangeItems, setExchangeItems] = useState<ExchangeItem[]>([]);
  const [searchExchangeKeyword, setSearchExchangeKeyword] = useState('');
  const [exchangeVariantDialogProduct, setExchangeVariantDialogProduct] = useState<{
    id: string;
    name: string;
    image: string;
  } | null>(null);
  const [returnReason, setReturnReason] = useState<OrderReturnReason | ''>('');
  const [requestType, setRequestType] = useState<OrderReturnType | ''>('');
  const [internalNote, setInternalNote] = useState('');
  const [stepError, setStepError] = useState('');
  const [submitCreating, setSubmitCreating] = useState(false);
  const [confirmFieldErrors, setConfirmFieldErrors] = useState<{
    returnReason?: string;
    requestType?: string;
    evidenceImageUrls?: string;
    bankAccountHolder?: string;
    bankAccountNumber?: string;
    bankName?: string;
    bankBranch?: string;
  }>({});
  const [bankAccountHolder, setBankAccountHolder] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [evidenceImageUrls, setEvidenceImageUrls] = useState<string[]>([]);
  const [shipperNote, setShipperNote] = useState('');
  const [shippingCarrier] = useState('GHN');
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>(ShippingMethod.STANDARD);
  const [carrierServiceId, setCarrierServiceId] = useState(53321);
  const [pickupAddress, setPickupAddress] = useState(INITIAL_PICKUP_ADDRESS);
  /** Kho của đơn gốc — ưu tiên làm kho nhận hàng trả nếu OMS còn trả kho đó. */
  const [originalOrderWarehouseId, setOriginalOrderWarehouseId] = useState<string | null>(null);
  const [shippingAddress, setShippingAddress] = useState(RETURN_EXCHANGE_DEFAULT_SHIPPING_ADDRESS);
  const [returnShippingFee, setReturnShippingFee] = useState(0);
  const [returnShippingFeeLoading, setReturnShippingFeeLoading] = useState(false);
  const canLoadShippingServices =
    Boolean(shippingCarrier) && pickupAddress.wardCode > 0 && Boolean(pickupAddress.addressLine.trim()) && shippingAddress.wardCode > 0 && Boolean(shippingAddress.addressLine.trim());
  const { options: normalizedShippingServiceOptions, isLoading: shippingServiceLoading } = useOrderShippingServiceOptions({
    enabled: canLoadShippingServices,
    fromWardCode: pickupAddress.wardCode,
    fromAddress: pickupAddress.addressLine,
    toWardCode: shippingAddress.wardCode,
    toAddress: shippingAddress.addressLine,
  });
  const shippingServiceOptions: ReturnExchangeShippingServiceOption[] = normalizedShippingServiceOptions.map((option: NormalizedOrderShippingServiceOption) => ({
    ...option,
    method: ShippingMethod.STANDARD,
  }));
  const warehouseOptions = useReturnExchangeWarehouseOptions(setPickupAddress, originalOrderWarehouseId);

  const closeCreatePage = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('orderId');
        return next;
      },
      { replace: true },
    );
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!orderId) {
        setOrderSummary(null);
        return;
      }

      setLoadingOrder(true);
      try {
        const orderDetail = await getOrderDetail(orderId);
        if (cancelled) return;
        setOrderSummary(mapOrderToReturnExchangeSummary(orderDetail));
        setShippingAddress(mapOrderToReturnExchangeShippingAddress(orderDetail));
        setOriginalOrderWarehouseId(orderDetail.pickupAddressSnapshot?.warehouseId?.trim() || null);
      } catch (error) {
        if (cancelled) return;
        setOrderSummary(null);
      } finally {
        if (!cancelled) {
          setLoadingOrder(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  useEffect(() => {
    if (!shippingServiceOptions.length) return;
    if (!shippingServiceOptions.some((option) => option.value === String(carrierServiceId))) {
      const firstServiceValue = Number(shippingServiceOptions[0]?.value ?? 0);
      if (Number.isFinite(firstServiceValue) && firstServiceValue > 0) {
        setCarrierServiceId(firstServiceValue);
      }
      setShippingMethod(shippingServiceOptions[0]?.method ?? ShippingMethod.STANDARD);
    }
  }, [carrierServiceId, shippingServiceOptions]);

  const orderLines = orderSummary?.lines ?? [];

  const returnItems = useMemo(() => deriveReturnItems(orderLines, selectedReturnQtyByLineId), [orderLines, selectedReturnQtyByLineId]);

  const exchangeCatalogSearchKeyword = searchExchangeKeyword.trim();
  const {
    data: exchangeCatalogPages,
    size: exchangeCatalogPageCount,
    setSize: setExchangeCatalogPageCount,
    isValidating: isExchangeCatalogValidating,
  } = useSWRInfinite(
    (pageIndex, previousPageData) => {
      if (step !== 2) return null;
      if (previousPageData) {
        const loadedCount = pageIndex * EXCHANGE_CATALOG_PAGE_SIZE;
        const hasNext = previousPageData.list.length >= EXCHANGE_CATALOG_PAGE_SIZE && loadedCount < previousPageData.total;
        if (!hasNext) return null;
      }
      return ['return-exchange-catalog', exchangeCatalogSearchKeyword, pageIndex + 1] as const;
    },
    async ([, keyword, page]) =>
      await getOrderProducts({
        page,
        take: EXCHANGE_CATALOG_PAGE_SIZE,
        search: keyword || undefined,
      }),
    {
      revalidateOnFocus: false,
      revalidateFirstPage: false,
    },
  );

  const exchangeCatalog = useMemo<ReturnableOrderLine[]>(
    () =>
      (exchangeCatalogPages ?? [])
        .flatMap((page) => page.list)
        .filter((item) => (item.totalSellableStock ?? 1) > 0 && Boolean(item.cheapestVariationId))
        .map((item) => ({
          lineId: item.id,
          productId: item.id,
          productName: item.name?.trim() || 'Sản phẩm',
          sku: item.skuCode?.trim() || item.cheapestVariationId,
          variantId: item.cheapestVariationId,
          imageUrl: item.image || '',
          quantityPurchased: Math.max(item.totalSellableStock ?? 1, 1),
          priceSnapshot: Number(item.customerDisplayPrice?.sellingPriceAfterTaxMinor ?? item.minSellingPriceAfterTaxMinor ?? 0) || 0,
        })),
    [exchangeCatalogPages],
  );

  const filteredCatalog = useMemo(() => {
    const selectedVariantIds = new Set(exchangeItems.map((item) => item.variantId));
    return exchangeCatalog.filter((item) => !selectedVariantIds.has(item.variantId));
  }, [exchangeCatalog, exchangeItems]);

  const hasMoreExchangeCatalog = useMemo(() => {
    if (!exchangeCatalogPages?.length) return false;
    const lastPage = exchangeCatalogPages[exchangeCatalogPages.length - 1];
    if (!lastPage) return false;
    const loadedCount = exchangeCatalogPages.reduce((sum, page) => sum + page.list.length, 0);
    return lastPage.list.length >= EXCHANGE_CATALOG_PAGE_SIZE && loadedCount < lastPage.total;
  }, [exchangeCatalogPages]);

  const isLoadingMoreExchangeCatalog = Boolean(isExchangeCatalogValidating && exchangeCatalogPages != null && exchangeCatalogPages.length < exchangeCatalogPageCount);

  const handleLoadMoreExchangeCatalog = useCallback(() => {
    if (!hasMoreExchangeCatalog || isLoadingMoreExchangeCatalog) return;
    void setExchangeCatalogPageCount((current) => current + 1);
  }, [hasMoreExchangeCatalog, isLoadingMoreExchangeCatalog, setExchangeCatalogPageCount]);

  const priceDiff = useMemo(() => calculatePriceDiff(returnItems, exchangeItems), [exchangeItems, returnItems]);
  const priceDiffLabel = `${priceDiff >= 0 ? '' : '-'}${formatCurrency(Math.abs(priceDiff))}₫`;
  const headerOrderCode = orderSummary?.orderCode?.trim() ?? '';
  const hasExchangeItems = exchangeItems.length > 0;
  const requestTypeOptions = useMemo(() => getRequestTypeOptions(hasExchangeItems), [hasExchangeItems]);
  const canCalculateReturnShippingFee =
    !ADMIN_ORDER_RETURN_EXCHANGE_V2_ENABLED &&
    carrierServiceId > 0 &&
    pickupAddress.wardCode > 0 &&
    Boolean(pickupAddress.addressLine.trim()) &&
    shippingAddress.wardCode > 0 &&
    Boolean(shippingAddress.addressLine.trim()) &&
    returnItems.length > 0;
  const quoteRequest = useMemo<IAdminOrderReturnQuoteRequest | null>(() => {
    // Sau khi tắt luồng mới, truyền null để hook vẫn chạy đúng thứ tự React nhưng không gửi request quote.
    if (!ADMIN_ORDER_RETURN_EXCHANGE_V2_ENABLED) return null;
    if (step !== 3 || !orderId || !returnReason || !returnItems.length || !exchangeItems.length) return null;
    if (!pickupAddress.wardCode || !shippingAddress.wardCode || !carrierServiceId) return null;
    return {
      orderId,
      reason: returnReason,
      returnItems: returnItems.map((line) => ({ orderItemId: line.lineId, quantity: line.quantity })),
      exchangeItems: exchangeItems.map((line) => ({ variationId: line.variantId, quantity: line.quantity })),
      pickupAddress,
      shippingAddress,
      shippingMethod,
      shippingCarrier,
      carrierServiceId,
    };
  }, [step, orderId, returnReason, returnItems, exchangeItems, pickupAddress, shippingAddress, shippingMethod, shippingCarrier, carrierServiceId]);
  const { quote, isLoading: quoteLoading, hasError: quoteError, refresh: refreshQuote } = useAdminOrderReturnQuote(quoteRequest);
  const shouldShowBankFields = requestType === OrderReturnType.REFUND && orderSummary?.paymentMethod === PaymentMethod.COD && orderSummary?.paymentStatus === PaymentStatus.PAID;

  useEffect(() => {
    setRequestType(ADMIN_ORDER_RETURN_EXCHANGE_V2_ENABLED || hasExchangeItems ? OrderReturnType.EXCHANGE : OrderReturnType.REFUND);
  }, [hasExchangeItems]);

  const selectReturnLine = (line: ReturnableOrderLine, checked: boolean) => {
    setStepError('');
    setSelectedReturnQtyByLineId((prev) => ({
      ...prev,
      [line.lineId]: checked ? Math.max(prev[line.lineId] ?? 1, 1) : 0,
    }));
  };

  const updateReturnQty = (line: ReturnableOrderLine, next: number) => {
    setStepError('');
    const safe = Math.min(line.quantityPurchased, clampQty(next));
    setSelectedReturnQtyByLineId((prev) => ({ ...prev, [line.lineId]: safe }));
  };

  const addExchangeItem = (line: ReturnableOrderLine) => {
    setStepError('');
    setExchangeVariantDialogProduct({
      id: line.productId,
      name: line.productName,
      image: line.imageUrl,
    });
  };

  const removeExchangeItem: (index: number) => void = (index) => {
    setStepError('');
    setExchangeItems((prev) => prev.filter((_, i) => i !== index));
  };

  const isOrderReturnReason = (value: string): value is OrderReturnReason => Object.values(OrderReturnReason).some((item) => item === value);

  const isOrderReturnType = (value: string): value is OrderReturnType => Object.values(OrderReturnType).some((item) => item === value);

  const handleChangeReturnReason = (value: string) => {
    setReturnReason(isOrderReturnReason(value) ? value : '');
    setConfirmFieldErrors((prev) => ({ ...prev, returnReason: '' }));
  };

  const handleChangeRequestType = (value: string) => {
    setRequestType(isOrderReturnType(value) ? value : '');
    setConfirmFieldErrors((prev) => ({
      ...prev,
      requestType: '',
      bankAccountHolder: '',
      bankAccountNumber: '',
      bankName: '',
      bankBranch: '',
    }));
  };

  const handleChangeEvidenceImageUrls = (nextUrls: string[]) => {
    setEvidenceImageUrls(nextUrls);
    if (nextUrls.length > 0) {
      setConfirmFieldErrors((prev) => ({ ...prev, evidenceImageUrls: '' }));
    }
  };

  const handleChangeBankAccountHolder = (value: string) => {
    setBankAccountHolder(value);
    setConfirmFieldErrors((prev) => ({ ...prev, bankAccountHolder: '' }));
  };

  const handleChangeBankAccountNumber = (value: string) => {
    setBankAccountNumber(value);
    setConfirmFieldErrors((prev) => ({ ...prev, bankAccountNumber: '' }));
  };

  const handleChangeBankName = (value: string) => {
    setBankName(value);
    setConfirmFieldErrors((prev) => ({ ...prev, bankName: '' }));
  };

  const handleChangeBankBranch = (value: string) => {
    setBankBranch(value);
    setConfirmFieldErrors((prev) => ({ ...prev, bankBranch: '' }));
  };

  const handleChangePickupWarehouseId = (warehouseId: string) => {
    const selectedWarehouse = warehouseOptions.find((warehouse) => warehouse.value === warehouseId);
    if (!selectedWarehouse) {
      setPickupAddress((prev) => ({ ...prev, warehouseId }));
      return;
    }

    setPickupAddress(mapWarehouseOptionToPickupAddress(selectedWarehouse));
  };

  // Bây giờ tính phí thu hồi theo luồng v1.0.29; cờ release chặn việc này khi bật lại quote mới.
  useEffect(() => {
    if (!canCalculateReturnShippingFee) {
      setReturnShippingFee(0);
      setReturnShippingFeeLoading(false);
      return;
    }

    let cancelled = false;
    setReturnShippingFeeLoading(true);

    void (async () => {
      try {
        const totalQuantity = returnItems.reduce((sum, item) => sum + item.quantity, 0);
        const insuranceValue = 0;
        const weight = Math.max(DEFAULT_ITEM_DIMENSION.weight, totalQuantity * DEFAULT_ITEM_DIMENSION.weight);
        const feeResponse = await calculateGhnShippingFee({
          shopId: ORDER_SHIPPING_DEFAULT_SHOP_ID,
          serviceId: carrierServiceId,
          fromWardIdV2: pickupAddress.wardCode,
          fromAddressV2: pickupAddress.addressLine.trim(),
          toWardIdV2: shippingAddress.wardCode,
          toAddressV2: shippingAddress.addressLine.trim(),
          ...DEFAULT_ITEM_DIMENSION,
          weight,
          insuranceValue,
          items: returnItems.map((item, index) => ({
            id: index + 1,
            name: item.productName || `Item ${index + 1}`,
            code: item.sku || `SKU-${index + 1}`,
            quantity: item.quantity,
            convert_weight: DEFAULT_ITEM_DIMENSION.weight,
            calculate_weight: DEFAULT_ITEM_DIMENSION.weight,
            ...DEFAULT_ITEM_DIMENSION,
            image_ids: [],
          })),
        });
        if (cancelled) return;

        const responseData = feeResponse as
          | {
              service_fee?: unknown;
              serviceFee?: unknown;
              total?: unknown;
              totalFee?: unknown;
              total_fee?: unknown;
              fee?: unknown;
            }
          | undefined;
        const nestedFee = typeof responseData?.fee === 'object' && responseData.fee !== null ? (responseData.fee as { service_fee?: unknown; serviceFee?: unknown }) : undefined;

        const rawReturnShippingFee =
          responseData?.service_fee ??
          responseData?.serviceFee ??
          nestedFee?.service_fee ??
          nestedFee?.serviceFee ??
          responseData?.total ??
          responseData?.totalFee ??
          responseData?.total_fee ??
          (typeof responseData?.fee === 'number' ? responseData.fee : 0);
        const parsedReturnShippingFee = Number(rawReturnShippingFee ?? 0);

        setReturnShippingFee(Number.isFinite(parsedReturnShippingFee) && parsedReturnShippingFee > 0 ? parsedReturnShippingFee : 0);
      } catch {
        if (cancelled) return;
        setReturnShippingFee(0);
      } finally {
        if (!cancelled) {
          setReturnShippingFeeLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [canCalculateReturnShippingFee, carrierServiceId, pickupAddress.addressLine, pickupAddress.wardCode, returnItems, shippingAddress.addressLine, shippingAddress.wardCode]);

  const goNext = async () => {
    if (!orderSummary) {
      setStepError('Không có dữ liệu đơn hàng để tạo yêu cầu đổi trả.');
      return;
    }

    if (step === 1) {
      const errors = validateReturnItems(returnItems, orderLines);
      if (errors.length > 0) {
        setStepError(errors[0] ?? 'Danh sách sản phẩm trả chưa hợp lệ.');
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (ADMIN_ORDER_RETURN_EXCHANGE_V2_ENABLED && exchangeItems.length === 0) {
        setStepError('Vui lòng chọn ít nhất một sản phẩm đổi.');
        return;
      }
      const errors = validateExchangeItems(exchangeItems, returnItems);
      if (errors.length > 0) {
        setStepError(errors[0] ?? 'Danh sách sản phẩm đổi chưa hợp lệ.');
        return;
      }
      setRequestType(ADMIN_ORDER_RETURN_EXCHANGE_V2_ENABLED || exchangeItems.length > 0 ? OrderReturnType.EXCHANGE : OrderReturnType.REFUND);
      setStep(3);
      return;
    }

    if (!returnReason || !requestType || evidenceImageUrls.length === 0) {
      setConfirmFieldErrors({
        returnReason: returnReason ? '' : 'Vui lòng chọn lý do đổi/trả hàng.',
        requestType: requestType ? '' : 'Vui lòng chọn loại yêu cầu.',
        evidenceImageUrls: evidenceImageUrls.length > 0 ? '' : 'Vui lòng tải lên ít nhất 01 ảnh bằng chứng.',
        bankAccountHolder: '',
        bankAccountNumber: '',
        bankName: '',
        bankBranch: '',
      });
      return;
    }

    if (exchangeItems.length > 0 && requestType === OrderReturnType.REFUND) {
      setConfirmFieldErrors((prev) => ({
        ...prev,
        requestType: 'Không thể chọn hoàn tiền khi đã chọn sản phẩm đổi.',
      }));
      return;
    }

    if (shouldShowBankFields) {
      const nextErrors = {
        bankAccountHolder: bankAccountHolder.trim() ? '' : 'Vui lòng nhập tên chủ tài khoản.',
        bankAccountNumber: bankAccountNumber.trim() ? '' : 'Vui lòng nhập số tài khoản ngân hàng.',
        bankName: bankName.trim() ? '' : 'Vui lòng nhập tên ngân hàng.',
        bankBranch: bankBranch.trim() ? '' : 'Vui lòng nhập chi nhánh ngân hàng.',
      };
      if (Object.values(nextErrors).some(Boolean)) {
        setConfirmFieldErrors((prev) => ({ ...prev, ...nextErrors }));
        return;
      }
    }

    const exchangeValidationErrors = validateExchangeItems(exchangeItems, returnItems);
    if (exchangeValidationErrors.length > 0) {
      setStepError(exchangeValidationErrors[0] ?? 'Danh sách sản phẩm đổi chưa hợp lệ.');
      return;
    }
    if (ADMIN_ORDER_RETURN_EXCHANGE_V2_ENABLED && (!quote?.quoteReference || quoteLoading)) {
      setStepError('Vui lòng xem báo giá đổi hàng mới trước khi tạo phiếu.');
      return;
    }

    try {
      setSubmitCreating(true);
      // Sau validation, chỉ gửi một API. Giữ code mới ở đây để release sau khi OMS có đủ quote/commit.
      if (ADMIN_ORDER_RETURN_EXCHANGE_V2_ENABLED) {
        await commitAdminOrderReturn({
          orderId,
          type: OrderReturnType.EXCHANGE,
          reason: returnReason,
          returnItems: returnItems.map((item) => ({
            orderItemId: item.lineId,
            quantity: item.quantity,
          })),
          exchangeItems: exchangeItems.map((item) => ({
            variationId: item.variantId,
            quantity: item.quantity,
          })),
          pickupAddress,
          shippingAddress,
          shippingMethod,
          shippingCarrier,
          carrierServiceId,
          estimatedDeliveryAt: shippingServiceOptions.find((o) => o.value === String(carrierServiceId))?.estimatedDeliveryAt,
          pricingQuote: quote!.quoteReference,
          shipperNote: shipperNote.trim() || undefined,
          evidenceImageUrls,
          ...(internalNote.trim() ? { note: internalNote.trim() } : {}),
        });
      } else {
        await createOrderReturn({
          orderId,
          type: requestType,
          reason: returnReason,
          returnItems: returnItems.map((item) => ({
            orderItemId: item.lineId,
            quantity: item.quantity,
          })),
          exchangeItems: exchangeItems.map((item) => ({
            variationId: item.variantId,
            quantity: item.quantity,
          })),
          pickupAddress,
          shippingAddress,
          shippingMethod,
          shippingCarrier,
          carrierServiceId,
          estimatedDeliveryAt: shippingServiceOptions.find((o) => o.value === String(carrierServiceId))?.estimatedDeliveryAt,
          returnShippingFee,
          shipperNote: shipperNote.trim() || undefined,
          evidenceImageUrls,
          ...(shouldShowBankFields
            ? {
                refundBankAccountHolder: bankAccountHolder.trim(),
                refundBankAccountNumber: bankAccountNumber.trim(),
                refundBankName: bankName.trim(),
                refundBankBranch: bankBranch.trim(),
              }
            : {}),
          ...(internalNote.trim() ? { note: internalNote.trim() } : {}),
        });
      }
      await mutateSwr((key) => Array.isArray(key) && key[0] === ORDER_RETURN_LIST_SWR_KEY, undefined, {
        revalidate: true,
      });
      closeCreatePage();
      setConfirmFieldErrors({
        returnReason: '',
        requestType: '',
        evidenceImageUrls: '',
        bankAccountHolder: '',
        bankAccountNumber: '',
        bankName: '',
        bankBranch: '',
      });
      setStepError('');
      showSnackbar({ type: SnackbarType.SUCCESS, message: ADMIN_ORDER_RETURN_EXCHANGE_V2_ENABLED ? 'Đã tạo phiếu đổi hàng. Trạng thái: Chờ thu hồi.' : 'Đã tạo yêu cầu đổi trả.' });
    } catch (error) {
      if (ADMIN_ORDER_RETURN_EXCHANGE_V2_ENABLED && isReturnQuoteStale(error)) refreshQuote();
      showSnackbar({
        type: SnackbarType.ERROR,
        message: getReturnSafeError(error),
      });
    } finally {
      setSubmitCreating(false);
    }
  };

  const goBack = () => {
    setStepError('');
    if (step === 1) {
      closeCreatePage();
      return;
    }
    setStep((prev) => (prev === 3 ? 2 : 1));
  };

  const diffPrefix = priceDiff === 0 ? '' : `Chênh lệch ${priceDiffLabel} - `;
  const footerPrimaryLabel = ADMIN_ORDER_RETURN_EXCHANGE_V2_ENABLED
    ? step === 3
      ? 'Tạo yêu cầu'
      : 'Tiếp tục'
    : step === 1
      ? 'Tiếp tục'
      : step === 2
        ? `${diffPrefix}Tiếp tục`
        : `${diffPrefix}Tạo yêu cầu`;

  return (
    <Box sx={sxPage}>
      <Box sx={sxHeaderBackRow}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
          <CustomButton fullWidth={false} variant="outline" onClick={closeCreatePage} startIcon={<ArrowBack sx={{ fontSize: 18 }} />} sx={sxBackNav}>
            Quay lại danh sách
          </CustomButton>
        </Stack>
      </Box>
      <Box sx={sxHeaderTitleRow}>
        <Typography component="h1" sx={sxTitle}>
          Tạo yêu cầu đổi trả{headerOrderCode ? ` - ${headerOrderCode}` : ''}
        </Typography>
      </Box>

      <Box sx={sxMainColumn}>
        <Box sx={sxCardFooterWrap}>
          <ReturnExchangeStepperPart step={step} />
          <Box sx={sxStepScrollRegion}>
            {/* <Box sx={sxCardShell}> */}
            {/* <ReturnExchangeOrderSummaryPart orderSummary={orderSummary} /> */}

            {loadingOrder ? <Typography sx={sxLoadingHint}>Đang tải dữ liệu đơn hàng...</Typography> : null}

            {!loadingOrder && !orderSummary ? <PageStateComponent variant="empty" title="Không có dữ liệu đơn hàng" description="Vui lòng kiểm tra lại đơn hàng hoặc thử lại sau." /> : null}

            {step === 1 && orderSummary ? (
              <ReturnExchangeStepReturnPart orderLines={orderLines} selectedReturnQtyByLineId={selectedReturnQtyByLineId} onSelectReturnLine={selectReturnLine} onUpdateReturnQty={updateReturnQty} />
            ) : null}

            {step === 2 && orderSummary ? (
              <ReturnExchangeStepExchangePart
                returnItems={returnItems}
                exchangeItems={exchangeItems}
                searchKeyword={searchExchangeKeyword}
                selectCatalog={filteredCatalog}
                onChangeSearchKeyword={setSearchExchangeKeyword}
                onSelectCatalogLine={addExchangeItem}
                onRemoveExchangeItem={removeExchangeItem}
                hasMoreCatalog={hasMoreExchangeCatalog}
                isLoadingMoreCatalog={isLoadingMoreExchangeCatalog}
                onLoadMoreCatalog={handleLoadMoreExchangeCatalog}
              />
            ) : null}

            {step === 3 && orderSummary ? (
              <ReturnExchangeStepConfirmPart
                exchangeOnly={ADMIN_ORDER_RETURN_EXCHANGE_V2_ENABLED}
                quote={quote}
                quoteLoading={quoteLoading}
                quoteError={quoteError}
                returnItems={returnItems}
                exchangeItems={exchangeItems}
                returnReasonOptions={RETURN_REASON_OPTIONS}
                requestTypeOptions={requestTypeOptions}
                priceDiff={ADMIN_ORDER_RETURN_EXCHANGE_V2_ENABLED ? 0 : priceDiff}
                returnReason={returnReason}
                requestType={requestType}
                returnReasonError={confirmFieldErrors.returnReason}
                requestTypeError={confirmFieldErrors.requestType}
                evidenceImageUrls={evidenceImageUrls}
                evidenceImageUrlsError={confirmFieldErrors.evidenceImageUrls}
                bankAccountHolder={bankAccountHolder}
                bankAccountNumber={bankAccountNumber}
                bankName={bankName}
                bankBranch={bankBranch}
                bankAccountHolderError={confirmFieldErrors.bankAccountHolder}
                bankAccountNumberError={confirmFieldErrors.bankAccountNumber}
                bankNameError={confirmFieldErrors.bankName}
                bankBranchError={confirmFieldErrors.bankBranch}
                shouldShowBankFields={shouldShowBankFields}
                pickupAddress={pickupAddress}
                shippingAddress={shippingAddress}
                shippingMethod={shippingMethod}
                shippingCarrier={shippingCarrier}
                carrierServiceId={carrierServiceId}
                warehouseOptions={warehouseOptions}
                shippingServiceLoading={shippingServiceLoading}
                shippingServiceOptions={shippingServiceOptions}
                returnShippingFee={ADMIN_ORDER_RETURN_EXCHANGE_V2_ENABLED ? (quote?.shipping.returnInboundShippingFeeMinor ?? 0) : returnShippingFee}
                returnShippingFeeLoading={ADMIN_ORDER_RETURN_EXCHANGE_V2_ENABLED ? quoteLoading : returnShippingFeeLoading}
                shipperNote={shipperNote}
                internalNote={internalNote}
                onChangeReturnReason={handleChangeReturnReason}
                onChangeRequestType={handleChangeRequestType}
                onChangeEvidenceImageUrls={handleChangeEvidenceImageUrls}
                onChangeBankAccountHolder={handleChangeBankAccountHolder}
                onChangeBankAccountNumber={handleChangeBankAccountNumber}
                onChangeBankName={handleChangeBankName}
                onChangeBankBranch={handleChangeBankBranch}
                onChangePickupWarehouseId={handleChangePickupWarehouseId}
                onChangePickupAddress={setPickupAddress}
                onChangeShippingAddress={setShippingAddress}
                onChangeShippingMethod={setShippingMethod}
                onChangeCarrierServiceId={setCarrierServiceId}
                onChangeShipperNote={setShipperNote}
                onChangeInternalNote={setInternalNote}
              />
            ) : null}

            {stepError ? <Typography sx={sxStepError}>{stepError}</Typography> : null}
            {/* </Box> */}

            <Box sx={sxFooter}>
              <CustomButton
                fullWidth={false}
                variant="outline"
                onClick={goBack}
                {...orderReturnsButtonPermission('create_step_back', step === 1 ? 'Hủy tạo đổi trả' : 'Quay lại bước', 'api_order_return_create')}
                sx={sxFooterBtn}
              >
                {step === 1 ? 'Hủy' : 'Quay lại'}
              </CustomButton>
              <CustomButton
                fullWidth={false}
                variant="primary"
                sx={{ ...sxFooterBtn, bgcolor: '#0F172A' }}
                onClick={() => void goNext()}
                disabled={
                  loadingOrder ||
                  !orderSummary ||
                  submitCreating ||
                  (step === 3 && (evidenceImageUrls.length === 0 || (ADMIN_ORDER_RETURN_EXCHANGE_V2_ENABLED ? !quote?.quoteReference || quoteLoading : returnShippingFeeLoading)))
                }
                {...orderReturnsButtonPermission(step === 3 ? 'create' : 'continue', footerPrimaryLabel, 'api_order_return_create')}
              >
                {footerPrimaryLabel}
              </CustomButton>
            </Box>
          </Box>
        </Box>
      </Box>

      <CreateOrderVariantDialog
        open={Boolean(exchangeVariantDialogProduct)}
        productId={exchangeVariantDialogProduct?.id ?? null}
        productName={exchangeVariantDialogProduct?.name}
        productImage={exchangeVariantDialogProduct?.image}
        onClose={() => setExchangeVariantDialogProduct(null)}
        onAddToOrder={({ variation, quantity, product }) => {
          setExchangeItems((prev) => {
            if (prev.some((item) => item.variantId === variation.id)) {
              showSnackbar({ type: SnackbarType.WARNING, message: `SKU ${variation.skuCode} đã được chọn.` });
              return prev;
            }

            return [
              ...prev,
              {
                productId: product.id,
                productName: product.name,
                variantId: variation.id,
                sku: variation.skuCode,
                quantity,
                priceSnapshot: variation.customerDisplayPrice?.sellingPriceAfterTaxMinor ?? variation.salePrice,
                imageUrl: product.image || '',
                isSameProductExchange: returnItems.some((item) => item.productId === product.id),
              },
            ];
          });
          setExchangeVariantDialogProduct(null);
        }}
      />
    </Box>
  );
};

export default ReturnExchangePage;
