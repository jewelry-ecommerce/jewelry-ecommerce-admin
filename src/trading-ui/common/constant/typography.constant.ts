type FontWeightKey = 'regular' | 'medium' | 'semibold' | 'bold';
type FontWeightValue = 400 | 500 | 600 | 700;

type TypographyToken = {
  fontSize: string;
  lineHeight: string;
};

const FONT_WEIGHTS: Record<FontWeightKey, FontWeightValue> = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

const TYPOGRAPHY_TOKENS = {
  '5xl': { fontSize: '48px', lineHeight: '150%' },
  '4xl': { fontSize: '32px', lineHeight: '150%' },
  '3xl': { fontSize: '28px', lineHeight: '150%' },
  '2xl': { fontSize: '24px', lineHeight: '150%' },
  xl: { fontSize: '20px', lineHeight: '150%' },
  lg: { fontSize: '18px', lineHeight: '150%' },
  md: { fontSize: '16px', lineHeight: '150%' },
  base: { fontSize: '14px', lineHeight: '150%' },
  sm: { fontSize: '12px', lineHeight: '150%' },
  xs: { fontSize: '10px', lineHeight: '150%' },
} as const satisfies Record<string, TypographyToken>;

const buildTypographyLevel = ({ fontSize, lineHeight }: TypographyToken) =>
  Object.entries(FONT_WEIGHTS).reduce(
    (acc, [weightKey, fontWeight]) => ({
      ...acc,
      [weightKey]: {
        fontWeight,
        fontSize,
        lineHeight,
        letterSpacing: '0%',
        verticalAlign: 'middle',
      },
    }),
    {} as Record<
      FontWeightKey,
      {
        fontWeight: FontWeightValue;
        fontSize: string;
        lineHeight: string;
        letterSpacing: '0%';
        verticalAlign: 'middle';
      }
    >,
  );

export const TYPOGRAPHY_STYLES = Object.entries(TYPOGRAPHY_TOKENS).reduce(
  (acc, [level, token]) => ({
    ...acc,
    [level]: buildTypographyLevel(token),
  }),
  {} as Record<
    keyof typeof TYPOGRAPHY_TOKENS,
    Record<
      FontWeightKey,
      {
        fontWeight: FontWeightValue;
        fontSize: string;
        lineHeight: string;
        letterSpacing: '0%';
        verticalAlign: 'middle';
      }
    >
  >,
);
