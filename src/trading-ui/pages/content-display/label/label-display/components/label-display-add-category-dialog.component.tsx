import { Box, Checkbox, CircularProgress, Dialog, DialogContent, Stack, Typography } from '@mui/material';
import { CustomButton } from '../../../../../components/button';
import { contentLabelDisplayButtonPermission } from '../../../content-permission.constants';
import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';
import { ButtonElement } from '@/trading-ui/adapters/library';
import { ArrowLeft, XClose } from '@untitledui/icons';
import { categoryApi, type Category } from '../../../../../apis';
import { CategoryStatus } from '../../../../../apis/category/category.enum';
import { TYPOGRAPHY_STYLES } from '../../../../../common/constant/typography.constant';
import { dialogContainedButtonSx } from '../../../../../components/dialog/dialog-button.styles';
import { SearchInput } from '../../../../../components/form';
import { StackRow, StackRowAlignCenter, StackRowAlignCenterJustBetween, StackRowJustEnd } from '../../../../../components/styled/stack.style';
import type { LabelDisplayCategoryTreeNode, LabelDisplaySelectedCategory } from '../label-display.interface';

export interface LabelDisplayAddCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  initialSelected: LabelDisplaySelectedCategory[];
  onApply: (next: LabelDisplaySelectedCategory[]) => void;
}

type PathSegment = {
  title: string;
  nodes: LabelDisplayCategoryTreeNode[];
};

const mapCategoryToNode = (c: Category): LabelDisplayCategoryTreeNode => ({
  id: c.id,
  name: c.name,
  imageUrl: c.image ?? c.logo ?? '',
  children: c.children?.length ? c.children.map(mapCategoryToNode) : undefined,
});

const findNodeById = (nodes: LabelDisplayCategoryTreeNode[], id: string): LabelDisplayCategoryTreeNode | null => {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children?.length) {
      const hit = findNodeById(n.children, id);
      if (hit) return hit;
    }
  }
  return null;
};

const toSelectedRow = (node: LabelDisplayCategoryTreeNode): LabelDisplaySelectedCategory => ({
  id: node.id,
  name: node.name,
  imageUrl: node.imageUrl,
});

const filterTree = (nodes: LabelDisplayCategoryTreeNode[], q: string): LabelDisplayCategoryTreeNode[] => {
  if (!q) return nodes;
  const result: LabelDisplayCategoryTreeNode[] = [];
  for (const n of nodes) {
    const selfMatch = n.name.toLowerCase().includes(q);
    const filteredChildren = n.children ? filterTree(n.children, q) : [];
    if (selfMatch || filteredChildren.length > 0) {
      result.push({ ...n, children: filteredChildren.length > 0 ? filteredChildren : n.children });
    }
  }
  return result;
};

export const LabelDisplayAddCategoryDialog = ({ open, onClose, initialSelected, onApply }: LabelDisplayAddCategoryDialogProps) => {
  if (!open) return null;
  return <LabelDisplayAddCategoryDialogContent onClose={onClose} initialSelected={initialSelected} onApply={onApply} />;
};

interface LabelDisplayAddCategoryDialogContentProps {
  onClose: () => void;
  initialSelected: LabelDisplaySelectedCategory[];
  onApply: (next: LabelDisplaySelectedCategory[]) => void;
}

