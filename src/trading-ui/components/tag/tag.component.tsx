import { type SxProps, type Theme, Typography } from '@mui/material';
import React from 'react';
import { STYLE } from '@/trading-ui/adapters/library';
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';
import { StackRowWrap } from '../styled';

export type TagType = 'success' | 'warning' | 'info' | 'secondary' | 'primary' | 'error';
export type TagSize = 'large' | 'medium' | 'small';
export type TagVariant = 'contained' | 'outlined' | 'outlined-border';

import { lightenColor } from "./tag-color.util";

const TAG_SIZE: Record<TagSize, { padding: string; typography: typeof TYPOGRAPHY_STYLES.sm.medium }> = {
  large: {
    padding: '6px 8px',
    typography: TYPOGRAPHY_STYLES.sm.medium,
  },
  medium: {
    padding: '4px 8px',
    typography: TYPOGRAPHY_STYLES.sm.medium,
  },
  small: {
    padding: '4px 8px',
    typography: TYPOGRAPHY_STYLES.sm.medium,
  },
};

export interface TagComponentProps {
  /** Màu nền/viền (hex) — dùng với outlined / outlined-border */
  type: string;
  content: string;
  width?: number;
  sx?: SxProps<Theme>;
  variation?: 'body1' | 'caption';
  variant?: TagVariant;
  size?: TagSize;
  color?: string;
  iconProps?: React.ReactNode;
}

export const TagComponent: React.FC<TagComponentProps> = ({ type, content, width, variation = 'caption', size = 'medium', variant = 'outlined', sx, color, iconProps }) => {
  const TAG_VARIANT: Record<TagVariant, { backgroundColor: string; color: string; border?: string }> = {
    contained: {
      backgroundColor: type,
      color: color || '#ffffff',
    },
    outlined: {
      backgroundColor: lightenColor(type, 0.9),
      color: type,
    },
    'outlined-border': {
      backgroundColor: lightenColor(type, 0.9),
      border: `1px solid ${lightenColor(type, 0.55)}`,
      color: type,
    },
  };

  const sizeStyles = TAG_SIZE[size];
  const baseSx: SxProps<Theme> = {
    borderRadius: STYLE.BORDER_RADIUS_ELEMENT_SMALL ?? 6,
    width,
    textAlign: 'center',
    ...sizeStyles.typography,
    ...TAG_VARIANT[variant],
    ...sx,
  };

  return iconProps ? (
    <StackRowWrap
      sx={{
        ...baseSx,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.5,
        padding: sizeStyles.padding,
      }}
    >
      {iconProps}
      <Typography component="span" variant={variation} sx={{ ...sizeStyles.typography }}>
        {content}
      </Typography>
    </StackRowWrap>
  ) : (
    <Typography
      component="span"
      variant={variation}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        padding: sizeStyles.padding,
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        ...baseSx,
      }}
    >
      {content}
    </Typography>
  );
};
