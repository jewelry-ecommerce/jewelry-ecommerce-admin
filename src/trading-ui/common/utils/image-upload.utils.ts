import { CMS_DEMO_CLIENT_URL } from '@/apis/cms-demo/cms-demo.api';
import { getDataSourceMode, isJavaBackend, getApiBaseUrl } from '@/common/config/app.config';
import { backendRequest } from '@/apis/backend-request';
import type { MediaVisibility } from '../../apis/file/file.enum';
export interface DemoMediaUploadRequest { file: File; visibility?: MediaVisibility; pathPrefix?: string | null }
export interface DemoMediaUploadResponse { asset: { publicUrl: string } }
export function uploadMultipleImages(data: DemoMediaUploadRequest[]): Promise<DemoMediaUploadResponse[]> {
  return Promise.all(data.map(uploadSingleImage));
}
export async function uploadSingleImage(data: DemoMediaUploadRequest): Promise<DemoMediaUploadResponse> {
  const form = new FormData();
  form.append('file', data.file);
  if (getDataSourceMode() === 'HTTP' && isJavaBackend()) {
    const uploaded = await backendRequest<{url:string}>('admin/catalog/upload', 'POST', form);
    return {asset:{publicUrl:new URL(uploaded.url, getApiBaseUrl()).href}};
  }
  if (getDataSourceMode() === 'HTTP') return backendRequest<DemoMediaUploadResponse>('media/upload', 'POST', form);
  const response = await fetch('/api/demo-cms/media', { method: 'POST', body: form });
  if (!response.ok) {
    const error: { message?: string } = await response.json();
    throw new Error(error.message || 'Không thể upload ảnh.');
  }
  const result: DemoMediaUploadResponse = await response.json();
  return { asset: { publicUrl: new URL(result.asset.publicUrl, CMS_DEMO_CLIENT_URL).href } };
}
export {readImageMetadata} from './image-upload.utils.source';
export type {ImageMetadata} from './image-upload.utils.source';
