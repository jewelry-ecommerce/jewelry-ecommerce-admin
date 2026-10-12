import dayjs, { type Dayjs } from 'dayjs';
import type { Layout, LayoutVersion, Page, VersionBlock } from '../../../../apis/cms/cms.entities';
import { VersionStatus } from '../../../../apis/cms/cms.enum';
import { TargetDevice } from '../../../../apis';
import { CMS_BANNER_BLOCK_CATALOG_DESCRIPTION } from '../cms-page.constants';
import { normalizeCmsBlockSchemaDefinition } from './cms-block-schema.utils';
import type { CmsPageBlockCatalogItem, CmsPageFormValues, CmsPageWizardBlock } from '../cms-page.interface';

export interface CmsPageWizardHydrationContext {
  layoutId: string | null;
  versionId: string | null;
  layoutName: string;
  targetDevice: TargetDevice;
  scheduleStart: Dayjs | null;
  scheduleEnd: Dayjs | null;
  blocks: CmsPageWizardBlock[];
}

export const mapPageToFormValues = (page: Page): CmsPageFormValues => ({
  name: page.name,
  slug: page.slug,
  locale: page.locale,
  isActive: page.isActive,
  seoTitle: page.seoTitle ?? '',
  seoDescription: page.seoDescription ?? '',
  seoKeywords: page.seoKeywords ?? '',
  canonicalUrl: page.canonicalUrl ?? '',
  seoImageUrl: page.seoImageUrl ?? '',
});

const getBlockDescription = (code: string, name: string): string => (code === 'BANNER' ? CMS_BANNER_BLOCK_CATALOG_DESCRIPTION : name);

export const mapVersionBlocksToWizardBlocks = (versionBlocks: VersionBlock[], catalog: CmsPageBlockCatalogItem[]): CmsPageWizardBlock[] => {
  const sorted = [...versionBlocks].sort((a, b) => a.sortOrder - b.sortOrder);
  return sorted.map((versionBlock) => {
    const catalogItem = catalog.find((item) => item.code === versionBlock.blockTypeCode);
    const schemaDefinition = catalogItem?.schemaDefinition ?? normalizeCmsBlockSchemaDefinition(versionBlock.blockType?.schemaDefinition);
    const title = catalogItem?.name ?? versionBlock.blockTypeCode;
    return {
      clientId: versionBlock.id,
      serverId: versionBlock.id,
      blockTypeCode: versionBlock.blockTypeCode,
      title,
      description: catalogItem?.description ?? getBlockDescription(versionBlock.blockTypeCode, title),
      isActive: versionBlock.isActive,
      schemaDefinition,
      config: (versionBlock.config ?? {}) as Record<string, unknown>,
    };
  });
};

export const pickEditableLayoutVersion = (layout: Layout): LayoutVersion | undefined => {
  const draft = layout.versions?.find((version) => version.status === VersionStatus.DRAFT);
  if (draft) return draft;
  if (layout.activeVersion) return layout.activeVersion;
  const versions = layout.versions ?? [];
  if (versions.length === 0) return undefined;
  return [...versions].sort((a, b) => b.versionNumber - a.versionNumber)[0];
};

export const resolvePageWizardContext = (page: Page, catalog: CmsPageBlockCatalogItem[]): CmsPageWizardHydrationContext => {
  const layout = page.layouts?.[0];
  if (!layout) {
    return {
      layoutId: null,
      versionId: null,
      layoutName: '',
      targetDevice: TargetDevice.ALL,
      scheduleStart: null,
      scheduleEnd: null,
      blocks: [],
    };
  }

  const version = pickEditableLayoutVersion(layout);

  return {
    layoutId: layout.id,
    versionId: version?.id ?? null,
    layoutName: layout.name ?? '',
    targetDevice: layout.targetDevice ?? TargetDevice.ALL,
    scheduleStart: layout.scheduleStart ? dayjs(layout.scheduleStart) : null,
    scheduleEnd: layout.scheduleEnd ? dayjs(layout.scheduleEnd) : null,
    blocks: mapVersionBlocksToWizardBlocks(version?.blocks ?? [], catalog),
  };
};
