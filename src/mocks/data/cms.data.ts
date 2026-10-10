import type { CmsPage, StorefrontGlobalConfig } from "@/apis/cms/cms.interface";
import { buildPlaceholderImage } from "@/utils/media/placeholder.util";
import { commonConfig } from "@/common/config/app.config";

/**
 * CMS fixtures.
 *
 * The home page is not a hard-coded React page: it is a list of typed blocks that the block
 * registry renders. The admin CMS module edits this same shape, and a future Java backend can
 * return this JSON verbatim.
 */
export const CMS_PAGES: CmsPage[] = [];

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
