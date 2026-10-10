import type { ProductCollection } from '../../../../../apis/collection/collection.entities';
import type { Product } from '../../../../../apis/product/product.entities';

export interface CollectionDetailHeaderInfo {
  id: string;
  name: string;
  description?: string;
  brandName: string;
  brandId?: string;
  isActive: boolean;
}

export interface CollectionDetailRow extends ProductCollection {
  product: Product;
}
