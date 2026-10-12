import { AddRounded, FilterListOutlined } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { STYLE } from '@/trading-ui/adapters/library';
import useSWR, { useSWRConfig } from 'swr';
import { badgeApi, type BadgeCampaign, type BadgeRule, type BadgeTemplate, BadgeCampaignDisplayStatus, BadgeCampaignStatus, BadgeRuleType } from '../../../../../apis';
import { PAGE_TAKE_DEFAULT } from '../../../../../common/constant/page-take.constant';
import { TYPOGRAPHY_STYLES } from '../../../../../common/constant/typography.constant';
import { formatDateTime } from '../../../../../common/utils';
import { DataTable, DataTablePagination, DataTableStatusTabs, DataTableToolbar, type DataTableColumn, type DataTableToolbarAction } from '../../../../../components/data-table';
import { getErrorMessage } from '../../../../../common/utils';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { LabelDeleteDialog } from '../../components/label-delete-dialog.component';
import { StackRowAlignCenter } from '../../../../../components/styled/stack.style';
import { TagCommonComponent } from '../../../../../components/tag';
import { TooltipOnHoverComponent } from '../../../../../components/tooltip/tooltip-on-hover.component';
import { WrapperComponent } from '../../../../../components/wrapper';
import { getLabelDisplayDetailPath, getLabelDisplayUpdatePath, ROUTE_PATH } from '@/trading-ui/router/route.path';
import { PermissionIconButton } from '../../../../../components/button';
import { contentLabelDisplayButtonPermission } from '../../../content-permission.constants';
import { Edit02, Eye, Trash01 } from '@untitledui/icons';
import { LabelDesignPreviewCell } from '../../components';
import { LABEL_CONTENT_PAGE_SIZE_OPTIONS, getBadgeCampaignDisplayStatusLabelVi } from '../../label-content/label-content.constants';
import { countActiveLabelDisplayFilters, LabelDisplayFilterDialog, type LabelDisplayFilterValue } from '../components/label-display-filter-dialog.component';

type LabelDisplayStatusTab = 'all' | BadgeCampaignStatus;

const getPrimaryRule = (campaign: BadgeCampaign): BadgeRule | undefined => campaign.rules[0];

const getCampaignBadgeTemplates = (campaign: BadgeCampaign): BadgeTemplate[] => {
  const seen = new Set<string>();
  const templates: BadgeTemplate[] = [];
  for (const rule of campaign.rules) {
    const template = rule.badgeTemplate;
    if (!template || seen.has(template.id)) continue;
    seen.add(template.id);
    templates.push(template);
  }
  return templates;
};

const getScopeLabel = (ruleType?: BadgeRuleType): string => {
  switch (ruleType) {
    case BadgeRuleType.ALL:
      return 'Tất cả sản phẩm';
    case BadgeRuleType.CATEGORY:
      return 'Danh mục';
    case BadgeRuleType.COLLECTION:
      return 'Bộ sưu tập';
    case BadgeRuleType.PROMOTION:
      return 'Promotion';
    case BadgeRuleType.MANUAL:
    case BadgeRuleType.OUT_OF_STOCK:
      return 'Điều kiện biến thể';
    default:
      return '—';
  }
};

