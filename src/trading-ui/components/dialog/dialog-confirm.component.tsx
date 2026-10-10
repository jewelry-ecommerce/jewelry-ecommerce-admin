import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography, type DialogProps, type SxProps, type Theme } from '@mui/material';
import { AlertCircle, CheckCircle, InfoCircle, XClose } from '@untitledui/icons';
import React from 'react';
import { STYLE } from '@/trading-ui/adapters/library';
import { ButtonElement, type ButtonElementProps } from "../../adapters/button.element";
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';
import type { PageButtonPermissionProps } from '../../permissions/page-button-permission.utils';
import { CustomButton } from '../button/custom-button';
import { dialogContainedButtonSx, dialogOutlinedButtonSx } from './dialog-button.styles';

export type DialogConfirmButtonProps = Partial<ButtonElementProps> & Partial<PageButtonPermissionProps>;

const hasPermissionGate = (button: DialogConfirmButtonProps): boolean => Boolean(button.actionCode || button.apiCode);

const renderDialogConfirmButton = (
  button: DialogConfirmButtonProps,
  defaultLabel: string,
  defaultVariant: 'outlined' | 'contained',
  confirmTone: 'primary' | 'danger',
  loading: boolean,
  onClick: () => void,
) => {
  const { sx, actionCode, actionLabel, apiCode, menuCode, tabCode, unauthorizedMode, content, disabled } = button;
  const label = content ?? defaultLabel;

  if (hasPermissionGate(button)) {
    return (
      <CustomButton
        actionCode={actionCode}
        actionLabel={actionLabel ?? (typeof label === 'string' ? label : undefined)}
        apiCode={apiCode}
        menuCode={menuCode}
        tabCode={tabCode}
        unauthorizedMode={unauthorizedMode ?? 'hide'}
        variant={defaultVariant === 'contained' ? 'primary' : 'outline'}
        fullWidth={false}
        disabled={disabled ?? loading}
        onClick={onClick}
        sx={defaultVariant === 'contained' ? mergeConfirmButtonSx(confirmTone, sx) : mergeCancelButtonSx(sx)}
      >
        {label}
      </CustomButton>
    );
  }

  return (
    <ButtonElement
      loading={loading}
      content={label}
      variant={defaultVariant}
      onClick={onClick}
      fullWidth={false}
      {...(() => {
        const { sx: buttonSx, ...buttonRest } = button;
        return {
          ...buttonRest,
          sx: defaultVariant === 'contained' ? mergeConfirmButtonSx(confirmTone, buttonSx) : mergeCancelButtonSx(buttonSx),
        };
      })()}
    />
  );
};

export type DialogConfirmTone = 'danger' | 'warning' | 'info' | 'neutral';

const HIGHLIGHT_PALETTE: Record<DialogConfirmTone, { bg: string; border: string; titleColor: string; descColor: string; iconColor: string }> = {
  danger: {
    bg: '#FEF3F2',
    border: '#FECDCA',
    titleColor: '#B42318',
    descColor: '#B42318',
    iconColor: '#D92D20',
  },
  warning: {
    bg: '#FFFAEB',
    border: '#FEDF89',
    titleColor: '#B54708',
    descColor: '#B54708',
    iconColor: '#F79009',
  },
  info: {
    bg: '#EFF8FF',
    border: '#B2DDFF',
    titleColor: '#175CD3',
    descColor: '#175CD3',
    iconColor: '#1570EF',
  },
  neutral: {
    bg: '#F8FAFC',
    border: '#E4E7EC',
    titleColor: '#101828',
    descColor: '#475467',
    iconColor: '#475467',
  },
};

const dialogDangerConfirmSx: SxProps<Theme> = {
  textTransform: 'none',
  bgcolor: '#D92D20',
  color: '#fff',
  boxShadow: 'none',
  '&:hover': {
    bgcolor: '#B42318',
    boxShadow: 'none',
  },
};

const mergeConfirmButtonSx = (variant: 'primary' | 'danger', extra?: SxProps<Theme>): SxProps<Theme> => {
  const base = variant === 'danger' ? dialogDangerConfirmSx : dialogContainedButtonSx;
  if (!extra) return base;
  return [base, ...(Array.isArray(extra) ? extra : [extra])];
};

const mergeCancelButtonSx = (extra?: SxProps<Theme>): SxProps<Theme> => {
  if (!extra) return dialogOutlinedButtonSx;
  return [dialogOutlinedButtonSx, ...(Array.isArray(extra) ? extra : [extra])];
};

export interface DialogConfirmHighlight {
  tone: DialogConfirmTone;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Mặc định: AlertCircle (danger), CheckCircle (info), InfoCircle (neutral). */
  icon?: React.ReactNode;
}

