import { MoreHorizRounded } from '@mui/icons-material';
import { Box, Menu, MenuItem } from '@mui/material';
import React, { useMemo, useState } from 'react';

import type { DataTableRowMenuItem } from './data-table.types';
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';
import { TooltipOnHoverComponent } from '../tooltip/tooltip-on-hover.component';
import { PermissionIconButton } from '../button/permission-icon-button';
import type { PageButtonPermissionProps } from '../../permissions/page-button-permission.utils';
import { usePermissionGate } from '../../permissions/use-permission-gate.hook';

export interface DataTableRowMenuProps<TData> {
  row: TData;
  rowIndex: number;
  getRowMenu: (row: TData, index: number) => DataTableRowMenuItem[];
  /** Permission cho nút trigger "Thao tác khác". */
  triggerPermission?: PageButtonPermissionProps;
}

type DataTableRowMenuItemRowProps = {
  item: DataTableRowMenuItem;
  onSelect: () => void;
};

const DataTableRowMenuItemRow = ({ item, onSelect }: DataTableRowMenuItemRowProps) => {
  const canAccess = usePermissionGate({
    apiCode: item.apiCode,
    actionCode: item.actionCode,
    menuCode: item.menuCode,
    tabCode: item.tabCode,
  });

  const unauthorizedMode = item.unauthorizedMode ?? 'hide';

  if (!canAccess && unauthorizedMode === 'hide') {
    return null;
  }

  const blocked = Boolean(item.disabled || (!canAccess && unauthorizedMode === 'disable'));
  const label =
    blocked && item.disabledTooltip ? (
      <TooltipOnHoverComponent content={item.disabledTooltip} placement="left">
        <Box component="span" sx={{ display: 'inline-block', width: '100%' }}>
          {item.content}
        </Box>
      </TooltipOnHoverComponent>
    ) : (
      item.content
    );

  return (
    <MenuItem
      aria-disabled={blocked}
      onClick={() => {
        if (blocked) return;
        onSelect();
      }}
      sx={{
        ...TYPOGRAPHY_STYLES.base.regular,
        ...(item.destructive && !blocked ? { color: '#EF4444' } : {}),
        ...(blocked
          ? {
              color: '#667085',
              cursor: 'not-allowed',
              opacity: 1,
            }
          : {}),
      }}
    >
      {label}
    </MenuItem>
  );
};

export const DataTableRowMenu = <TData,>({ row, rowIndex, getRowMenu, triggerPermission }: DataTableRowMenuProps<TData>) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const items = useMemo(() => getRowMenu(row, rowIndex), [getRowMenu, row, rowIndex]);

  const handleClose = () => setAnchorEl(null);

  return (
    <React.Fragment>
      <PermissionIconButton
        size="small"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ color: '#475467', flexShrink: 0 }}
        {...(triggerPermission ?? { actionCode: 'view', actionLabel: 'Thao tác khác' })}
      >
        <MoreHorizRounded sx={{ fontSize: 18 }} />
      </PermissionIconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        {items.map((item, i) => (
          <DataTableRowMenuItemRow
            key={i}
            item={item}
            onSelect={() => {
              item.onClick();
              handleClose();
            }}
          />
        ))}
      </Menu>
    </React.Fragment>
  );
};
