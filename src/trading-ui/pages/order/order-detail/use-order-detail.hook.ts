import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import {
  cancelOrder,
  checkOrderPaid,
  confirmOrderPayment,
  getOrderDetail,
  getOrderPaymentStatus,
  PaymentMethod,
  PaymentStatus,
  retryOrderPayment,
  OrderStatus,
  OrderCancellationReason,
  shipOrder,
  type IConfirmOrderPaymentRequest,
  type IOrder,
  type IOrderPaymentStatusResponse,
  type IOrderItem,
  type IOrderProductDetail,
} from '../../../apis/order';
import { createRefundProposal, type RefundProposalReason, RefundProposalSourceType } from '../../../apis/refund-proposal';
import { buildCustomerPaymentReturnUrl } from '../../../common/config/customer-payment-return-url.config';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { getOrderEditPath, ROUTE_PATH } from '@/trading-ui/router/route.path';
import { isOrderCancellableStatus, ORDER_CANCEL_BLOCKED_STATUS_MESSAGE, ORDER_EDIT_PAGE_ALLOWED_STATUSES } from '../../../common/constant/order/order.constants';
import { copyTextToClipboard, getCopyFailureMessage, getCopySuccessMessage } from '../../../common/utils';
import {
  getOrderActionVisibility,
  getOrderErrorLogEntries,
  inferAddressMismatch3pl,
  inferShippingFeeDiscrepancy,
  parseOrderAmount,
  resolvePaymentStatusFromCheckPaidPayload,
} from './order-detail.helpers';

export type LineStockInfo = {
  lineId: string;
  /** Tồn kho biến thể theo catalog (getOrderProductDetail). */
  availableStock: number | null;
  skuInvalid: boolean;
  insufficientStock: boolean;
};

const buildLineStockMap = (items: IOrderItem[], productDetails: Map<string, IOrderProductDetail>): LineStockInfo[] => {
  return items.map((item) => {
    const pid = item.productId?.trim();
    if (!pid) {
      return {
        lineId: item.id,
        availableStock: null,
        skuInvalid: true,
        insufficientStock: false,
      };
    }

    const detail = productDetails.get(pid);
    const variation = detail?.variations.find((v) => v.id === item.variationId);
    if (!detail || !variation) {
      return {
        lineId: item.id,
        availableStock: null,
        skuInvalid: true,
        insufficientStock: false,
      };
    }

    const availableStock = variation.stockQuantity;
    return {
      lineId: item.id,
      availableStock,
      skuInvalid: false,
      insufficientStock: availableStock < item.quantity,
    };
  });
};

/** BE có thể gửi thêm `quotedShippingFeeFromCarrier` trong tương lai — tạm đọc từ object mở rộng. */
type OrderDetailApiPayload = IOrder & {
  quotedShippingFeeFromCarrier?: string | number | null;
  transactionId?: string | null;
};

const ORDER_DETAIL_SWR_KEY_PREFIX = 'order-detail' as const;
const RETRY_PAYMENT_MINUTES = 15;
const RETRY_PAYMENT_DELAY_MS = RETRY_PAYMENT_MINUTES * 60 * 1000;
const ONLINE_PAYMENT_METHODS = new Set<PaymentMethod>([
  PaymentMethod.QR_CODE,
  PaymentMethod.CREDIT_CARD,
  PaymentMethod.DIGITAL_WALLET,
  PaymentMethod.MOMO_WALLET,
  PaymentMethod.ZALO_PAY,
  PaymentMethod.ZALOPAY,
  PaymentMethod.INSTALLMENT,
  PaymentMethod.VNPAY,
  PaymentMethod.ATM_CARD,
]);

const resolveRetryPaymentMethod = (method: PaymentMethod): PaymentMethod => (method === PaymentMethod.BANK_TRANSFER ? PaymentMethod.QR_CODE : method);

const parseOrderPaymentStatusPayload = (response: unknown): IOrderPaymentStatusResponse =>
  response && typeof response === 'object' && 'data' in response && (response as { data?: unknown }).data
    ? ((response as { data: IOrderPaymentStatusResponse }).data as IOrderPaymentStatusResponse)
    : (response as IOrderPaymentStatusResponse);

