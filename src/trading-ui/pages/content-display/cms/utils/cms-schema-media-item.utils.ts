import type { CmsBlockObjectSchemaDefinition, CmsBlockStringSchemaDefinition } from '../../../../apis/cms/cms-schema-definition.interface';

/** Item card/gallery có `mediaType` IMAGE|GIF|VIDEO — dùng để ẩn field theo nhánh. */
export const isCmsMediaTypeItemObjectSchema = (schema: CmsBlockObjectSchemaDefinition): boolean => {
  const media = schema.properties?.mediaType;
  if (!media || typeof media !== 'object' || media.type !== 'string') return false;
  const str = media as CmsBlockStringSchemaDefinition;
  if (!Array.isArray(str.enum) || str.enum.length === 0) return false;
  const values = new Set(str.enum.filter((v): v is string => typeof v === 'string'));
  return values.has('VIDEO') && values.has('IMAGE');
};

export const getResolvedCmsMediaItemType = (objectValue: Record<string, unknown>, objectSchema: CmsBlockObjectSchemaDefinition): 'IMAGE' | 'GIF' | 'VIDEO' => {
  const raw = objectValue.mediaType;
  if (raw === 'GIF' || raw === 'VIDEO' || raw === 'IMAGE') return raw;
  const def = objectSchema.properties?.mediaType;
  const d =
    def && typeof def === 'object' && def.type === 'string' && typeof (def as CmsBlockStringSchemaDefinition).default === 'string'
      ? ((def as CmsBlockStringSchemaDefinition).default as string)
      : undefined;
  if (d === 'GIF' || d === 'VIDEO' || d === 'IMAGE') return d;
  return 'IMAGE';
};

/** Ẩn field không thuộc nhánh media đang chọn (chỉ áp dụng cho schema item có mediaType). */
export const shouldShowCmsMediaItemProperty = (propertyKey: string, mediaType: 'IMAGE' | 'GIF' | 'VIDEO'): boolean => {
  if (propertyKey === 'mediaType') return true;
  if (mediaType === 'VIDEO') {
    return propertyKey !== 'imageUrl';
  }
  return propertyKey !== 'videoUrl' && propertyKey !== 'thumbnailUrl';
};

/** Bỏ kiểm tra `required` schema cho field thuộc nhánh media không đang dùng. */
export const shouldSkipRequiredForCmsMediaItem = (propertyKey: string, mediaType: 'IMAGE' | 'GIF' | 'VIDEO'): boolean => {
  if (mediaType === 'VIDEO' && propertyKey === 'imageUrl') return true;
  if ((mediaType === 'IMAGE' || mediaType === 'GIF') && (propertyKey === 'videoUrl' || propertyKey === 'thumbnailUrl')) {
    return true;
  }
  return false;
};

export const orderCmsMediaItemPropertyEntries = <T>(entries: [string, T][]): [string, T][] =>
  [...entries].sort(([a], [b]) => {
    if (a === 'mediaType') return -1;
    if (b === 'mediaType') return 1;
    return 0;
  });
