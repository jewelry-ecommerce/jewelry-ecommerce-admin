import { useCallback, useEffect, useRef, useState } from 'react';
import { getOrderImportSessionErrorFileBlob, postOrderImportSessionConfirm, postOrderImportValidate } from '../../../../apis/order/order-import.api';
import type { OrderImportJobResult, OrderImportValidateResult } from '../../../../apis/order/order-import.interface';
import { downloadRemoteFile } from '../../../../common/helpers';
import { getErrorMessage } from '../../../../common/utils/string.utils';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { completeProcessingProgress, ORDER_IMPORT_TEMPLATE_DOWNLOAD_NAME, ORDER_IMPORT_TEMPLATE_PUBLIC_PATH, waitOrderImportJobDone } from '../../order-import.util';

/** 0 upload → 1 validate processing → 2 preview → 3 import done / import processing */
export type OrderImportWizardStep = 0 | 1 | 2 | 3;

const downloadBlobAsFile = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const isAbortError = (error: unknown): boolean => error instanceof DOMException && error.name === 'AbortError';

export const useOrderImportDialog = (open: boolean) => {
  const { showSnackbar } = useSnackbar();
  const [activeStep, setActiveStep] = useState<OrderImportWizardStep>(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileValue, setFileValue] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [processingPercent, setProcessingPercent] = useState(0);
  const [processingLabel, setProcessingLabel] = useState('Đang xử lý file');
  const [validateResult, setValidateResult] = useState<OrderImportValidateResult | null>(null);
  const [importJobResult, setImportJobResult] = useState<OrderImportJobResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [downloadingErrorFile, setDownloadingErrorFile] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const processingPercentRef = useRef(0);

  const updateProcessingPercent = useCallback((percent: number) => {
    processingPercentRef.current = percent;
    setProcessingPercent(percent);
  }, []);

  const resetState = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setActiveStep(0);
    setSelectedFile(null);
    setFileValue('');
    setUploadError('');
    processingPercentRef.current = 0;
    setProcessingPercent(0);
    setProcessingLabel('Đang xử lý file');
    setValidateResult(null);
    setImportJobResult(null);
    setSubmitting(false);
    setConfirming(false);
    setDownloadingErrorFile(false);
  }, []);

  useEffect(() => {
    if (!open) {
      resetState();
      return;
    }
    abortRef.current = new AbortController();
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, [open, resetState]);

  const handleDownloadTemplate = useCallback(() => {
    const link = document.createElement('a');
    link.href = ORDER_IMPORT_TEMPLATE_PUBLIC_PATH;
    link.download = ORDER_IMPORT_TEMPLATE_DOWNLOAD_NAME;
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
    showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã kích hoạt tải file mẫu.' });
  }, [showSnackbar]);

  const handleStartImport = useCallback(async () => {
    if (!selectedFile || submitting) return;

    setSubmitting(true);
    setActiveStep(1);
    setProcessingLabel('Đang validate dữ liệu');
    updateProcessingPercent(10);
    setValidateResult(null);
    setImportJobResult(null);

    try {
      const result = await postOrderImportValidate(selectedFile);
      if (abortRef.current?.signal.aborted) return;

      await completeProcessingProgress(processingPercentRef.current, updateProcessingPercent, {
        signal: abortRef.current?.signal,
      });
      if (abortRef.current?.signal.aborted) return;

      setValidateResult(result);
      setActiveStep(2);
    } catch (error) {
      if (abortRef.current?.signal.aborted || isAbortError(error)) return;
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
      setActiveStep(0);
      updateProcessingPercent(0);
    } finally {
      if (!abortRef.current?.signal.aborted) setSubmitting(false);
    }
  }, [selectedFile, showSnackbar, submitting, updateProcessingPercent]);

  const handleConfirmImport = useCallback(async () => {
    if (!validateResult?.sessionId || confirming) return;
    setConfirming(true);
    // Stay on final step (Hoàn tất) while polling — do not jump back to Validate.
    setActiveStep(3);
    setImportJobResult(null);
    setProcessingLabel('Đang import đơn hàng');
    updateProcessingPercent(15);

    try {
      const confirmResult = await postOrderImportSessionConfirm(validateResult.sessionId);
      if (abortRef.current?.signal.aborted) return;

      if (!confirmResult.jobId?.trim()) {
        throw new Error('Không nhận được mã tác vụ import.');
      }

      const jobStatus = await waitOrderImportJobDone(confirmResult.jobId, {
        signal: abortRef.current?.signal,
        onProgress: (percent) => {
          if (!abortRef.current?.signal.aborted) updateProcessingPercent(percent);
        },
      });
      if (abortRef.current?.signal.aborted) return;

      // Job may finish at ~20–28%; animate to 100% before swapping result UI.
      await completeProcessingProgress(processingPercentRef.current, updateProcessingPercent, {
        signal: abortRef.current?.signal,
      });
      if (abortRef.current?.signal.aborted) return;

      const stats = jobStatus.importStats;
      const hasImportStats = Boolean(stats);
      const totalFromStats = typeof stats?.totalRows === 'number' && Number.isFinite(stats.totalRows) ? stats.totalRows : null;
      const successFromStats = typeof stats?.successRows === 'number' && Number.isFinite(stats.successRows) ? stats.successRows : null;
      const failedFromStats = typeof stats?.failedRows === 'number' && Number.isFinite(stats.failedRows) ? stats.failedRows : null;

      setImportJobResult({
        jobId: jobStatus.jobId || confirmResult.jobId,
        fileUrl: jobStatus.fileUrl ?? null,
        fileName: jobStatus.fileName ?? null,
        totalRows: totalFromStats ?? confirmResult.totalOrders,
        // Never invent success/failure when IE omitted importStats.
        successRows: hasImportStats ? (successFromStats ?? 0) : null,
        failedRows: hasImportStats ? (failedFromStats ?? 0) : null,
        hasImportStats,
      });
      setActiveStep(3);
    } catch (error) {
      if (abortRef.current?.signal.aborted || isAbortError(error)) return;
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
      setActiveStep(2);
      updateProcessingPercent(0);
    } finally {
      if (!abortRef.current?.signal.aborted) setConfirming(false);
    }
  }, [confirming, showSnackbar, updateProcessingPercent, validateResult]);

  const handleDownloadErrorFile = useCallback(async () => {
    if (downloadingErrorFile) return;
    setDownloadingErrorFile(true);
    try {
      if (activeStep === 3 && importJobResult?.fileUrl?.trim()) {
        await downloadRemoteFile(importJobResult.fileUrl.trim(), importJobResult.fileName?.trim() || 'order-import-result.xlsx');
        return;
      }

      if (!validateResult) return;

      if (validateResult.errorFileUrl?.trim()) {
        await downloadRemoteFile(validateResult.errorFileUrl.trim(), 'order-import-errors.xlsx');
        return;
      }
      const blob = await getOrderImportSessionErrorFileBlob(validateResult.sessionId);
      downloadBlobAsFile(blob, 'order-import-errors.xlsx');
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setDownloadingErrorFile(false);
    }
  }, [activeStep, downloadingErrorFile, importJobResult, showSnackbar, validateResult]);

  const isImportProcessing = confirming && !importJobResult;

  return {
    activeStep,
    selectedFile,
    fileValue,
    uploadError,
    processingPercent,
    processingLabel,
    validateResult,
    importJobResult,
    submitting,
    confirming,
    isImportProcessing,
    downloadingErrorFile,
    setFileValue,
    setSelectedFile,
    setUploadError,
    handleDownloadTemplate,
    handleStartImport,
    handleConfirmImport,
    handleDownloadErrorFile,
  };
};
