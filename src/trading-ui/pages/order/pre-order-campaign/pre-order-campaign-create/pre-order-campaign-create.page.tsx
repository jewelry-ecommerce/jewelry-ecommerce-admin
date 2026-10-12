import { Box, Stack } from '@mui/material';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { STYLE } from '@/trading-ui/adapters/library';
import { importExportApi, preOrderCampaignApi } from '../../../../apis';
import { getErrorMessage } from '../../../../common/utils';
import { LabelFormPageHeader } from '../../../content-display/label/components/label-form-page-header.component';
import { useSnackbar, SnackbarType } from '@/hooks/use-snackbar.hook';
import { ROUTE_PATH } from '@/trading-ui/router/route.path';
import { PreOrderCampaignFormView } from '../components/pre-order-campaign-form-view.component';
import { preOrderCampaignButtonPermission } from '../pre-order-campaign-permission.constants';
import { PRE_ORDER_CAMPAIGN_CREATE_SESSION_REFERENCE_TYPE, PRE_ORDER_CAMPAIGN_IMPORT_REFERENCE_TYPE } from '../pre-order-campaign-sku-import.constants';
import type { PreOrderCampaignFormValues } from '../pre-order-campaign.interface';
import { assertSkusReadyForApi, buildCreatePayload, createEmptyPreOrderCampaignForm, getPreOrderCampaignEditableFlags, validatePreOrderCampaignForm } from '../pre-order-campaign.utils';

const PreOrderCampaignCreatePage = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [importSessionId] = useState(() => crypto.randomUUID());
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState<PreOrderCampaignFormValues>(createEmptyPreOrderCampaignForm);

  const editable = useMemo(() => getPreOrderCampaignEditableFlags('create'), []);
  const goList = () => void navigate(ROUTE_PATH.PRE_ORDER_CAMPAIGN);

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const error = validatePreOrderCampaignForm(values, 'create', editable) ?? assertSkusReadyForApi(values);
      if (error) {
        showSnackbar({ type: SnackbarType.ERROR, message: error });
        return;
      }

      const payload = buildCreatePayload(values);
      if (payload.skus.length === 0) {
        showSnackbar({ type: SnackbarType.ERROR, message: assertSkusReadyForApi(values) ?? 'Thiếu SKU.' });
        return;
      }

      const created = await preOrderCampaignApi.createPreOrderCampaign(payload);
      const createdId = created?.id?.trim();
      if (createdId) {
        try {
          await importExportApi.transferImportJobsReference({
            fromReferenceType: PRE_ORDER_CAMPAIGN_CREATE_SESSION_REFERENCE_TYPE,
            fromReferenceId: importSessionId,
            toReferenceType: PRE_ORDER_CAMPAIGN_IMPORT_REFERENCE_TYPE,
            toReferenceId: createdId,
          });
        } catch (transferErr) {
          console.warn('Pre-order campaign: transfer import job reference failed', transferErr);
        }
      }
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Tạo chiến dịch đặt trước thành công.' });
      goList();
    } catch (err) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack
      sx={{
        height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`,
        boxSizing: 'border-box',
        minHeight: 0,
      }}
    >
      <LabelFormPageHeader
        title="Tạo mới chiến dịch đặt trước"
        onBack={goList}
        onCancel={goList}
        onSave={() => void handleSave()}
        saveLabel="Tạo"
        loading={submitting}
        disabled={submitting}
        backPermission={preOrderCampaignButtonPermission('view', 'Quay lại danh sách chiến dịch đặt trước', 'api_pre_order_campaign_list')}
        cancelPermission={preOrderCampaignButtonPermission('create', 'Hủy tạo chiến dịch đặt trước', 'api_pre_order_campaign_create')}
        savePermission={preOrderCampaignButtonPermission('create', 'Lưu cấu hình chiến dịch đặt trước', [
          'api_pre_order_campaign_create',
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
        <PreOrderCampaignFormView values={values} editable={editable} importSessionId={importSessionId} onChange={(patch) => setValues((prev) => ({ ...prev, ...patch }))} />
      </Box>
    </Stack>
  );
};

export default PreOrderCampaignCreatePage;
