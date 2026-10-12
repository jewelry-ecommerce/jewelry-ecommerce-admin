import type { StatusPillConfig } from '../../../components/status-pill';
import type { OrderStatus } from '../../../pages/order/order.types';
import { ORDER_STATUS_LABELS } from './order.constants';

const pendingVariant = {
  color: '#B54708',
  backgroundColor: '#FFFAEB',
  borderColor: '#FDE68A',
};

const infoVariant = {
  color: '#155EEF',
  backgroundColor: '#EFF8FF',
  borderColor: '#B2DDFF',
};

const violetVariant = {
  color: '#7A5AF8',
  backgroundColor: '#F4F3FF',
  borderColor: '#D9D6FE',
};

const successVariant = {
  color: '#027A48',
  backgroundColor: '#ECFDF3',
  borderColor: '#ABEFC6',
};

const dangerVariant = {
  color: '#B42318',
  backgroundColor: '#FEF3F2',
  borderColor: '#FECDCA',
};

const warningVariant = {
  color: '#B93815',
  backgroundColor: '#FFF6ED',
  borderColor: '#F9DBAF',
};

export const ORDER_STATUS_PILL_CONFIG: StatusPillConfig<OrderStatus> = {
  Pending: {
    label: ORDER_STATUS_LABELS.Pending,
    ...pendingVariant,
  },
  Confirmed: {
    label: ORDER_STATUS_LABELS.Confirmed,
    ...infoVariant,
  },
  Picking: {
    label: ORDER_STATUS_LABELS.Picking,
    ...violetVariant,
  },
  Packed: {
    label: ORDER_STATUS_LABELS.Packed,
    ...violetVariant,
  },
  Shipping: {
    label: ORDER_STATUS_LABELS.Shipping,
    ...infoVariant,
  },
  InTransit: {
    label: ORDER_STATUS_LABELS.InTransit,
    ...infoVariant,
  },
  Delivered: {
    label: ORDER_STATUS_LABELS.Delivered,
    ...successVariant,
  },
  Completed: {
    label: ORDER_STATUS_LABELS.Completed,
    ...successVariant,
  },
  DeliveryFailed: {
    label: ORDER_STATUS_LABELS.DeliveryFailed,
    ...dangerVariant,
  },
  Cancelled: {
    label: ORDER_STATUS_LABELS.Cancelled,
    ...dangerVariant,
  },
  ReturnProcessing: {
    label: ORDER_STATUS_LABELS.ReturnProcessing,
    ...warningVariant,
  },
  Returned: {
    label: ORDER_STATUS_LABELS.Returned,
    ...warningVariant,
  },
  Refunded: {
    label: ORDER_STATUS_LABELS.Refunded,
    ...warningVariant,
  },
};
