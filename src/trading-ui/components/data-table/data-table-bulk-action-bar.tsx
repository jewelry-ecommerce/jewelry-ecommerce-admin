import { Box, Stack, Typography, type SxProps, type Theme } from '@mui/material';
import type { ReactNode } from 'react';
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';
import { CheckboxComponent } from '../check-box/check-box.element';

interface DataTableBulkActionBarProps {
  /** Số dòng selectable trên trang hiện tại (hiển thị trong "Chọn tất cả (N)"). */
  selectableCount: number;
  selectedCount: number;
  allSelected: boolean;
  indeterminate?: boolean;
  onToggleAll: (checked: boolean) => void;
  /** Nút thao tác bulk (Gửi ZNS, Export selected, …). */
  children?: ReactNode;
  sx?: SxProps<Theme>;
}

/** Card chọn tất cả + bulk actions — tách khỏi filter/search, có padding riêng. */
export const DataTableBulkActionBar = ({ selectableCount, selectedCount, allSelected, indeterminate = false, onToggleAll, children, sx }: DataTableBulkActionBarProps) => (
  <Box
    sx={{
      p: '12px 16px',
      border: '1px solid #E5E7EB',
      bgcolor: '#FFFFFF',
      borderRadius: '10px',
      flexShrink: 0,
      ...sx,
    }}
  >
    <Stack direction="row" alignItems="center" gap={2} useFlexGap flexWrap="wrap">
      <Stack direction="row" alignItems="center" gap={1.5}>
        <CheckboxComponent
          size="medium"
          checked={allSelected}
          indeterminate={indeterminate}
          isSameButton
          disabled={selectableCount === 0}
          onChange={(_, next) => onToggleAll(Boolean(next))}
          sx={{ p: 0 }}
        />
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#333333' }}>Chọn tất cả ({selectableCount})</Typography>
      </Stack>

      {selectedCount > 0 ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>Đã chọn {selectedCount}</Typography> : null}

      {children ? (
        <>
          <Box sx={{ width: '1px', height: 32, bgcolor: '#E5E7EB', display: { xs: 'none', sm: 'block' } }} />
          <Stack direction="row" alignItems="center" gap={1} useFlexGap flexWrap="wrap">
            {children}
          </Stack>
        </>
      ) : null}
    </Stack>
  </Box>
);
