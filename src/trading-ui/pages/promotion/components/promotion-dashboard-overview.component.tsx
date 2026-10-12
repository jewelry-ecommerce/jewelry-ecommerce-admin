import React from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { CampaignOutlined, EditNoteOutlined, HistoryToggleOffOutlined, PlayCircleOutlineOutlined } from '@mui/icons-material';
import { TYPOGRAPHY_STYLES } from '../../../common/constant/typography.constant';
import { StackAlignJustCenter, StackRow, StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../../components/styled';

const PROMOTION_CHART_COLORS = {
  statusConfirmed: '#175CD3',
  statusDraft: '#F79009',
  statusLive: '#12B76A',
  budgetBar: '#528BFF',
  budgetBarHover: '#175CD3',
} as const;

const BUDGET_CHART_DATA = [
  { day: 'T2', amount: 15 },
  { day: 'T3', amount: 28 },
  { day: 'T4', amount: 12 },
  { day: 'T5', amount: 45 },
  { day: 'T6', amount: 30 },
  { day: 'T7', amount: 62 },
  { day: 'CN', amount: 75 },
] as const;

interface PromotionDashboardOverviewProps {
  total: number;
  confirmedCount: number;
  draftEditingCount: number;
  liveCount: number;
}

const MiniTrendline: React.FC<{ data: number[]; color?: string }> = ({ data, color = '#101828' }) => {
  const gradId = React.useId();
  if (data.length === 0) return null;
  const width = 100;
  const height = 36;
  const padding = 2;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min === 0 ? 1 : max - min;

  const points = data.map((val, index) => {
    const x = padding + (index * (width - padding * 2)) / (data.length - 1);
    const y = height - padding - ((val - min) * (height - padding * 2)) / range;
    return { x, y };
  });

  const pathD = points.reduce((acc, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const prev = points[index - 1];
    const cpX1 = prev.x + (point.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (point.x - prev.x) / 2;
    const cpY2 = point.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${point.x} ${point.y}`;
  }, '');

  const fillD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;


  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.12" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#${gradId})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const DonutChartSVG: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  const size = 156;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  let cumulativeLength = 0;

  return (
    <StackRowAlignCenter gap={3.5} sx={{ py: 0.5 }}>
      <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={center} cy={center} r={radius} fill="transparent" stroke="#F2F4F7" strokeWidth={strokeWidth} />
          {total > 0
            ? data.map((item, index) => {
                if (item.value === 0) return null;
                const strokeLength = (item.value / total) * circumference;
                const segment = (
                  <circle
                    key={index}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${strokeLength} ${circumference - strokeLength}`}
                    strokeDashoffset={-cumulativeLength}
                    strokeLinecap="round"
                  />
                );
                cumulativeLength += strokeLength;
                return segment;
              })
            : null}
        </svg>
        <StackAlignJustCenter sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES['2xl'].bold, color: '#101828', lineHeight: 1 }}>{total}</Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#667085', mt: 0.5 }}>Chương trình</Typography>
        </StackAlignJustCenter>
      </Box>

      <Stack spacing={1.5} sx={{ flex: 1, width: '100%', minWidth: 180 }}>
        {data.map((item, index) => {
          const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <StackRowAlignCenterJustBetween key={index} gap={2}>
              <StackRowAlignCenter gap={1.25}>
                <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: item.color, flexShrink: 0 }} />
                <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#475467' }}>{item.label}</Typography>
              </StackRowAlignCenter>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828', whiteSpace: 'nowrap' }}>
                {item.value}{' '}
                <Box component="span" sx={{ fontWeight: 400, color: '#667085', fontSize: 12 }}>
                  ({percentage}%)
                </Box>
              </Typography>
            </StackRowAlignCenterJustBetween>
          );
        })}
      </Stack>
    </StackRowAlignCenter>
  );
};

const BudgetBarChartSVG: React.FC<{ data: { day: string; amount: number }[] }> = ({ data }) => {
  const width = 420;
  const height = 176;
  const paddingLeft = 40;
  const paddingBottom = 28;
  const paddingTop = 28;
  const paddingRight = 32;
  const maxVal = Math.max(...data.map((item) => item.amount), 10);
  const chartHeight = height - paddingTop - paddingBottom;
  const chartWidth = width - paddingLeft - paddingRight;
  const barWidth = 24;
  const gap = data.length > 1 ? (chartWidth - barWidth * data.length) / (data.length - 1) : 0;
  const gradId = React.useId();

  return (
    <Box sx={{ width: '100%', pt: 0.5, overflow: 'visible' }}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ overflow: 'visible', display: 'block' }}>
        <defs>
          <linearGradient id={`${gradId}-bar`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PROMOTION_CHART_COLORS.budgetBar} />
            <stop offset="100%" stopColor={PROMOTION_CHART_COLORS.budgetBarHover} />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const y = paddingTop + chartHeight * (1 - ratio);
          const value = Math.round(maxVal * ratio);
          return (
            <g key={index}>
              <text x={paddingLeft - 10} y={y + 4} textAnchor="end" fill="#94A3B8" style={{ fontSize: 12, fontWeight: 500, fontFamily: 'inherit' }}>
                {value}M
              </text>
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#EAECF0" strokeWidth="1" />
            </g>
          );
        })}

        {data.map((item, index) => {
          const x = paddingLeft + index * (barWidth + gap);
          const barHeight = (item.amount / maxVal) * chartHeight;
          const y = height - paddingBottom - barHeight;
          const labelY = Math.max(y - 8, paddingTop + 12);

          return (
            <g key={index}>
              <rect x={x} y={y} width={barWidth} height={Math.max(barHeight, 3)} rx="6" ry="6" fill={`url(#${gradId}-bar)`} />
              <text x={x + barWidth / 2} y={labelY} textAnchor="middle" fill={PROMOTION_CHART_COLORS.budgetBarHover} style={{ fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
                {item.amount}M
              </text>
              <text x={x + barWidth / 2} y={height - 10} textAnchor="middle" fill="#64748B" style={{ fontSize: 12, fontWeight: 500, fontFamily: 'inherit' }}>
                {item.day}
              </text>
            </g>
          );
        })}
      </svg>
    </Box>
  );
};

