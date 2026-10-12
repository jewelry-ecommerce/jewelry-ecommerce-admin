import { DeleteOutlineRounded } from '@mui/icons-material';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Plus } from '@untitledui/icons';
import dayjs, { type Dayjs } from 'dayjs';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { STYLE } from '@/trading-ui/adapters/library';
import useSWR from 'swr';
import {
  bannerApi,
  categoryApi,
  ProductListBannerActionType,
  ProductListBannerConditionType,
  type CreateProductListBannerConfigDto,
  type ProductListBannerConfig,
  type ProductListBannerItemDto,
} from '../../../../apis';
import { CategoryStatus } from '../../../../apis/category/category.enum';
import type { Category } from '../../../../apis/category/category.entities';
import { MediaVisibility } from '../../../../apis/file/file.enum';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { getErrorMessage } from '../../../../common/utils';
import { uploadSingleImage } from '../../../../common/utils/image-upload.utils';
import { CustomButton } from '../../../../components/button';
import { PermissionIconButton } from '../../../../components/button/permission-icon-button';
import { contentBannerSettingsButtonPermission } from '../../content-permission.constants';
import { ContentSettingsEditToolbar } from '../../components/content-settings-edit-toolbar.component';
import { useContentSettingsViewMode } from '../../hooks/use-content-settings-view-mode.hook';
import { SelectAttributeTreeInput, SelectInput, TextInput } from '../../../../components/form';
import type { AttributeTreeSelectOption } from '../../../../components/form/select-attribute-tree-input';
import { StackRowAlignCenter } from '../../../../components/styled';
import { SwitchContentElement } from '../../../../components/switch/switch-content.element';
import { TextFieldUploadContent as TextFieldUpload } from '../../components/text-field-upload-content.component';
import { DialogConfirmComponent } from '../../../../components/dialog';
import { WrapperComponent } from '../../../../components/wrapper';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { CmsMixMatchSkuPicker } from '../components/cms-mix-match-sku-picker.component';
import { PRODUCT_LIST_BANNER_PRODUCT_INTERVAL } from '../utils/cms-product-list-block.utils';
import { buildProductListBannerSavePayload, slugifyBannerConfigName } from '../utils/product-list-banner-config.utils';

type ProductListBannerDraft = CreateProductListBannerConfigDto & { id?: string };
type ProductListBannerFieldErrors = Record<string, string>;

interface CategoryOptionMeta {
  id: string;
  name: string;
  slug: string;
  pathSlugs: string[];
}

const CONDITION_OPTIONS = [
  { value: ProductListBannerConditionType.CATEGORY, label: 'Theo danh mục sản phẩm' },
  { value: ProductListBannerConditionType.CMS_STOREFRONT, label: 'Theo Bộ cấu hình banner ' },
];

const BANNER_ACTION_OPTIONS = [
  { value: ProductListBannerActionType.LINK_URL, label: 'Gắn đường dẫn' },
  { value: ProductListBannerActionType.MIX_MATCH, label: 'Mix & Match' },
];

const getConditionLabel = (conditionType: ProductListBannerConditionType): string => {
  return CONDITION_OPTIONS.find((option) => option.value === conditionType)?.label ?? String(conditionType);
};

const createBannerDraft = (): ProductListBannerItemDto => ({
  id: globalThis.crypto?.randomUUID?.() ?? `plb_${Date.now()}`,
  enabled: true,
  imageUrl: '',
  startTime: '',
  endTime: '',
  actionType: ProductListBannerActionType.LINK_URL,
  actionUrl: '',
  openInNewTab: false,
  mixMatchSkus: [],
});

const createConfigDraft = (conditionType = ProductListBannerConditionType.CATEGORY): ProductListBannerDraft => ({
  conditionType,
  targetId: '',
  targetSlug: '',
  targetName: '',
  categoryPathSlugs: [],
  isActive: true,
  banners: [],
});

const toDraft = (config: ProductListBannerConfig): ProductListBannerDraft => ({
  id: config.id,
  conditionType: config.conditionType,
  targetId: config.targetId ?? '',
  targetSlug: config.targetSlug,
  targetName: config.targetName ?? '',
  categoryPathSlugs: config.categoryPathSlugs ?? [],
  isActive: config.isActive,
  banners: config.banners ?? [],
});

