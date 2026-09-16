import { Stack } from "@mui/material";
import { styled } from "@mui/material/styles";

/**
 * Layout primitives. These replace the styled primitives the reference admin app pulls from its
 * internal package — the same names, built locally on MUI `Stack`.
 */
export const StackRow = styled(Stack)(() => ({
  flexDirection: "row",
}));

export const StackRowAlignCenter = styled(Stack)(() => ({
  flexDirection: "row",
  alignItems: "center",
}));

export const StackRowAlignCenterJustBetween = styled(Stack)(() => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
}));

export const StackRowAlignCenterJustEnd = styled(Stack)(() => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-end",
}));

export const StackRowWrap = styled(Stack)(() => ({
  flexDirection: "row",
  flexWrap: "wrap",
}));

export const StackAlignJustCenter = styled(Stack)(() => ({
  alignItems: "center",
  justifyContent: "center",
}));
