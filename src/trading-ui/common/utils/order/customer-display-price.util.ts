export type CustomerDisplayPriceCurrency = 'VND';

export interface CustomerDisplayPriceSource {
  displayPriceAfterTaxMinor?: number | string | null;
  sellingPriceAfterTaxMinor?: number | string | null;
  compareAtPriceAfterTaxMinor?: number | string | null;
}

export interface CustomerDisplayPrice {
  currency: CustomerDisplayPriceCurrency;
  compareAtPriceAfterTaxMinor: number | null;
  sellingPriceAfterTaxMinor: number;
  discountPercent: number | null;
  hasDiscount: boolean;
}

const toMinorUnit = (value: number | string | null | undefined): number | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : null;
};

export const resolveCustomerDisplayPrice = (source: CustomerDisplayPriceSource): CustomerDisplayPrice => {
  const displayPriceAfterTaxMinor = toMinorUnit(source.displayPriceAfterTaxMinor);
  const sellingPriceAfterTaxMinor = displayPriceAfterTaxMinor ?? toMinorUnit(source.sellingPriceAfterTaxMinor) ?? 0;
  const compareAtPriceAfterTaxMinor = toMinorUnit(source.compareAtPriceAfterTaxMinor);
  const hasDiscount = compareAtPriceAfterTaxMinor !== null && compareAtPriceAfterTaxMinor > sellingPriceAfterTaxMinor;

  return {
    currency: 'VND',
    compareAtPriceAfterTaxMinor: hasDiscount ? compareAtPriceAfterTaxMinor : null,
    sellingPriceAfterTaxMinor,
    discountPercent: hasDiscount && compareAtPriceAfterTaxMinor ? Math.round(((compareAtPriceAfterTaxMinor - sellingPriceAfterTaxMinor) / compareAtPriceAfterTaxMinor) * 100) : null,
    hasDiscount,
  };
};
