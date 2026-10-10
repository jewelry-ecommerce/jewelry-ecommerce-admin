import { Typography } from '@mui/material';
import { Star01 } from '@untitledui/icons';
import type { ReactNode } from 'react';
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';
import { SwitchContentElement } from './switch-content.element';
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../styled';

export const HIGHLIGHT_STATUS_TOGGLE_SX = {
  border: '1px solid #EAB308',
  bgcolor: '#FEFCE8',
  borderRadius: '10px',
  p: 2,
} as const;

export const HIGHLIGHT_STATUS_LABEL_COLOR = '#CA8A04';

type HighlightStatusToggleProps = {
  readonly label: string;
  readonly checked: boolean;
  readonly onCheckedChange?: (checked: boolean) => void;
  readonly disabled?: boolean;
  readonly name?: string;
  readonly readOnly?: boolean;
  readonly statusLabel?: string;
  readonly activeLabel?: string;
  readonly inactiveLabel?: string;
  readonly icon?: ReactNode | null;
};

export const HighlightStatusToggle = ({
  label,
  checked,
  onCheckedChange,
  disabled = false,
  name = 'status',
  readOnly = false,
  statusLabel,
  activeLabel = 'Kích hoạt',
  inactiveLabel = 'Vô hiệu hóa',
  icon = <Star01 color={HIGHLIGHT_STATUS_LABEL_COLOR} size={16} />,
}: HighlightStatusToggleProps) => {
  const switchLabel = checked ? activeLabel : inactiveLabel;

  return (
    <StackRowAlignCenterJustBetween sx={HIGHLIGHT_STATUS_TOGGLE_SX}>
      <StackRowAlignCenter sx={{ gap: 1 }}>
        {icon ? icon : null}
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: HIGHLIGHT_STATUS_LABEL_COLOR }}>{label}</Typography>
      </StackRowAlignCenter>
      <StackRowAlignCenter gap={1} sx={{ maxHeight: '21px' }}>
        {readOnly ? (
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: HIGHLIGHT_STATUS_LABEL_COLOR }}>{statusLabel ?? switchLabel}</Typography>
        ) : (
          <SwitchContentElement content={switchLabel} value={checked} name={name} disabled={disabled} onChange={(event) => onCheckedChange?.(Boolean(event?.target?.value))} />
        )}
      </StackRowAlignCenter>
    </StackRowAlignCenterJustBetween>
  );
};
