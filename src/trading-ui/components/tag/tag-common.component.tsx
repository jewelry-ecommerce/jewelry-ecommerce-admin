import React from 'react';
import { resolveTagHexFromContent } from '../../common/constant/color.constant';
import { TagComponent, type TagComponentProps } from './tag.component';

export interface TagCommonComponentProps extends Omit<TagComponentProps, 'type' | 'variant'> {
  content: string;
  border?: boolean;
  /** Bo tròn dạng pill (giống StatusPill / design POS). */
  pill?: boolean;
}

export const TagCommonComponent: React.FC<TagCommonComponentProps> = ({ content, border = false, pill = false, size = 'small', sx, ...rest }) => {
  return (
    <TagComponent
      type={resolveTagHexFromContent(content)}
      content={content}
      size={size}
      variant={border ? 'outlined-border' : 'outlined'}
      sx={{
        minWidth: 96,
        px: '8px',
        py: '4px',
        boxSizing: 'border-box',
        ...(pill
          ? {
              borderRadius: '999px',
              minWidth: 'auto',
              whiteSpace: 'nowrap',
            }
          : null),
        ...sx,
      }}
      {...rest}
    />
  );
};
