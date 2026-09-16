import type { CmsPage, StorefrontGlobalConfig } from "@/apis/cms/cms.interface";
import { buildBannerImage, buildPlaceholderImage } from "@/utils/media/placeholder.util";
import { commonConfig } from "@/common/config/app.config";

/**
 * CMS fixtures.
 *
 * The home page is not a hard-coded React page: it is a list of typed blocks that the block
 * registry renders. The admin CMS module edits this same shape, and a future Java backend can
 * return this JSON verbatim.
 */
export const CMS_PAGES: CmsPage[] = [
  {
    id: "cms-home",
    slug: "home",
    name: "Home",
    status: "PUBLISHED",
    seo: {
      title: `${commonConfig.BRAND_NAME} — Fine jewelry, crafted to be kept`,
      description:
        "Certified diamonds, coloured gemstones and responsibly sourced gold. Explore rings, necklaces, earrings and curated jewelry sets.",
      keywords: "fine jewelry, engagement ring, diamond necklace, curated jewelry set",
      canonicalUrl: null,
      imageUrl: buildBannerImage("Aurelia Fine Jewelry", "gold", "Crafted to be kept"),
    },
    updatedAt: "2026-09-01T10:00:00.000Z",
    publishedAt: "2026-09-01T10:00:00.000Z",
    blocks: [
      {
        id: "blk-home-hero",
        type: "HERO_BANNER",
        sortOrder: 1,
        isVisible: true,
        config: {
          autoplayMs: 6000,
          slides: [
            {
              id: "hero-bridal",
              eyebrow: "Eternal Light",
              title: "The bridal collection",
              description: "Certified brilliant-cut diamonds, hand-set in gold and platinum.",
              image: buildBannerImage("Eternal Light Bridal", "gold", "Certified diamonds"),
              mobileImage: buildPlaceholderImage({ label: "Eternal Light", caption: "Bridal", width: 900, height: 1100, tone: "gold" }),
              cta: { label: "Shop bridal", href: "/collections/eternal-light" },
              secondaryCta: { label: "Book an appointment", href: "/contact" },
              align: "left",
            },
            {
              id: "hero-midnight",
              eyebrow: "Midnight Garden",
              title: "Colour, considered",
              description: "Sapphire and emerald pieces inspired by botanical silhouettes.",
              image: buildBannerImage("Midnight Garden", "charcoal", "Sapphire and emerald"),
              mobileImage: buildPlaceholderImage({
                label: "Midnight Garden",
                caption: "Colour",
                width: 900,
                height: 1100,
                tone: "charcoal",
              }),
              cta: { label: "Explore the collection", href: "/collections/midnight-garden" },
              secondaryCta: null,
              align: "center",
            },
            {
              id: "hero-everyday",
              eyebrow: "Everyday Gold",
              title: "Never take it off",
              description: "Featherweight solid gold designed for daily wear.",
              image: buildBannerImage("Everyday Gold", "ivory", "Solid gold essentials"),
              mobileImage: buildPlaceholderImage({
                label: "Everyday Gold",
                caption: "Essentials",
                width: 900,
                height: 1100,
                tone: "ivory",
              }),
              cta: { label: "Shop everyday", href: "/collections/everyday-gold" },
              secondaryCta: null,
              align: "right",
            },
          ],
        },
      },
      {
        id: "blk-home-trust",
        type: "TRUST_SIGNALS",
        sortOrder: 2,
        isVisible: true,
        config: {
          items: [
            { icon: "certificate", title: "Certified stones", description: "Independent certification with every gemstone." },
            { icon: "shield", title: "Lifetime warranty", description: "Complimentary cleaning and re-polishing, always." },
            { icon: "truck", title: "Insured delivery", description: "Fully insured, signature-required shipping." },
            { icon: "refresh", title: "30-day returns", description: "Change your mind within 30 days." },
          ],
        },
      },
      {
        id: "blk-home-categories",
        type: "CATEGORY_GRID",
        sortOrder: 3,
        isVisible: true,
        config: {
          title: "Shop by category",
          description: "Five families, one design language.",
          categorySlugs: ["rings", "necklaces", "earrings", "bracelets", "charms"],
        },
      },
      {
        id: "blk-home-bestsellers",
        type: "PRODUCT_CAROUSEL",
        sortOrder: 4,
        isVisible: true,
        config: {
          title: "Most loved",
          description: "The pieces our clients return for.",
          productIds: [
            "prd-solitaire-halo",
            "prd-luminous-studs",
            "prd-mini-hoops",
            "prd-charm-clover",
            "prd-radiance-pendant",
            "prd-charm-bracelet",
          ],
          viewAllHref: "/products?sort=RATING_DESC",
        },
      },
      {
        id: "blk-home-collection",
        type: "COLLECTION_BANNER",
        sortOrder: 5,
        isVisible: true,
        config: {
          collectionSlug: "eternal-light",
          title: "Eternal Light",
          description: "Our bridal signature: brilliant-cut diamonds set in warm gold, finished entirely by hand.",
          image: buildBannerImage("Eternal Light Collection", "gold", "Bridal signature"),
          cta: { label: "View the collection", href: "/collections/eternal-light" },
        },
      },
      {
        id: "blk-home-sets",
        type: "CURATED_SET",
        sortOrder: 6,
        isVisible: true,
        config: {
          title: "Curated sets",
          description: "Complete arrangements, priced better together. Choose the metal and size for each piece.",
          setIds: ["set-bridal-eternal", "set-everyday-gold", "set-charm-starter"],
        },
      },
      {
        id: "blk-home-stylist",
        type: "AI_STYLIST_CTA",
        sortOrder: 7,
        isVisible: true,
        config: {
          title: "Not sure where to start?",
          description: "Answer four questions and our stylist will shortlist pieces that suit your style, budget and occasion.",
          image: buildBannerImage("AI Jewelry Stylist", "blush", "Personal recommendations"),
          cta: { label: "Try the stylist", href: "/stylist" },
        },
      },
      {
        id: "blk-home-set-builder",
        type: "SET_BUILDER_CTA",
        sortOrder: 8,
        isVisible: true,
        config: {
          title: "Build your own set",
          description: "Combine a ring, a necklace and earrings into one arrangement and save on the bundle.",
          image: buildBannerImage("Smart Set Builder", "sage", "Build and save"),
          cta: { label: "Open the set builder", href: "/set-builder" },
        },
      },
      {
        id: "blk-home-editorial",
        type: "EDITORIAL_CONTENT",
        sortOrder: 9,
        isVisible: true,
        config: {
          title: "How we choose a stone",
          body: "Every gemstone is reviewed in person against four criteria: certification, cut precision, colour consistency and how it behaves in natural light. Only stones that pass all four reach the workshop.",
          image: buildPlaceholderImage({ label: "The Workshop", caption: "Editorial", width: 900, height: 700, tone: "ivory" }),
          imagePosition: "left",
          cta: { label: "Read our craft notes", href: "/about" },
        },
      },
      {
        id: "blk-home-membership",
        type: "MEMBERSHIP_CTA",
        sortOrder: 10,
        isVisible: true,
        config: {
          title: "Aurelia Club",
          description: "Earn points on every order and unlock styling appointments, early access and complimentary care.",
          tiers: ["Member", "Silver", "Gold", "Diamond"],
          cta: { label: "See the benefits", href: "/account/loyalty" },
        },
      },
      {
        id: "blk-home-promo",
        type: "PROMO_BANNER",
        sortOrder: 11,
        isVisible: true,
        config: {
          title: "Bridal season — 12% off bridal rings",
          description: "Applied automatically to the Eternal Light collection until the end of December.",
          image: buildBannerImage("Bridal Season Offer", "gold", "12% off"),
          cta: { label: "Shop the offer", href: "/promotions" },
          tone: "gold",
        },
      },
      {
        id: "blk-home-newsletter",
        type: "NEWSLETTER",
        sortOrder: 12,
        isVisible: true,
        config: {
          title: "First look at new pieces",
          description: "One considered email a month. No noise.",
          placeholder: "your@email.com",
          submitLabel: "Subscribe",
        },
      },
    ],
  },
  {
    id: "cms-about",
    slug: "about",
    name: "About us",
    status: "PUBLISHED",
    seo: {
      title: `Our craft | ${commonConfig.BRAND_NAME}`,
      description: "How we source stones, finish metal and stand behind every piece we sell.",
      keywords: "jewelry craft, responsible sourcing, gemstone certification",
      canonicalUrl: null,
      imageUrl: null,
    },
    updatedAt: "2026-08-12T10:00:00.000Z",
    publishedAt: "2026-08-12T10:00:00.000Z",
    blocks: [
      {
        id: "blk-about-hero",
        type: "PROMO_BANNER",
        sortOrder: 1,
        isVisible: true,
        config: {
          title: "Made to be kept",
          description: "A small workshop, a short supply chain, and a lifetime warranty on everything we make.",
          image: buildBannerImage("Our Craft", "ivory", "Made to be kept"),
          cta: { label: "Browse the collections", href: "/products" },
          tone: "light",
        },
      },
      {
        id: "blk-about-sourcing",
        type: "EDITORIAL_CONTENT",
        sortOrder: 2,
        isVisible: true,
        config: {
          title: "Responsible sourcing",
          body: "Our gold is refined from recycled stock wherever supply allows, and every gemstone arrives with independent certification naming its origin. We publish our supplier list annually.",
          image: buildPlaceholderImage({ label: "Responsible Sourcing", caption: "Supply chain", width: 900, height: 700, tone: "sage" }),
          imagePosition: "right",
          cta: null,
        },
      },
      {
        id: "blk-about-care",
        type: "TRUST_SIGNALS",
        sortOrder: 3,
        isVisible: true,
        config: {
          items: [
            { icon: "certificate", title: "Certified", description: "Independent certification with every stone." },
            { icon: "shield", title: "Lifetime care", description: "Free cleaning and re-polishing for life." },
            { icon: "refresh", title: "Resize service", description: "One complimentary resize within 12 months." },
          ],
        },
      },
    ],
  },
];

