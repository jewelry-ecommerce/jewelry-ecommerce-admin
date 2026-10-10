import { type PageOptionsDto } from '../../common/constant/api.interface';
import { type Collection } from './collection.entities';
import { type CollectionStatus, type UpdateCollectionAction } from './collection.enum';

export interface CreateCollectionDto {
  name: string;
  description?: string;
  slug?: string;
  image?: string;
  brandId?: string; // check lại field này bên ATSH
  productIds?: string[];
  status: CollectionStatus;
}

export type UpdateCollectionDto = Partial<CreateCollectionDto>;
export interface QueryCollectionDto extends PageOptionsDto<Collection> {
  brandId?: string;
  status?: CollectionStatus;
}
export interface UpdateCollectionByProductIdDto {
  productIds?: string[];
  action: UpdateCollectionAction;
}
