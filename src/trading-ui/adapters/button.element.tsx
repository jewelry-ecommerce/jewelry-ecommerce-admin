import { Button, type ButtonProps, Typography, useTheme } from '@mui/material';
import React from 'react';
import { STYLE } from './style';
import { LoadingComponent } from '../components/loading/loading.component';
import { IconElement } from './icon.element';

export interface ButtonElementProps extends Omit<ButtonProps, 'content'> {
  content?: React.ReactNode;
  loading?: boolean;
  startIcon?: string | React.ReactNode;
  endIcon?: string | React.ReactNode;
  disabled?: boolean;
  permission?: boolean;
}

export const ButtonElement: React.FC<ButtonElementProps> = ({
  content,
  loading = false,
  startIcon,
  endIcon,
  variant = 'contained',
  sx,
  disabled = false,
  permission,
  ...rest
}) => {
  void permission;
  const { palette } = useTheme();

  return (
    <Button
      {...rest}
      variant={variant}
      startIcon={
        !loading && startIcon ? (
          typeof startIcon === 'string' ? (
            <IconElement icon={startIcon} sx={{ cursor: 'pointer' }} />
          ) : (
            startIcon
          )
        ) : undefined
      }
      endIcon={
        !loading && endIcon ? (
          typeof endIcon === 'string' ? (
            <IconElement icon={endIcon} sx={{ cursor: 'pointer' }} />
          ) : (
            endIcon
          )
        ) : undefined
      }
      sx={{
        minWidth: 100,
        textTransform: 'none',
        borderRadius: STYLE.BORDER_RADIUS_ELEMENT_SMALL,
        width: 'fit-content',
        ...sx,
      }}
      disabled={disabled}
    >
      {loading ? (
        <LoadingComponent
          // color={variant === 'contained' ? palette.primary.contrastText : palette.primary.main}
          color={variant === 'contained' ? palette.primary.contrastText : (rest.color as string)}
          size="small"
          sx={{ minHeight: '24.5px' }}
        />
      ) : (
        <Typography sx={{ ...STYLE.TYPOGRAPHY.textSm.regular, whiteSpace: 'nowrap' }}>{content}</Typography>
      )}
    </Button>
  );
};
