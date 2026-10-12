import { AddRounded, KeyboardArrowDown } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';
import type { Category } from '../../../../../../apis/category/category.entities';
import { categoryApi, type QueryCategoryTreeDto } from '../../../../../../apis';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { TYPOGRAPHY_STYLES } from '../../../../../../common/constant/typography.constant';
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../../../../../components/styled/stack.style';
import { CustomButton, PermissionIconButton } from '../../../../../../components/button';
import { productCategoryButtonPermission, PRODUCT_CATEGORY_PAGE_SCOPE } from '../../../../product-permission.constants';
import { usePermissionGate } from '../../../../../../permissions/use-permission-gate.hook';
import { useListPageViewAccess } from '../../../../../../permissions/use-list-page-view-access.hook';
import { DialogConfirmComponent } from '../../../../../../components/dialog';
import { toggleExpandedId } from '../../category.constant';
import { EmptyComponent } from '../../../../../../components/empty/empty.component';
import { getErrorMessage } from '../../../../../../common/utils';
import { LoadingComponent } from '../../../../../../components/loading/loading.component';
import useSWR from 'swr';
import { type CategoryGlobalState } from '../../category.interface';
import { CategoryPageViews } from '../../category.enum';
import { Plus, Trash03 } from '@untitledui/icons';
import { OrderType } from '../../../../../../apis/order';
import { getCatalogDependencyItems, getCatalogInUseDialogCopy, isCatalogInUseError } from '../../../utils/catalog-in-use-error.util';

interface CategoryListPartProps {
  screenState: CategoryGlobalState;
  setScreenState: React.Dispatch<React.SetStateAction<CategoryGlobalState>>;
}

