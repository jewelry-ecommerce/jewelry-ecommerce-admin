/** Store configuration contract. One typed group per settings screen. */
export type GeneralSetting = {
  brandName: string;
  legalName: string;
  supportEmail: string;
  hotline: string;
  currency: string;
  locale: string;
  timezone: string;
};

export type StoreSetting = {
  boutiques: {
    id: string;
    name: string;
    city: string;
    address: string;
    openingHours: string;
    isActive: boolean;
  }[];
  allowBoutiquePickup: boolean;
  appointmentLeadTimeHours: number;
};

export type PaymentSetting = {
  methods: {
    code: "COD" | "BANK_TRANSFER" | "CREDIT_CARD" | "E_WALLET";
    label: string;
    isEnabled: boolean;
    /** Percentage of the order collected up front; 0 means charge in full on delivery. */
    depositPercent: number;
  }[];
  bankTransferNote: string;
};

export type ShippingSetting = {
  methods: {
    code: "STANDARD" | "EXPRESS" | "BOUTIQUE_PICKUP";
    label: string;
    isEnabled: boolean;
    fee: number;
    etaLabel: string;
  }[];
  freeShippingThreshold: number;
  insuranceRequiredAbove: number;
};

export type SeoSetting = {
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  defaultKeywords: string;
  robotsIndexable: boolean;
  sitemapEnabled: boolean;
  organizationJsonLdEnabled: boolean;
};

export type AnalyticsSetting = {
  googleAnalyticsId: string;
  googleTagManagerId: string;
  metaPixelId: string;
  isConsentBannerEnabled: boolean;
};

export type LiveChatSetting = {
  provider: "NONE" | "INTERNAL" | "ZALO" | "MESSENGER";
  isEnabled: boolean;
  widgetPosition: "LEFT" | "RIGHT";
  greeting: string;
  officeHours: string;
};

export type SettingGroupMap = {
  general: GeneralSetting;
  store: StoreSetting;
  payment: PaymentSetting;
  shipping: ShippingSetting;
  seo: SeoSetting;
  analytics: AnalyticsSetting;
  liveChat: LiveChatSetting;
};

export type SettingGroupKey = keyof SettingGroupMap;
