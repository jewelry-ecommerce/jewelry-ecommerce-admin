import { Box, Stack, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Trash01 } from '@untitledui/icons';
import useSWR from 'swr';
import { CheckboxComponent } from '../../../../components/check-box/check-box.element';
import { CustomButton } from '../../../../components/button/custom-button';
import { contentButtonPermission } from '../../content-permission.constants';
import { SelectAllInput, SelectAttributeTreeInput, SelectInput, SELECT_INPUT_MENU_MAX_HEIGHT, TextInput } from '../../../../components/form';
import { TextFieldUploadContent as TextFieldUpload } from '../../components/text-field-upload-content.component';
import { RichTextEditor } from '../../../../components/editor/rich-text-editor.component';
import { HighlightStatusToggle } from '../../../../components/switch/highlight-status-toggle.component';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { getErrorMessage } from '../../../../common/utils';
import { uploadSingleImage } from '../../../../common/utils/image-upload.utils';
import { MediaVisibility } from '../../../../apis/file/file.enum';
import { SnackbarType, useSnackbar } from '../../../../hooks/use-snackbar.hook';
import type {
  CmsBlockArraySchemaDefinition,
  CmsBlockObjectSchemaDefinition,
  CmsBlockSchemaDefinition,
  CmsBlockSchemaEnumValue,
  CmsBlockStringSchemaDefinition,
} from '../../../../apis/cms/cms-schema-definition.interface';
import { bannerApi, categoryApi, cmsApi, collectionApi, CollectionStatus, ProductListBannerConditionType } from '../../../../apis';
import { CategoryStatus } from '../../../../apis/category/category.enum';
import type { AttributeTreeSelectOption } from '../../../../components/form/select-attribute-tree-input';
import {
  getDefaultValueForSchema,
  getSchemaNodeLabel,
  humanizeSchemaKey,
  joinSchemaPath,
  setSchemaValueAtPath,
  type CmsBlockSchemaPath,
  type CmsBlockSchemaValidationErrors,
} from '../utils/cms-block-schema.utils';
import { isCmsSchemaImageUrlStringField } from '../utils/cms-schema-image-field.utils';
import { isCmsSchemaRichTextStringField } from '../utils/cms-schema-rich-text-field.utils';
import { CMS_SCHEMA_TEXTAREA_MIN_ROWS, isCmsSchemaTextareaStringField } from '../utils/cms-schema-textarea-field.utils';
import { CMS_PRODUCT_CAROUSEL_BLOCK_CODE, normalizeProductCarouselProductIds, PRODUCT_CAROUSEL_MANUAL_FILTER_TYPE, sanitizeProductCarouselDataSource } from '../utils/cms-product-carousel-block.utils';
import { CmsManualProductPicker } from './cms-manual-product-picker.component';
import { getProductListCollectionSlugs, normalizeProductListCollectionSelection } from '../utils/cms-product-list-block.utils';
import { getResolvedCmsMediaItemType, isCmsMediaTypeItemObjectSchema, orderCmsMediaItemPropertyEntries, shouldShowCmsMediaItemProperty } from '../utils/cms-schema-media-item.utils';

interface CmsSchemaDefinitionFormProps {
  schema?: CmsBlockSchemaDefinition | null;
  value: Record<string, unknown>;
  errors?: CmsBlockSchemaValidationErrors;
  onChange: (nextValue: Record<string, unknown>) => void;
  disabled?: boolean;
  blockTypeCode?: string;
}

interface SchemaFieldProps {
  schema: CmsBlockSchemaDefinition;
  value: unknown;
  path: CmsBlockSchemaPath;
  propertyKey?: string;
  required?: boolean;
  isRoot?: boolean;
  errors: CmsBlockSchemaValidationErrors;
  onPathChange: (path: CmsBlockSchemaPath, value: unknown) => void;
  disabled?: boolean;
  blockTypeCode?: string;
}

const isRecordValue = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

