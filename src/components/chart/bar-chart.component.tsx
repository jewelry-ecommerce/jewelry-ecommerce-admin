import { Box, Stack, Typography } from "@mui/material";

import { TYPOGRAPHY_STYLES } from "@/common/constant/typography.constant";
import { resolveAxisMax, resolveSeriesColor, type ChartBaseProps } from "@/components/chart/chart.interface";
import { COLOR } from "@/theme/design-tokens";

const VIEWBOX_WIDTH = 640;
const GRIDLINE_COUNT = 4;
const GROUP_GAP_RATIO = 0.3;
const PADDING = { top: 12, right: 12, bottom: 24, left: 12 };

/** Dependency-free grouped SVG bar chart, sharing the axis maths with the line chart. */
export const BarChartComponent = ({ series, labels, height = 220, formatValue = String }: ChartBaseProps) => {
  const axisMax = resolveAxisMax(series);
  const plotWidth = VIEWBOX_WIDTH - PADDING.left - PADDING.right;
  const plotHeight = height - PADDING.top - PADDING.bottom;
  const groupCount = Math.max(labels.length, 1);
  const groupWidth = plotWidth / groupCount;
  const barWidth = (groupWidth * (1 - GROUP_GAP_RATIO)) / Math.max(series.length, 1);

  return (
    <Stack spacing={1} sx={{ width: "100%" }}>
      <Box
        component="svg"
        role="img"
        aria-label={`Bar chart: ${series.map((entry) => entry.name).join(", ")}`}
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${height}`}
        preserveAspectRatio="none"
        sx={{ width: "100%", height, display: "block" }}
      >
        {Array.from({ length: GRIDLINE_COUNT + 1 }, (_, index) => {
          const y = PADDING.top + (index / GRIDLINE_COUNT) * plotHeight;
          return (
            <line
              key={index}
              x1={PADDING.left}
              y1={y}
              x2={VIEWBOX_WIDTH - PADDING.right}
              y2={y}
              stroke={COLOR.NEUTRAL[200]}
              strokeWidth={1}
            />
          );
        })}

        {labels.map((label, groupIndex) =>
          series.map((entry, seriesIndex) => {
            const value = Math.max(0, entry.values[groupIndex] ?? 0);
            const barHeight = (value / axisMax) * plotHeight;
            const groupStart = PADDING.left + groupIndex * groupWidth + (groupWidth * GROUP_GAP_RATIO) / 2;

            return (
              <rect
                key={`${entry.name}-${groupIndex}`}
                x={groupStart + seriesIndex * barWidth}
                y={PADDING.top + plotHeight - barHeight}
                width={Math.max(barWidth - 1, 1)}
                height={barHeight}
                rx={2}
                fill={resolveSeriesColor(entry, seriesIndex)}
              >
                <title>{`${entry.name} · ${label}: ${formatValue(value)}`}</title>
              </rect>
            );
          }),
        )}
      </Box>

      <Stack direction="row" justifyContent="space-between" sx={{ px: `${PADDING.left}px` }}>
        {labels.map((label, index) => (
          <Typography
            key={`${label}-${index}`}
            sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: COLOR.NEUTRAL[400], flex: 1, textAlign: "center", whiteSpace: "nowrap" }}
          >
            {label}
          </Typography>
        ))}
      </Stack>

      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        {series.map((entry, index) => (
          <Stack key={entry.name} direction="row" spacing={0.75} alignItems="center">
            <Box sx={{ width: 8, height: 8, borderRadius: "2px", bgcolor: resolveSeriesColor(entry, index) }} />
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: COLOR.NEUTRAL[600] }}>{entry.name}</Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};
