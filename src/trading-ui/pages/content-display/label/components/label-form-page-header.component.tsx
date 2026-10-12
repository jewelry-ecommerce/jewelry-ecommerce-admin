import { Box, Typography } from '@mui/material';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { CustomButton } from '../../../../components/button';
import { StackRow, StackRowAlignCenterJustBetween } from '../../../../components/styled/stack.style';
import { dialogContainedButtonSx, dialogOutlinedButtonSx } from '../../../../components/dialog/dialog.component';
import type { PageButtonPermissionProps } from '../../../../permissions/page-button-permission.utils';
import type { ContentButtonPermission } from '../../content-permission.constants';
import React from 'react';
import { ArrowLeft, Edit02 } from '@untitledui/icons';
import { ButtonIconContentComponent } from '../../../../components/button';

const backBarSx = {
  display: 'flex',
  px: 2,
  py: 1.5,
  justifyContent: 'space-between',
  alignItems: 'center',
  alignSelf: 'stretch',
  borderBottom: '1px solid #E5E7EB',
  bgcolor: '#FFF',
} as const;

const backButtonSx = {
  textTransform: 'none',
  ...TYPOGRAPHY_STYLES.base.medium,
  p: 1.5,
  minWidth: 0,
  justifyContent: 'flex-start',
  color: '#4A5565',
  width: 'fit-content',
  '&:hover': {
    bgcolor: '#FFF',
    boxShadow: 'none',
  },
} as const;

type LabelFormPageHeaderSharedProps = {
  /** Gate nút quay lại — trang label content/display truyền helper theo tab IAM. */
  buttonPermission?: ContentButtonPermission;
  /** Gate tùy chỉnh cho nút quay lại (module khác dùng chung layout header). */
  backPermission?: PageButtonPermissionProps;
  backLabel?: string;
  /** Tùy chọn — không truyền thì Lưu/Huỷ không qua IAM gate (vd. trang label create/update). */
  cancelPermission?: PageButtonPermissionProps;
  savePermission?: PageButtonPermissionProps;
};

export type LabelFormPageHeaderProps =
  | (LabelFormPageHeaderSharedProps & {
      variant: 'backOnly';
      onBack: () => void;
    })
  | (LabelFormPageHeaderSharedProps & {
      variant: 'page';
      title: string;
      onBack: () => void;
    })
  | (LabelFormPageHeaderSharedProps & {
      variant?: 'form';
      title: string;
      onBack: () => void;
      onCancel?: () => void;
      onSave?: () => void;
      loading?: boolean;
      disabled?: boolean;
      /** Nội dung hiển thị bên trái nhóm Huỷ/Lưu (vd. badge trạng thái). */
      actionsStart?: React.ReactNode;
      /** Nhãn nút lưu — mặc định "Lưu". */
      saveLabel?: string;
    })
  | (LabelFormPageHeaderSharedProps & {
      variant: 'view';
      title: string;
      onBack: () => void;
      onEdit?: () => void;
      editPermission?: PageButtonPermissionProps;
      actionsStart?: React.ReactNode;
    });

const resolveBackPermissionProps = (buttonPermission: ContentButtonPermission | undefined, backPermission: PageButtonPermissionProps | undefined): PageButtonPermissionProps | Record<string, never> =>
  backPermission ?? (buttonPermission ? buttonPermission('label_back', 'Quay lại danh sách label', 'api_cms_page_update') : {});

const LabelFormBackButton = ({ label, onBack, permissionProps }: { label: string; onBack: () => void; permissionProps: PageButtonPermissionProps | Record<string, never> }) => (
  <CustomButton variant="outline" fullWidth={false} startIcon={<ArrowLeft color="#4A5565" size={16} />} onClick={onBack} sx={backButtonSx} {...permissionProps}>
    {label}
  </CustomButton>
);

