import { axiosRequest } from '../../common/config/axios.config';
import { normalizeExecuteRefundResponse } from './refund-proposal.interface';
import type {
  IApproveRefundProposalRequest,
  IConfirmRefundProposalManualRequest,
  IExecutePaymentRefundRequest,
  ICreateRefundProposalRequest,
  IExecuteRefundResponse,
  IGetRefundByIdempotencyKeyParams,
  IRefundProposalDetail,
  IRefundProposalEligibilityQuery,
  IRefundProposalEligibilityResponse,
  IRefundProposalListItem,
  IRefundProposalListQuery,
  IRefundProposalListResponse,
  IRejectRefundProposalRequest,
} from './refund-proposal.interface';

const REFUND_PROPOSAL_BASE_PATH = 'order/refund-proposals';

/** GET /refund-proposals/eligibility — kiểm tra nút Hoàn tiền có hiển thị không (US-08). */
export const checkRefundProposalEligibility = async (params: IRefundProposalEligibilityQuery): Promise<IRefundProposalEligibilityResponse> =>
  await axiosRequest.get(`${REFUND_PROPOSAL_BASE_PATH}/eligibility`, { params });

/** POST /refund-proposals — Tạo lệnh đề xuất hoàn tiền (US-08). */
export const createRefundProposal = async (request: ICreateRefundProposalRequest): Promise<IRefundProposalDetail> => await axiosRequest.post(REFUND_PROPOSAL_BASE_PATH, request);

/** GET /refund-proposals — Danh sách (US-10). Spec mới trả array thuần; vẫn unwrap nếu BE bọc `{data}` / `{list}`. */
export const getRefundProposalList = async (params?: IRefundProposalListQuery): Promise<IRefundProposalListResponse> => {
  const raw = (await axiosRequest.get(REFUND_PROPOSAL_BASE_PATH, { params })) as unknown;
  const payload = (raw as { data?: unknown })?.data ?? raw;

  if (Array.isArray(payload)) {
    return { list: payload as IRefundProposalListItem[], total: payload.length };
  }
  const obj = (payload ?? {}) as Partial<IRefundProposalListResponse>;
  return { list: obj.list ?? [], total: obj.total ?? obj.list?.length ?? 0, summary: obj.summary };
};

/** GET /refund-proposals/:id — Chi tiết (US-11). */
export const getRefundProposalDetail = async (id: string): Promise<IRefundProposalDetail> => await axiosRequest.get(`${REFUND_PROPOSAL_BASE_PATH}/${encodeURIComponent(id)}`);

/**
 * POST /refund-proposals/:id/approve — Kế toán phê duyệt (US-09).
 * @deprecated Luồng xác nhận hoàn tiền dùng `executePaymentRefund`.
 */
export const approveRefundProposal = async (id: string, request: IApproveRefundProposalRequest): Promise<IRefundProposalDetail> =>
  await axiosRequest.post(`${REFUND_PROPOSAL_BASE_PATH}/${encodeURIComponent(id)}/approve`, request);

/** PATCH /refund-proposals/:id/reject — Từ chối yêu cầu hoàn tiền. */
export const rejectRefundProposal = async (id: string, request: IRejectRefundProposalRequest): Promise<IRefundProposalDetail> =>
  await axiosRequest.patch(`${REFUND_PROPOSAL_BASE_PATH}/${encodeURIComponent(id)}/reject`, request);

/**
 * POST /refund-proposals/:id/confirm-manual — Xác nhận đã chuyển khoản (US-11 AC2).
 * @deprecated Chưa có trong spec API mới (2026-05-21). Xác nhận với BE trước khi gọi.
 */
export const confirmRefundProposalManual = async (id: string, request: IConfirmRefundProposalManualRequest): Promise<IRefundProposalDetail> =>
  await axiosRequest.post(`${REFUND_PROPOSAL_BASE_PATH}/${encodeURIComponent(id)}/confirm-manual`, request);

/**
 * POST /refund-proposals/orders/:orderId/execute-payment-refund — thực hiện hoàn tiền (US-08 §9).
 */
export const executePaymentRefund = async (orderId: string, request: IExecutePaymentRefundRequest): Promise<IExecuteRefundResponse> => {
  const raw = await axiosRequest.post(`${REFUND_PROPOSAL_BASE_PATH}/orders/${encodeURIComponent(orderId)}/execute-payment-refund`, request);
  return normalizeExecuteRefundResponse(raw);
};

/** @deprecated Dùng `executePaymentRefund`. */
export const executePayooRefund = executePaymentRefund;

/**
 * GET /refund-proposals/orders/:orderId/payment-refund/by-idempotency-key/:idempotencyKey
 * — Internal: tra trạng thái refund Payoo theo idempotency key để retry an toàn (US-08 §10).
 */
export const getRefundByIdempotencyKey = async ({ orderId, idempotencyKey }: IGetRefundByIdempotencyKeyParams): Promise<IExecuteRefundResponse> =>
  await axiosRequest.get(`${REFUND_PROPOSAL_BASE_PATH}/orders/${encodeURIComponent(orderId)}/payment-refund/by-idempotency-key/${encodeURIComponent(idempotencyKey)}`);
