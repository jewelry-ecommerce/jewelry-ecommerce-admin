import { FirstPageRounded, KeyboardArrowDownRounded, KeyboardArrowLeftRounded, KeyboardArrowRightRounded, LastPageRounded } from '@mui/icons-material';
import { Box, IconButton, MenuItem, Select, type SelectChangeEvent, Stack, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';
import { getPaginationTokens } from './data-table.utils';

export type DataTablePaginationSummaryMode = 'inline' | 'total';

interface DataTablePaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions: number[];
  itemLabel: string;
  summaryMode: DataTablePaginationSummaryMode;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  sx?: SxProps<Theme>;
}

const PAGE_NAV_BUTTON_SIZE = 28;

const pageNavButtonSx = {
  width: PAGE_NAV_BUTTON_SIZE,
  height: PAGE_NAV_BUTTON_SIZE,
  flexShrink: 0,
  borderRadius: 1.5,
  border: '1px solid #E5E7EB',
  color: '#475467',
  '&:hover': {
    backgroundColor: '#F8FAFC',
  },
};

const pageTokenButtonSx = (active: boolean) => ({
  minWidth: PAGE_NAV_BUTTON_SIZE,
  height: PAGE_NAV_BUTTON_SIZE,
  px: 1,
  boxSizing: 'border-box' as const,
  flexShrink: 0,
  borderRadius: 1.5,
  border: active ? '1px solid #111827' : '1px solid #E5E7EB',
  backgroundColor: active ? '#111827' : '#FFFFFF',
  color: active ? '#FFFFFF' : '#475467',
  fontSize: 13,
  fontWeight: 700,
  lineHeight: 1,
  whiteSpace: 'nowrap' as const,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: active ? '#111827' : '#F8FAFC',
  },
});

export const DataTablePagination = ({ page, pageSize, totalItems, pageSizeOptions, itemLabel, onPageChange, onPageSizeChange, summaryMode, sx }: DataTablePaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginationTokens = getPaginationTokens(page, totalPages);

  const changePage = (nextPage: number) => {
    const clampedPage = Math.min(Math.max(nextPage, 1), totalPages);
    if (clampedPage !== page) {
      onPageChange(clampedPage);
    }
  };

  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    onPageSizeChange(Number(event.target.value));
  };

  const showTotalSummary = summaryMode === 'total';

  const summaryNode = showTotalSummary ? (
    <Typography
      sx={{
        ...TYPOGRAPHY_STYLES.sm.semibold,
        color: '#101828',
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
      }}
    >
      Tổng cộng: {totalItems.toLocaleString('vi-VN')} {itemLabel}
    </Typography>
  ) : (
    <Box sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085', mr: { xs: 0, md: 1 } }}>
      {totalItems.toLocaleString('vi-VN')} {itemLabel}
    </Box>
  );

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={1.25}
      alignItems={{ xs: 'stretch', md: 'center' }}
      justifyContent={showTotalSummary ? 'space-between' : 'flex-end'}
      sx={[
        {
          px: 3,
          py: 1.5,
          backgroundColor: '#FFFFFF',
          flexShrink: 0,
          width: '100%',
          mt: 'auto',
          borderTop: '1px solid #E5E7EB',
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {showTotalSummary ? summaryNode : null}

      <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'space-between', md: 'flex-end' }} flexWrap="wrap" useFlexGap sx={{ minWidth: 0, maxWidth: '100%' }}>
        {!showTotalSummary ? summaryNode : null}
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          gap={0.5}
          sx={{
            minWidth: 0,
            maxWidth: '100%',
            overflowX: 'auto',
            flexShrink: 1,
            pb: 0.25,
            '&::-webkit-scrollbar': { height: 4 },
            '&::-webkit-scrollbar-thumb': { bgcolor: '#D1D5DB', borderRadius: 2 },
          }}
        >
          <IconButton size="small" sx={pageNavButtonSx} onClick={() => changePage(1)} disabled={page === 1}>
            <FirstPageRounded sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton size="small" sx={pageNavButtonSx} onClick={() => changePage(page - 1)} disabled={page === 1}>
            <KeyboardArrowLeftRounded sx={{ fontSize: 16 }} />
          </IconButton>

          {paginationTokens.map((token, index) =>
            token === 'ellipsis' ? (
              <Box
                key={`ellipsis-${index}`}
                sx={{
                  minWidth: PAGE_NAV_BUTTON_SIZE,
                  height: PAGE_NAV_BUTTON_SIZE,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#98A2B3',
                  ...TYPOGRAPHY_STYLES.base.regular,
                }}
              >
                ...
              </Box>
            ) : (
              <Box key={token} component="button" type="button" onClick={() => changePage(token)} sx={pageTokenButtonSx(page === token)}>
                {token}
              </Box>
            ),
          )}

          <IconButton size="small" sx={pageNavButtonSx} onClick={() => changePage(page + 1)} disabled={page === totalPages}>
            <KeyboardArrowRightRounded sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton size="small" sx={pageNavButtonSx} onClick={() => changePage(totalPages)} disabled={page === totalPages}>
            <LastPageRounded sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>

        <Select
          value={pageSize}
          onChange={handlePageSizeChange}
          size="small"
          IconComponent={KeyboardArrowDownRounded}
          sx={{
            minWidth: 114,
            height: 32,
            flexShrink: 0,
            fontSize: 13,
            borderRadius: 2,
            color: '#111827',
            '& .MuiSelect-select': {
              py: 0.625,
            },
          }}
        >
          {pageSizeOptions.map((option) => (
            <MenuItem key={option} value={option} sx={{ fontSize: 13 }}>
              {option} / trang
            </MenuItem>
          ))}
        </Select>
      </Stack>
    </Stack>
  );
};
