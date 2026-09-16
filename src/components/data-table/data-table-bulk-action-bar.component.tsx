import { Stack, Typography } from "@mui/material";

import { TYPOGRAPHY_STYLES } from "@/common/constant/typography.constant";
import { ButtonElement } from "@/components/button/button-element.component";
import { CustomButton } from "@/components/button/custom-button.component";
import type { DataTableBulkAction, DataTableRowId } from "@/components/data-table/data-table.types";
import { COLOR, STYLE } from "@/theme/design-tokens";

export interface DataTableBulkActionBarProps {
  selectedRowIds: DataTableRowId[];
  actions: DataTableBulkAction[];
  onClearSelection: () => void;
  itemLabel?: string;
}

/** Appears once rows are selected; each action is permission-gated on its own metadata. */
export const DataTableBulkActionBar = ({
  selectedRowIds,
  actions,
  onClearSelection,
  itemLabel = "selected",
}: DataTableBulkActionBarProps) => {
  if (selectedRowIds.length === 0) return null;

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={1.25}
      alignItems={{ xs: "stretch", md: "center" }}
      justifyContent="space-between"
      sx={{
        mt: 2,
        px: 2,
        py: 1.25,
        border: `1px solid ${COLOR.NEUTRAL[900]}`,
        borderRadius: `${STYLE.BORDER_RADIUS_ELEMENT_WRAPPER}px`,
        bgcolor: COLOR.NEUTRAL[900],
      }}
    >
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: COLOR.COMMON.white }}>
        {selectedRowIds.length} {itemLabel}
      </Typography>

      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
        {actions.map((action) => (
          <CustomButton
            key={action.key}
            size="sm"
            variant={action.variant ?? "outline"}
            startIcon={action.icon}
            disabled={action.disabled}
            menuCode={action.menuCode}
            tabCode={action.tabCode}
            actionCode={action.actionCode}
            actionLabel={action.actionLabel ?? action.label}
            apiCode={action.apiCode}
            unauthorizedMode={action.unauthorizedMode ?? "hide"}
            onClick={() => action.onClick(selectedRowIds)}
          >
            {action.label}
          </CustomButton>
        ))}
        <ButtonElement variant="ghost" size="sm" content="Clear" onClick={onClearSelection} sx={{ color: COLOR.COMMON.white }} />
      </Stack>
    </Stack>
  );
};
