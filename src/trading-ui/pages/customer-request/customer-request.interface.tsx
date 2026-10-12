import type { CustomerRequestListItem } from '../../apis/customer-request';

export type CustomerRequestPageRow = CustomerRequestListItem;

export interface CustomerRequestStatusOption {
  value: string;
  label: string;
}

export interface CustomerRequestStatusUpdateDialogState {
  open: boolean;
  status: string;
}
