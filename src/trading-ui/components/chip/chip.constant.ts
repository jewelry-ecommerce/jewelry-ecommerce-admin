export type ChipSize = 'small' | 'medium' | 'large';
export type IconPosition = 'left' | 'right';

export const DEFAULT_MAX_VISIBLE_CHIPS = 4;

export type ChipIconSize = '16px' | '18px' | '22px';

export const CHIP_ICON_SIZE: Record<ChipSize, ChipIconSize> = {
  small: '16px',
  medium: '18px',
  large: '22px',
};

export const CHIP_LABEL_PADDING = {
  WITH_ICON_LEFT: '4px 8px 4px 4px',
  WITH_ICON_RIGHT: '4px 4px 4px 8px',
  NO_ICON: '4px 8px',
} as const;

export const CHIP_SIZE_CONFIG: Record<
  ChipSize,
  {
    height: number;
    fontSize: string;
    borderRadius: string;
    iconSize: ChipIconSize;
  }
> = {
  small: {
    height: 24,
    fontSize: '12px',
    borderRadius: '6px',
    iconSize: '16px',
  },
  medium: {
    height: 32,
    fontSize: '14px',
    borderRadius: '6px',
    iconSize: '18px',
  },
  large: {
    height: 40,
    fontSize: '16px',
    borderRadius: '6px',
    iconSize: '22px',
  },
};
