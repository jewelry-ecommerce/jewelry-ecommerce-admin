import { type SxProps, type Theme, Typography } from '@mui/material';
import React from 'react';
import { StackRowAlignCenter } from '../styled';
import { SwitchComponent } from './switch.component';
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';

export interface SwitchContentElementProps {
  name?: string;
  content: string;
  value?: boolean;
  onChange?: (event: { target: { name?: string; value: boolean } }) => void;
  sx?: SxProps<Theme>;
  textSx?: SxProps<Theme>;
  disabled?: boolean;
}

export const SwitchContentElement: React.FC<SwitchContentElementProps> = ({ name, content, value = false, onChange, sx = {}, textSx = {}, disabled = false }) => {
  return (
    <StackRowAlignCenter sx={{ gap: 1, ...sx }}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#000', ...textSx }}>{content}</Typography>
      <SwitchComponent name={name} value={value} onChange={onChange} disabled={disabled} />
    </StackRowAlignCenter>
  );
};
