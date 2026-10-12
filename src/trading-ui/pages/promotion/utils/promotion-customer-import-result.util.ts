import { importExportApi, type ImportJobResultRow } from '../../../apis';

export type PromotionCustomerImportResolvedData = {
  phone?: string;
  normalizedPhone?: string;
  customerId?: string;
  userId?: string;
  memberId?: string;
  loyaltyCustomerId?: string;
  fullName?: string;
  memberCode?: string;
  status?: string;
};

/**
 * Display row from IE OK result rows.
 * Never write phone-only / imported customerId into form customerIds (manual only).
 */
export type PromotionImportedCustomerRow = {
  phone: string;
  normalizedPhone?: string;
  customerId?: string;
  userId?: string;
  memberId?: string;
  loyaltyCustomerId?: string;
  fullName?: string | null;
  memberCode?: string | null;
  status?: string | null;
};

type RowDataBag = Record<string, unknown>;

const asTrimmedString = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const pickRowDataBag = (row: ImportJobResultRow<PromotionCustomerImportResolvedData>): RowDataBag => {
  const resolved = (row.resolvedData ?? {}) as RowDataBag;
  const raw = (row.rawData ?? {}) as RowDataBag;
  const extra = ((row as { data?: RowDataBag }).data ?? {}) as RowDataBag;
  return { ...extra, ...raw, ...resolved };
};

/** Map IE OK rows → display list. Prefer worker-enriched fields; old jobs may be phone-only. */
export const mapPromotionCustomerResultRowsToImportedCustomers = (rows: Array<ImportJobResultRow<PromotionCustomerImportResolvedData>>): PromotionImportedCustomerRow[] => {
  const customers: PromotionImportedCustomerRow[] = [];
  const seenPhones = new Set<string>();

  for (const row of rows) {
    const data = pickRowDataBag(row);
    const phone = asTrimmedString(data.phone) || asTrimmedString(data.normalizedPhone);
    if (!phone) continue;

    const normalizedPhone = asTrimmedString(data.normalizedPhone) || phone;
    const dedupeKey = normalizedPhone || phone;
    if (seenPhones.has(dedupeKey)) continue;
    seenPhones.add(dedupeKey);

    customers.push({
      phone,
      normalizedPhone,
      customerId: asTrimmedString(data.customerId) || undefined,
      userId: asTrimmedString(data.userId) || undefined,
      memberId: asTrimmedString(data.memberId) || undefined,
      loyaltyCustomerId: asTrimmedString(data.loyaltyCustomerId) || undefined,
      fullName: asTrimmedString(data.fullName) || null,
      status: asTrimmedString(data.status) || null,
      memberCode: asTrimmedString(data.memberCode) || null,
    });
  }

  return customers;
};

/** Đọc OK rows từ IE — không N+1 lookup FE, không cap 50. */
export const loadCustomersFromPromotionCustomerImportJob = async (jobId: string): Promise<PromotionImportedCustomerRow[]> => {
  const res = await importExportApi.getImportJobResultRows<PromotionCustomerImportResolvedData>(jobId, {
    status: 'OK',
    isPagination: false,
  });

  const customers = mapPromotionCustomerResultRowsToImportedCustomers(res.list);
  if (!customers.length) {
    throw new Error('Không có khách hàng hợp lệ để áp dụng vào form.');
  }

  return customers;
};
