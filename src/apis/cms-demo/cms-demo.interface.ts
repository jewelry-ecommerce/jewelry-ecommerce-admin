export enum CmsDemoBlockType {
  BANNER = "BANNER",
  PRODUCT_CAROUSEL = "PRODUCT_CAROUSEL",
  INFO_CARDS = "INFO_CARDS",
  IMAGE_GALLERY = "IMAGE_GALLERY",
  PRODUCT_EXPANDABLE_DESCRIPTION = "PRODUCT_EXPANDABLE_DESCRIPTION",
}
export enum CmsDemoStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}
export interface CmsDemoItem extends Record<string, unknown> {
  imageUrl?: string;
  title?: string;
  description?: string;
  actionText?: string;
  actionUrl?: string;
  label?: string;
}
export interface CmsDemoConfig extends Record<string, unknown> {
  title?: string;
  description?: string;
  placementCode?: string;
  header?: { title: string; subtitle: string };
  display?: { columns?: number; limit?: number };
  items?: CmsDemoItem[];
  dataSource?: { filterType: string; productIds?: string[]; [key: string]: unknown };
}
export interface CmsDemoBlock {
  id: string;
  blockTypeCode: CmsDemoBlockType;
  sortOrder: number;
  isVisible: boolean;
  config: CmsDemoConfig;
}
export interface CmsDemoPage {
  displayStatus?: 'DRAFT'|'SCHEDULED'|'RUNNING'|'PAUSED'|'ENDED';
  targetDevice?: 'ALL'|'DESKTOP'|'MOBILE';
  scheduleStart?: string|null;
  scheduleEnd?: string|null;
  hasUnpublishedChanges?: boolean;
  versionId?: number;
  locale?: string;
  isActive?: boolean;
  id: string;
  name: string;
  slug: string;
  status: CmsDemoStatus;
  revision: number;
  seo: { title: string; description: string; keywords?: string; imageUrl?: string; canonicalUrl?: string };
  blocks: CmsDemoBlock[];
}
