export const formatCurrency = (value: string | number | null | undefined): string => {
  if (!value && value !== 0) return '';
  const numStr = String(value).replace(/\./g, '');
  if (!numStr || isNaN(Number(numStr))) return '';
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Parse a currency string to number (remove dots)
 * Example: "2.000.000" -> 2000000
 */
export const parseCurrency = (value: string | null | undefined): string => {
  if (!value) return '';
  return value.replace(/\./g, '');
};

export const parseAmount = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
export {maskPhone} from './number.utils.source';
