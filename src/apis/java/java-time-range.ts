import dayjs from 'dayjs';
export function javaTimeRange(preset?: string, from?: string, to?: string): { start?: string; end?: string } {
  if (from || to) return { start: from, end: to };
  const now=dayjs();
  let start=now.startOf('day'),end=now.endOf('day');
  switch(preset?.replace(/_/g,'').toUpperCase()) {
    case 'TODAY': break;
    case 'YESTERDAY': start=start.subtract(1,'day');end=end.subtract(1,'day');break;
    case 'LAST7DAYS': start=start.subtract(6,'day');break;
    case 'LAST30DAYS': start=start.subtract(29,'day');break;
    case 'LAST90DAYS': start=start.subtract(89,'day');break;
    case 'THISMONTH': start=now.startOf('month');break;
    case 'LASTMONTH': start=now.subtract(1,'month').startOf('month');end=start.endOf('month');break;
    default: return {};
  }
  return {start:start.toISOString(),end:end.toISOString()};
}
