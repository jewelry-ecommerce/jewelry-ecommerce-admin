import { AddRounded, ArchiveOutlined, KeyboardArrowDown } from '@mui/icons-material';
import { Box, Chip, CircularProgress, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { CustomButton } from '../../../../../components/button/custom-button';
import { PermissionIconButton } from '../../../../../components/button/permission-icon-button';
import { contentNavigationButtonPermission } from '../../../content-permission.constants';
import { closestCenter, DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CSSProperties } from 'react';
import type { CmsNavigation } from '../../../../../apis';
import IconDrag02 from '../../../../../assets/icon/icon-drag-02';
import { TYPOGRAPHY_STYLES } from '../../../../../common/constant/typography.constant';
import { StackRowAlignCenter, StackRowAlignCenterJustBetween, StackRowJustEnd } from '../../../../../components/styled/stack.style';
import { badgePreviewSx, formatBadgeLabel, formatNavigationTypeLabel } from '../site-navigation.utils';

type NavigationTreePanelProps = {
  viewMode?: boolean;
  tree: CmsNavigation[];
  isLoading: boolean;
  selectedId?: string;
  expandedIds: Set<string>;
  onToggleExpanded: (id: string) => void;
  onAddRoot: () => void;
  onAddChild: (node: CmsNavigation) => void;
  onArchive: (node: CmsNavigation) => void;
  onSelect: (id: string) => void;
  onReorder: (parentId: string | null, orderedNodes: CmsNavigation[]) => void;
  onInvalidDrop?: () => void;
};

type SortableNavigationNodeProps = {
  viewMode?: boolean;
  node: CmsNavigation;
  depth: number;
  selectedId?: string;
  expandedIds: Set<string>;
  onToggleExpanded: (id: string) => void;
  onAddChild: (node: CmsNavigation) => void;
  onArchive: (node: CmsNavigation) => void;
  onSelect: (id: string) => void;
};

const sortNodes = (nodes: CmsNavigation[]) => nodes.slice().sort((a, b) => a.sortOrder - b.sortOrder);

const findParentId = (items: CmsNavigation[], id: string, parentId: string | null = null): string | null | undefined => {
  for (const item of items) {
    if (item.id === id) return parentId;
    const childParentId = findParentId(item.children ?? [], id, item.id);
    if (childParentId !== undefined) return childParentId;
  }
  return undefined;
};

const findSiblings = (items: CmsNavigation[], parentId: string | null): CmsNavigation[] => {
  if (!parentId) return items;
  for (const item of items) {
    if (item.id === parentId) return item.children ?? [];
    const childSiblings = findSiblings(item.children ?? [], parentId);
    if (childSiblings.length) return childSiblings;
  }
  return [];
};

const SortableNavigationNode = ({ viewMode = false, node, depth, selectedId, expandedIds, onToggleExpanded, onAddChild, onArchive, onSelect }: SortableNavigationNodeProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: node.id, disabled: viewMode });
  const hasChildren = Boolean(node.children?.length);
  const expanded = expandedIds.has(node.id);
  const selected = selectedId === node.id;

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.92 : 1,
  };

  return (
    <Stack ref={setNodeRef} style={style} sx={{ flexShrink: 0 }}>
      <StackRowAlignCenterJustBetween
        onClick={() => onSelect(node.id)}
        sx={{
          ml: Math.max(0, depth - 1) * 2,
          px: 1,
          py: 0.75,
          borderRadius: 2,
          cursor: 'pointer',
          bgcolor: selected ? '#EEF2FF' : '#F8FAFC',
          border: selected ? '1px solid #C7D2FE' : '1px solid transparent',
          '&:hover': { bgcolor: '#F3F4F6' },
          '&:hover .navigation-actions': { opacity: 1 },
        }}
      >
        <StackRowAlignCenter gap={1} sx={{ minWidth: 0 }}>
          {!viewMode ? (
            <Box
              {...attributes}
              {...listeners}
              aria-label="Kéo để sắp xếp"
              onClick={(event) => event.stopPropagation()}
              sx={{
                cursor: 'grab',
                display: 'flex',
                alignItems: 'center',
                color: '#9CA3AF',
                flexShrink: 0,
              }}
            >
              <IconDrag02 />
            </Box>
          ) : null}
          <Box sx={{ width: 26, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
            {hasChildren ? (
              <IconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleExpanded(node.id);
                }}
                sx={{ p: 0.25 }}
              >
                <KeyboardArrowDown fontSize="small" sx={{ color: '#667085', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </IconButton>
            ) : (
              <Box sx={{ width: 24 }} />
            )}
          </Box>
          <Stack sx={{ minWidth: 0 }}>
            <StackRowAlignCenter gap={1} sx={{ minWidth: 0 }}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#111827' }} noWrap>
                {node.label}
              </Typography>
              <Chip size="small" label={formatNavigationTypeLabel(node.type)} sx={{ height: 20, fontSize: 11 }} />
              {node.badges?.[0] ? <Chip size="small" label={formatBadgeLabel(node.badges[0])} sx={{ height: 20, fontSize: 11, ...badgePreviewSx(node.badges[0]) }} /> : null}
            </StackRowAlignCenter>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>
              Cấp {depth} · Menu xổ xuống {node.showOnMenuPopup ? 'Bật' : 'Tắt'} · Thanh trượt danh mục {node.showOnPlp ? 'Bật' : 'Tắt'}
            </Typography>
          </Stack>
        </StackRowAlignCenter>

        {!viewMode ? (
          <StackRowAlignCenter className="navigation-actions" sx={{ opacity: 0, transition: 'opacity 120ms ease' }}>
            <Tooltip title="Thêm menu con">
              <PermissionIconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  onAddChild(node);
                }}
                {...contentNavigationButtonPermission('navigation_add_child', 'Thêm menu con', 'api_cms_navigation_update')}
              >
                <AddRounded fontSize="small" />
              </PermissionIconButton>
            </Tooltip>
            <Tooltip title="Xóa">
              <PermissionIconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  onArchive(node);
                }}
                {...contentNavigationButtonPermission('navigation_archive', 'Lưu trữ menu', 'api_cms_navigation_update')}
              >
                <ArchiveOutlined fontSize="small" />
              </PermissionIconButton>
            </Tooltip>
          </StackRowAlignCenter>
        ) : null}
      </StackRowAlignCenterJustBetween>

      {hasChildren && expanded ? (
        <SortableContext items={sortNodes(node.children ?? []).map((child) => child.id)} strategy={verticalListSortingStrategy}>
          <Stack gap={1} sx={{ pt: 1 }}>
            {sortNodes(node.children ?? []).map((child) => (
              <SortableNavigationNode
                key={child.id}
                viewMode={viewMode}
                node={child}
                depth={depth + 1}
                selectedId={selectedId}
                expandedIds={expandedIds}
                onToggleExpanded={onToggleExpanded}
                onAddChild={onAddChild}
                onArchive={onArchive}
                onSelect={onSelect}
              />
            ))}
          </Stack>
        </SortableContext>
      ) : null}
    </Stack>
  );
};