const LabelDisplayListPage = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { mutate } = useSWRConfig();
  const [screenState, setScreenState] = useState<{
    page: number;
    take: number;
    search: string;
    status: LabelDisplayStatusTab;
  }>({
    ...PAGE_TAKE_DEFAULT,
    search: '',
    status: 'all',
  });
  const [deleteDialog, setDeleteDialog] = useState<{ data?: BadgeCampaign; toggle: boolean }>({ toggle: false });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<LabelDisplayFilterValue>({ displayStatus: '' });

  const resolvedDisplayStatus = advancedFilters.displayStatus || undefined;
  const resolvedStatus = resolvedDisplayStatus ? undefined : screenState.status !== 'all' ? screenState.status : undefined;

  const listSwr = useSWR(
    ['badge-flows', screenState.page, screenState.take, screenState.search, resolvedStatus, resolvedDisplayStatus] as const,
    () =>
      badgeApi.getListBadgeFlow({
        page: screenState.page,
        take: screenState.take,
        isPagination: true,
        ...(screenState.search.trim() ? { search: screenState.search.trim() } : {}),
        ...(resolvedStatus ? { status: resolvedStatus } : {}),
        ...(resolvedDisplayStatus ? { displayStatus: resolvedDisplayStatus } : {}),
      }),
    { revalidateOnFocus: false, keepPreviousData: true },
  );

  const rows = listSwr.data?.list ?? [];
  const totalItems = listSwr.data?.total ?? listSwr.data?.pagination?.total ?? 0;
  const statusCounts = listSwr.data?.counts;

  const handleConfirmDelete = useCallback(async () => {
    const id = deleteDialog.data?.id;
    if (!id) return;

    setDeleteLoading(true);
    try {
      await badgeApi.deleteBadgeFlow(id);
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Xóa cấu hình hiển thị label thành công.' });
      setDeleteDialog({ toggle: false });
      await mutate((key) => Array.isArray(key) && key[0] === 'badge-flows');
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteDialog.data?.id, mutate, showSnackbar]);

  const selectedFilterLabel = useMemo(() => {
    const activeFilterCount = countActiveLabelDisplayFilters(advancedFilters);
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
        ...contentLabelDisplayButtonPermission('label_display_filter', 'Bộ lọc', 'api_cms_page_list'),
      },
      {
        key: 'add',
        label: 'Tạo cấu hình',
        variant: 'contained',
        icon: <AddRounded sx={{ fontSize: 18 }} />,
        onClick: () => {
          void navigate(ROUTE_PATH.LABEL_DISPLAY_CREATE);
        },
        ...contentLabelDisplayButtonPermission('label_display_create', 'Tạo cấu hình', 'api_cms_page_update'),
      },
    ],
    [navigate, selectedFilterLabel],
  );

  const columns = useMemo<Array<DataTableColumn<BadgeCampaign>>>(
    () => [
      {
        id: 'displayStatus',
        label: 'Trạng thái',
        width: 140,
        renderCell: (row) => <TagCommonComponent content={getBadgeCampaignDisplayStatusLabelVi(row.displayStatus)} border />,
      },
      {
        id: 'name',
        label: 'Tên chiến dịch',
        width: 220,
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' }}>{row.name}</Typography>,
      },
      {
        id: 'preview',
        label: 'Label đang áp dụng',
        width: 200,
        renderCell: (row) => {
          const templates = getCampaignBadgeTemplates(row);
          if (!templates.length) {
            return <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#6B7280' }}>—</Typography>;
          }
          return (
            <Stack direction="row" flexWrap="wrap" gap={0.5} alignItems="center">
              {templates.map((template) => (
                <LabelDesignPreviewCell key={template.id} badgeTemplate={template} />
              ))}
            </Stack>
          );
        },
      },
      {
        id: 'scope',
        label: 'Phạm vi',
        width: 140,
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#374151' }}>{getScopeLabel(getPrimaryRule(row)?.ruleType)}</Typography>,
      },
      {
        id: 'updatedAt',
        label: 'Cập nhật lần cuối',
        width: 180,
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#374151' }}>{formatDateTime(String(row.updatedAt))}</Typography>,
      },
      {
        id: 'activeFrom',
        label: 'Ngày bắt đầu',
        width: 180,
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#374151' }}>{formatDateTime(String(row.activeFrom))}</Typography>,
      },
      {
        id: 'activeTo',
        label: 'Ngày kết thúc',
        width: 180,
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#374151' }}>{formatDateTime(String(row.activeTo))}</Typography>,
      },
      {
        id: 'actions',
        label: '',
        width: 100,
        align: 'center',
        sticky: 'right',
        renderCell: (row) => {
          const systemGenerated = row.isSystemGenerated === true;
          const systemReadonlyMsg = 'Cấu hình được đồng bộ từ Pre-order Campaign, không thể chỉnh sửa thủ công.';
          const editBlocked = systemGenerated || row.displayStatus === BadgeCampaignDisplayStatus.ENDED;
          const deleteBlocked = systemGenerated || [BadgeCampaignDisplayStatus.SCHEDULED, BadgeCampaignDisplayStatus.RUNNING].includes(row.displayStatus);
          const editTooltip = systemGenerated ? systemReadonlyMsg : editBlocked ? 'Không thể chỉnh sửa cấu hình đã kết thúc.' : 'Chỉnh sửa';
          const deleteTooltip = systemGenerated ? systemReadonlyMsg : deleteBlocked ? 'Không thể xóa cấu hình đang lên lịch hoặc đang chạy.' : 'Xóa';

          return (
            <StackRowAlignCenter gap={1.5} justifyContent="center">
              <TooltipOnHoverComponent content="Xem chi tiết">
                <PermissionIconButton
                  size="small"
                  onClick={() => void navigate(getLabelDisplayDetailPath(row.id))}
                  {...contentLabelDisplayButtonPermission('label_display_open_detail', 'Xem chi tiết cấu hình hiển thị label', 'api_cms_page_update')}
                  sx={{ color: '#374151' }}
                >
                  <Eye size={18} />
                </PermissionIconButton>
              </TooltipOnHoverComponent>
              <TooltipOnHoverComponent content={editTooltip}>
                <PermissionIconButton
                  size="small"
                  disabled={editBlocked}
                  onClick={() => void navigate(getLabelDisplayUpdatePath(row.id))}
                  {...contentLabelDisplayButtonPermission('label_display_edit', 'Chỉnh sửa cấu hình hiển thị label', 'api_cms_page_update')}
                  sx={{ color: '#374151' }}
                >
                  <Edit02 size={18} />
                </PermissionIconButton>
              </TooltipOnHoverComponent>
              <TooltipOnHoverComponent content={deleteTooltip}>
                <PermissionIconButton
                  size="small"
                  disabled={deleteBlocked}
                  onClick={(event) => {
                    event.stopPropagation();
                    setDeleteDialog({ data: row, toggle: true });
                  }}
                  {...contentLabelDisplayButtonPermission('label_display_delete', 'Xóa cấu hình hiển thị label', 'api_cms_page_delete')}
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

  return (
    <Stack
      sx={{
        height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`,
        boxSizing: 'border-box',
        minHeight: 0,
      }}
    >
      <Stack sx={{ flex: 1, minHeight: 0 }}>
        <WrapperComponent
          label="Quản lý hiển thị Labels"
          tabs={
            <DataTableStatusTabs
              tabs={[
                { value: 'all', label: 'Tất cả', count: statusCounts?.all ?? totalItems },
                {
                  value: BadgeCampaignStatus.ACTIVE,
                  label: 'Kích hoạt',
                  count: statusCounts?.active ?? 0,
                },
                {
                  value: BadgeCampaignStatus.INACTIVE,
                  label: 'Vô hiệu hóa',
                  count: statusCounts?.inactive ?? 0,
                },
                { value: BadgeCampaignStatus.DRAFT, label: 'Nháp', count: statusCounts?.draft ?? 0 },
              ]}
              activeValue={screenState.status}
              onChange={(value) => {
                setAdvancedFilters({ displayStatus: '' });
                setScreenState((prev) => ({
                  ...prev,
                  status: value as LabelDisplayStatusTab,
                  page: PAGE_TAKE_DEFAULT.page,
                }));
              }}
            />
          }
        >
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
                searchValue={screenState.search}
                onSearchChange={(next) => {
                  setScreenState((prev) => ({
                    ...prev,
                    search: next,
                    page: PAGE_TAKE_DEFAULT.page,
                  }));
                }}
                searchPlaceholder="Tìm theo tên chiến dịch..."
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
                rows={rows}
                columns={columns}
                getRowId={(row) => row.id}
                containerSx={{ flex: 1, minHeight: 0, height: '100%' }}
                emptyTitle="Không có cấu hình phù hợp"
                emptyDescription="Thử đổi từ khóa tìm kiếm hoặc bộ lọc."
              />
            </Stack>
            <DataTablePagination
              page={screenState.page}
              pageSize={screenState.take}
              totalItems={totalItems}
              pageSizeOptions={[...LABEL_CONTENT_PAGE_SIZE_OPTIONS]}
              itemLabel="cấu hình"
              summaryMode="total"
              onPageChange={(page) => {
                setScreenState((prev) => ({ ...prev, page }));
              }}
              onPageSizeChange={(take) => {
                setScreenState((prev) => ({ ...prev, take, page: PAGE_TAKE_DEFAULT.page }));
              }}
            />
          </Stack>
        </WrapperComponent>
      </Stack>

      <LabelDeleteDialog
        open={deleteDialog.toggle}
        title="Xác nhận xóa cấu hình hiển thị"
        itemName={deleteDialog.data?.name}
        loading={deleteLoading}
        onClose={() => setDeleteDialog({ toggle: false })}
        onConfirm={() => void handleConfirmDelete()}
      />

      <LabelDisplayFilterDialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        value={advancedFilters}
        onReset={() => {
          setAdvancedFilters({ displayStatus: '' });
          setScreenState((prev) => ({ ...prev, page: PAGE_TAKE_DEFAULT.page }));
        }}
        onApply={(filters) => {
          setAdvancedFilters(filters);
          setScreenState((prev) => ({
            ...prev,
            page: PAGE_TAKE_DEFAULT.page,
          }));
        }}
      />
    </Stack>
  );
};

export default LabelDisplayListPage;
