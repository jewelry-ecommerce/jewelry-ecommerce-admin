import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { STYLE } from '@/trading-ui/adapters/library';
import useSWR from 'swr';
import { preOrderCampaignApi, PreOrderCampaignStatus } from '../../../../apis';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { getErrorMessage } from '../../../../common/utils';
import { LabelFormPageHeader } from '../../../content-display/label/components/label-form-page-header.component';
import { useSnackbar, SnackbarType } from '@/hooks/use-snackbar.hook';
import { ROUTE_PATH } from '@/trading-ui/router/route.path';
import { PreOrderCampaignFormView } from '../components/pre-order-campaign-form-view.component';
import { preOrderCampaignButtonPermission } from '../pre-order-campaign-permission.constants';
import type { PreOrderCampaignFormValues } from '../pre-order-campaign.interface';
import {
  assertSkusReadyForApi,
  buildUpdatePayload,
  canEditPreOrderCampaign,
  getPreOrderCampaignEditableFlags,
  mapCampaignToFormValues,
  validatePreOrderCampaignForm,
} from '../pre-order-campaign.utils';

const PreOrderCampaignUpdatePage = () => {
  const { campaignId = '' } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState<PreOrderCampaignFormValues | null>(null);

  const detailSwr = useSWR(campaignId ? (['pre-order-campaign-detail', campaignId] as const) : null, () => preOrderCampaignApi.getPreOrderCampaignDetail(campaignId), {
    revalidateOnFocus: false,
    onError: (err) => showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(err) }),
  });

  useEffect(() => {
    if (!detailSwr.data) return;
    if (!canEditPreOrderCampaign(detailSwr.data.status)) {
      showSnackbar({ type: SnackbarType.WARNING, message: 'Chiến dịch đã kết thúc không thể chỉnh sửa.' });
      void navigate(ROUTE_PATH.PRE_ORDER_CAMPAIGN);
      return;
    }
    setValues(mapCampaignToFormValues(detailSwr.data));
  }, [detailSwr.data, navigate, showSnackbar]);

  const editable = useMemo(() => getPreOrderCampaignEditableFlags('edit', detailSwr.data?.status ?? PreOrderCampaignStatus.DRAFT), [detailSwr.data?.status]);
  const goList = () => void navigate(ROUTE_PATH.PRE_ORDER_CAMPAIGN);

  const handleSave = async () => {
    if (!values) return;

    setSubmitting(true);
    try {
      const error = validatePreOrderCampaignForm(values, 'edit', editable) ?? (editable.productScope ? assertSkusReadyForApi(values) : null);
      if (error) {
        showSnackbar({ type: SnackbarType.ERROR, message: error });
        return;
      }

      const payload = buildUpdatePayload(values, editable);
      if (editable.productScope && (payload.skus?.length ?? 0) === 0) {
        showSnackbar({ type: SnackbarType.ERROR, message: assertSkusReadyForApi(values) ?? 'Thiếu SKU.' });
        return;
      }

      await preOrderCampaignApi.updatePreOrderCampaign(campaignId, payload);
      showSnackbar({
        type: SnackbarType.SUCCESS,
        message: 'Cập nhật chiến dịch đặt trước thành công. Hệ thống sẽ đồng bộ cấu hình Labels (CMS).',
      });
      goList();
    } catch (err) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack sx={{ height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`, boxSizing: 'border-box', minHeight: 0 }}>
      <LabelFormPageHeader
        title="Chỉnh sửa chiến dịch đặt trước"
        onBack={goList}
        onCancel={goList}
        onSave={() => void handleSave()}
        loading={submitting}
        disabled={submitting || !values || !editable.save}
        backPermission={preOrderCampaignButtonPermission('view', 'Quay lại danh sách chiến dịch đặt trước', 'api_pre_order_campaign_list')}
        cancelPermission={preOrderCampaignButtonPermission('edit', 'Hủy chỉnh sửa chiến dịch đặt trước', 'api_pre_order_campaign_update')}
        savePermission={preOrderCampaignButtonPermission('edit', 'Lưu cấu hình chiến dịch đặt trước', [
          'api_pre_order_campaign_update',
          'api_pre_order_campaign_badge_templates',
          'api_pre_order_campaign_skus_search',
          'api_collection_list',
          'api_category_list',
          'api_pim_get_admin_skus',
          'api_pim_post_admin_skus_search',
          'api_importexport_get_topic_configs_1',
          'api_importexport_post_topic_configs_1',
          'api_importexport_get_jobs_1',
        ])}
      />
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', bgcolor: '#F9FAFB' }}>
        {!values || detailSwr.isLoading ? (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
            <CircularProgress size={28} />
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#6B7280', mt: 1.5 }}>Đang tải chiến dịch...</Typography>
          </Stack>
        ) : (
          <PreOrderCampaignFormView values={values} editable={editable} campaignId={campaignId} onChange={(patch) => setValues((prev) => (prev ? { ...prev, ...patch } : prev))} />
        )}
      </Box>
    </Stack>
  );
};

export default PreOrderCampaignUpdatePage;
