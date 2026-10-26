import { ArrowBack } from '@mui/icons-material';
import { isJavaBackend } from '@/common/config/app.config';
import { BackendHttpError } from '@/apis/backend-request';
import { Box, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import { calculateGhnShippingFee } from '../../../../apis/shipment';
import { OrderReturnReason, OrderReturnStatus, OrderReturnType, PaymentStatus, getOrderDetail, getOrderReturnDetail, updateOrderReturn } from '../../../../apis/order';
import { PaymentMethod, ShippingMethod } from '../../../../apis/order/order.enum';
import { formatCurrency } from '../../../../common/utils/number.utils';
import { CustomButton } from '../../../../components/button';
import { orderReturnsButtonPermission } from '../../order-permission.constants';
import { PageStateComponent } from '../../../../components/empty';
import { ORDER_RETURN_LIST_SWR_KEY } from '../../../../hooks/return-exchanges/use-return-exchanges-list.hook';
import { useOrderShippingServiceOptions } from '../../../../hooks/use-order-shipping-service-options.hook';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { ORDER_SHIPPING_DEFAULT_SHOP_ID } from '../../../../common/utils/order/order-shipping-service.utils';
import {
  RETURN_EXCHANGE_DEFAULT_SHIPPING_ADDRESS,
  RETURN_REASON_OPTIONS,
  calculatePriceDiff,
  clampQty,
  deriveExchangeCatalog,
  deriveReturnItems,
  getRequestTypeOptions,
  isReturnExchangeEditableOnList,
  validateExchangeItems,
  validateReturnItems,
} from '../../../../common/constant/order/order.constants';
import { type ExchangeItem, type ReturnExchangeFlowStep, type ReturnExchangeOrderSummary, type ReturnExchangeShippingServiceOption, type ReturnableOrderLine } from '../../order.types';
import { type NormalizedOrderShippingServiceOption } from '../../../../common/utils/order/order-shipping-service.utils';
import { ReturnExchangeStepConfirmPart } from '../parts/returns-exchanges-step-confirm.part';
import { ReturnExchangeStepExchangePart } from '../parts/returns-exchanges-step-exchange.part';
import { ReturnExchangeStepReturnPart } from '../parts/returns-exchanges-step-return.part';
import { ReturnExchangeStepperPart } from '../parts/returns-exchanges-stepper.part';
import { mapWarehouseOptionToPickupAddress, useReturnExchangeWarehouseOptions } from '../use-return-exchange-warehouse-options.hook';
import { buildStateFromOrderReturnDetail } from './returns-exchanges-edit.helpers';
import { useAdminOrderReturnQuote } from '../use-admin-order-return-quote.hook';
import type { IAdminOrderReturnQuoteRequest } from '../../../../apis/order/order.interface';
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
} from '../returns-exchanges-page.styles';

const ReturnExchangeEditPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { mutate: mutateSwr } = useSWRConfig();
  const returnId = searchParams.get('returnId')?.trim() || '';
  const { showSnackbar } = useSnackbar();

  const [step, setStep] = useState<ReturnExchangeFlowStep>(3);
  const [orderSummary, setOrderSummary] = useState<ReturnExchangeOrderSummary | null>(null);
  const [originalOrderId, setOriginalOrderId] = useState('');
  const [loadingPage, setLoadingPage] = useState(false);
  const [returnCodeLabel, setReturnCodeLabel] = useState('');
  const [selectedReturnQtyByLineId, setSelectedReturnQtyByLineId] = useState<Record<string, number>>({});
  const [exchangeItems, setExchangeItems] = useState<ExchangeItem[]>([]);
  const [searchExchangeKeyword, setSearchExchangeKeyword] = useState('');
  const [returnReason, setReturnReason] = useState<OrderReturnReason | ''>('');
  const [requestType, setRequestType] = useState<OrderReturnType | ''>('');
  const [internalNote, setInternalNote] = useState('');
  const [stepError, setStepError] = useState('');
  const [submitUpdating, setSubmitUpdating] = useState(false);
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
  const [shippingCarrier] = useState(isJavaBackend() ? '' : 'GHN');
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>(ShippingMethod.STANDARD);
  const [carrierServiceId, setCarrierServiceId] = useState(53321);
  const [pickupAddress, setPickupAddress] = useState(INITIAL_PICKUP_ADDRESS);
  const [shippingAddress, setShippingAddress] = useState(RETURN_EXCHANGE_DEFAULT_SHIPPING_ADDRESS);
  const [returnShippingFee, setReturnShippingFee] = useState(0);
  const [returnShippingFeeLoading, setReturnShippingFeeLoading] = useState(false);
  /** Trạng thái yêu cầu khi mở màn chỉnh sửa — quyết định có cho quay về bước 1 hay không. */
  const [returnEditFlowStatus, setReturnEditFlowStatus] = useState<OrderReturnStatus | null>(null);

  const canLoadShippingServices =
    Boolean(shippingCarrier) && pickupAddress.wardCode > 0 && Boolean(pickupAddress.addressLine.trim()) && shippingAddress.wardCode > 0 && Boolean(shippingAddress.addressLine.trim());

  const { options: normalizedShippingServiceOptions, isLoading: shippingServiceLoading } = useOrderShippingServiceOptions({
    enabled: !isJavaBackend() && canLoadShippingServices,
    fromWardCode: pickupAddress.wardCode,
    fromAddress: pickupAddress.addressLine,
    toWardCode: shippingAddress.wardCode,
    toAddress: shippingAddress.addressLine,
  });

  const shippingServiceOptions: ReturnExchangeShippingServiceOption[] = normalizedShippingServiceOptions.map((option: NormalizedOrderShippingServiceOption) => ({
    ...option,
    method: ShippingMethod.STANDARD,
  }));

  // Phiếu đã có kho thì giữ nguyên kho đã lưu; chỉ tự chọn kho OMS khi phiếu chưa có kho.
  const warehouseOptions = useReturnExchangeWarehouseOptions(setPickupAddress);

  const closeEditPage = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('returnId');
        return next;
      },
      { replace: true },
    );
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!returnId) {
        setOrderSummary(null);
        setReturnCodeLabel('');
        setReturnEditFlowStatus(null);
        setLoadingPage(false);
        return;
      }

      setLoadingPage(true);
      try {
        const detail = await getOrderReturnDetail(returnId);
        if (cancelled) return;

        if (!detail.status || !isReturnExchangeEditableOnList(detail.status)) {
          showSnackbar({
            type: SnackbarType.WARNING,
            message: 'Chỉ chỉnh sửa được yêu cầu ở trạng thái Chờ xác nhận hoặc Chờ hàng đổi.',
          });
          setReturnEditFlowStatus(null);
          setSearchParams(
            (prev) => {
              const next = new URLSearchParams(prev);
              next.delete('returnId');
              return next;
            },
            { replace: true },
          );
          return;
        }

        const originalOrderId = detail.originalOrderId?.trim() || detail.orderId?.trim() || '';
        if (!originalOrderId) {
          setOrderSummary(null);
          setReturnCodeLabel(detail.returnCode ?? '');
          setReturnEditFlowStatus(null);
          showSnackbar({
            type: SnackbarType.ERROR,
            message: 'Thiếu mã đơn gốc trên yêu cầu đổi trả.',
          });
          return;
        }

        const orderDetail = await getOrderDetail(originalOrderId);
        if (cancelled) return;

        const hydrated = buildStateFromOrderReturnDetail(detail, orderDetail);
        setReturnEditFlowStatus(detail.status as OrderReturnStatus);
        setReturnCodeLabel(detail.returnCode ?? '');
        setOrderSummary(hydrated.orderSummary);
        setOriginalOrderId(orderDetail.id);
        setSelectedReturnQtyByLineId(hydrated.selectedReturnQtyByLineId);
        setExchangeItems(hydrated.exchangeItems);
        setReturnReason(hydrated.returnReason);
        setRequestType(hydrated.requestType);
        setInternalNote(hydrated.internalNote);
        setEvidenceImageUrls(hydrated.evidenceImageUrls);
        setShipperNote(hydrated.shipperNote);
        setBankAccountHolder(hydrated.bankAccountHolder);
        setBankAccountNumber(hydrated.bankAccountNumber);
        setBankName(hydrated.bankName);
        setBankBranch(hydrated.bankBranch);
        setShippingMethod(hydrated.shippingMethod);
        setCarrierServiceId(hydrated.carrierServiceId);
        setPickupAddress(hydrated.pickupAddress);
        setShippingAddress(hydrated.shippingAddress);
        setReturnShippingFee(hydrated.returnShippingFee);
        setStep(3);
        setStepError('');
        setConfirmFieldErrors({
          returnReason: '',
          requestType: '',
          evidenceImageUrls: '',
          bankAccountHolder: '',
          bankAccountNumber: '',
          bankName: '',
          bankBranch: '',
        });
      } catch {
        if (cancelled) return;
        setOrderSummary(null);
        setReturnCodeLabel('');
        setReturnEditFlowStatus(null);
        showSnackbar({
          type: SnackbarType.ERROR,
          message: 'Không tải được chi tiết yêu cầu đổi trả.',
        });
      } finally {
        if (!cancelled) {
          setLoadingPage(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [returnId, setSearchParams, showSnackbar]);

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

  const exchangeCatalog = useMemo(() => deriveExchangeCatalog(orderLines, returnItems), [orderLines, returnItems]);

  const filteredCatalog = useMemo(() => {
    const selectedVariantIds = new Set(exchangeItems.map((item) => item.variantId));
    const availableCatalog = exchangeCatalog.filter((item) => !selectedVariantIds.has(item.variantId));

    const kw = searchExchangeKeyword.trim().toLowerCase();
    if (!kw) return availableCatalog;
    return availableCatalog.filter((item) => item.productName.toLowerCase().includes(kw) || item.sku.toLowerCase().includes(kw));
  }, [exchangeCatalog, exchangeItems, searchExchangeKeyword]);

  const priceDiff = useMemo(() => calculatePriceDiff(returnItems, exchangeItems), [exchangeItems, returnItems]);
  const priceDiffLabel = `${priceDiff >= 0 ? '' : '-'}${formatCurrency(Math.abs(priceDiff))}₫`;
  const headerOrderCode = orderSummary?.orderCode?.trim() ?? '';
  const quoteRequest = useMemo<IAdminOrderReturnQuoteRequest | null>(() => {
    if (!isJavaBackend() || loadingPage || !orderSummary || step !== 3 || !returnId || !originalOrderId || !returnReason || !returnItems.length) return null;
    return {
      returnId, orderId: originalOrderId, reason: returnReason,
      type: requestType || (exchangeItems.length ? OrderReturnType.EXCHANGE : OrderReturnType.REFUND),
      returnItems: returnItems.map(line => ({ orderItemId: line.lineId, quantity: line.quantity })),
      exchangeItems: exchangeItems.map(line => ({ variationId: line.variantId, quantity: line.quantity })),
      pickupAddress, shippingAddress, shippingMethod, shippingCarrier, carrierServiceId,
    };
  }, [loadingPage, orderSummary, step, returnId, originalOrderId, returnReason, requestType, returnItems, exchangeItems,
    pickupAddress, shippingAddress, shippingMethod, shippingCarrier, carrierServiceId]);
  const { quote, isLoading: quoteLoading, hasError: quoteError, refresh: refreshQuote } = useAdminOrderReturnQuote(quoteRequest);
  const hasExchangeItems = exchangeItems.length > 0;
  const requestTypeOptions = useMemo(() => getRequestTypeOptions(hasExchangeItems).filter(option => !isJavaBackend() || option.value === OrderReturnType.REFUND || option.value === OrderReturnType.EXCHANGE), [hasExchangeItems]);

  const canCalculateReturnShippingFee =
    !isJavaBackend() &&
    carrierServiceId > 0 &&
    pickupAddress.wardCode > 0 &&
    Boolean(pickupAddress.addressLine.trim()) &&
    shippingAddress.wardCode > 0 &&
    Boolean(shippingAddress.addressLine.trim()) &&
    returnItems.length > 0;
  const shouldShowBankFields = requestType === OrderReturnType.REFUND && orderSummary?.paymentMethod === PaymentMethod.COD && orderSummary?.paymentStatus === PaymentStatus.PAID;

  useEffect(() => {
    if (loadingPage) return;
    setRequestType(hasExchangeItems ? OrderReturnType.EXCHANGE : OrderReturnType.REFUND);
  }, [hasExchangeItems, loadingPage]);

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
    setExchangeItems((prev) => [
      ...prev,
      {
        productId: line.productId,
        productName: line.productName,
        variantId: line.variantId,
        sku: line.sku,
        quantity: 1,
        priceSnapshot: line.priceSnapshot,
        imageUrl: line.imageUrl,
        isSameProductExchange: returnItems.some((item) => item.productId === line.productId),
      },
    ]);
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
      setStepError('Không có dữ liệu đơn hàng để cập nhật yêu cầu đổi trả.');
      return;
    }

    if (!returnId) {
      setStepError('Thiếu mã yêu cầu đổi trả.');
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
      const errors = validateExchangeItems(exchangeItems, returnItems);
      if (errors.length > 0) {
        setStepError(errors[0] ?? 'Danh sách sản phẩm đổi chưa hợp lệ.');
        return;
      }
      if (exchangeItems.length > 0) {
        setRequestType(OrderReturnType.EXCHANGE);
      } else {
        setRequestType(OrderReturnType.REFUND);
      }
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

    try {
      setSubmitUpdating(true);
      if (isJavaBackend() && (!quote?.quoteReference || quoteLoading || quoteError)) {
        setStepError('Vui lòng chờ báo giá từ server hoặc lấy lại báo giá trước khi cập nhật.');
        refreshQuote();
        return;
      }
      await updateOrderReturn(returnId, {
        ...(isJavaBackend() ? { pricingQuote: quote?.quoteReference } : {}),
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
      await mutateSwr((key) => Array.isArray(key) && key[0] === ORDER_RETURN_LIST_SWR_KEY, undefined, {
        revalidate: true,
      });
      closeEditPage();
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
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã cập nhật yêu cầu đổi trả.' });
    } catch (error) {
      showSnackbar({
        type: SnackbarType.ERROR,
        message: error instanceof BackendHttpError && error.code === 'ORDER_RETURN_QUOTE_STALE'
          ? 'Giá đã thay đổi. Báo giá đang được lấy lại; vui lòng kiểm tra và xác nhận cập nhật lần nữa.'
          : error instanceof Error ? error.message : 'Không thể cập nhật yêu cầu đổi trả.',
      });
      if (error instanceof BackendHttpError && error.code === 'ORDER_RETURN_QUOTE_STALE') refreshQuote();
    } finally {
      setSubmitUpdating(false);
    }
  };

  const goBack = () => {
    setStepError('');
    if (step === 3) {
      setStep(2);
      return;
    }
    if (step === 2) {
      if (returnEditFlowStatus === OrderReturnStatus.PENDING) {
        setStep(1);
        return;
      }
      closeEditPage();
      return;
    }
    closeEditPage();
  };

  const difference = isJavaBackend()
    ? quote ? quote.product.exchangeMerchandiseTotalMinor - quote.product.returnedMerchandiseSettlementMinor : null
    : priceDiff;
  const diffPrefix = difference == null || difference === 0 ? '' : `Chênh lệch ${isJavaBackend() ? formatCurrency(difference) + '₫' : priceDiffLabel} - `;
  const footerPrimaryLabel = step === 1 ? 'Tiếp tục' : step === 2 ? `${diffPrefix}Tiếp tục` : `${diffPrefix}Cập nhật yêu cầu`;

  const titleSuffix = [returnCodeLabel, headerOrderCode].filter(Boolean).join(' — ') || headerOrderCode || returnCodeLabel;

  return (
    <Box sx={sxPage}>
      <Box sx={sxHeaderBackRow}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
          <CustomButton fullWidth={false} variant="outline" onClick={closeEditPage} startIcon={<ArrowBack sx={{ fontSize: 18 }} />} sx={sxBackNav}>
            Quay lại danh sách
          </CustomButton>
        </Stack>
      </Box>
      <Box sx={sxHeaderTitleRow}>
        <Typography component="h1" sx={sxTitle}>
          Chỉnh sửa yêu cầu đổi trả{titleSuffix ? ` - ${titleSuffix}` : ''}
        </Typography>
      </Box>

      <Box sx={sxMainColumn}>
        <Box sx={sxCardFooterWrap}>
          <ReturnExchangeStepperPart step={step} />
          <Box sx={sxStepScrollRegion}>
            {loadingPage ? <Typography sx={sxLoadingHint}>Đang tải dữ liệu yêu cầu đổi trả...</Typography> : null}
            {isJavaBackend() && step === 3 && orderSummary ? (
              <Stack gap={1}>
                <Typography sx={sxLoadingHint}>
                  Số tiền lấy từ báo giá server cho phiếu đang sửa. Nếu giá thay đổi, hãy xem lại báo giá mới trước khi cập nhật.
                </Typography>
                <CustomButton variant="outline" onClick={refreshQuote} disabled={quoteLoading}>
                  Lấy lại báo giá
                </CustomButton>
              </Stack>
            ) : null}

            {!loadingPage && !orderSummary ? <PageStateComponent variant="empty" title="Không có dữ liệu" description="Vui lòng kiểm tra lại yêu cầu hoặc thử lại sau." /> : null}

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
              />
            ) : null}

            {step === 3 && orderSummary ? (
              <ReturnExchangeStepConfirmPart
                quote={quote}
                quoteLoading={quoteLoading}
                quoteError={quoteError}
                returnItems={returnItems}
                exchangeItems={exchangeItems}
                returnReasonOptions={RETURN_REASON_OPTIONS}
                requestTypeOptions={requestTypeOptions}
                priceDiff={priceDiff}
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
                returnShippingFee={returnShippingFee}
                returnShippingFeeLoading={returnShippingFeeLoading}
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

            <Box sx={sxFooter}>
              <CustomButton
                fullWidth={false}
                variant="outline"
                onClick={goBack}
                {...orderReturnsButtonPermission('edit_step_back', step === 3 ? 'Quay lại bước' : 'Hủy chỉnh sửa', 'api_order_return_update')}
                sx={sxFooterBtn}
              >
                {step === 3 ? 'Quay lại' : 'Hủy'}
              </CustomButton>
              <CustomButton
                fullWidth={false}
                variant="primary"
                sx={{ ...sxFooterBtn, bgcolor: '#0F172A' }}
                onClick={() => void goNext()}
                disabled={loadingPage || !orderSummary || submitUpdating || (step === 3 && (evidenceImageUrls.length === 0 || returnShippingFeeLoading || (isJavaBackend() && (quoteLoading || quoteError || !quote?.quoteReference))))}
                {...orderReturnsButtonPermission(step === 3 ? 'update' : 'continue', footerPrimaryLabel, 'api_order_return_update')}
              >
                {footerPrimaryLabel}
              </CustomButton>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ReturnExchangeEditPage;
