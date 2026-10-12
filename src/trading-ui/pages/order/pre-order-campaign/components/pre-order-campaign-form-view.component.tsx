import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { LayersThree01, Upload01 } from '@untitledui/icons';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { PreOrderProductSourceType, preOrderCampaignApi } from '../../../../apis';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { getErrorMessage } from '../../../../common/utils';
import { isoToStoredDateTime, storedDateTimeToIso, formatStoredDateTimeNow } from '../../../../common/utils/date-format.util';
import { ButtonIconContentComponent } from '../../../../components/button';
import { TextDateInput, TextInput, SelectInput } from '../../../../components/form';
import { HighlightStatusToggle } from '../../../../components/switch/highlight-status-toggle.component';
import { StackRow } from '../../../../components/styled';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { ProductSpuImportDialog } from '../../../product/product-spu/components/product-spu-import-dialog.component';
import { ProductSpuTaskManagerDrawer } from '../../../product/product-spu/components/product-spu-task-manager-drawer.component';
import { PRE_ORDER_CAMPAIGN_NAME_MAX } from '../pre-order-campaign.constants';
import type { PreOrderCampaignFormEditableFlags, PreOrderCampaignFormValues } from '../pre-order-campaign.interface';
import { preOrderCampaignButtonPermission } from '../pre-order-campaign-permission.constants';
import { PRE_ORDER_CAMPAIGN_CREATE_SESSION_REFERENCE_TYPE, PRE_ORDER_CAMPAIGN_IMPORT_REFERENCE_TYPE, PRE_ORDER_CAMPAIGN_SKU_IMPORT_SAMPLE_URL } from '../pre-order-campaign-sku-import.constants';
import { usePreOrderCampaignSkuImportTaskManager } from '../use-pre-order-campaign-sku-import-task-manager.hook';
import { PreOrderCampaignProductSourcePanel } from './pre-order-campaign-product-source-panel.component';
import { PreOrderCampaignSkuPickerPanel } from './pre-order-campaign-sku-picker-panel.component';

type SectionCardProps = {
  title: string;
  children: ReactNode;
};

const fromStoredDateTimeToIso = (stored: string): string | null => {
  const iso = storedDateTimeToIso(stored);
  return iso || null;
};

const SectionCard = ({ title, children }: SectionCardProps) => (
  <Stack sx={{ border: '1px solid #E5E7EB', borderRadius: '10px', bgcolor: '#FFF', p: 2.5, gap: 2 }}>
    <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: '#101828' }}>{title}</Typography>
    {children}
  </Stack>
);

export type PreOrderCampaignFormViewProps = {
  values: PreOrderCampaignFormValues;
  editable: PreOrderCampaignFormEditableFlags;
  /** Campaign id khi edit — gắn IE job reference. */
  campaignId?: string;
  /** Session id create — gắn IE job trước khi có campaignId. */
  importSessionId?: string;
  onChange: (patch: Partial<PreOrderCampaignFormValues>) => void;
};

