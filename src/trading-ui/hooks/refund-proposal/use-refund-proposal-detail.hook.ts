import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import { executePaymentRefund, getRefundProposalDetail, isRefundExecutionSucceeded, rejectRefundProposal, RefundProposalSourceType, type IRefundProposalDetail } from '../../apis/refund-proposal';
import { canApproveRefundProposal, canRejectRefundProposal } from '../../common/constant/refund-proposal/refund-proposal.constants';
import { SnackbarType, useSnackbar } from '../use-snackbar.hook';

/** Lấy `orderId` để gọi execute Payoo refund — RMA dùng `originalOrderId`, CANCEL dùng `sourceId`. */
const resolveRefundOrderId = (detail: IRefundProposalDetail | undefined): string => {
  if (!detail) return '';
  if (detail.originalOrderId?.trim()) return detail.originalOrderId.trim();
  if (detail.sourceType === RefundProposalSourceType.CANCEL) return detail.sourceId?.trim() ?? '';
  return '';
};

const REFUND_PROPOSAL_DETAIL_SWR_KEY = 'refund-proposal-detail' as const;

export const useRefundProposalDetail = () => {
  const params = useParams<{ refundProposalId?: string }>();
  const refundProposalId = (params.refundProposalId ?? '').trim();
  const { showSnackbar } = useSnackbar();

  const [approveSubmitting, setApproveSubmitting] = useState(false);
  const [rejectSubmitting, setRejectSubmitting] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const lastErrorMessageRef = useRef('');

  const swrKey = refundProposalId ? ([REFUND_PROPOSAL_DETAIL_SWR_KEY, refundProposalId] as const) : null;
  const { data, error, isLoading, mutate } = useSWR(swrKey, async () => await getRefundProposalDetail(refundProposalId), { revalidateOnFocus: false, keepPreviousData: true });

  useEffect(() => {
    const message = (error as { message?: string })?.message || '';
    if (!message || message === lastErrorMessageRef.current) return;
    lastErrorMessageRef.current = message;
    showSnackbar({ type: SnackbarType.ERROR, message: message || 'Không tải được chi tiết yêu cầu hoàn tiền.' });
  }, [error]);

  const detail = data as IRefundProposalDetail | undefined;
  const status = detail?.proposalStatus ?? detail?.status;

  const canApprove = useMemo(() => canApproveRefundProposal(status), [status]);
  const canReject = useMemo(() => canRejectRefundProposal(status), [status]);

  /**
   * Xác nhận hoàn tiền: `POST /refund-proposals/orders/:orderId/execute-payment-refund`.
   */
  const handleApprove = useCallback(
    async (attachmentUrl: string, note?: string) => {
      if (!detail || !canApprove || approveSubmitting) return;

      const trimmedUrl = attachmentUrl.trim();
      if (!trimmedUrl) {
        showSnackbar({ type: SnackbarType.WARNING, message: 'Vui lòng đính kèm chứng từ trước khi xác nhận.' });
        return;
      }

      const orderId = resolveRefundOrderId(detail);
      if (!orderId) {
        showSnackbar({
          type: SnackbarType.WARNING,
          message: 'Thiếu mã đơn gốc để thực hiện hoàn tiền. Vui lòng kiểm tra dữ liệu yêu cầu.',
        });
        return;
      }

      setApproveSubmitting(true);
      try {
        const response = await executePaymentRefund(orderId, {
          attachmentUrls: [trimmedUrl],
          note: note?.trim() || undefined,
        });

        const refundStatus = response.refundStatus?.trim().toUpperCase() ?? '';

        if (isRefundExecutionSucceeded(response.refundStatus)) {
          showSnackbar({ type: SnackbarType.SUCCESS, message: 'Duyệt hoàn tiền thành công.' });
        } else if (response.isProcessing || refundStatus === 'PENDING' || refundStatus === 'PROCESSING') {
          showSnackbar({ type: SnackbarType.INFO, message: 'Yêu cầu hoàn tiền đang được xử lý.' });
        } else if (refundStatus === 'FAILED') {
          showSnackbar({
            type: SnackbarType.ERROR,
            message: response.errorMessage || 'Hoàn tiền thất bại.',
          });
        } else {
          showSnackbar({ type: SnackbarType.ERROR, message: response.errorMessage || 'Hoàn tiền thất bại.' });
        }

        setIsApproveDialogOpen(false);
        void mutate();
      } catch (e) {
        showSnackbar({
          type: SnackbarType.ERROR,
          message: (e as { message?: string })?.message || 'Không thực hiện được hoàn tiền.',
        });
      } finally {
        setApproveSubmitting(false);
      }
    },
    [approveSubmitting, canApprove, detail, mutate, showSnackbar],
  );

  const handleReject = useCallback(
    async (note: string) => {
      if (!detail || !canReject || rejectSubmitting) return;
      const trimmedNote = note.trim();
      if (!trimmedNote) {
        showSnackbar({ type: SnackbarType.WARNING, message: 'Vui lòng nhập lý do từ chối.' });
        return;
      }
      setRejectSubmitting(true);
      try {
        await rejectRefundProposal(detail.id, { note: trimmedNote });
        showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã từ chối yêu cầu hoàn tiền.' });
        setIsRejectDialogOpen(false);
        void mutate();
      } catch (e) {
        showSnackbar({
          type: SnackbarType.ERROR,
          message: (e as { message?: string })?.message || 'Không từ chối được yêu cầu hoàn tiền.',
        });
      } finally {
        setRejectSubmitting(false);
      }
    },
    [canReject, detail, mutate, rejectSubmitting],
  );

  return {
    refundProposalId,
    detail,
    isLoading,
    loadError: (error as { message?: string })?.message || '',
    canApprove,
    canReject,
    approveSubmitting,
    rejectSubmitting,
    isApproveDialogOpen,
    setIsApproveDialogOpen,
    isRejectDialogOpen,
    setIsRejectDialogOpen,
    handleApprove,
    handleReject,
    refresh: () => void mutate(),
  };
};
