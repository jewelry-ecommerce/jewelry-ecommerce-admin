import { MoreVert } from '@mui/icons-material';
import { Box, CircularProgress, ListItemIcon, ListItemText, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { Edit02 } from '@untitledui/icons';
import { useMemo, useState, type MouseEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { STYLE } from '@/trading-ui/adapters/library';
import useSWR from 'swr';
import { preOrderCampaignApi } from '../../../../apis';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { getErrorMessage } from '../../../../common/utils';
import { PermissionIconButton } from '../../../../components/button';
import { TagCommonComponent } from '../../../../components/tag';
import { LabelFormPageHeader } from '../../../content-display/label/components/label-form-page-header.component';
import { useSnackbar, SnackbarType } from '@/hooks/use-snackbar.hook';
import { getPreOrderCampaignUpdatePath, ROUTE_PATH } from '@/trading-ui/router/route.path';
import { PreOrderCampaignDetailView, resolvePreOrderCampaignStatusDisplay } from '../components/pre-order-campaign-detail-view.component';
import { preOrderCampaignButtonPermission } from '../pre-order-campaign-permission.constants';
import { canEditPreOrderCampaign } from '../pre-order-campaign.utils';

const PreOrderCampaignDetailPage = () => {
  const { campaignId = '' } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<HTMLElement | null>(null);

  const detailSwr = useSWR(campaignId ? (['pre-order-campaign-detail', campaignId] as const) : null, () => preOrderCampaignApi.getPreOrderCampaignDetail(campaignId), {
    revalidateOnFocus: false,
    onError: (err) => showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(err) }),
  });

  const campaign = detailSwr.data ?? null;
  const goList = () => void navigate(ROUTE_PATH.PRE_ORDER_CAMPAIGN);
  const canEdit = campaign ? canEditPreOrderCampaign(campaign.status) : false;
  const statusDisplay = useMemo(() => (campaign ? resolvePreOrderCampaignStatusDisplay(campaign) : ''), [campaign]);

  const handleOpenMoreMenu = (event: MouseEvent<HTMLElement>) => {
    setMoreMenuAnchor(event.currentTarget);
  };

  const handleCloseMoreMenu = () => setMoreMenuAnchor(null);

  const handleEdit = () => {
    handleCloseMoreMenu();
    if (!campaignId || !canEdit) return;
    void navigate(getPreOrderCampaignUpdatePath(campaignId));
  };

  return (
    <Stack sx={{ height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`, boxSizing: 'border-box', minHeight: 0 }} gap={0}>
      <LabelFormPageHeader
        variant="view"
        title={campaign?.name ?? 'Chi tiết chiến dịch đặt trước'}
        onBack={goList}
        backPermission={preOrderCampaignButtonPermission('view', 'Quay lại danh sách chiến dịch đặt trước', 'api_pre_order_campaign_list')}
        actionsStart={
          campaign ? (
            <>
              <TagCommonComponent content={statusDisplay} border />
              {canEdit ? (
                <PermissionIconButton
                  size="small"
                  aria-label="Thao tác khác"
                  onClick={handleOpenMoreMenu}
                  sx={{ color: '#374151', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                  {...preOrderCampaignButtonPermission('edit', 'Chỉnh sửa chiến dịch đặt trước', 'api_pre_order_campaign_update')}
                >
                  <MoreVert sx={{ fontSize: 20 }} />
                </PermissionIconButton>
              ) : null}
            </>
          ) : null
        }
      />

      <Menu
        anchorEl={moreMenuAnchor}
        open={Boolean(moreMenuAnchor)}
        onClose={handleCloseMoreMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleEdit} disabled={!canEdit}>
          <ListItemIcon>
            <Edit02 size={18} color="#374151" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#101828' }}>Chỉnh sửa</ListItemText>
        </MenuItem>
      </Menu>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', bgcolor: '#F9FAFB' }}>
        {detailSwr.isLoading || !campaign ? (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
            <CircularProgress size={28} />
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#6B7280', mt: 1.5 }}>Đang tải chi tiết chiến dịch...</Typography>
          </Stack>
        ) : (
          <PreOrderCampaignDetailView campaign={campaign} />
        )}
      </Box>
    </Stack>
  );
};

export default PreOrderCampaignDetailPage;
