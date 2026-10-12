import axios from 'axios';
import { axiosRequest } from '../../common/config';
import { MediaVisibility } from './file.enum';
import {
  type ICompleteUploadIntentRequest,
  type ICompleteUploadIntentResponse,
  type ICreateUploadIntentRequest,
  type ICreateUploadIntentResponse,
  type IUploadMediaFileRequest,
  type IUploadMediaFileResponse,
} from './file.interface';

const FILE_BASE_PATH = 'file/file';

// ─── Multipart upload (ảnh, GIF, file nhỏ ≤ 25 MB) ──────────────────────────

export const uploadMediaFile = async (data: IUploadMediaFileRequest): Promise<IUploadMediaFileResponse> => {
  const formData = new FormData();
  formData.append('file', data.file);
  formData.append('visibility', data.visibility ?? MediaVisibility.PUBLIC);
  // if (data.owner != null && data.owner !== '') formData.append('owner', data.owner);
  // if (data.ownerId != null && data.ownerId !== '') formData.append('ownerId', data.ownerId);
  if (data.pathPrefix != null && data.pathPrefix !== '') formData.append('pathPrefix', data.pathPrefix);
  return await axiosRequest.post(`${FILE_BASE_PATH}/media/upload`, formData);
};

// ─── Upload Intent API (video / file lớn) ────────────────────────────────────

/**
 * Bước 1 — Tạo intent: nhận `intentId` + `uploadUrl` + `requiredHeaders`.
 * API code: `api_file_post_file`
 */
export const createUploadIntent = async (data: ICreateUploadIntentRequest): Promise<ICreateUploadIntentResponse> => {
  return await axiosRequest.post(`${FILE_BASE_PATH}`, data);
};

/**
 * Bước 2 — PUT file bytes thẳng lên `uploadUrl` (presigned S3/MinIO).
 * Không đi qua `axiosRequest` — không cần Bearer, timeout dài hơn.
 * Gọi `onUploadProgress(percent)` với percent 0–99 trong quá trình PUT.
 */
export const putFileToUploadUrl = async (uploadUrl: string, file: File, requiredHeaders: Record<string, string>, onUploadProgress?: (percent: number) => void): Promise<void> => {
  await axios.put(uploadUrl, file, {
    headers: { 'Content-Type': file.type, ...requiredHeaders },
    timeout: 0, // Video lớn — không giới hạn timeout
    onUploadProgress: (event) => {
      if (onUploadProgress && event.total) {
        const percent = Math.round((event.loaded * 100) / event.total);
        onUploadProgress(Math.min(percent, 99)); // 100% chỉ sau complete
      }
    },
  });
};

/**
 * Bước 3 — Hoàn tất intent: file-service xác nhận và trả `asset` giống multipart.
 * API code: `api_file_post_file_upload_intents_intentid_complete`
 */
export const completeUploadIntent = async (intentId: string, data: ICompleteUploadIntentRequest): Promise<ICompleteUploadIntentResponse> => {
  return await axiosRequest.post(`${FILE_BASE_PATH}/upload-intents/${intentId}/complete`, data);
};

/**
 * Hủy intent nếu upload thất bại giữa chừng (tránh leak object trên storage).
 * API code: `api_file_post_file_upload_intents_intentid_abort`
 */
export const abortUploadIntent = async (intentId: string): Promise<void> => {
  await axiosRequest.post(`${FILE_BASE_PATH}/upload-intents/${intentId}/abort`);
};
