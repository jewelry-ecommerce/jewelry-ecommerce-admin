import { CircularProgress, Stack, Typography } from '@mui/material';
import type { Category, CmsNavigation, CmsNavigationBadge, Page } from '../../../../../../apis';
import type { TreeSelectNode } from '../../../../../../components/form';
import { TYPOGRAPHY_STYLES } from '../../../../../../common/constant/typography.constant';
import { CustomButton } from '../../../../../../components/button/custom-button';
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../../../../../components/styled/stack.style';
import { contentNavigationButtonPermission } from '../../../../content-permission.constants';
import { NavigationBadgeSection } from '../../components/navigation-badge-section.component';
import { NavigationFormDisplaySection } from '../../components/navigation-form-display-section.component';
import { NavigationFormIdSection } from '../../components/navigation-form-id-section.component';
import type { Dispatch, SetStateAction } from 'react';
import type { NavigationFormState, ScreenState } from '../../site-navigation.interface';

export type NavigationFormPartProps = {
  viewMode?: boolean;
  screenState: ScreenState;
  selectedTreeNode?: CmsNavigation;
  form: NavigationFormState;
  formErrors: Record<string, string>;
  saving: boolean;
  menuPopupLocked: boolean;
  categoryTree: Category[];
  categoryOptions: TreeSelectNode[];
  tree: CmsNavigation[];
  pages: Page[];
  pageOptions: Array<{ value: string; label: string }>;
  sourceName: string;
  isPageTargetBroken: boolean;
  isCategoryTargetBroken: boolean;
  selectedDetail?: CmsNavigation;
  updateForm: <K extends keyof NavigationFormState>(key: K, value: NavigationFormState[K]) => void;
  setForm: Dispatch<SetStateAction<NavigationFormState>>;
  setFormErrors: Dispatch<SetStateAction<Record<string, string>>>;
  onCancel: () => void;
  onSave: () => void;
  onSelectBadge: (badge: CmsNavigationBadge) => void;
};

export const NavigationFormPart = ({
  viewMode = false,
  screenState,
  selectedTreeNode,
  form,
  formErrors,
  saving,
  menuPopupLocked,
  categoryTree,
  categoryOptions,
  tree,
  pages,
  pageOptions,
  sourceName,
  isPageTargetBroken,
  isCategoryTargetBroken,
  selectedDetail,
  updateForm,
  setForm,
  setFormErrors,
  onCancel,
  onSave,
  onSelectBadge,
}: NavigationFormPartProps) => {
  if (screenState.mode === 'idle') {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ height: '100%', color: '#667085', textAlign: 'center' }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold }}>Chọn một mục menu để chỉnh sửa</Typography>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular }}>Hoặc tạo menu mới từ cây bên trái để cấu hình menu điều hướng.</Typography>
      </Stack>
    );
  }

  const title =
    screenState.mode === 'create'
      ? screenState.createParent
        ? `Tạo menu con của ${screenState.createParent.label}`
        : 'Tạo menu'
      : viewMode
        ? `Xem ${selectedTreeNode?.label ?? 'menu'}`
        : `Chỉnh sửa ${selectedTreeNode?.label ?? 'menu'}`;

  const fieldsDisabled = viewMode;

  return (
    <Stack gap={2} sx={{ height: '100%', minHeight: 0, overflow: 'auto', pr: 0.5 }}>
      <StackRowAlignCenterJustBetween sx={{ flexShrink: 0 }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: '#101828' }}>{title}</Typography>
        {!viewMode ? (
          <StackRowAlignCenter gap={1}>
            <CustomButton variant="outline" fullWidth={false} disabled={saving} onClick={onCancel} sx={{ textTransform: 'none' }}>
              Hủy
            </CustomButton>
            <CustomButton
              variant="primary"
              fullWidth={false}
              disabled={saving}
              onClick={onSave}
              sx={{ textTransform: 'none', bgcolor: '#101828', boxShadow: 'none', '&:hover': { bgcolor: '#101828' } }}
              {...contentNavigationButtonPermission('navigation_save', 'Lưu', 'api_cms_navigation_update')}
            >
              {saving ? <CircularProgress size={18} sx={{ color: '#FFFFFF' }} /> : 'Lưu'}
            </CustomButton>
          </StackRowAlignCenter>
        ) : null}
      </StackRowAlignCenterJustBetween>

      <Stack gap={2}>
        <NavigationFormIdSection
          fieldsDisabled={fieldsDisabled}
          form={form}
          formErrors={formErrors}
          screenState={screenState}
          selectedTreeNode={selectedTreeNode}
          categoryTree={categoryTree}
          categoryOptions={categoryOptions}
          tree={tree}
          pages={pages}
          pageOptions={pageOptions}
          sourceName={sourceName}
          isPageTargetBroken={isPageTargetBroken}
          isCategoryTargetBroken={isCategoryTargetBroken}
          updateForm={updateForm}
          setForm={setForm}
          setFormErrors={setFormErrors}
        />
        <NavigationFormDisplaySection fieldsDisabled={fieldsDisabled} form={form} menuPopupLocked={menuPopupLocked} updateForm={updateForm} />
        <NavigationBadgeSection
          fieldsDisabled={fieldsDisabled}
          form={form}
          formErrors={formErrors}
          selectedDetail={selectedDetail}
          updateForm={updateForm}
          setForm={setForm}
          onSelectBadge={onSelectBadge}
        />
      </Stack>
    </Stack>
  );
};