const isPaymentRetryLimitReached = (paymentStatus: IOrderPaymentStatusResponse): boolean => {
  const retryCount = paymentStatus.paymentRetryCount;
  const maxRetries = paymentStatus.maxPaymentRetries;
  if (typeof retryCount !== 'number' || typeof maxRetries !== 'number' || !Number.isFinite(retryCount) || !Number.isFinite(maxRetries)) {
    return false;
  }
  return retryCount >= maxRetries;
};

type RetryPaymentDialogData = {
  orderId: string;
  orderCode: string;
  paymentUrl: string;
  paymentLinkExpiresAt?: string | null;
};

type CreateRefundFromCancelledOrderPayload = {
  reason: RefundProposalReason;
  detailNote?: string;
  firstName?: string;
  contactEmail?: string;
  shippingAddressLine?: string;
  shippingWardName?: string;
  shippingProvinceName?: string;
  shippingProvinceCode?: number;
  shippingWardCode?: string;
  customerAddress?: string;
  receiverPhone?: string;
  bankAccountHolder?: string;
  bankAccountNumber?: string;
  bankName?: string;
  bankBranch?: string;
};

const fetchOrderDetailSwr = async ([, id]: readonly [typeof ORDER_DETAIL_SWR_KEY_PREFIX, string]): Promise<OrderDetailApiPayload> => (await getOrderDetail(id)) as OrderDetailApiPayload;

