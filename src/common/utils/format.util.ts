import dayjs from "dayjs";

import { commonConfig } from "@/common/config/app.config";

/** Rendered instead of an empty date so table columns keep their rhythm. */
const EMPTY_PLACEHOLDER = "—";

const DATE_FORMAT = "DD/MM/YYYY";
const DATE_TIME_FORMAT = "DD/MM/YYYY HH:mm";

/** Currencies without minor units. VND amounts are always whole numbers. */
const ZERO_DECIMAL_CURRENCIES = ["VND", "JPY", "KRW"];

const toSafeNumber = (value: number | null | undefined): number => {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
};

/** Single money formatter. Currency and locale come from configuration, never from a call site. */
export const formatCurrency = (value: number | null | undefined): string => {
  const amount = toSafeNumber(value);
  const fractionDigits = ZERO_DECIMAL_CURRENCIES.includes(commonConfig.CURRENCY) ? 0 : 2;

  try {
    return new Intl.NumberFormat(commonConfig.LOCALE, {
      style: "currency",
      currency: commonConfig.CURRENCY,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(amount);
  } catch {
    // Unknown currency/locale pair: fall back to a grouped number plus the raw currency code.
    return `${new Intl.NumberFormat(commonConfig.LOCALE).format(amount)} ${commonConfig.CURRENCY}`;
  }
};

export const formatNumber = (value: number | null | undefined): string =>
  new Intl.NumberFormat(commonConfig.LOCALE).format(toSafeNumber(value));

/** Percentage of an already-scaled value: `12.5` renders as `12.5%`. */
export const formatPercent = (value: number | null | undefined, fractionDigits = 1): string =>
  `${toSafeNumber(value).toFixed(fractionDigits).replace(/\.0+$/, "")}%`;

/** Short form for dashboard tiles: `12.4K`, `3.1M`. */
export const formatCompactNumber = (value: number | null | undefined): string =>
  new Intl.NumberFormat(commonConfig.LOCALE, { notation: "compact", maximumFractionDigits: 1 }).format(toSafeNumber(value));

export const formatDate = (value: string | Date | null | undefined, template = DATE_FORMAT): string => {
  if (!value) return EMPTY_PLACEHOLDER;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format(template) : EMPTY_PLACEHOLDER;
};

export const formatDateTime = (value: string | Date | null | undefined): string => formatDate(value, DATE_TIME_FORMAT);
