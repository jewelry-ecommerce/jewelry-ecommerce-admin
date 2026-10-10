import { type BaseEntity } from '../../common/constant/api.interface';
import { type CategoryStatus } from './category.enum';
import type { Attribute } from '../attribute/attribute.entities';

export interface Category extends BaseEntity {
  name: string;
  level: number;
  slug: string;
  parentId: string | null;
  children?: Category[];
  code?: string;
  logo?: string;
  image?: string;
  taxRate: number;
  directAttributeIds: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  parent?: Category | null;
  directAttributes?: Attribute[];
  inheritedAttributes?: Attribute[];
  effectiveAttributes?: Attribute[];
  status: CategoryStatus;
}
