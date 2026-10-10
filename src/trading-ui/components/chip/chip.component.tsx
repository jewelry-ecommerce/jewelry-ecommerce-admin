import React, { type ReactElement } from 'react';
import { Chip, Box, type SxProps, type Theme } from '@mui/material';
import { StackRowAlignCenter } from '@/trading-ui/adapters/library';
import { type IconPosition, CHIP_LABEL_PADDING, CHIP_SIZE_CONFIG, DEFAULT_MAX_VISIBLE_CHIPS, type ChipSize } from './chip.constant';

const getLabelPadding = (hasIcon: boolean, position: IconPosition) => {
  if (!hasIcon) return CHIP_LABEL_PADDING.NO_ICON;
  return position === 'left' ? CHIP_LABEL_PADDING.WITH_ICON_LEFT : CHIP_LABEL_PADDING.WITH_ICON_RIGHT;
};

const muiChipSize = (size: ChipSize): 'small' | 'medium' => (size === 'large' ? 'medium' : size);

const tagPillSx = (sizeConfig: (typeof CHIP_SIZE_CONFIG)['small']): SxProps<Theme> => ({
  height: sizeConfig.height,
  fontSize: sizeConfig.fontSize,
  borderRadius: sizeConfig.borderRadius,
  padding: '4px 8px',
  display: 'inline-flex',
  alignItems: 'center',
  flexShrink: 0,
  bgcolor: '#EFF6FF',
  color: '#171717',
  lineHeight: 1,
});

const tagMorePillSx = (sizeConfig: (typeof CHIP_SIZE_CONFIG)['small']): SxProps<Theme> => ({
  ...tagPillSx(sizeConfig),
  bgcolor: '#EFF6FF',
  color: '#171717',
});

const ChipIcon: React.FC<{
  icon: ReactElement;
  size: string;
  sxIcon?: SxProps<Theme>;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
}> = ({ icon, size, sxIcon, onClick, onMouseDown }) => (
  <Box
    onClick={onClick}
    onMouseDown={onMouseDown}
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      padding: '2px',

      '& svg': {
        width: size,
        height: size,
        display: 'block',
      },

      ...sxIcon,
    }}
  >
    {icon}
  </Box>
);

export interface ChipProps {
  tags?: readonly string[];
  max?: number;
  label?: string | React.ReactNode;
  onAction?: () => void;
  icon?: ReactElement;
  disabled?: boolean;
  clickable?: boolean;
  sx?: SxProps<Theme>;
  sxIcon?: SxProps<Theme>;
  iconPosition?: 'left' | 'right';
  size?: ChipSize;
}

const ChipComponent: React.FC<ChipProps> = ({
  tags,
  max = DEFAULT_MAX_VISIBLE_CHIPS,
  label,
  onAction,
  icon,
  disabled = false,
  clickable = true,
  sx,
  sxIcon,
  iconPosition = 'right',
  size = 'medium',
}) => {
  const sizeConfig = CHIP_SIZE_CONFIG[size];

  const hasTags = Array.isArray(tags);
  if (hasTags && (!tags || tags.length === 0)) return null;
  if (!hasTags && (label === undefined || label === null || label === '')) {
    return null;
  }

  const hasIcon = Boolean(icon) && !hasTags;
  const chipSize = muiChipSize(size);

  const content = hasTags ? (
    (() => {
      const cap = Math.max(0, Math.floor(max));
      const visible = cap === 0 ? [] : tags!.slice(0, cap);
      const overflow = tags!.length - visible.length;

      return (
        <StackRowAlignCenter sx={{ gap: 1, flexWrap: 'nowrap', overflow: 'hidden', minWidth: 0 }}>
          {visible.map((text, index) => (
            <Box key={`${index}-${text}`} component="span" sx={tagPillSx(sizeConfig)}>
              {text}
            </Box>
          ))}
          {overflow > 0 ? (
            <Box component="span" sx={tagMorePillSx(sizeConfig)}>
              +{overflow}
            </Box>
          ) : null}
        </StackRowAlignCenter>
      );
    })()
  ) : (
    <StackRowAlignCenter sx={{ gap: '8px' }}>
      {hasIcon && iconPosition === 'left' && <ChipIcon icon={icon!} size={sizeConfig.iconSize} sxIcon={{ cursor: 'pointer', ...sxIcon }} />}
      <Box component="span">{label}</Box>
      {hasIcon && iconPosition === 'right' && (
        <ChipIcon
          icon={icon!}
          size={sizeConfig.iconSize}
          sxIcon={{ cursor: 'pointer', ...sxIcon }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAction?.();
          }}
        />
      )}
    </StackRowAlignCenter>
  );

  return (
    <Chip
      disabled={disabled}
      clickable={clickable}
      onClick={onAction}
      label={content}
      sx={{
        height: hasTags ? 'auto' : sizeConfig.height,
        minHeight: hasTags ? sizeConfig.height : undefined,
        fontSize: sizeConfig.fontSize,
        borderRadius: hasTags ? 0 : sizeConfig.borderRadius,
        cursor: clickable ? 'pointer' : 'default',
        backgroundColor: 'transparent',
        border: hasTags ? 'none' : '1px solid #D1D5DB',
        p: hasTags ? 0 : undefined,
        '& .MuiChip-label': {
          padding: hasTags ? 0 : getLabelPadding(hasIcon, iconPosition),
          display: 'flex',
          alignItems: 'center',
          minWidth: 0,
          overflow: hasTags ? 'hidden' : undefined,
        },

        '& .MuiChip-label svg': {
          flexShrink: 0,
          color: '#4B5563',
        },

        '&.Mui-disabled': {
          opacity: 0.5,
          color: '#9E9E9E',
        },

        ...sx,
      }}
      size={chipSize}
    />
  );
};

export { ChipComponent };
