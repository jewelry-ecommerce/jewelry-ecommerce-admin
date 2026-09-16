import { Box, Stack, Typography } from "@mui/material";

import { TYPOGRAPHY_STYLES } from "@/common/constant/typography.constant";
import { resolveAxisMax, resolveSeriesColor, type ChartBaseProps } from "@/components/chart/chart.interface";
import { COLOR } from "@/theme/design-tokens";

const VIEWBOX_WIDTH = 640;
const GRIDLINE_COUNT = 4;
const PADDING = { top: 12, right: 12, bottom: 24, left: 12 };

/**
 * Dependency-free SVG line chart. Coordinates are computed in a fixed viewBox and scaled by CSS, so
 * the chart is responsive without a measurement hook or a charting library.
 */
export const LineChartComponent = ({ series, labels, height = 220, formatValue = String }: ChartBaseProps) => {
  const axisMax = resolveAxisMax(series);
  const plotWidth = VIEWBOX_WIDTH - PADDING.left - PADDING.right;
  const plotHeight = height - PADDING.top - PADDING.bottom;
  const pointCount = Math.max(labels.length, 1);

  const xOf = (index: number): number =>
    pointCount === 1 ? PADDING.left + plotWidth / 2 : PADDING.left + (index / (pointCount - 1)) * plotWidth;
  const yOf = (value: number): number => PADDING.top + plotHeight - (Math.max(0, value) / axisMax) * plotHeight;

  return (
    <Stack spacing={1} sx={{ width: "100%" }}>
      <Box
        component="svg"
        role="img"
        aria-label={`Line chart: ${series.map((entry) => entry.name).join(", ")}`}
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

        {series.map((entry, seriesIndex) => {
          const color = resolveSeriesColor(entry, seriesIndex);
          const points = entry.values.map((value, index) => `${xOf(index)},${yOf(value)}`).join(" ");

          return (
            <g key={entry.name}>
              <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              {entry.values.map((value, index) => (
                <circle key={`${entry.name}-${index}`} cx={xOf(index)} cy={yOf(value)} r={2.5} fill={color}>
                  <title>{`${entry.name} · ${labels[index] ?? index}: ${formatValue(value)}`}</title>
                </circle>
              ))}
            </g>
          );
        })}
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
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: resolveSeriesColor(entry, index) }} />
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: COLOR.NEUTRAL[600] }}>{entry.name}</Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};
