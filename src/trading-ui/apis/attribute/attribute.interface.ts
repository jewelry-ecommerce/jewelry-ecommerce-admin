import { type PageOptionsDto } from '../../common/constant/api.interface';
import { type Attribute } from './attribute.entities';
import { type AttributeDisplayType } from './attribute.enum';
import { type AttributeStatus } from './attribute.enum';

export interface CreateAttributeValueDto {
  value: string;
  code: string;
  image?: string;
}

export interface AttributeRequestDto {
  name: string;
  code: string;
  displayType: AttributeDisplayType;
  status: AttributeStatus;
  values: CreateAttributeValueDto[];
  isVariantAxis?: boolean;
}

export interface QueryAttributeDto extends PageOptionsDto<Attribute> {
  status?: AttributeStatus;
  categoryId?: string;
}

export type UpdateAttributeValueDto = Partial<CreateAttributeValueDto>;
