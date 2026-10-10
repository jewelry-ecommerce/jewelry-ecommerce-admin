import type { CmsBlockSchemaDefinition } from '../apis/cms/cms-schema-definition.interface';
import { normalizeCmsBlockSchemaDefinition } from '../pages/content-display/cms/utils/cms-block-schema.utils';
import { PRODUCT_CAROUSEL_SCHEMA } from './product-carousel.schema';
import { INFO_CARDS_SCHEMA } from './info-cards.schema';
import { IMAGE_GALLERY_SCHEMA } from './image-gallery.schema';
import { PRODUCT_EXPANDABLE_DESCRIPTION_SCHEMA } from './product-expandable-description.schema';
const CMS_SOURCE_SCHEMAS: Record<string, unknown> = {
  PRODUCT_CAROUSEL: PRODUCT_CAROUSEL_SCHEMA, INFO_CARDS: INFO_CARDS_SCHEMA,
  IMAGE_GALLERY: IMAGE_GALLERY_SCHEMA, PRODUCT_EXPANDABLE_DESCRIPTION: PRODUCT_EXPANDABLE_DESCRIPTION_SCHEMA,
};
export function getCmsSourceBlockSchema(code: string): CmsBlockSchemaDefinition | null {
  return normalizeCmsBlockSchemaDefinition(CMS_SOURCE_SCHEMAS[code]);
}