const toDayjsValue = (value?: string): Dayjs | null => {
  if (!value?.trim()) return null;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
};

const buildCategoryTreeData = (categories: Category[]) => {
  const options: AttributeTreeSelectOption[] = [];
  const metaByValue = new Map<string, CategoryOptionMeta>();
  const metaBySlug = new Map<string, CategoryOptionMeta>();

  const walk = (nodes: Category[], pathSlugs: string[] = [], depth = 0) => {
    nodes.forEach((node) => {
      const slug = node.slug?.trim();
      if (!slug) return;

      const nextPathSlugs = [...pathSlugs, slug];
      const value = nextPathSlugs.join(':');
      const meta = { id: node.id, name: node.name, slug, pathSlugs: nextPathSlugs };

      options.push({ group: nextPathSlugs[0] ?? slug, value, label: `${'- '.repeat(depth)}${node.name}` });
      metaByValue.set(value, meta);
      metaBySlug.set(slug, meta);
      if (Array.isArray(node.children)) walk(node.children, nextPathSlugs, depth + 1);
    });
  };

  walk(categories);
  return { options, metaByValue, metaBySlug };
};

const getOptionSlug = (value: string): string => value.split(':').filter(Boolean).at(-1) ?? '';

const getReservedCategorySlugs = (configs: ProductListBannerConfig[], currentConfigId?: string): Set<string> => {
  const reserved = new Set<string>();
  configs.forEach((config) => {
    if (config.conditionType !== ProductListBannerConditionType.CATEGORY) return;
    if (currentConfigId && config.id === currentConfigId) return;

    const targetSlug = config.targetSlug?.trim();
    if (targetSlug) reserved.add(targetSlug);

    (config.categoryPathSlugs ?? []).forEach((slug) => {
      const normalized = slug.trim();
      if (normalized) reserved.add(normalized);
    });
  });
  return reserved;
};

const filterAvailableCategoryOptions = (options: AttributeTreeSelectOption[], reservedSlugs: Set<string>, draft: ProductListBannerDraft): AttributeTreeSelectOption[] => {
  const ownedSlugs = new Set<string>(draft.categoryPathSlugs?.filter(Boolean) ?? []);
  if (draft.targetSlug?.trim()) ownedSlugs.add(draft.targetSlug.trim());

  return options.filter((option) => {
    const slug = getOptionSlug(option.value);
    if (!slug) return false;
    return !reservedSlugs.has(slug) || ownedSlugs.has(slug);
  });
};

const getCategorySelectedValues = (draft: ProductListBannerDraft, metaBySlug: Map<string, CategoryOptionMeta>): string[] => {
  const slugs = draft.categoryPathSlugs?.filter(Boolean) ?? [];
  const targetMeta = draft.targetSlug ? metaBySlug.get(draft.targetSlug) : undefined;

  if (slugs.length > 1 && targetMeta && slugs.join(':') === targetMeta.pathSlugs.join(':')) {
    return [targetMeta.pathSlugs.join(':')];
  }

  if (slugs.length) {
    return slugs.map((slug) => metaBySlug.get(slug)?.pathSlugs.join(':')).filter((value): value is string => Boolean(value));
  }

  return targetMeta ? [targetMeta.pathSlugs.join(':')] : [];
};

const getDraftLabel = (draft: ProductListBannerDraft): string => {
  if (draft.targetName?.trim()) return draft.targetName;
  if (draft.targetSlug?.trim()) return draft.targetSlug;
  return draft.conditionType === ProductListBannerConditionType.CATEGORY ? 'Chưa chọn danh mục' : 'Chưa nhập tên cấu hình banner';
};

const getBannerFieldError = (errors: ProductListBannerFieldErrors, index: number, field: string): string | undefined => errors[`banners.${index}.${field}`];

const validateBannerItem = (banner: ProductListBannerItemDto, index: number, errors: ProductListBannerFieldErrors) => {
  if (!banner.imageUrl?.trim()) errors[`banners.${index}.imageUrl`] = 'Vui lòng tải lên hình ảnh';
  if (!banner.startTime?.trim()) errors[`banners.${index}.startTime`] = 'Vui lòng chọn thời gian bắt đầu';

  if (banner.actionType === ProductListBannerActionType.MIX_MATCH) {
    if (!banner.mixMatchSkus?.some((sku) => sku.variationId?.trim())) errors[`banners.${index}.mixMatchSkus`] = 'Vui lòng chọn ít nhất 1 sản phẩm';
    return;
  }

  if (!banner.actionUrl?.trim()) errors[`banners.${index}.actionUrl`] = 'Vui lòng nhập đường dẫn đích';
};

