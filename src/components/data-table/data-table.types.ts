import type { ReactNode } from "react";
import type { SxProps, Theme } from "@mui/material/styles";

import type { UnauthorizedMode } from "@/permissions/permission.interface";

export type DataTableRowId = string | number;
export type DataTableSortDirection = "asc" | "desc";
export type DataTableAlign = "left" | "center" | "right";

export const DATA_TABLE_CHECKBOX_COLUMN_WIDTH = 52;

/**
 * Permission metadata carried by anything the user can act on. Every field is optional so a purely
 * decorative control stays simple, but an action that mutates data must declare the full set.
 */
export interface DataTablePermissionMeta {
  menuCode?: string;
  tabCode?: string;
  /** Unique snake_case action identifier within the scope. */
  actionCode?: string;
  /** Human-readable name used for accessible labels and permission catalogues. */
  actionLabel?: string;
  /** API code(s) invoked by the action. */
  apiCode?: string | string[];
  unauthorizedMode?: UnauthorizedMode;
}

export interface DataTableColumn<TData, TSortField extends string = string> {
  id: string;
  label: ReactNode;
  width?: number;
  minWidth?: number;
  align?: DataTableAlign;
  sticky?: "left" | "right";
  sortable?: boolean;
  sortField?: TSortField;
  renderCell: (row: TData) => ReactNode;
  cellSx?: SxProps<Theme>;
}

export interface DataTableStatusTab<TValue extends string | number> extends DataTablePermissionMeta {
  value: TValue;
  label: string;
  count?: number;
  /** Draws attention to an exception tab, e.g. failed deliveries. */
  highlighted?: boolean;
}

export interface DataTableToolbarOption {
  value: string;
  label: string;
  /** Renders a divider above this item. */
  dividerBefore?: boolean;
}

export interface DataTableToolbarFilterSelect {
  value: string;
  onChange: (value: string) => void;
  options: readonly DataTableToolbarOption[];
  label?: string;
  width?: number;
}

export interface DataTableToolbarAction extends DataTablePermissionMeta {
  key: string;
  label?: string;
  /** Escape hatch for a bespoke control; rendered as-is, so it must gate itself. */
  customNode?: ReactNode;
  variant?: "primary" | "outline" | "danger";
  icon?: ReactNode;
  endIcon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  /** Turns the action into a dropdown trigger. */
  options?: readonly DataTableToolbarOption[];
  onSelectOption?: (value: string) => void;
  menuMinWidth?: number;
  sx?: SxProps<Theme>;
}

export interface DataTableRowMenuItem extends DataTablePermissionMeta {
  content: string;
  icon?: ReactNode;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
  /** Shown on hover while `disabled` is true, explaining why the item cannot be used. */
  disabledTooltip?: string;
}

export interface DataTableBulkAction extends DataTablePermissionMeta {
  key: string;
  label: string;
  variant?: "primary" | "outline" | "danger";
  icon?: ReactNode;
  disabled?: boolean;
  onClick: (selectedRowIds: DataTableRowId[]) => void;
}
