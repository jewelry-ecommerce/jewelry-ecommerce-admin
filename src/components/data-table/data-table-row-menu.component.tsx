import { MoreHorizRounded } from "@mui/icons-material";
import { Box, ListItemIcon, Menu, MenuItem } from "@mui/material";
import { Fragment, useMemo, useState } from "react";

import { TYPOGRAPHY_STYLES } from "@/common/constant/typography.constant";
import { PermissionIconButton } from "@/components/button/permission-icon-button.component";
import type { DataTableRowMenuItem } from "@/components/data-table/data-table.types";
import { TooltipOnHoverComponent } from "@/components/tooltip/tooltip-on-hover.component";
import type { PageButtonPermissionProps } from "@/permissions/permission.interface";
import { usePermissionGate } from "@/permissions/use-permission-gate.hook";
import { COLOR } from "@/theme/design-tokens";

export interface DataTableRowMenuProps<TData> {
  row: TData;
  rowIndex: number;
  getRowMenu: (row: TData, index: number) => DataTableRowMenuItem[];
  /** Gate for the "more actions" trigger itself. */
  triggerPermission?: PageButtonPermissionProps;
}

const DataTableRowMenuEntry = ({ item, onSelect }: { item: DataTableRowMenuItem; onSelect: () => void }) => {
  const canAccess = usePermissionGate({
    apiCode: item.apiCode,
    actionCode: item.actionCode,
    menuCode: item.menuCode,
    tabCode: item.tabCode,
  });

  const unauthorizedMode = item.unauthorizedMode ?? "hide";
  if (!canAccess && unauthorizedMode === "hide") return null;

  const blocked = Boolean(item.disabled || !canAccess);
  const content = <Box component="span">{item.content}</Box>;

  return (
    <MenuItem
      aria-disabled={blocked}
      onClick={() => {
        if (blocked) return;
        onSelect();
      }}
      sx={{
        ...TYPOGRAPHY_STYLES.base.regular,
        ...(item.destructive && !blocked ? { color: COLOR.STATUS.dangerFg } : {}),
        ...(blocked ? { color: COLOR.NEUTRAL[400], cursor: "not-allowed" } : {}),
      }}
    >
      {item.icon ? <ListItemIcon sx={{ minWidth: 28, color: "inherit" }}>{item.icon}</ListItemIcon> : null}
      {blocked && item.disabledTooltip ? (
        <TooltipOnHoverComponent content={item.disabledTooltip} placement="left">
          {content}
        </TooltipOnHoverComponent>
      ) : (
        content
      )}
    </MenuItem>
  );
};

export const DataTableRowMenu = <TData,>({ row, rowIndex, getRowMenu, triggerPermission }: DataTableRowMenuProps<TData>) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const items = useMemo(() => getRowMenu(row, rowIndex), [getRowMenu, row, rowIndex]);

  const closeMenu = () => setAnchorEl(null);

  return (
    <Fragment>
      <PermissionIconButton
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{ color: COLOR.NEUTRAL[600], flexShrink: 0 }}
        {...(triggerPermission ?? { actionCode: "view", actionLabel: "More actions", menuCode: "", tabCode: "" })}
      >
        <MoreHorizRounded sx={{ fontSize: 18 }} />
      </PermissionIconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {items.map((item, index) => (
          <DataTableRowMenuEntry
            key={`${item.actionCode ?? item.content}-${index}`}
            item={item}
            onSelect={() => {
              item.onClick();
              closeMenu();
            }}
          />
        ))}
      </Menu>
    </Fragment>
  );
};
