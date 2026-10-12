import { AddRounded, FilterListOutlined } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import { Fragment, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR, { useSWRConfig } from 'swr';
import { STYLE } from '@/trading-ui/adapters/library';
import { badgeApi, BadgeStatus } from '../../../../../apis';
import { TYPOGRAPHY_STYLES } from '../../../../../common/constant/typography.constant';
import { DataTable, DataTablePagination, DataTableToolbar, type DataTableColumn, type DataTableToolbarAction } from '../../../../../components/data-table';
import { getErrorMessage } from '../../../../../common/utils';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { LabelDeleteDialog } from '../../components/label-delete-dialog.component';
import { WrapperComponent } from '../../../../../components/wrapper';
import { TagCommonComponent } from '../../../../../components/tag';
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../../../../components/styled/stack.style';
import { TooltipOnHoverComponent } from '../../../../../components/tooltip/tooltip-on-hover.component';
import { formatDateTime } from '../../../../../common/utils';
import { PAGE_TAKE_DEFAULT } from '../../../../../common/constant/page-take.constant';
import { getLabelContentDetailPath, getLabelContentUpdatePath, ROUTE_PATH } from '@/trading-ui/router/route.path';
import { PermissionIconButton } from '../../../../../components/button';
import { contentLabelListButtonPermission } from '../../../content-permission.constants';
import { Edit02, Eye, Trash01 } from '@untitledui/icons';
import { getBadgeStatusLabelVi, TEXT_PRIMARY, LABEL_CONTENT_PAGE_SIZE_OPTIONS } from '../label-content.constants';
import {
  badgePositionLabelVi,
  badgeTemplateBadgeTypeLabelVi,
  badgeTemplateToTableRow,
  buildHeatmapFootSlotFromPositionCounts,
  buildHeatmapSlotsFromPositionCounts,
  countActiveLabelContentAdvancedFilters,
  heatmapSlotIdToBadgePosition,
} from '../label-content.utils';
import type { LabelContentAdvancedFilters, LabelContentDesignRow, LabelContentHeatmapSlot, LabelContentHeatmapSlotId } from '../label-content.interface';
import { LabelAdvancedFilterDialog } from '../../components/label-advanced-filter-dialog.component';
import { LabelDesignPreviewCell } from '../../components';
import { LabelContentDialogTopLeftPart } from '../components/label-content-dialog/label-content-dialog-top-left.part';

const heatmapSlotPositionLabel = (slot: LabelContentHeatmapSlot) => {
  const position = heatmapSlotIdToBadgePosition(slot.id);
  return position ? badgePositionLabelVi(position) : slot.labelVi;
};

const LabelContentHeatmapPreviewInfoBlock = ({ footSlot, onOpenPositionSlot }: { footSlot: LabelContentHeatmapSlot; onOpenPositionSlot: (id: LabelContentHeatmapSlotId) => void }) => (
  <Box
    sx={{
      borderTop: '1px solid #E5E7EB',
      bgcolor: '#FFFFFF',
      px: 1.5,
      py: 1.25,
    }}
  >
    <Typography
      sx={{
        ...TYPOGRAPHY_STYLES.sm.bold,
        color: TEXT_PRIMARY,
        textTransform: 'uppercase',
        height: 36,
      }}
    >
      Golden butterfly tiny studded affair earrings
    </Typography>

    <StackRowAlignCenterJustBetween gap={0.5}>
      <Stack gap={0.8} alignItems="flex-start">
        <StackRowAlignCenter columnGap={1} rowGap={0.25}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: TEXT_PRIMARY }}>7,000đ</Typography>
          <Typography
            sx={{
              ...TYPOGRAPHY_STYLES.sm.regular,
              color: '#8FA0B5',
              textDecoration: 'line-through',
            }}
          >
            8,000đ
          </Typography>
        </StackRowAlignCenter>
        <StackRowAlignCenter sx={{ gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '2px', border: '1px solid #ddd', bgcolor: '#F5D5C8' }} />
          <Box sx={{ width: 12, height: 12, borderRadius: '2px', border: '1px solid #ddd', bgcolor: '#D1D5DB' }} />
        </StackRowAlignCenter>
      </Stack>
      {footSlot.running > 0 || footSlot.upcoming > 0 ? (
        <HeatmapDensityBadge positionLabel={heatmapSlotPositionLabel(footSlot)} running={footSlot.running} upcoming={footSlot.upcoming} onOpen={() => onOpenPositionSlot(footSlot.id)} />
      ) : null}
    </StackRowAlignCenterJustBetween>
  </Box>
);

