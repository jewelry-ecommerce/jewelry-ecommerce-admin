import { Dialog, DialogActions, DialogContent, type DialogProps, DialogTitle, IconButton, Stack, Typography, type SxProps, type Theme } from '@mui/material';
import React from 'react';
import { STYLE } from '@/trading-ui/adapters/library';
import { ButtonElement, type ButtonElementProps } from "../../adapters/button.element";
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';
import type { PageButtonPermissionProps } from '../../permissions/page-button-permission.utils';
import { CustomButton } from '../button/custom-button';
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../styled';
import { XClose } from '@untitledui/icons';


import { dialogContainedButtonSx, dialogOutlinedButtonSx } from "./dialog-button.styles";

const mergeDialogButtonSx = (variant: ButtonElementProps['variant'], extra?: SxProps<Theme>): SxProps<Theme> => {
  const base = variant === 'contained' ? dialogContainedButtonSx : dialogOutlinedButtonSx;
  if (!extra) return base;
  return [base, ...(Array.isArray(extra) ? extra : [extra])];
};

export type DialogButtonProps = Omit<ButtonElementProps, 'permission'> & Partial<PageButtonPermissionProps>;

const hasPermissionGate = (button: DialogButtonProps): boolean => Boolean(button.actionCode || button.apiCode);

const renderDialogFooterButton = (button: DialogButtonProps, defaultVariant: ButtonElementProps['variant']) => {
  const { sx, actionCode, actionLabel, apiCode, menuCode, tabCode, unauthorizedMode, content, variant, ...rest } = button;
  void variant;

  if (hasPermissionGate(button)) {
    return (
      <CustomButton
        {...rest}
        actionCode={actionCode}
        actionLabel={actionLabel ?? (typeof content === 'string' ? content : undefined)}
        apiCode={apiCode}
        menuCode={menuCode}
        tabCode={tabCode}
        unauthorizedMode={unauthorizedMode ?? 'hide'}
        variant={defaultVariant === 'contained' ? 'primary' : 'outline'}
        fullWidth={false}
        sx={mergeDialogButtonSx(defaultVariant, sx)}
      >
        {content}
      </CustomButton>
    );
  }

  return (
    <ButtonElement
      {...(() => {
        const { sx: buttonSx, ...buttonRest } = button;
        return {
          ...buttonRest,
          sx: mergeDialogButtonSx(defaultVariant, buttonSx),
        };
      })()}
      fullWidth={false}
    />
  );
};

export interface DialogComponentProps extends Omit<DialogProps, 'children'> {
  title: string;
  /** Optional line under the title (e.g. import wizard step description). */
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  buttonStart?: DialogButtonProps;
  buttonLeft?: DialogButtonProps;
  buttonRight?: DialogButtonProps;
  icon?: React.ReactNode;
  sxBottom?: SxProps<Theme>;
}

export const DialogComponent: React.FC<DialogComponentProps> = ({
  title,
  subtitle,
  children,
  open,
  onClose,
  buttonStart,
  buttonLeft,
  buttonRight,
  maxWidth = 'sm',
  fullWidth = true,
  PaperProps,
  icon,
  sxBottom,
  ...rest
}) => (
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
        alignItems: subtitle ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        p: '24px',
        borderBottom: '1px solid #E5E7EB',
        boxSizing: 'border-box',
      }}
    >
      <StackRowAlignCenter sx={{ gap: 1.5, minWidth: 0, pr: 1, alignItems: subtitle ? 'flex-start' : 'center' }}>
        {icon && <StackRowAlignCenter sx={{ p: '10px', borderRadius: '10px', bgcolor: '#101828', flexShrink: 0 }}>{icon}</StackRowAlignCenter>}
        <Stack sx={{ minWidth: 0, gap: 0.25 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.semibold, color: '#111827' }}>{title}</Typography>
          {subtitle ? (
            <Typography component="div" sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>
              {subtitle}
            </Typography>
          ) : null}
        </Stack>
      </StackRowAlignCenter>

      <IconButton size="small" onClick={(e) => onClose?.(e, 'escapeKeyDown')} sx={{ color: '#6B7280', flexShrink: 0, mt: subtitle ? 0.25 : 0 }}>
        <XClose size={20} />
      </IconButton>
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
      {children}
    </DialogContent>

    {(buttonStart || buttonLeft || buttonRight) && (
      <DialogActions sx={{ p: '24px', pt: 0, boxSizing: 'border-box', ...sxBottom }}>
        <StackRowAlignCenterJustBetween sx={{ width: '100%' }}>
          {buttonStart ? renderDialogFooterButton(buttonStart, buttonStart.variant ?? 'outlined') : <span />}
          <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
            {buttonLeft ? renderDialogFooterButton(buttonLeft, buttonLeft.variant ?? 'outlined') : null}
            {buttonRight ? renderDialogFooterButton(buttonRight, buttonRight.variant ?? 'contained') : null}
          </Stack>
        </StackRowAlignCenterJustBetween>
      </DialogActions>
    )}
  </Dialog>
);
