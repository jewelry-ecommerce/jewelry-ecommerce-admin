export enum ImportStrategy {
  UPSERT = 'upsert',
  INSERT = 'insert',
}

export enum JobProcessStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  DONE = 'DONE',
  FAILED = 'FAILED',
}

export enum JobProcessType {
  IMPORT = 'IMPORT',
  EXPORT = 'EXPORT',
}

export enum TopicAction {
  IMPORT = 'IMPORT',
  EXPORT = 'EXPORT',
}

export enum WorkerQueueProfileStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}
