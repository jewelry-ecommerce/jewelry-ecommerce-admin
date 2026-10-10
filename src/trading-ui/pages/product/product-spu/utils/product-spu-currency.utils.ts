import { formatCurrency, parseCurrency } from '../../../../common/utils/number.utils';

/** Hiển thị số tiền VND: 1000 → "1.000" */
export const formatProductMoney = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined || value === '') return '';
  const raw = typeof value === 'number' ? String(value) : parseCurrency(String(value));
  if (!raw) return '';
  return formatCurrency(raw);
};

/** Parse input UI → chuỗi số thuần gửi form/API: "1.000" → "1000" */
export const parseProductMoneyInput = (input: string): string => input.replace(/\D/g, '');