export const LabelFormPageHeader = (props: LabelFormPageHeaderProps) => {
  const backLabel = props.backLabel ?? 'Quay lại danh sách';
  const backPermissionProps = resolveBackPermissionProps(props.buttonPermission, props.backPermission);

  if (props.variant === 'backOnly') {
    return (
      <Box sx={backBarSx}>
        <LabelFormBackButton label={backLabel} onBack={props.onBack} permissionProps={backPermissionProps} />
      </Box>
    );
  }

  if (props.variant === 'page') {
    return (
      <Box sx={{ flexShrink: 0, bgcolor: '#FFFFFF' }}>
        <Box sx={backBarSx}>
          <LabelFormBackButton label={backLabel} onBack={props.onBack} permissionProps={backPermissionProps} />
        </Box>
        <StackRowAlignCenterJustBetween
          sx={{
            alignItems: 'center',
            flexShrink: 0,
            py: 1.5,
            px: 2,
            borderBottom: '1px solid #E5E7EB',
            bgcolor: '#FFFFFF',
          }}
        >
          <Typography sx={{ ...TYPOGRAPHY_STYLES['2xl'].bold, color: '#101828' }}>{props.title}</Typography>
        </StackRowAlignCenterJustBetween>
      </Box>
    );
  }

  if (props.variant === 'view') {
    return (
      <Box sx={{ flexShrink: 0, bgcolor: '#FFFFFF' }}>
        <Box sx={backBarSx}>
          <LabelFormBackButton label={backLabel} onBack={props.onBack} permissionProps={backPermissionProps} />
        </Box>
        <StackRowAlignCenterJustBetween
          sx={{
            alignItems: 'center',
            flexShrink: 0,
            py: 1.5,
            px: 2,
            borderBottom: '1px solid #E5E7EB',
            bgcolor: '#FFFFFF',
          }}
        >
          <Typography sx={{ ...TYPOGRAPHY_STYLES['2xl'].bold, color: '#101828' }}>{props.title}</Typography>
          <StackRow sx={{ alignItems: 'center', gap: 1.5 }}>
            {props.actionsStart}
            {props.onEdit ? (
              <ButtonIconContentComponent
                content="Chỉnh sửa"
                icon={<Edit02 size={20} color="#737373" />}
                onClick={props.onEdit}
                {...(props.editPermission ?? {})}
                sx={{ color: '#101828', border: '1px solid #111827', padding: '6px 12px' }}
              />
            ) : null}
          </StackRow>
        </StackRowAlignCenterJustBetween>
      </Box>
    );
  }

  const { title, onBack, onCancel, onSave, loading, disabled, cancelPermission, savePermission, actionsStart, saveLabel = 'Lưu' } = props;

  return (
    <Box sx={{ flexShrink: 0, bgcolor: '#FFFFFF' }}>
      <Box sx={backBarSx}>
        <LabelFormBackButton label={backLabel} onBack={onBack} permissionProps={backPermissionProps} />
      </Box>

      <StackRowAlignCenterJustBetween
        sx={{
          alignItems: 'center',
          flexShrink: 0,
          py: 1.5,
          px: 2,
          borderBottom: '1px solid #E5E7EB',
          bgcolor: '#FFFFFF',
        }}
      >
        <Typography sx={{ ...TYPOGRAPHY_STYLES['2xl'].bold, color: '#101828' }}>{title}</Typography>
        <StackRow sx={{ alignItems: 'center', gap: 1.5 }}>
          {actionsStart}
          {onCancel && (
            <CustomButton variant="outline" onClick={onCancel} fullWidth={false} sx={dialogOutlinedButtonSx} disabled={loading} {...(cancelPermission ?? {})}>
              Huỷ
            </CustomButton>
          )}
          {onSave && (
            <CustomButton variant="primary" onClick={onSave} fullWidth={false} sx={dialogContainedButtonSx} disabled={disabled || loading} {...(savePermission ?? {})}>
              {loading ? 'Đang lưu...' : saveLabel}
            </CustomButton>
          )}
        </StackRow>
      </StackRowAlignCenterJustBetween>
    </Box>
  );
};
