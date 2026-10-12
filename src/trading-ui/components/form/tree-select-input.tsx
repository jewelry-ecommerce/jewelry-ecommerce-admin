import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Collapse, IconButton, InputAdornment, Paper, Popper, Stack, TextField, Typography, ClickAwayListener } from '@mui/material';
import { ChevronRight, ChevronDown, SearchLg, Check } from '@untitledui/icons';
import { formInputSx, formLabelSx } from './form-field.styles';
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';

// ---- Public types ----

export interface TreeSelectNode {
  /** Unique identifier for this node */
  value: string;
  /** Display label */
  label: string;
  /** Nested children */
  children?: TreeSelectNode[];
}

const TREE_LINE = '1px dotted black';
const TREE_RADIO_SELECTED = '#475569';
/** Cùng hệ 24px với department-tree-code-cell — line thẳng hàng radio */
const TREE_SLOT = 24;

const iconCenterX = (level: number): number => level * TREE_SLOT + TREE_SLOT / 2;

const orgVerticalLineSx = (left: number, top: string, bottom: string) => ({
  position: 'absolute' as const,
  left: `${left}px`,
  top,
  bottom,
  borderLeft: TREE_LINE,
  pointerEvents: 'none' as const,
});

export type TreeSelectVariant = 'default' | 'org-tree';

export interface TreeSelectInputProps {
  /** Label text above the input */
  label?: string;
  /** Whether to show a red asterisk */
  requiredMark?: boolean;
  /** Placeholder text when nothing is selected */
  placeholder?: string;
  /** The tree data */
  nodes: ReadonlyArray<TreeSelectNode>;
  /** Currently selected value */
  value: string;
  /** Callback when selection changes */
  onChange: (value: string) => void;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Loading state — disables interaction */
  loading?: boolean;
  /** Visual style of the tree list */
  variant?: TreeSelectVariant;
  /** Error state */
  error?: boolean;
  /** Error message to display */
  errorMessage?: string;
  /** Show search filter inside dropdown */
  searchable?: boolean;
  /** Placeholder text for search box */
  searchPlaceholder?: string;
}

// ---- Internal helpers ----

/** Find a node's label by value, traversing the tree */
const findLabelByValue = (nodes: ReadonlyArray<TreeSelectNode>, value: string): string | null => {
  for (const node of nodes) {
    if (node.value === value) return node.label;
    if (node.children) {
      const found = findLabelByValue(node.children, value);
      if (found) return found;
    }
  }
  return null;
};

/** Build full path label e.g. "Điện thoại > Điện thoại thông minh" */
const findPathByValue = (nodes: ReadonlyArray<TreeSelectNode>, value: string, path: string[] = []): string[] | null => {
  for (const node of nodes) {
    const currentPath = [...path, node.label];
    if (node.value === value) return currentPath;
    if (node.children) {
      const found = findPathByValue(node.children, value, currentPath);
      if (found) return found;
    }
  }
  return null;
};

/** Filter tree: keep nodes that match or have descendants that match */
const filterTree = (nodes: ReadonlyArray<TreeSelectNode>, query: string): TreeSelectNode[] => {
  const q = query.toLowerCase().trim();
  if (!q) return [...nodes];

  const result: TreeSelectNode[] = [];
  for (const node of nodes) {
    const labelMatch = node.label.toLowerCase().includes(q);
    const filteredChildren = node.children ? filterTree(node.children, query) : [];

    if (labelMatch || filteredChildren.length > 0) {
      result.push({
        ...node,
        children: filteredChildren.length > 0 ? filteredChildren : node.children,
      });
    }
  }
  return result;
};

/** Collect all node values (for expanding all when searching) */
const collectAllValues = (nodes: ReadonlyArray<TreeSelectNode>): Set<string> => {
  const set = new Set<string>();
  const walk = (list: ReadonlyArray<TreeSelectNode>) => {
    for (const n of list) {
      set.add(n.value);
      if (n.children) walk(n.children);
    }
  };
  walk(nodes);
  return set;
};

// ---- TreeNode row component ----

interface TreeNodeRowProps {
  node: TreeSelectNode;
  depth: number;
  selectedValue: string;
  expandedKeys: Set<string>;
  onToggle: (key: string) => void;
  onSelect: (value: string) => void;
}

