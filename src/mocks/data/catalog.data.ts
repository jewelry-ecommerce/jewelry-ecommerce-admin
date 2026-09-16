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

export const CATEGORIES: Category[] = [
  {
    id: "cat-rings",
    name: "Rings",
    slug: "rings",
    parentId: null,
    description: "Engagement, eternity and signature bands crafted in gold and platinum.",
    image: buildPlaceholderImage({ label: "Rings", width: 600, height: 600, tone: "gold" }),
    productCount: 6,
    sortOrder: 1,
  },
  {
    id: "cat-necklaces",
    name: "Necklaces",
    slug: "necklaces",
    parentId: null,
    description: "Pendants and chains that layer beautifully, day to evening.",
    image: buildPlaceholderImage({ label: "Necklaces", width: 600, height: 600, tone: "ivory" }),
    productCount: 5,
    sortOrder: 2,
  },
  {
    id: "cat-earrings",
    name: "Earrings",
    slug: "earrings",
    parentId: null,
    description: "Studs, hoops and drops finished by hand.",
    image: buildPlaceholderImage({ label: "Earrings", width: 600, height: 600, tone: "blush" }),
    productCount: 5,
    sortOrder: 3,
  },
  {
    id: "cat-bracelets",
    name: "Bracelets",
    slug: "bracelets",
    parentId: null,
    description: "Tennis bracelets, bangles and charm-ready chains.",
    image: buildPlaceholderImage({ label: "Bracelets", width: 600, height: 600, tone: "sage" }),
    productCount: 4,
    sortOrder: 4,
  },
  {
    id: "cat-charms",
    name: "Charms",
    slug: "charms",
    parentId: null,
    description: "Collectable charms to personalise any piece.",
    image: buildPlaceholderImage({ label: "Charms", width: 600, height: 600, tone: "charcoal" }),
    productCount: 4,
    sortOrder: 5,
  },
];

export const COLLECTIONS: Collection[] = [
  {
    id: "col-eternal-light",
    name: "Eternal Light",
    slug: "eternal-light",
    description: "Brilliant-cut diamonds set in warm gold — our bridal signature.",
    heroImage: buildPlaceholderImage({ label: "Eternal Light", width: 1600, height: 640, tone: "gold" }),
    productIds: ["prd-solitaire-halo", "prd-eternity-band", "prd-radiance-pendant", "prd-luminous-studs"],
    status: "PUBLISHED",
  },
  {
    id: "col-midnight-garden",
    name: "Midnight Garden",
    slug: "midnight-garden",
    description: "Sapphire and emerald pieces inspired by botanical silhouettes.",
    heroImage: buildPlaceholderImage({ label: "Midnight Garden", width: 1600, height: 640, tone: "charcoal" }),
    productIds: ["prd-sapphire-vine-ring", "prd-emerald-leaf-drops", "prd-sapphire-tennis"],
    status: "PUBLISHED",
  },
  {
    id: "col-everyday-gold",
    name: "Everyday Gold",
    slug: "everyday-gold",
    description: "Featherweight gold you never need to take off.",
    heroImage: buildPlaceholderImage({ label: "Everyday Gold", width: 1600, height: 640, tone: "ivory" }),
    productIds: ["prd-signature-band", "prd-mini-hoops", "prd-layering-chain", "prd-charm-bracelet"],
    status: "PUBLISHED",
  },
];

export const ATTRIBUTES: Attribute[] = [
  {
    id: "attr-material",
    code: "MATERIAL",
    name: "Material",
    displayType: "SWATCH",
    values: [
      { code: "YELLOW_GOLD_18K", label: MATERIAL_LABELS.YELLOW_GOLD_18K, swatch: "#D4A94E" },
      { code: "WHITE_GOLD_18K", label: MATERIAL_LABELS.WHITE_GOLD_18K, swatch: "#D8DCE0" },
      { code: "ROSE_GOLD_18K", label: MATERIAL_LABELS.ROSE_GOLD_18K, swatch: "#E0A899" },
      { code: "PLATINUM_950", label: MATERIAL_LABELS.PLATINUM_950, swatch: "#C9CDD2" },
      { code: "STERLING_SILVER_925", label: MATERIAL_LABELS.STERLING_SILVER_925, swatch: "#C0C4C8" },
    ],
  },
  {
    id: "attr-gemstone",
    code: "GEMSTONE",
    name: "Gemstone",
    displayType: "TEXT",
    values: (Object.keys(GEMSTONE_LABELS) as JewelryGemstone[]).map((code) => ({ code, label: GEMSTONE_LABELS[code] })),
  },
  {
    id: "attr-ring-size",
    code: "RING_SIZE",
    name: "Ring size",
    displayType: "SIZE",
    values: ["5", "6", "7", "8", "9"].map((code) => ({ code, label: `Size ${code}` })),
  },
  {
    id: "attr-chain-length",
    code: "CHAIN_LENGTH",
    name: "Chain length",
    displayType: "SIZE",
    values: ["40cm", "45cm", "50cm"].map((code) => ({ code, label: code })),
  },
];

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

