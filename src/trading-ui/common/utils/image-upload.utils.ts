import { CMS_DEMO_CLIENT_URL } from '@/apis/cms-demo/cms-demo.api';
import { getDataSourceMode } from '@/common/config/app.config';
import type { MediaVisibility } from '../../apis/file/file.enum';
export interface DemoMediaUploadRequest { file: File; visibility?: MediaVisibility; pathPrefix?: string | null }
export interface DemoMediaUploadResponse { asset: { publicUrl: string } }
export async function uploadSingleImage(data: DemoMediaUploadRequest): Promise<DemoMediaUploadResponse> {
  if (getDataSourceMode() !== 'MOCK') throw new Error('Upload CMS demo chỉ dùng ở chế độ MOCK.');
  const form = new FormData();
  form.append('file', data.file);
  const response = await fetch('/api/demo-cms/media', { method: 'POST', body: form });
  if (!response.ok) {
    const error: { message?: string } = await response.json();
    throw new Error(error.message || 'Không thể upload ảnh.');
  }
  const result: DemoMediaUploadResponse = await response.json();
  return { asset: { publicUrl: new URL(result.asset.publicUrl, CMS_DEMO_CLIENT_URL).href } };
}
