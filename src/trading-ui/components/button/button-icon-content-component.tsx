import { ButtonBase, type SxProps, type Theme, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';
import { usePermissionGate, type PermissionGateInput } from '../../permissions/use-permission-gate.hook';

const INK = '#101828';

export interface ButtonIconContentComponentProps {
  icon?: ReactNode;
  content: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  permission?: string;
  apiCode?: string | string[];
  actionCode?: string;
  actionLabel?: string;
  menuCode?: string;
  tabCode?: string;
  permissionResolver?: PermissionGateInput['permissionResolver'];
  unauthorizedMode?: 'hide' | 'disable';
  sx?: SxProps<Theme>;
}

export const ButtonIconContentComponent = ({
  icon,
  content,
  selected = false,
  onClick,
  disabled = false,
  permission,
  apiCode,
  actionCode,
  menuCode,
  tabCode,
  permissionResolver,
  unauthorizedMode = 'hide',
  sx = {},
}: ButtonIconContentComponentProps) => {
  const canAccess = usePermissionGate({
    permission,
    apiCode,
    actionCode,
    menuCode,
    tabCode,
    permissionResolver,
  });

  if (!canAccess && unauthorizedMode === 'hide') return null;

  const isDisabled = disabled || (!canAccess && unauthorizedMode === 'disable');

  return (
    <ButtonBase
      disabled={isDisabled}
      onClick={isDisabled ? undefined : onClick}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        px: 2,
        py: 1.25,
        minHeight: 40,
        borderRadius: 2,
        border: `1px solid ${selected ? INK : '#E5E7EB'}`,
        bgcolor: selected ? INK : '#FFFFFF',
        color: selected ? '#FFFFFF' : '#374151',
        transition: 'background-color 0.15s, border-color 0.15s, color 0.15s',
        '&:hover': {
          bgcolor: selected ? INK : '#F8FAFC',
        },
        '&.Mui-disabled': {
          opacity: 0.5,
        },
        ...sx,
      }}
    >
      {icon && icon}
      <Typography component="span" sx={{ ...TYPOGRAPHY_STYLES.base.medium, fontWeight: selected ? 600 : 500 }}>
        {content}
      </Typography>
    </ButtonBase>
  );
};
