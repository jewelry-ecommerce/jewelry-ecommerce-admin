import { Box, ButtonBase } from "@mui/material";

import { TYPOGRAPHY_STYLES } from "@/common/constant/typography.constant";
import type { DataTableStatusTab } from "@/components/data-table/data-table.types";
import { usePermissionContext } from "@/permissions/use-permission-context.hook";
import { COLOR } from "@/theme/design-tokens";

const TAB_TONE = {
  active: { label: COLOR.NEUTRAL[900], countBg: COLOR.NEUTRAL[900], countFg: COLOR.COMMON.white, underline: COLOR.NEUTRAL[900] },
  highlighted: {
    label: COLOR.STATUS.warningFg,
    countBg: COLOR.STATUS.warningBg,
    countFg: COLOR.STATUS.warningFg,
    underline: COLOR.STATUS.warningFg,
  },
  default: { label: COLOR.NEUTRAL[500], countBg: COLOR.NEUTRAL[100], countFg: COLOR.NEUTRAL[600], underline: "transparent" },
} as const;

export interface DataTableStatusTabsProps<TValue extends string | number> {
  tabs: DataTableStatusTab<TValue>[];
  activeValue: TValue;
  onChange: (value: TValue) => void;
}

export const DataTableStatusTabs = <TValue extends string | number>({ tabs, activeValue, onChange }: DataTableStatusTabsProps<TValue>) => {
  const { canAccessAction } = usePermissionContext();

  const visibleTabs = tabs.filter((tab) =>
    tab.menuCode && tab.tabCode && tab.actionCode ? canAccessAction(tab.menuCode, tab.tabCode, tab.actionCode) : true,
  );

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, borderBottom: `1px solid ${COLOR.NEUTRAL[200]}`, overflowX: "auto" }}>
      <Box role="tablist" sx={{ display: "flex", gap: 2.5 }}>
        {visibleTabs.map((tab) => {
          const isActive = tab.value === activeValue;
          const tone = isActive
            ? tab.highlighted
              ? TAB_TONE.highlighted
              : TAB_TONE.active
            : tab.highlighted
              ? TAB_TONE.highlighted
              : TAB_TONE.default;

          return (
            <ButtonBase
              key={tab.value}
              role="tab"
              aria-selected={isActive}
              disableRipple
              onClick={() => onChange(tab.value)}
              sx={{
                flex: "0 0 auto",
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                px: 0.5,
                py: 1.6,
                whiteSpace: "nowrap",
                borderBottom: `2px solid ${isActive ? tone.underline : "transparent"}`,
                transition: "all 0.2s ease",
              }}
            >
              <Box
                component="span"
                sx={{ ...TYPOGRAPHY_STYLES.base.medium, fontWeight: isActive ? 700 : 500, color: tone.label, lineHeight: 1.2 }}
              >
                {tab.label}
              </Box>
              {tab.count === undefined ? null : (
                <Box
                  component="span"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    px: "6px",
                    height: 18,
                    borderRadius: 999,
                    bgcolor: tone.countBg,
                    color: tone.countFg,
                    ...TYPOGRAPHY_STYLES.xs.bold,
                    lineHeight: 1,
                  }}
                >
                  {tab.count}
                </Box>
              )}
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
};
