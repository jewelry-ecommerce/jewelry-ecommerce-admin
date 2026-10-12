export interface SearchPinnedProduct {
  id: string;
  keywordPattern: string | null;
  productId: string;
  position: number;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchPinnedListResponse {
  total: number;
  list: SearchPinnedProduct[];
}

export interface CreateSearchPinnedDto {
  keywordPattern?: string | null;
  productId: string;
  position?: number;
  startDate?: string | null;
  endDate?: string | null;
}

export interface UpdateSearchPinnedDto {
  keywordPattern?: string | null;
  productId?: string;
  position?: number;
  startDate?: string | null;
  endDate?: string | null;
  isActive?: boolean;
}
