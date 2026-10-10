export const parseNullableNumber = (value: string | number | null | undefined): number | null => {
  if (value === null || value === undefined) {
    return null;
  }

  const normalizedText = typeof value === 'number' ? String(value) : String(value).replace(/,/g, '').trim();
  if (normalizedText === '') {
    return null;
  }

  const normalized = Number(normalizedText);
  return Number.isFinite(normalized) ? normalized : null;
};

export const formatNullableNumber = (value: string | number | null | undefined): string => {
  const normalized = parseNullableNumber(value);
  return normalized === null ? '' : String(normalized);
};

export const resolveEffectiveTaxRate = (params: {
  categoryTaxRate?: string | number | null;
  productTaxRateOverride?: string | number | null;
  skuTaxRateOverride?: string | number | null;
  serverEffectiveTaxRate?: string | number | null;
}): number => {
  const skuTaxRateOverride = parseNullableNumber(params.skuTaxRateOverride);
  if (skuTaxRateOverride !== null) {
    return skuTaxRateOverride;
  }

  const productTaxRateOverride = parseNullableNumber(params.productTaxRateOverride);
  if (productTaxRateOverride !== null) {
    return productTaxRateOverride;
  }

  const categoryTaxRate = parseNullableNumber(params.categoryTaxRate);
  if (categoryTaxRate !== null) {
    return categoryTaxRate;
  }

  return parseNullableNumber(params.serverEffectiveTaxRate) ?? 0;
};

export const resolveTaxSource = (params: {
  categoryTaxRate?: string | number | null;
  productTaxRateOverride?: string | number | null;
  skuTaxRateOverride?: string | number | null;
  serverTaxSource?: string | null;
}): string => {
  if (parseNullableNumber(params.skuTaxRateOverride) !== null) {
    return 'SKU';
  }

  if (parseNullableNumber(params.productTaxRateOverride) !== null) {
    return 'PRODUCT';
  }

  if (parseNullableNumber(params.categoryTaxRate) !== null) {
    return 'CATEGORY';
  }

  return params.serverTaxSource ?? 'CATEGORY';
};

export const calculateBeforeTaxFromAfterTax = (amountAfterTax: string | number | null | undefined, taxRate: string | number | null | undefined): string => {
  const gross = parseNullableNumber(amountAfterTax);
  if (gross === null) {
    return '';
  }

  const normalizedTaxRate = parseNullableNumber(taxRate) ?? 0;
  return String(Math.round(gross / (1 + normalizedTaxRate / 100)));
};
