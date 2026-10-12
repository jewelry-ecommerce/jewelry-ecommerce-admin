export enum BadgeStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export enum LabelTemplateClassification {
  SOLD_OUT = 'SOLD_OUT',
  NEW_ARRIVAL = 'NEW_ARRIVAL',
  BEST_SELLER = 'BEST_SELLER',
  LOW_STOCK = 'LOW_STOCK',
}

// new
export enum TargetDevice {
  ALL = 'ALL',
  MOBILE = 'MOBILE',
  DESKTOP = 'DESKTOP',
}

export enum VersionStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum PageDisplayStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  ENDED = 'ENDED',
}

export enum NavigationType {
  NONE = 'NONE',
  CATEGORY = 'CATEGORY',
  COLLECTION = 'COLLECTION',
  LINK = 'LINK',
  FILTER = 'FILTER',
  PAGE = 'PAGE',
  GROUP = 'GROUP',
}
