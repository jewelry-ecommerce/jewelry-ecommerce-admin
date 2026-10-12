import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import { HelpCircle } from '@untitledui/icons';
import type { ReactNode } from 'react';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { StackRowAlignCenter } from '../../../../components/styled/stack.style';
import { TooltipOnHoverComponent } from '../../../../components/tooltip/tooltip-on-hover.component';
import { formatStatisticsPercent, getStatisticsProgressColor } from '../pre-order-campaign-statistics.constants';

export const StatisticsColumnHeader = ({ label, tooltip }: { label: string; tooltip?: string }) => (
  <StackRowAlignCenter sx={{ gap: 0.5, flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
    <Typography component="span" sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#475467', whiteSpace: 'nowrap' }}>
      {label}
    </Typography>
    {tooltip ? (
      <TooltipOnHoverComponent content={tooltip} placement="top">
        <Box component="span" sx={{ display: 'inline-flex', cursor: 'help', color: '#98A2B3', lineHeight: 0 }}>
          <HelpCircle size={14} color="currentColor" />
        </Box>
      </TooltipOnHoverComponent>
    ) : null}
  </StackRowAlignCenter>
);

export const StatisticsProgressBar = ({
  percent,
  showLabel = true,
  height = 20,
  trackColor = '#EFF8FF',
}: {
  percent: number | null | undefined;
  showLabel?: boolean;
  height?: number;
  trackColor?: string;
}) => {
  const value = percent == null || Number.isNaN(percent) ? 0 : Math.max(0, Math.min(100, percent));
  const color = getStatisticsProgressColor(percent);

  return (
    <StackRowAlignCenter sx={{ gap: 1.5, width: '100%', minWidth: 0 }}>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          flex: 1,
          minWidth: 0,
          height,
          borderRadius: 999,
          bgcolor: trackColor,
          '& .MuiLinearProgress-bar': {
            borderRadius: 999,
            bgcolor: color,
          },
        }}
      />
      {showLabel ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#344054', minWidth: 40, flexShrink: 0, textAlign: 'right' }}>{formatStatisticsPercent(percent)}</Typography> : null}
    </StackRowAlignCenter>
  );
};

export type StatisticsKpiTone = 'green' | 'purple' | 'orange' | 'blue';

const KPI_TONE_SX: Record<StatisticsKpiTone, { bg: string; border: string; value: string }> = {
  green: { bg: '#ECFDF3', border: '#A6F4C5', value: '#039855' },
  purple: { bg: '#FDF2FA', border: '#FCCEEE', value: '#C11574' },
  orange: { bg: '#FFFAEB', border: '#FEDF89', value: '#DC6803' },
  blue: { bg: '#EFF8FF', border: '#B2DDFF', value: '#175CD3' },
};

export const StatisticsKpiCard = ({ tone, icon, label, tooltip, value, unit }: { tone: StatisticsKpiTone; icon: ReactNode; label: string; tooltip?: string; value: string; unit: string }) => {
  const palette = KPI_TONE_SX[tone];

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        p: '16px',
        borderRadius: '12px',
        border: `1px solid ${palette.border}`,
        bgcolor: palette.bg,
      }}
    >
      <Stack direction="row" alignItems="center" sx={{ gap: '12px', minWidth: 0 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '8px',
            bgcolor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: palette.value,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Stack sx={{ minWidth: 0, gap: '2px', justifyContent: 'center' }}>
          <Stack direction="row" alignItems="center" sx={{ gap: '4px', minWidth: 0 }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#101828', lineHeight: 1.3 }} noWrap>
              {label}
            </Typography>
            {tooltip ? (
              <TooltipOnHoverComponent content={tooltip} placement="top">
                <Box component="span" sx={{ display: 'inline-flex', cursor: 'help', color: '#98A2B3', lineHeight: 0, flexShrink: 0 }}>
                  <HelpCircle size={14} color="currentColor" />
                </Box>
              </TooltipOnHoverComponent>
            ) : null}
          </Stack>
          <Stack direction="row" alignItems="baseline" sx={{ gap: '6px', flexWrap: 'wrap' }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.xl.bold, color: palette.value, lineHeight: 1.2 }}>{value}</Typography>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: 'rgba(107, 114, 128, 1)', lineHeight: 1.2 }}>{unit}</Typography>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};
