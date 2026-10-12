import { useCallback, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { importExportApi, JobProcessStatus } from '../../../../apis';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import type { LabelDisplaySelectedProduct } from './label-display.interface';
import { BADGE_SKU_IMPORT_ROUTING_KEY } from './label-display-sku-import.constants';
import { loadProductsFromBadgeSkuImportJob, mergeLabelDisplaySelectedProducts } from './label-display-sku-import-result.util';

export type LabelDisplayImportJobReference = {
  referenceType: string;
  referenceId: string;
};

type UseLabelDisplaySkuImportTaskManagerOptions = {
  selectedProducts: LabelDisplaySelectedProduct[];
  onProductsChange: (rows: LabelDisplaySelectedProduct[]) => void;
  /** Khi có: create/list job chỉ trong scope reference (không lẫn mọi import.badge.sku). */
  jobReference?: LabelDisplayImportJobReference | null;
};

/** Poll job list + apply result-rows khi user bấm «Áp dụng vào form» trên job vừa upload. */
export const useLabelDisplaySkuImportTaskManager = ({ selectedProducts, onProductsChange, jobReference = null }: UseLabelDisplaySkuImportTaskManagerOptions) => {
  const { showSnackbar } = useSnackbar();
  const [taskManagerOpen, setTaskManagerOpen] = useState(false);
  const [importKnownFileNames, setImportKnownFileNames] = useState<Record<string, string>>({});
  const [currentImportJobId, setCurrentImportJobId] = useState<string | null>(null);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [sessionHadImports, setSessionHadImports] = useState(false);

  const referenceType = jobReference?.referenceType?.trim() || undefined;
  const referenceId = jobReference?.referenceId?.trim() || undefined;
  const hasJobReference = Boolean(referenceType && referenceId);

  // Chỉ fetch khi mở Task Manager hoặc đang theo dõi job import trong session — không gọi sớm khi vào form/list.
  const shouldFetch = taskManagerOpen || !!currentImportJobId || Object.keys(importKnownFileNames).length > 0;

  const { data: ieTopicConfigs } = useSWR(shouldFetch ? (['ie', 'topic-configs', 'label-display-sku'] as const) : null, () => importExportApi.getImportExportTopicConfigs(), {
    revalidateOnFocus: false,
  });

  const topicConfigId = useMemo(() => ieTopicConfigs?.find((c) => c.routingKey === BADGE_SKU_IMPORT_ROUTING_KEY)?.id ?? null, [ieTopicConfigs]);

  const {
    data: ieJobsRes,
    mutate: mutateIeJobs,
    isLoading: ieJobsLoading,
  } = useSWR(
    shouldFetch && topicConfigId ? (['ie', 'jobs', 'label-display-sku', topicConfigId, referenceType ?? '', referenceId ?? ''] as const) : null,
    () =>
      importExportApi.getImportExportListJobs({
        topicConfigId: topicConfigId!,
        isPagination: true,
        ...(hasJobReference ? { referenceType, referenceId } : {}),
      }),
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
    },
  );

  const hasActiveImportJob = (ieJobsRes?.list ?? []).some((j) => j.status === JobProcessStatus.PENDING || j.status === JobProcessStatus.PROCESSING);
  const taskManagerJobsLoading = taskManagerOpen && (!ieTopicConfigs || ieJobsLoading);

  useEffect(() => {
    if (!shouldFetch || !hasActiveImportJob) return;
    const timerId = window.setInterval(() => {
      void mutateIeJobs();
    }, 2500);
    return () => window.clearInterval(timerId);
  }, [hasActiveImportJob, mutateIeJobs, shouldFetch]);

  const openTaskManager = useCallback(() => setTaskManagerOpen(true), []);

  const mergeImportKnownFileNames = useCallback((map: Record<string, string>) => {
    setImportKnownFileNames((prev) => ({ ...prev, ...map }));
  }, []);

  const applyImportJobToForm = useCallback(
    async (jobId: string) => {
      if (jobId !== currentImportJobId) return;
      setApplyingJobId(jobId);
      try {
        const imported = await loadProductsFromBadgeSkuImportJob(jobId);
        onProductsChange(mergeLabelDisplaySelectedProducts(selectedProducts, imported));
        showSnackbar({
          type: SnackbarType.SUCCESS,
          message: 'Đã thêm sản phẩm từ file import vào form.',
        });
      } catch (err) {
        const message = err instanceof Error && err.message.includes('Không có SKU hợp lệ') ? err.message : 'Không thể tải kết quả import. Vui lòng thử lại.';
        showSnackbar({ type: SnackbarType.ERROR, message });
      } finally {
        setApplyingJobId(null);
      }
    },
    [currentImportJobId, onProductsChange, selectedProducts, showSnackbar],
  );

  const startSkuImport = useCallback(
    async (file: File) => {
      let configId = topicConfigId;
      if (!configId) {
        const configs = await importExportApi.getImportExportTopicConfigs();
        configId = configs.find((c) => c.routingKey === BADGE_SKU_IMPORT_ROUTING_KEY)?.id ?? null;
        if (!configId) {
          throw new Error(`Chưa cấu hình topic ${BADGE_SKU_IMPORT_ROUTING_KEY} trên Import-Export.`);
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
    mergeImportKnownFileNames,
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
