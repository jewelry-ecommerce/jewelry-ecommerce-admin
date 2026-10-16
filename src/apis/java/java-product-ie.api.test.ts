import { beforeEach, expect, test, vi } from 'vitest';
const transport = vi.hoisted(() => ({ request: vi.fn(), products: vi.fn() }));
vi.mock('@/apis/backend-request', () => ({ backendRequest: transport.request }));
vi.mock('@/common/config/app.config', () => ({ getApiBaseUrl: () => 'http://localhost:8082/api/v1' }));
vi.mock('./java-product.api', () => ({ javaProductList: transport.products }));
import { javaExportProducts, javaProductJob, javaProductJobs, javaImportProducts } from './java-product-ie.api';
beforeEach(() => { vi.clearAllMocks(); });
test('export selects exact displayed page IDs rather than silently exporting all', async () => {
  transport.products.mockResolvedValue({ list: [{ id: '9' }, { id: '12' }] });
  transport.request.mockResolvedValue({ jobId: 5, status: 'DONE', fileUrl: '/api/v1/storefront/files/ie/export.csv' });
  await javaExportProducts({ page: 2, take: 20, isPagination: true, search: 'ring' });
  expect(transport.products).toHaveBeenCalledWith(expect.objectContaining({ page: 2, isPagination: true, search: 'ring' }));
  expect(transport.request).toHaveBeenCalledWith('admin/ie/export/products', 'POST', { productIds: [9, 12] });
});
test('empty selection never turns into backend export-all', async () => {
  transport.products.mockResolvedValue({ list: [] });
  await expect(javaExportProducts({ search: 'missing' })).rejects.toThrow('Không có sản phẩm');
  expect(transport.request).not.toHaveBeenCalled();
});
test('relative file URL resolves to Java host, not Vite admin origin', async () => {
  transport.request.mockResolvedValue({ jobId: 5, status: 'DONE', fileUrl: '/api/v1/storefront/files/ie/export.csv' });
  expect((await javaProductJob('5')).fileUrl).toBe('http://localhost:8082/api/v1/storefront/files/ie/export.csv');
});
test('jobs from unsupported modules do not get substituted with product jobs', async () => {
  await expect(javaProductJobs({ topicConfigId: 'label-import' })).rejects.toThrow('module');
  expect(transport.request).not.toHaveBeenCalled();
});
test('Excel is explicitly rejected instead of uploading it to CSV parser', async () => {
  await expect(javaImportProducts({ name: 'products.xlsx' } as File)).rejects.toThrow('CSV');
  expect(transport.request).not.toHaveBeenCalled();
});
