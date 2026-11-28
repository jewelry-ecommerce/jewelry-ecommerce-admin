import { backendRequest } from '../backend-request';

export type JavaProductReview = {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  title: string;
  content: string;
  images: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminReply?: string | null;
  rejectedReason?: string | null;
  createdAt?: string;
};

export const javaListProductReviews = (status?: string) => {
  const query = status && status !== 'ALL' ? `?status=${encodeURIComponent(status)}` : '';
  return backendRequest<JavaProductReview[]>(`admin/product-reviews${query}`, 'GET');
};

export const javaApproveProductReview = (id: string, reply?: string) =>
  backendRequest<JavaProductReview>(`admin/product-reviews/${id}/approve`, 'POST', reply ? { reply } : {});

export const javaRejectProductReview = (id: string, reason?: string) =>
  backendRequest<JavaProductReview>(`admin/product-reviews/${id}/reject`, 'POST', reason ? { reason } : {});

export const javaReplyProductReview = (id: string, reply: string) =>
  backendRequest<JavaProductReview>(`admin/product-reviews/${id}/reply`, 'POST', { reply });