const getPrimitiveValue = (schema: CmsBlockSchemaDefinition, value: unknown): string | number | boolean | undefined => {
  if (value === undefined || value === null) {
    if (schema.default !== undefined && (typeof schema.default === 'string' || typeof schema.default === 'number' || typeof schema.default === 'boolean')) {
      return schema.default;
    }
    return undefined;
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  return undefined;
};

const buildArrayItemValue = (schema: CmsBlockSchemaDefinition | undefined): unknown => {
  if (!schema) return {};
  const next = getDefaultValueForSchema(schema);
  if (next !== undefined) return next;
  if (schema.type === 'object') return {};
  if (schema.type === 'array') return [];
  if (schema.type === 'string') return '';
  if (schema.type === 'boolean') return false;
  return undefined;
};

const renderSchemaDescription = (description?: string) => {
  if (!description?.trim()) return null;
  return <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#6B7280', mt: 0.5 }}>{description}</Typography>;
};

const PRODUCT_CAROUSEL_FILTER_TYPES = ['CATEGORY', 'COLLECTION', 'CAMPAIGN', 'NEW_ARRIVALS', 'BEST_SELLERS', 'MOST_FAVORITED', 'MANUAL_PRODUCTS'] as const;
const PRODUCT_LIST_FILTER_TYPES = ['ALL_PRODUCTS', 'COLLECTION', 'PROMOTION'] as const;
const PRODUCT_LIST_LEGACY_FILTER_TYPES = ['NONE', 'CATEGORY', 'CMS_STOREFRONT'] as const;
const PRODUCT_DATA_SOURCE_FILTER_TYPES = [...PRODUCT_CAROUSEL_FILTER_TYPES, ...PRODUCT_LIST_FILTER_TYPES, ...PRODUCT_LIST_LEGACY_FILTER_TYPES] as const;
const PRODUCT_LIST_SORT_OPTIONS = [
  { value: 'best_selling', label: 'Bán chạy nhất' },
  { value: 'price_asc', label: 'Giá: Thấp - Cao' },
  { value: 'price_desc', label: 'Giá: Cao - Thấp' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'name', label: 'Tên A-Z' },
  { value: 'name_desc', label: 'Tên Z -> A' },
];
const PRODUCT_LIST_DEFAULT_SORT = 'best_selling';

type ProductCarouselFilterType = (typeof PRODUCT_CAROUSEL_FILTER_TYPES)[number];
type ProductListFilterType = (typeof PRODUCT_LIST_FILTER_TYPES)[number] | (typeof PRODUCT_LIST_LEGACY_FILTER_TYPES)[number];
type ProductDataSourceFilterType = ProductCarouselFilterType | ProductListFilterType;

const PRODUCT_CAROUSEL_FILTER_TYPE_LABELS: Record<ProductCarouselFilterType, string> = {
  CATEGORY: 'Theo danh mục',
  COLLECTION: 'Theo bộ sưu tập',
  CAMPAIGN: 'Theo chiến dịch',
  NEW_ARRIVALS: 'Sản phẩm mới nhất',
  BEST_SELLERS: 'Sản phẩm bán chạy',
  MOST_FAVORITED: 'Sản phẩm được yêu thích',
  MANUAL_PRODUCTS: 'Chọn sản phẩm',
};

const PRODUCT_LIST_FILTER_TYPE_LABELS: Record<(typeof PRODUCT_LIST_FILTER_TYPES)[number], string> = {
  ALL_PRODUCTS: 'Tất cả sản phẩm',
  COLLECTION: 'Bộ sưu tập',
  PROMOTION: 'Promotion (tính năng chưa hỗ trợ)',
};

const getProductDataSourceFilterLabel = (type: ProductDataSourceFilterType): string => {
  if (type in PRODUCT_LIST_FILTER_TYPE_LABELS) {
    return PRODUCT_LIST_FILTER_TYPE_LABELS[type as (typeof PRODUCT_LIST_FILTER_TYPES)[number]];
  }
  if (type === 'CMS_STOREFRONT') return 'Cấu hình banner';
  if (type === 'NONE') return 'Không chọn banner';
  return PRODUCT_CAROUSEL_FILTER_TYPE_LABELS[type as ProductCarouselFilterType];
};

const isProductDataSourceFilterType = (value: unknown): value is ProductDataSourceFilterType =>
  typeof value === 'string' && PRODUCT_DATA_SOURCE_FILTER_TYPES.includes(value as ProductDataSourceFilterType);

const hasRequiredProductCarouselFilterTypes = (enumValues?: CmsBlockSchemaEnumValue[]): boolean => {
  if (!Array.isArray(enumValues) || enumValues.length === 0) return false;
  return enumValues.every(isProductDataSourceFilterType);
};

const getFilterTypeEnumValues = (schema: CmsBlockObjectSchemaDefinition): CmsBlockSchemaEnumValue[] => {
  const filterTypeSchema = schema.properties?.filterType;
  if (filterTypeSchema?.type !== 'string' || !Array.isArray(filterTypeSchema.enum)) return [];
  return filterTypeSchema.enum;
};

const isProductListingDataSourceSchema = (schema: CmsBlockObjectSchemaDefinition): boolean => getFilterTypeEnumValues(schema).includes('ALL_PRODUCTS');

const isBannerDataSourceSchema = (schema: CmsBlockObjectSchemaDefinition): boolean => {
  if (getFilterTypeEnumValues(schema).includes('CMS_STOREFRONT')) return true;
  return Boolean(schema.properties?.cmsPageId) && !getFilterTypeEnumValues(schema).includes('ALL_PRODUCTS');
};

const isProductDataSourceFieldKey = (key: unknown): key is 'dataSource' | 'productDataSource' => key === 'dataSource' || key === 'productDataSource';

const isProductCarouselDataSourceSchema = (schema: CmsBlockObjectSchemaDefinition, path: CmsBlockSchemaPath, propertyKey?: string): boolean => {
  const fieldKey = propertyKey ?? path.at(-1);
  if (!isProductDataSourceFieldKey(fieldKey)) return false;
  return hasRequiredProductCarouselFilterTypes(getFilterTypeEnumValues(schema));
};

const isProductCarouselSeeMoreSchema = (path: CmsBlockSchemaPath, propertyKey?: string, blockTypeCode?: string): boolean => {
  if (blockTypeCode !== CMS_PRODUCT_CAROUSEL_BLOCK_CODE) return false;
  return (propertyKey ?? path.at(-1)) === 'seeMore';
};

type CategoryTreeNode = {
  id: string;
  name: string;
  slug: string;
  children?: CategoryTreeNode[];
};

const buildCategoryTreeOptions = (categories: CategoryTreeNode[]): AttributeTreeSelectOption[] => {
  const options: AttributeTreeSelectOption[] = [];
  const walk = (nodes: CategoryTreeNode[], rootPath?: string, depth = 0) => {
    nodes.forEach((node) => {
      const slug = typeof node.slug === 'string' ? node.slug.trim() : '';
      if (!slug) return;
      const valuePath = rootPath ? `${rootPath}:${slug}` : slug;
      const groupKey = rootPath ? rootPath.split(':')[0] : slug;
      options.push({
        group: groupKey,
        value: valuePath,
        label: `${'— '.repeat(Math.max(0, depth))}${node.name}`,
      });
      if (Array.isArray(node.children) && node.children.length > 0) {
        walk(node.children, valuePath, depth + 1);
      }
    });
  };
  walk(categories);
  return options;
};

const getCategorySlugFromTreeValue = (value: string): string => value.split(':').filter(Boolean).at(-1) ?? '';

const getCategoryTreeValuesFromSlugs = (slugs: string[], options: AttributeTreeSelectOption[]): string[] => {
  const selectedSlugs = new Set(slugs.map((slug) => slug.trim()).filter(Boolean));
  return options.filter((option) => selectedSlugs.has(getCategorySlugFromTreeValue(option.value))).map((option) => option.value);
};

const getCategorySlugsFromDataSource = (dataSource: Record<string, unknown>): string[] => {
  const categorySlugs = Array.isArray(dataSource.categorySlugs) ? dataSource.categorySlugs : [];
  const legacyCategorySlug = typeof dataSource.categoryId === 'string' ? dataSource.categoryId : '';
  const slugs = [...categorySlugs, legacyCategorySlug].map((value) => (typeof value === 'string' ? value.trim() : '')).filter(Boolean);
  return Array.from(new Set(slugs));
};

const ProductCarouselDataSourceField: React.FC<{
  schema: CmsBlockObjectSchemaDefinition;
  value: unknown;
  path: CmsBlockSchemaPath;
  propertyKey?: string;
  required?: boolean;
  errors: CmsBlockSchemaValidationErrors;
  onPathChange: (path: CmsBlockSchemaPath, value: unknown) => void;
  disabled?: boolean;
}> = ({ schema, value, path, propertyKey, required = false, errors, onPathChange, disabled = false }) => {
  const objectValue = useMemo(() => isRecordValue(value) ? value : {}, [value]);
  const pathKey = joinSchemaPath(path);
  const fieldLabel = getSchemaNodeLabel(schema, propertyKey);
  const fieldError = errors[pathKey];
  const filterTypePath = [...path, 'filterType'];
  const filterTypePathKey = joinSchemaPath(filterTypePath);
  const rawFilterType = objectValue.filterType;
  const filterType: ProductDataSourceFilterType | '' = isProductDataSourceFilterType(rawFilterType) ? rawFilterType : '';
  const isBannerDataSource = isBannerDataSourceSchema(schema);
  const isProductListingSource = isProductListingDataSourceSchema(schema);
  const shouldLoadBannerConfigs = isBannerDataSource;
  const shouldLoadCmsPages = !isBannerDataSource && filterType === 'CMS_STOREFRONT';

  const updateDataSource = useCallback((patch: Record<string, unknown>) => {
    onPathChange(path, { ...objectValue, ...patch });
  }, [onPathChange, path, objectValue]);

  useEffect(() => {
    if (!isBannerDataSource || filterType === 'CMS_STOREFRONT') return;
    updateDataSource({ filterType: 'CMS_STOREFRONT' });
  }, [filterType, isBannerDataSource, updateDataSource]);

  const { data: categoryTree = [] } = useSWR(
    filterType === 'CATEGORY' ? ['cms/category/tree', 'compact', 'active'] : null,
    () => categoryApi.getCategoryTree({ compact: true, status: CategoryStatus.ACTIVE }),
    { revalidateOnFocus: false },
  );

  const { data: collectionListRes } = useSWR(
    filterType === 'COLLECTION' ? ['cms/collection/list', 'active'] : null,
    () =>
      collectionApi.getCollectionList({
        page: 1,
        take: 1000,
        isPagination: false,
        status: CollectionStatus.ACTIVE,
      }),
    { revalidateOnFocus: false },
  );

  const { data: bannerConfigList = [] } = useSWR(
    shouldLoadBannerConfigs ? ['banner/admin/product-list-banners', 'product-list-block-picker'] : null,
    () => bannerApi.getProductListBannerConfigs({ conditionType: ProductListBannerConditionType.CMS_STOREFRONT }),
    { revalidateOnFocus: false },
  );

  const { data: cmsPageListRes } = useSWR(
    shouldLoadCmsPages ? ['cms/admin/pages', 'product-list-banner-picker'] : null,
    () =>
      cmsApi.getPageList({
        page: 1,
        take: 1000,
        isPagination: false,
        isActive: true,
      }),
    { revalidateOnFocus: false },
  );

  const filterTypeOptions = useMemo(() => {
    const enumValues = getFilterTypeEnumValues(schema);
    return enumValues.filter(isProductDataSourceFilterType).map((type) => ({
      value: type,
      label: getProductDataSourceFilterLabel(type),
      disabled: type === 'PROMOTION',
    }));
  }, [schema]);
  const productListSortValue = typeof objectValue.sort === 'string' && objectValue.sort.trim() ? objectValue.sort : PRODUCT_LIST_DEFAULT_SORT;

  const categoryTreeOptions = useMemo(() => buildCategoryTreeOptions(Array.isArray(categoryTree) ? (categoryTree as CategoryTreeNode[]) : []), [categoryTree]);

  const selectedCategorySlugs = useMemo(() => getCategorySlugsFromDataSource(objectValue), [objectValue]);
  const selectedCategoryTreeValues = useMemo(() => {
    return getCategoryTreeValuesFromSlugs(selectedCategorySlugs, categoryTreeOptions);
  }, [categoryTreeOptions, selectedCategorySlugs]);

  const collectionOptions = useMemo(
    () =>
      (collectionListRes?.list ?? []).map((item) => ({
        value: isProductListingSource ? item.slug : item.id,
        label: item.name,
      })),
    [collectionListRes?.list, isProductListingSource],
  );

  const bannerConfigOptions = useMemo(
    () =>
      bannerConfigList
        .filter((config) => config.isActive !== false)
        .map((config) => ({
          value: config.targetSlug,
          label: config.targetName?.trim() || config.targetSlug,
        })),
    [bannerConfigList],
  );

  const cmsPageOptions = useMemo(
    () =>
      (cmsPageListRes?.list ?? []).map((page) => ({
        value: page.id,
        label: `${page.name} (/${page.slug})`,
      })),
    [cmsPageListRes?.list],
  );

  const selectedProductIds = useMemo(() => normalizeProductCarouselProductIds(objectValue.productIds), [objectValue.productIds]);

  return (
    <Box
      sx={{
        border: '1px solid #E5E7EB',
        borderRadius: 2,
        bgcolor: '#FCFCFD',
        p: 1.5,
      }}
    >
      <Stack gap={1.5}>
        <Box>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>
            {fieldLabel}
            {required ? (
              <Box component="span" sx={{ color: '#FB2C36', ml: 0.5 }}>
                *
              </Box>
            ) : null}
          </Typography>
          {renderSchemaDescription(schema.description)}
          {fieldError ? <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#EF4444', mt: 0.5 }}>{fieldError}</Typography> : null}
        </Box>

        {isBannerDataSource ? (
          <SelectInput
            label={getSchemaNodeLabel(schema.properties?.cmsPageId, 'cmsPageId')}
            disabled={disabled}
            value={typeof objectValue.cmsPageSlug === 'string' ? objectValue.cmsPageSlug : ''}
            options={bannerConfigOptions}
            placeholder="Chọn cấu hình banner xen kẽ"
            allowDeselect
            onChange={(event) => {
              const selectedConfig = bannerConfigList.find((config) => config.targetSlug === event.target.value);
              updateDataSource({
                filterType: selectedConfig ? 'CMS_STOREFRONT' : undefined,
                cmsPageId: selectedConfig?.id ?? '',
                cmsPageSlug: selectedConfig?.targetSlug ?? '',
                cmsPageName: selectedConfig?.targetName ?? '',
              });
            }}
            error={Boolean(errors[joinSchemaPath([...path, 'cmsPageId'])])}
            errorMessage={errors[joinSchemaPath([...path, 'cmsPageId'])]}
          />
        ) : (
          <>
            <SelectInput
              label={getSchemaNodeLabel(schema.properties?.filterType, 'filterType')}
              requiredMark={Boolean((schema.required ?? []).includes('filterType'))}
              disabled={disabled}
              value={filterType}
              options={filterTypeOptions}
              placeholder="Chọn loại điều kiện lọc"
              onChange={(event) => {
                const nextFilterType = event.target.value;
                if (nextFilterType === PRODUCT_CAROUSEL_MANUAL_FILTER_TYPE) {
                  updateDataSource(
                    sanitizeProductCarouselDataSource({
                      filterType: nextFilterType,
                      productIds: normalizeProductCarouselProductIds(objectValue.productIds),
                    }) ?? { filterType: nextFilterType },
                  );
                  return;
                }
                updateDataSource(sanitizeProductCarouselDataSource({ filterType: nextFilterType }) ?? { filterType: nextFilterType });
              }}
              error={Boolean(errors[filterTypePathKey])}
              errorMessage={errors[filterTypePathKey]}
            />

            {isProductListingSource ? (
              <SelectInput
                label={getSchemaNodeLabel(schema.properties?.sort, 'sort')}
                disabled={disabled}
                value={productListSortValue}
                options={PRODUCT_LIST_SORT_OPTIONS}
                placeholder="Chọn sắp xếp mặc định"
                onChange={(event) => updateDataSource({ sort: event.target.value })}
                error={Boolean(errors[joinSchemaPath([...path, 'sort'])])}
                errorMessage={errors[joinSchemaPath([...path, 'sort'])]}
              />
            ) : null}

            {filterType === 'CATEGORY' ? (
              <SelectAttributeTreeInput
                label={getSchemaNodeLabel(schema.properties?.categorySlugs ?? schema.properties?.categoryId, 'categorySlugs')}
                requiredMark={false}
                disabled={disabled}
                options={categoryTreeOptions}
                value={selectedCategoryTreeValues}
                selectionMode="single"
                optionIndicator="radio"
                placeholder="Chọn danh mục"
                onChange={(next) => {
                  const selectedPaths = next.slice(-1);
                  const categorySlugs = Array.from(new Set(selectedPaths.map((item) => getCategorySlugFromTreeValue(String(item))).filter(Boolean)));
                  updateDataSource({ categoryId: categorySlugs[0] ?? '', categorySlugs });
                }}
                error={Boolean(errors[joinSchemaPath([...path, 'categorySlugs'])] ?? errors[joinSchemaPath([...path, 'categoryId'])])}
                errorMessage={errors[joinSchemaPath([...path, 'categorySlugs'])] ?? errors[joinSchemaPath([...path, 'categoryId'])]}
              />
            ) : null}

            {filterType === 'COLLECTION' && isProductListingSource ? (
              <SelectAllInput
                label={getSchemaNodeLabel(schema.properties?.collectionSlugs ?? schema.properties?.collectionId, 'collectionSlugs')}
                requiredMark
                disabled={disabled}
                value={getProductListCollectionSlugs(objectValue)}
                options={collectionOptions}
                placeholder="Chọn bộ sưu tập"
                searchable
                onChange={(event) => {
                  const collectionSlugs = normalizeProductListCollectionSelection(event.target.value);
                  updateDataSource({ collectionSlugs, collectionId: undefined, collectionSlug: undefined });
                }}
                error={Boolean(errors[joinSchemaPath([...path, 'collectionSlugs'])])}
                errorMessage={errors[joinSchemaPath([...path, 'collectionSlugs'])]}
              />
            ) : filterType === 'COLLECTION' ? (
              <SelectInput
                label={getSchemaNodeLabel(schema.properties?.collectionId, 'collectionId')}
                requiredMark
                disabled={disabled}
                value={typeof objectValue.collectionId === 'string' ? objectValue.collectionId : ''}
                options={collectionOptions}
                placeholder="Chọn bộ sưu tập"
                menuMaxHeight={SELECT_INPUT_MENU_MAX_HEIGHT}
                onChange={(event) => {
                  const selected = collectionListRes?.list?.find((item) => item.id === event.target.value);
                  updateDataSource({
                    collectionId: selected?.id ?? '',
                    collectionSlug: selected?.slug ?? '',
                  });
                }}
                error={Boolean(errors[joinSchemaPath([...path, 'collectionId'])])}
                errorMessage={errors[joinSchemaPath([...path, 'collectionId'])]}
              />
            ) : null}

            {filterType === 'CAMPAIGN' ? (
              <TextInput
                label={getSchemaNodeLabel(schema.properties?.campaignId, 'campaignId')}
                disabled={disabled}
                value={typeof objectValue.campaignId === 'string' ? objectValue.campaignId : ''}
                onChange={(event) => updateDataSource({ campaignId: event.target.value })}
                error={Boolean(errors[joinSchemaPath([...path, 'campaignId'])])}
                errorMessage={errors[joinSchemaPath([...path, 'campaignId'])]}
              />
            ) : null}

            {filterType === PRODUCT_CAROUSEL_MANUAL_FILTER_TYPE ? (
              <CmsManualProductPicker
                productIds={selectedProductIds}
                disabled={disabled}
                onChange={(nextProductIds) => updateDataSource({ productIds: nextProductIds })}
                error={errors[joinSchemaPath([...path, 'productIds'])]}
              />
            ) : null}

            {filterType === 'CMS_STOREFRONT' ? (
              <SelectInput
                label={getSchemaNodeLabel(schema.properties?.cmsPageId, 'cmsPageId')}
                requiredMark
                disabled={disabled}
                value={typeof objectValue.cmsPageId === 'string' ? objectValue.cmsPageId : ''}
                options={cmsPageOptions}
                placeholder="Chọn trang nội dung"
                onChange={(event) => {
                  const selectedPage = cmsPageListRes?.list?.find((page) => page.id === event.target.value);
                  updateDataSource({
                    cmsPageId: selectedPage?.id ?? '',
                    cmsPageSlug: selectedPage?.slug ?? '',
                    cmsPageName: selectedPage?.name ?? '',
                  });
                }}
                error={Boolean(errors[joinSchemaPath([...path, 'cmsPageId'])])}
                errorMessage={errors[joinSchemaPath([...path, 'cmsPageId'])]}
              />
            ) : null}
          </>
        )}
      </Stack>
    </Box>
  );
};

const SchemaStringImageUploadField: React.FC<{
  schema: CmsBlockStringSchemaDefinition;
  value: unknown;
  path: CmsBlockSchemaPath;
  fieldLabel: string;
  required: boolean;
  fieldError?: string;
  onPathChange: (path: CmsBlockSchemaPath, value: unknown) => void;
  disabled?: boolean;
}> = ({ schema, value, path, fieldLabel, required, fieldError, onPathChange, disabled = false }) => {
  const { showSnackbar } = useSnackbar();
  const [uploading, setUploading] = useState(false);
  const primitive = getPrimitiveValue(schema, value);
  const stringVal = typeof primitive === 'string' ? primitive : '';

  const onPickFile = async (file: File) => {
    setUploading(true);
    try {
      const { asset } = await uploadSingleImage({ file, visibility: MediaVisibility.PUBLIC });
      onPathChange(path, asset.publicUrl);
    } catch (error) {
      showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <TextFieldUpload
        label={fieldLabel}
        requiredMark={required}
        disabled={disabled}
        value={stringVal}
        onChange={(next) => onPathChange(path, next)}
        onPickFile={onPickFile}
        onFileReject={(reason) => showSnackbar({ message: reason, type: SnackbarType.ERROR })}
        processing={uploading}
        error={Boolean(fieldError)}
        errorMessage={fieldError}
        previewMode="image"
        hintText="Hỗ trợ mọi định dạng ảnh — tải lên sẽ gán đường dẫn công khai (tối đa 5MB)."
      />
      {renderSchemaDescription(schema.description)}
    </Box>
  );
};

const SchemaStringRichTextField: React.FC<{
  schema: CmsBlockStringSchemaDefinition;
  value: unknown;
  path: CmsBlockSchemaPath;
  fieldLabel: string;
  required: boolean;
  fieldError?: string;
  onPathChange: (path: CmsBlockSchemaPath, value: unknown) => void;
  disabled?: boolean;
}> = ({ schema, value, path, fieldLabel, required, fieldError, onPathChange, disabled = false }) => {
  const primitive = getPrimitiveValue(schema, value);
  const stringVal = typeof primitive === 'string' ? primitive : '';

  return (
    <Box>
      <RichTextEditor
        label={fieldLabel}
        requiredMark={required}
        value={stringVal}
        disabled={disabled}
        onChange={(next) => onPathChange(path, next)}
        error={Boolean(fieldError)}
        errorMessage={fieldError}
      />
      {renderSchemaDescription(schema.description)}
    </Box>
  );
};

const SchemaStringTextareaField: React.FC<{
  schema: CmsBlockStringSchemaDefinition;
  value: unknown;
  path: CmsBlockSchemaPath;
  fieldLabel: string;
  required: boolean;
  fieldError?: string;
  onPathChange: (path: CmsBlockSchemaPath, value: unknown) => void;
  disabled?: boolean;
}> = ({ schema, value, path, fieldLabel, required, fieldError, onPathChange, disabled = false }) => {
  const primitive = getPrimitiveValue(schema, value);
  const stringVal = typeof primitive === 'string' ? primitive : '';

  return (
    <Box>
      <TextInput
        label={fieldLabel}
        requiredMark={required}
        disabled={disabled}
        value={stringVal}
        multiline
        minRows={CMS_SCHEMA_TEXTAREA_MIN_ROWS}
        maxRows={CMS_SCHEMA_TEXTAREA_MIN_ROWS}
        onChange={(event) => onPathChange(path, event.target.value)}
        error={Boolean(fieldError)}
        errorMessage={fieldError}
        sx={{ '& textarea': { fontFamily: 'monospace', fontSize: 13 } }}
      />
      {renderSchemaDescription(schema.description)}
    </Box>
  );
};

const ProductCarouselSeeMoreField: React.FC<{
  schema: CmsBlockObjectSchemaDefinition;
  value: Record<string, unknown>;
  path: CmsBlockSchemaPath;
  propertyKey?: string;
  required: boolean;
  errors: CmsBlockSchemaValidationErrors;
  onPathChange: (path: CmsBlockSchemaPath, value: unknown) => void;
  disabled?: boolean;
}> = ({ schema, value, path, propertyKey, required, errors, onPathChange, disabled = false }) => {
  const fieldLabel = getSchemaNodeLabel(schema, propertyKey);
  const properties = schema.properties ?? {};
  const enabledSchema = properties.enabled;
  const textSchema = properties.text;
  const urlSchema = properties.url;
  const enabled = Boolean(value.enabled);
  const text = typeof value.text === 'string' ? value.text : '';
  const url = typeof value.url === 'string' ? value.url : '';
  const textError = errors[joinSchemaPath([...path, 'text'])];
  const urlError = errors[joinSchemaPath([...path, 'url'])];

  const updateSeeMore = (patch: Record<string, unknown>) => {
    onPathChange(path, { ...value, ...patch });
  };

  return (
    <Box
      sx={{
        border: '1px solid #E5E7EB',
        borderRadius: 2,
        bgcolor: '#FCFCFD',
        p: 1.5,
      }}
    >
      <Stack gap={1.5}>
        <Box>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>
            {fieldLabel}
            {required ? (
              <Box component="span" sx={{ color: '#FB2C36', ml: 0.5 }}>
                *
              </Box>
            ) : null}
          </Typography>
          {renderSchemaDescription(schema.description)}
        </Box>

        <HighlightStatusToggle
          label={getSchemaNodeLabel(enabledSchema, 'enabled')}
          checked={enabled}
          disabled={disabled}
          name={joinSchemaPath([...path, 'enabled'])}
          activeLabel="Hiển thị"
          inactiveLabel="Ẩn"
          onCheckedChange={(checked) => updateSeeMore({ enabled: checked })}
        />

        {enabled ? (
          <React.Fragment>
            <Box>
              <TextInput
                label={getSchemaNodeLabel(textSchema, 'text')}
                requiredMark
                disabled={disabled}
                value={text}
                onChange={(event) => updateSeeMore({ text: event.target.value })}
                error={Boolean(textError)}
                errorMessage={textError}
              />
              {renderSchemaDescription(textSchema?.description)}
            </Box>
            <Box>
              <TextInput
                label={getSchemaNodeLabel(urlSchema, 'url')}
                requiredMark
                disabled={disabled}
                value={url}
                onChange={(event) => updateSeeMore({ url: event.target.value })}
                error={Boolean(urlError)}
                errorMessage={urlError}
              />
              {renderSchemaDescription(urlSchema?.description)}
            </Box>
          </React.Fragment>
        ) : null}
      </Stack>
    </Box>
  );
};

const SchemaField: React.FC<SchemaFieldProps> = ({ schema, value, path, propertyKey, required = false, isRoot = false, errors, onPathChange, disabled = false, blockTypeCode }) => {
  const pathKey = joinSchemaPath(path);
  const fieldLabel = getSchemaNodeLabel(schema, propertyKey);
  const fieldError = errors[pathKey];

  if (schema.type === 'object') {
    const objectSchema = schema as CmsBlockObjectSchemaDefinition;
    const objectValue = isRecordValue(value) ? value : {};
    const requiredKeys = new Set(objectSchema.required ?? []);
    const entriesRaw = Object.entries(objectSchema.properties ?? {});
    const isMediaItem = isCmsMediaTypeItemObjectSchema(objectSchema);
    let propertyEntries = entriesRaw;
    if (isMediaItem) {
      const mt = getResolvedCmsMediaItemType(objectValue, objectSchema);
      propertyEntries = orderCmsMediaItemPropertyEntries(entriesRaw).filter(([key]) => shouldShowCmsMediaItemProperty(key, mt));
    }
    if (blockTypeCode === CMS_PRODUCT_CAROUSEL_BLOCK_CODE) {
      propertyEntries = propertyEntries.filter(([key]) => key !== 'display');
    }
    const shouldRenderWrapper = !isRoot;

    if (isProductCarouselDataSourceSchema(objectSchema, path, propertyKey)) {
      return (
        <ProductCarouselDataSourceField
          schema={objectSchema}
          value={objectValue}
          path={path}
          propertyKey={propertyKey}
          required={required}
          errors={errors}
          onPathChange={onPathChange}
          disabled={disabled}
        />
      );
    }

    if (isProductCarouselSeeMoreSchema(path, propertyKey, blockTypeCode)) {
      return (
        <ProductCarouselSeeMoreField
          schema={objectSchema}
          value={objectValue}
          path={path}
          propertyKey={propertyKey}
          required={required}
          errors={errors}
          onPathChange={onPathChange}
          disabled={disabled}
        />
      );
    }

    const content = (
      <Stack gap={1.5}>
        {shouldRenderWrapper ? (
          <Box>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>
              {fieldLabel}
              {required ? (
                <Box component="span" sx={{ color: '#FB2C36', ml: 0.5 }}>
                  *
                </Box>
              ) : null}
            </Typography>
            {renderSchemaDescription(schema.description)}
          </Box>
        ) : null}

        {entriesRaw.length === 0 ? (
          <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#98A2B3' }}>Khối này không có trường cấu hình.</Typography>
        ) : (
          propertyEntries.map(([key, childSchema]) => (
            <SchemaField
              key={`${pathKey}:${key}`}
              schema={childSchema}
              value={objectValue[key]}
              path={[...path, key]}
              propertyKey={key}
              required={requiredKeys.has(key)}
              errors={errors}
              onPathChange={onPathChange}
              disabled={disabled}
              blockTypeCode={blockTypeCode}
            />
          ))
        )}
      </Stack>
    );

    if (!shouldRenderWrapper) return content;

    return (
      <Box
        sx={{
          border: '1px solid #E5E7EB',
          borderRadius: 2,
          bgcolor: '#FCFCFD',
          p: 1.5,
        }}
      >
        {content}
      </Box>
    );
  }

  if (schema.type === 'array') {
    const arraySchema = schema as CmsBlockArraySchemaDefinition;
    const items = Array.isArray(value) ? value : [];
    const isMaxItemsReached = arraySchema.maxItems !== undefined && items.length >= arraySchema.maxItems;

    return (
      <Box
        sx={{
          border: '1px solid #E5E7EB',
          borderRadius: 2,
          p: 1.5,
          bgcolor: '#FFF',
        }}
      >
        <Box sx={{ mb: 1.25 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>
            {fieldLabel}
            {required ? (
              <Box component="span" sx={{ color: '#FB2C36', ml: 0.5 }}>
                *
              </Box>
            ) : null}
          </Typography>
          {renderSchemaDescription(schema.description)}
          {fieldError ? <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#EF4444', mt: 0.5 }}>{fieldError}</Typography> : null}
        </Box>

        <Stack gap={1.25}>
          {items.map((item, index) => {
            const itemPath = [...path, index];
            const itemLabel = arraySchema.items?.title?.trim() || (arraySchema.items?.type === 'object' ? `${fieldLabel} #${index + 1}` : `${humanizeSchemaKey(propertyKey ?? 'item')} #${index + 1}`);

            return (
              <Box
                key={joinSchemaPath(itemPath)}
                sx={{
                  border: '1px solid #E5E7EB',
                  borderRadius: 2,
                  p: 1.25,
                  bgcolor: '#FCFCFD',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.25 }}>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.semibold, color: '#344054' }}>{itemLabel}</Typography>
                  {!disabled ? (
                    <CustomButton
                      type="button"
                      variant="outline"
                      fullWidth={false}
                      onClick={() =>
                        onPathChange(
                          path,
                          items.filter((_, currentIndex) => currentIndex !== index),
                        )
                      }
                      sx={{ minWidth: 36, px: 0.75, py: 0.5 }}
                      aria-label={`Xóa ${itemLabel}`}
                      {...contentButtonPermission('remove_schema_item', `Xóa ${itemLabel}`, 'api_cms_page_update')}
                    >
                      <Trash01 size={16} />
                    </CustomButton>
                  ) : null}
                </Box>

                {arraySchema.items ? (
                  <SchemaField
                    schema={arraySchema.items}
                    value={item}
                    path={itemPath}
                    propertyKey={propertyKey}
                    errors={errors}
                    onPathChange={onPathChange}
                    disabled={disabled}
                    blockTypeCode={blockTypeCode}
                    isRoot={arraySchema.items.type === 'object'}
                  />
                ) : (
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#98A2B3' }}>Chưa có mô tả phần tử con cho mảng này trong định nghĩa cấu hình.</Typography>
                )}
              </Box>
            );
          })}

          {!disabled ? (
            <CustomButton
              type="button"
              variant="outline"
              fullWidth={false}
              onClick={() => {
                if (isMaxItemsReached) return;
                onPathChange(path, [...items, buildArrayItemValue(arraySchema.items)]);
              }}
              disabled={!arraySchema.items || isMaxItemsReached}
              sx={{ alignSelf: 'flex-start', px: 1.5, py: 0.75 }}
            >
              <Plus size={16} style={{ marginRight: 6 }} />
              Thêm thẻ{arraySchema.maxItems ? ` (tối đa ${arraySchema.maxItems})` : ''}
            </CustomButton>
          ) : null}
        </Stack>
      </Box>
    );
  }

  if (schema.type === 'boolean') {
    const checked = Boolean(getPrimitiveValue(schema, value));

    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <CheckboxComponent checked={checked} disabled={disabled} onChange={(event) => onPathChange(path, event.target.checked)} sx={{ pt: 0.25 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#101828' }}>
              {fieldLabel}
              {required ? (
                <Box component="span" sx={{ color: '#FB2C36', ml: 0.5 }}>
                  *
                </Box>
              ) : null}
            </Typography>
            {renderSchemaDescription(schema.description)}
            {fieldError ? <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#EF4444', mt: 0.5 }}>{fieldError}</Typography> : null}
          </Box>
        </Box>
      </Box>
    );
  }

  if (schema.enum && schema.enum.length > 0) {
    const options = schema.enum.map((option, index) => ({
      value: option,
      label: schema.enumNames?.[index] ?? String(option),
    }));

    return (
      <SelectInput
        label={fieldLabel}
        requiredMark={required}
        disabled={disabled}
        value={getPrimitiveValue(schema, value) ?? ''}
        placeholder={`Chọn ${fieldLabel.toLowerCase()}`}
        options={options}
        onChange={(event) => {
          const rawValue = event.target.value;
          if (rawValue === '') {
            onPathChange(path, undefined);
            return;
          }
          onPathChange(path, schema.type === 'number' ? Number(rawValue) : rawValue);
        }}
        error={Boolean(fieldError)}
        errorMessage={fieldError}
      />
    );
  }

  if (schema.type === 'string') {
    if (isCmsSchemaImageUrlStringField(schema, propertyKey, fieldLabel)) {
      return (
        <SchemaStringImageUploadField schema={schema} value={value} path={path} fieldLabel={fieldLabel} required={required} fieldError={fieldError} onPathChange={onPathChange} disabled={disabled} />
      );
    }

    if (isCmsSchemaRichTextStringField(schema)) {
      return (
        <SchemaStringRichTextField schema={schema} value={value} path={path} fieldLabel={fieldLabel} required={required} fieldError={fieldError} onPathChange={onPathChange} disabled={disabled} />
      );
    }

    if (isCmsSchemaTextareaStringField(schema, propertyKey)) {
      return (
        <SchemaStringTextareaField schema={schema} value={value} path={path} fieldLabel={fieldLabel} required={required} fieldError={fieldError} onPathChange={onPathChange} disabled={disabled} />
      );
    }
  }

  return (
    <Box>
      <TextInput
        label={fieldLabel}
        requiredMark={required}
        disabled={disabled}
        value={getPrimitiveValue(schema, value) ?? ''}
        type={schema.type === 'number' ? 'number' : 'text'}
        onChange={(event) => onPathChange(path, event.target.value)}
        error={Boolean(fieldError)}
        errorMessage={fieldError}
      />
      {renderSchemaDescription(schema.description)}
    </Box>
  );
};

export const CmsSchemaDefinitionForm: React.FC<CmsSchemaDefinitionFormProps> = ({ schema, value, errors = {}, onChange, disabled = false, blockTypeCode }) => {
  if (!schema) return null;

  if (schema.type !== 'object') {
    return (
      <Box sx={{ border: '1px dashed #D0D5DD', borderRadius: 2, p: 1.5, bgcolor: '#FCFCFD' }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>Định nghĩa cấu hình khối ở cấp gốc phải là kiểu đối tượng (object). Loại đang nhận: {schema.type}.</Typography>
      </Box>
    );
  }

  const handlePathChange = (path: CmsBlockSchemaPath, nextValue: unknown) => {
    const nextConfig = setSchemaValueAtPath(value, path, nextValue);
    onChange(isRecordValue(nextConfig) ? nextConfig : {});
  };

  return (
    <Stack gap={1.5}>
      <SchemaField schema={schema} value={value} path={[]} errors={errors} onPathChange={handlePathChange} disabled={disabled} blockTypeCode={blockTypeCode} isRoot />
    </Stack>
  );
};
