import type { SxProps, Theme } from "@mui/material/styles";

import { TYPOGRAPHY_STYLES } from "@/common/constant/typography.constant";
import { COLOR, STYLE } from "@/theme/design-tokens";

export const formLabelSx: SxProps<Theme> = {
  ...TYPOGRAPHY_STYLES.base.medium,
  color: COLOR.NEUTRAL[700],
  mb: "4px",
};

export const formHelperSx: SxProps<Theme> = {
  ...TYPOGRAPHY_STYLES.sm.regular,
  color: COLOR.NEUTRAL[500],
  mt: "4px",
};

export const formErrorSx: SxProps<Theme> = {
  ...TYPOGRAPHY_STYLES.sm.regular,
  color: COLOR.STATUS.dangerFg,
  mt: "4px",
};

export const formInputSx: SxProps<Theme> = {
  "& .MuiOutlinedInput-root": {
    borderRadius: `${STYLE.BORDER_RADIUS_ELEMENT}px`,
    bgcolor: COLOR.COMMON.white,
    "& fieldset": { borderColor: COLOR.NEUTRAL[300] },
    "&:hover fieldset": { borderColor: COLOR.NEUTRAL[400] },
    "&.Mui-focused fieldset": { borderColor: COLOR.NEUTRAL[900], borderWidth: 2 },
    "&.Mui-error fieldset": { borderColor: COLOR.STATUS.dangerFg },
    "&.Mui-disabled": {
      bgcolor: COLOR.NEUTRAL[100],
      "& fieldset": { borderColor: COLOR.NEUTRAL[200] },
    },
  },
  "& .MuiInputBase-input": {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: COLOR.NEUTRAL[900],
  },
  "& .MuiInputBase-input.Mui-disabled": {
    color: COLOR.NEUTRAL[500],
    WebkitTextFillColor: COLOR.NEUTRAL[500],
    opacity: 1,
  },
  "& .MuiInputBase-input::placeholder": {
    color: COLOR.NEUTRAL[400],
    opacity: 1,
  },
  "& .MuiSelect-select em": {
    fontStyle: "normal",
    color: COLOR.NEUTRAL[400],
  },
};
