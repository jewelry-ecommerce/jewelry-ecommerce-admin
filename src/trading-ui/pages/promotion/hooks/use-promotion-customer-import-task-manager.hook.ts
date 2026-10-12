import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';
import { importExportApi, JobProcessStatus } from '../../../apis';
import { getErrorMessage } from '../../../common/utils';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { PROMOTION_CUSTOMER_AUDIENCE_REFERENCE_TYPE, PROMOTION_CUSTOMER_IMPORT_ROUTING_KEY } from '../promotion.constant';
import { loadCustomersFromPromotionCustomerImportJob, type PromotionImportedCustomerRow } from '../utils/promotion-customer-import-result.util';

export type PromotionCustomerImportApplyResult = {
  jobId: string;
  customers: PromotionImportedCustomerRow[];
  successRows: number;
};

type UsePromotionCustomerImportTaskManagerOptions = {
  trackJobs: boolean;
  promotionDraftId?: string;
  onApplied: (result: PromotionCustomerImportApplyResult) => void;
};

/** Poll job IE `import.promotion.customer` — apply vào form chỉ khi user bấm «Áp dụng vào form». */
export const usePromotionCustomerImportTaskManager = ({ trackJobs, promotionDraftId, onApplied }: UsePromotionCustomerImportTaskManagerOptions) => {
  const { showSnackbar } = useSnackbar();
  const [taskManagerOpen, setTaskManagerOpen] = useState(false);
  const [importKnownFileNames, setImportKnownFileNames] = useState<Record<string, string>>({});
  const [currentImportJobId, setCurrentImportJobId] = useState<string | null>(null);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const referenceId = promotionDraftId?.trim() || undefined;
  const hasReference = Boolean(referenceId);

  const shouldFetch = trackJobs || taskManagerOpen || !!currentImportJobId || Object.keys(importKnownFileNames).length > 0;

  const { data: ieTopicConfigs } = useSWR(shouldFetch ? (['ie', 'topic-configs'] as const) : null, () => importExportApi.getImportExportTopicConfigs(), {
    revalidateOnFocus: false,
  });

  const topicConfigId = useMemo(() => ieTopicConfigs?.find((c) => c.routingKey === PROMOTION_CUSTOMER_IMPORT_ROUTING_KEY)?.id ?? null, [ieTopicConfigs]);

  const {
    data: ieJobsRes,
    mutate: mutateIeJobs,
    isLoading: ieJobsLoading,
  } = useSWR(
    shouldFetch && topicConfigId ? (['ie', 'jobs', 'promotion-customer', topicConfigId, referenceId ?? ''] as const) : null,
    () =>
      importExportApi.getImportExportListJobs({
        topicConfigId: topicConfigId!,
        isPagination: true,
        ...(hasReference ? { referenceType: PROMOTION_CUSTOMER_AUDIENCE_REFERENCE_TYPE, referenceId } : {}),
      }),
    {
      revalidateOnFocus: false,
      refreshInterval: (data) => {
        const hasActive = (data?.list ?? []).some((j) => j.status === JobProcessStatus.PENDING || j.status === JobProcessStatus.PROCESSING);
        return shouldFetch && hasActive ? 2500 : 0;
      },
    },
  );

  const hasActiveImportJob = (ieJobsRes?.list ?? []).some((j) => j.status === JobProcessStatus.PENDING || j.status === JobProcessStatus.PROCESSING);
  const taskManagerJobsLoading = taskManagerOpen && (!ieTopicConfigs || ieJobsLoading);

  const openTaskManager = useCallback(() => setTaskManagerOpen(true), []);

  const applyImportJobToForm = useCallback(
    async (jobId: string) => {
      if (jobId !== currentImportJobId) return;
      setApplyingJobId(jobId);
      try {
        const status = await importExportApi.getImportExportJobStatus(jobId);
        if (status.status !== JobProcessStatus.DONE) {
          showSnackbar({
            type: SnackbarType.ERROR,
            message: 'Tác vụ chưa hoàn tất. Vui lòng đợi job DONE trước khi áp dụng.',
          });
          return;
        }

        const customers = await loadCustomersFromPromotionCustomerImportJob(jobId);
        onApplied({
          jobId,
          customers,
          successRows: customers.length,
        });
        showSnackbar({
          type: SnackbarType.SUCCESS,
          message: 'Đã áp dụng danh sách khách hàng vào form.',
        });
      } catch (error) {
        showSnackbar({
          type: SnackbarType.ERROR,
          message: getErrorMessage(error) || 'Không thể áp dụng kết quả import. Vui lòng thử lại.',
        });
      } finally {
        setApplyingJobId(null);
      }
    },
    [currentImportJobId, onApplied, showSnackbar],
  );

  const startCustomerImport = useCallback(
    async (file: File) => {
      let configId = topicConfigId;
      if (!configId) {
        const configs = await importExportApi.getImportExportTopicConfigs();
        configId = configs.find((c) => c.routingKey === PROMOTION_CUSTOMER_IMPORT_ROUTING_KEY)?.id ?? null;
        if (!configId) {
          throw new Error(`Chưa cấu hình topic ${PROMOTION_CUSTOMER_IMPORT_ROUTING_KEY} trên Import-Export.`);
        }
      }

      const job = await importExportApi.postImportTopicConfigs(configId, file, hasReference ? { referenceType: PROMOTION_CUSTOMER_AUDIENCE_REFERENCE_TYPE, referenceId } : undefined);
      const jobId = job.jobId?.trim();
      if (!jobId) {
        throw new Error('Import không trả về mã tác vụ (jobId).');
      }
      setImportKnownFileNames((prev) => ({ ...prev, [jobId]: file.name }));
      setCurrentImportJobId(jobId);
      await mutateIeJobs();
      return jobId;
    },
    [hasReference, mutateIeJobs, referenceId, topicConfigId],
  );

  return {
    topicConfigId,
    taskManagerOpen,
    setTaskManagerOpen,
    openTaskManager,
    importKnownFileNames,
    ieJobsRes,
    mutateIeJobs,
    taskManagerJobsLoading,
    hasActiveImportJob,
    startCustomerImport,
    currentImportJobId,
    applyImportJobToForm,
    applyingJobId,
  };
};
