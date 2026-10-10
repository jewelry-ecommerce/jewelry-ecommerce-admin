import type {
  Attribute,
  Category,
  Collection,
  JewelryGemstone,
  JewelryMaterial,
  JewelryOccasion,
  MediaAsset,
  PreOrderInfo,
  Product,
  ProductVariant,
  StockStatus,
} from "@/apis/product/product.interface";
import { buildPlaceholderImage, type PlaceholderTone } from "@/utils/media/placeholder.util";

/**
 * Catalog seed data.
 *
 * Products are expanded from a compact spec so the fixture stays readable while still producing a
 * fully populated catalog. SKU codes are the join key shared with the admin application's
 * inventory fixtures (for example `RING-DIA-001`).
 */

export const MATERIAL_LABELS: Record<JewelryMaterial, string> = {
  YELLOW_GOLD_18K: "18K Yellow Gold",
  WHITE_GOLD_18K: "18K White Gold",
  ROSE_GOLD_18K: "18K Rose Gold",
  PLATINUM_950: "Platinum 950",
  STERLING_SILVER_925: "Sterling Silver 925",
};

export const GEMSTONE_LABELS: Record<JewelryGemstone, string> = {
  DIAMOND: "Diamond",
  SAPPHIRE: "Sapphire",
  RUBY: "Ruby",
  EMERALD: "Emerald",
  PEARL: "Pearl",
  NONE: "No gemstone",
};

export const OCCASION_LABELS: Record<JewelryOccasion, string> = {
  BRIDAL: "Bridal",
  EVERYDAY: "Everyday",
  GIFT: "Gift",
  STATEMENT: "Statement",
  ANNIVERSARY: "Anniversary",
};

export const CATEGORIES: Category[] = [];

export const COLLECTIONS: Collection[] = [];

export const ATTRIBUTES: Attribute[] = [];

type VariantSpec = {
  suffix: string;
  material: JewelryMaterial;
  gemstone: JewelryGemstone;
  caratWeight: number | null;
  sizeLabel: string | null;
  price: number;
  listPrice?: number;
  stock: number;
  stockStatus?: StockStatus;
};

type ProductSpec = {
  id: string;
  code: string;
  skuPrefix: string;
  name: string;
  slug: string;
  categoryId: string;
  collectionSlugs: string[];
  occasion: JewelryOccasion;
  tone: PlaceholderTone;
  shortDescription: string;
  description: string;
  ratingAverage: number;
  ratingCount: number;
  badges: string[];
  createdAt: string;
  preOrder?: PreOrderInfo;
  variants: VariantSpec[];
};

const BRAND_NAME = "Aurelia";

const PRODUCT_SPECS: ProductSpec[] = [];

const resolveStockStatus = (spec: VariantSpec): StockStatus => {
  if (spec.stockStatus) return spec.stockStatus;
  if (spec.stock <= 0) return "OUT_OF_STOCK";
  if (spec.stock <= 3) return "LOW_STOCK";
  return "IN_STOCK";
};

const buildVariantLabel = (spec: VariantSpec): string => {
  const parts = [MATERIAL_LABELS[spec.material]];
  if (spec.gemstone !== "NONE") parts.push(GEMSTONE_LABELS[spec.gemstone]);
  if (spec.sizeLabel) parts.push(spec.sizeLabel);
  return parts.join(" · ");
};

const buildMedia = (spec: ProductSpec): MediaAsset[] =>
  [
    { label: spec.name, caption: spec.code, sortOrder: 1, isPrimary: true },
    { label: `${spec.name} detail`, caption: "Detail view", sortOrder: 2 },
    { label: `${spec.name} on model`, caption: "On model", sortOrder: 3 },
  ].map(({ label, caption, sortOrder, isPrimary }) => ({
    url: buildPlaceholderImage({ label, caption, tone: spec.tone }),
    alt: `${spec.name} — ${caption}`,
    sortOrder,
    isPrimary,
  }));

const buildVariants = (spec: ProductSpec): ProductVariant[] =>
  spec.variants.map((variantSpec, index) => {
    const skuCode = `${spec.skuPrefix}-${variantSpec.suffix}`;
    return {
      id: `${spec.id}-v${index + 1}`,
      skuCode,
      productId: spec.id,
      name: `${spec.name} — ${buildVariantLabel(variantSpec)}`,
      status: "ACTIVE",
      material: variantSpec.material,
      gemstone: variantSpec.gemstone,
      caratWeight: variantSpec.caratWeight,
      sizeLabel: variantSpec.sizeLabel,
      metalColorLabel: MATERIAL_LABELS[variantSpec.material],
      listPrice: variantSpec.listPrice ?? variantSpec.price,
      salePrice: variantSpec.price,
      weightGram: Number((2 + index * 0.4).toFixed(2)),
      media: [
        {
          url: buildPlaceholderImage({ label: spec.name, caption: skuCode, tone: spec.tone }),
          alt: `${spec.name} ${buildVariantLabel(variantSpec)}`,
          sortOrder: 1,
          isPrimary: true,
        },
      ],
      stockStatus: resolveStockStatus(variantSpec),
      availableStock: variantSpec.stock,
      isDefault: index === 0,
    };
  });

const buildProduct = (spec: ProductSpec): Product => {
  const category = CATEGORIES.find((entry) => entry.id === spec.categoryId);
  if (!category) throw new Error(`Catalog fixture references an unknown category: ${spec.categoryId}`);

  const variants = buildVariants(spec);
  const defaultVariant = variants[0];
  const cheapest = variants.reduce((lowest, variant) => (variant.salePrice < lowest.salePrice ? variant : lowest), defaultVariant);
  const compareAtPrice = cheapest.listPrice > cheapest.salePrice ? cheapest.listPrice : null;

  return {
    id: spec.id,
    code: spec.code,
    name: spec.name,
    slug: spec.slug,
    shortDescription: spec.shortDescription,
    description: spec.description,
    status: "PUBLISHED",
    category: { id: category.id, name: category.name, slug: category.slug },
    collections: spec.collectionSlugs.map((slug) => {
      const collection = COLLECTIONS.find((entry) => entry.slug === slug);
      if (!collection) throw new Error(`Catalog fixture references an unknown collection: ${slug}`);
      return { id: collection.id, name: collection.name, slug: collection.slug };
    }),
    brandName: BRAND_NAME,
    occasion: spec.occasion,
    media: buildMedia(spec),
    variants,
    priceFrom: cheapest.salePrice,
    compareAtPrice,
    ratingAverage: spec.ratingAverage,
    ratingCount: spec.ratingCount,
    badges: spec.badges,
    preOrder: spec.preOrder ?? null,
    seo: {
      metaTitle: `${spec.name} | ${BRAND_NAME}`,
      metaDescription: spec.shortDescription,
      metaKeywords: `${spec.name}, ${category.name}, ${BRAND_NAME}`,
    },
    createdAt: spec.createdAt,
    publishedAt: spec.createdAt,
  };
};

export const PRODUCTS: Product[] = PRODUCT_SPECS.map(buildProduct);

export const findProductBySlug = (slug: string): Product | undefined => PRODUCTS.find((product) => product.slug === slug);

export const findProductById = (id: string): Product | undefined => PRODUCTS.find((product) => product.id === id);

export const ALL_VARIANTS: ProductVariant[] = PRODUCTS.flatMap((product) => product.variants);

export const findVariantById = (variantId: string): ProductVariant | undefined => ALL_VARIANTS.find((variant) => variant.id === variantId);

export const findVariantBySku = (skuCode: string): ProductVariant | undefined =>
  ALL_VARIANTS.find((variant) => variant.skuCode === skuCode);