const HeatmapDensityBadge = ({ positionLabel, running, upcoming, onOpen, fullWidth }: { positionLabel?: string; running: number; upcoming: number; onOpen: () => void; fullWidth?: boolean }) => {
  return (
    <Box
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      sx={{
        cursor: 'pointer',
        bgcolor: 'rgba(255,255,255,0.95)',
        px: 1,
        py: fullWidth ? 0.75 : 1.25,
        backgroundColor: '#F3F4F6',
        border: '1px solid #E5E7EB',
        borderRadius: fullWidth ? '4px' : '16px',
        minWidth: fullWidth ? 0 : 100,
        width: fullWidth ? '100%' : 'auto',
        minHeight: fullWidth ? 52 : undefined,
        boxSizing: 'border-box',
      }}
    >
      <Stack gap={fullWidth ? 0.5 : 1} sx={{ alignItems: 'flex-start' }}>
        {positionLabel ? (
          <Typography
            sx={{
              ...TYPOGRAPHY_STYLES.base.medium,
              color: '#000',
            }}
          >
            {positionLabel}
          </Typography>
        ) : null}
        <Stack direction={fullWidth ? 'row' : 'column'} sx={{ width: fullWidth ? '100%' : 'auto', justifyContent: fullWidth ? 'space-between' : 'flex-start' }}>
          <StackRowAlignCenter gap={0.5}>
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#16A34A', flexShrink: 0 }} />
            <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.medium, color: TEXT_PRIMARY, lineHeight: 1.1 }}>{running}</Typography>
          </StackRowAlignCenter>
          <StackRowAlignCenter gap={0.5}>
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#EAB308', flexShrink: 0 }} />
            <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.medium, color: TEXT_PRIMARY, lineHeight: 1.1 }}>{upcoming}</Typography>
          </StackRowAlignCenter>
        </Stack>
      </Stack>
    </Box>
  );
};

const emptyAdvancedFilters: LabelContentAdvancedFilters = {
  status: '',
  type: '',
  badgeType: '',
  defaultPosition: '',
};

