import type { CuratedSet } from "@/apis/set/set.interface";
import { buildPlaceholderImage } from "@/utils/media/placeholder.util";
import { findProductById } from "./catalog.data";

/**
 * Curated set fixtures.
 *
 * Each item is a slot (`setItemId`) with a list of SKUs the customer may pick. The slot identity is
 * stable and never derived from the chosen SKU — this is what keeps cart and order lines correct
 * when two slots happen to offer the same product.
 */
const variantIdsOf = (productId: string): string[] => findProductById(productId)?.variants.map((variant) => variant.id) ?? [];

const defaultVariantOf = (productId: string): string => {
  const variants = variantIdsOf(productId);
  if (!variants.length) throw new Error(`Set fixture references a product with no variants: ${productId}`);
  return variants[0];
};

export const CURATED_SETS: CuratedSet[] = [
  {
    id: "set-bridal-eternal",
    code: "SET-BRIDAL-ETERNAL",
    name: "Eternal Bridal Trio",
    slug: "eternal-bridal-trio",
    description:
      "The complete bridal arrangement: a halo engagement ring, a pavé eternity band and matched solitaire studs. Choose the metal and size for each piece.",
    status: "PUBLISHED",
    heroImage: buildPlaceholderImage({
      label: "Eternal Bridal Trio",
      caption: "SET-BRIDAL-ETERNAL",
      width: 1200,
      height: 800,
      tone: "gold",
    }),
    media: [
      buildPlaceholderImage({ label: "Bridal Trio", caption: "Styled", tone: "gold" }),
      buildPlaceholderImage({ label: "Bridal Trio", caption: "Flat lay", tone: "ivory" }),
    ],
    items: [
      {
        setItemId: "sti-bridal-ring",
        slotName: "Engagement ring",
        productId: "prd-solitaire-halo",
        selectableVariantIds: variantIdsOf("prd-solitaire-halo"),
        defaultVariantId: defaultVariantOf("prd-solitaire-halo"),
        isKeyPiece: true,
        sortOrder: 0,
      },
      {
        setItemId: "sti-bridal-band",
        slotName: "Wedding band",
        productId: "prd-eternity-band",
        selectableVariantIds: variantIdsOf("prd-eternity-band"),
        defaultVariantId: defaultVariantOf("prd-eternity-band"),
        isKeyPiece: false,
        sortOrder: 1,
      },
      {
        setItemId: "sti-bridal-studs",
        slotName: "Earrings",
        productId: "prd-luminous-studs",
        selectableVariantIds: variantIdsOf("prd-luminous-studs"),
        defaultVariantId: defaultVariantOf("prd-luminous-studs"),
        isKeyPiece: false,
        sortOrder: 2,
      },
    ],
    bundleDiscountPercent: 12,
    stockStatus: "IN_STOCK",
    createdAt: "2026-02-01T09:00:00.000Z",
  },
  {
    id: "set-everyday-gold",
    code: "SET-EVERYDAY-GOLD",
    name: "Everyday Gold Layers",
    slug: "everyday-gold-layers",
    description: "A rope chain, huggie hoops and a slim band — the three pieces we wear every day, bundled together.",
    status: "PUBLISHED",
    heroImage: buildPlaceholderImage({
      label: "Everyday Gold Layers",
      caption: "SET-EVERYDAY-GOLD",
      width: 1200,
      height: 800,
      tone: "ivory",
    }),
    media: [buildPlaceholderImage({ label: "Everyday Layers", caption: "Styled", tone: "ivory" })],
    items: [
      {
        setItemId: "sti-everyday-chain",
        slotName: "Necklace",
        productId: "prd-layering-chain",
        selectableVariantIds: variantIdsOf("prd-layering-chain"),
        defaultVariantId: defaultVariantOf("prd-layering-chain"),
        isKeyPiece: true,
        sortOrder: 0,
      },
      {
        setItemId: "sti-everyday-hoops",
        slotName: "Earrings",
        productId: "prd-mini-hoops",
        selectableVariantIds: variantIdsOf("prd-mini-hoops"),
        defaultVariantId: defaultVariantOf("prd-mini-hoops"),
        isKeyPiece: false,
        sortOrder: 1,
      },
      {
        setItemId: "sti-everyday-band",
        slotName: "Ring",
        productId: "prd-signature-band",
        selectableVariantIds: variantIdsOf("prd-signature-band"),
        defaultVariantId: defaultVariantOf("prd-signature-band"),
        isKeyPiece: false,
        sortOrder: 2,
      },
    ],
    bundleDiscountPercent: 10,
    stockStatus: "IN_STOCK",
    createdAt: "2026-01-15T09:00:00.000Z",
  },
  {
    id: "set-midnight-garden",
    code: "SET-MIDNIGHT",
    name: "Midnight Garden Pair",
    slug: "midnight-garden-pair",
    description: "The sapphire vine ring paired with carved emerald leaf drops, for occasions that deserve colour.",
    status: "PUBLISHED",
    heroImage: buildPlaceholderImage({
      label: "Midnight Garden Pair",
      caption: "SET-MIDNIGHT",
      width: 1200,
      height: 800,
      tone: "charcoal",
    }),
    media: [buildPlaceholderImage({ label: "Midnight Garden", caption: "Styled", tone: "charcoal" })],
    items: [
      {
        setItemId: "sti-midnight-ring",
        slotName: "Ring",
        productId: "prd-sapphire-vine-ring",
        selectableVariantIds: variantIdsOf("prd-sapphire-vine-ring"),
        defaultVariantId: defaultVariantOf("prd-sapphire-vine-ring"),
        isKeyPiece: true,
        sortOrder: 0,
      },
      {
        setItemId: "sti-midnight-earrings",
        slotName: "Earrings",
        productId: "prd-emerald-leaf-drops",
        selectableVariantIds: variantIdsOf("prd-emerald-leaf-drops"),
        defaultVariantId: defaultVariantOf("prd-emerald-leaf-drops"),
        isKeyPiece: false,
        sortOrder: 1,
      },
    ],
    bundleDiscountPercent: 8,
    stockStatus: "LOW_STOCK",
    createdAt: "2026-04-20T09:00:00.000Z",
  },
  {
    id: "set-charm-starter",
    code: "SET-CHARM-START",
    name: "Charm Starter Set",
    slug: "charm-starter-set",
    description: "A foundation bracelet with your choice of three charms — the easiest place to begin a collection.",
    status: "PUBLISHED",
    heroImage: buildPlaceholderImage({ label: "Charm Starter Set", caption: "SET-CHARM-START", width: 1200, height: 800, tone: "sage" }),
    media: [buildPlaceholderImage({ label: "Charm Starter", caption: "Styled", tone: "sage" })],
    items: [
      {
        setItemId: "sti-charm-base",
        slotName: "Bracelet",
        productId: "prd-charm-bracelet",
        selectableVariantIds: variantIdsOf("prd-charm-bracelet"),
        defaultVariantId: defaultVariantOf("prd-charm-bracelet"),
        isKeyPiece: true,
        sortOrder: 0,
      },
      {
        setItemId: "sti-charm-first",
        slotName: "First charm",
        productId: "prd-charm-clover",
        selectableVariantIds: variantIdsOf("prd-charm-clover"),
        defaultVariantId: defaultVariantOf("prd-charm-clover"),
        isKeyPiece: false,
        sortOrder: 1,
      },
      {
        setItemId: "sti-charm-second",
        slotName: "Second charm",
        productId: "prd-charm-pinecone",
        selectableVariantIds: variantIdsOf("prd-charm-pinecone"),
        defaultVariantId: defaultVariantOf("prd-charm-pinecone"),
        isKeyPiece: false,
        sortOrder: 2,
      },
      {
        setItemId: "sti-charm-third",
        slotName: "Third charm",
        productId: "prd-charm-feather",
        selectableVariantIds: variantIdsOf("prd-charm-feather"),
        defaultVariantId: defaultVariantOf("prd-charm-feather"),
        isKeyPiece: false,
        sortOrder: 3,
      },
    ],
    bundleDiscountPercent: 15,
    stockStatus: "IN_STOCK",
    createdAt: "2025-12-01T09:00:00.000Z",
  },
];

export const findSetBySlug = (slug: string): CuratedSet | undefined => CURATED_SETS.find((entry) => entry.slug === slug);

export const findSetById = (id: string): CuratedSet | undefined => CURATED_SETS.find((entry) => entry.id === id);
