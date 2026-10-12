export enum ShipmentStatus {
  PENDING = 'Pending',
  READY = 'Ready',
  PICKED_UP = 'PickedUp',
  IN_TRANSIT = 'InTransit',
  DELIVERED = 'Delivered',
  FAILED = 'Failed',
  RETURNED = 'Returned',
  CANCELLED = 'Cancelled',
}

export enum ShipmentCarrier {
  GHN = 'GHN',
  // GHTK = 'GHTK',
  // VNPOST = 'VNPost',
  // VIETTEL_POST = 'ViettelPost',
  // OTHER = 'Other',
}

export enum ShipmentSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  SHIPMENT_CODE = 'shipmentCode',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum ShipmentType {
  OUTBOUND = 'Outbound',
  RETURN = 'Return',
}
