import { Box, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Typography } from '@mui/material';
import { type SxProps, type Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';
import React, { useState } from 'react';
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';
import { CheckboxComponent } from '../check-box/check-box.element';
import { DataTableExpandSpacer, DataTableExpandToggle } from './data-table-expand-toggle';
import { DataTableLeadingCellContent } from './data-table-leading-cell';
import {
  DATA_TABLE_CHECKBOX_COLUMN_WIDTH,
  DATA_TABLE_CHILDREN_MAX_HEIGHT_DEFAULT,
  DATA_TABLE_COMBINED_LEADING_COLUMN_WIDTH,
  DATA_TABLE_EXPAND_COLUMN_WIDTH,
  type DataTableColumn,
  type DataTableComponents,
  type DataTableRowId,
  type DataTableSortDirection,
} from './data-table.types';

interface DataTableProps<TData, TSortField extends string = string> {
  rows: TData[];
  columns: Array<DataTableColumn<TData, TSortField>>;
  getRowId: (row: TData) => DataTableRowId;
  selectable?: boolean;
  selectedRowIds?: DataTableRowId[];
  isRowSelectable?: (row: TData) => boolean;
  sortField?: TSortField;
  sortDirection?: DataTableSortDirection;
  tableMinWidth?: number;
  fillContainerWidth?: boolean;
  containerSx?: SxProps<Theme>;
  emptyTitle?: string;
  emptyDescription?: string;
  onSortChange?: (field: TSortField) => void;
  onToggleSelectAll?: (checked: boolean, rows: TData[]) => void;
  onToggleSelectRow?: (row: TData, checked: boolean) => void;
  onRowClick?: (row: TData) => void;
  isRowClickable?: (row: TData) => boolean;
  getRowClickBlockedTitle?: (row: TData) => string | undefined;
  stickyBottomRowId?: DataTableRowId;
  getRowChildren?: (row: TData) => TData[] | undefined | null;
  expandedRowIds?: DataTableRowId[];
  defaultExpandedRowIds?: DataTableRowId[];
  onExpandedRowIdsChange?: (expandedRowIds: DataTableRowId[]) => void;
  childrenMaxHeight?: number;
  components?: DataTableComponents<TData>;
}

interface ExpandRowState {
  hasChildren: boolean;
  isExpanded: boolean;
  onToggleExpand?: () => void;
}

export const DataTable = <TData, TSortField extends string = string>({
  rows,
  columns,
  getRowId,
  selectable = false,
  selectedRowIds = [],
  isRowSelectable,
  sortField,
  sortDirection = 'asc',
  tableMinWidth = 1200,
  fillContainerWidth = false,
  containerSx,
  emptyTitle = 'Không có dữ liệu',
  emptyDescription = 'Không tìm thấy bản ghi phù hợp.',
  onSortChange,
  onToggleSelectAll,
  onToggleSelectRow,
  onRowClick,
  isRowClickable,
  getRowClickBlockedTitle,
  stickyBottomRowId,
  getRowChildren,
  expandedRowIds: controlledExpandedRowIds,
  defaultExpandedRowIds = [],
  onExpandedRowIdsChange,
  childrenMaxHeight = DATA_TABLE_CHILDREN_MAX_HEIGHT_DEFAULT,
  components,
}: DataTableProps<TData, TSortField>) => {
  const expandable = Boolean(getRowChildren);
  const hasLeadingColumn = expandable || selectable;
  const leadingWidth = expandable && selectable ? DATA_TABLE_COMBINED_LEADING_COLUMN_WIDTH : expandable ? DATA_TABLE_EXPAND_COLUMN_WIDTH : selectable ? DATA_TABLE_CHECKBOX_COLUMN_WIDTH : 0;

  const [internalExpandedRowIds, setInternalExpandedRowIds] = useState<DataTableRowId[]>(defaultExpandedRowIds);
  const expandedRowIds = controlledExpandedRowIds ?? internalExpandedRowIds;

  const setExpandedRowIds = (next: DataTableRowId[]) => {
    onExpandedRowIdsChange?.(next);
    if (controlledExpandedRowIds === undefined) setInternalExpandedRowIds(next);
  };

  const canSelectRow = (row: TData) => (isRowSelectable ? isRowSelectable(row) : true);
  const canClickRow = (row: TData) => (isRowClickable ? isRowClickable(row) : true);
  const getSelectableChildren = (row: TData) => (expandable ? (getRowChildren?.(row) ?? []).filter(canSelectRow) : []);

  const getFlatSelectableRows = () => {
    const flat: TData[] = [];
    rows.forEach((row) => {
      if (!canSelectRow(row)) return;
      flat.push(row);
      flat.push(...getSelectableChildren(row));
    });
    return flat;
  };

  const flatSelectableRows = selectable ? getFlatSelectableRows() : [];
  const selectedFlatCount = flatSelectableRows.filter((row) => selectedRowIds.includes(getRowId(row))).length;
  const isAllSelected = flatSelectableRows.length > 0 && selectedFlatCount === flatSelectableRows.length;
  const isIndeterminate = selectedFlatCount > 0 && selectedFlatCount < flatSelectableRows.length;
  const totalColumnCount = columns.length + (hasLeadingColumn ? 1 : 0);

  const getColumnWidth = (column: DataTableColumn<TData, TSortField>) => column.width ?? column.minWidth ?? 0;

  const stickyLeftOffsets = columns.reduce<Record<string, number>>((offsets, column, index) => {
    if (column.sticky !== 'left') return offsets;
    const leftCols = columns.slice(0, index).filter((c) => c.sticky === 'left');
    offsets[column.id] = leadingWidth + leftCols.reduce((w, c) => w + getColumnWidth(c), 0);
    return offsets;
  }, {});

  const stickyRightOffsets = columns.reduce<Record<string, number>>((offsets, column, index) => {
    if (column.sticky !== 'right') return offsets;
    const rightCols = columns.slice(index + 1).filter((c) => c.sticky === 'right');
    offsets[column.id] = rightCols.reduce((w, c) => w + getColumnWidth(c), 0);
    return offsets;
  }, {});

  const getStickyCellSx = (column: DataTableColumn<TData, TSortField>, bg: string, zIndex: number): SxProps<Theme> => {
    if (!column.sticky) return {};
    if (column.sticky === 'right') {
      return { position: 'sticky', right: stickyRightOffsets[column.id] ?? 0, zIndex, backgroundColor: bg, boxShadow: '-10px 0 16px -16px rgba(15, 23, 42, 0.28)' };
    }
    return { position: 'sticky', left: stickyLeftOffsets[column.id] ?? 0, zIndex, backgroundColor: bg, boxShadow: '10px 0 16px -16px rgba(15, 23, 42, 0.28)' };
  };

  const leadingCellSx = (bg: string, zIndex: number, stickyBottom = false): SxProps<Theme> => ({
    width: leadingWidth,
    minWidth: leadingWidth,
    px: 1.5,
    position: 'sticky',
    left: 0,
    zIndex,
    backgroundColor: bg,
    boxShadow: '10px 0 16px -16px rgba(15, 23, 42, 0.28)',
    verticalAlign: 'middle',
    ...(stickyBottom ? { bottom: 0 } : {}),
  });

  const shouldIgnoreRowClick = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    return Boolean(target.closest('button, a, input, textarea, select, [role="checkbox"], [role="menuitem"], [data-row-click-ignore="true"]'));
  };

  const renderExpandSlot = (expand?: ExpandRowState) => {
    if (!expandable) return null;
    if (expand?.hasChildren && expand.onToggleExpand) {
      return <DataTableExpandToggle expanded={expand.isExpanded} onToggle={expand.onToggleExpand} />;
    }
    return <DataTableExpandSpacer />;
  };

  const getParentSelectionState = (row: TData) => {
    const children = getSelectableChildren(row);
    if (children.length === 0) {
      return { checked: selectedRowIds.includes(getRowId(row)), indeterminate: false };
    }
    const childIds = children.map(getRowId);
    const selectedChildCount = childIds.filter((id) => selectedRowIds.includes(id)).length;
    return {
      checked: selectedChildCount === childIds.length,
      indeterminate: selectedChildCount > 0 && selectedChildCount < childIds.length,
    };
  };

  const applyRowsSelection = (targets: TData[], checked: boolean) => {
    if (!onToggleSelectRow) return;
    targets.forEach((target) => onToggleSelectRow(target, checked));
  };

  const renderLeadingCheckbox = (row: TData | undefined, isHeader: boolean) => {
    if (!selectable) return null;

    const parentState = row ? getParentSelectionState(row) : null;

    return (
      <CheckboxComponent
        checked={isHeader ? isAllSelected : (parentState?.checked ?? false)}
        indeterminate={isHeader ? isIndeterminate : parentState?.indeterminate}
        disabled={isHeader ? flatSelectableRows.length === 0 : !canSelectRow(row as TData)}
        sx={{ m: 0, '& .MuiCheckbox-root': { p: 0 } }}
        onChange={(e) => {
          const checked = e.target.checked;
          if (isHeader) {
            onToggleSelectAll?.(checked, flatSelectableRows);
            return;
          }
          if (!row) return;
          const children = getSelectableChildren(row);
          const targets = children.length > 0 ? [row, ...children] : [row];
          applyRowsSelection(targets, checked);
        }}
      />
    );
  };

  const renderLeadingContent = (expand?: ExpandRowState, row?: TData, isHeader = false) => {
    const checkbox = renderLeadingCheckbox(row, isHeader);

    if (expandable && selectable) {
      return <DataTableLeadingCellContent expandSlot={renderExpandSlot(expand)} checkboxSlot={checkbox} />;
    }
    if (expandable) return renderExpandSlot(expand);
    return checkbox;
  };

  const renderColGroup = () => (
    <colgroup>
      {hasLeadingColumn ? <col style={{ width: leadingWidth, minWidth: leadingWidth }} /> : null}
      {columns.map((column) => (
        <col key={column.id} style={fillContainerWidth ? {} : { width: column.width, minWidth: column.minWidth ?? column.width }} />
      ))}
    </colgroup>
  );

  const renderBodyRow = (row: TData, expand?: ExpandRowState, isChild = false, parentRowId?: DataTableRowId): ReactNode => {
    const rowId = getRowId(row);
    const isStickyBottom = !isChild && stickyBottomRowId != null && rowId === stickyBottomRowId;
    const rowClickable = !isStickyBottom && !isChild && Boolean(onRowClick) && canClickRow(row);

    const key = parentRowId ? `${parentRowId}-child-${rowId}` : rowId;
    const rowProps = {
      hover: rowClickable,
      onClick: (e: React.MouseEvent<HTMLTableRowElement>) => {
        if (!onRowClick || shouldIgnoreRowClick(e.target) || !canClickRow(row)) return;
        onRowClick(row);
      },
      title: !isStickyBottom && !isChild && onRowClick && !canClickRow(row) ? getRowClickBlockedTitle?.(row) : undefined,
      sx: {
        cursor: rowClickable ? 'pointer' : undefined,
        '--data-table-row-bg': isChild ? '#F9FAFB' : isStickyBottom ? '#F1F5F9' : '#FFFFFF',
        '& .MuiTableCell-root': {
          py: 1,
          px: 2,
          borderBottom: '1px solid #EEF2F6',
          backgroundColor: 'var(--data-table-row-bg)',
          ...(isStickyBottom ? { borderTop: '1px solid #E2E8F0', fontWeight: 600 } : {}),
        },
        ...(hasLeadingColumn ? { '& .MuiTableCell-root[data-leading-cell="true"]': { px: 1.5 } } : {}),
        ...(!isStickyBottom && !isChild ? { '&:hover': { '--data-table-row-bg': '#FAFCFF' } } : {}),
      },
    };

    const rowContent = (
      <>
        {hasLeadingColumn ? (
          <TableCell data-leading-cell="true" align={expandable && selectable ? 'left' : 'center'} sx={leadingCellSx('var(--data-table-row-bg)', isStickyBottom ? 4 : 2, isStickyBottom)}>
            {renderLeadingContent(expand, row)}
          </TableCell>
        ) : null}
        {columns.map((column) => {
          const cellSx = getStickyCellSx(column, 'var(--data-table-row-bg)', isStickyBottom ? 4 : 2);
          const mergedSx = column.cellSx ? ([cellSx, column.cellSx] as SxProps<Theme>) : cellSx;
          const stickyBottomSx = isStickyBottom ? { position: 'sticky' as const, bottom: 0, zIndex: column.sticky ? 4 : 3 } : null;
          const finalSx = stickyBottomSx ? (Array.isArray(mergedSx) ? [...mergedSx, stickyBottomSx] : [mergedSx, stickyBottomSx]) : mergedSx;

          return (
            <TableCell key={column.id} align={column.align} sx={finalSx}>
              {column.renderCell(row)}
            </TableCell>
          );
        })}
      </>
    );

    if (components?.Row) {
      const CustomRow = components.Row;
      return (
        <CustomRow key={key} {...rowProps} row={row}>
          {rowContent}
        </CustomRow>
      );
    }
    return (
      <TableRow key={key} {...rowProps}>
        {rowContent}
      </TableRow>
    );
  };

  const BodyWrapper = components?.BodyWrapper ?? React.Fragment;

  return (
    <TableContainer sx={{ overflow: 'auto', backgroundColor: '#FFFFFF', ...containerSx }}>
      <Table stickyHeader sx={{ tableLayout: 'fixed', ...(fillContainerWidth ? { width: '100%', minWidth: 0 } : { minWidth: tableMinWidth }) }}>
        {renderColGroup()}
        <TableHead>
          <TableRow>
            {hasLeadingColumn ? (
              <TableCell data-leading-cell="true" align={expandable && selectable ? 'left' : 'center'} sx={{ ...leadingCellSx('#F8FAFC', 4), borderBottom: '1px solid #E5E7EB' }}>
                {renderLeadingContent({ hasChildren: false, isExpanded: false }, undefined, true)}
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
                    ...(fillContainerWidth ? {} : { width: column.width, minWidth: column.minWidth ?? column.width }),
                    backgroundColor: '#F8FAFC',
                    borderBottom: '1px solid #E5E7EB',
                    px: 2,
                    ...TYPOGRAPHY_STYLES.base.medium,
                    fontWeight: 500,
                    ...getStickyCellSx(column, '#F8FAFC', 3),
                  }}
                >
                  {column.sortable ? (
                    <TableSortLabel active={isActive} direction={isActive ? sortDirection : 'asc'} onClick={() => onSortChange?.(sortKey)}>
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
          <BodyWrapper>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={totalColumnCount} sx={{ py: 6, textAlign: 'center' }}>
                  <Stack spacing={0.75} alignItems="center">
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.md.bold, color: '#111827' }}>{emptyTitle}</Typography>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#667085' }}>{emptyDescription}</Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : (
              rows.flatMap((row) => {
                const rowId = getRowId(row);
                const children = expandable ? (getRowChildren?.(row) ?? []) : [];
                const hasChildren = children.length > 0;
                const isExpanded = hasChildren && expandedRowIds.includes(rowId);
                const expandState: ExpandRowState = {
                  hasChildren,
                  isExpanded,
                  onToggleExpand: hasChildren ? () => setExpandedRowIds(isExpanded ? expandedRowIds.filter((id) => id !== rowId) : [...expandedRowIds, rowId]) : undefined,
                };

                const parentRow = renderBodyRow(row, expandState);
                if (!isExpanded || children.length === 0) return [parentRow];

                const childBlock = (
                  <TableRow key={`${rowId}-children`}>
                    <TableCell colSpan={totalColumnCount} sx={{ p: 0, borderBottom: '1px solid #EEF2F6' }}>
                      <Box sx={{ maxHeight: childrenMaxHeight, overflowY: 'auto', bgcolor: '#F9FAFB' }}>
                        <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
                          {renderColGroup()}
                          <TableBody>{children.map((child) => renderBodyRow(child, { hasChildren: false, isExpanded: false }, true, rowId))}</TableBody>
                        </Table>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
                return [parentRow, childBlock];
              })
            )}
          </BodyWrapper>
        </TableBody>
      </Table>
    </TableContainer>
  );
};
