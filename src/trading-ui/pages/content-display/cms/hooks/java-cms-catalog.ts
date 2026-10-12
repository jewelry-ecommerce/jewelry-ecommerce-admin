
import { BANNER_SCHEMA } from '../source-schema/banner.schema';
import { PRODUCT_CAROUSEL_SCHEMA } from '../source-schema/product-carousel.schema';
import { INFO_CARDS_SCHEMA } from '../source-schema/info-cards.schema';
import { IMAGE_GALLERY_SCHEMA } from '../source-schema/image-gallery.schema';
import { PRODUCT_EXPANDABLE_DESCRIPTION_SCHEMA } from '../source-schema/product-expandable-description.schema';
import { CmsDemoBlockType } from '@/apis/cms-demo/cms-demo.interface';
import { CMS_BLOCK_LABELS, newCmsBlock } from '@/pages/cms/cms-demo.constants';
import type { CmsPageBlockCatalogItem, CmsPageWizardBlock } from '../cms-page.interface';
const SCHEMAS = { BANNER:BANNER_SCHEMA, PRODUCT_CAROUSEL:PRODUCT_CAROUSEL_SCHEMA, INFO_CARDS:INFO_CARDS_SCHEMA,
  IMAGE_GALLERY:IMAGE_GALLERY_SCHEMA, PRODUCT_EXPANDABLE_DESCRIPTION:PRODUCT_EXPANDABLE_DESCRIPTION_SCHEMA };
export const JAVA_CMS_BLOCK_CATALOG:CmsPageBlockCatalogItem[] = Object.values(CmsDemoBlockType).map(code=>({code,name:CMS_BLOCK_LABELS[code],description:CMS_BLOCK_LABELS[code],schemaDefinition:SCHEMAS[code]}));
export function newWizardBlock(entry:CmsPageBlockCatalogItem):CmsPageWizardBlock{
  const type=Object.values(CmsDemoBlockType).find(type=>type===entry.code);
  if(!type)throw new Error('Loại block chưa được Java hỗ trợ.');
  const block=newCmsBlock(type,0);
  return {clientId:block.id,blockTypeCode:type,title:entry.name,description:entry.description,isActive:true,config:block.config,schemaDefinition:entry.schemaDefinition};
}
