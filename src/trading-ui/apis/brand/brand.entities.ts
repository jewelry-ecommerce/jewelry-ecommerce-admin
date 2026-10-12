import { type BaseEntity } from '../../common/constant/api.interface';
import { type BrandStatus } from './brand.enum';

export interface Brand extends BaseEntity {
  name: string;
  code: string;
  image?: string | null;
  websiteUrl?: string | null;
  status: BrandStatus | string;
  tenantCode?: string | null;
}
