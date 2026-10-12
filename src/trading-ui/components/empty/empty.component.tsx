import { type SxProps, type Theme } from '@mui/material';
import React from 'react';
import { PageStateComponent, type PageStateVariant } from './page-state.component';

export interface EmptyComponentProps {
  content?: string;
  sxContent?: SxProps<Theme>;
  variant?: PageStateVariant;
  title?: string;
  description?: string;
}

export const EmptyComponent: React.FC<EmptyComponentProps> = ({ content = 'Không có dữ liệu', sxContent, variant = 'empty', title, description }) => {
  return <PageStateComponent variant={variant} title={title || content} description={description} sx={{ minHeight: '100%', ...sxContent }} />;
};
