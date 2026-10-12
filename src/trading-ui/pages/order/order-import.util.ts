import { getImportExportJobStatus } from '../../apis/import-export/import-export.api';
import { JobProcessStatus } from '../../apis/import-export/import-export.enum';
import type { JobStatusResponseDto } from '../../apis/import-export/import-export.interface';
import { delayMs } from '../../common/utils/delay-ms.util';

/** File mẫu trong `public/oms/import_order.xlsx` — served tại `/oms/import_order.xlsx`. */
export const ORDER_IMPORT_TEMPLATE_PUBLIC_PATH = '/oms/import_order.xlsx';
export const ORDER_IMPORT_TEMPLATE_DOWNLOAD_NAME = 'file-mau-import-don-hang.xlsx';

const ORDER_IMPORT_JOB_POLL = {
  /** Wait before first status check — job rarely finishes instantly. */
  initialDelayMs: 1_500,
  /** Base interval between polls. */
  baseIntervalMs: 2_000,
  /** Cap interval so we never hammer the API. */
  maxIntervalMs: 5_000,
  /** Soft overall timeout. */
  timeoutMs: 180_000,
} as const;

export type WaitOrderImportJobOptions = {
  /** Abort signal (e.g. dialog closed). */
  signal?: AbortSignal;
  onProgress?: (percent: number) => void;
  timeoutMs?: number;
};

const assertNotAborted = (signal?: AbortSignal) => {
  if (signal?.aborted) {
    throw new DOMException('Import polling cancelled.', 'AbortError');
  }
};

/**
 * Soft-animate fake progress up to 100%, then hold briefly so the bar is visible
 * before the next wizard UI mounts.
 */
export const completeProcessingProgress = async (fromPercent: number, onProgress: (percent: number) => void, options?: { signal?: AbortSignal; holdAtCompleteMs?: number }): Promise<void> => {
  let current = Math.max(0, Math.min(99, Math.round(fromPercent)));

  while (current < 100) {
    assertNotAborted(options?.signal);
    const remaining = 100 - current;
    const step = Math.max(4, Math.ceil(remaining / 3));
    current = Math.min(100, current + step);
    onProgress(current);
    if (current < 100) {
      await delayMs(140);
    }
  }

  assertNotAborted(options?.signal);
  await delayMs(options?.holdAtCompleteMs ?? 400);
};

/**
 * Poll IE job status with backoff.
 * Caps soft progress at 92% until DONE — caller should run `completeProcessingProgress` before UI swap.
 */
export const waitOrderImportJobDone = async (jobId: string, options?: WaitOrderImportJobOptions): Promise<JobStatusResponseDto> => {
  const timeoutMs = options?.timeoutMs ?? ORDER_IMPORT_JOB_POLL.timeoutMs;
  const deadline = Date.now() + timeoutMs;
  let intervalMs: number = ORDER_IMPORT_JOB_POLL.baseIntervalMs;
  let lastReportedPercent = -1;
  let tick = 0;

  const reportProgress = (percent: number) => {
    const next = Math.max(0, Math.min(92, Math.round(percent)));
    if (next === lastReportedPercent) return;
    lastReportedPercent = next;
    options?.onProgress?.(next);
  };

  assertNotAborted(options?.signal);
  await delayMs(ORDER_IMPORT_JOB_POLL.initialDelayMs);
  assertNotAborted(options?.signal);
  reportProgress(20);

  while (Date.now() < deadline) {
    assertNotAborted(options?.signal);

    const status = await getImportExportJobStatus(jobId);

    if (status.status === JobProcessStatus.FAILED) {
      throw new Error('Tác vụ import thất bại. Vui lòng kiểm tra Trình quản lý tác vụ.');
    }

    if (status.status === JobProcessStatus.DONE) {
      return status;
    }

    tick += 1;
    // Soft progress only — real completion comes from DONE status.
    reportProgress(Math.min(88, 20 + tick * 8));

    await delayMs(intervalMs);
    intervalMs = Math.min(ORDER_IMPORT_JOB_POLL.maxIntervalMs, Math.round(intervalMs * 1.25));
  }

  throw new Error('Quá thời gian chờ xử lý import. Xem Trình quản lý tác vụ.');
};
