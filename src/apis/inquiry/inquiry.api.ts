import type { Inquiry, InquiryListQuery, InquiryReplyPayload, InquiryRow, InquiryStatusPayload } from "@/apis/inquiry/inquiry.interface";
import type { Paginated } from "@/apis/product/product.interface";
import { apiRequest } from "@/apis/transport";
import { findInquiryByCode, INQUIRIES } from "@/mocks/data/inquiry.data";
import { cloneDeep, matchesSearch, MockApiError, normalizeSearch, paginate, withLatency } from "@/mocks/mock-transport";

const DEFAULT_ACTOR = "admin.console";

const toInquiryRow = (inquiry: Inquiry): InquiryRow => ({
  id: inquiry.id,
  code: inquiry.code,
  subject: inquiry.subject,
  customerName: inquiry.customerName,
  channel: inquiry.channel,
  topic: inquiry.topic,
  status: inquiry.status,
  priority: inquiry.priority,
  assignee: inquiry.assignee,
  relatedOrderCode: inquiry.relatedOrderCode,
  messageCount: inquiry.messages.length,
  createdAt: inquiry.createdAt,
  updatedAt: inquiry.updatedAt,
});

const requireInquiry = (code: string): Inquiry => {
  const inquiry = findInquiryByCode(code);
  if (!inquiry) throw new MockApiError("INQUIRY_NOT_FOUND", `No inquiry matches the code ${code}.`, 404);
  return inquiry;
};

/** GET admin/inquiries */
export const getInquiryList = (query: InquiryListQuery = {}): Promise<Paginated<InquiryRow>> =>
  apiRequest({
    method: "GET",
    path: "admin/inquiries",
    query: { ...query },
    mock: () =>
      withLatency(() => {
        const search = normalizeSearch(query.search);
        const matched = INQUIRIES.filter((inquiry) => {
          if (query.status && inquiry.status !== query.status) return false;
          if (query.topic && inquiry.topic !== query.topic) return false;
          return matchesSearch(
            [inquiry.code, inquiry.subject, inquiry.customerName, inquiry.customerEmail, inquiry.relatedOrderCode],
            search,
          );
        }).sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

        const page = paginate(matched, query.page ?? 1, query.take ?? 20);
        return { ...page, list: page.list.map(toInquiryRow) };
      }),
  });

/** GET admin/inquiries/{code} */
export const getInquiryDetail = (code: string): Promise<Inquiry> =>
  apiRequest({
    method: "GET",
    path: `admin/inquiries/${encodeURIComponent(code)}`,
    mock: () => withLatency(() => cloneDeep(requireInquiry(code))),
  });

/** POST admin/inquiries/{code}/replies */
export const replyToInquiry = ({ code, body, author = DEFAULT_ACTOR }: InquiryReplyPayload): Promise<Inquiry> =>
  apiRequest({
    method: "POST",
    path: `admin/inquiries/${encodeURIComponent(code)}/replies`,
    body: { body },
    mock: () =>
      withLatency(() => {
        const inquiry = requireInquiry(code);
        if (!body.trim()) throw new MockApiError("INQUIRY_REPLY_EMPTY", "A reply cannot be empty.", 422);
        if (inquiry.status === "CLOSED")
          throw new MockApiError("INQUIRY_CLOSED", `Inquiry ${code} is closed and cannot receive replies.`, 409);

        const sentAt = new Date().toISOString();
        inquiry.messages.push({ id: `${inquiry.id}-m${inquiry.messages.length + 1}`, sentAt, author, isFromCustomer: false, body });
        inquiry.status = inquiry.status === "NEW" ? "IN_PROGRESS" : inquiry.status;
        inquiry.assignee = inquiry.assignee ?? author;
        inquiry.updatedAt = sentAt;
        return cloneDeep(inquiry);
      }),
  });

/** PATCH admin/inquiries/{code}/status */
export const updateInquiryStatus = ({ code, status, assignee }: InquiryStatusPayload): Promise<Inquiry> =>
  apiRequest({
    method: "PATCH",
    path: `admin/inquiries/${encodeURIComponent(code)}/status`,
    body: { status, assignee },
    mock: () =>
      withLatency(() => {
        const inquiry = requireInquiry(code);
        inquiry.status = status;
        if (assignee !== undefined) inquiry.assignee = assignee;
        inquiry.updatedAt = new Date().toISOString();
        return cloneDeep(inquiry);
      }),
  });