const validateDraft = (draft: ProductListBannerDraft): ProductListBannerFieldErrors => {
  const errors: ProductListBannerFieldErrors = {};

  if (draft.conditionType === ProductListBannerConditionType.CATEGORY) {
    if (!draft.targetSlug.trim()) errors.targetSlug = 'Vui lòng chọn danh mục';
  } else if (!draft.targetName?.trim()) {
    errors.targetSlug = 'Vui lòng nhập tên cấu hình banner';
  } else if (!slugifyBannerConfigName(draft.targetName)) {
    errors.targetSlug = 'Tên cấu hình banner không hợp lệ';
  }

  draft.banners.forEach((banner, index) => validateBannerItem(banner, index, errors));
  return errors;
};

const BannerListEditor: React.FC<{
  viewMode?: boolean;
  banners: ProductListBannerItemDto[];
  errors: ProductListBannerFieldErrors;
  uploadingId: string | null;
  onAdd: () => void;
  onUpdate: (index: number, patch: Partial<ProductListBannerItemDto>) => void;
  onRemove: (index: number) => void;
  onPickImage: (index: number, file: File) => void;
}> = ({ viewMode = false, banners, errors, uploadingId, onAdd, onUpdate, onRemove, onPickImage }) => (
  <Stack gap={1.5}>
    <StackRowAlignCenter sx={{ justifyContent: 'space-between', gap: 1 }}>
      <Box>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>Banner xen kẽ</Typography>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>Thứ tự banner tương ứng sau 4, 8, 12 sản phẩm.</Typography>
      </Box>
      {!viewMode ? (
        <CustomButton type="button" variant="outline" fullWidth={false} onClick={onAdd} {...contentBannerSettingsButtonPermission('add_product_list_banner', 'Thêm banner', 'api_banner_create')}>
          <Plus size={16} style={{ marginRight: 6 }} />
          Thêm banner
        </CustomButton>
      ) : null}
    </StackRowAlignCenter>

    {banners.map((banner, index) => (
      <BannerEditorCard
        key={banner.id ?? index}
        viewMode={viewMode}
        banner={banner}
        errors={errors}
        index={index}
        uploadingId={uploadingId}
        onUpdate={onUpdate}
        onRemove={onRemove}
        onPickImage={onPickImage}
      />
    ))}
  </Stack>
);

