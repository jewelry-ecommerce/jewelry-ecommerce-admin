import type { CollectionStatus } from '../../../../../apis';

export type CollectionFormMode = 'create' | 'edit';

export interface CollectionFormValues {
  name: string;
  description?: string;
  status: CollectionStatus;
}
