import { Box, Link, Paper, Stack, Typography } from '@mui/material';
import { CheckCircleBroken } from '@untitledui/icons';
import type { IRefundProposalTimelineEntry } from '../../../../apis/refund-proposal';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { splitDateTimeForTimeline } from '../refund-proposal-detail.helpers';

const cardSx = {
  p: { xs: 2, md: 2.5 },
  borderRadius: '12px',
  border: '1px solid #EAECF0',
  bgcolor: '#FFFFFF',
  boxShadow: 'none',
} as const;

const TIMELINE_THEME = {
  completed: { dot: '#16A34A', stem: '#D1FAE5', titleColor: '#101828' },
  current: { dot: '#F59E0B', stem: '#FDE68A', titleColor: '#101828' },
  pending: { dot: '#D1D5DB', stem: '#E5E7EB', titleColor: '#6B7280' },
} as const;

interface Props {
  entries: IRefundProposalTimelineEntry[];
}

export function RefundProposalDetailTimelineCard({ entries }: Props) {
  return (
    <Paper sx={cardSx}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.semibold, color: '#101828', mb: 2 }}>Timeline xử lý</Typography>

      {entries.length === 0 ? (
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>Chưa có dữ liệu xử lý.</Typography>
      ) : (
        <Stack>
          {entries.map((entry, index) => {
            const theme = TIMELINE_THEME[entry.state ?? 'completed'];
            const isLast = index === entries.length - 1;
            const { date, time } = splitDateTimeForTimeline(entry.occurredAt);
            return (
              <Stack key={entry.id ?? `${entry.occurredAt}-${index}`} direction="row" spacing={1.5} alignItems="stretch">
                <Stack alignItems="center" sx={{ width: 22, flexShrink: 0 }}>
                  <Box
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: theme.stem,
                      color: theme.dot,
                    }}
                  >
                    <CheckCircleBroken size={14} />
                  </Box>
                  {!isLast ? <Box sx={{ flex: 1, width: 1.5, bgcolor: '#E5E7EB', my: 0.5 }} /> : null}
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ flex: 1, pb: isLast ? 0 : 2.25 }}>
                  <Box sx={{ minWidth: 0, pr: 1 }}>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: theme.titleColor }}>{entry.title}</Typography>
                    {entry.evidenceUrl ? (
                      <Link href={entry.evidenceUrl} target="_blank" rel="noopener noreferrer" underline="none" sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#155DFC', cursor: 'pointer' }}>
                        {entry.evidenceLabel || 'Xem bằng chứng giao hàng'}
                      </Link>
                    ) : null}
                    {entry.description ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280', mt: 0.25 }}>{entry.description}</Typography> : null}
                  </Box>
                  <Stack alignItems="flex-end" sx={{ flexShrink: 0 }}>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>{date}</Typography>
                    {time ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>{time}</Typography> : null}
                  </Stack>
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
}