const LabelDisplayAddCategoryDialogContent = ({ onClose, initialSelected, onApply }: LabelDisplayAddCategoryDialogContentProps) => {
  const { data, isLoading } = useSWR(['label-display-category-tree'] as const, () => categoryApi.getCategoryTree({ compact: true, status: CategoryStatus.ACTIVE }), { revalidateOnFocus: false });

  const treeNodes = useMemo<LabelDisplayCategoryTreeNode[]>(() => (data ?? []).map(mapCategoryToNode), [data]);

  const [search, setSearch] = useState('');
  const [path, setPath] = useState<PathSegment[]>([{ title: 'Thêm danh mục', nodes: [] }]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(initialSelected.map((c) => c.id)));

  const filteredTopNodes = useMemo(() => filterTree(treeNodes, search.trim().toLowerCase()), [treeNodes, search]);

  const currentNodes = path.length === 1 ? filteredTopNodes : path[path.length - 1].nodes;
  const currentTitle = path[path.length - 1].title;

  const toggleId = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handleNavigateChildren = useCallback((node: LabelDisplayCategoryTreeNode) => {
    if (!node.children?.length) return;
    setPath((p) => [...p, { title: node.name, nodes: node.children! }]);
  }, []);

  const handleBack = useCallback(() => {
    setPath((p) => (p.length > 1 ? p.slice(0, -1) : p));
  }, []);

  const handleApply = useCallback(() => {
    const rows: LabelDisplaySelectedCategory[] = [];
    selectedIds.forEach((id) => {
      const node = findNodeById(treeNodes, id);
      if (node) rows.push(toSelectedRow(node));
    });
    onApply(rows);
    onClose();
  }, [onApply, onClose, selectedIds, treeNodes]);

  const selectedCountLabel = useMemo(() => `Đã chọn: ${selectedIds.size} danh mục`, [selectedIds.size]);

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{ width: 40, display: 'flex', justifyContent: 'flex-start', flexShrink: 0 }}>{path.length > 1 ? <ArrowLeft color="#4A5565" size={16} onClick={handleBack} /> : null}</Box>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.semibold, color: '#111827', flex: 1, textAlign: 'center' }}>{currentTitle}</Typography>
        <StackRowJustEnd sx={{ width: 40, flexShrink: 0 }}>
          <XClose color="#4A5565" size={16} onClick={onClose} />
        </StackRowJustEnd>
      </Box>

      <DialogContent sx={{ px: 3, pb: 2, pt: 2 }}>
        <Stack spacing={2}>
          <SearchInput debounceMs={320} placeholder="Tìm theo tên danh mục..." onDebouncedChange={setSearch} disabled={path.length > 1} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#475467' }}>{selectedCountLabel}</Typography>

          <Stack sx={{ maxHeight: 360, overflow: 'auto', border: '1px solid #E5E7EB', borderRadius: 2 }}>
            {isLoading ? (
              <Stack sx={{ alignItems: 'center', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={20} />
              </Stack>
            ) : currentNodes.length === 0 ? (
              <Stack sx={{ alignItems: 'center', justifyContent: 'center', py: 4 }}>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>Không có danh mục phù hợp.</Typography>
              </Stack>
            ) : (
              currentNodes.map((node) => (
                <StackRowAlignCenterJustBetween
                  key={node.id}
                  sx={{
                    px: 2,
                    py: 1.25,
                    borderBottom: '1px solid #F3F4F6',
                    '&:last-of-type': { borderBottom: 'none' },
                  }}
                >
                  <StackRowAlignCenter gap={1.5} sx={{ minWidth: 0 }}>
                    <Checkbox size="small" checked={selectedIds.has(node.id)} onChange={(_, c) => toggleId(node.id, c)} />
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' }} noWrap>
                      {node.name}
                    </Typography>
                  </StackRowAlignCenter>
                  {node.children?.length ? (
                    <ButtonElement content="Mở" variant="contained" onClick={() => handleNavigateChildren(node)} fullWidth={false} sx={dialogContainedButtonSx} />
                  ) : (
                    <Box sx={{ width: 56 }} />
                  )}
                </StackRowAlignCenterJustBetween>
              ))
            )}
          </Stack>

          <StackRow sx={{ justifyContent: 'flex-end', pt: 1 }}>
            <CustomButton variant="primary" onClick={handleApply} {...contentLabelDisplayButtonPermission('label_display_apply_category', 'Áp dụng', 'api_cms_page_update')}>
              Áp dụng
            </CustomButton>
          </StackRow>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
