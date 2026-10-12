import { type PageOptionsDto } from '../../common/constant/api.interface';
import { type BlockType } from './cms.entities';
import { type NavigationType, type PageDisplayStatus, type TargetDevice } from './cms.enum';
import type { CmsBlockSchemaDefinition } from './cms-schema-definition.interface';

export interface CreateBlockTypeDto {
  code: string;
  name: string;
  schemaDefinition?: CmsBlockSchemaDefinition | null;
  isActive?: boolean;
}

export interface QueryBlockTypeDto extends PageOptionsDto<BlockType> {
  code?: string;
  isActive?: boolean;
}

export type UpdateBlockTypeDto = Partial<CreateBlockTypeDto>;

export interface CreateLayoutDto {
  name?: string;
  targetDevice?: TargetDevice;
  scheduleStart?: Date;
  scheduleEnd?: Date;
}

export type UpdateLayoutDto = Partial<CreateLayoutDto>;

export interface CreateLayoutVersionDto {
  versionName?: string;
  seoOverride?: object;
}

export type UpdateLayoutVersionDto = Partial<CreateLayoutVersionDto>;

export interface CreateNavigationDto {
  label: string;
  type: NavigationType;
  parentId?: string;
  targetId?: string;
  url?: string;
  filterParams?: Record<string, unknown>;
  icon?: string;
  image?: string;
  openInNewTab?: boolean;
  sortOrder?: number;
}

export interface NavigationSortItem {
  id: string;
  sortOrder: number;
}

export interface ReorderNavigationsDto {
  items: NavigationSortItem[];
}

export type UpdateNavigationDto = Partial<CreateNavigationDto>;

export interface CreatePageDto {
  name: string;
  slug: string;
  locale?: string;
  tenantCode?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  canonicalUrl?: string;
  seoImageUrl?: string;
  isActive?: boolean;
}

export interface QueryPageDto extends PageOptionsDto<string> {
  slug?: string;
  locale?: string;
  isActive?: boolean;
  displayStatus?: PageDisplayStatus;
}

export type UpdatePageDto = Partial<CreatePageDto>;

/** BE trả về khi slug+locale trùng bản ghi đã xóa mềm — cần chọn khôi phục hoặc ghi đè. */
export interface CmsPostPageRestoreOverwriteResponse {
  success?: boolean;
  flow: 'restore_overwrite';
  message: string;
  existingPageId: string;
  slug: string;
  locale: string;
  deletedAt?: string;
}

export function isCmsPostPageRestoreOverwriteResponse(data: unknown): data is CmsPostPageRestoreOverwriteResponse {
  if (!data || typeof data !== 'object') return false;
  const o = data as Record<string, unknown>;
  return o.flow === 'restore_overwrite' && typeof o.existingPageId === 'string';
}

export interface CreateSubscriberDto {
  email: string;
  privacyPolicyAccepted: boolean;
}

export type QuerySubscriberDto = PageOptionsDto<string>;

export interface BlockSortItem {
  id: string;
  sortOrder: number;
}

export interface BulkSortBlocksDto {
  items: BlockSortItem[];
}

export interface CreateVersionBlockDto {
  blockTypeCode: string;
  config: object;
  sortOrder?: number;
  targetSegment?: string;
  isActive?: boolean;
}

export type UpdateVersionBlockDto = Partial<CreateVersionBlockDto>;
