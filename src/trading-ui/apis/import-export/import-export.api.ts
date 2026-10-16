import { axiosRequest } from '../../common/config';
import { isJavaBackend } from '@/common/config/app.config';
import { JAVA_PRODUCT_IE, javaImportProducts, javaExportProducts, javaProductJobs, javaProductJob } from '@/apis/java/java-product-ie.api';
import type { ProductExportFiltersDto } from './import-export.interface';
import { type ResList } from '../../common/constant/api.interface';
import { delayMs } from '../../common/utils/delay-ms.util';
import { type JobProcess, type TopicConfig, type WorkerQueueProfile } from './import-export.entities';
import { JobProcessStatus } from './import-export.enum';
import {
  type CreateTopicConfigDto,
  type CreateWorkerQueueProfileDto,
  type ExportTopicConfigsRequestDto,
  type ImportJobResultRow,
  type JobStatusResponseDto,
  type PostImportTopicConfigsOptions,
  type PostImportTopicConfigsResponse,
  type QueryImportJobResultRowsDto,
  type QueryJobDto,
  type TransferImportJobsReferenceDto,
  type TransferImportJobsReferenceResponse,
  type UpdateTopicConfigDto,
} from './import-export.interface';

const IMPORT_EXPORT_BASE_PATH = 'ie';

export const getImportExportWorkerQueueProfiles = async (): Promise<WorkerQueueProfile[]> => await axiosRequest.get(`${IMPORT_EXPORT_BASE_PATH}/worker-queue-profiles`);

export const postImportExportWorkerQueueProfiles = async (payload: CreateWorkerQueueProfileDto): Promise<WorkerQueueProfile> =>
  await axiosRequest.post(`${IMPORT_EXPORT_BASE_PATH}/worker-queue-profiles`, payload);

export const getImportExportTopicConfigs = async (): Promise<TopicConfig[]> => await axiosRequest.get(`${IMPORT_EXPORT_BASE_PATH}/topic-configs`);

export const postImportExportTopicConfig = async (payload: CreateTopicConfigDto): Promise<TopicConfig> => await axiosRequest.post(`${IMPORT_EXPORT_BASE_PATH}/topic-configs`, payload);

export const patchImportExportTopicConfig = async (topicConfigId: string, payload: UpdateTopicConfigDto): Promise<TopicConfig> =>
  await axiosRequest.patch(`${IMPORT_EXPORT_BASE_PATH}/topic-configs/${topicConfigId}`, payload);

export const postImportTopicConfigs = async (topicConfigId: string, file: File, options?: PostImportTopicConfigsOptions): Promise<PostImportTopicConfigsResponse> => {
  if (isJavaBackend()) {
    if (topicConfigId !== JAVA_PRODUCT_IE.importTopic) throw new Error('Java chưa hỗ trợ loại import này.');
    return javaImportProducts(file, options);
  }
  const formData = new FormData();
  formData.append('file', file);
  const referenceType = options?.referenceType?.trim();
  const referenceId = options?.referenceId?.trim();
  if (referenceType) formData.append('referenceType', referenceType);
  if (referenceId) formData.append('referenceId', referenceId);
  return await axiosRequest.post(`${IMPORT_EXPORT_BASE_PATH}/import/topic-config/${topicConfigId}`, formData);
};

export const postExportTopicConfigs = async (topicConfigId: string, payload: ExportTopicConfigsRequestDto): Promise<{ jobId: string; status: JobProcessStatus }> => {
  if (isJavaBackend()) {
    if (topicConfigId !== JAVA_PRODUCT_IE.exportTopic) throw new Error('Java chưa hỗ trợ loại export này (bao gồm Fast FBO).');
    return javaExportProducts(payload.filters as ProductExportFiltersDto | undefined);
  }
  return await axiosRequest.post(`${IMPORT_EXPORT_BASE_PATH}/export/topic-config/${topicConfigId}`, payload);
};

export const getImportExportListJobs = async (params: Partial<QueryJobDto>): Promise<ResList<JobProcess>> => isJavaBackend() ? javaProductJobs(params) : await axiosRequest.get(`${IMPORT_EXPORT_BASE_PATH}/jobs`, { params });

export const transferImportJobsReference = async (payload: TransferImportJobsReferenceDto): Promise<TransferImportJobsReferenceResponse> =>
  await axiosRequest.patch(`${IMPORT_EXPORT_BASE_PATH}/jobs/reference/transfer`, payload);

export const getImportExportJobStatus = async (jobId: string): Promise<JobStatusResponseDto> => isJavaBackend() ? javaProductJob(jobId) : await axiosRequest.get(`${IMPORT_EXPORT_BASE_PATH}/job/status/${jobId}`);

export const getImportJobResultRows = async <TResolvedData = Record<string, unknown>>(jobId: string, query?: QueryImportJobResultRowsDto): Promise<ResList<ImportJobResultRow<TResolvedData>>> =>
  await axiosRequest.get(`${IMPORT_EXPORT_BASE_PATH}/jobs/${jobId}/result-rows`, { params: query });

export const waitImportExportJobFileUrl = async (jobId: string): Promise<JobStatusResponseDto> => {
  const pollIntervalMs = 800;
  const deadline = Date.now() + 60_000;

  await delayMs(2000);

  while (Date.now() < deadline) {
    const status = await getImportExportJobStatus(jobId);

    if (status.status === JobProcessStatus.FAILED) {
      const detail = status.errorMessage?.trim();
      throw new Error(detail || 'Tác vụ thất bại.');
    }

    if (status.status === JobProcessStatus.DONE) {
      if (status.fileUrl?.trim()) {
        return status;
      }
      throw new Error('Export hoàn tất nhưng chưa có link tải file. Xem Trình quản lý tác vụ.');
    }

    await delayMs(pollIntervalMs);
  }

  throw new Error('Quá thời gian chờ file. Xem Trình quản lý tác vụ.');
};
