import type { CmsBlockSchemaDefinition, CmsBlockStringSchemaDefinition } from '../../../../apis/cms/cms-schema-definition.interface';

const normalizeKey = (key: string) => key.toLowerCase().replace(/[_-]/g, '');

/**
 * Trường string trong schema block CMS: dùng upload ảnh (uploadSingleImage) thay vì chỉ gõ URL.
 * Nhận diện theo title tiếng Việt phổ biến và theo tên thuộc tính (imageUrl, thumbnailUrl, …).
 */
export function isCmsSchemaImageUrlStringField(schema: CmsBlockSchemaDefinition, propertyKey: string | undefined, fieldLabel: string): schema is CmsBlockStringSchemaDefinition {
  if (schema.type !== 'string') return false;
  const str = schema as CmsBlockStringSchemaDefinition;
  if (str.enum && str.enum.length > 0) return false;

  const key = normalizeKey(propertyKey ?? '');
  const label = fieldLabel.toLowerCase();

  if (label.includes('đường dẫn hình ảnh')) return true;
  if (label.includes('hình ảnh minh họa')) return true;
  if (label.includes('image url') || label.includes('image path')) return true;

  if (
    key.includes('imageurl') ||
    key.includes('imagepath') ||
    key === 'imageurl' ||
    key === 'image' ||
    key.includes('thumbnailurl') ||
    key.includes('thumburl') ||
    key.includes('coverimage') ||
    key.includes('coverurl') ||
    key.includes('heroimage') ||
    key.includes('bannerimage') ||
    key.includes('illustration') ||
    key.includes('mediourl') ||
    key.includes('pictureurl') ||
    key.includes('avatarurl') ||
    key.includes('iconurl')
  ) {
    return true;
  }

  return false;
}
