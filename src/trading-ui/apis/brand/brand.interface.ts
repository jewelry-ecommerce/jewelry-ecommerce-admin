import { type PageOptionsDto } from '../../common/constant/api.interface';
import { type Brand } from './brand.entities';

export interface QueryBrandDto extends PageOptionsDto<Brand> {
  status?: string;
}

export interface CreateBrandDto {
  name: string;
  code: string;
  image?: string | null;
  websiteUrl?: string | null;
  status?: string;
  tenantCode?: string | null;
}

export type UpdateBrandDto = Partial<CreateBrandDto>;
