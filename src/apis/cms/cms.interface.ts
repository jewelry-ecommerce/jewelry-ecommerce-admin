import type { ProductStatus } from "@/apis/product/product.interface";

/**
 * CMS contract mirroring `jewelry-commerce-client/src/utils/api/cms/cms.interface.ts`. A page is a
 * list of typed blocks; the storefront renders them through a block registry, so the admin editor
 * only ever produces this exact JSON.
 */
export type CmsBlockType =
  | "HERO_BANNER"
  | "PROMO_BANNER"
  | "CATEGORY_GRID"
  | "PRODUCT_CAROUSEL"
  | "FEATURED_PRODUCTS"
  | "COLLECTION_BANNER"
  | "CURATED_SET"
  | "EDITORIAL_CONTENT"
  | "AI_STYLIST_CTA"
  | "SET_BUILDER_CTA"
  | "MEMBERSHIP_CTA"
  | "TRUST_SIGNALS"
  | "NEWSLETTER"
  | "CUSTOM_HTML";

export type CmsCtaLink = {
  label: string;
  href: string;
};

export type CmsHeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  mobileImage: string;
  cta: CmsCtaLink;
  secondaryCta: CmsCtaLink | null;
  align: "left" | "center" | "right";
};

export type CmsBlockConfigMap = {
  HERO_BANNER: { slides: CmsHeroSlide[]; autoplayMs: number };
  PROMO_BANNER: { title: string; description: string; image: string; cta: CmsCtaLink; tone: "gold" | "dark" | "light" };
  CATEGORY_GRID: { title: string; description: string; categorySlugs: string[] };
  PRODUCT_CAROUSEL: { title: string; description: string; productIds: string[]; viewAllHref: string };
  FEATURED_PRODUCTS: { title: string; description: string; productIds: string[]; layout: "grid-4" | "grid-3" };
  COLLECTION_BANNER: { collectionSlug: string; title: string; description: string; image: string; cta: CmsCtaLink };
  CURATED_SET: { title: string; description: string; setIds: string[] };
  EDITORIAL_CONTENT: { title: string; body: string; image: string; imagePosition: "left" | "right"; cta: CmsCtaLink | null };
  AI_STYLIST_CTA: { title: string; description: string; image: string; cta: CmsCtaLink };
  SET_BUILDER_CTA: { title: string; description: string; image: string; cta: CmsCtaLink };
  MEMBERSHIP_CTA: { title: string; description: string; tiers: string[]; cta: CmsCtaLink };
  TRUST_SIGNALS: { items: { icon: string; title: string; description: string }[] };
  NEWSLETTER: { title: string; description: string; placeholder: string; submitLabel: string };
  CUSTOM_HTML: { title: string; html: string };
};

/** Discriminated union so each renderer and each editor form receives a precisely typed config. */
export type CmsBlock = {
  [TType in CmsBlockType]: {
    id: string;
    type: TType;
    sortOrder: number;
    isVisible: boolean;
    config: CmsBlockConfigMap[TType];
  };
}[CmsBlockType];

export type CmsPageSeo = {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string | null;
  imageUrl: string | null;
};

export type CmsPage = {
  id: string;
  slug: string;
  name: string;
  status: ProductStatus;
  seo: CmsPageSeo;
  blocks: CmsBlock[];
  updatedAt: string;
  publishedAt: string | null;
};

export type NavigationItem = {
  id: string;
  label: string;
  href: string;
  children: NavigationItem[];
  /** Optional promotional tile rendered inside the mega menu column. */
  featureImage?: string;
};

export type StorefrontGlobalConfig = {
  brandName: string;
  topBannerMessages: string[];
  navigation: NavigationItem[];
  footerColumns: { title: string; links: CmsCtaLink[] }[];
  socialLinks: CmsCtaLink[];
  hotline: string;
  supportEmail: string;
};

/* ------------------------------------------------------------------------------------------------
 * Admin-side contracts
 * ---------------------------------------------------------------------------------------------- */

export type CmsPageRow = {
  id: string;
  slug: string;
  name: string;
  status: ProductStatus;
  blockCount: number;
  visibleBlockCount: number;
  updatedAt: string;
  publishedAt: string | null;
};

export type CmsPageListQuery = {
  page?: number;
  take?: number;
  search?: string;
  status?: ProductStatus;
};

export type CmsPagePayload = {
  slug: string;
  name: string;
  status: ProductStatus;
  seo: CmsPageSeo;
};

export type CmsBlockPayload = {
  type: CmsBlockType;
  sortOrder: number;
  isVisible: boolean;
  config: CmsBlockConfigMap[CmsBlockType];
};

/** Standalone banner record — a `PROMO_BANNER` or `HERO_BANNER` block surfaced as its own screen. */
export type CmsBannerRow = {
  id: string;
  pageId: string;
  pageName: string;
  pageSlug: string;
  type: Extract<CmsBlockType, "HERO_BANNER" | "PROMO_BANNER" | "COLLECTION_BANNER">;
  title: string;
  image: string;
  ctaLabel: string;
  ctaHref: string;
  isVisible: boolean;
  sortOrder: number;
};

export type NavigationPayload = {
  navigation: NavigationItem[];
};
