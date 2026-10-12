export type OrderImportRowStatus = 'valid' | 'error' | 'warning';

export interface OrderImportIssue {
  message: string;
}

/** UI row shape used by preview table. */
export interface OrderImportPreviewRow {
  stt: number;
  originalOrderCode: string;
  source: string;
  customerName: string;
  sku: string;
  totalAmount: number | null;
  status: OrderImportRowStatus;
  issues?: OrderImportIssue[];
}

export interface OrderImportValidateSummary {
  totalOrders: number;
  validCount: number;
  errorCount: number;
  warningCount: number;
}

/** Mapped validate result for dialog step 3. */
export interface OrderImportValidateResult {
  sessionId: string;
  progressPercent: number;
  summary: OrderImportValidateSummary;
  previewRows: OrderImportPreviewRow[];
  previewTotal: number;
  errorFileUrl?: string | null;
}

/** Raw BE response — POST order/orders/import/validate */
export interface OrderImportValidateApiPreviewRow {
  rowNumber: number;
  originalOrderRef: string;
  sourceLabel: string;
  customerName: string;
  skuPreview: string;
  grandTotalMinor: number | null;
  status: OrderImportRowStatus;
  issues?: Array<string | { message?: string; code?: string }>;
}

export interface OrderImportValidateApiResponse {
  sessionId: string;
  progressPercent?: number;
  summary: OrderImportValidateSummary;
  preview: OrderImportValidateApiPreviewRow[];
  totalRows: number;
}

/** Raw BE response — POST order/orders/import/sessions/:sessionId/confirm */
export interface OrderImportConfirmApiResponse {
  sessionId: string;
  jobId: string;
  status: string;
  totalOrders: number;
}

export interface OrderImportConfirmResult {
  sessionId: string;
  jobId: string;
  status: string;
  totalOrders: number;
}

/** Result after IE job reaches DONE — shown on final wizard step. */
export interface OrderImportJobResult {
  jobId: string;
  fileUrl?: string | null;
  fileName?: string | null;
  /** Expected/total rows — from importStats when present, else confirm payload. */
  totalRows: number;
  /** null when IE job did not return importStats (do not assume success). */
  successRows: number | null;
  /** null when IE job did not return importStats (do not assume zero failures). */
  failedRows: number | null;
  /** Whether success/failed counts came from real IE importStats. */
  hasImportStats: boolean;
}
