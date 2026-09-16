/**
 * Catalog contract. Type shapes mirror `jewelry-commerce-client/src/utils/api/catalog/catalog.interface.ts`
 * so both applications describe the same backend, plus the admin-only write payloads at the bottom.
 */

/** Shared paging envelope returned by every list endpoint. */
export type Paginated<T> = {
  list: T[];
  total: number;
  page: number;
  take: number;
};

export type ProductStatus = "PUBLISHED" | "DRAFT" | "ARCHIVED";
export type VariantStatus = "ACTIVE" | "INACTIVE";
export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "PRE_ORDER";

/** Jewelry-specific descriptors that drive faceted browsing. */
export type JewelryMaterial = "YELLOW_GOLD_18K" | "WHITE_GOLD_18K" | "ROSE_GOLD_18K" | "PLATINUM_950" | "STERLING_SILVER_925";
export type JewelryGemstone = "DIAMOND" | "SAPPHIRE" | "RUBY" | "EMERALD" | "PEARL" | "NONE";
export type JewelryOccasion = "BRIDAL" | "EVERYDAY" | "GIFT" | "STATEMENT" | "ANNIVERSARY";

export type MediaAsset = {
  url: string;
  alt: string;
  sortOrder: number;
  isPrimary?: boolean;
};

export type CategoryRef = {
  id: string;
  name: string;
  slug: string;
};

export type CollectionRef = {
  id: string;
  name: string;
  slug: string;
};

export type Category = CategoryRef & {
  parentId: string | null;
  description: string;
  image: string;
  productCount: number;
  sortOrder: number;
};

export type Collection = CollectionRef & {
  description: string;
  heroImage: string;
  productIds: string[];
  status: ProductStatus;
};

export type AttributeValue = {
  code: string;
  label: string;
  swatch?: string;
};

export type Attribute = {
  id: string;
  code: string;
  name: string;
  displayType: "TEXT" | "SWATCH" | "SIZE";
  values: AttributeValue[];
};

export type PreOrderInfo = {
  campaignId: string;
  /** ISO date the item is expected to ship. */
  expectedAvailableAt: string;
  depositPercent: number;
  maxPurchaseQty: number;
};

/** One sellable SKU of a jewelry product. */
export type ProductVariant = {
  id: string;
  skuCode: string;
  productId: string;
  name: string;
  status: VariantStatus;
  material: JewelryMaterial;
  gemstone: JewelryGemstone;
  /** Total gemstone weight in carats; null for plain metal pieces. */
  caratWeight: number | null;
  /** Ring size / chain length label; null when the piece is one-size. */
  sizeLabel: string | null;
  metalColorLabel: string;
  listPrice: number;
  salePrice: number;
  weightGram: number;
  media: MediaAsset[];
  stockStatus: StockStatus;
  availableStock: number;
  isDefault: boolean;
};

export type ProductSeo = {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
};

export type Product = {
  id: string;
  code: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  status: ProductStatus;
  category: CategoryRef;
  collections: CollectionRef[];
  brandName: string;
  occasion: JewelryOccasion;
  media: MediaAsset[];
  variants: ProductVariant[];
  /** Denormalized from the default variant so listing cards avoid extra lookups. */
  priceFrom: number;
  compareAtPrice: number | null;
  ratingAverage: number;
  ratingCount: number;
  badges: string[];
  preOrder: PreOrderInfo | null;
  seo: ProductSeo;
  createdAt: string;
  publishedAt: string | null;
};

/** Lightweight projection used by grids, carousels and search results. */
export type ProductCard = {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  brandName: string;
  image: string;
  imageHover: string | null;
  priceFrom: number;
  compareAtPrice: number | null;
  discountPercent: number | null;
  stockStatus: StockStatus;
  ratingAverage: number;
  ratingCount: number;
  badges: string[];
  isPreOrder: boolean;
};

export type ProductSortKey = "RECOMMENDED" | "NEWEST" | "PRICE_ASC" | "PRICE_DESC" | "RATING_DESC";

export type FacetOption<TValue extends string = string> = {
  value: TValue;
  label: string;
  count: number;
};

/* ------------------------------------------------------------------------------------------------
 * Admin-side contracts
 * ---------------------------------------------------------------------------------------------- */

/** Row projection of the admin product list — SKU count and stock roll-up instead of storefront badges. */
export type AdminProductRow = {
  id: string;
  code: string;
  name: string;
  slug: string;
  image: string;
  status: ProductStatus;
  categoryName: string;
  categorySlug: string;
  collectionNames: string[];
  occasion: JewelryOccasion;
  variantCount: number;
  priceFrom: number;
  compareAtPrice: number | null;
  totalAvailableStock: number;
  stockStatus: StockStatus;
  createdAt: string;
  publishedAt: string | null;
};

export type AdminProductListQuery = {
  page?: number;
  take?: number;
  search?: string;
  status?: ProductStatus;
  categorySlug?: string;
  collectionSlug?: string;
  material?: JewelryMaterial;
  gemstone?: JewelryGemstone;
  sort?: ProductSortKey;
};

export type ProductVariantPayload = {
  skuCode: string;
  material: JewelryMaterial;
  gemstone: JewelryGemstone;
  caratWeight: number | null;
  sizeLabel: string | null;
  listPrice: number;
  salePrice: number;
  weightGram: number;
  status: VariantStatus;
};

export type ProductPayload = {
  code: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  status: ProductStatus;
  categoryId: string;
  collectionIds: string[];
  occasion: JewelryOccasion;
  badges: string[];
  seo: ProductSeo;
  variants: ProductVariantPayload[];
};

export type CategoryPayload = {
  name: string;
  slug: string;
  parentId: string | null;
  description: string;
  sortOrder: number;
};

export type CollectionPayload = {
  name: string;
  slug: string;
  description: string;
  status: ProductStatus;
  productIds: string[];
};

export type AttributePayload = {
  code: string;
  name: string;
  displayType: Attribute["displayType"];
  values: AttributeValue[];
};

/** Reference row for the materials / gemstones settings screens. */
export type JewelryDescriptorRow<TCode extends string = string> = {
  code: TCode;
  label: string;
  variantCount: number;
};
