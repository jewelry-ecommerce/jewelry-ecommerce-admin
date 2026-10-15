import { type Category } from './category.entities';
import { type PageOptionsDto } from '../../common/constant/api.interface';
import { type CategoryStatus } from './category.enum';

export interface CategoryRequestDto {
  name: string;
  code: string;
  isDisplay?: boolean;
  taxRate?: number;
  logo?: string;
  image?: string;
  parentId?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  directAttributeIds?: string[];
  status: CategoryStatus;
}

export interface QueryCategoryDto extends PageOptionsDto<Category> {
  level?: number;
  parentId?: string;
  status?: CategoryStatus;
}

export interface QueryCategoryTreeDto extends PageOptionsDto<Category> {
  compact: boolean;
  status?: CategoryStatus;
}