const BannerEditorCard: React.FC<{
  viewMode?: boolean;
  banner: ProductListBannerItemDto;
  errors: ProductListBannerFieldErrors;
  index: number;
  uploadingId: string | null;
  onUpdate: (index: number, patch: Partial<ProductListBannerItemDto>) => void;
  onRemove: (index: number) => void;
  onPickImage: (index: number, file: File) => void;
}> = ({ viewMode = false, banner, errors, index, uploadingId, onUpdate, onRemove, onPickImage }) => (
  <Box sx={{ border: '1px solid #E5E7EB', borderRadius: 2, bgcolor: '#FFF', p: 1.5 }}>
    <Stack gap={1.5}>
      <StackRowAlignCenter sx={{ justifyContent: 'space-between', gap: 1 }}>
        <Box>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>Banner {index + 1}</Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>Vị trí: sau {(index + 1) * PRODUCT_LIST_BANNER_PRODUCT_INTERVAL} sản phẩm</Typography>
        </Box>
        <StackRowAlignCenter sx={{ gap: 1 }}>
          <SwitchContentElement content="Bật" disabled={viewMode} value={banner.enabled !== false} onChange={(event) => onUpdate(index, { enabled: Boolean(event?.target?.value) })} />
          {!viewMode ? (
            <PermissionIconButton
              size="small"
              aria-label="Xóa banner"
              onClick={() => onRemove(index)}
              {...contentBannerSettingsButtonPermission('remove_product_list_banner', 'Xóa banner', 'api_banner_delete')}
            >
              <DeleteOutlineRounded fontSize="small" />
            </PermissionIconButton>
          ) : null}
        </StackRowAlignCenter>
      </StackRowAlignCenter>

      <Divider />
      <TextFieldUpload
        label="Hình ảnh"
        requiredMark
        disabled={viewMode}
        value={banner.imageUrl ?? ''}
        onChange={(imageUrl) => onUpdate(index, { imageUrl })}
        onPickFile={(file) => onPickImage(index, file)}
        accept="image/*"
        previewMode="image"
        processing={uploadingId === banner.id}
        error={Boolean(getBannerFieldError(errors, index, 'imageUrl'))}
        errorMessage={getBannerFieldError(errors, index, 'imageUrl')}
        hintText="Hỗ trợ mọi định dạng ảnh (tối đa 5MB)"
      />

      <Stack direction={{ xs: 'column', md: 'row' }} gap={1.5}>
        <DateTimePicker
          label="Thời gian bắt đầu"
          disabled={viewMode}
          value={toDayjsValue(banner.startTime)}
          onChange={(next) => onUpdate(index, { startTime: next?.toISOString() ?? '' })}
          slotProps={{ textField: { size: 'small', fullWidth: true, error: Boolean(getBannerFieldError(errors, index, 'startTime')), helperText: getBannerFieldError(errors, index, 'startTime') } }}
        />
        <DateTimePicker
          label="Thời gian kết thúc"
          disabled={viewMode}
          value={toDayjsValue(banner.endTime)}
          onChange={(next) => onUpdate(index, { endTime: next?.toISOString() ?? '' })}
          slotProps={{ textField: { size: 'small', fullWidth: true } }}
        />
      </Stack>

      <SelectInput
        label="Luồng điều hướng"
        disabled={viewMode}
        value={banner.actionType ?? ProductListBannerActionType.LINK_URL}
        options={BANNER_ACTION_OPTIONS}
        onChange={(event) => onUpdate(index, { actionType: event.target.value as ProductListBannerActionType })}
      />

      {banner.actionType === ProductListBannerActionType.MIX_MATCH ? (
        <Box sx={{ pointerEvents: viewMode ? 'none' : 'auto', opacity: viewMode ? 0.92 : 1 }}>
          <CmsMixMatchSkuPicker value={banner.mixMatchSkus ?? []} error={getBannerFieldError(errors, index, 'mixMatchSkus')} onChange={(mixMatchSkus) => onUpdate(index, { mixMatchSkus })} />
        </Box>
      ) : (
        <Stack gap={1}>
          <TextInput
            label="Đường dẫn đích"
            disabled={viewMode}
            value={banner.actionUrl ?? ''}
            onChange={(event) => onUpdate(index, { actionUrl: event.target.value })}
            error={Boolean(getBannerFieldError(errors, index, 'actionUrl'))}
            errorMessage={getBannerFieldError(errors, index, 'actionUrl')}
          />
          <SwitchContentElement content="Mở tab mới" disabled={viewMode} value={Boolean(banner.openInNewTab)} onChange={(event) => onUpdate(index, { openInNewTab: Boolean(event?.target?.value) })} />
        </Stack>
      )}
    </Stack>
  </Box>
);

