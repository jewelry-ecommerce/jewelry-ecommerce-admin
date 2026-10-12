import dayjs from 'dayjs';
import type { Shipment, ShipmentSortField, SortDirection } from './shipping.types';

const getSortableValue = (shipment: Shipment, field: ShipmentSortField): number | string => {
  switch (field) {
    case 'createdAt':
      return dayjs(shipment.createdAt).valueOf();
    case 'orderCode':
      return shipment.orderCode;
    case 'trackingCode':
      return shipment.trackingCode;
    case 'codAmount':
      return shipment.codAmount;
    case 'estimatedFee':
      return shipment.estimatedFee;
    case 'actualFee':
      return shipment.actualFee;
    default:
      return '';
  }
};

export const sortShipments = (shipments: Shipment[], field: ShipmentSortField, direction: SortDirection) => {
  return shipments
    .map((shipment, index) => ({ shipment, index }))
    .sort((left, right) => {
      const leftValue = getSortableValue(left.shipment, field);
      const rightValue = getSortableValue(right.shipment, field);

      let comparison = 0;

      if (typeof leftValue === 'number' && typeof rightValue === 'number') {
        comparison = leftValue - rightValue;
      } else {
        comparison = String(leftValue).localeCompare(String(rightValue), 'vi', {
          sensitivity: 'base',
          numeric: true,
        });
      }

      if (comparison === 0) {
        comparison = left.index - right.index;
      }

      return direction === 'asc' ? comparison : -comparison;
    })
    .map(({ shipment }) => shipment);
};
