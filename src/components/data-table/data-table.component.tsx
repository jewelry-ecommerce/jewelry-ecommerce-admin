import {
  Checkbox,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

import { TYPOGRAPHY_STYLES } from "@/common/constant/typography.constant";
import {
  DATA_TABLE_CHECKBOX_COLUMN_WIDTH,
  type DataTableColumn,
  type DataTableRowId,
  type DataTableSortDirection,
} from "@/components/data-table/data-table.types";
import { COLOR } from "@/theme/design-tokens";

const HEADER_BG = "#F8FAFC";
const ROW_BORDER = "#EEF2F6";

export interface DataTableProps<TData, TSortField extends string = string> {
  rows: TData[];
  columns: DataTableColumn<TData, TSortField>[];
  getRowId: (row: TData) => DataTableRowId;
  selectable?: boolean;
  selectedRowIds?: DataTableRowId[];
  isRowSelectable?: (row: TData) => boolean;
  sortField?: TSortField;
  sortDirection?: DataTableSortDirection;
  tableMinWidth?: number;
  containerSx?: SxProps<Theme>;
  emptyTitle?: string;
  emptyDescription?: string;
  onSortChange?: (field: TSortField) => void;
  onToggleSelectAll?: (checked: boolean, rows: TData[]) => void;
  onToggleSelectRow?: (row: TData, checked: boolean) => void;
  onRowClick?: (row: TData) => void;
  isRowClickable?: (row: TData) => boolean;
}

const INTERACTIVE_SELECTOR = 'button, a, input, textarea, select, [role="checkbox"], [role="menuitem"], [data-row-click-ignore="true"]';

/** True when the click landed on a nested control, which owns the interaction instead of the row. */
const shouldIgnoreRowClick = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement && Boolean(target.closest(INTERACTIVE_SELECTOR));

export const DataTable = <TData, TSortField extends string = string>({
  rows,
  columns,
  getRowId,
  selectable = false,
  selectedRowIds = [],
  isRowSelectable,
  sortField,
  sortDirection = "asc",
  tableMinWidth = 1080,
  containerSx,
  emptyTitle = "No data",
  emptyDescription = "No records match the current filters.",
  onSortChange,
  onToggleSelectAll,
  onToggleSelectRow,
  onRowClick,
  isRowClickable,
}: DataTableProps<TData, TSortField>) => {
  const canSelectRow = (row: TData): boolean => (isRowSelectable ? isRowSelectable(row) : true);
  const canClickRow = (row: TData): boolean => (isRowClickable ? isRowClickable(row) : true);

  const selectableRows = selectable ? rows.filter(canSelectRow) : [];
  const selectedCount = selectableRows.filter((row) => selectedRowIds.includes(getRowId(row))).length;
  const isAllSelected = selectableRows.length > 0 && selectedCount === selectableRows.length;
  const isIndeterminate = selectedCount > 0 && selectedCount < selectableRows.length;
  const totalColumnCount = columns.length + (selectable ? 1 : 0);

  const columnWidthOf = (column: DataTableColumn<TData, TSortField>): number => column.width ?? column.minWidth ?? 0;

  const stickyOffsets = columns.reduce<Record<string, number>>((offsets, column, index) => {
    if (column.sticky === "left") {
      const previous = columns.slice(0, index).filter((entry) => entry.sticky === "left");
      offsets[column.id] =
        (selectable ? DATA_TABLE_CHECKBOX_COLUMN_WIDTH : 0) + previous.reduce((width, entry) => width + columnWidthOf(entry), 0);
    }
    if (column.sticky === "right") {
      const following = columns.slice(index + 1).filter((entry) => entry.sticky === "right");
      offsets[column.id] = following.reduce((width, entry) => width + columnWidthOf(entry), 0);
    }
    return offsets;
  }, {});

  const getStickyCellSx = (column: DataTableColumn<TData, TSortField>, background: string, zIndex: number): SxProps<Theme> => {
    if (!column.sticky) return {};
    const shared = { position: "sticky" as const, zIndex, backgroundColor: background };
    return column.sticky === "right"
      ? { ...shared, right: stickyOffsets[column.id] ?? 0, boxShadow: "-10px 0 16px -16px rgba(15, 23, 42, 0.28)" }
      : { ...shared, left: stickyOffsets[column.id] ?? 0, boxShadow: "10px 0 16px -16px rgba(15, 23, 42, 0.28)" };
  };

  const checkboxCellSx = (background: string, zIndex: number): SxProps<Theme> => ({
    width: DATA_TABLE_CHECKBOX_COLUMN_WIDTH,
    minWidth: DATA_TABLE_CHECKBOX_COLUMN_WIDTH,
    px: 1.5,
    position: "sticky",
    left: 0,
    zIndex,
    backgroundColor: background,
  });

  return (
    <TableContainer sx={{ overflow: "auto", backgroundColor: COLOR.COMMON.white, ...containerSx }}>
      <Table stickyHeader sx={{ tableLayout: "fixed", minWidth: tableMinWidth }}>
        <colgroup>
          {selectable ? <col style={{ width: DATA_TABLE_CHECKBOX_COLUMN_WIDTH }} /> : null}
          {columns.map((column) => (
            <col key={column.id} style={{ width: column.width, minWidth: column.minWidth ?? column.width }} />
          ))}
        </colgroup>

        <TableHead>
          <TableRow>
            {selectable ? (
              <TableCell align="center" sx={{ ...checkboxCellSx(HEADER_BG, 4), borderBottom: `1px solid ${COLOR.NEUTRAL[200]}` }}>
                <Checkbox
                  size="small"
                  sx={{ p: 0 }}
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  disabled={selectableRows.length === 0}
                  inputProps={{ "aria-label": "Select all rows" }}
                  onChange={(event) => onToggleSelectAll?.(event.target.checked, selectableRows)}
                />
              </TableCell>
            ) : null}

            {columns.map((column) => {
              const sortKey = (column.sortField ?? column.id) as TSortField;
              const isActive = Boolean(column.sortable && sortField === sortKey);

              return (
                <TableCell
                  key={column.id}
                  align={column.align}
                  sortDirection={isActive ? sortDirection : false}
                  sx={{
                    width: column.width,
                    minWidth: column.minWidth ?? column.width,
                    px: 2,
                    backgroundColor: HEADER_BG,
                    borderBottom: `1px solid ${COLOR.NEUTRAL[200]}`,
                    color: COLOR.NEUTRAL[700],
                    ...TYPOGRAPHY_STYLES.base.medium,
                    ...getStickyCellSx(column, HEADER_BG, 3),
                  }}
                >
                  {column.sortable ? (
                    <TableSortLabel active={isActive} direction={isActive ? sortDirection : "asc"} onClick={() => onSortChange?.(sortKey)}>
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={totalColumnCount} sx={{ py: 6, textAlign: "center" }}>
                <Stack spacing={0.75} alignItems="center">
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.md.bold, color: COLOR.NEUTRAL[900] }}>{emptyTitle}</Typography>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: COLOR.NEUTRAL[500] }}>{emptyDescription}</Typography>
                </Stack>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => {
              const rowId = getRowId(row);
              const rowClickable = Boolean(onRowClick) && canClickRow(row);

              return (
                <TableRow
                  key={rowId}
                  hover={rowClickable}
                  onClick={(event) => {
                    if (!onRowClick || shouldIgnoreRowClick(event.target) || !canClickRow(row)) return;
                    onRowClick(row);
                  }}
                  sx={{
                    cursor: rowClickable ? "pointer" : undefined,
                    "& .MuiTableCell-root": {
                      py: 1,
                      px: 2,
                      borderBottom: `1px solid ${ROW_BORDER}`,
                      backgroundColor: COLOR.COMMON.white,
                    },
                    "&:hover .MuiTableCell-root": { backgroundColor: "#FAFCFF" },
                  }}
                >
                  {selectable ? (
                    <TableCell align="center" sx={checkboxCellSx(COLOR.COMMON.white, 2)}>
                      <Checkbox
                        size="small"
                        sx={{ p: 0 }}
                        checked={selectedRowIds.includes(rowId)}
                        disabled={!canSelectRow(row)}
                        inputProps={{ "aria-label": `Select row ${rowId}` }}
                        onChange={(event) => onToggleSelectRow?.(row, event.target.checked)}
                      />
                    </TableCell>
                  ) : null}

                  {columns.map((column) => {
                    const stickySx = getStickyCellSx(column, COLOR.COMMON.white, 2);
                    const mergedSx = column.cellSx ? ([stickySx, column.cellSx] as SxProps<Theme>) : stickySx;

                    return (
                      <TableCell key={column.id} align={column.align} sx={mergedSx}>
                        {column.renderCell(row)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