const PRODUCT_SPECS: ProductSpec[] = [
  {
    id: "prd-solitaire-halo",
    code: "RING-DIA",
    skuPrefix: "RING-DIA",
    name: "Solitaire Halo Ring",
    slug: "solitaire-halo-ring",
    categoryId: "cat-rings",
    collectionSlugs: ["eternal-light"],
    occasion: "BRIDAL",
    tone: "gold",
    shortDescription: "A brilliant-cut centre stone framed by a halo of pavé diamonds.",
    description:
      "Our most requested engagement silhouette. The centre stone is claw-set above a micro-pavé halo, then finished with a comfort-fit band. Every diamond is independently certified and conflict-free.",
    ratingAverage: 4.9,
    ratingCount: 128,
    badges: ["Bestseller", "Certified"],
    createdAt: "2026-01-12T09:00:00.000Z",
    variants: [
      {
        suffix: "001",
        material: "WHITE_GOLD_18K",
        gemstone: "DIAMOND",
        caratWeight: 0.7,
        sizeLabel: "6",
        price: 48900000,
        listPrice: 52900000,
        stock: 8,
      },
      {
        suffix: "002",
        material: "WHITE_GOLD_18K",
        gemstone: "DIAMOND",
        caratWeight: 0.7,
        sizeLabel: "7",
        price: 48900000,
        listPrice: 52900000,
        stock: 5,
      },
      { suffix: "003", material: "YELLOW_GOLD_18K", gemstone: "DIAMOND", caratWeight: 0.7, sizeLabel: "7", price: 47900000, stock: 3 },
      { suffix: "004", material: "PLATINUM_950", gemstone: "DIAMOND", caratWeight: 1.0, sizeLabel: "7", price: 72500000, stock: 2 },
    ],
  },
  {
    id: "prd-eternity-band",
    code: "RING-ETR",
    skuPrefix: "RING-ETR",
    name: "Eternity Pavé Band",
    slug: "eternity-pave-band",
    categoryId: "cat-rings",
    collectionSlugs: ["eternal-light"],
    occasion: "ANNIVERSARY",
    tone: "ivory",
    shortDescription: "A continuous line of diamonds, set all the way around.",
    description:
      "Hand-set with 34 matched brilliant diamonds in a shared-prong setting so light travels uninterrupted around the band. Wears beautifully stacked or on its own.",
    ratingAverage: 4.8,
    ratingCount: 74,
    badges: ["Anniversary pick"],
    createdAt: "2026-01-20T09:00:00.000Z",
    variants: [
      { suffix: "001", material: "WHITE_GOLD_18K", gemstone: "DIAMOND", caratWeight: 0.85, sizeLabel: "6", price: 36500000, stock: 6 },
      { suffix: "002", material: "ROSE_GOLD_18K", gemstone: "DIAMOND", caratWeight: 0.85, sizeLabel: "7", price: 36500000, stock: 4 },
    ],
  },
  {
    id: "prd-sapphire-vine-ring",
    code: "RING-SAP",
    skuPrefix: "RING-SAP",
    name: "Sapphire Vine Ring",
    slug: "sapphire-vine-ring",
    categoryId: "cat-rings",
    collectionSlugs: ["midnight-garden"],
    occasion: "STATEMENT",
    tone: "charcoal",
    shortDescription: "A cushion-cut Ceylon sapphire wrapped in a diamond vine.",
    description:
      "The centre sapphire is set east–west and flanked by hand-engraved gold leaves. A statement piece that still sits flat enough for daily wear.",
    ratingAverage: 4.7,
    ratingCount: 41,
    badges: ["Limited"],
    createdAt: "2026-02-02T09:00:00.000Z",
    variants: [
      {
        suffix: "001",
        material: "YELLOW_GOLD_18K",
        gemstone: "SAPPHIRE",
        caratWeight: 1.4,
        sizeLabel: "7",
        price: 41200000,
        listPrice: 45000000,
        stock: 3,
      },
      {
        suffix: "002",
        material: "WHITE_GOLD_18K",
        gemstone: "SAPPHIRE",
        caratWeight: 1.4,
        sizeLabel: "8",
        price: 41200000,
        stock: 0,
        stockStatus: "OUT_OF_STOCK",
      },
    ],
  },
  {
    id: "prd-signature-band",
    code: "RING-SIG",
    skuPrefix: "RING-SIG",
    name: "Signature Slim Band",
    slug: "signature-slim-band",
    categoryId: "cat-rings",
    collectionSlugs: ["everyday-gold"],
    occasion: "EVERYDAY",
    tone: "gold",
    shortDescription: "A 1.8mm polished band designed for stacking.",
    description: "Solid gold, seamless, and weighted to hold its shape. The quiet foundation of a ring stack.",
    ratingAverage: 4.6,
    ratingCount: 210,
    badges: ["Everyday"],
    createdAt: "2025-11-08T09:00:00.000Z",
    variants: [
      { suffix: "001", material: "YELLOW_GOLD_18K", gemstone: "NONE", caratWeight: null, sizeLabel: "6", price: 9800000, stock: 22 },
      { suffix: "002", material: "YELLOW_GOLD_18K", gemstone: "NONE", caratWeight: null, sizeLabel: "7", price: 9800000, stock: 18 },
      { suffix: "003", material: "STERLING_SILVER_925", gemstone: "NONE", caratWeight: null, sizeLabel: "7", price: 2400000, stock: 40 },
    ],
  },
  {
    id: "prd-heirloom-signet",
    code: "RING-SGN",
    skuPrefix: "RING-SGN",
    name: "Heirloom Signet Ring",
    slug: "heirloom-signet-ring",
    categoryId: "cat-rings",
    collectionSlugs: [],
    occasion: "GIFT",
    tone: "sage",
    shortDescription: "A hand-finished signet face ready for engraving.",
    description: "Cast in solid gold with a generous oval face. Complimentary monogram engraving is included with every order.",
    ratingAverage: 4.5,
    ratingCount: 33,
    badges: ["Engravable"],
    createdAt: "2026-02-18T09:00:00.000Z",
    variants: [
      { suffix: "001", material: "YELLOW_GOLD_18K", gemstone: "NONE", caratWeight: null, sizeLabel: "8", price: 15600000, stock: 7 },
      {
        suffix: "002",
        material: "ROSE_GOLD_18K",
        gemstone: "NONE",
        caratWeight: null,
        sizeLabel: "8",
        price: 15600000,
        stock: 2,
        stockStatus: "LOW_STOCK",
      },
    ],
  },
  {
    id: "prd-aurora-trilogy",
    code: "RING-AUR",
    skuPrefix: "RING-AUR",
    name: "Aurora Trilogy Ring",
    slug: "aurora-trilogy-ring",
    categoryId: "cat-rings",
    collectionSlugs: ["eternal-light"],
    occasion: "BRIDAL",
    tone: "blush",
    shortDescription: "Past, present and future — three graduated diamonds.",
    description:
      "A trilogy setting with a 0.5ct centre and matched side stones. Released as a numbered pre-order run ahead of the bridal season.",
    ratingAverage: 5,
    ratingCount: 12,
    badges: ["Pre-order", "New"],
    createdAt: "2026-08-20T09:00:00.000Z",
    preOrder: {
      campaignId: "poc-aurora-2026",
      expectedAvailableAt: "2026-11-15T09:00:00.000Z",
      depositPercent: 30,
      maxPurchaseQty: 2,
    },
    variants: [
      {
        suffix: "001",
        material: "PLATINUM_950",
        gemstone: "DIAMOND",
        caratWeight: 1.1,
        sizeLabel: "7",
        price: 86400000,
        stock: 0,
        stockStatus: "PRE_ORDER",
      },
    ],
  },
  {
    id: "prd-radiance-pendant",
    code: "NECK-RAD",
    skuPrefix: "NECK-RAD",
    name: "Radiance Solitaire Pendant",
    slug: "radiance-solitaire-pendant",
    categoryId: "cat-necklaces",
    collectionSlugs: ["eternal-light"],
    occasion: "GIFT",
    tone: "gold",
    shortDescription: "One brilliant diamond on a whisper-fine chain.",
    description: "A four-claw solitaire that floats on a 0.9mm cable chain, with an adjustable length loop at 40cm and 45cm.",
    ratingAverage: 4.8,
    ratingCount: 156,
    badges: ["Gift favourite"],
    createdAt: "2025-12-05T09:00:00.000Z",
    variants: [
      {
        suffix: "001",
        material: "WHITE_GOLD_18K",
        gemstone: "DIAMOND",
        caratWeight: 0.3,
        sizeLabel: "45cm",
        price: 18900000,
        listPrice: 21500000,
        stock: 14,
      },
      { suffix: "002", material: "YELLOW_GOLD_18K", gemstone: "DIAMOND", caratWeight: 0.3, sizeLabel: "45cm", price: 18900000, stock: 11 },
    ],
  },
  {
    id: "prd-layering-chain",
    code: "NECK-LAY",
    skuPrefix: "NECK-LAY",
    name: "Layering Rope Chain",
    slug: "layering-rope-chain",
    categoryId: "cat-necklaces",
    collectionSlugs: ["everyday-gold"],
    occasion: "EVERYDAY",
    tone: "ivory",
    shortDescription: "A twisted rope chain built to layer without tangling.",
    description: "Solid gold rope construction with a reinforced lobster clasp, designed to sit above or below a pendant.",
    ratingAverage: 4.7,
    ratingCount: 98,
    badges: [],
    createdAt: "2025-10-14T09:00:00.000Z",
    variants: [
      { suffix: "001", material: "YELLOW_GOLD_18K", gemstone: "NONE", caratWeight: null, sizeLabel: "40cm", price: 12400000, stock: 20 },
      { suffix: "002", material: "YELLOW_GOLD_18K", gemstone: "NONE", caratWeight: null, sizeLabel: "50cm", price: 14900000, stock: 9 },
    ],
  },
  {
    id: "prd-pearl-drop-necklace",
    code: "NECK-PRL",
    skuPrefix: "NECK-PRL",
    name: "Akoya Pearl Drop Necklace",
    slug: "akoya-pearl-drop-necklace",
    categoryId: "cat-necklaces",
    collectionSlugs: [],
    occasion: "ANNIVERSARY",
    tone: "blush",
    shortDescription: "A single Akoya pearl suspended from a diamond bail.",
    description: "Hand-matched 8mm Akoya pearl with high lustre, hung from a pavé bail so it moves with the light.",
    ratingAverage: 4.6,
    ratingCount: 52,
    badges: [],
    createdAt: "2026-03-01T09:00:00.000Z",
    variants: [
      { suffix: "001", material: "WHITE_GOLD_18K", gemstone: "PEARL", caratWeight: null, sizeLabel: "45cm", price: 16700000, stock: 6 },
    ],
  },
  {
    id: "prd-emerald-station",
    code: "NECK-EMR",
    skuPrefix: "NECK-EMR",
    name: "Emerald Station Necklace",
    slug: "emerald-station-necklace",
    categoryId: "cat-necklaces",
    collectionSlugs: ["midnight-garden"],
    occasion: "STATEMENT",
    tone: "sage",
    shortDescription: "Bezel-set emeralds spaced along a fine gold chain.",
    description: "Five graduated emeralds in rub-over settings, chosen for even saturation and matched clarity.",
    ratingAverage: 4.7,
    ratingCount: 28,
    badges: ["Limited"],
    createdAt: "2026-04-10T09:00:00.000Z",
    variants: [
      { suffix: "001", material: "YELLOW_GOLD_18K", gemstone: "EMERALD", caratWeight: 1.2, sizeLabel: "45cm", price: 33800000, stock: 4 },
    ],
  },
  {
    id: "prd-monogram-locket",
    code: "NECK-LKT",
    skuPrefix: "NECK-LKT",
    name: "Monogram Locket",
    slug: "monogram-locket",
    categoryId: "cat-necklaces",
    collectionSlugs: [],
    occasion: "GIFT",
    tone: "charcoal",
    shortDescription: "An engravable locket sized for two photographs.",
    description: "A softly domed locket with a hidden hinge and a brushed interior. Engraving is included.",
    ratingAverage: 4.4,
    ratingCount: 61,
    badges: ["Engravable"],
    createdAt: "2026-05-22T09:00:00.000Z",
    variants: [
      { suffix: "001", material: "YELLOW_GOLD_18K", gemstone: "NONE", caratWeight: null, sizeLabel: "45cm", price: 21300000, stock: 8 },
    ],
  },
  {
    id: "prd-luminous-studs",
    code: "EARR-LUM",
    skuPrefix: "EARR-LUM",
    name: "Luminous Diamond Studs",
    slug: "luminous-diamond-studs",
    categoryId: "cat-earrings",
    collectionSlugs: ["eternal-light"],
    occasion: "EVERYDAY",
    tone: "gold",
    shortDescription: "Matched brilliant studs with secure screw backs.",
    description: "A pair of matched diamonds in four-claw settings, supplied with screw-fitting posts for everyday security.",
    ratingAverage: 4.9,
    ratingCount: 184,
    badges: ["Bestseller"],
    createdAt: "2025-09-30T09:00:00.000Z",
    variants: [
      {
        suffix: "001",
        material: "WHITE_GOLD_18K",
        gemstone: "DIAMOND",
        caratWeight: 0.5,
        sizeLabel: null,
        price: 25600000,
        listPrice: 28900000,
        stock: 16,
      },
      { suffix: "002", material: "YELLOW_GOLD_18K", gemstone: "DIAMOND", caratWeight: 0.5, sizeLabel: null, price: 25600000, stock: 12 },
      { suffix: "003", material: "PLATINUM_950", gemstone: "DIAMOND", caratWeight: 0.8, sizeLabel: null, price: 39900000, stock: 3 },
    ],
  },
  {
    id: "prd-mini-hoops",
    code: "EARR-HOP",
    skuPrefix: "EARR-HOP",
    name: "Mini Huggie Hoops",
    slug: "mini-huggie-hoops",
    categoryId: "cat-earrings",
    collectionSlugs: ["everyday-gold"],
    occasion: "EVERYDAY",
    tone: "ivory",
    shortDescription: "12mm huggies that sit flush to the lobe.",
    description: "A hinged huggie with a click closure, light enough to sleep in and shaped to stack with a second piercing.",
    ratingAverage: 4.8,
    ratingCount: 231,
    badges: ["Everyday"],
    createdAt: "2025-08-19T09:00:00.000Z",
    variants: [
      { suffix: "001", material: "YELLOW_GOLD_18K", gemstone: "NONE", caratWeight: null, sizeLabel: null, price: 7400000, stock: 30 },
      { suffix: "002", material: "ROSE_GOLD_18K", gemstone: "NONE", caratWeight: null, sizeLabel: null, price: 7400000, stock: 15 },
    ],
  },
  {
    id: "prd-emerald-leaf-drops",
    code: "EARR-EMR",
    skuPrefix: "EARR-EMR",
    name: "Emerald Leaf Drop Earrings",
    slug: "emerald-leaf-drop-earrings",
    categoryId: "cat-earrings",
    collectionSlugs: ["midnight-garden"],
    occasion: "STATEMENT",
    tone: "sage",
    shortDescription: "Carved emerald leaves on articulated gold stems.",
    description: "Each emerald is carved to a leaf profile and hung from an articulated stem so the drop sways as you move.",
    ratingAverage: 4.6,
    ratingCount: 19,
    badges: ["Limited"],
    createdAt: "2026-04-28T09:00:00.000Z",
    variants: [
      {
        suffix: "001",
        material: "YELLOW_GOLD_18K",
        gemstone: "EMERALD",
        caratWeight: 2.1,
        sizeLabel: null,
        price: 44200000,
        stock: 2,
        stockStatus: "LOW_STOCK",
      },
    ],
  },
  {
    id: "prd-ruby-ear-climbers",
    code: "EARR-RUB",
    skuPrefix: "EARR-RUB",
    name: "Ruby Ear Climbers",
    slug: "ruby-ear-climbers",
    categoryId: "cat-earrings",
    collectionSlugs: [],
    occasion: "STATEMENT",
    tone: "blush",
    shortDescription: "Graduated rubies that trace the ear line.",
    description: "Seven graduated rubies rise along a contoured post, held in place with a hidden support bar.",
    ratingAverage: 4.5,
    ratingCount: 24,
    badges: [],
    createdAt: "2026-06-11T09:00:00.000Z",
    variants: [
      { suffix: "001", material: "ROSE_GOLD_18K", gemstone: "RUBY", caratWeight: 1.05, sizeLabel: null, price: 28900000, stock: 5 },
    ],
  },
  {
    id: "prd-pearl-threaders",
    code: "EARR-PRL",
    skuPrefix: "EARR-PRL",
    name: "Pearl Threader Earrings",
    slug: "pearl-threader-earrings",
    categoryId: "cat-earrings",
    collectionSlugs: [],
    occasion: "GIFT",
    tone: "ivory",
    shortDescription: "A freshwater pearl on a fine gold threader.",
    description: "The chain threads through the lobe and drops to an adjustable length, finished with a single pearl.",
    ratingAverage: 4.3,
    ratingCount: 44,
    badges: [],
    createdAt: "2026-07-02T09:00:00.000Z",
    variants: [
      { suffix: "001", material: "YELLOW_GOLD_18K", gemstone: "PEARL", caratWeight: null, sizeLabel: null, price: 6900000, stock: 25 },
    ],
  },
  {
    id: "prd-sapphire-tennis",
    code: "BRAC-SAP",
    skuPrefix: "BRAC-SAP",
    name: "Sapphire Tennis Bracelet",
    slug: "sapphire-tennis-bracelet",
    categoryId: "cat-bracelets",
    collectionSlugs: ["midnight-garden"],
    occasion: "ANNIVERSARY",
    tone: "charcoal",
    shortDescription: "A continuous line of matched sapphires.",
    description: "Forty-two calibrated sapphires in four-claw settings on an articulated track, with a concealed box clasp.",
    ratingAverage: 4.9,
    ratingCount: 37,
    badges: ["Certified"],
    createdAt: "2026-01-30T09:00:00.000Z",
    variants: [
      {
        suffix: "001",
        material: "WHITE_GOLD_18K",
        gemstone: "SAPPHIRE",
        caratWeight: 5.4,
        sizeLabel: "17cm",
        price: 96500000,
        listPrice: 104000000,
        stock: 2,
      },
    ],
  },
  {
    id: "prd-charm-bracelet",
    code: "BRAC-CHM",
    skuPrefix: "BRAC-CHM",
    name: "Charm Foundation Bracelet",
    slug: "charm-foundation-bracelet",
    categoryId: "cat-bracelets",
    collectionSlugs: ["everyday-gold"],
    occasion: "GIFT",
    tone: "gold",
    shortDescription: "The base chain for a growing charm collection.",
    description: "A reinforced curb chain with charm-ready links and a secure trigger clasp.",
    ratingAverage: 4.7,
    ratingCount: 142,
    badges: ["Bestseller"],
    createdAt: "2025-09-12T09:00:00.000Z",
    variants: [
      { suffix: "001", material: "YELLOW_GOLD_18K", gemstone: "NONE", caratWeight: null, sizeLabel: "17cm", price: 13900000, stock: 19 },
      { suffix: "002", material: "STERLING_SILVER_925", gemstone: "NONE", caratWeight: null, sizeLabel: "19cm", price: 3200000, stock: 35 },
    ],
  },
  {
    id: "prd-bangle-duo",
    code: "BRAC-BNG",
    skuPrefix: "BRAC-BNG",
    name: "Polished Bangle Duo",
    slug: "polished-bangle-duo",
    categoryId: "cat-bracelets",
    collectionSlugs: [],
    occasion: "EVERYDAY",
    tone: "sage",
    shortDescription: "Two weights of solid bangle, sold as a pair.",
    description: "A 2mm and a 3mm bangle designed to be worn together, with a hinged opening for easy wear.",
    ratingAverage: 4.4,
    ratingCount: 58,
    badges: [],
    createdAt: "2026-02-25T09:00:00.000Z",
    variants: [
      { suffix: "001", material: "YELLOW_GOLD_18K", gemstone: "NONE", caratWeight: null, sizeLabel: "17cm", price: 24800000, stock: 6 },
    ],
  },
  {
    id: "prd-diamond-cuff",
    code: "BRAC-CUF",
    skuPrefix: "BRAC-CUF",
    name: "Pavé Diamond Cuff",
    slug: "pave-diamond-cuff",
    categoryId: "cat-bracelets",
    collectionSlugs: [],
    occasion: "STATEMENT",
    tone: "ivory",
    shortDescription: "An open cuff with a pavé diamond crest.",
    description: "Sculpted from a single piece of gold with a pavé crest at the widest point. Slight flex allows a precise fit.",
    ratingAverage: 4.6,
    ratingCount: 21,
    badges: [],
    createdAt: "2026-05-05T09:00:00.000Z",
    variants: [
      { suffix: "001", material: "ROSE_GOLD_18K", gemstone: "DIAMOND", caratWeight: 0.9, sizeLabel: "16cm", price: 52400000, stock: 3 },
    ],
  },
  {
    id: "prd-charm-clover",
    code: "CHRM-CLV",
    skuPrefix: "CHRM-CLV",
    name: "Lucky Clover Charm",
    slug: "lucky-clover-charm",
    categoryId: "cat-charms",
    collectionSlugs: ["everyday-gold"],
    occasion: "GIFT",
    tone: "sage",
    shortDescription: "A four-leaf clover charm with a green centre stone.",
    description: "Enamelled clover petals around a bezel-set centre stone, on a spring-ring fitting.",
    ratingAverage: 4.8,
    ratingCount: 167,
    badges: ["Bestseller"],
    createdAt: "2025-10-01T09:00:00.000Z",
    variants: [
      {
        suffix: "001",
        material: "STERLING_SILVER_925",
        gemstone: "EMERALD",
        caratWeight: 0.15,
        sizeLabel: null,
        price: 2890000,
        stock: 48,
      },
    ],
  },
  {
    id: "prd-charm-pinecone",
    code: "CHRM-PIN",
    skuPrefix: "CHRM-PIN",
    name: "Pinecone Charm",
    slug: "pinecone-charm",
    categoryId: "cat-charms",
    collectionSlugs: [],
    occasion: "GIFT",
    tone: "gold",
    shortDescription: "A textured pinecone charm with a gemstone tip.",
    description: "Cast from a hand-carved original so every scale is defined, tipped with a small bezel-set stone.",
    ratingAverage: 4.5,
    ratingCount: 73,
    badges: [],
    createdAt: "2025-11-19T09:00:00.000Z",
    variants: [
      {
        suffix: "001",
        material: "STERLING_SILVER_925",
        gemstone: "EMERALD",
        caratWeight: 0.12,
        sizeLabel: null,
        price: 3190000,
        stock: 31,
      },
    ],
  },
  {
    id: "prd-charm-feather",
    code: "CHRM-FTH",
    skuPrefix: "CHRM-FTH",
    name: "Feather Charm",
    slug: "feather-charm",
    categoryId: "cat-charms",
    collectionSlugs: [],
    occasion: "GIFT",
    tone: "ivory",
    shortDescription: "An engraved feather charm that catches the light.",
    description: "Hand-engraved barbs give this feather its movement. Finished with a high polish spine.",
    ratingAverage: 4.4,
    ratingCount: 55,
    badges: [],
    createdAt: "2025-12-20T09:00:00.000Z",
    variants: [
      { suffix: "001", material: "STERLING_SILVER_925", gemstone: "NONE", caratWeight: null, sizeLabel: null, price: 1690000, stock: 26 },
    ],
  },
  {
    id: "prd-charm-initial",
    code: "CHRM-INI",
    skuPrefix: "CHRM-INI",
    name: "Initial Letter Charm",
    slug: "initial-letter-charm",
    categoryId: "cat-charms",
    collectionSlugs: ["everyday-gold"],
    occasion: "GIFT",
    tone: "blush",
    shortDescription: "A serif initial charm, A through Z.",
    description: "A solid serif letter with a soft bevel, sized to balance against a charm bracelet or a fine chain.",
    ratingAverage: 4.6,
    ratingCount: 119,
    badges: ["Personalised"],
    createdAt: "2026-01-05T09:00:00.000Z",
    variants: [
      { suffix: "001", material: "YELLOW_GOLD_18K", gemstone: "NONE", caratWeight: null, sizeLabel: null, price: 4590000, stock: 44 },
    ],
  },
];

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
