export enum ProductReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  HIDDEN = 'hidden',
}

export interface ProductReview {
  id: string;
  authorName: string;
  orderCode: string;
  productName: string;
  productSku: string;
  productImage: string;
  rating: number;
  reviewTitle: string;
  reviewContent: string;
  reviewImages: string[];
  createdAt: string;
  status: ProductReviewStatus;
}
