import { type BaseEntity } from '../../common/constant/api.interface';

export interface Season extends BaseEntity {
  code: string;
  name: string;
  description: string;
  startMonth: number;
  endMonth: number;
  sortOrder: number;
  isActive: boolean;
}
