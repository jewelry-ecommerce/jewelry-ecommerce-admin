import { expect, test } from 'vitest';
import { JAVA_CMS_BLOCK_CATALOG, newWizardBlock } from './java-cms-catalog';

test('Java catalog exposes eight supported blocks, including listing, category navigation and showcase', () => {
  expect(JAVA_CMS_BLOCK_CATALOG).toHaveLength(8);
  for (const code of ['PRODUCT_LIST', 'PRODUCT_CATEGORY_NAV', 'PRODUCT_COLLECTION_SHOWCASE']) {
    const entry = JAVA_CMS_BLOCK_CATALOG.find(block => block.code === code);
    expect(entry?.schemaDefinition?.type).toBe('object');
    if (!entry) throw new Error('Missing block: ' + code);
    expect(newWizardBlock(entry).blockTypeCode).toBe(code);
  }
  expect(JAVA_CMS_BLOCK_CATALOG.some(block => block.code === 'TOP_LINE_BANNER')).toBe(false);
  expect(JAVA_CMS_BLOCK_CATALOG.some(block => block.code === 'NEWSLETTER_SIGNUP')).toBe(false);
});

test('new product list has the original ALL_PRODUCTS datasource configuration', () => {
  const entry = JAVA_CMS_BLOCK_CATALOG.find(block => block.code === 'PRODUCT_LIST');
  if (!entry) throw new Error('Missing PRODUCT_LIST');
  expect(newWizardBlock(entry).config).toMatchObject({ productDataSource: { filterType: 'ALL_PRODUCTS', sort: 'newest' } });
});
