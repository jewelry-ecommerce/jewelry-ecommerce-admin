/** Customer-service inquiry contract. Admin-only domain — the storefront submits, the console resolves. */
export type InquiryChannel = "CONTACT_FORM" | "EMAIL" | "PHONE" | "LIVE_CHAT" | "BOUTIQUE";
export type InquiryTopic = "ORDER" | "PRODUCT" | "SIZING" | "REPAIR" | "APPRAISAL" | "OTHER";
export type InquiryStatus = "NEW" | "IN_PROGRESS" | "WAITING_CUSTOMER" | "RESOLVED" | "CLOSED";
export type InquiryPriority = "LOW" | "NORMAL" | "HIGH";

export type InquiryMessage = {
  id: string;
  sentAt: string;
  author: string;
  isFromCustomer: boolean;
  body: string;
};

export type Inquiry = {
  id: string;
  code: string;
  subject: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerId: string | null;
  relatedOrderCode: string | null;
  channel: InquiryChannel;
  topic: InquiryTopic;
  status: InquiryStatus;
  priority: InquiryPriority;
  assignee: string | null;
  messages: InquiryMessage[];
  createdAt: string;
  updatedAt: string;
};

export type InquiryRow = {
  id: string;
  code: string;
  subject: string;
  customerName: string;
  channel: InquiryChannel;
  topic: InquiryTopic;
  status: InquiryStatus;
  priority: InquiryPriority;
  assignee: string | null;
  relatedOrderCode: string | null;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
};

export type InquiryListQuery = {
  page?: number;
  take?: number;
  search?: string;
  status?: InquiryStatus;
  topic?: InquiryTopic;
};

export type InquiryReplyPayload = {
  code: string;
  body: string;
  author?: string;
};

export type InquiryStatusPayload = {
  code: string;
  status: InquiryStatus;
  assignee?: string | null;
};