export interface DialogConfirmComponentProps extends Omit<DialogProps, 'children'> {
  loading?: boolean;
  title: string;
  /** Ô highlight (đỏ / xanh / xám). Bỏ qua nếu không cần. */
  highlight?: DialogConfirmHighlight;
  /** Phần thân thêm: lưu ý, câu hỏi xác nhận, form, TextField,… */
  children?: React.ReactNode;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  /** Nút xác nhận: đỏ (mặc định) hoặc đen primary như dialog chuẩn. */
  confirmVariant?: 'primary' | 'danger';
  cancelButtonProps?: DialogConfirmButtonProps;
  confirmButtonProps?: DialogConfirmButtonProps;
  /** Căn nhóm nút footer. */
  footerJustify?: 'flex-end' | 'flex-start';
  /** Ẩn nút đóng góc phải header. */
  hideCloseButton?: boolean;
  omitActions?: boolean;
}

const defaultHighlightIcon = (tone: DialogConfirmTone) => {
  const { iconColor } = HIGHLIGHT_PALETTE[tone];
  const size = 20;
  if (tone === 'danger') {
    return <AlertCircle size={size} color={iconColor} aria-hidden />;
  }
  if (tone === 'warning') {
    return <AlertCircle size={size} color={iconColor} aria-hidden />;
  }
  if (tone === 'info') {
    return <CheckCircle size={size} color={iconColor} aria-hidden />;
  }
  return <InfoCircle size={size} color={iconColor} aria-hidden />;
};

export const DialogConfirmComponent: React.FC<DialogConfirmComponentProps> = ({
  loading = false,
  title,
  highlight,
  children,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
  confirmVariant = 'danger',
  cancelButtonProps,
  confirmButtonProps,
  footerJustify = 'flex-end',
  hideCloseButton = true,
  omitActions = false,
  open,
  onClose,
  maxWidth = 'xs',
  fullWidth = true,
  PaperProps,
  ...rest
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: { borderRadius: STYLE.BORDER_RADIUS_ELEMENT_WRAPPER, ...PaperProps?.sx },
        ...PaperProps,
      }}
      {...rest}
    >
      <DialogTitle
        component="div"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          p: '24px',
          borderBottom: '1px solid #E5E7EB',
          boxSizing: 'border-box',
        }}
      >
        <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.semibold, color: '#111827' }}>{title}</Typography>
        {hideCloseButton && (
          <Box onClick={(e) => onClose?.(e, 'escapeKeyDown')} sx={{ cursor: 'pointer' }}>
            <XClose size={20} color="#98A2B3" />
          </Box>
        )}
      </DialogTitle>

      <DialogContent
        sx={{
          boxSizing: 'border-box',
          px: '24px',
          pb: '24px',
          '.MuiDialogTitle-root + &': {
            paddingTop: '24px',
          },
        }}
      >
        <Stack gap={2}>
          {highlight ? (
            <Stack
              direction="row"
              gap={1.5}
              alignItems="flex-start"
              sx={{
                p: 2,
                borderRadius: '12px',
                bgcolor: HIGHLIGHT_PALETTE[highlight.tone].bg,
                border: `1px solid ${HIGHLIGHT_PALETTE[highlight.tone].border}`,
              }}
            >
              <Box sx={{ flexShrink: 0, lineHeight: 0, pt: '2px' }}>{highlight.icon ?? defaultHighlightIcon(highlight.tone)}</Box>
              <Stack gap={0.5} sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    ...TYPOGRAPHY_STYLES.base.semibold,
                    color: HIGHLIGHT_PALETTE[highlight.tone].titleColor,
                  }}
                >
                  {highlight.title}
                </Typography>
                {highlight.description ? (
                  <Typography
                    sx={{
                      ...TYPOGRAPHY_STYLES.sm.regular,
                      color: HIGHLIGHT_PALETTE[highlight.tone].descColor,
                    }}
                  >
                    {highlight.description}
                  </Typography>
                ) : null}
              </Stack>
            </Stack>
          ) : null}
          {children}
        </Stack>
      </DialogContent>

      {omitActions ? null : (
        <DialogActions
          sx={{
            p: 3,
            boxSizing: 'border-box',
            borderTop: '1px solid #E5E7EB',
            gap: 1,
            flexWrap: 'wrap',
            justifyContent: footerJustify,
          }}
        >
          {renderDialogConfirmButton(cancelButtonProps ?? {}, cancelLabel, 'outlined', confirmVariant, loading, onCancel)}
          {renderDialogConfirmButton(confirmButtonProps ?? {}, confirmLabel, 'contained', confirmVariant, loading, onConfirm)}
        </DialogActions>
      )}
    </Dialog>
  );
};