export const PromotionDashboardOverview = ({ total, confirmedCount, draftEditingCount, liveCount }: PromotionDashboardOverviewProps) => {
  const cards = [
    {
      title: 'Tổng số chương trình',
      value: total,
      sub: '+3 chương trình mới tuần này',
      subColor: '#039855',
      icon: <CampaignOutlined sx={{ color: '#101828', fontSize: 22 }} />,
      trend: [12, 14, 13, 16, 18, 20, total || 22],
      color: '#101828',
      bgColor: '#F8FAFC',
    },
    {
      title: 'Hoạt động',
      value: liveCount,
      sub: 'Đang áp dụng trên hệ thống',
      subColor: PROMOTION_CHART_COLORS.statusLive,
      icon: <HistoryToggleOffOutlined sx={{ color: PROMOTION_CHART_COLORS.statusLive, fontSize: 22 }} />,
      trend: [20, 21, 22, 22, 23, 24, 24],
      color: PROMOTION_CHART_COLORS.statusLive,
      bgColor: '#ECFDF3',
    },
    {
      title: 'Đã xác nhận',
      value: confirmedCount,
      sub: 'Đủ điều kiện chạy giả lập / phát hành',
      subColor: PROMOTION_CHART_COLORS.statusConfirmed,
      icon: <PlayCircleOutlineOutlined sx={{ color: PROMOTION_CHART_COLORS.statusConfirmed, fontSize: 22 }} />,
      trend: [10, 12, 11, 13, 14, 15, 15],
      color: PROMOTION_CHART_COLORS.statusConfirmed,
      bgColor: '#EFF4FF',
    },
    {
      title: 'Nháp',
      value: draftEditingCount,
      sub: 'Cần cấu hình sản phẩm, khách hàng và hình thức khuyến mãi',
      subColor: PROMOTION_CHART_COLORS.statusDraft,
      icon: <EditNoteOutlined sx={{ color: PROMOTION_CHART_COLORS.statusDraft, fontSize: 22 }} />,
      trend: [6, 5, 4, 6, 5, 4, 4],
      color: PROMOTION_CHART_COLORS.statusDraft,
      bgColor: '#FFFAEB',
    },
  ];

  const donutData = [
    {
      label: 'Đã xác nhận',
      value: confirmedCount,
      color: PROMOTION_CHART_COLORS.statusConfirmed,
    },
    {
      label: 'Nháp',
      value: draftEditingCount,
      color: PROMOTION_CHART_COLORS.statusDraft,
    },
    {
      label: 'Hoạt động',
      value: liveCount,
      color: PROMOTION_CHART_COLORS.statusLive,
    },
  ];

  return (
    <Stack sx={{ flexShrink: 0, gap: 2 }}>
      <StackRow sx={{ width: '100%' }}>
        {cards.map((card, index) => (
          <Paper
            key={index}
            elevation={0}
            sx={{
              flex: 1,
              p: 2.25,
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              bgcolor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.25,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <StackRowAlignCenterJustBetween>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#667085', textTransform: 'uppercase', letterSpacing: 0.5 }}>{card.title}</Typography>
              <StackAlignJustCenter sx={{ width: 36, height: 36, borderRadius: '8px', bgcolor: card.bgColor }}>{card.icon}</StackAlignJustCenter>
            </StackRowAlignCenterJustBetween>

            <StackRowAlignCenterJustBetween sx={{ mt: 1 }}>
              <Box>
                <Typography sx={{ ...TYPOGRAPHY_STYLES['2xl'].bold, color: '#101828', fontSize: 28, lineHeight: 1 }}>{card.value}</Typography>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: card.subColor, mt: 0.75 }}>{card.sub}</Typography>
              </Box>
              <Box sx={{ pr: 0.25 }}>
                <MiniTrendline data={card.trend} color={card.color} />
              </Box>
            </StackRowAlignCenterJustBetween>
          </Paper>
        ))}
      </StackRow>

      <StackRow sx={{ width: '100%' }}>
        <Paper elevation={0} sx={{ flex: 1, p: 2.5, borderRadius: '12px', border: '1px solid #E5E7EB', bgcolor: '#FFFFFF' }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828', mb: 2.5 }}>Tỉ lệ phân bổ trạng thái chương trình</Typography>
          <DonutChartSVG data={donutData} />
        </Paper>

        <Paper elevation={0} sx={{ flex: 1, p: 2.5, borderRadius: '12px', border: '1px solid #E5E7EB', bgcolor: '#FFFFFF', overflow: 'visible' }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828', mb: 2.5 }}>Biến động chiết khấu ngân sách (7 ngày gần nhất)</Typography>
          <BudgetBarChartSVG data={[...BUDGET_CHART_DATA]} />
        </Paper>
      </StackRow>
    </Stack>
  );
};
