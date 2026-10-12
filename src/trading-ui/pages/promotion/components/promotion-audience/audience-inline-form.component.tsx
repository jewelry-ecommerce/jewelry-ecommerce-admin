import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
void React;
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { LayersThree01, Upload01 } from '@untitledui/icons';
import useSWR from 'swr';
import { AudienceConfigType, promotionApi, type PromotionAudienceConfigV1, type PromotionCustomerAudienceItemDto } from '../../../../apis';
import { getErrorMessage } from '../../../../common/utils';
import { SelectInput, TextInput } from '../../../../components/form';
import { CustomButton, PermissionIconButton, ButtonIconContentComponent } from '../../../../components/button';
import { StackRow, StackRowAlignCenter, StackRowAlignCenterJustBetween, StackRowJustEnd } from '../../../../components/styled';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { ProductSpuImportDialog } from '../../../product/product-spu/components/product-spu-import-dialog.component';
import { ProductSpuTaskManagerDrawer } from '../../../product/product-spu/components/product-spu-task-manager-drawer.component';
import {
  PROMOTION_AUDIENCE_MODE_LABEL,
  PROMOTION_CUSTOMER_IMPORT_SAMPLE_URL,
  formatPromotionAudienceSummary,
  buildPromotionAudienceConfig,
  arePromotionAudienceFormValuesEqual,
  isPromotionAudienceFormSavable,
  normalizeAudienceUploadBatchId,
  validatePromotionAudienceForm,
  type PromotionAudienceFormValues,
} from '../../promotion.constant';
import { promotionListButtonPermission } from '../../promotion-permission.constants';
import { usePromotionCustomerImportTaskManager } from '../../hooks/use-promotion-customer-import-task-manager.hook';
import type { PromotionImportedCustomerRow } from '../../utils/promotion-customer-import-result.util';
import { loadCustomersFromPromotionCustomerImportJob } from '../../utils/promotion-customer-import-result.util';
import { PromotionCustomerPhoneLookup } from '../promotion-customer-phone-lookup.component';
import { formatLoyaltyCustomerStatusLabel } from '../../../loyalty/loyalty-customer/constants/loyalty-status.constants';
import { ReadonlyField } from '../promotion-general/promotion-readonly-field.component';
import { AUDIENCE_TYPE_SELECT_OPTIONS, getImportedCustomerDisplayName, getImportedCustomerKey, mapAudienceToFormValues } from './promotion-audience-form.mapper';

const renderImportedCustomerRow = (customer: PromotionImportedCustomerRow) => (
  <StackRowAlignCenter key={getImportedCustomerKey(customer)} gap={1.5} sx={{ px: 1.5, py: 1.25, borderBottom: '1px solid #F3F4F6', '&:last-of-type': { borderBottom: 'none' } }}>
    <Stack sx={{ minWidth: 0, flex: 1, gap: 0.25 }}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }} noWrap>
        {getImportedCustomerDisplayName(customer)}
      </Typography>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#667085' }} noWrap>
        SĐT: {customer.phone}
        {customer.status ? ` · ${formatLoyaltyCustomerStatusLabel(customer.status)}` : ''}
      </Typography>
    </Stack>
  </StackRowAlignCenter>
);

// const AudienceUploadBatchSummary = ({ uploadBatchId, hint }: { uploadBatchId: string; hint?: string }) => {
//   const { data, error, isLoading } = useSWR(uploadBatchId ? (['promotion-audience-upload-job-status', uploadBatchId] as const) : null, () => importExportApi.getImportExportJobStatus(uploadBatchId), {
//     revalidateOnFocus: false,
//   });

