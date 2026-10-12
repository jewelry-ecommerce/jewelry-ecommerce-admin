export type CatalogDependencyModuleCode = 'PROMOTION' | 'BADGE' | 'CMS';

export type CatalogDependencyItem = {
  sourceType?: 'COLLECTION' | 'CATEGORY';
  sourceId?: string;
  module: CatalogDependencyModuleCode;
  entityType?: string;
  entityId?: string;
  name: string;
  status?: string;
};

export type CatalogInUseErrorPayload = {
  code?: string;
  message?: unknown;
  dependencies?: CatalogDependencyItem[];
  statusCode?: number;
};

const MODULE_LABEL: Record<CatalogDependencyModuleCode, string> = {
  PROMOTION: 'Promotion',
  BADGE: 'Cấu hình Label',
  CMS: 'CMS',
};

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object';

export const isCatalogInUseError = (error: unknown): error is CatalogInUseErrorPayload => {
  const payload = unwrapCatalogErrorPayload(error);
  if (!payload) return false;
  const code = typeof payload.code === 'string' ? payload.code : '';
  if (code === 'COLLECTION_IN_USE' || code === 'CATEGORY_IN_USE') return true;
  return Array.isArray(payload.dependencies) && payload.dependencies.length > 0;
};

export const getCatalogDependencyItems = (error: unknown): CatalogDependencyItem[] => {
  const payload = unwrapCatalogErrorPayload(error);
  if (!payload || !Array.isArray(payload.dependencies)) return [];
  return payload.dependencies.filter((item): item is CatalogDependencyItem => isRecord(item) && typeof item.module === 'string' && typeof item.name === 'string') as CatalogDependencyItem[];
};

function unwrapCatalogErrorPayload(error: unknown): CatalogInUseErrorPayload | null {
  if (!isRecord(error)) return null;
  if (typeof error.code === 'string' || Array.isArray(error.dependencies) || typeof error.message === 'string') {
    if (isRecord(error.message) && (error.message.code || error.message.dependencies)) {
      return error.message as CatalogInUseErrorPayload;
    }
    return error as CatalogInUseErrorPayload;
  }
  if (isRecord(error.message)) {
    return error.message as CatalogInUseErrorPayload;
  }
  return null;
}

export const formatCatalogDependencyLines = (dependencies: CatalogDependencyItem[]): string[] =>
  dependencies.map((dep) => {
    const moduleLabel = MODULE_LABEL[dep.module] ?? dep.module;
    // status change tiếng việt nếu có
    return `${moduleLabel}: ${dep.name}`;
  });

export const getCatalogInUseDialogCopy = (sourceType: 'COLLECTION' | 'CATEGORY', dependencies: CatalogDependencyItem[]): { title: string; highlightTitle: string; description: string } => {
  const label = sourceType === 'COLLECTION' ? 'Bộ sưu tập' : 'Danh mục';
  const lines = formatCatalogDependencyLines(dependencies);
  const listText = lines.length ? lines.map((line) => `- ${line}`).join('\n') : '- (không rõ cấu hình)';

  return {
    title: `Không thể xóa ${label} này`,
    highlightTitle: `${label} đang được sử dụng tại:`,
    description: `${listText}\n\nVui lòng gỡ ${label} khỏi các cấu hình trên trước khi xóa.`,
  };
};
