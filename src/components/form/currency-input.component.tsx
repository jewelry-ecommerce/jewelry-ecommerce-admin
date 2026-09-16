import { InputAdornment, Typography } from "@mui/material";

import { commonConfig } from "@/common/config/app.config";
import { TYPOGRAPHY_STYLES } from "@/common/constant/typography.constant";
import { NumberInput, type NumberInputProps } from "@/components/form/number-input.component";
import { COLOR } from "@/theme/design-tokens";

export type CurrencyInputProps = Omit<NumberInputProps, "decimalScale" | "disableGrouping" | "suffix">;

/** Money field: grouped thousands, no negatives, and the configured currency shown as a suffix. */
export const CurrencyInput = ({ min = 0, ...props }: CurrencyInputProps) => (
  <NumberInput
    {...props}
    min={min}
    decimalScale={commonConfig.CURRENCY === "VND" ? 0 : 2}
    suffix={
      <InputAdornment position="end">
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: COLOR.NEUTRAL[500] }}>{commonConfig.CURRENCY}</Typography>
      </InputAdornment>
    }
  />
);
