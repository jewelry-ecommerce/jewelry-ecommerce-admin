import { backendRequest } from '@/apis/backend-request';
import { getApiBaseUrl } from '@/common/config/app.config';
import type { JobProcessStatus, JobProcessType } from '@/trading-ui/apis/import-export/import-export.enum';
import type { JobProcess } from '@/trading-ui/apis/import-export/import-export.entities';
import type { ProductExportFiltersDto, QueryJobDto, PostImportTopicConfigsOptions } from '@/trading-ui/apis/import-export/import-export.interface';
import { javaProductList } from './java-product.api';
import type { ProductQuery } from '@/trading-ui/apis/product/product.interface';

export const JAVA_PRODUCT_IE = { importTopic: 'PRODUCT_IMPORT', exportTopic: 'PRODUCT_EXPORT', base: 'admin/ie', csvType: 'text/csv' } as const;
interface WireJob { id: number; jobId: number; jobType: JobProcessType; status: JobProcessStatus; fileName?: string;
  fileUrl?: string; errorMessage?: string; totalRows: number; successRows: number; failedRows: number;
  referenceType?: string; referenceId?: string; createdAt: string; finishedAt?: string }
function fileUrl(url?: string): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  const base = getApiBaseUrl();
  if (/^https?:\/\//i.test(base)) return new URL(url, base).href;
  return url;
}
function jobStatus(row: WireJob) {
  return { jobId: String(row.jobId), status: row.status, fileName: row.fileName, fileUrl: fileUrl(row.fileUrl), errorMessage: row.errorMessage,
    importStats: { totalRows: row.totalRows, successRows: row.successRows, failedRows: row.failedRows } };
}
function jobView(row: WireJob): JobProcess {
  return { id: String(row.id), type: row.jobType, status: row.status, createdAt: new Date(row.createdAt), updatedAt: new Date(row.finishedAt ?? row.createdAt),
    fileName: row.fileName, fileUrl: fileUrl(row.fileUrl), errorMessage: row.errorMessage, referenceType: row.referenceType, referenceId: row.referenceId,
    importTotalRows: row.totalRows, importSuccessRows: row.successRows, importFailedRows: row.failedRows };
}
export async function javaImportProducts(file: File, options?: PostImportTopicConfigsOptions) {
  if (!file.name.toLowerCase().endsWith('.csv')) throw new Error('Java hiện hỗ trợ file CSV. Tải mẫu CSV để nhập sản phẩm.');
  const body = new FormData(); body.append('file', file);
  if (options?.referenceType) body.append('referenceType', options.referenceType);
  if (options?.referenceId) body.append('referenceId', options.referenceId);
  return jobStatus(await backendRequest<WireJob>(JAVA_PRODUCT_IE.base + '/import/products', 'POST', body));
}
export async function javaExportProducts(filters: ProductExportFiltersDto = {}) {
  const { productIds, orderBy, ...query } = filters;
  const sortField: ProductQuery['orderBy'] = orderBy === 'createdAt' || orderBy === 'updatedAt' ? orderBy : undefined;
  if (orderBy && !sortField) throw new Error('Java chưa hỗ trợ export theo thứ tự: ' + orderBy);
  const products = await javaProductList({ ...query, orderBy: sortField, productIds: productIds?.join(','), isPagination: filters.isPagination === true });
  if (!products.list.length) throw new Error('Không có sản phẩm phù hợp để export.');
  const body = { productIds: products.list.map(product => Number(product.id)) };
  return jobStatus(await backendRequest<WireJob>(JAVA_PRODUCT_IE.base + '/export/products', 'POST', body));
}
export async function javaProductJobs(query: Partial<QueryJobDto>) {
  if (query.topicConfigId && ![JAVA_PRODUCT_IE.importTopic, JAVA_PRODUCT_IE.exportTopic].some(code => code === query.topicConfigId))
    throw new Error('Java chưa hỗ trợ tác vụ của module này.');
  if (query.referenceType || query.referenceId) throw new Error('Java chưa hỗ trợ lọc tác vụ theo tham chiếu.');
  const params = new URLSearchParams({ page: String(query.page ?? 1), take: String(query.take ?? 20) });
  if (query.status) params.set('status', query.status);
  const result = await backendRequest<{ list: WireJob[]; total: number }>(JAVA_PRODUCT_IE.base + '/jobs?' + params);
  return { list: result.list.map(jobView), total: result.total };
}
export async function javaProductJob(id: string) {
  return jobStatus(await backendRequest<WireJob>(JAVA_PRODUCT_IE.base + '/job/status/' + encodeURIComponent(id)));
}
export async function javaDownloadProductTemplate(): Promise<void> {
  const topics = await backendRequest<{ importRequiredColumns: string[] }>(JAVA_PRODUCT_IE.base + '/topics');
  const columns = topics.importRequiredColumns.map(column => column.split('|')[0]);
  const url = URL.createObjectURL(new Blob(['\uFEFF' + columns.join(',') + '\r\n'], { type: JAVA_PRODUCT_IE.csvType }));
  const link = document.createElement('a'); link.href = url; link.download = 'Import_Product_Template.csv'; link.click();
  URL.revokeObjectURL(url);
}
