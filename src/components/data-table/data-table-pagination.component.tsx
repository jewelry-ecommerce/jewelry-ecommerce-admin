import {
  FirstPageRounded,
  KeyboardArrowDownRounded,
  KeyboardArrowLeftRounded,
  KeyboardArrowRightRounded,
  LastPageRounded,
} from "@mui/icons-material";
import { Box, IconButton, MenuItem, Select, Stack, Typography, type SelectChangeEvent, type SxProps, type Theme } from "@mui/material";

import { PAGE_SIZE_OPTIONS } from "@/common/constant/page-take.constant";
import { TYPOGRAPHY_STYLES } from "@/common/constant/typography.constant";
import { formatNumber } from "@/common/utils/format.util";
import { COLOR } from "@/theme/design-tokens";

const NAV_BUTTON_SIZE = 28;
const MAX_VISIBLE_TOKENS = 7;

type PaginationToken = number | "ellipsis";

/** Compact page list: first, last, and a window around the current page. */
const buildPaginationTokens = (page: number, totalPages: number): PaginationToken[] => {
  if (totalPages <= MAX_VISIBLE_TOKENS) return Array.from({ length: totalPages }, (_, index) => index + 1);

  const tokens: PaginationToken[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) tokens.push("ellipsis");
  for (let current = start; current <= end; current += 1) tokens.push(current);
  if (end < totalPages - 1) tokens.push("ellipsis");
  tokens.push(totalPages);

  return tokens;
};

const navButtonSx: SxProps<Theme> = {
  width: NAV_BUTTON_SIZE,
  height: NAV_BUTTON_SIZE,
  flexShrink: 0,
  borderRadius: 1.5,
  border: `1px solid ${COLOR.NEUTRAL[200]}`,
  color: COLOR.NEUTRAL[600],
  "&:hover": { backgroundColor: COLOR.NEUTRAL[50] },
};

const tokenButtonSx = (active: boolean): SxProps<Theme> => ({
  minWidth: NAV_BUTTON_SIZE,
  height: NAV_BUTTON_SIZE,
  px: 1,
  boxSizing: "border-box",
  flexShrink: 0,
  borderRadius: 1.5,
  border: `1px solid ${active ? COLOR.NEUTRAL[900] : COLOR.NEUTRAL[200]}`,
  backgroundColor: active ? COLOR.NEUTRAL[900] : COLOR.COMMON.white,
  color: active ? COLOR.COMMON.white : COLOR.NEUTRAL[600],
  ...TYPOGRAPHY_STYLES.sm.bold,
  lineHeight: 1,
  cursor: "pointer",
  "&:hover": { backgroundColor: active ? COLOR.NEUTRAL[900] : COLOR.NEUTRAL[50] },
});

export interface DataTablePaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
  itemLabel?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  sx?: SxProps<Theme>;
}

export const DataTablePagination = ({
  page,
  pageSize,
  totalItems,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  itemLabel = "records",
  onPageChange,
  onPageSizeChange,
  sx,
}: DataTablePaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const tokens = buildPaginationTokens(page, totalPages);

  const changePage = (nextPage: number) => {
    const clamped = Math.min(Math.max(nextPage, 1), totalPages);
    if (clamped !== page) onPageChange(clamped);
  };

  const handlePageSizeChange = (event: SelectChangeEvent<number>) => onPageSizeChange(Number(event.target.value));

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={1.25}
      alignItems={{ xs: "stretch", md: "center" }}
      justifyContent="space-between"
      sx={{
        px: 3,
        py: 1.5,
        backgroundColor: COLOR.COMMON.white,
        borderTop: `1px solid ${COLOR.NEUTRAL[200]}`,
        flexShrink: 0,
        width: "100%",
        ...sx,
      }}
    >
      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: COLOR.NEUTRAL[500] }}>
        {formatNumber(totalItems)} {itemLabel}
      </Typography>

      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent={{ xs: "space-between", md: "flex-end" }}
        flexWrap="wrap"
        useFlexGap
      >
        <Stack direction="row" spacing={0.5} alignItems="center" gap={0.5} sx={{ minWidth: 0, overflowX: "auto", pb: 0.25 }}>
          <IconButton size="small" aria-label="First page" sx={navButtonSx} onClick={() => changePage(1)} disabled={page === 1}>
            <FirstPageRounded sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton size="small" aria-label="Previous page" sx={navButtonSx} onClick={() => changePage(page - 1)} disabled={page === 1}>
            <KeyboardArrowLeftRounded sx={{ fontSize: 16 }} />
          </IconButton>

          {tokens.map((token, index) =>
            token === "ellipsis" ? (
              <Box
                key={`ellipsis-${index}`}
                sx={{
                  minWidth: NAV_BUTTON_SIZE,
                  height: NAV_BUTTON_SIZE,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: COLOR.NEUTRAL[400],
                }}
              >
                …
              </Box>
            ) : (
              <Box
                key={token}
                component="button"
                type="button"
                aria-label={`Page ${token}`}
                aria-current={page === token ? "page" : undefined}
                onClick={() => changePage(token)}
                sx={tokenButtonSx(page === token)}
              >
                {token}
              </Box>
            ),
          )}

          <IconButton
            size="small"
            aria-label="Next page"
            sx={navButtonSx}
            onClick={() => changePage(page + 1)}
            disabled={page === totalPages}
          >
            <KeyboardArrowRightRounded sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton
            size="small"
            aria-label="Last page"
            sx={navButtonSx}
            onClick={() => changePage(totalPages)}
            disabled={page === totalPages}
          >
            <LastPageRounded sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>

        <Select
          value={pageSize}
          onChange={handlePageSizeChange}
          size="small"
          aria-label="Rows per page"
          IconComponent={KeyboardArrowDownRounded}
          sx={{ minWidth: 118, height: 32, flexShrink: 0, borderRadius: 2, ...TYPOGRAPHY_STYLES.sm.regular }}
        >
          {pageSizeOptions.map((option) => (
            <MenuItem key={option} value={option} sx={TYPOGRAPHY_STYLES.sm.regular}>
              {option} / page
            </MenuItem>
          ))}
        </Select>
      </Stack>
    </Stack>
  );
};