export const PreOrderCampaignFormView = ({ values, editable, campaignId, importSessionId, onChange }: PreOrderCampaignFormViewProps) => {
  const { showSnackbar } = useSnackbar();
  const [importOpen, setImportOpen] = useState(false);
  const [importSubmitting, setImportSubmitting] = useState(false);

  const nowStored = formatStoredDateTimeNow();
  const startStored = isoToStoredDateTime(values.startAt);
  const endStored = isoToStoredDateTime(values.endAt);
  const expectedAvailableStored = isoToStoredDateTime(values.expectedAvailableAt);

  const showVariantImport = values.productSourceType === PreOrderProductSourceType.VARIANT && editable.productScope;
  const importActionCode = campaignId?.trim() ? 'edit' : 'create';

  const jobReference = useMemo(() => {
    const existingCampaignId = campaignId?.trim();
    if (existingCampaignId) {
      return { referenceType: PRE_ORDER_CAMPAIGN_IMPORT_REFERENCE_TYPE, referenceId: existingCampaignId };
    }
    const sessionId = importSessionId?.trim();
    if (sessionId) {
      return { referenceType: PRE_ORDER_CAMPAIGN_CREATE_SESSION_REFERENCE_TYPE, referenceId: sessionId };
    }
    return null;
  }, [campaignId, importSessionId]);

  const skuImportTaskManager = usePreOrderCampaignSkuImportTaskManager({
    trackJobs: showVariantImport,
    selectedSkus: values.skus,
    onSkusChange: (skus) => onChange({ skus }),
    jobReference,
  });

  const badgeTemplatesSwr = useSWR(['pre-order-campaign-badge-templates'] as const, () => preOrderCampaignApi.getPreOrderCampaignBadgeTemplates(), {
    revalidateOnFocus: false,
  });

  const badgeTemplateOptions = useMemo(
    () =>
      (badgeTemplatesSwr.data?.list ?? []).map((item) => ({
        value: item.id,
        label: item.name,
      })),
    [badgeTemplatesSwr.data?.list],
  );

  const handleStartSkuImport = async (file: File) => {
    setImportSubmitting(true);
    try {
      await skuImportTaskManager.startSkuImport(file);
      setImportOpen(false);
      skuImportTaskManager.openTaskManager();
      showSnackbar({
        type: SnackbarType.SUCCESS,
        message: 'Đã gửi file import. Theo dõi tiến trình trong Trình quản lý tác vụ.',
      });
    } catch (err) {
      showSnackbar({ message: getErrorMessage(err), type: SnackbarType.ERROR });
    } finally {
      setImportSubmitting(false);
    }
  };

  return (
    <Stack sx={{ height: '100%', minHeight: 0 }}>
      <Stack gap={2.5} sx={{ p: 3, pb: 2, overflow: 'auto', flex: 1, minHeight: 0 }}>
        <SectionCard title="Thông tin chung">
          <TextInput
            label="Tên chiến dịch"
            name="name"
            requiredMark
            value={values.name}
            onChange={(e) => onChange({ name: e.target.value.slice(0, PRE_ORDER_CAMPAIGN_NAME_MAX) })}
            placeholder="VD: ATTR_COLOR"
            disabled={!editable.name}
            fullWidth
            size="small"
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <TextDateInput
                mode="dateTime"
                label="Thời gian bắt đầu"
                requiredMark
                value={startStored}
                onChange={(next) => onChange({ startAt: fromStoredDateTimeToIso(next) })}
                placeholder="dd/mm/yyyy hh:mm"
                disabled={!editable.startAt}
                minDate={editable.startAt ? nowStored : undefined}
              />
              {!editable.startAt ? <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#6B7280', mt: 0.75 }}>Khóa thời gian bắt đầu để bảo toàn đơn hàng đã phát sinh.</Typography> : null}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <TextDateInput
                mode="dateTime"
                label="Thời gian kết thúc"
                requiredMark
                value={endStored}
                onChange={(next) => onChange({ endAt: fromStoredDateTimeToIso(next) })}
                placeholder="dd/mm/yyyy hh:mm"
                disabled={!editable.endAt}
                minDate={startStored || undefined}
              />
            </Box>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <TextDateInput
                mode="dateTime"
                label="Thời gian mở bán dự kiến"
                value={expectedAvailableStored}
                onChange={(next) => onChange({ expectedAvailableAt: fromStoredDateTimeToIso(next) })}
                placeholder="dd/mm/yyyy hh:mm"
                disabled={!editable.expectedAvailableAt}
                minDate={editable.expectedAvailableAt ? nowStored : undefined}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0, display: { xs: 'none', sm: 'block' } }} aria-hidden />
          </Stack>
        </SectionCard>

        <SectionCard title="Cấu hình Label - Tích hợp CMS">
          {badgeTemplatesSwr.isLoading ? (
            <Stack alignItems="center" py={2}>
              <CircularProgress size={24} />
            </Stack>
          ) : (
            <SelectInput
              label="Label áp dụng"
              value={values.badgeTemplateId}
              onChange={(e) => onChange({ badgeTemplateId: String(e.target.value) })}
              options={badgeTemplateOptions}
              placeholder="Vui lòng chọn label..."
              allowDeselect
              disabled={!editable.badgeTemplate}
              fullWidth
            />
          )}
        </SectionCard>

        <SectionCard title="Phạm vi sản phẩm">
          {!editable.productScope ? (
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>Chiến dịch đang chạy / đã lên lịch / tạm ngưng: không cho thêm hoặc xóa SKU.</Typography>
          ) : null}
          <PreOrderCampaignProductSourcePanel
            productSourceType={values.productSourceType}
            productSourceRefs={values.productSourceRefs}
            disabled={!editable.productScope}
            onProductSourceTypeChange={(productSourceType) => onChange({ productSourceType })}
            onProductSourceRefsChange={(productSourceRefs) => onChange({ productSourceRefs })}
            onClearSelectedSkus={() => onChange({ skus: [] })}
          />
        </SectionCard>

        <SectionCard title="Danh sách biến thể áp dụng đặt trước">
          {showVariantImport ? (
            <StackRow gap={1}>
              <ButtonIconContentComponent
                icon={<Upload01 size={20} color="#737373" />}
                content="Import excel"
                onClick={() => setImportOpen(true)}
                {...preOrderCampaignButtonPermission(importActionCode, 'Import excel SKU chiến dịch đặt trước', [
                  'api_importexport_get_topic_configs_1',
                  'api_importexport_post_topic_configs_1',
                  'api_importexport_get_jobs_1',
                ])}
              />
              <ButtonIconContentComponent
                icon={<LayersThree01 size={20} color="#737373" />}
                content="Trình quản lý tác vụ"
                onClick={skuImportTaskManager.openTaskManager}
                {...preOrderCampaignButtonPermission(importActionCode, 'Trình quản lý tác vụ import SKU', ['api_importexport_get_topic_configs_1', 'api_importexport_get_jobs_1'])}
              />
            </StackRow>
          ) : null}
          <PreOrderCampaignSkuPickerPanel
            productSourceType={values.productSourceType}
            productSourceRefs={values.productSourceRefs}
            startAt={values.startAt}
            endAt={values.endAt}
            badgeTemplateId={values.badgeTemplateId}
            selectedSkus={values.skus}
            disabled={!editable.productScope}
            onChange={(skus) => onChange({ skus })}
          />
        </SectionCard>
      </Stack>

      <Box sx={{ px: 3, pb: 3, pt: 1, flexShrink: 0, bgcolor: '#F9FAFB' }}>
        <HighlightStatusToggle
          label="Kích hoạt chiến dịch"
          checked={values.isActive}
          onCheckedChange={(isActive) => onChange({ isActive })}
          disabled={!editable.isActive}
          activeLabel="Kích hoạt"
          inactiveLabel="Vô hiệu hoá"
        />
      </Box>

      {showVariantImport ? (
        <>
          <ProductSpuImportDialog
            open={importOpen}
            onClose={() => setImportOpen(false)}
            submitting={importSubmitting}
            onDownloadTemplate={() => {
              const link = document.createElement('a');
              link.href = PRE_ORDER_CAMPAIGN_SKU_IMPORT_SAMPLE_URL;
              link.download = 'Import_SKU_Template.xlsx';
              link.rel = 'noopener noreferrer';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã kích hoạt tải file mẫu.' });
            }}
            onStartImport={handleStartSkuImport}
          />

          <ProductSpuTaskManagerDrawer
            open={skuImportTaskManager.taskManagerOpen}
            onClose={() => skuImportTaskManager.setTaskManagerOpen(false)}
            jobs={skuImportTaskManager.ieJobsRes ?? { list: [], total: 0 }}
            loading={skuImportTaskManager.taskManagerJobsLoading}
            knownFileNames={skuImportTaskManager.importKnownFileNames}
            applyImportJobId={skuImportTaskManager.currentImportJobId}
            onApplyImportJob={(jobId) => void skuImportTaskManager.applyImportJobToForm(jobId)}
            applyingJobId={skuImportTaskManager.applyingJobId}
          />
        </>
      ) : null}
    </Stack>
  );
};
