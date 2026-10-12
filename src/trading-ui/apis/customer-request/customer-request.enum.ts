export enum CustomerRequestType {
  BACK_IN_STOCK = 'BACK_IN_STOCK',
  ORDER_SUPPORT = 'ORDER_SUPPORT',
  NEWSLETTER = 'NEWSLETTER',
}

export enum CustomerRequestContactChannel {
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
}

export enum BackInStockRequestStatus {
  NEW = 'NEW',
  UNPROCESSED = 'UNPROCESSED',
  CONTACTED = 'CONTACTED',
}

export enum OrderSupportRequestStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum NewsletterRequestStatus {
  NEW = 'NEW',
  UNPROCESSED = 'UNPROCESSED',
  CONTACTED = 'CONTACTED',
}

export enum CustomerRequestOrderType {
  ORDER = 'ORDER',
  PRE_ORDER = 'PRE_ORDER',
}