const LabelContentListPage = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { mutate } = useSWRConfig();

  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(PAGE_TAKE_DEFAULT.page);
  const [pageSize, setPageSize] = useState(PAGE_TAKE_DEFAULT.take);
  const [positionDialogOpen, setPositionDialogOpen] = useState(false);
  const [activeSlotId, setActiveSlotId] = useState<LabelContentHeatmapSlotId | null>(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<LabelContentAdvancedFilters>(emptyAdvancedFilters);
  const [deleteDialog, setDeleteDialog] = useState<{ data?: LabelContentDesignRow; toggle: boolean }>({ toggle: false });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const listSwr = useSWR(
    ['badge-templates', 'admin', page, pageSize, searchValue, advancedFilters.status, advancedFilters.type, advancedFilters.badgeType, advancedFilters.defaultPosition] as const,
    () =>
      badgeApi.getListBadgeTemplate({
        page,
        take: pageSize,
        isPagination: true,
        ...(searchValue.trim() ? { search: searchValue.trim() } : {}),
        ...(advancedFilters.status ? { status: advancedFilters.status } : {}),
        ...(advancedFilters.type ? { type: advancedFilters.type } : {}),
        ...(advancedFilters.badgeType ? { badgeType: advancedFilters.badgeType } : {}),
        ...(advancedFilters.defaultPosition ? { defaultPosition: advancedFilters.defaultPosition } : {}),
      }),
    { revalidateOnFocus: false },
  );

  const positionCountsSwr = useSWR(['badge-flow-position-counts'] as const, () => badgeApi.getListBadgeFlow({ page: 1, take: 1, isPagination: true }), { revalidateOnFocus: false });

  const heatmapSlots = useMemo(() => buildHeatmapSlotsFromPositionCounts(positionCountsSwr.data?.positionCounts), [positionCountsSwr.data?.positionCounts]);

  const heatmapFootSlot = useMemo(() => buildHeatmapFootSlotFromPositionCounts(positionCountsSwr.data?.positionCounts), [positionCountsSwr.data?.positionCounts]);

  const heatmapImageSlots = heatmapSlots.filter((slot) => slot.id !== 'BC');
  const heatmapBottomCenterSlot = heatmapSlots.find((slot) => slot.id === 'BC');

  const tableRows = useMemo(() => (listSwr.data?.list ?? []).map((t) => badgeTemplateToTableRow(t)), [listSwr.data]);

  const activeSlot = useMemo(() => {
    if (!activeSlotId) return undefined;
    return heatmapSlots.find((s) => s.id === activeSlotId) ?? (heatmapFootSlot.id === activeSlotId ? heatmapFootSlot : undefined);
  }, [activeSlotId, heatmapSlots, heatmapFootSlot]);

  const dialogDefaultPosition = activeSlotId ? (heatmapSlotIdToBadgePosition(activeSlotId) ?? null) : null;
  const dialogTitle = activeSlot ? `Vị trí ${activeSlot.labelVi}` : 'Vị trí';

  const handleOpenPositionSlot = useCallback((id: LabelContentHeatmapSlotId) => {
    setActiveSlotId(id);
    setPositionDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    const id = deleteDialog.data?.id;
    if (!id) return;

    setDeleteLoading(true);
    try {
      await badgeApi.deleteBadgeTemplate(id);
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Xóa label thành công.' });
      setDeleteDialog({ toggle: false });
      await mutate((key) => Array.isArray(key) && (key[0] === 'badge-templates' || key[0] === 'badge-flow-position-counts'));
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteDialog.data?.id, mutate, showSnackbar]);

  const selectedFilterLabel = useMemo(() => {
    const activeFilterCount = countActiveLabelContentAdvancedFilters(advancedFilters);
    return activeFilterCount > 0 ? `Bộ lọc (${activeFilterCount})` : 'Bộ lọc';
  }, [advancedFilters]);

  const toolbarActions = useMemo<DataTableToolbarAction[]>(
    () => [
      {
        key: 'filter',
        label: 'Bộ lọc',
        selectedOptionLabel: selectedFilterLabel,
        icon: <FilterListOutlined sx={{ fontSize: 18 }} />,
        onClick: () => setFilterDialogOpen(true),
      },
      {
        key: 'add',
        label: 'Tạo Labels',
        variant: 'contained',
        icon: <AddRounded sx={{ fontSize: 18 }} />,
        onClick: () => {
          void navigate(ROUTE_PATH.LABEL_CONTENT_CREATE);
        },
        ...contentLabelListButtonPermission('label_content_create', 'Tạo Labels', 'api_cms_page_create'),
      },
    ],
    [navigate, selectedFilterLabel],
  );

  const columns = useMemo<Array<DataTableColumn<LabelContentDesignRow>>>(
    () => [
      {
        id: 'name',
        label: 'Tên labels',
        width: 180,
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' }}>{row.name}</Typography>,
      },
      {
        id: 'preview',
        label: 'Ảnh labels',
        width: 200,
        renderCell: (row) => <LabelDesignPreviewCell badgeTemplate={row.badgeTemplate} />,
      },

      {
        id: 'badgeType',
        label: 'Phân loại',
        minWidth: 112,
        renderCell: (row) => <TagCommonComponent content={badgeTemplateBadgeTypeLabelVi(row.badgeType)} />,
      },
      {
        id: 'slot',
        label: 'Vị trí',
        width: 140,
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#374151' }}>{row.slotLabel}</Typography>,
      },
      {
        id: 'updatedAt',
        label: 'Cập nhật lần cuối',
        width: 160,
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#374151' }}>{formatDateTime(row.updatedAt)}</Typography>,
      },
      {
        id: 'status',
        label: 'Trạng thái',
        minWidth: 112,
        renderCell: (row) => <TagCommonComponent content={getBadgeStatusLabelVi(row?.status ?? '')} border />,
      },
      {
        id: 'actions',
        label: '',
        width: 140,
        align: 'center',
        sticky: 'right',
        renderCell: (row) => {
          const deleteBlocked = row.status === BadgeStatus.ACTIVE;

          return (
            <StackRowAlignCenter gap={1.5} justifyContent="center">
              <TooltipOnHoverComponent content="Xem chi tiết">
                <PermissionIconButton
                  size="small"
                  onClick={() => void navigate(getLabelContentDetailPath(row.id))}
                  {...contentLabelListButtonPermission('label_content_open_detail', 'Xem chi tiết label', 'api_cms_page_update')}
                  sx={{ color: '#374151' }}
                >
                  <Eye size={18} />
                </PermissionIconButton>
              </TooltipOnHoverComponent>
              <TooltipOnHoverComponent content="Chỉnh sửa">
                <PermissionIconButton
                  size="small"
                  onClick={() => void navigate(getLabelContentUpdatePath(row.id))}
                  {...contentLabelListButtonPermission('label_content_edit', 'Chỉnh sửa label', 'api_cms_page_update')}
                  sx={{ color: '#374151' }}
                >
                  <Edit02 size={18} />
                </PermissionIconButton>
              </TooltipOnHoverComponent>
              <TooltipOnHoverComponent content={deleteBlocked ? 'Không thể xóa label đang kích hoạt.' : 'Xóa'}>
                <PermissionIconButton
                  size="small"
                  disabled={deleteBlocked}
                  onClick={(event) => {
                    event.stopPropagation();
                    setDeleteDialog({ data: row, toggle: true });
                  }}
                  {...contentLabelListButtonPermission('label_content_delete', 'Xóa label', 'api_cms_page_delete')}
                  sx={{ color: '#374151' }}
                >
                  <Trash01 size={18} />
                </PermissionIconButton>
              </TooltipOnHoverComponent>
            </StackRowAlignCenter>
          );
        },
      },
    ],
    [navigate],
  );

  const heatmapAside = (
    <Stack sx={{ border: '1px solid #E5E7EB', gap: 1.5, p: 2, height: '100%', minHeight: 0, overflowY: 'auto' }}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: '#111827', flexShrink: 0 }}>Mật độ Label theo vị trí</Typography>
      <Box
        sx={{
          borderRadius: 2,
          border: '1px solid #E5E7EB',
          bgcolor: '#FFF',
          overflow: 'hidden',
        }}
      >
        <Stack gap={0.75}>
          <Box sx={{ position: 'relative', overflow: 'hidden' }}>
            <Box
              component="img"
              src="/images/label.jpg"
              alt=""
              sx={{
                display: 'block',
                width: '100%',
                height: 460,
                objectFit: 'cover',
                objectPosition: 'top',
                verticalAlign: 'top',
              }}
            />
            {heatmapImageSlots.map((slot) => {
              const showRunning = slot.running > 0;
              const showUpcoming = slot.upcoming > 0;
              if (!showRunning && !showUpcoming) return null;

              return (
                <Box
                  key={slot.id}
                  sx={{
                    position: 'absolute',
                    top: slot.top,
                    left: slot.left,
                    right: slot.right,
                    bottom: slot.bottom,
                    transform: slot.transform,
                  }}
                >
                  <HeatmapDensityBadge positionLabel={heatmapSlotPositionLabel(slot)} running={slot.running} upcoming={slot.upcoming} onOpen={() => handleOpenPositionSlot(slot.id)} />
                </Box>
              );
            })}
          </Box>

          {heatmapBottomCenterSlot && (heatmapBottomCenterSlot.running > 0 || heatmapBottomCenterSlot.upcoming > 0) ? (
            <Box sx={{ px: 1.25, pb: 0.75 }}>
              <HeatmapDensityBadge
                fullWidth
                positionLabel={heatmapSlotPositionLabel(heatmapBottomCenterSlot)}
                running={heatmapBottomCenterSlot.running}
                upcoming={heatmapBottomCenterSlot.upcoming}
                onOpen={() => handleOpenPositionSlot(heatmapBottomCenterSlot.id)}
              />
            </Box>
          ) : null}
        </Stack>

        <LabelContentHeatmapPreviewInfoBlock footSlot={heatmapFootSlot} onOpenPositionSlot={handleOpenPositionSlot} />
      </Box>

      <Stack gap={1} sx={{ flexShrink: 0 }}>
        <StackRowAlignCenter gap={1} sx={{ alignItems: 'flex-start' }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#22C55E', flexShrink: 0, mt: 0.35 }} />
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: TEXT_PRIMARY, lineHeight: 1.4 }}>Số lượng Label đang chạy</Typography>
        </StackRowAlignCenter>
        <StackRowAlignCenter gap={1} sx={{ alignItems: 'flex-start' }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#EAB308', flexShrink: 0, mt: 0.35 }} />
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: TEXT_PRIMARY, lineHeight: 1.4 }}>Số lượng Label đã lên lịch</Typography>
        </StackRowAlignCenter>
      </Stack>
    </Stack>
  );

  return (
    <Stack
      sx={{
        height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`,
        boxSizing: 'border-box',
        minHeight: 0,
      }}
    >
      <Stack sx={{ flex: 1, minHeight: 0 }}>
        <Fragment>
          <WrapperComponent label="Danh sách Labels" aside={heatmapAside}>
            <Stack gap={2} sx={{ flex: 1, minHeight: 0, minWidth: 0 }}>
              <Box
                sx={{
                  p: '16px',
                  border: '1px solid #E5E7EB',
                  bgcolor: '#FFFFFF',
                  borderRadius: '10px',
                }}
              >
                <DataTableToolbar
                  embedded
                  searchValue={searchValue}
                  onSearchChange={(v) => {
                    setSearchValue(v);
                    setPage(1);
                  }}
                  searchPlaceholder="Tìm theo tên trang hoặc URL..."
                  actions={toolbarActions}
                />
              </Box>
              <Stack
                sx={{
                  flex: 1,
                  minHeight: 0,
                  borderRadius: '10px 10px 0 0',
                  border: '1px solid #E5E7EB',
                  borderBottom: '1px solid #E5E7EB',
                  overflow: 'hidden',
                  bgcolor: '#FFFFFF',
                }}
              >
                <DataTable
                  rows={tableRows}
                  columns={columns}
                  getRowId={(r) => r.id}
                  containerSx={{ flex: 1, minHeight: 0, height: '100%' }}
                  emptyTitle="Không có label phù hợp"
                  emptyDescription="Thử đổi từ khóa tìm kiếm hoặc bộ lọc."
                />
              </Stack>
              <DataTablePagination
                page={page}
                pageSize={pageSize}
                totalItems={listSwr.data?.total ?? 0}
                pageSizeOptions={[...LABEL_CONTENT_PAGE_SIZE_OPTIONS]}
                itemLabel="label"
                summaryMode="total"
                onPageChange={setPage}
                onPageSizeChange={(n) => {
                  setPageSize(n);
                  setPage(1);
                }}
              />
            </Stack>
          </WrapperComponent>

          <LabelContentDialogTopLeftPart open={positionDialogOpen} positionTitle={dialogTitle} defaultPosition={dialogDefaultPosition} onClose={() => setPositionDialogOpen(false)} />

          <LabelAdvancedFilterDialog
            open={filterDialogOpen}
            onClose={() => setFilterDialogOpen(false)}
            value={advancedFilters}
            onApply={(next) => {
              setAdvancedFilters(next);
              setPage(1);
            }}
            onReset={() => {
              setAdvancedFilters(emptyAdvancedFilters);
              setPage(1);
            }}
          />

          <LabelDeleteDialog
            open={deleteDialog.toggle}
            title="Xác nhận xóa label"
            itemName={deleteDialog.data?.name}
            loading={deleteLoading}
            onClose={() => setDeleteDialog({ toggle: false })}
            onConfirm={() => void handleConfirmDelete()}
          />
        </Fragment>
      </Stack>
    </Stack>
  );
};

export default LabelContentListPage;
