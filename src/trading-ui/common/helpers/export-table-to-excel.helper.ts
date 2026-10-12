import * as XLSX from 'xlsx';

export interface ExportTableToExcelOptions {
  data?: Array<Record<string, unknown>>;
  tableId?: string;
  fileName?: string;
  sheetName?: string;
}

const DEFAULT_FILE_NAME = 'export.xlsx';
const DEFAULT_SHEET_NAME = 'Sheet1';

const NUMERIC_STRING_REGEX = /^-?(0|[1-9]\d*)(\.\d+)?$/;
const DATE_LIKE_REGEX = /^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?$/;

const isNumericString = (value: string): boolean => {
  const normalized = value.trim();

  if (!NUMERIC_STRING_REGEX.test(normalized)) {
    return false;
  }

  // Keep very long numbers as text to avoid precision loss in Excel.
  const digitsOnlyLength = normalized.replace(/[-.]/g, '').length;
  if (digitsOnlyLength > 15) {
    return false;
  }

  // Keep values with leading zero (e.g. phone, zip code) as text.
  if (/^-?0\d+/.test(normalized)) {
    return false;
  }

  return Number.isFinite(Number(normalized));
};

const isDateLikeString = (value: string): boolean => {
  const normalized = value.trim();

  if (!DATE_LIKE_REGEX.test(normalized)) {
    return false;
  }

  return !Number.isNaN(Date.parse(normalized));
};

const normalizeWorksheetCellType = (cell: XLSX.CellObject | undefined): void => {
  if (!cell || cell.t !== 's' || typeof cell.v !== 'string') {
    return;
  }

  const rawValue = cell.v.trim();
  if (!rawValue) {
    return;
  }

  if (isNumericString(rawValue)) {
    cell.t = 'n';
    cell.v = Number(rawValue);
    return;
  }

  if (isDateLikeString(rawValue)) {
    cell.t = 'd';
    cell.v = new Date(rawValue);
    cell.z = 'yyyy-mm-dd hh:mm:ss';
  }
};

const normalizeWorksheet = (worksheet: XLSX.WorkSheet): void => {
  const ref = worksheet['!ref'];
  if (!ref) {
    return;
  }

  const range = XLSX.utils.decode_range(ref);

  // Skip first row because it is header.
  for (let row = range.s.r + 1; row <= range.e.r; row += 1) {
    for (let col = range.s.c; col <= range.e.c; col += 1) {
      const address = XLSX.utils.encode_cell({ r: row, c: col });
      normalizeWorksheetCellType(worksheet[address]);
    }
  }
};

const collectHeaders = (rows: Array<Record<string, unknown>>): string[] => {
  const headerSet = new Set<string>();

  rows.forEach((row) => {
    Object.keys(row).forEach((key) => headerSet.add(key));
  });

  return Array.from(headerSet);
};

const normalizeRowsByHeaders = (rows: Array<Record<string, unknown>>, headers: string[]): Array<Record<string, unknown>> => {
  return rows.map((row) => {
    const normalizedRow: Record<string, unknown> = {};

    headers.forEach((header) => {
      normalizedRow[header] = row[header] ?? '';
    });

    return normalizedRow;
  });
};

const createWorksheetFromData = (rows: Array<Record<string, unknown>>): XLSX.WorkSheet => {
  const headers = collectHeaders(rows);
  const normalizedRows = normalizeRowsByHeaders(rows, headers);

  const worksheet = XLSX.utils.json_to_sheet(normalizedRows, {
    header: headers,
    skipHeader: false,
  });

  normalizeWorksheet(worksheet);
  return worksheet;
};

const createWorksheetFromTableId = (tableId: string): XLSX.WorkSheet => {
  const tableElement = document.getElementById(tableId);

  if (!tableElement || !(tableElement instanceof HTMLTableElement)) {
    throw new Error(`Cannot find HTML table with id "${tableId}".`);
  }

  const worksheet = XLSX.utils.table_to_sheet(tableElement, { raw: true });
  normalizeWorksheet(worksheet);
  return worksheet;
};

/**
 * Plug-and-play helper to export object array or HTML table to Excel.
 *
 * Example 1:
 * exportTableToExcel({ data: rows, fileName: 'orders.xlsx', sheetName: 'Orders' });
 *
 * Example 2:
 * exportTableToExcel({ tableId: 'orders-table', fileName: 'orders.xlsx' });
 */
export const exportTableToExcel = ({ data, tableId, fileName = DEFAULT_FILE_NAME, sheetName = DEFAULT_SHEET_NAME }: ExportTableToExcelOptions): void => {
  if (typeof window === 'undefined') {
    throw new Error('exportTableToExcel can only run in browser environment.');
  }

  const hasData = Array.isArray(data);
  const hasTableId = typeof tableId === 'string' && tableId.trim().length > 0;

  if (hasData === hasTableId) {
    throw new Error('Provide exactly one input: "data" OR "tableId".');
  }

  if (hasData && data.length === 0) {
    throw new Error('Cannot export empty data array.');
  }

  const worksheet = hasData ? createWorksheetFromData(data) : createWorksheetFromTableId(tableId!);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const normalizedFileName = fileName.toLowerCase().endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
  XLSX.writeFile(workbook, normalizedFileName);
};