const TreeNodeRow = ({ node, depth, selectedValue, expandedKeys, onToggle, onSelect }: TreeNodeRowProps) => {
  const hasChildren = Boolean(node.children?.length);
  const isExpanded = expandedKeys.has(node.value);
  const isSelected = selectedValue === node.value;

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        onClick={() => {
          if (hasChildren) {
            onToggle(node.value);
          }
          onSelect(node.value);
        }}
        sx={{
          pl: `${depth * 24 + 8}px`,
          pr: 1,
          py: 0.75,
          cursor: 'pointer',
          borderRadius: '6px',
          bgcolor: isSelected ? '#F3F4F6' : 'transparent',
          transition: 'background-color 0.12s ease',
          '&:hover': {
            bgcolor: isSelected ? '#F3F4F6' : 'rgba(15, 23, 42, 0.04)',
          },
        }}
      >
        {/* Expand/collapse icon */}
        {hasChildren ? (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.value);
            }}
            sx={{ p: 0.25, mr: 0.5 }}
          >
            {isExpanded ? <ChevronDown size={16} color="#667085" /> : <ChevronRight size={16} color="#667085" />}
          </IconButton>
        ) : (
          <Box sx={{ width: 24, mr: 0.5 }} />
        )}

        {/* Label */}
        <Typography
          sx={{
            ...TYPOGRAPHY_STYLES.sm.regular,
            fontWeight: isSelected ? 600 : hasChildren ? 500 : 400,
            color: isSelected ? '#101828' : '#344054',
            flex: 1,
          }}
        >
          {node.label}
        </Typography>

        {/* Check icon */}
        {isSelected && <Check size={16} color="#101828" />}
      </Stack>

      {/* Children (collapsible) */}
      {hasChildren && (
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          {node.children!.map((child) => (
            <TreeNodeRow key={child.value} node={child} depth={depth + 1} selectedValue={selectedValue} expandedKeys={expandedKeys} onToggle={onToggle} onSelect={onSelect} />
          ))}
        </Collapse>
      )}
    </>
  );
};

// ---- Org-tree row (radio + connector lines, always expanded) ----

