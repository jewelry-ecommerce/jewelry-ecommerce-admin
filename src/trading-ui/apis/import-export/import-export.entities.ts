import { type BaseEntity } from '../../common/constant/api.interface';
import { type ImportStrategy, type JobProcessStatus, type JobProcessType, type TopicAction, type WorkerQueueProfileStatus } from './import-export.enum';

export interface JobProcess extends BaseEntity {
  userId?: string;
  topicConfig?: TopicConfig;
  workspaceId?: string;
  tenantCode?: string;
  type: JobProcessType;
  status: JobProcessStatus;
  referenceType?: string | null;
  referenceId?: string | null;
  fileUrl?: string;
  fileName?: string;
  errorFileUrl?: string;
  errorMessage?: string | null;
  importTotalRows?: number;
  importSuccessRows?: number;
  importFailedRows?: number;
  exportFilters?: Record<string, unknown>;
}

export interface TopicConfig extends BaseEntity {
  workerQueueProfile: WorkerQueueProfile;
  workspaceId: string;
  tenantCode: string;
  routingKey: string;
  filterFields: string[];
  importStrategy?: ImportStrategy;
  uniqueKeys?: string[];
  columnMapping?: Record<string, string>;
  bulkSize: number;
}

export interface WorkerQueueProfile extends BaseEntity {
  workerCode: string;
  action: TopicAction;
  name: string;
  status: WorkerQueueProfileStatus;
}
