import { type MediaVisibility } from './file.enum';

export interface IUploadMediaFileRequest {
  file: File;
  visibility?: MediaVisibility;
  owner?: string | null;
  ownerId?: string | null;
  pathPrefix?: string | null;
}

export interface IUploadMediaFileResponse {
  asset: {
    id: string;
    workspaceId: string;
    owner: string | null;
    ownerId: string | null;
    visibility: MediaVisibility;
    status: string;
    originalFilename: string;
    mimeType: string;
    sizeBytes: string;
    checksumSha256: string;
    contentVersion: string;
    bucket: string;
    objectKey: string;
    publicUrl: string;
    metadata: Record<string, unknown> | null;
    defaultFrameId: string | null;
    uploadedAt: string;
    uploadedById: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  };
}

// ─── Upload Intent (dùng cho video / file lớn) ───────────────────────────────

export interface ICreateUploadIntentRequest {
  originalFilename: string;
  mimeType: string;
  visibility: MediaVisibility;
  sizeBytes: number;
  pathPrefix?: string | null;
  /** Presigned URL hết hạn sau N giây (mặc định server tự set). */
  expiresInSec?: number;
}

export interface ICreateUploadIntentResponse {
  intentId: string;
  uploadUrl: string;
  /** Headers bắt buộc khi PUT lên uploadUrl (vd: { "Content-Type": "video/mp4" }). */
  requiredHeaders: Record<string, string>;
  expiresAt: string;
}

export interface ICompleteUploadIntentRequest {
  sizeBytes: number;
  checksumSha256?: string;
}

export interface ICompleteUploadIntentResponse {
  fileId: string;
  asset: IUploadMediaFileResponse['asset'];
}
