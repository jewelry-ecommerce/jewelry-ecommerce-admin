import type { CollectionStatus } from '@/trading-ui/apis/pim';

export type CollectionFormMode = 'create' | 'edit';

export interface CollectionFormValues {
  name: string;
  description?: string;
  status: CollectionStatus;
}