//   return (
//     <Box sx={{ border: '1px solid #E5E7EB', borderRadius: '8px', bgcolor: '#FCFCFD', px: 1.5, py: 1.25 }}>
//       <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#667085' }}>Mã lô tải lên</Typography>
//       <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828', mt: 0.5, wordBreak: 'break-all' }}>{data?.jobId || uploadBatchId}</Typography>
//       {isLoading ? (
//         <StackRowAlignCenter gap={1} sx={{ mt: 0.75 }}>
//           <CircularProgress size={14} />
//           <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085' }}>Đang tải trạng thái job...</Typography>
//         </StackRowAlignCenter>
//       ) : null}
//       {!isLoading && data && !error ? <AudienceUploadJobStatRows status={data} /> : null}
//       {!isLoading && (error || !data) ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085', mt: 0.5 }}>Không lấy được chi tiết job. Hiển thị mã lô đã lưu.</Typography> : null}
//       {hint ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085', mt: 0.5 }}>{hint}</Typography> : null}
//     </Box>
//   );
// };

// const AudienceUploadJobStatRows = ({ status }: { status: JobStatusResponseDto }) => {
//   const stats = status.importStats;
//   const isHttpUrl = (value?: string | null) => Boolean(value && /^https?:\/\//i.test(value));
//   return (
//     <Stack gap={0.5} sx={{ mt: 0.75 }}>
//       <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#475467' }}>Trạng thái: {status.status}</Typography>
//       {stats ? (
//         <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#475467' }}>
//           Tổng: {stats.totalRows} · Thành công: {stats.successRows} · Thất bại: {stats.failedRows}
//         </Typography>
//       ) : null}
//       {isHttpUrl(status.fileUrl) ? (
//         <Typography component="a" href={status.fileUrl} target="_blank" rel="noopener noreferrer" sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#175CD3', textDecoration: 'underline' }}>
//           Tệp gốc
//         </Typography>
//       ) : null}
//       {isHttpUrl(status.errorFileUrl) ? (
//         <Typography
//           component="a"
//           href={status.errorFileUrl ?? undefined}
//           target="_blank"
//           rel="noopener noreferrer"
//           sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#B42318', textDecoration: 'underline' }}
//         >
//           Tệp lỗi
//         </Typography>
//       ) : null}
//     </Stack>
//   );
// };

