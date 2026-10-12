import { Box, Stack, Typography } from '@mui/material';
import type { CmsNavigation, CmsNavigationType } from '../../../../../apis';
import type { Category, Page } from '../../../../../apis';
import type { TreeSelectNode } from '../../../../../components/form';
import { SelectInput, TextInput, TreeSelectInput } from '../../../../../components/form';
import { StackRowAlignCenter } from '../../../../../components/styled/stack.style';
import { TextFieldUploadContent as TextFieldUpload } from '../../../components/text-field-upload-content.component';
import { MediaVisibility } from '../../../../../apis/file/file.enum';
import { uploadSingleImage } from '../../../../../common/utils/image-upload.utils';
import { TYPOGRAPHY_STYLES } from '../../../../../common/constant/typography.constant';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { MENU_IMAGE_ACCEPT, TARGET_TYPE_OPTIONS } from '../site-navigation.constant';
import type { NavigationFormState, ScreenState } from '../site-navigation.interface';
import type { Dispatch, SetStateAction } from 'react';
import { buildCategoryUrl, buildCmsPageUrl, findCategoryById, findPageById } from '../site-navigation.utils';

export type NavigationFormIdSectionProps = {
  fieldsDisabled?: boolean;
  form: NavigationFormState;
  formErrors: Record<string, string>;
  screenState: ScreenState;
  selectedTreeNode?: CmsNavigation;
  categoryTree: Category[];
  categoryOptions: TreeSelectNode[];
  tree: CmsNavigation[];
  pages: Page[];
  pageOptions: Array<{ value: string; label: string }>;
  sourceName: string;
  isPageTargetBroken: boolean;
  isCategoryTargetBroken: boolean;
  updateForm: <K extends keyof NavigationFormState>(key: K, value: NavigationFormState[K]) => void;
  setForm: Dispatch<SetStateAction<NavigationFormState>>;
  setFormErrors: Dispatch<SetStateAction<Record<string, string>>>;
};

export const NavigationFormIdSection = ({
  fieldsDisabled = false,
  form,
  formErrors,
  screenState,
  selectedTreeNode,
  categoryTree,
  categoryOptions,
  tree,
  pages,
  pageOptions,
  sourceName,
  isPageTargetBroken,
  isCategoryTargetBroken,
  updateForm,
  setForm,
  setFormErrors,
}: NavigationFormIdSectionProps) => {
  const { showSnackbar } = useSnackbar();

  return (
    <Stack gap={2} sx={{ border: '1px solid #E5E7EB', borderRadius: '10px', p: 2, bgcolor: '#FFFFFF' }}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }}>Định danh & điều hướng</Typography>
      <StackRowAlignCenter gap={2} sx={{ alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <SelectInput
            label="Cấu hình trang đích"
            requiredMark
            disabled={fieldsDisabled}
            value={form.type}
            options={TARGET_TYPE_OPTIONS}
            onChange={(event) => {
              const type = event.target.value as CmsNavigationType;
              setForm((prev) => ({
                ...prev,
                type,
                targetId: '',
                url: type === 'LINK' ? prev.url : '',
                label: type === 'NONE' ? prev.label : '',
              }));
              setFormErrors({});
            }}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <TextInput
            label="Tên hiển thị"
            requiredMark
            disabled={fieldsDisabled}
            value={form.label}
            placeholder={sourceName || 'VD: Sản phẩm'}
            error={Boolean(formErrors.label)}
            errorMessage={formErrors.label}
            onChange={(event) => updateForm('label', event.target.value)}
          />
        </Box>
      </StackRowAlignCenter>

      {form.type === 'CATEGORY' ? (
        <Stack gap={0.5}>
          <TreeSelectInput
            label="Chọn danh mục sản phẩm"
            requiredMark
            disabled={fieldsDisabled}
            nodes={categoryOptions}
            value={form.targetId}
            placeholder="Chọn danh mục"
            error={Boolean(formErrors.targetId) || isCategoryTargetBroken}
            errorMessage={formErrors.targetId}
            onChange={(value) => {
              const category = findCategoryById(categoryTree, value);
              const parentNavigationId = screenState.mode === 'create' ? screenState.createParent?.id : selectedTreeNode?.parentId;
              setForm((prev) => ({
                ...prev,
                targetId: value,
                url: buildCategoryUrl(categoryTree, tree, value, parentNavigationId ?? undefined) ?? '',
                label: prev.label || category?.name || '',
              }));
            }}
          />
          {isCategoryTargetBroken && !formErrors.targetId ? (
            <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#B45309' }}>Danh mục đã bị xóa hoặc không còn hoạt động. Vui lòng chọn danh mục khác trước khi lưu.</Typography>
          ) : null}
        </Stack>
      ) : null}

      {form.type === 'PAGE' ? (
        <Stack gap={0.5}>
          <SelectInput
            label="Chọn trang nội dung"
            requiredMark
            disabled={fieldsDisabled}
            value={form.targetId}
            placeholder="Chọn trang"
            options={pageOptions}
            error={Boolean(formErrors.targetId) || isPageTargetBroken}
            errorMessage={formErrors.targetId}
            onChange={(event) => {
              const value = String(event.target.value);
              const page = findPageById(pages, value);
              setForm((prev) => ({
                ...prev,
                targetId: value,
                url: buildCmsPageUrl(page) ?? '',
                label: prev.label || page?.name || '',
              }));
            }}
          />
          {isPageTargetBroken && !formErrors.targetId ? (
            <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#B45309' }}>Trang nội dung đã bị xóa. Vui lòng chọn trang khác trước khi lưu.</Typography>
          ) : null}
        </Stack>
      ) : null}

      {form.type === 'LINK' ? (
        <TextInput
          label="Đường dẫn thủ công"
          requiredMark
          disabled={fieldsDisabled}
          value={form.url}
          placeholder="https://b1-test.sevagoretail.jewelry/san-pham"
          error={Boolean(formErrors.url)}
          errorMessage={formErrors.url}
          onChange={(event) => updateForm('url', event.target.value)}
        />
      ) : null}

      {(form.type === 'CATEGORY' || form.type === 'PAGE') && sourceName ? <TextInput label="Tên danh mục/trang nội dung gốc" value={sourceName} disabled /> : null}

      <TextFieldUpload
        label="Hình ảnh đại diện"
        disabled={fieldsDisabled}
        value={form.image}
        onChange={(next) => updateForm('image', next)}
        accept={MENU_IMAGE_ACCEPT}
        previewMode="image"
        onFileReject={(reason) => showSnackbar({ type: SnackbarType.ERROR, message: reason })}
        onPickFile={async (file) => {
          const { asset } = await uploadSingleImage({ file, visibility: MediaVisibility.PUBLIC });
          updateForm('image', asset.publicUrl ?? '');
        }}
      />
    </Stack>
  );
};