interface OrgTreeNodeRowProps {
  node: TreeSelectNode;
  depth: number;
  isLast: boolean;
  parentPath: boolean[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

const OrgTreeNodeRow = ({ node, depth, isLast, parentPath, selectedValue, onSelect }: OrgTreeNodeRowProps) => {
  const isSelected = selectedValue === node.value;
  const hasChildren = Boolean(node.children?.length);
  const treeWidth = (depth + 1) * TREE_SLOT;

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        onClick={() => onSelect(node.value)}
        sx={{
          minHeight: 32,
          cursor: 'pointer',
          '&:hover .org-tree-label': {
            bgcolor: isSelected ? '#F3F4F6' : 'rgba(255, 255, 255, 0.06)',
          },
        }}
      >
        <Box
          sx={{
            width: treeWidth,
            flexShrink: 0,
            alignSelf: 'stretch',
            position: 'relative',
            overflow: 'visible',
          }}
        >
          {parentPath.map((showLine, index) =>
            showLine ? (
              <Box key={`guide-${index}`}>
                <Box sx={orgVerticalLineSx(iconCenterX(index), '0', '50%')} />
                <Box sx={orgVerticalLineSx(iconCenterX(index), '50%', '0')} />
              </Box>
            ) : null,
          )}

          {depth > 0 ? (
            <>
              <Box sx={orgVerticalLineSx(iconCenterX(depth - 1), '0', '50%')} />
              {!isLast ? <Box sx={orgVerticalLineSx(iconCenterX(depth - 1), '50%', '0')} /> : null}
              <Box
                sx={{
                  position: 'absolute',
                  left: `${iconCenterX(depth - 1)}px`,
                  top: '50%',
                  width: 12,
                  borderTop: TREE_LINE,
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              />
            </>
          ) : null}

          <Box
            sx={{
              position: 'absolute',
              left: `${depth * TREE_SLOT}px`,
              top: '50%',
              transform: 'translateY(-50%)',
              width: TREE_SLOT,
              height: TREE_SLOT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              zIndex: 1,
            }}
          >
            <Box
              sx={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                border: '1.5px solid',
                borderColor: isSelected ? TREE_RADIO_SELECTED : '#94A3B8',
                bgcolor: isSelected ? TREE_RADIO_SELECTED : 'transparent',
                boxShadow: isSelected ? 'inset 0 0 0 2px #FFFFFF' : 'none',
              }}
            />
          </Box>
        </Box>

        <Box
          className="org-tree-label"
          sx={{
            px: 1.25,
            py: 0.375,
            borderRadius: '999px',
            bgcolor: isSelected ? '#F3F4F6' : 'transparent',
            transition: 'background-color 0.12s ease',
          }}
        >
          <Typography
            sx={{
              ...TYPOGRAPHY_STYLES.sm.regular,
              fontWeight: isSelected ? 600 : 400,
              color: '#101828',
              lineHeight: '20px',
            }}
          >
            {node.label}
          </Typography>
        </Box>
      </Stack>

      {hasChildren
        ? node.children!.map((child, index) => (
            <OrgTreeNodeRow
              key={child.value}
              node={child}
              depth={depth + 1}
              isLast={index === node.children!.length - 1}
              parentPath={[...parentPath, !isLast]}
              selectedValue={selectedValue}
              onSelect={onSelect}
            />
          ))
        : null}
    </>
  );
};

// ---- Main component ----

export const TreeSelectInput = ({
  label,
  requiredMark = false,
  placeholder = 'Chọn...',
  nodes,
  value,
  onChange,
  disabled = false,
  loading = false,
  variant = 'default',
  error = false,
  errorMessage,
  searchable = true,
  searchPlaceholder = 'Tìm kiếm...',
}: TreeSelectInputProps) => {
  const isOrgTree = variant === 'org-tree';
  const isDisabled = disabled || loading;
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  // Auto-expand parents of selected value on mount (default variant only)
  useEffect(() => {
    if (isOrgTree || !value || !nodes.length) return;
    const path = findPathByValue(nodes, value);
    if (path && path.length > 1) {
      // Find parent values to expand
      const parentsToExpand = new Set<string>();
      const walk = (list: ReadonlyArray<TreeSelectNode>, target: string): boolean => {
        for (const n of list) {
          if (n.value === target) return true;
          if (n.children) {
            if (walk(n.children, target)) {
              parentsToExpand.add(n.value);
              return true;
            }
          }
        }
        return false;
      };
      walk(nodes, value);
      setExpandedKeys((prev) => new Set([...prev, ...parentsToExpand]));
    }
  }, [isOrgTree, value, nodes]);

  // Filtered nodes + expand all when searching
  const filteredNodes = useMemo(() => filterTree(nodes, search), [nodes, search]);
  const effectiveExpanded = useMemo(() => {
    if (search.trim()) return collectAllValues(filteredNodes);
    return expandedKeys;
  }, [search, filteredNodes, expandedKeys]);

  // Display text
  const displayLabel = useMemo(() => {
    if (!value) return null;
    const path = findPathByValue(nodes, value);
    return path ? path.join(' > ') : findLabelByValue(nodes, value);
  }, [nodes, value]);

  const handleToggle = useCallback((key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const handleSelect = useCallback(
    (selected: string) => {
      onChange(selected);
      setOpen(false);
      setSearch('');
    },
    [onChange],
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* Label */}
      {label ? (
        <Typography sx={formLabelSx}>
          {label}
          {requiredMark ? (
            <Box component="span" sx={{ color: '#FB2C36', ml: 0.5 }}>
              *
            </Box>
          ) : null}
        </Typography>
      ) : null}

      {/* Trigger input */}
      <Box ref={setAnchorEl}>
        <TextField
          fullWidth
          size="small"
          onClick={() => !isDisabled && setOpen((p) => !p)}
          value={displayLabel ?? ''}
          placeholder={loading ? 'Đang tải...' : placeholder}
          disabled={isDisabled}
          error={error}
          InputProps={{
            readOnly: true,
            sx: { cursor: isDisabled ? 'default' : 'pointer' },
            endAdornment: (
              <InputAdornment position="end">
                <ChevronDown size={18} color="#667085" />
              </InputAdornment>
            ),
          }}
          sx={formInputSx}
        />
      </Box>

      {/* Dropdown */}
      <Popper open={open} anchorEl={anchorEl} placement="bottom-start" style={{ zIndex: 1300, width: anchorEl?.offsetWidth }} modifiers={[{ name: 'offset', options: { offset: [0, 4] } }]}>
        <ClickAwayListener onClickAway={() => setOpen(false)}>
          <Paper
            elevation={4}
            sx={{
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              bgcolor: '#FFFFFF',
              maxHeight: 320,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Search box */}
            {searchable && (
              <Box sx={{ p: 1, borderBottom: '1px solid #E5E7EB' }}>
                <TextField
                  fullWidth
                  size="small"
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchLg size={16} color="#667085" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '6px',
                      '& fieldset': { borderColor: '#E5E7EB' },
                      '&.Mui-focused fieldset': { borderColor: '#101828', borderWidth: 1.5 },
                    },
                    '& .MuiInputBase-input': { fontSize: 13, py: 0.75 },
                  }}
                />
              </Box>
            )}

            {/* Tree list */}
            <Box sx={{ overflowY: 'auto', maxHeight: 260, p: isOrgTree ? 1 : 0.5 }}>
              {filteredNodes.length === 0 ? (
                <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085', p: 2, textAlign: 'center' }}>{loading ? 'Đang tải dữ liệu...' : 'Không tìm thấy kết quả'}</Typography>
              ) : isOrgTree ? (
                filteredNodes.map((node, index) => (
                  <OrgTreeNodeRow key={node.value} node={node} depth={0} isLast={index === filteredNodes.length - 1} parentPath={[]} selectedValue={value} onSelect={handleSelect} />
                ))
              ) : (
                filteredNodes.map((node) => (
                  <TreeNodeRow key={node.value} node={node} depth={0} selectedValue={value} expandedKeys={effectiveExpanded} onToggle={handleToggle} onSelect={handleSelect} />
                ))
              )}
            </Box>
          </Paper>
        </ClickAwayListener>
      </Popper>

      {/* Error message */}
      {error && errorMessage ? <Typography sx={{ fontSize: 12, color: '#EF4444', mt: 0.5 }}>{errorMessage}</Typography> : null}
    </Box>
  );
};
