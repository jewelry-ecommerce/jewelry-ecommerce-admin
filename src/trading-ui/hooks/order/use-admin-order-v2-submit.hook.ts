import { useCallback, useRef, useState, type Dispatch, type MutableRefObject, type SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder, type IAdminCreateOrderV2Request, type ICreateOrderResponse } from '../../apis/order';
import { ADMIN_ORDER_V2_ERROR_CODE, ADMIN_ORDER_V2_MESSAGE } from '../../common/constant/order/admin-order-v2.constants';
import { getAdminOrderApiErrorCode, getAdminOrderApiErrorMessage, isAdminOrderResultUncertain } from '../../common/utils/order/admin-order-v2.util';
import { getOrderDetailPath } from '@/trading-ui/router/route.path';
import { SnackbarType, useSnackbar } from '../use-snackbar.hook';

interface UseAdminOrderV2SubmitArgs {
  onPaymentLink: (created: ICreateOrderResponse) => void;
  onPriceChanged: (error: unknown) => void;
}

interface PendingCreateAttempt {
  payload: IAdminCreateOrderV2Request;
  resultUncertain: boolean;
}

const useAdminOrderSubmitSuccess = (
  pendingAttemptRef: MutableRefObject<PendingCreateAttempt | null>,
  setHasUncertainAttempt: Dispatch<SetStateAction<boolean>>,
  onPaymentLink: (created: ICreateOrderResponse) => void,
) => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  return useCallback(
    (created: ICreateOrderResponse) => {
      pendingAttemptRef.current = null;
      setHasUncertainAttempt(false);
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã tạo đơn hàng.' });
      if (created.paymentUrl) {
        onPaymentLink(created);
        return;
      }
      navigate(getOrderDetailPath(created.orderId));
    },
    [navigate, onPaymentLink, pendingAttemptRef, setHasUncertainAttempt, showSnackbar],
  );
};

const useAdminOrderSubmitFailure = (
  pendingAttemptRef: MutableRefObject<PendingCreateAttempt | null>,
  setHasUncertainAttempt: Dispatch<SetStateAction<boolean>>,
  onPriceChanged: (error: unknown) => void,
) => {
  const { showSnackbar } = useSnackbar();
  return useCallback(
    (error: unknown, payload: IAdminCreateOrderV2Request) => {
      const code = getAdminOrderApiErrorCode(error);
      if (code === ADMIN_ORDER_V2_ERROR_CODE.PRICE_CHANGED || code === 'ORDER_PRICING_CHANGED') {
        pendingAttemptRef.current = null;
        setHasUncertainAttempt(false);
        onPriceChanged(error);
        showSnackbar({ type: SnackbarType.WARNING, message: ADMIN_ORDER_V2_MESSAGE.PRICE_CHANGED });
        return;
      }
      const resultUncertain = isAdminOrderResultUncertain(error);
      pendingAttemptRef.current = { payload, resultUncertain };
      setHasUncertainAttempt(resultUncertain);
      const fallback = resultUncertain ? ADMIN_ORDER_V2_MESSAGE.UNCERTAIN_RESULT : 'Tạo đơn thất bại.';
      showSnackbar({
        type: resultUncertain ? SnackbarType.WARNING : SnackbarType.ERROR,
        message: getAdminOrderApiErrorMessage(error, fallback),
      });
    },
    [onPriceChanged, pendingAttemptRef, setHasUncertainAttempt, showSnackbar],
  );
};

export function useAdminOrderV2Submit({ onPaymentLink, onPriceChanged }: UseAdminOrderV2SubmitArgs) {
  const [submitting, setSubmitting] = useState(false);
  const [hasUncertainAttempt, setHasUncertainAttempt] = useState(false);
  const pendingAttemptRef = useRef<PendingCreateAttempt | null>(null);
  const submitLockRef = useRef(false);

  const finishSuccess = useAdminOrderSubmitSuccess(pendingAttemptRef, setHasUncertainAttempt, onPaymentLink);
  const handleFailure = useAdminOrderSubmitFailure(pendingAttemptRef, setHasUncertainAttempt, onPriceChanged);

  const submit = useCallback(
    async (payload: IAdminCreateOrderV2Request | null) => {
      if (submitLockRef.current) return;
      const pendingAttempt = pendingAttemptRef.current;
      const request = pendingAttempt?.resultUncertain ? pendingAttempt.payload : payload;
      if (!request) return;

      submitLockRef.current = true;
      setSubmitting(true);
      try {
        const created = await createOrder(request);
        finishSuccess(created);
      } catch (error) {
        handleFailure(error, request);
      } finally {
        submitLockRef.current = false;
        setSubmitting(false);
      }
    },
    [finishSuccess, handleFailure],
  );

  const retryPending = useCallback(async () => {
    await submit(null);
  }, [submit]);

  return {
    submitting,
    hasUncertainAttempt,
    submit,
    retryPending,
  };
}
