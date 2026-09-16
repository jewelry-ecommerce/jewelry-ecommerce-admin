import type { SettingGroupMap } from "@/apis/setting/setting.interface";
import { commonConfig } from "@/common/config/app.config";
import { WAREHOUSES } from "./inventory.data";

/** Store configuration fixtures. Mutated in place by `settingApi.updateSettingGroup`. */
export const SETTINGS: SettingGroupMap = {
  general: {
    brandName: commonConfig.BRAND_NAME,
    legalName: "Aurelia Jewelry Trading JSC",
    supportEmail: "care@aurelia.test",
    hotline: "1900 6868",
    currency: commonConfig.CURRENCY,
    locale: commonConfig.LOCALE,
    timezone: "Asia/Ho_Chi_Minh",
  },
  store: {
    boutiques: WAREHOUSES.map((warehouse) => ({
      id: warehouse.id,
      name: warehouse.name,
      city: warehouse.city,
      address: warehouse.address,
      openingHours: "09:00 – 21:00 daily",
      isActive: warehouse.isActive,
    })),
    allowBoutiquePickup: true,
    appointmentLeadTimeHours: 24,
  },
  payment: {
    methods: [
      { code: "COD", label: "Cash on delivery", isEnabled: true, depositPercent: 0 },
      { code: "BANK_TRANSFER", label: "Bank transfer", isEnabled: true, depositPercent: 30 },
      { code: "CREDIT_CARD", label: "Credit / debit card", isEnabled: true, depositPercent: 100 },
      { code: "E_WALLET", label: "E-wallet", isEnabled: false, depositPercent: 100 },
    ],
    bankTransferNote: "Transfers must quote the order code in the reference field.",
  },
  shipping: {
    methods: [
      { code: "STANDARD", label: "Insured standard delivery", isEnabled: true, fee: 0, etaLabel: "3 – 5 working days" },
      { code: "EXPRESS", label: "Insured express delivery", isEnabled: true, fee: 120000, etaLabel: "1 – 2 working days" },
      { code: "BOUTIQUE_PICKUP", label: "Boutique pickup", isEnabled: true, fee: 0, etaLabel: "Ready in 24 hours" },
    ],
    freeShippingThreshold: 5000000,
    insuranceRequiredAbove: 20000000,
  },
  seo: {
    defaultTitle: "Aurelia Fine Jewelry",
    titleTemplate: "%s | Aurelia Fine Jewelry",
    defaultDescription: "Fine jewelry crafted with certified gemstones and responsibly sourced metals.",
    defaultKeywords: "fine jewelry, diamond ring, gold necklace, gemstone earrings, curated jewelry set",
    robotsIndexable: true,
    sitemapEnabled: true,
    organizationJsonLdEnabled: true,
  },
  analytics: {
    googleAnalyticsId: "G-DEMO0000",
    googleTagManagerId: "GTM-DEMO000",
    metaPixelId: "",
    isConsentBannerEnabled: true,
  },
  liveChat: {
    provider: "INTERNAL",
    isEnabled: true,
    widgetPosition: "RIGHT",
    greeting: "Our jewelry consultants reply within a few minutes.",
    officeHours: "Mon – Sat, 09:00 – 20:00 (GMT+7)",
  },
};
