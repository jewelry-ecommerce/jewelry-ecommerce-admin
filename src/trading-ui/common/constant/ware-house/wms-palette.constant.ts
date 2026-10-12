import type { StatusPillVariant } from '../../../components/status-pill';

/**
 * WMS Status Pill Palette — 8 named trios.
 * Each trio = { text, bg, outline } covers one semantic slot used across all WMS entities.
 *
 * Usage map:
 *   blue   → Pending / Scheduled / Chờ xử lý
 *   amber  → In Progress / Đang thực hiện / Fast priority
 *   yellow → PendingCounting / Express priority (saturated yellow, higher urgency than amber)
 *   green  → Completed / Approved / Shipped / Hoàn thành
 *   red    → Exception / Error / Force Close / Hard cancel
 *   cyan   → Picked / Received partial / InProgress scan
 *   violet → Packed / Pending approval / Diamond zone
 *   gray   → Cancelled / Draft / Neutral / Inactive
 */

export type WmsPillTrio = { readonly text: string; readonly bg: string; readonly outline: string };

export const WMS_PILL_TRIOS = {
  blue: { text: '#175CD3', bg: '#EFF8FF', outline: '#B2DDFF' },
  amber: { text: '#B54708', bg: '#FFFAEB', outline: '#FEDF89' },
  yellow: { text: '#A16207', bg: '#FEF9C3', outline: '#FDE047' },
  green: { text: '#027A48', bg: '#ECFDF3', outline: '#A6F4C5' },
  red: { text: '#B42318', bg: '#FEF3F2', outline: '#FECDCA' },
  cyan: { text: '#0E7490', bg: '#ECFEFF', outline: '#A5F3FC' },
  violet: { text: '#5B21B6', bg: '#F5F3FF', outline: '#DDD6FE' },
  gray: { text: '#475467', bg: '#F2F4F7', outline: '#EAECF0' },
  pink: { text: '#D61C4E', bg: '#FFDBDB', outline: '#FF94B5' },
} as const;

/** Solid signal colors — for icons, inline text indicators, QC results. Not for pill backgrounds. */
export const WMS_SIGNAL = {
  success: '#027A48',
  error: '#B42318',
  warning: '#B54708',
  info: '#175CD3',
  neutral: '#475467',
} as const;

/** Solid accent border colors for left-border step banners (PDA scan step UI). */
export const WMS_ACCENT_BORDER = {
  amber: '#F59E0B',
  blue: '#2563EB',
} as const;

export const WMS_COMMON = {
  deep_blue: '#1F2937',
  gray_label: '#6B7280',
} as const;

/**
 * Convert a trio → MUI SxProps for a default (non-outlined) Chip / Box.
 * Sets full `border` shorthand so the border always shows.
 */
export const pillToChipSx = (trio: WmsPillTrio) =>
  ({
    bgcolor: trio.bg,
    color: trio.text,
    border: `1px solid ${trio.outline}`,
    fontWeight: 600,
  }) as const;

/**
 * Convert a trio → MUI SxProps for a `variant="outlined"` Chip.
 * Only overrides borderColor; width/style come from the Chip's own styling.
 */
export const pillToChipSxOutlined = (trio: WmsPillTrio) =>
  ({
    bgcolor: trio.bg,
    color: trio.text,
    borderColor: trio.outline,
  }) as const;

/** Convert a trio → StatusPillVariant (for the <StatusPill> component). */
export const pillToVariant = (trio: WmsPillTrio, label: string): StatusPillVariant => ({
  color: trio.text,
  backgroundColor: trio.bg,
  borderColor: trio.outline,
  label,
});