const ProductListBannerSettingsPage = () => {
  const { showSnackbar } = useSnackbar();
  const [draft, setDraft] = useState<ProductListBannerDraft>(() => createConfigDraft());
  const [isCreatingNewConfig, setIsCreatingNewConfig] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<ProductListBannerFieldErrors>({});
  const [configToDelete, setConfigToDelete] = useState<ProductListBannerConfig | null>(null);
  const [removeBannerIndex, setRemoveBannerIndex] = useState<number | null>(null);
  const draftSnapshotRef = useRef<ProductListBannerDraft | null>(null);

  const { data: configs = [], mutate } = useSWR('banner/admin/product-list-banners', () => bannerApi.getProductListBannerConfigs(), { revalidateOnFocus: false });
  const resetDraftFromSnapshot = () => {
    if (draftSnapshotRef.current) {
      setDraft(draftSnapshotRef.current);
    }
    setIsCreatingNewConfig(false);
    setErrors({});
  };

  const { viewMode, enterEditMode, cancelEditMode, exitEditModeAfterSave } = useContentSettingsViewMode(resetDraftFromSnapshot);

  const handleEnterEditMode = () => {
    draftSnapshotRef.current = draft;
    enterEditMode();
  };

  const { data: categoryTree = [] } = useSWR(['product-list-banner-category-tree', 'active'], () => categoryApi.getCategoryTree({ compact: true, status: CategoryStatus.ACTIVE }), {
    revalidateOnFocus: false,
  });

  useEffect(() => {
    if (isCreatingNewConfig) return;
    if (!draft.id && !draft.targetSlug && configs.length > 0) setDraft(toDraft(configs[0]));
  }, [configs, draft.id, draft.targetSlug, isCreatingNewConfig]);

  const categoryTreeData = useMemo(() => buildCategoryTreeData(Array.isArray(categoryTree) ? categoryTree : []), [categoryTree]);
  const reservedCategorySlugs = useMemo(() => getReservedCategorySlugs(configs, draft.id), [configs, draft.id]);
  const categoryPickerOptions = useMemo(() => filterAvailableCategoryOptions(categoryTreeData.options, reservedCategorySlugs, draft), [categoryTreeData.options, draft, reservedCategorySlugs]);
  const clearBannerErrors = (index: number, fields: string[]) => {
    setErrors((current) => {
      const next = { ...current };
      fields.forEach((field) => delete next[`banners.${index}.${field}`]);
      return next;
    });
  };

  const updateBanner = (index: number, patch: Partial<ProductListBannerItemDto>) => {
    clearBannerErrors(index, Object.keys(patch));
    setDraft((current) => ({ ...current, banners: current.banners.map((item, currentIndex) => (currentIndex === index ? { ...item, ...patch } : item)) }));
  };

  const pickBannerImage = async (index: number, file: File) => {
    const banner = draft.banners[index];
    const uploadKey = banner?.id ?? String(index);
    setUploadingId(uploadKey);
    try {
      const { asset } = await uploadSingleImage({ file, visibility: MediaVisibility.PUBLIC });
      updateBanner(index, { imageUrl: asset.publicUrl });
    } catch (error) {
      showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
    } finally {
      setUploadingId(null);
    }
  };

  const saveConfig = async () => {
    const nextErrors = validateDraft(draft);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSaving(true);
    try {
      const payload = buildProductListBannerSavePayload(draft);
      const saved = draft.id ? await bannerApi.patchProductListBannerConfig(draft.id, payload) : await bannerApi.postProductListBannerConfig(payload);
      showSnackbar({ message: 'Đã lưu cấu hình banner.', type: SnackbarType.SUCCESS });
      setIsCreatingNewConfig(false);
      setErrors({});
      setDraft(toDraft(saved));
      draftSnapshotRef.current = toDraft(saved);
      await mutate();
      exitEditModeAfterSave();
    } catch (error) {
      showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
    } finally {
      setSaving(false);
    }
  };

  const deleteConfig = async (configId: string) => {
    setSaving(true);
    try {
      await bannerApi.deleteProductListBannerConfig(configId);
      showSnackbar({ message: 'Đã xóa cấu hình banner.', type: SnackbarType.SUCCESS });
      setIsCreatingNewConfig(false);
      if (draft.id === configId) {
        setDraft(createConfigDraft(draft.conditionType));
      }
      await mutate();
    } catch (error) {
      showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
    } finally {
      setSaving(false);
    }
  };

  const selectCategories = (selectedPaths: readonly string[]) => {
    setErrors((current) => ({ ...current, targetSlug: '' }));

    if (!selectedPaths.length) {
      setDraft((current) => ({ ...current, targetId: '', targetSlug: '', targetName: '', categoryPathSlugs: [] }));
      return;
    }

    const metas = selectedPaths
      .map((path) => categoryTreeData.metaByValue.get(path))
      .filter((meta): meta is CategoryOptionMeta => Boolean(meta))
      .filter((meta) => !reservedCategorySlugs.has(meta.slug));

    if (!metas.length) return;

    const primary = metas.reduce((shortest, meta) => (meta.pathSlugs.length < shortest.pathSlugs.length ? meta : shortest));

    setDraft((current) => ({
      ...current,
      targetId: primary.id,
      targetSlug: primary.slug,
      targetName: primary.name,
      categoryPathSlugs: Array.from(new Set(metas.map((meta) => meta.slug))),
    }));
  };

  const startCreateConfig = () => {
    setIsCreatingNewConfig(true);
    setErrors({});
    setDraft(createConfigDraft(draft.conditionType));
  };

  const selectConfig = (config: ProductListBannerConfig) => {
    setIsCreatingNewConfig(false);
    setErrors({});
    setDraft(toDraft(config));
  };

  const changeConditionType = (conditionType: ProductListBannerConditionType) => {
    setIsCreatingNewConfig(true);
    setErrors({});
    setDraft(createConfigDraft(conditionType));
  };

  return (
    <Stack sx={{ height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`, boxSizing: 'border-box', minHeight: 0 }}>
      <WrapperComponent label="Thiết lập banner">
        <Stack direction={{ xs: 'column', lg: 'row' }} gap={2} sx={{ minHeight: 0, flex: 1 }}>
          <Stack sx={{ width: { xs: '100%', lg: 300 }, minHeight: 0, border: '1px solid #E5E7EB', borderRadius: 2, bgcolor: '#FFF', p: 1.5 }} gap={1}>
            {!viewMode ? (
              <CustomButton
                type="button"
                variant="outline"
                fullWidth={false}
                onClick={startCreateConfig}
                {...contentBannerSettingsButtonPermission('create_product_list_banner_config', 'Thêm cấu hình', 'api_banner_create')}
              >
                <Plus size={16} style={{ marginRight: 6 }} />
                Thêm cấu hình
              </CustomButton>
            ) : null}
            {configs.map((config) => (
              <Box
                key={config.id}
                onClick={() => selectConfig(config)}
                sx={{
                  border: '1px solid #E5E7EB',
                  borderRadius: 1,
                  p: 1,
                  cursor: 'pointer',
                  bgcolor: config.id === draft.id ? '#F2F4F7' : '#FFF',
                }}
              >
                <StackRowAlignCenter sx={{ justifyContent: 'space-between', gap: 1, alignItems: 'flex-start' }}>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>
                      {config.categoryPathSlugs?.join(', ') ? config.categoryPathSlugs.map((slug) => categoryTreeData.metaBySlug.get(slug)?.name).join(', ') : config.targetName}{' '}
                    </Typography>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>{getConditionLabel(config.conditionType)}</Typography>
                  </Box>
                  {!viewMode ? (
                    <PermissionIconButton
                      size="small"
                      aria-label="Xóa cấu hình banner"
                      onClick={(event) => {
                        event.stopPropagation();
                        setConfigToDelete(config);
                      }}
                      {...contentBannerSettingsButtonPermission('delete_product_list_banner_config', 'Xóa cấu hình banner', 'api_banner_delete')}
                    >
                      <DeleteOutlineRounded fontSize="small" />
                    </PermissionIconButton>
                  ) : null}
                </StackRowAlignCenter>
              </Box>
            ))}
          </Stack>

          <Stack sx={{ flex: 1, minHeight: 0, overflow: 'auto', border: '1px solid #E5E7EB', borderRadius: 2, bgcolor: '#FFF', p: 2 }} gap={2}>
            <StackRowAlignCenter sx={{ justifyContent: 'space-between', gap: 1 }}>
              <Box>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.semibold, color: '#101828' }}>{getDraftLabel(draft)}</Typography>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085' }}>
                  Tạo banner xen kẽ theo danh mục (tự áp dụng trên PLP theo category). Cấu hình banner: gán trong khối Danh sách sản phẩm.
                </Typography>
              </Box>
              <StackRowAlignCenter sx={{ gap: 1 }}>
                <ContentSettingsEditToolbar
                  viewMode={viewMode}
                  onEnterEdit={handleEnterEditMode}
                  onCancelEdit={cancelEditMode}
                  editPermission={contentBannerSettingsButtonPermission('edit', 'Chỉnh sửa thiết lập banner', 'api_banner_update')}
                  cancelPermission={contentBannerSettingsButtonPermission('edit', 'Hủy chỉnh sửa thiết lập banner', 'api_banner_update')}
                  editActions={
                    <CustomButton
                      type="button"
                      fullWidth={false}
                      onClick={saveConfig}
                      disabled={saving}
                      {...contentBannerSettingsButtonPermission('save_product_list_banner_config', 'Lưu cấu hình banner', 'api_banner_update')}
                    >
                      Lưu
                    </CustomButton>
                  }
                />
              </StackRowAlignCenter>
            </StackRowAlignCenter>

            <SelectInput
              label="Loại điều kiện"
              disabled={viewMode}
              value={draft.conditionType}
              options={CONDITION_OPTIONS}
              onChange={(event) => changeConditionType(event.target.value as ProductListBannerConditionType)}
            />

            {draft.conditionType === ProductListBannerConditionType.CATEGORY ? (
              <SelectAttributeTreeInput
                label="Danh mục sản phẩm áp dụng"
                requiredMark
                disabled={viewMode}
                independentParentSelection
                options={categoryPickerOptions}
                value={getCategorySelectedValues(draft, categoryTreeData.metaBySlug)}
                placeholder="Chọn danh mục"
                onChange={selectCategories}
                error={Boolean(errors.targetSlug)}
                errorMessage={errors.targetSlug}
              />
            ) : (
              <TextInput
                label="Tên bộ cấu hình banner"
                requiredMark
                disabled={viewMode}
                value={draft.targetName ?? ''}
                placeholder="Ví dụ: banner-A"
                onChange={(event) => {
                  setErrors((current) => ({ ...current, targetSlug: '' }));
                  setDraft((current) => ({ ...current, targetName: event.target.value }));
                }}
                error={Boolean(errors.targetSlug)}
                errorMessage={errors.targetSlug}
              />
            )}

            <SwitchContentElement
              content="Bật cấu hình"
              disabled={viewMode}
              value={draft.isActive !== false}
              onChange={(event) => setDraft((current) => ({ ...current, isActive: Boolean(event?.target?.value) }))}
            />
            <Divider />
            <BannerListEditor
              viewMode={viewMode}
              banners={draft.banners}
              errors={errors}
              uploadingId={uploadingId}
              onAdd={() => {
                setErrors({});
                setDraft((current) => ({ ...current, banners: [...current.banners, createBannerDraft()] }));
              }}
              onUpdate={updateBanner}
              onRemove={(index) => setRemoveBannerIndex(index)}
              onPickImage={(index, file) => void pickBannerImage(index, file)}
            />
          </Stack>
        </Stack>
      </WrapperComponent>

      <DialogConfirmComponent
        open={configToDelete !== null}
        onClose={() => setConfigToDelete(null)}
        title="Xác nhận xóa cấu hình banner"
        highlight={{
          tone: 'danger',
          title: configToDelete ? `Xóa cấu hình "${getDraftLabel(toDraft(configToDelete))}"?` : 'Xóa cấu hình banner?',
          description: 'Hành động này không thể hoàn tác. Tất cả banner xen kẽ trong cấu hình sẽ bị xóa khỏi hệ thống.',
        }}
        cancelLabel="Hủy"
        confirmLabel="Xóa"
        onCancel={() => setConfigToDelete(null)}
        onConfirm={() => {
          if (!configToDelete) return;
          const configId = configToDelete.id;
          setConfigToDelete(null);
          void deleteConfig(configId);
        }}
        loading={saving}
      />

      <DialogConfirmComponent
        open={removeBannerIndex !== null}
        onClose={() => setRemoveBannerIndex(null)}
        title="Xác nhận xóa banner"
        highlight={{
          tone: 'danger',
          title: removeBannerIndex !== null ? `Xóa banner ${removeBannerIndex + 1}?` : 'Xóa banner?',
          description: 'Banner sẽ bị gỡ khỏi cấu hình. Nhấn Lưu để áp dụng thay đổi lên hệ thống.',
        }}
        cancelLabel="Hủy"
        confirmLabel="Xóa"
        onCancel={() => setRemoveBannerIndex(null)}
        onConfirm={() => {
          if (removeBannerIndex === null) return;
          const index = removeBannerIndex;
          setRemoveBannerIndex(null);
          setErrors({});
          setDraft((current) => ({ ...current, banners: current.banners.filter((_, currentIndex) => currentIndex !== index) }));
        }}
      />
    </Stack>
  );
};

export default ProductListBannerSettingsPage;
