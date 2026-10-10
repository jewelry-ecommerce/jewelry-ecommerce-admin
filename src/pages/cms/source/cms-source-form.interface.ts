// The page form fields are taken from trading-admin CMS; layout is intentionally excluded.
export interface CmsPageFormValues {
  name: string;
  slug: string;
  locale: string;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  canonicalUrl?: string;
  seoImageUrl?: string;
}
