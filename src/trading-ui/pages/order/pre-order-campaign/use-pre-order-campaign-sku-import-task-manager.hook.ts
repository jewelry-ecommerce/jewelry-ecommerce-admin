import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';
import { importExportApi, JobProcessStatus } from '../../../apis';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import type { PreOrderSelectedSku } from './pre-order-campaign.interface';
import { PRE_ORDER_CAMPAIGN_SKU_IMPORT_ROUTING_KEY } from './pre-order-campaign-sku-import.constants';
import { loadSkusFromPreOrderSkuImportJob, mergePreOrderSelectedSkus } from './pre-order-campaign-sku-import-result.util';

export type PreOrderCampaignImportJobReference = {
  referenceType: string;
  referenceId: string;
};

type UsePreOrderCampaignSkuImportTaskManagerOptions = {
  trackJobs: boolean;
  selectedSkus: PreOrderSelectedSku[];
  onSkusChange: (rows: PreOrderSelectedSku[]) => void;
  jobReference?: PreOrderCampaignImportJobReference | null;
};

/** Poll job IE `import.badge.sku` + áp dụng result-rows khi user bấm «Áp dụng vào form». */
export const usePreOrderCampaignSkuImportTaskManager = ({ trackJobs, selectedSkus, onSkusChange, jobReference = null }: UsePreOrderCampaignSkuImportTaskManagerOptions) => {
  const { showSnackbar } = useSnackbar();
  const [taskManagerOpen, setTaskManagerOpen] = useState(false);
  const [importKnownFileNames, setImportKnownFileNames] = useState<Record<string, string>>({});
  const [currentImportJobId, setCurrentImportJobId] = useState<string | null>(null);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [sessionHadImports, setSessionHadImports] = useState(false);

  const referenceType = jobReference?.referenceType?.trim() || undefined;
  const referenceId = jobReference?.referenceId?.trim() || undefined;
  const hasJobReference = Boolean(referenceType && referenceId);

  const shouldFetch = trackJobs || taskManagerOpen || !!currentImportJobId || Object.keys(importKnownFileNames).length > 0;

  const { data: ieTopicConfigs } = useSWR(shouldFetch ? (['ie', 'topic-configs', 'pre-order-campaign-sku'] as const) : null, () => importExportApi.getImportExportTopicConfigs(), {
    revalidateOnFocus: false,
  });

  const topicConfigId = useMemo(() => ieTopicConfigs?.find((c) => c.routingKey === PRE_ORDER_CAMPAIGN_SKU_IMPORT_ROUTING_KEY)?.id ?? null, [ieTopicConfigs]);

  const {
    data: ieJobsRes,
    mutate: mutateIeJobs,
    isLoading: ieJobsLoading,
  } = useSWR(
    shouldFetch && topicConfigId ? (['ie', 'jobs', 'pre-order-campaign-sku', topicConfigId, referenceType ?? '', referenceId ?? ''] as const) : null,
    () =>
      importExportApi.getImportExportListJobs({
        topicConfigId: topicConfigId!,
        isPagination: true,
        ...(hasJobReference ? { referenceType, referenceId } : {}),
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
        const imported = await loadSkusFromPreOrderSkuImportJob(jobId);
        onSkusChange(mergePreOrderSelectedSkus(selectedSkus, imported));
        showSnackbar({
          type: SnackbarType.SUCCESS,
          message: 'Đã thêm biến thể từ file import vào form.',
        });
      } catch (err) {
        const message = err instanceof Error && err.message.includes('Không có SKU hợp lệ') ? err.message : 'Không thể tải kết quả import. Vui lòng thử lại.';
        showSnackbar({ type: SnackbarType.ERROR, message });
      } finally {
        setApplyingJobId(null);
      }
    },
    [currentImportJobId, onSkusChange, selectedSkus, showSnackbar],
  );

  const startSkuImport = useCallback(
    async (file: File) => {
      let configId = topicConfigId;
      if (!configId) {
        const configs = await importExportApi.getImportExportTopicConfigs();
        configId = configs.find((c) => c.routingKey === PRE_ORDER_CAMPAIGN_SKU_IMPORT_ROUTING_KEY)?.id ?? null;
        if (!configId) {
          throw new Error(`Chưa cấu hình topic ${PRE_ORDER_CAMPAIGN_SKU_IMPORT_ROUTING_KEY} trên Import-Export.`);
        }
      }

      const job = await importExportApi.postImportTopicConfigs(configId, file, hasJobReference ? { referenceType, referenceId } : undefined);
      const jobId = job.jobId?.trim();
      if (!jobId) {
        throw new Error('Import không trả về mã tác vụ (jobId).');
      }
      setImportKnownFileNames((prev) => ({ ...prev, [jobId]: file.name }));
      setCurrentImportJobId(jobId);
      setSessionHadImports(true);
      await mutateIeJobs();
      return jobId;
    },
    [hasJobReference, mutateIeJobs, referenceId, referenceType, topicConfigId],
  );

  return {
    taskManagerOpen,
    setTaskManagerOpen,
    openTaskManager,
    importKnownFileNames,
    ieJobsRes,
    mutateIeJobs,
    taskManagerJobsLoading,
    hasActiveImportJob,
    startSkuImport,
    currentImportJobId,
    applyImportJobToForm,
    applyingJobId,
    sessionHadImports,
  };
};
