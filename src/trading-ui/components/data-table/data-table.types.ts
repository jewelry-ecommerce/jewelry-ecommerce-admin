import { type ReactNode } from 'react';
import { type SxProps, type Theme } from '@mui/material';
import type { TableRowProps } from '@mui/material/TableRow';

export type DataTableRowId = string | number;
export type DataTableSortDirection = 'asc' | 'desc';
export type DataTableAlign = 'left' | 'center' | 'right';

/** Chiều rộng vùng bấm expand (px). */
export const DATA_TABLE_EXPAND_TOGGLE_SIZE = 26;

/** Khoảng cách giữa arrow expand và checkbox (px). */
export const DATA_TABLE_EXPAND_CHECKBOX_GAP = 14;

/** Chiều rộng cột expand khi không kèm checkbox (px). */
export const DATA_TABLE_EXPAND_COLUMN_WIDTH = 40;

/** Chiều rộng cột checkbox khi không kèm expand (px). */
export const DATA_TABLE_CHECKBOX_COLUMN_WIDTH = 52;

/** Chiều rộng vùng checkbox trong cột leading (px). */
export const DATA_TABLE_CHECKBOX_SLOT_WIDTH = 24;

/** Chiều rộng cột gộp: padding + toggle + gap + checkbox slot. */
export const DATA_TABLE_COMBINED_LEADING_COLUMN_WIDTH = 88;

/** Max-height mặc định vùng scroll children (px). */
export const DATA_TABLE_CHILDREN_MAX_HEIGHT_DEFAULT = 280;

export interface DataTableComponents<TData> {
  Row?: React.ElementType<TableRowProps & { row: TData; children: ReactNode }>;
  BodyWrapper?: React.ElementType<{ children: ReactNode }>;
}

export interface DataTableColumn<TData, TSortField extends string = string> {
  id: string;
  label: ReactNode;
  width?: number;
  minWidth?: number;
  align?: DataTableAlign;
  sticky?: 'left' | 'right';
  sortable?: boolean;
  sortField?: TSortField;
  renderCell: (row: TData) => ReactNode;
  cellSx?: SxProps<Theme>;
}

export interface DataTableStatusTab<TValue extends string | number> {
  value: TValue;
  label: string;
  count?: number;
  /** Optional visual emphasis for special tabs. */
  highlighted?: boolean;
}

export interface DataTableToolbarOption {
  value: string;
  label: string;
  /** Renders a divider above this item (e.g. before “custom” range). */
  dividerBefore?: boolean;
}

export interface DataTableRowMenuItem {
  content: string;
  icon?: string;
  onClick: () => void;
  destructive?: boolean;
  actionCode?: string;
  actionLabel?: string;
  menuCode?: string;
  tabCode?: string;
  apiCode?: string | string[];
  unauthorizedMode?: 'hide' | 'disable';
  /** Không gọi `onClick`; dùng với `disabledTooltip` để giải thích khi hover. */
  disabled?: boolean;
  /** Hiển thị khi `disabled === true` (tooltip bọc `MenuItem` để hover hoạt động). */
  disabledTooltip?: string;
}
export interface DataTableToolbarFilterSelect {
  value: string;
  onChange: (value: string) => void;
  options: readonly DataTableToolbarOption[];
  width?: number;
}

export interface DataTableToolbarAction {
  key: string;
  label?: string;
  customNode?: ReactNode;
  /** Mã action IAM — thường trùng `key` khi dùng cho phân quyền. */
  actionCode?: string;
  /** Tên nút cho catalog / scan (mặc định dùng `label`). */
  actionLabel?: string;
  menuCode?: string;
  tabCode?: string;
  variant?: 'outlined' | 'contained';
  icon?: ReactNode;
  endIcon?: ReactNode;
  disabled?: boolean;
  apiCode?: string | string[];
  onClick?: () => void;
  options?: readonly DataTableToolbarOption[];
  onSelectOption?: (value: string) => void;
  /** Multiselect: giữ menu mở, toggle checkbox qua `onToggleOption`. */
  multiSelect?: boolean;
  selectedOptionValues?: readonly string[];
  onToggleOption?: (value: string) => void;
  selectedOptionLabel?: string;
  menuMinWidth?: number;
  sx?: SxProps<Theme>;
}
