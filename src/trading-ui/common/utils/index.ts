export { formatDateTime } from './date-format.util';
export function viDayOfWeekFormatter(date: { format: (pattern:string) => string }): string { return date.format('dd'); }
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Không thể thực hiện thao tác.';
}
export {copyTextToClipboard} from './clipboard.util';
export {getCopyFailureMessage} from './clipboard.util';
export {getCopySuccessMessage} from './clipboard.util';
export {formatDate} from './date-format.util';
export {formatTime} from './date-format.util';
export {getStatusPillSx} from './status.util';
