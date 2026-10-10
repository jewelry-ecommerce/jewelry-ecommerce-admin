import { type BaseEntity } from '../../common/constant/api.interface';
import { type CollectionStatus } from './collection.enum';

import { type Product } from '../product/product.entities';

export interface ProductCollection extends BaseEntity {
  collectionId: string;
  productId: string;
  order: number;
  product?: Product;
}

export interface Collection extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  brandId?: string;
  brand?: { id: string; name: string };
  status?: CollectionStatus | string;
  tenantCode?: string;
  productCollections?: ProductCollection[];
}
