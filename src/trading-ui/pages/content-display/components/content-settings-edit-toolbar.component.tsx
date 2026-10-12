import { Edit02 } from '@untitledui/icons';
import type { ReactNode } from 'react';
import { ButtonIconContentComponent, CustomButton } from '../../../components/button';
import { StackRowAlignCenter } from '../../../components/styled';
import type { PageButtonPermissionProps } from '../../../permissions/page-button-permission.utils';

export type ContentSettingsEditToolbarProps = {
  viewMode: boolean;
  onEnterEdit: () => void;
  onCancelEdit?: () => void;
  editPermission: PageButtonPermissionProps;
  cancelPermission?: PageButtonPermissionProps;
  editActions?: ReactNode;
};

export const ContentSettingsEditToolbar = ({ viewMode, onEnterEdit, onCancelEdit, editPermission, cancelPermission, editActions }: ContentSettingsEditToolbarProps) => {
  if (viewMode) {
    return (
      <ButtonIconContentComponent
        content="Chỉnh sửa"
        icon={<Edit02 size={20} color="#737373" />}
        onClick={onEnterEdit}
        {...editPermission}
        sx={{ color: '#101828', border: '1px solid #111827', padding: '6px 12px' }}
      />
    );
  }

  return (
    <StackRowAlignCenter gap={1}>
      {onCancelEdit && cancelPermission ? (
        <CustomButton type="button" variant="outline" fullWidth={false} onClick={onCancelEdit} sx={{ textTransform: 'none' }} {...cancelPermission}>
          Hủy
        </CustomButton>
      ) : null}
      {editActions}
    </StackRowAlignCenter>
  );
};
