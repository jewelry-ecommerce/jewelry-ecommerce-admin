/**
 * Typography scale. Same shape and values as the storefront constant
 * (`jewelry-commerce-client/src/utils/constants/typography.constant.ts`): ten steps × four weights,
 * so a style can move between the two applications unchanged. Spread these tokens into `sx` instead
 * of writing raw font values.
 */
type FontWeightKey = "regular" | "medium" | "semiBold" | "bold";
type FontWeightValue = 400 | 500 | 600 | 700;

type TypographyToken = {
  fontSize: string;
  lineHeight: string;
};

export type TypographyStyle = {
  fontWeight: FontWeightValue;
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
};

const FONT_WEIGHTS: Record<FontWeightKey, FontWeightValue> = {
  regular: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
};

const LINE_HEIGHT = "150%";
const LETTER_SPACING = "0%";

const TYPOGRAPHY_TOKENS = {
  "5xl": { fontSize: "48px", lineHeight: LINE_HEIGHT },
  "4xl": { fontSize: "32px", lineHeight: LINE_HEIGHT },
  "3xl": { fontSize: "28px", lineHeight: LINE_HEIGHT },
  "2xl": { fontSize: "24px", lineHeight: LINE_HEIGHT },
  xl: { fontSize: "20px", lineHeight: LINE_HEIGHT },
  lg: { fontSize: "18px", lineHeight: LINE_HEIGHT },
  md: { fontSize: "16px", lineHeight: LINE_HEIGHT },
  base: { fontSize: "14px", lineHeight: LINE_HEIGHT },
  sm: { fontSize: "12px", lineHeight: LINE_HEIGHT },
  xs: { fontSize: "10px", lineHeight: LINE_HEIGHT },
} as const satisfies Record<string, TypographyToken>;

export type TypographyScaleKey = keyof typeof TYPOGRAPHY_TOKENS;

const buildTypographyLevel = ({ fontSize, lineHeight }: TypographyToken): Record<FontWeightKey, TypographyStyle> => ({
  regular: { fontWeight: FONT_WEIGHTS.regular, fontSize, lineHeight, letterSpacing: LETTER_SPACING },
  medium: { fontWeight: FONT_WEIGHTS.medium, fontSize, lineHeight, letterSpacing: LETTER_SPACING },
  semiBold: { fontWeight: FONT_WEIGHTS.semiBold, fontSize, lineHeight, letterSpacing: LETTER_SPACING },
  bold: { fontWeight: FONT_WEIGHTS.bold, fontSize, lineHeight, letterSpacing: LETTER_SPACING },
});

export const TYPOGRAPHY_STYLES: Record<TypographyScaleKey, Record<FontWeightKey, TypographyStyle>> = {
  "5xl": buildTypographyLevel(TYPOGRAPHY_TOKENS["5xl"]),
  "4xl": buildTypographyLevel(TYPOGRAPHY_TOKENS["4xl"]),
  "3xl": buildTypographyLevel(TYPOGRAPHY_TOKENS["3xl"]),
  "2xl": buildTypographyLevel(TYPOGRAPHY_TOKENS["2xl"]),
  xl: buildTypographyLevel(TYPOGRAPHY_TOKENS.xl),
  lg: buildTypographyLevel(TYPOGRAPHY_TOKENS.lg),
  md: buildTypographyLevel(TYPOGRAPHY_TOKENS.md),
  base: buildTypographyLevel(TYPOGRAPHY_TOKENS.base),
  sm: buildTypographyLevel(TYPOGRAPHY_TOKENS.sm),
  xs: buildTypographyLevel(TYPOGRAPHY_TOKENS.xs),
};