export const NavigationTreePanel = ({
  viewMode = false,
  tree,
  isLoading,
  selectedId,
  expandedIds,
  onToggleExpanded,
  onAddRoot,
  onAddChild,
  onArchive,
  onSelect,
  onReorder,
  onInvalidDrop,
}: NavigationTreePanelProps) => {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const sortedTree = sortNodes(tree);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const activeParentId = findParentId(tree, activeId);
    const overParentId = findParentId(tree, overId);

    if (activeParentId !== overParentId) {
      onInvalidDrop?.();
      return;
    }

    const siblings = sortNodes(findSiblings(tree, activeParentId ?? null));
    const oldIndex = siblings.findIndex((item) => item.id === activeId);
    const newIndex = siblings.findIndex((item) => item.id === overId);
    if (oldIndex < 0 || newIndex < 0) return;

    onReorder(activeParentId ?? null, arrayMove(siblings, oldIndex, newIndex));
  };

  return (
    <Stack sx={{ flex: '4 1 0%', minWidth: 0, minHeight: 0, gap: 2 }}>
      {!viewMode ? (
        <StackRowJustEnd>
          <CustomButton
            variant="primary"
            fullWidth={false}
            onClick={onAddRoot}
            sx={{ width: 'fit-content', textTransform: 'none', bgcolor: '#101828', '&:hover': { bgcolor: '#101828' } }}
            startIcon={<AddRounded />}
            {...contentNavigationButtonPermission('navigation_add_root', 'Thêm menu', 'api_cms_navigation_update')}
          >
            Thêm menu
          </CustomButton>
        </StackRowJustEnd>
      ) : null}
      <Stack
        gap={1}
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          border: '1px solid #E5E7EB',
          borderRadius: '10px',
          bgcolor: '#FFFFFF',
          p: 2,
        }}
      >
        {isLoading ? (
          <Stack alignItems="center" justifyContent="center" sx={{ flex: 1 }}>
            <CircularProgress />
          </Stack>
        ) : sortedTree.length ? (
          <DndContext sensors={viewMode ? [] : sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={viewMode ? () => undefined : handleDragEnd}>
            <SortableContext items={sortedTree.map((node) => node.id)} strategy={verticalListSortingStrategy}>
              <Stack gap={1}>
                {sortedTree.map((node) => (
                  <SortableNavigationNode
                    key={node.id}
                    viewMode={viewMode}
                    node={node}
                    depth={1}
                    selectedId={selectedId}
                    expandedIds={expandedIds}
                    onToggleExpanded={onToggleExpanded}
                    onAddChild={onAddChild}
                    onArchive={onArchive}
                    onSelect={onSelect}
                  />
                ))}
              </Stack>
            </SortableContext>
          </DndContext>
        ) : (
          <Stack alignItems="center" justifyContent="center" sx={{ flex: 1, color: '#667085' }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold }}>Chưa có menu điều hướng</Typography>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular }}>Tạo mục menu đầu tiên để bắt đầu.</Typography>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};
