import type { Inquiry } from "@/apis/inquiry/inquiry.interface";

/** Customer-service fixtures. Customer IDs and order codes join the customer / order fixtures. */
export const INQUIRIES: Inquiry[] = [];

export const findInquiryByCode = (code: string): Inquiry | undefined =>
  INQUIRIES.find((inquiry) => inquiry.code.toLowerCase() === code.trim().toLowerCase());
