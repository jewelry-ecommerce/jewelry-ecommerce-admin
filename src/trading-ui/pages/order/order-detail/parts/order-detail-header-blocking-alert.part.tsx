import { ErrorOutline } from '@mui/icons-material';
import { Box, Chip, Divider, Stack, Tooltip, Typography } from '@mui/material';
import { AlertTriangle } from '@untitledui/icons';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { ORDER_ERROR_LOG_BADGE_LABEL, type OrderErrorLogEntry } from '../order-detail.helpers';
import {
  ORDER_ERROR_LOG_PALETTE,
  ORDER_ERROR_VALIDATION_CARD_THEME,
  ORDER_ERROR_TOOLTIP_BODY_TITLE,
  PAGE_PADDING_X,
  TOOLTIP_SLOT_PROPS,
  VALIDATION_TOOLTIP_CARD_SX,
} from '../order-detail-header.constants';

function OrderErrorValidationTooltipCard({ entry }: { entry: OrderErrorLogEntry }) {
  const theme = ORDER_ERROR_VALIDATION_CARD_THEME[entry.type];
  const bodyTitle = ORDER_ERROR_TOOLTIP_BODY_TITLE[entry.type];

  return (
    <Box sx={VALIDATION_TOOLTIP_CARD_SX}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, mb: 2 }}>Tình trạng kiểm tra</Typography>
      <Stack direction="row" gap={1} alignItems="flex-start">
        <Box
          sx={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            bgcolor: theme.iconCircleBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <AlertTriangle color="#E17100" size={12} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ color: theme.bodyTitleColor, ...TYPOGRAPHY_STYLES.sm.medium, mb: 0.5 }}>{bodyTitle}</Typography>
          <Typography sx={{ color: theme.descriptionColor, ...TYPOGRAPHY_STYLES.sm.regular }}>{entry.message}</Typography>
        </Box>
      </Stack>
      <Divider sx={{ my: 1.5, borderColor: '#F1F5F9' }} />
      <Stack direction="row" gap={1} alignItems="center">
        <AlertTriangle color="#E17100" size={14} />
        <Typography sx={{ color: '#EA580C', ...TYPOGRAPHY_STYLES.sm.medium }}>Kiểm tra trước khi xác nhận</Typography>
      </Stack>
    </Box>
  );
}

export function HeaderBlockingAlert({ blockingErrorEntries = [] }: { blockingErrorEntries?: OrderErrorLogEntry[] }) {
  const blockingIssueCount = blockingErrorEntries.length;
  if (blockingIssueCount <= 0) return null;

  return (
    <Box sx={{ px: PAGE_PADDING_X, py: 1.5, bgcolor: '#FEF3F2', borderTop: '1px solid #FEE4E2' }}>
      <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" useFlexGap>
        <ErrorOutline sx={{ fontSize: 16, color: '#F04438', flexShrink: 0 }} />
        <Typography sx={{ color: '#B42318', ...TYPOGRAPHY_STYLES.base.medium, flexShrink: 0 }}>{blockingIssueCount} lỗi chặn xác nhận</Typography>
        {blockingErrorEntries.map((entry, index) => {
          const pal = ORDER_ERROR_LOG_PALETTE[entry.type];
          const badgeLabel = ORDER_ERROR_LOG_BADGE_LABEL[entry.type];
          return (
            <Tooltip key={`${entry.rawKey}-${index}`} title={<OrderErrorValidationTooltipCard entry={entry} />} placement="bottom-start" enterDelay={300} arrow={false} slotProps={TOOLTIP_SLOT_PROPS}>
              <Chip
                label={badgeLabel}
                size="small"
                sx={{
                  height: 28,
                  borderRadius: '999px',
                  bgcolor: pal.chipBg,
                  border: `1px solid ${pal.chipBorder}`,
                  color: pal.chipColor,
                  ...TYPOGRAPHY_STYLES.sm.medium,
                  maxWidth: { xs: '100%', sm: 280 },
                  '& .MuiChip-label': { px: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
                }}
              />
            </Tooltip>
          );
        })}
      </Stack>
    </Box>
  );
}
