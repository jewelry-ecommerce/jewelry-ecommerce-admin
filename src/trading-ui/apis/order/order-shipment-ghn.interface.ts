export type GhnWaybillPageSize = '4x6' | (string & {});

export interface GhnPrintWaybillRequest {
  orderCode: string;
  labelSize?: GhnWaybillPageSize;
}

export interface GhnPrintWaybillResult {
  token: string;
  printUrl: string;
  trackingCode: string;
}

export interface GhnSyncShipmentByClientCodeRequest {
  clientOrderCode: string;
}
