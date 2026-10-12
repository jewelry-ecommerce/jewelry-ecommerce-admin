import { type CollectionStatus, type Collection } from '../../../../../apis';

export interface ProductCollectionCreateFormValues {
  name: string;
  description?: string;
  status: CollectionStatus;
}

export interface ProductCollectionDialogFormValues {
  name: string;
  description?: string;
  brandId?: string;
  status: CollectionStatus;
}

export type ProductCollectionRow = Collection;
