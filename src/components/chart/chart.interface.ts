import { COLOR } from "@/theme/design-tokens";

export interface ChartSeries {
  name: string;
  values: number[];
  color?: string;
}

export interface ChartBaseProps {
  series: ChartSeries[];
  labels: string[];
  height?: number;
  /** Formats the value shown in the native SVG tooltip. */
  formatValue?: (value: number) => string;
}

/** Fallback palette so a caller can omit `color` and still get distinguishable series. */
export const CHART_PALETTE: string[] = [
  COLOR.BRAND[500],
  COLOR.NEUTRAL[900],
  COLOR.STATUS.infoFg,
  COLOR.STATUS.successFg,
  COLOR.STATUS.warningFg,
];

export const resolveSeriesColor = (series: ChartSeries, index: number): string =>
  series.color ?? CHART_PALETTE[index % CHART_PALETTE.length];

/** Upper bound of the value axis, rounded up so the top gridline is a round number. */
export const resolveAxisMax = (series: ChartSeries[]): number => {
  const highest = series.reduce((max, entry) => Math.max(max, ...entry.values, 0), 0);
  if (highest <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(highest));
  return Math.ceil(highest / magnitude) * magnitude;
};
