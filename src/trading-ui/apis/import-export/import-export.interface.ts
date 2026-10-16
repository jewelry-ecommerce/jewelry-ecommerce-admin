import type { PageOptionsDto } from '../../common/constant/api.interface';
import type { QueryAdminProductDto } from '../product/product.interface';
import type { OrderSource, OrderStatus, OrderTimeFilter, PaymentStatus, ShippingMethod } from '../order/order.enum';
import { type OrderType } from '../order/order.enum';
import { type AdminProductTimeFilter, type ProductSpuStatus } from '../product/product.enum';
import { type ImportStrategy, type JobProcessStatus, type TopicAction } from './import-export.enum';

export interface CreateWorkerQueueProfileDto {
  workerCode: string;
  action: TopicAction;
  name: string;
}

export interface UpdateWorkerQueueProfileDto {
  name: string;
}

// KHÔNG thêm lại "fields" — BE (CreateTopicConfigDto/UpdateTopicConfigDto) không khai báo property
// này, và ValidationPipe global bật forbidNonWhitelisted:true nên bất kỳ field lạ nào trong body
// đều bị từ chối thẳng với 400, không phải chỉ bị bỏ qua.
export interface CreateTopicConfigDto {
  workerQueueProfileId: string;
  routingKey: string;
  filterFields?: string[];
  importStrategy?: ImportStrategy;
  uniqueKeys?: string[];
  columnMapping?: Record<string, string>;
  bulkSize: number;
}

export interface UpdateTopicConfigDto {
  routingKey?: string;
  filterFields?: string[];
  importStrategy?: ImportStrategy;
  uniqueKeys?: string[];
  columnMapping?: Record<string, string>;
  bulkSize?: number;
}

export interface QueryJobDto extends PageOptionsDto<string> {
  topicConfigId?: string;
  status?: JobProcessStatus;
  referenceType?: string;
  referenceId?: string;
}

export interface TransferImportJobsReferenceDto {
  fromReferenceType: string;
  fromReferenceId: string;
  toReferenceType: string;
  toReferenceId: string;
}

export interface TransferImportJobsReferenceResponse {
  updatedCount: number;
}

export interface PostImportTopicConfigsOptions {
  referenceType?: string;
  referenceId?: string;
}

export interface PostImportTopicConfigsResponse {
  jobId: string;
  status: JobProcessStatus;
  topicConfigId?: string;
  referenceType?: string | null;
  referenceId?: string | null;
}

export interface ProductExportFiltersDto extends Pick<QueryAdminProductDto, 'brandId' | 'seasonUuid' | 'stockStatus'> {
  orderType?: OrderType;
  orderBy?: string;
  categoryUuid?: string;
  hasPendingApproval?: boolean;
  status?: Exclude<ProductSpuStatus, ProductSpuStatus.ALL>;
  timeFilter?: AdminProductTimeFilter;
  timeFrom?: string;
  timeTo?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  productIds?: string[];
  page?: number;
  take?: number;
  isPagination?: boolean;
}

export interface OrderExportFiltersDto {
  orderTimeFilter?: OrderTimeFilter;
  startDate?: string;
  endDate?: string;
  dateField?: 'createdAt' | 'deliveredAt';
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  source?: OrderSource;
  skuCode?: string;
  shippingMethod?: ShippingMethod;
  provinceName?: string;
  wardName?: string;
  search?: string;
  page?: number;
  take?: number;
}

export interface OrderReturnExportFiltersDto {
  orderTimeFilter?: OrderTimeFilter;
  startDate?: string;
  endDate?: string;
  status?: string;
  type?: string;
  reason?: string;
  reasonCategory?: string;
  orderId?: string;
  search?: string;
  page?: number;
  take?: number;
}

export interface OrderRefundExportFiltersDto {
  status?: string;
  paymentChannel?: string;
  originalPaymentMethod?: string;
  sourceType?: string;
  brand?: string;
  search?: string;
  page?: number;
  take?: number;
}

export interface OrderInvoiceExportFiltersDto {
  orderTimeFilter?: OrderTimeFilter;
  startDate?: string;
  endDate?: string;
  status?: string;
  documentType?: string;
  search?: string;
  page?: number;
  take?: number;
}

export interface ShipmentExportFiltersDto {
  orderTimeFilter?: OrderTimeFilter;
  startDate?: string;
  endDate?: string;
  carrier?: string;
  orderCategory?: string;
  shipmentStatus?: string;
  trackingTab?: string;
  warehouseId?: string;
  orderId?: string;
  orderCode?: string;
  trackingCode?: string;
  search?: string;
  shipmentIds?: string;
  page?: number;
  take?: number;
}

export interface CustomerRequestExportFiltersDto {
  timeFilter?: OrderTimeFilter;
  timeFrom?: string;
  timeTo?: string;
  status?: string;
  keyword?: string;
  orderType?: string;
  ids?: string[];
  page?: number;
  take?: number;
}

/** Filters for WMS putaway Fast FBO (IRTran) export via IE. */
export interface PutawayFastFboExportFiltersDto {
  status?: number;
  putType?: number;
  fromDate?: number;
  toDate?: number;
  sortBy?: Array<{ field: string; isDescending: boolean }>;
  keyword?: string;
  putawayIds?: string[];
  purchaseOrderIds?: string[];
}

export interface InventoryExportFiltersDto {
  /** Tab đang xem — worker dùng để chọn bộ cột. */
  tab: 'inventory-by-item' | 'inventory-by-location' | 'inventory-transaction';
  keyword?: string;
  zoneId?: string;
  statusFilter?: string;
  types?: number[];
  fromDate?: number;
  toDate?: number;
  sortBy?: Array<{ field: string; isDescending: boolean }>;
  /** Chỉ set khi "Xuất dòng đã chọn" — itemCode | locationAreaBinId | transactionId tùy tab. */
  selectedRowIds?: string[];
}

export interface ExportTopicConfigsRequestDto {
  filters?:
    | ProductExportFiltersDto
    | OrderExportFiltersDto
    | OrderReturnExportFiltersDto
    | OrderRefundExportFiltersDto
    | OrderInvoiceExportFiltersDto
    | ShipmentExportFiltersDto
    | CustomerRequestExportFiltersDto
    | PutawayFastFboExportFiltersDto
    | InventoryExportFiltersDto
    | PreOrderOrderExportFiltersDto;
}

export interface PreOrderOrderExportFiltersDto {
  keyword?: string;
  statuses?: string[];
  createdFrom?: string;
  createdTo?: string;
  preOrderIds?: string[];
  page?: number;
  take?: number;
  sortField?: string;
  sortDirection?: string;
}

export interface ImportStats {
  totalRows: number;
  successRows: number;
  failedRows: number;
}

export interface JobStatusResponseDto {
  fileName?: string;
  jobId: string;
  status: JobProcessStatus;
  fileUrl?: string;
  errorFileUrl?: string | null;
  errorMessage?: string | null;
  importStats?: ImportStats;
}

export type ImportJobResultRowStatus = 'OK' | 'ERROR';

export interface QueryImportJobResultRowsDto {
  status?: ImportJobResultRowStatus;
  isPagination?: boolean;
  page?: number;
  take?: number;
}

export interface ImportJobResultRow<TResolvedData = Record<string, unknown>> {
  id: string;
  jobId: string;
  rowIndex: number;
  status: ImportJobResultRowStatus;
  errorMessage?: string | null;
  rawData?: Record<string, unknown> | null;
  resolvedData: TResolvedData;
}