export const useOrderDetailPage = () => {
  const { orderId = '' } = useParams<{ orderId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const orderIdTrimmed = orderId.trim();
  const swrKey = orderIdTrimmed ? ([ORDER_DETAIL_SWR_KEY_PREFIX, orderIdTrimmed] as const) : null;

  const { data: order, error: orderError, isLoading, mutate: mutateOrderDetail } = useSWR(swrKey, fetchOrderDetailSwr, { revalidateOnFocus: false });

  const productDetails = useMemo(() => new Map<string, IOrderProductDetail>(), [order?.id]);

  const loadError = useMemo(() => {
    if (!orderIdTrimmed) return 'Thiếu mã đơn hàng';
    if (orderError) return (orderError as { message?: string })?.message || 'Không tải được chi tiết đơn hàng';
    return null;
  }, [orderIdTrimmed, orderError]);

  const [internalNotes, setInternalNotes] = useState<Array<{ id: string; text: string; createdAt: string }>>([]);
  const [newInternalNote, setNewInternalNote] = useState('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [cancelOrderDialogOpen, setCancelOrderDialogOpen] = useState(false);
  const [cancelOrderSubmitting, setCancelOrderSubmitting] = useState(false);
  const [confirmPaymentDialogOpen, setConfirmPaymentDialogOpen] = useState(false);
  const [confirmPaymentSubmitting, setConfirmPaymentSubmitting] = useState(false);
  const [shipOrderSubmitting, setShipOrderSubmitting] = useState(false);
  const [retryPaymentSubmitting, setRetryPaymentSubmitting] = useState(false);
  const [checkPaymentSubmitting, setCheckPaymentSubmitting] = useState(false);
  const [createRefundSubmitting, setCreateRefundSubmitting] = useState(false);
  const [retryPaymentDialogData, setRetryPaymentDialogData] = useState<RetryPaymentDialogData | null>(null);
  const [nowTimestamp, setNowTimestamp] = useState(() => Date.now());

  useEffect(() => {
    const timerId = window.setInterval(() => setNowTimestamp(Date.now()), 30_000);
    return () => window.clearInterval(timerId);
  }, []);

  const refetchOrderDetailFresh = useCallback(async (): Promise<boolean> => {
    if (!orderIdTrimmed) return false;
    try {
      await mutateOrderDetail(
        async () =>
          (await getOrderDetail(orderIdTrimmed, {
            headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
          })) as OrderDetailApiPayload,
        { revalidate: false },
      );
      return true;
    } catch {
      return false;
    }
  }, [orderIdTrimmed, mutateOrderDetail]);

  const lineStockInfo = useMemo(() => {
    if (!order) return [];
    return buildLineStockMap(order.items, productDetails);
  }, [order, productDetails]);

  const lineStockById = useMemo(() => {
    const m = new Map<string, LineStockInfo>();
    lineStockInfo.forEach((row) => m.set(row.lineId, row));
    return m;
  }, [lineStockInfo]);

  const addressMismatch3pl = useMemo(() => (order ? inferAddressMismatch3pl(order.errorLog) : false), [order]);

  const shippingFeeWarning = useMemo(() => {
    if (!order) return false;
    const customerFee = parseOrderAmount(order.shippingFee);
    const apiFeeRaw = order.quotedShippingFeeFromCarrier;
    return inferShippingFeeDiscrepancy(customerFee, apiFeeRaw != null ? parseOrderAmount(apiFeeRaw) : null);
  }, [order]);

  const orderErrorLogEntries = useMemo(() => (order ? getOrderErrorLogEntries(order.errorLog) : []), [order]);

  const showRetryPayment = useMemo(() => {
    if (!order?.createdAt) return false;
    if (order.status !== OrderStatus.PENDING) return false;
    if (order.paymentStatus !== PaymentStatus.UNPAID) return false;
    if (!order.paymentMethod || order.paymentMethod === PaymentMethod.COD) return false;
    const createdAtMs = new Date(order.createdAt).getTime();
    if (!Number.isFinite(createdAtMs)) return false;
    return nowTimestamp - createdAtMs < RETRY_PAYMENT_DELAY_MS;
  }, [order, nowTimestamp]);

  const showCheckPayment = useMemo(() => {
    if (!order) return false;
    if (order.status !== OrderStatus.PENDING) return false;
    if (!order.paymentMethod || order.paymentMethod === PaymentMethod.COD) return false;
    return order.paymentStatus === PaymentStatus.UNPAID || order.paymentStatus === PaymentStatus.FAILED;
  }, [order]);

  const showCreateRefund = useMemo(() => {
    if (!order) return false;
    if (order.status !== OrderStatus.CANCELLED) return false;
    if (order.paymentStatus !== PaymentStatus.PAID) return false;
    if (order.refundFund?.isMoneyRefunded) return false;
    if (order.refundFund?.hasRefundProposal) return false;
    return true;
  }, [order]);

  const handleCopyOrderCode = useCallback(async () => {
    if (!order?.orderCode) return;
    const copied = await copyTextToClipboard(order.orderCode);
    if (copied) {
      showSnackbar({ type: SnackbarType.SUCCESS, message: getCopySuccessMessage('mã đơn') });
    } else {
      showSnackbar({ type: SnackbarType.WARNING, message: getCopyFailureMessage() });
    }
  }, [order?.orderCode, showSnackbar]);

  const handleBackToList = useCallback(() => {
    const fromPage = (location.state as { fromPage?: string } | null)?.fromPage;
    // Chỉ quay về các trang nguồn đã biết — tránh navigate tới path tuỳ ý từ state.
    const allowedBackPages: string[] = [ROUTE_PATH.SHIPPING, ROUTE_PATH.EXCHANGE, ROUTE_PATH.REFUND_PROPOSAL];
    if (fromPage && allowedBackPages.includes(fromPage)) {
      navigate(fromPage);
      return;
    }
    navigate(ROUTE_PATH.ORDER);
  }, [location.state, navigate]);

  const handleEditOrder = useCallback(() => {
    if (!orderIdTrimmed) return;
    if (!order || !ORDER_EDIT_PAGE_ALLOWED_STATUSES.includes(order.status)) {
      showSnackbar({
        type: SnackbarType.WARNING,
        message: 'Chỉ chỉnh sửa khi đơn ở trạng thái Chờ xác nhận.',
      });
      return;
    }
    navigate(getOrderEditPath(orderIdTrimmed));
  }, [navigate, order, orderIdTrimmed]);

  const handleOpenCustomerProfile = useCallback(() => {
    if (!order?.customerId) {
      showSnackbar({ type: SnackbarType.INFO, message: 'Chưa có mã khách hàng từ hệ thống' });
      return;
    }
    window.open(`${window.location.origin}${ROUTE_PATH.CUSTOMER}?id=${encodeURIComponent(order.customerId)}`, '_blank');
  }, [order?.customerId]);

  const stubAction = useCallback((label: string) => {
    showSnackbar({ type: SnackbarType.INFO, message: `Tính năng "${label}" đang được kết nối API` });
  }, []);

  const handleDispatchOrder = useCallback(async () => {
    if (!orderIdTrimmed) return;
    setShipOrderSubmitting(true);
    try {
      await shipOrder(orderIdTrimmed);
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã gửi lệnh giao hàng.' });
      const detailOk = await refetchOrderDetailFresh();
      if (!detailOk) {
        showSnackbar({
          type: SnackbarType.WARNING,
          message: 'Đã gửi lệnh giao hàng nhưng không tải lại được chi tiết. Vui lòng tải lại trang.',
        });
      }
    } catch (e) {
      showSnackbar({
        type: SnackbarType.ERROR,
        message: (e as { message?: string })?.message || 'Không thể gửi lệnh giao hàng. Vui lòng thử lại.',
      });
    } finally {
      setShipOrderSubmitting(false);
    }
  }, [orderIdTrimmed, refetchOrderDetailFresh]);

  const handleConfirmCancelOrder = useCallback(
    async (payload: { reason: string }) => {
      if (!orderIdTrimmed) return;
      if (!order || !isOrderCancellableStatus(order.status)) {
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
        await cancelOrder(orderIdTrimmed, {
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
    [navigate, order, orderIdTrimmed],
  );

  const handleConfirmPayment = useCallback(
    async (payload: IConfirmOrderPaymentRequest) => {
      if (!orderIdTrimmed) return;
      if (!order || !getOrderActionVisibility(order.status, order.paymentStatus).showConfirmPayment) {
        showSnackbar({
          type: SnackbarType.WARNING,
          message: 'Chỉ xác nhận thanh toán khi đơn ở trạng thái Chờ xác nhận và chưa thanh toán.',
        });
        setConfirmPaymentDialogOpen(false);
        return;
      }
      setConfirmPaymentSubmitting(true);
      try {
        await confirmOrderPayment(orderIdTrimmed, payload);
        setConfirmPaymentDialogOpen(false);
        showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã xác nhận thanh toán.' });
        await refetchOrderDetailFresh();
      } catch (e) {
        showSnackbar({
          type: SnackbarType.ERROR,
          message: (e as { message?: string })?.message || 'Không thể xác nhận thanh toán.',
        });
      } finally {
        setConfirmPaymentSubmitting(false);
      }
    },
    [order, orderIdTrimmed, refetchOrderDetailFresh],
  );

  const handleRetryPayment = useCallback(async () => {
    if (!order || !showRetryPayment) {
      showSnackbar({
        type: SnackbarType.WARNING,
        message: 'Chỉ có thể thanh toán lại khi đơn chờ xác nhận, chưa thanh toán và quá 15 phút.',
      });
      return;
    }
    if (!order.orderCode || !order.paymentMethod) {
      showSnackbar({ type: SnackbarType.WARNING, message: 'Thiếu thông tin thanh toán của đơn hàng.' });
      return;
    }

    setRetryPaymentSubmitting(true);
    try {
      const paymentStatus = parseOrderPaymentStatusPayload(await getOrderPaymentStatus(order.orderCode));
      if (isPaymentRetryLimitReached(paymentStatus)) {
        showSnackbar({
          type: SnackbarType.WARNING,
          message: 'Đã vượt quá số lần thanh toán lại. Vui lòng liên hệ hỗ trợ.',
        });
        return;
      }

      const paymentMethod = resolveRetryPaymentMethod(order.paymentMethod);
      const shouldAppendReturnUrl = ONLINE_PAYMENT_METHODS.has(paymentMethod);
      const response = await retryOrderPayment(order.orderCode, {
        paymentMethod,
        ...(shouldAppendReturnUrl ? { returnUrl: buildCustomerPaymentReturnUrl() } : {}),
      });

      const payload = parseOrderPaymentStatusPayload(response);

      const paymentUrl = payload.paymentUrl?.trim();
      if (!paymentUrl) {
        showSnackbar({
          type: SnackbarType.WARNING,
          message: payload.error?.trim() || 'Không nhận được link thanh toán mới.',
        });
        return;
      }

      setRetryPaymentDialogData({
        orderId: order.id,
        orderCode: payload.orderCode || order.orderCode,
        paymentUrl,
        paymentLinkExpiresAt: null,
      });
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã tạo lại link thanh toán.' });
    } catch (e) {
      showSnackbar({
        type: SnackbarType.ERROR,
        message: (e as { message?: string })?.message || 'Không thể tạo lại link thanh toán.',
      });
    } finally {
      setRetryPaymentSubmitting(false);
    }
  }, [order, showRetryPayment]);

  const handleCheckPayment = useCallback(async () => {
    if (!orderIdTrimmed || !order || !showCheckPayment) {
      showSnackbar({
        type: SnackbarType.WARNING,
        message: 'Chỉ kiểm tra khi đơn chờ xác nhận, thanh toán chưa thành công và không phải COD.',
      });
      return;
    }

    setCheckPaymentSubmitting(true);
    try {
      const response = await checkOrderPaid(orderIdTrimmed);
      const payload = parseOrderPaymentStatusPayload(response);
      const resolvedPaymentStatus = resolvePaymentStatusFromCheckPaidPayload(payload);

      if (resolvedPaymentStatus === PaymentStatus.PAID) {
        showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đơn hàng đã được thanh toán thành công.' });
      } else if (resolvedPaymentStatus === PaymentStatus.FAILED) {
        showSnackbar({ type: SnackbarType.WARNING, message: 'Thanh toán vẫn đang thất bại. Vui lòng thử lại sau.' });
      } else {
        showSnackbar({ type: SnackbarType.INFO, message: 'Đơn hàng hiện vẫn chưa được thanh toán.' });
      }
      await refetchOrderDetailFresh();
    } catch (e) {
      showSnackbar({
        type: SnackbarType.ERROR,
        message: (e as { message?: string })?.message || 'Không thể kiểm tra trạng thái thanh toán.',
      });
    } finally {
      setCheckPaymentSubmitting(false);
    }
  }, [checkOrderPaid, order, orderIdTrimmed, refetchOrderDetailFresh, showCheckPayment]);

  const handleCreateRefundFromCancelledOrder = useCallback(
    async (payload: CreateRefundFromCancelledOrderPayload): Promise<boolean> => {
      if (!order || !showCreateRefund) {
        showSnackbar({
          type: SnackbarType.WARNING,
          message: 'Đơn hàng chưa đủ điều kiện tạo yêu cầu hoàn tiền.',
        });
        return false;
      }
      setCreateRefundSubmitting(true);
      try {
        await createRefundProposal({
          sourceType: RefundProposalSourceType.CANCEL,
          sourceId: order.id,
          ...payload,
        });
        showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã tạo yêu cầu hoàn tiền.' });
        await refetchOrderDetailFresh();
        return true;
      } catch (e) {
        showSnackbar({
          type: SnackbarType.ERROR,
          message: (e as { message?: string })?.message || 'Không thể tạo yêu cầu hoàn tiền.',
        });
        return false;
      } finally {
        setCreateRefundSubmitting(false);
      }
    },
    [order, refetchOrderDetailFresh, showCreateRefund],
  );

  const handleAddInternalNote = useCallback(() => {
    const text = newInternalNote.trim();
    if (!text) return;
    setInternalNotes((prev) => [
      ...prev,
      {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
        text,
        createdAt: new Date().toISOString(),
      },
    ]);
    setNewInternalNote('');
  }, [newInternalNote]);

  return {
    orderId: orderIdTrimmed,
    order,
    isLoading,
    loadError,
    productDetails,
    lineStockById,
    addressMismatch3pl,
    shippingFeeWarning,
    orderErrorLogEntries,
    internalNotes,
    newInternalNote,
    setNewInternalNote,
    handleAddInternalNote,
    handleCopyOrderCode,
    handleBackToList,
    handleEditOrder,
    handleOpenCustomerProfile,
    stubAction,
    handleDispatchOrder,
    shipOrderSubmitting,
    imagePreviewUrl,
    setImagePreviewUrl,
    cancelOrderDialogOpen,
    setCancelOrderDialogOpen,
    cancelOrderSubmitting,
    handleConfirmCancelOrder,
    confirmPaymentDialogOpen,
    setConfirmPaymentDialogOpen,
    confirmPaymentSubmitting,
    handleConfirmPayment,
    showRetryPayment,
    retryPaymentSubmitting,
    handleRetryPayment,
    showCheckPayment,
    checkPaymentSubmitting,
    handleCheckPayment,
    showCreateRefund,
    createRefundSubmitting,
    handleCreateRefundFromCancelledOrder,
    retryPaymentDialogData,
    setRetryPaymentDialogData,
    refetchOrderDetailFresh,
  };
};
