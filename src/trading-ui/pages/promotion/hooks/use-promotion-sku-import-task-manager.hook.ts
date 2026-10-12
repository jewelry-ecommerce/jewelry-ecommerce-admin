import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';
import { importExportApi, JobProcessStatus } from '../../../apis';
import { getErrorMessage } from '../../../common/utils';
import type { LabelDisplaySelectedProduct } from '../../content-display/label/label-display/label-display.interface';
import { loadProductsFromBadgeSkuImportJob } from '../../content-display/label/label-display/label-display-sku-import-result.util';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { PROMOTION_PRODUCT_SCOPE_REFERENCE_TYPE, PROMOTION_SKU_IMPORT_ROUTING_KEY } from '../promotion.constant';

export type PromotionSkuImportApplyResult = {
  jobId: string;
  products: LabelDisplaySelectedProduct[];
  successRows: number;
};

type UsePromotionSkuImportTaskManagerOptions = {
  trackJobs: boolean;
  promotionDraftId?: string;
  onApplied: (result: PromotionSkuImportApplyResult) => void;
};

/** Poll job IE `import.promotion.sku` — apply vào form chỉ khi user bấm «Áp dụng vào form». */
export const usePromotionSkuImportTaskManager = ({ trackJobs, promotionDraftId, onApplied }: UsePromotionSkuImportTaskManagerOptions) => {
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

  const topicConfigId = useMemo(() => ieTopicConfigs?.find((c) => c.routingKey === PROMOTION_SKU_IMPORT_ROUTING_KEY)?.id ?? null, [ieTopicConfigs]);

  const {
    data: ieJobsRes,
    mutate: mutateIeJobs,
    isLoading: ieJobsLoading,
  } = useSWR(
    shouldFetch && topicConfigId ? (['ie', 'jobs', 'promotion-sku', topicConfigId, referenceId ?? ''] as const) : null,
    () =>
      importExportApi.getImportExportListJobs({
        topicConfigId: topicConfigId!,
        isPagination: true,
        ...(hasReference ? { referenceType: PROMOTION_PRODUCT_SCOPE_REFERENCE_TYPE, referenceId } : {}),
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

        const products = await loadProductsFromBadgeSkuImportJob(jobId);
        onApplied({ jobId, products, successRows: products.length });
        showSnackbar({
          type: SnackbarType.SUCCESS,
          message: 'Đã áp dụng file import sản phẩm vào form.',
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

  const startSkuImport = useCallback(
    async (file: File) => {
      let configId = topicConfigId;
      if (!configId) {
        const configs = await importExportApi.getImportExportTopicConfigs();
        configId = configs.find((c) => c.routingKey === PROMOTION_SKU_IMPORT_ROUTING_KEY)?.id ?? null;
        if (!configId) {
          throw new Error(`Chưa cấu hình topic ${PROMOTION_SKU_IMPORT_ROUTING_KEY} trên Import-Export.`);
        }
      }

      const job = await importExportApi.postImportTopicConfigs(configId, file, hasReference ? { referenceType: PROMOTION_PRODUCT_SCOPE_REFERENCE_TYPE, referenceId } : undefined);
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
    startSkuImport,
    currentImportJobId,
    applyImportJobToForm,
    applyingJobId,
  };
};
