/**
 * Deterministic inline-SVG placeholder generator.
 *
 * The demo has no media service, and remote placeholder hosts cannot be relied on offline, so
 * every mock image is generated locally. Swapping in real CDN URLs later only requires changing
 * the fixture values — no component touches this helper directly.
 */
export type PlaceholderTone = "gold" | "ivory" | "charcoal" | "blush" | "sage";

const TONE_PALETTE: Record<PlaceholderTone, { from: string; to: string; ink: string }> = {
  gold: { from: "#F4E7CB", to: "#DCB973", ink: "#6B4E1C" },
  ivory: { from: "#FBF9F5", to: "#EFE9DE", ink: "#8A7C66" },
  charcoal: { from: "#3A3D42", to: "#1B1F22", ink: "#E9D2A0" },
  blush: { from: "#F9EDEA", to: "#E8CFC8", ink: "#8C5F55" },
  sage: { from: "#EDF2EC", to: "#CFDBCB", ink: "#4F6350" },
};

const TONE_ORDER: PlaceholderTone[] = ["gold", "ivory", "charcoal", "blush", "sage"];

const hashString = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
};

const escapeXml = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

const toDataUri = (svg: string): string => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}`;

export type PlaceholderOptions = {
  label: string;
  /** Short caption under the label, e.g. a SKU code. */
  caption?: string;
  width?: number;
  height?: number;
  tone?: PlaceholderTone;
};

/** Builds a self-contained SVG data URI. Safe in `next/image` (unoptimized) and `<img>`. */
export const buildPlaceholderImage = ({ label, caption, width = 800, height = 800, tone }: PlaceholderOptions): string => {
  const resolvedTone = tone ?? TONE_ORDER[hashString(label) % TONE_ORDER.length];
  const palette = TONE_PALETTE[resolvedTone];
  const gradientId = `g${hashString(`${label}-${resolvedTone}`)}`;
  const initials = escapeXml(
    label
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join(""),
  );

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">
      <defs>
        <linearGradient id="${gradientId}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${palette.from}" />
          <stop offset="100%" stop-color="${palette.to}" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#${gradientId})" />
      <circle cx="${width / 2}" cy="${height * 0.42}" r="${Math.min(width, height) * 0.17}" fill="none" stroke="${palette.ink}" stroke-width="2" stroke-opacity="0.55" />
      <circle cx="${width / 2}" cy="${height * 0.42}" r="${Math.min(width, height) * 0.075}" fill="${palette.ink}" fill-opacity="0.18" />
      <text x="50%" y="${height * 0.44}" text-anchor="middle" font-family="Georgia, serif" font-size="${Math.min(width, height) * 0.09}" fill="${palette.ink}" fill-opacity="0.8">${initials}</text>
      <text x="50%" y="${height * 0.73}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${Math.min(width, height) * 0.042}" letter-spacing="1.5" fill="${palette.ink}">${escapeXml(label.toUpperCase())}</text>
      ${caption ? `<text x="50%" y="${height * 0.79}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${Math.min(width, height) * 0.03}" fill="${palette.ink}" fill-opacity="0.7">${escapeXml(caption)}</text>` : ""}
    </svg>`;

  return toDataUri(svg);
};

/** Wide banner variant used by hero and promotional blocks. */
export const buildBannerImage = (label: string, tone?: PlaceholderTone, caption?: string): string =>
  buildPlaceholderImage({ label, caption, width: 1600, height: 640, tone });

/** Square avatar/thumbnail variant. */
export const buildThumbImage = (label: string, tone?: PlaceholderTone): string =>
  buildPlaceholderImage({ label, width: 240, height: 240, tone });