export const AudienceInlineForm = ({
  promotionId,
  initialAudience,
  initialCustomers,
  editable,
  onSaved,
}: {
  promotionId: string;
  initialAudience?: PromotionAudienceConfigV1 | null;
  /** Display data enriched by promotion-service (sibling of config). */
  initialCustomers?: readonly PromotionCustomerAudienceItemDto[];
  editable: boolean;
  onSaved: () => Promise<void> | void;
}) => {
  const { showSnackbar } = useSnackbar();
  const savedValues = useMemo(() => mapAudienceToFormValues(initialAudience), [initialAudience]);
  const [values, setValues] = useState<PromotionAudienceFormValues>(() => savedValues);
  const [manualCustomers, setManualCustomers] = useState<PromotionCustomerAudienceItemDto[]>([]);
  const [saving, setSaving] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importSubmitting, setImportSubmitting] = useState(false);
  const [appliedCustomerImportSuccessCount, setAppliedCustomerImportSuccessCount] = useState<number | null>(null);
  const [importedCustomers, setImportedCustomers] = useState<PromotionImportedCustomerRow[]>([]);
  /** Chỉ poll IE khi đang import / mở dialog — không fetch jobs chỉ vì đã có audienceUploadBatchId. */
  const shouldTrackImportJobs = importOpen || importSubmitting;

  const hydrateAudienceUploadBatchId = useMemo(() => {
    if (initialAudience?.type !== AudienceConfigType.UPLOAD_FILE) return null;
    return normalizeAudienceUploadBatchId(initialAudience.uploadBatchId) || null;
  }, [initialAudience]);

  const shouldHydrateAudienceCustomers = Boolean(hydrateAudienceUploadBatchId) && importedCustomers.length === 0;

  const {
    data: hydratedAudienceCustomers,
    error: hydrateAudienceError,
    isLoading: isHydratingAudienceCustomers,
  } = useSWR(
    shouldHydrateAudienceCustomers && hydrateAudienceUploadBatchId ? (['promotion-audience-upload-batch-customers', hydrateAudienceUploadBatchId] as const) : null,
    () => loadCustomersFromPromotionCustomerImportJob(hydrateAudienceUploadBatchId!),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  );

  const hydrateAudienceErrorNotifiedRef = useRef<string | null>(null);

  useEffect(() => {
    hydrateAudienceErrorNotifiedRef.current = null;
  }, [hydrateAudienceUploadBatchId]);

  useEffect(() => {
    if (!hydratedAudienceCustomers?.length) return;
    setImportedCustomers((current) => (current.length > 0 ? current : hydratedAudienceCustomers));
    setAppliedCustomerImportSuccessCount((current) => current ?? hydratedAudienceCustomers.length);
  }, [hydratedAudienceCustomers]);

  useEffect(() => {
    if (!hydrateAudienceError || !hydrateAudienceUploadBatchId) return;
    const message = getErrorMessage(hydrateAudienceError) || 'Không tải được danh sách khách hàng từ lô import.';
    const notifyKey = `${hydrateAudienceUploadBatchId}:${message}`;
    if (hydrateAudienceErrorNotifiedRef.current === notifyKey) return;
    hydrateAudienceErrorNotifiedRef.current = notifyKey;
    showSnackbar({ type: SnackbarType.WARNING, message });
  }, [hydrateAudienceError, hydrateAudienceUploadBatchId, showSnackbar]);

  const handleCustomerImportApplied = useCallback((result: { jobId: string; customers: PromotionImportedCustomerRow[]; successRows: number }) => {
    setShowValidation(false);
    setAppliedCustomerImportSuccessCount(result.successRows);
    setImportedCustomers(result.customers);
    setValues((current) => ({
      ...current,
      audienceType: AudienceConfigType.UPLOAD_FILE,
      audienceUploadBatchId: result.jobId,
    }));
  }, []);

  const {
    topicConfigId,
    taskManagerOpen,
    setTaskManagerOpen,
    openTaskManager,
    importKnownFileNames,
    ieJobsRes,
    taskManagerJobsLoading,
    hasActiveImportJob,
    startCustomerImport,
    currentImportJobId,
    applyImportJobToForm,
    applyingJobId,
  } = usePromotionCustomerImportTaskManager({
    trackJobs: shouldTrackImportJobs,
    promotionDraftId: promotionId,
    onApplied: handleCustomerImportApplied,
  });

  const audienceUploadBatchId = normalizeAudienceUploadBatchId(values.audienceUploadBatchId);
  const showAudienceUploadBatch = Boolean(audienceUploadBatchId);
  const manualCustomerIds = values.customerIds;

  const importedCustomerPhoneKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const customer of importedCustomers) {
      const key = getImportedCustomerKey(customer);
      if (key) keys.add(key);
      if (customer.phone) keys.add(customer.phone);
      if (customer.normalizedPhone) keys.add(customer.normalizedPhone);
    }
    return keys;
  }, [importedCustomers]);

  const displayedCustomers = useMemo(() => {
    const byId = new Map<string, PromotionCustomerAudienceItemDto>();
    for (const customer of initialCustomers ?? []) byId.set(customer.customerId, customer);
    for (const customer of manualCustomers) byId.set(customer.customerId, customer);
    return manualCustomerIds
      .map((customerId) => {
        const found = byId.get(customerId);
        if (found) return found;
        return {
          customerId,
          userId: customerId,
          memberId: '',
          phone: '-',
          fullName: customerId,
          status: null,
          memberCode: null,
        } satisfies PromotionCustomerAudienceItemDto;
      })
      .filter((customer) => {
        const phone = customer.phone?.trim();
        if (!phone || phone === '-') return true;
        return !importedCustomerPhoneKeys.has(phone);
      });
  }, [initialCustomers, manualCustomerIds, manualCustomers, importedCustomerPhoneKeys]);

  useEffect(() => {
    setValues(savedValues);
    if (!normalizeAudienceUploadBatchId(savedValues.audienceUploadBatchId)) {
      setAppliedCustomerImportSuccessCount(null);
      setImportedCustomers([]);
    }
    setManualCustomers((current) => {
      const nextIds = new Set(savedValues.customerIds);
      return current.filter((customer) => nextIds.has(customer.customerId));
    });
  }, [savedValues]);

  const isDirty = !arePromotionAudienceFormValuesEqual(values, savedValues);
  const canSave = editable && isDirty && isPromotionAudienceFormSavable(values) && !saving;
  const audienceErrors = validatePromotionAudienceForm(values);
  const showErrors = showValidation || (editable && !initialAudience);

  const setField = <K extends keyof PromotionAudienceFormValues>(key: K, value: PromotionAudienceFormValues[K]) => {
    setShowValidation(false);
    setValues((current) => ({ ...current, [key]: value }));
  };

  const addSelectedCustomer = (customer: PromotionCustomerAudienceItemDto) => {
    if (values.customerIds.includes(customer.customerId)) return;
    setField('customerIds', [...values.customerIds, customer.customerId]);
    setManualCustomers((current) => [...current.filter((item) => item.customerId !== customer.customerId), customer]);
  };

  const removeSelectedCustomer = (customerId: string) => {
    setField(
      'customerIds',
      values.customerIds.filter((id) => id !== customerId),
    );
    setManualCustomers((current) => current.filter((customer) => customer.customerId !== customerId));
  };

  const handleStartCustomerImport = useCallback(
    async (file: File) => {
      if (!topicConfigId) {
        showSnackbar({
          type: SnackbarType.ERROR,
          message: 'Chưa có cấu hình import (topic-config). Vui lòng thử lại sau.',
        });
        return;
      }

      setImportSubmitting(true);
      try {
        await startCustomerImport(file);
        setImportOpen(false);
        openTaskManager();
        showSnackbar({
          type: SnackbarType.SUCCESS,
          message: 'Đã gửi file import. Theo dõi tiến trình trong Trình quản lý tác vụ.',
        });
      } catch (error) {
        showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
      } finally {
        setImportSubmitting(false);
      }
    },
    [openTaskManager, showSnackbar, startCustomerImport, topicConfigId],
  );

  const save = async () => {
    if (!editable || saving) return;
    const errors = validatePromotionAudienceForm(values);
    if (Object.keys(errors).length > 0) {
      setShowValidation(true);
      showSnackbar({ message: Object.values(errors)[0], type: SnackbarType.ERROR });
      return;
    }
    if (!isDirty) return;
    setSaving(true);
    try {
      await promotionApi.upsertPromotionDraftAudience(promotionId, { config: buildPromotionAudienceConfig(values) });
      await onSaved();
      showSnackbar({ message: 'Đã lưu cấu hình đối tượng khách hàng.', type: SnackbarType.SUCCESS });
    } catch (error) {
      showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
    } finally {
      setSaving(false);
    }
  };

  const downloadCustomerImportTemplate = () => {
    const link = document.createElement('a');
    link.href = PROMOTION_CUSTOMER_IMPORT_SAMPLE_URL;
    link.download = 'Import_Customer_Template.xlsx';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã kích hoạt tải file mẫu.' });
  };

  if (!editable && initialAudience) {
    return (
      <Stack gap={2}>
        <ReadonlyField label="Đối tượng khách hàng" value={PROMOTION_AUDIENCE_MODE_LABEL[initialAudience.type]} />
        {initialAudience.type === AudienceConfigType.UPLOAD_FILE ? (
          <Stack gap={1.5}>
            <Box sx={{ border: '1px solid #E5E7EB', borderRadius: '8px', bgcolor: '#FCFCFD', px: 1.5, py: 1.25 }}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }}>Đã áp dụng danh sách khách hàng</Typography>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085', mt: 0.5 }}>
                {appliedCustomerImportSuccessCount != null && appliedCustomerImportSuccessCount > 0
                  ? `${appliedCustomerImportSuccessCount} khách hàng hợp lệ đã được áp dụng vào cấu hình.`
                  : 'File import đã được áp dụng vào cấu hình.'}
              </Typography>
            </Box>
            {isHydratingAudienceCustomers && importedCustomers.length === 0 ? (
              <StackRowAlignCenter gap={1}>
                <CircularProgress size={14} />
                <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#667085' }}>Đang tải danh sách khách hàng import...</Typography>
              </StackRowAlignCenter>
            ) : null}
            {importedCustomers.length > 0 ? (
              <Stack sx={{ border: '1px solid #E5E7EB', borderRadius: '8px', maxHeight: 280, overflowY: 'auto', bgcolor: '#FFFFFF' }}>
                {importedCustomers.map((customer) => renderImportedCustomerRow(customer))}
              </Stack>
            ) : null}
            {!isHydratingAudienceCustomers && importedCustomers.length === 0 && hydrateAudienceError ? (
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#B54708' }}>Không tải được danh sách khách hàng từ lô import.</Typography>
            ) : null}
            {displayedCustomers.length > 0 ? (
              <Stack sx={{ border: '1px solid #E5E7EB', borderRadius: '8px', maxHeight: 280, overflowY: 'auto', bgcolor: '#FFFFFF' }}>
                {displayedCustomers.map((customer) => (
                  <StackRowAlignCenter key={customer.customerId} gap={1.5} sx={{ px: 1.5, py: 1.25, borderBottom: '1px solid #F3F4F6', '&:last-of-type': { borderBottom: 'none' } }}>
                    <Stack sx={{ minWidth: 0, flex: 1, gap: 0.25 }}>
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }} noWrap>
                        {customer.fullName?.trim() || customer.memberCode || customer.customerId}
                      </Typography>
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#667085' }} noWrap>
                        SĐT: {customer.phone} · {formatLoyaltyCustomerStatusLabel(customer.status ?? '')}
                      </Typography>
                    </Stack>
                  </StackRowAlignCenter>
                ))}
              </Stack>
            ) : null}
          </Stack>
        ) : (
          <ReadonlyField label="Chi tiết" value={formatPromotionAudienceSummary(initialAudience)} />
        )}
        {initialAudience.type === AudienceConfigType.CUSTOMER_SEGMENT ? <ReadonlyField label="Mã phân khúc" value={initialAudience.segmentIds.join(', ')} /> : null}
        {initialAudience.type === AudienceConfigType.MANUAL_CUSTOMER ? (
          <Stack gap={1}>
            {displayedCustomers.length > 0 ? (
              <Stack sx={{ border: '1px solid #E5E7EB', borderRadius: '8px', maxHeight: 280, overflowY: 'auto', bgcolor: '#FFFFFF' }}>
                {displayedCustomers.map((customer) => (
                  <StackRowAlignCenter key={customer.customerId} gap={1.5} sx={{ px: 1.5, py: 1.25, borderBottom: '1px solid #F3F4F6', '&:last-of-type': { borderBottom: 'none' } }}>
                    <Stack sx={{ minWidth: 0, flex: 1, gap: 0.25 }}>
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }} noWrap>
                        {customer.fullName?.trim() || customer.memberCode || customer.customerId}
                      </Typography>
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#667085' }} noWrap>
                        SĐT: {customer.phone} · {formatLoyaltyCustomerStatusLabel(customer.status ?? '')}
                      </Typography>
                    </Stack>
                  </StackRowAlignCenter>
                ))}
              </Stack>
            ) : null}
          </Stack>
        ) : null}
      </Stack>
    );
  }

  if (!editable) {
    return <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085' }}>Vui lòng chọn đối tượng khách hàng áp dụng.</Typography>;
  }

  return (
    <Stack gap={2}>
      <SelectInput
        label="Đối tượng khách hàng"
        placeholder="Chọn đối tượng khách hàng"
        disabled={!editable}
        value={values.audienceType}
        onChange={(event) => {
          const nextType = event.target.value as AudienceConfigType;
          setShowValidation(false);
          setValues((current) => ({
            ...current,
            audienceType: nextType,
          }));
        }}
        options={AUDIENCE_TYPE_SELECT_OPTIONS}
        requiredMark
      />
      {values.audienceType === AudienceConfigType.CUSTOMER_SEGMENT ? (
        <TextInput
          label="Mã phân khúc"
          requiredMark
          disabled={!editable}
          multiline
          minRows={4}
          value={values.segmentIdsText}
          onChange={(event) => setField('segmentIdsText', event.target.value)}
          error={showErrors && Boolean(audienceErrors.segmentIdsText)}
          errorMessage={audienceErrors.segmentIdsText}
        />
      ) : null}
      {values.audienceType === AudienceConfigType.MANUAL_CUSTOMER || values.audienceType === AudienceConfigType.UPLOAD_FILE ? (
        <Stack gap={1.5}>
          {values.audienceType === AudienceConfigType.UPLOAD_FILE || showAudienceUploadBatch ? (
            <StackRowAlignCenterJustBetween>
              <StackRow gap={1}>
                {values.audienceType === AudienceConfigType.UPLOAD_FILE ? (
                  <ButtonIconContentComponent
                    icon={<Upload01 size={20} color="#737373" />}
                    content="Tải lên file"
                    onClick={() => setImportOpen(true)}
                    {...promotionListButtonPermission('edit', 'Tải lên file khách hàng', 'api_promotion_draft_update')}
                  />
                ) : null}
                {hasActiveImportJob || importSubmitting || currentImportJobId || audienceUploadBatchId ? (
                  <ButtonIconContentComponent
                    icon={<LayersThree01 size={20} color="#737373" />}
                    content="Trình quản lý tác vụ"
                    onClick={openTaskManager}
                    {...promotionListButtonPermission('edit', 'Trình quản lý tác vụ khách hàng', 'api_promotion_draft_update')}
                  />
                ) : null}
              </StackRow>
              <StackRowAlignCenter gap={0.5}>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#6B7280' }}>Đã chọn:</Typography>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#111827' }}>
                  {showAudienceUploadBatch
                    ? appliedCustomerImportSuccessCount != null
                      ? `${appliedCustomerImportSuccessCount} khách hàng (file)${values.customerIds.length > 0 ? ` + ${values.customerIds.length} thủ công` : ''}`
                      : 'File import đã áp dụng'
                    : `${values.customerIds.length} khách hàng`}
                </Typography>
              </StackRowAlignCenter>
            </StackRowAlignCenterJustBetween>
          ) : (
            <StackRowAlignCenter gap={0.5}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#6B7280' }}>Đã chọn:</Typography>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#111827' }}>{values.customerIds.length} khách hàng</Typography>
            </StackRowAlignCenter>
          )}
          {showAudienceUploadBatch ? (
            <Box sx={{ border: '1px solid #E5E7EB', borderRadius: '8px', bgcolor: '#FCFCFD', px: 1.5, py: 1.25 }}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }}>Đã áp dụng danh sách khách hàng</Typography>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085', mt: 0.5 }}>
                {appliedCustomerImportSuccessCount != null && appliedCustomerImportSuccessCount > 0
                  ? `${appliedCustomerImportSuccessCount} khách hàng hợp lệ đã được áp dụng vào cấu hình.`
                  : 'File import đã được áp dụng vào cấu hình. Bấm Trình quản lý tác vụ để xem chi tiết.'}
              </Typography>
            </Box>
          ) : null}
          {showAudienceUploadBatch && isHydratingAudienceCustomers && importedCustomers.length === 0 ? (
            <StackRowAlignCenter gap={1}>
              <CircularProgress size={14} />
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#667085' }}>Đang tải danh sách khách hàng import...</Typography>
            </StackRowAlignCenter>
          ) : null}
          {importedCustomers.length > 0 ? (
            <Stack sx={{ border: '1px solid #E5E7EB', borderRadius: '8px', maxHeight: 280, overflowY: 'auto', bgcolor: '#FFFFFF' }}>
              {importedCustomers.map((customer) => renderImportedCustomerRow(customer))}
            </Stack>
          ) : null}
          {showAudienceUploadBatch && !isHydratingAudienceCustomers && importedCustomers.length === 0 && hydrateAudienceError ? (
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#B54708' }}>Không tải được danh sách khách hàng từ lô import. Mở Trình quản lý tác vụ để thử lại.</Typography>
          ) : null}
          <PromotionCustomerPhoneLookup disabled={!editable} selectedCustomerIds={values.customerIds} onAdd={addSelectedCustomer} />
          {displayedCustomers.length > 0 ? (
            <Stack sx={{ border: '1px solid #E5E7EB', borderRadius: '8px', maxHeight: 280, overflowY: 'auto', bgcolor: '#FFFFFF' }}>
              {displayedCustomers.map((customer) => (
                <StackRowAlignCenter key={customer.customerId} gap={1.5} sx={{ px: 1.5, py: 1.25, borderBottom: '1px solid #F3F4F6', '&:last-of-type': { borderBottom: 'none' } }}>
                  <Stack sx={{ minWidth: 0, flex: 1, gap: 0.25 }}>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }} noWrap>
                      {customer.fullName?.trim() || customer.memberCode || customer.customerId}
                    </Typography>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#667085' }} noWrap>
                      SĐT: {customer.phone} · {formatLoyaltyCustomerStatusLabel(customer.status ?? '')}
                    </Typography>
                  </Stack>
                  {editable ? (
                    <PermissionIconButton
                      size="small"
                      aria-label="Xóa khách hàng"
                      onClick={() => removeSelectedCustomer(customer.customerId)}
                      {...promotionListButtonPermission('edit', 'Xóa khách hàng', 'api_promotion_draft_update')}
                      sx={{ color: '#667085', flexShrink: 0, '&:hover': { color: '#F04438', bgcolor: '#FEF2F2' } }}
                    >
                      <CloseOutlinedIcon sx={{ fontSize: 16 }} />
                    </PermissionIconButton>
                  ) : null}
                </StackRowAlignCenter>
              ))}
            </Stack>
          ) : null}
          {showErrors && values.audienceType === AudienceConfigType.MANUAL_CUSTOMER && audienceErrors.customerIds ? (
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#EF4444' }}>{audienceErrors.customerIds}</Typography>
          ) : null}
          {showErrors && audienceErrors.audienceUploadBatchId ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#EF4444' }}>{audienceErrors.audienceUploadBatchId}</Typography> : null}
        </Stack>
      ) : null}
      <StackRowJustEnd>
        <CustomButton
          fullWidth={false}
          disabled={!canSave}
          onClick={() => void save()}
          sx={{ textTransform: 'none', bgcolor: '#101828', boxShadow: 'none', minWidth: 156, '&:hover': { bgcolor: '#1D2939', boxShadow: 'none' } }}
          {...promotionListButtonPermission('edit', 'Lưu cấu hình', 'api_promotion_draft_update')}
        >
          {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
        </CustomButton>
      </StackRowJustEnd>
      <ProductSpuImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        submitting={importSubmitting}
        onDownloadTemplate={downloadCustomerImportTemplate}
        onStartImport={handleStartCustomerImport}
      />
      <ProductSpuTaskManagerDrawer
        open={taskManagerOpen}
        onClose={() => setTaskManagerOpen(false)}
        jobs={{ list: ieJobsRes?.list ?? [], total: ieJobsRes?.total ?? ieJobsRes?.list?.length ?? 0 }}
        loading={taskManagerJobsLoading}
        knownFileNames={importKnownFileNames}
        applyImportJobId={currentImportJobId}
        applyingJobId={applyingJobId}
        onApplyImportJob={(jobId) => void applyImportJobToForm(jobId)}
      />
    </Stack>
  );
};
