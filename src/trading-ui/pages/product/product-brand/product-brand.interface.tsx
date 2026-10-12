import { type BrandStatus } from '../../../apis';

export interface ProductBrand {
  id: string;
  code: string; // 2 chars
  name: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  status: BrandStatus;
}

export interface ProductBrandDialogFormValues {
  code: string;
  name: string;
  websiteUrl?: string;
  description?: string;
  logoUrl?: string;
  status: BrandStatus;
}