export const findCmsPageBySlug = (slug: string): CmsPage | undefined => CMS_PAGES.find((page) => page.slug === slug);

export const STOREFRONT_GLOBAL_CONFIG: StorefrontGlobalConfig = {
  brandName: commonConfig.BRAND_NAME,
  topBannerMessages: [
    "Complimentary insured delivery on orders over 5,000,000",
    "Bridal season — 12% off the Eternal Light collection",
    "Lifetime cleaning and re-polishing on every piece",
  ],
  navigation: [
    {
      id: "nav-rings",
      label: "Rings",
      href: "/categories/rings",
      featureImage: buildPlaceholderImage({ label: "Rings", caption: "Shop rings", width: 480, height: 320, tone: "gold" }),
      children: [
        { id: "nav-rings-engagement", label: "Engagement", href: "/categories/rings?occasions=BRIDAL", children: [] },
        { id: "nav-rings-eternity", label: "Eternity bands", href: "/categories/rings?occasions=ANNIVERSARY", children: [] },
        { id: "nav-rings-everyday", label: "Everyday bands", href: "/categories/rings?occasions=EVERYDAY", children: [] },
        { id: "nav-rings-all", label: "All rings", href: "/categories/rings", children: [] },
      ],
    },
    {
      id: "nav-necklaces",
      label: "Necklaces",
      href: "/categories/necklaces",
      featureImage: buildPlaceholderImage({ label: "Necklaces", caption: "Shop necklaces", width: 480, height: 320, tone: "ivory" }),
      children: [
        { id: "nav-neck-pendants", label: "Pendants", href: "/categories/necklaces?gemstones=DIAMOND", children: [] },
        { id: "nav-neck-chains", label: "Chains", href: "/categories/necklaces?gemstones=NONE", children: [] },
        { id: "nav-neck-all", label: "All necklaces", href: "/categories/necklaces", children: [] },
      ],
    },
    {
      id: "nav-earrings",
      label: "Earrings",
      href: "/categories/earrings",
      featureImage: buildPlaceholderImage({ label: "Earrings", caption: "Shop earrings", width: 480, height: 320, tone: "blush" }),
      children: [
        { id: "nav-ear-studs", label: "Studs", href: "/categories/earrings?occasions=EVERYDAY", children: [] },
        { id: "nav-ear-drops", label: "Drops", href: "/categories/earrings?occasions=STATEMENT", children: [] },
        { id: "nav-ear-all", label: "All earrings", href: "/categories/earrings", children: [] },
      ],
    },
    {
      id: "nav-bracelets",
      label: "Bracelets",
      href: "/categories/bracelets",
      children: [
        { id: "nav-brac-tennis", label: "Tennis bracelets", href: "/categories/bracelets?gemstones=SAPPHIRE", children: [] },
        { id: "nav-brac-all", label: "All bracelets", href: "/categories/bracelets", children: [] },
      ],
    },
    {
      id: "nav-sets",
      label: "Curated sets",
      href: "/sets",
      children: [],
    },
    {
      id: "nav-collections",
      label: "Collections",
      href: "/collections",
      children: [
        { id: "nav-col-eternal", label: "Eternal Light", href: "/collections/eternal-light", children: [] },
        { id: "nav-col-midnight", label: "Midnight Garden", href: "/collections/midnight-garden", children: [] },
        { id: "nav-col-everyday", label: "Everyday Gold", href: "/collections/everyday-gold", children: [] },
      ],
    },
  ],
  footerColumns: [
    {
      title: "Shop",
      links: [
        { label: "All jewelry", href: "/products" },
        { label: "Curated sets", href: "/sets" },
        { label: "Collections", href: "/collections" },
        { label: "Promotions", href: "/promotions" },
      ],
    },
    {
      title: "Services",
      links: [
        { label: "AI stylist", href: "/stylist" },
        { label: "Set builder", href: "/set-builder" },
        { label: "Order tracking", href: "/orders/track" },
        { label: "Salon information", href: "/stores" },
      ],
    },
    {
      title: "Help",
      links: [
        { label: "Contact us", href: "/contact" },
        { label: "Our craft", href: "/about" },
        { label: "Loyalty programme", href: "/account/loyalty" },
        { label: "My account", href: "/account" },
      ],
    },
  ],
  socialLinks: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Facebook", href: "https://facebook.com" },
    { label: "Pinterest", href: "https://pinterest.com" },
  ],
  hotline: "1900 8888",
  supportEmail: "care@aurelia.test",
};
