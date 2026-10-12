import type {
  OrderImportConfirmApiResponse,
  OrderImportConfirmResult,
  OrderImportIssue,
  OrderImportPreviewRow,
  OrderImportValidateApiPreviewRow,
  OrderImportValidateApiResponse,
  OrderImportValidateResult,
} from './order-import.interface';

const mapIssue = (issue: string | { message?: string; code?: string }): OrderImportIssue | null => {
  if (typeof issue === 'string') {
    const message = issue.trim();
    return message ? { message } : null;
  }
  const message = (issue.message ?? issue.code ?? '').trim();
  return message ? { message } : null;
};

const mapPreviewRow = (row: OrderImportValidateApiPreviewRow): OrderImportPreviewRow => {
  const issues = (row.issues ?? []).map(mapIssue).filter((item): item is OrderImportIssue => Boolean(item));

  return {
    stt: row.rowNumber,
    originalOrderCode: row.originalOrderRef?.trim() ?? '',
    source: row.sourceLabel?.trim() ?? '',
    customerName: row.customerName?.trim() ?? '',
    sku: row.skuPreview?.trim() ?? '',
    totalAmount: typeof row.grandTotalMinor === 'number' && Number.isFinite(row.grandTotalMinor) ? row.grandTotalMinor : null,
    status: row.status,
    issues: issues.length ? issues : undefined,
  };
};

export const mapOrderImportValidateResponse = (payload: OrderImportValidateApiResponse): OrderImportValidateResult => {
  const previewRows = (payload.preview ?? []).map(mapPreviewRow);

  return {
    sessionId: payload.sessionId,
    progressPercent: typeof payload.progressPercent === 'number' ? payload.progressPercent : 100,
    summary: {
      totalOrders: payload.summary?.totalOrders ?? 0,
      validCount: payload.summary?.validCount ?? 0,
      errorCount: payload.summary?.errorCount ?? 0,
      warningCount: payload.summary?.warningCount ?? 0,
    },
    previewRows,
    previewTotal: payload.totalRows ?? previewRows.length,
    errorFileUrl: null,
  };
};

export const mapOrderImportConfirmResponse = (payload: OrderImportConfirmApiResponse): OrderImportConfirmResult => ({
  sessionId: payload.sessionId,
  jobId: payload.jobId,
  status: payload.status,
  totalOrders: payload.totalOrders,
});
