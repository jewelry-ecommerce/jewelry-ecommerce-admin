/** Bỏ qua trường metadata khi render diff audit log trên UI. */
export const isAuditMetadataFieldPath = (field?: string): boolean => {
  if (!field) return false;
  const normalized = field.trim().toLowerCase();
  if (normalized === 'metadata') return true;
  return normalized.endsWith('.metadata') || normalized.includes('.metadata.');
};
