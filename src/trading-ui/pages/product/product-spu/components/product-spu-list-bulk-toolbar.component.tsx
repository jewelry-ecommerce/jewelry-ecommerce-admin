import { Box, Stack, Typography } from '@mui/material';
import { Fragment, type ReactNode } from 'react';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { CustomButton } from '../../../../components/button';
import { CheckboxComponent } from '../../../../components/check-box/check-box.element';
import { StackRowAlignCenter } from '../../../../components/styled';
import type { PageButtonPermissionProps } from '../../../../permissions/page-button-permission.utils';

export type ProductSpuListBulkToolbarAction = {
  id: string;
  label: string;
  icon: ReactNode;
  /** Màu chữ + icon */
  color: string;
  onClick: () => void;
  disabled?: boolean;
  permission?: PageButtonPermissionProps;
};

export interface ProductSpuListBulkToolbarSegment {
  id: string;
  checkboxChecked: boolean;
  checkboxIndeterminate: boolean;
  onSelectAllChange: (checked: boolean) => void;
  title: string;
  titleTooltip?: string;
  selectedCount: number;
  actions: readonly ProductSpuListBulkToolbarAction[];
}

export interface ProductSpuListBulkToolbarProps {
  primarySegments: readonly ProductSpuListBulkToolbarSegment[];
  secondarySegments?: readonly ProductSpuListBulkToolbarSegment[];
}

const verticalRuleSx = { width: '1px', height: 28, bgcolor: '#E5E7EB', flexShrink: 0, alignSelf: 'center' } as const;

const BulkIconTextButton = ({
  label,
  icon,
  color,
  disabled,
  onClick,
  permission,
}: {
  label: string;
  icon: ReactNode;
  color: string;
  disabled?: boolean;
  onClick: () => void;
  permission?: PageButtonPermissionProps;
}) => (
  <CustomButton
    type="button"
    variant="outline"
    fullWidth={false}
    disabled={disabled}
    onClick={onClick}
    {...permission}
    sx={{
      border: 'none',
      bgcolor: 'transparent',
      p: '4px 8px',
      minWidth: 0,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.75,
      color,
      fontSize: 14,
      fontWeight: 500,
      lineHeight: 1.25,
      borderRadius: '8px',
      boxShadow: 'none',
      '&:hover': {
        bgcolor: disabled ? 'transparent' : 'rgba(16, 24, 40, 0.04)',
        border: 'none',
      },
    }}
  >
    <Box sx={{ display: 'inline-flex', lineHeight: 0, flexShrink: 0, color: 'inherit' }}>{icon}</Box>
    {label}
  </CustomButton>
);

const BulkToolbarSegment = ({ segment }: { segment: ProductSpuListBulkToolbarSegment }) => (
  <StackRowAlignCenter gap={1.5} sx={{ flexWrap: 'wrap', alignItems: 'center', minWidth: 0 }}>
    <StackRowAlignCenter gap={1} sx={{ minWidth: 0 }}>
      <CheckboxComponent
        size="medium"
        checked={segment.checkboxChecked}
        indeterminate={segment.checkboxIndeterminate}
        isSameButton
        onChange={(_, next) => segment.onSelectAllChange(next)}
        sx={{ p: 0 }}
      />
      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#333333' }} noWrap title={segment.titleTooltip}>
        {segment.title} ({segment.selectedCount})
      </Typography>
    </StackRowAlignCenter>
    <StackRowAlignCenter gap={0.5} sx={{ flexWrap: 'wrap' }}>
      {segment.actions.map((a) => (
        <BulkIconTextButton key={a.id} label={a.label} icon={a.icon} color={a.color} disabled={a.disabled} onClick={a.onClick} permission={a.permission} />
      ))}
    </StackRowAlignCenter>
  </StackRowAlignCenter>
);

const renderSegmentRow = (segments: readonly ProductSpuListBulkToolbarSegment[], withTopBorder: boolean) => (
  <StackRowAlignCenter
    sx={{
      flexWrap: 'wrap',
      alignItems: 'center',
      columnGap: 2,
      rowGap: 1.25,
      ...(withTopBorder ? { pt: 0.5, borderTop: '1px solid #F2F4F7' } : {}),
    }}
  >
    {segments.map((seg, idx) => (
      <Fragment key={seg.id}>
        {idx > 0 ? <Box sx={verticalRuleSx} /> : null}
        <BulkToolbarSegment segment={seg} />
      </Fragment>
    ))}
  </StackRowAlignCenter>
);

export const ProductSpuListBulkToolbar = ({ primarySegments, secondarySegments }: ProductSpuListBulkToolbarProps) => (
  <Box
    sx={{
      p: '0 8px',
      border: '1px solid #E5E7EB',
      bgcolor: '#FFFFFF',
      borderRadius: '10px',
    }}
  >
    <Stack gap={1.25}>
      {renderSegmentRow(primarySegments, false)}
      {secondarySegments && secondarySegments.length > 0 ? renderSegmentRow(secondarySegments, true) : null}
    </Stack>
  </Box>
);
