import { Button, type ButtonProps, type SxProps, type Theme } from '@mui/material';
import { usePermissionGate, type PermissionGateInput } from '../../permissions/use-permission-gate.hook';

type PermissionResolver = PermissionGateInput['permissionResolver'];

interface CustomButtonProps extends Omit<ButtonProps, 'variant' | 'onClick'> {
  variant?: 'primary' | 'secondary' | 'outline';
  children?: React.ReactNode;
  onClick?: ButtonProps['onClick'];
  sx?: SxProps<Theme>;
  permission?: string;
  apiCode?: string | string[];
  /** Mã action IAM — dùng với menuCode + tabCode hoặc scan catalog. */
  actionCode?: string;
  /** Tên hiển thị cho admin / báo cáo scan (không bắt buộc render). */
  actionLabel?: string;
  menuCode?: string;
  tabCode?: string;
  permissionResolver?: PermissionResolver;
  unauthorizedMode?: 'hide' | 'disable';
}

export const CustomButton = ({
  variant = 'primary',
  children,
  type = 'button',
  permission,
  apiCode,
  actionCode,
  actionLabel,
  menuCode,
  tabCode,
  permissionResolver,
  unauthorizedMode = 'disable',
  disabled = false,
  onClick,
  ...props
}: CustomButtonProps) => {
  void actionLabel;

  const canAccess = usePermissionGate({
    permission,
    apiCode,
    actionCode,
    menuCode,
    tabCode,
    permissionResolver,
  });

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: '#1F2937',
          color: '#FFFFFF',
          '&:hover': { backgroundColor: '#111827' },
          '&:disabled': { backgroundColor: '#D1D5DB', color: '#9CA3AF' },
        };
      case 'secondary':
        return {
          backgroundColor: '#E5E7EB',
          color: '#111827',
          '&:hover': { backgroundColor: '#D1D5DB' },
        };
      case 'outline':
        return {
          border: '1px solid #D1D5DB',
          backgroundColor: 'transparent',
          color: '#111827',
          '&:hover': { backgroundColor: '#F3F4F6' },
        };
      default:
        return {};
    }
  };

  if (!canAccess && unauthorizedMode === 'hide') return null;

  return (
    <Button
      fullWidth
      type={type}
      {...props}
      disabled={disabled || (!canAccess && unauthorizedMode === 'disable')}
      onClick={canAccess ? onClick : undefined}
      sx={{
        padding: '12px 16px',
        fontSize: 14,
        fontWeight: 600,
        borderRadius: 1,
        textTransform: 'none',
        whiteSpace: 'nowrap',
        ...getVariantStyles(),
        ...props.sx,
      }}
    >
      {children}
    </Button>
  );
};

export const AppButton = CustomButton;
