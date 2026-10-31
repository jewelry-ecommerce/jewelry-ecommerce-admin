
import { BANNER_SCHEMA } from '../source-schema/banner.schema';
import { PRODUCT_CAROUSEL_SCHEMA } from '../source-schema/product-carousel.schema';
import { INFO_CARDS_SCHEMA } from '../source-schema/info-cards.schema';
import { IMAGE_GALLERY_SCHEMA } from '../source-schema/image-gallery.schema';
import { PRODUCT_EXPANDABLE_DESCRIPTION_SCHEMA } from '../source-schema/product-expandable-description.schema';
import { PRODUCT_LIST_SCHEMA } from '../source-schema/product-list.schema';
import { PRODUCT_CATEGORY_NAV_SCHEMA } from '../source-schema/product-category-nav.schema';
import { PRODUCT_COLLECTION_SHOWCASE_SCHEMA } from '../source-schema/product-collection-showcase.schema';
import { CmsDemoBlockType } from '@/apis/cms-demo/cms-demo.interface';
import { CMS_BLOCK_LABELS, newCmsBlock } from '@/pages/cms/cms-demo.constants';
import type { CmsPageBlockCatalogItem, CmsPageWizardBlock } from '../cms-page.interface';
const SCHEMAS = { BANNER:BANNER_SCHEMA, PRODUCT_CAROUSEL:PRODUCT_CAROUSEL_SCHEMA, INFO_CARDS:INFO_CARDS_SCHEMA,
  IMAGE_GALLERY:IMAGE_GALLERY_SCHEMA, PRODUCT_EXPANDABLE_DESCRIPTION:PRODUCT_EXPANDABLE_DESCRIPTION_SCHEMA,
  PRODUCT_LIST:PRODUCT_LIST_SCHEMA, PRODUCT_CATEGORY_NAV:PRODUCT_CATEGORY_NAV_SCHEMA,
  PRODUCT_COLLECTION_SHOWCASE:PRODUCT_COLLECTION_SHOWCASE_SCHEMA };
export const JAVA_CMS_BLOCK_CATALOG:CmsPageBlockCatalogItem[] = Object.values(CmsDemoBlockType).map(code=>({code,name:CMS_BLOCK_LABELS[code],description:CMS_BLOCK_LABELS[code],schemaDefinition:SCHEMAS[code]}));
export function newWizardBlock(entry:CmsPageBlockCatalogItem):CmsPageWizardBlock{
  const type=Object.values(CmsDemoBlockType).find(type=>type===entry.code);
  if(!type)throw new Error('Loại khối nội dung này chưa được hỗ trợ.');
  const block=newCmsBlock(type,0);
  return {clientId:block.id,blockTypeCode:type,title:entry.name,description:entry.description,isActive:true,config:block.config,schemaDefinition:entry.schemaDefinition};
}
