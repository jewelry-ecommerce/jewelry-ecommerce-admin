export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Không thể thực hiện thao tác.';
}