export const CategoryListPart: React.FC<CategoryListPartProps> = ({ screenState, setScreenState }) => {
  // hook
  const { showSnackbar } = useSnackbar();
  const canViewList = useListPageViewAccess(PRODUCT_CATEGORY_PAGE_SCOPE, { listApiCode: 'api_category_list' });
  const canViewCategory = usePermissionGate(productCategoryButtonPermission('open_detail', 'Xem chi tiết danh mục sản phẩm', 'api_category_update'));

  // state
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [deleteOpen, setDeleteOpen] = useState<{ data?: Category; toggle: boolean }>({ toggle: false });
  const [loadingDel, setLoadingDel] = useState(false);
  const [inUseDialog, setInUseDialog] = useState<{
    open: boolean;
    title: string;
    highlightTitle: string;
    description: string;
  }>({ open: false, title: '', highlightTitle: '', description: '' });

  // function
  const {
    data: tree = [],
    isLoading,
    mutate: mutateCategoryTree,
  } = useSWR(
    ['product/admin/categories/tree', { compact: true, orderBy: 'updatedAt', orderType: OrderType.DESC }],
    ([, params]) => categoryApi.getCategoryTree(params as Partial<QueryCategoryTreeDto>),
    {
      revalidateOnFocus: false,
    },
  );

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => toggleExpandedId(prev, id));
  }, []);

  const NodeRow = useCallback(
    ({ node, depth }: { node: Category; depth: number }) => {
      const hasChildren = Boolean(node.children?.length);
      const expanded = expandedIds.has(node.id);
      const isSelected = screenState?.selectedCategoryId === node.id;
      const canAddChild = (node.level ?? depth + 1) < 3;

      return (
        <Stack sx={{ width: '100%', flexShrink: 0, minHeight: 0 }}>
          <StackRowAlignCenterJustBetween
            onClick={() => {
              if (!canViewCategory) return;
              setScreenState({ ...screenState, selectedCategoryId: node.id, view: CategoryPageViews.UPDATE });
            }}
            sx={{
              p: 1,
              borderRadius: 2,
              cursor: 'pointer',
              userSelect: 'none',
              bgcolor: isSelected ? '#F9FAFB' : '#F5F9FF',
              '&:hover': { bgcolor: '#F9FAFB' },
              ml: depth * 2,
              gap: 1,
              position: 'relative',
              flexShrink: 0,
              '& .category-actions': { opacity: 0 },
              '&:hover .category-actions': { opacity: 1 },
            }}
          >
            <StackRowAlignCenter gap={1} sx={{ minWidth: 0 }}>
              <Box sx={{ width: 28, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                {hasChildren ? (
                  <Box
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(node.id);
                    }}
                    role="button"
                    tabIndex={0}
                    sx={{
                      width: 26,
                      height: 26,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 1,
                      '& svg': {
                        transition: 'transform 160ms ease',
                        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      },
                      '&:hover': { bgcolor: 'rgba(16,24,40,0.04)' },
                    }}
                  >
                    <KeyboardArrowDown fontSize="small" sx={{ color: '#667085' }} />
                  </Box>
                ) : (
                  <Box sx={{ width: 26, height: 26 }} />
                )}
              </Box>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827', p: 1 }} noWrap>
                {node.name}
              </Typography>
            </StackRowAlignCenter>

            <StackRowAlignCenter className="category-actions" sx={{ transition: 'opacity 120ms ease' }}>
              {canAddChild ? (
                <PermissionIconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setScreenState({ ...screenState, view: CategoryPageViews.CREATE, createParent: node });
                  }}
                  {...productCategoryButtonPermission('create', 'Tạo danh mục con', 'api_category_create')}
                  sx={{ p: 0.25 }}
                >
                  <Plus size={20} color="#111827" />
                </PermissionIconButton>
              ) : null}
              <PermissionIconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteOpen({ data: node, toggle: true });
                }}
                {...productCategoryButtonPermission('delete', 'Xóa danh mục', 'api_category_delete')}
                sx={{ p: 0.25 }}
              >
                <Trash03 size={20} color="#6B7280" />
              </PermissionIconButton>
            </StackRowAlignCenter>
          </StackRowAlignCenterJustBetween>

          {hasChildren && expanded ? (
            <Stack sx={{ width: '100%', flexDirection: 'column', gap: 2, pt: 0.5, minHeight: 0 }}>
              {node.children!.map((c) => (
                <NodeRow key={c.id} node={c} depth={depth + 1} />
              ))}
            </Stack>
          ) : null}
        </Stack>
      );
    },
    [canViewCategory, expandedIds, screenState, setScreenState, toggleExpand],
  );

  const cannotDeleteBecauseChildren = (deleteOpen.data?.children?.length ?? 0) > 0;

  const handleConfirmDelete = async () => {
    if (!deleteOpen.data || cannotDeleteBecauseChildren) return;
    setLoadingDel(true);
    try {
      await categoryApi.deleteCategory(deleteOpen?.data?.id);
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Xóa danh mục thành công' });
      setDeleteOpen((prev) => ({ ...prev, toggle: false }));
      setScreenState({ ...screenState, selectedCategoryId: undefined, view: CategoryPageViews.LIST });
      mutateCategoryTree();
    } catch (error) {
      if (isCatalogInUseError(error)) {
        const copy = getCatalogInUseDialogCopy('CATEGORY', getCatalogDependencyItems(error));
        setDeleteOpen((prev) => ({ ...prev, toggle: false }));
        setInUseDialog({ open: true, ...copy });
      } else {
        showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
      }
    } finally {
      setLoadingDel(false);
    }
  };

  if (!canViewList) return null;

  return (
    <Stack sx={{ height: '100%', minHeight: 0, gap: 3 }}>
      <StackRowAlignCenterJustBetween>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: '#101828' }}>Cấu trúc danh mục</Typography>
        <CustomButton
          variant="primary"
          fullWidth={false}
          onClick={() => setScreenState({ ...screenState, view: CategoryPageViews.CREATE, createParent: null })}
          {...productCategoryButtonPermission('create', 'Tạo danh mục', 'api_category_create')}
          sx={{
            textTransform: 'none',
            bgcolor: '#101828',
            boxShadow: 'none',
            '&:hover': { bgcolor: '#101828', opacity: 0.92 },
          }}
          startIcon={<AddRounded />}
        >
          Tạo danh mục
        </CustomButton>
      </StackRowAlignCenterJustBetween>

      <Stack
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          overflowAnchor: 'none',
          border: '1px solid #E5E7EB',
          borderRadius: '10px',
          bgcolor: '#FFFFFF',
          p: 2,
          gap: 2,
        }}
      >
        {isLoading ? <LoadingComponent /> : tree.length === 0 ? <EmptyComponent /> : tree.map((n) => <NodeRow key={n.id} node={n} depth={0} />)}
      </Stack>

      <DialogConfirmComponent
        open={deleteOpen.toggle}
        onClose={() => setDeleteOpen((prev) => ({ ...prev, toggle: false }))}
        title={cannotDeleteBecauseChildren ? 'Xoá danh mục' : 'Xác nhận xóa danh mục'}
        highlight={
          cannotDeleteBecauseChildren && deleteOpen?.data
            ? {
                tone: 'danger',
                title: `Không thể xóa Danh mục ${deleteOpen?.data?.name}`,
                description: 'Không thể xóa Danh mục này vì đang chứa Danh mục con hoặc Sản phẩm. Vui lòng gỡ bỏ/di chuyển toàn bộ dữ liệu bên trong trước khi xóa.',
              }
            : {
                tone: 'danger',
                title: `Bạn đang xoá danh mục: ${deleteOpen?.data?.name ?? ''}`,
                description: 'Hành động này không thể hoàn tác.',
              }
        }
        omitActions={cannotDeleteBecauseChildren}
        cancelLabel="Quay lại"
        confirmLabel="Xác nhận Xoá"
        cancelButtonProps={productCategoryButtonPermission('dialog_close', 'Hủy xóa danh mục sản phẩm', 'api_category_delete')}
        confirmButtonProps={productCategoryButtonPermission('delete', 'Xác nhận xóa danh mục sản phẩm', 'api_category_delete')}
        onCancel={() => setDeleteOpen((prev) => ({ ...prev, toggle: false }))}
        onConfirm={handleConfirmDelete}
        loading={loadingDel}
      />
      <DialogConfirmComponent
        open={inUseDialog.open}
        onClose={() => setInUseDialog((prev) => ({ ...prev, open: false }))}
        title={inUseDialog.title}
        highlight={{
          tone: 'warning',
          title: inUseDialog.highlightTitle,
          description: (
            <Box component="span" sx={{ whiteSpace: 'pre-line', display: 'block' }}>
              {inUseDialog.description}
            </Box>
          ),
        }}
        omitActions
        cancelLabel="Đóng"
        confirmLabel="Đóng"
        onCancel={() => setInUseDialog((prev) => ({ ...prev, open: false }))}
        onConfirm={() => setInUseDialog((prev) => ({ ...prev, open: false }))}
      />
    </Stack>
  );
};
