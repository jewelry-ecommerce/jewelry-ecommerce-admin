import { type BaseEntity } from '../../common/constant/api.interface';
import { type NavigationType, type PageDisplayStatus, type TargetDevice, type VersionStatus } from './cms.enum';
import type { CmsBlockSchemaDefinition } from './cms-schema-definition.interface';

export interface BlockType extends BaseEntity {
  code: string;
  name: string;
  schemaDefinition?: CmsBlockSchemaDefinition | null;
  isActive: boolean;
  versionBlocks?: VersionBlock[];
}

export interface Layout extends BaseEntity {
  pageId: string;
  name: string;
  activeVersionId?: string;
  scheduleStart?: Date;
  scheduleEnd?: Date;
  targetDevice: TargetDevice;
  page?: Page;
  versions?: LayoutVersion[];
  activeVersion?: LayoutVersion;
}

export interface LayoutVersion extends BaseEntity {
  layoutId: string;
  versionName: string;
  versionNumber: number;
  status: VersionStatus;
  publishedAt?: Date;
  publishedBy?: string;
  seoOverride?: object;
  layout?: Layout;
  blocks?: VersionBlock[];
}

export interface Navigation extends BaseEntity {
  parentId?: string;
  parent?: Navigation;
  label: string;
  type: NavigationType;
  targetId?: string;
  url?: string;
  filterParams?: Record<string, unknown>;
  icon?: string;
  image?: string;
  openInNewTab: boolean;
  sortOrder: number;
}

export interface Page extends Omit<BaseEntity,"createdAt"|"updatedAt"> {
  createdAt?: Date; updatedAt?: Date;
  name: string;
  slug: string;
  locale: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  canonicalUrl?: string;
  seoImageUrl?: string;
  isActive: boolean;
  displayStatus?: PageDisplayStatus;
  layouts?: Layout[];
}

export interface Subscriber extends BaseEntity {
  email: string;
  privacyPolicyAccepted: boolean;
  isActive: boolean;
}

export interface VersionBlock extends BaseEntity {
  layoutVersionId: string;
  blockTypeCode: string;
  sortOrder: number;
  config: object;
  targetSegment?: string;
  isActive: boolean;
  layoutVersion?: LayoutVersion;
  blockType?: BlockType;
}
