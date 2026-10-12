import type { PageDisplayStatus, PlacementDisplayType } from '../../../apis';
import type { QueryPageDto } from '../../../apis/cms/cms.interface';
import type { CmsBlockSchemaDefinition } from '../../../apis/cms/cms-schema-definition.interface';
import type { CmsBlockSchemaValidationErrors } from './utils/cms-block-schema.utils';

export interface CmsPageListQueryState extends Omit<QueryPageDto, 'displayStatus'> {
  displayStatus?: PageDisplayStatus | '';
}

export type CmsPageBuilderTab = 'config' | 'blocks' | 'queue';

export interface CmsPageFormValues {
  name: string;
  slug: string;
  locale: string;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  canonicalUrl?: string;
  seoImageUrl?: string;
}

export interface CmsPageLayoutFormValues {
  name: string;
  targetDevice: string;
  scheduleStart: string;
  scheduleEnd: string;
}

export interface CmsPageVersionFormValues {
  versionName: string;
  seoOverrideText: string;
}

export interface CmsPageBlockFormValues {
  blockTypeCode: string;
  configText: string;
  targetSegment: string;
  isActive: boolean;
}

export interface CmsPageWizardBlock {
  clientId: string;
  serverId?: string;
  blockTypeCode: string;
  title: string;
  description: string;
  isActive: boolean;
  schemaDefinition?: CmsBlockSchemaDefinition | null;
  config: Record<string, unknown>;
}

export type CmsPageWizardMode = 'create' | 'edit' | 'view';

export interface BannerPlacementDraftInput {
  code?: string;
  name: string;
  displayType: PlacementDisplayType;
  columns?: number;
  rows?: number;
}

export interface BannerPlacementDraftResult {
  placementId: string;
  placementCode: string;
  displayType: PlacementDisplayType;
  columns: number;
  rows: number;
  layoutId?: string;
  itemCount?: number;
  name?: string;
  /** Snapshot settings hiện tại để merge khi patch (GRID mobile odd layout, …). */
  settings?: Record<string, unknown>;
}

export interface CmsPageBlockCatalogItem {
  code: string;
  name: string;
  description: string;
  schemaDefinition?: CmsBlockSchemaDefinition | null;
}

export type CmsPageBlockValidationState = Record<string, CmsBlockSchemaValidationErrors>;
