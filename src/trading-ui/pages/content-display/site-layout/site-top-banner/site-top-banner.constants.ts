import dayjs from 'dayjs';
import type { HeaderAdmin, HeaderStatus, UpdateHeaderDto } from '../../../../apis';
import type { TopBannerFormValues } from './site-top-banner.interface';

export const BANNER_DISPLAY_STYLE_OPTIONS = [
  { value: 'TEXT' as const, label: 'Văn bản' },
  { value: 'MEDIA' as const, label: 'Hình ảnh' },
];

export const BANNER_ANIMATION_OPTIONS = [
  { value: 'STATIC', label: 'Tĩnh' },
  { value: 'FADE', label: 'Mờ dần' },
  { value: 'SLIDE', label: 'Trượt' },
];

export const BANNER_UPLOAD_ACCEPT = 'image/*,video/*,.gif,.mp4,.webm,.mov';
export const BANNER_UPLOAD_MAX_BYTES = 50 * 1024 * 1024;
export const BANNER_UPLOAD_HINT = 'Hỗ trợ ảnh/GIF/video (tối đa 50MB)';

export const DEFAULT_TOP_BANNER_FORM: TopBannerFormValues = {
  bannerName: '',
  bannerDisplayStyle: 'TEXT',
  bannerContent: '',
  bannerBgColor: '#D4E157',
  bannerTextColor: '#101828',
  bannerTargetUrl: '/',
  bannerAnimationStyle: 'STATIC',
  bannerLoopIntervalSec: 15,
  bannerStartTime: dayjs(),
  bannerEndTime: null,
  status: 'DRAFT',
};

export const HEADER_CREATE_STATUS_OPTIONS: HeaderStatus[] = ['DRAFT', 'DEACTIVE', 'SCHEDULED'];

export const HEADER_STATUS_LABEL: Record<HeaderStatus, string> = {
  DRAFT: 'Nháp',
  ACTIVE: 'Đang chạy',
  DEACTIVE: 'Ngừng',
  SCHEDULED: 'Đã lên lịch',
};

const HEADER_STATUS_TRANSITIONS: Record<HeaderStatus, HeaderStatus[]> = {
  DRAFT: ['ACTIVE', 'DEACTIVE', 'SCHEDULED'],
  ACTIVE: ['DEACTIVE'],
  DEACTIVE: ['DRAFT', 'ACTIVE'],
  SCHEDULED: ['ACTIVE', 'DEACTIVE', 'DRAFT'],
};

export const getHeaderStatusSelectOptions = (statuses: HeaderStatus[]) => statuses.map((value) => ({ value, label: HEADER_STATUS_LABEL[value] }));

export const getHeaderUpdateStatusOptions = (current: HeaderStatus): HeaderStatus[] => {
  const next = HEADER_STATUS_TRANSITIONS[current] ?? [];
  return Array.from(new Set([current, ...next]));
};

export const getHeaderDisplayStatus = (header: Pick<HeaderAdmin, 'status' | 'displayStatus'>): HeaderStatus => header.displayStatus ?? header.status;

export const canStopHeader = (header: Pick<HeaderAdmin, 'status' | 'displayStatus'>): boolean => {
  const display = getHeaderDisplayStatus(header);
  return display === 'ACTIVE' || display === 'SCHEDULED';
};

export const canActivateHeaderStatus = (header: Pick<HeaderAdmin, 'status' | 'displayStatus'>): boolean => {
  const display = getHeaderDisplayStatus(header);
  if (display === 'ACTIVE') return false;
  return header.status === 'DRAFT' || header.status === 'DEACTIVE' || header.status === 'SCHEDULED';
};

export const canEditHeaderContent = (status?: HeaderStatus) => status === 'DRAFT' || status === 'DEACTIVE';

export const buildHeaderContentPatchPayload = (values: TopBannerFormValues, original: HeaderAdmin): UpdateHeaderDto => {
  const payload: UpdateHeaderDto = {};
  const bannerName = values.bannerName.trim();
  const bannerContent = values.bannerContent.trim();
  const bannerTargetUrl = values.bannerTargetUrl.trim() || '/';

  if (bannerName !== original.bannerName) payload.bannerName = bannerName;
  if (values.bannerDisplayStyle !== original.bannerDisplayStyle) payload.bannerDisplayStyle = values.bannerDisplayStyle;
  if (bannerContent !== (original.bannerContent ?? '')) payload.bannerContent = bannerContent || undefined;
  if (values.bannerBgColor !== (original.bannerBgColor ?? '')) payload.bannerBgColor = values.bannerBgColor;
  if (values.bannerTextColor !== (original.bannerTextColor ?? '')) payload.bannerTextColor = values.bannerTextColor;
  if (bannerTargetUrl !== (original.bannerTargetUrl ?? '/')) payload.bannerTargetUrl = bannerTargetUrl;
  if (values.bannerAnimationStyle !== (original.bannerAnimationStyle ?? 'STATIC')) {
    payload.bannerAnimationStyle = values.bannerAnimationStyle;
  }
  if (values.bannerLoopIntervalSec !== (original.bannerLoopIntervalSec ?? 15)) {
    payload.bannerLoopIntervalSec = values.bannerLoopIntervalSec;
  }

  const startIso = values.bannerStartTime?.toISOString();
  if (startIso && startIso !== original.bannerStartTime) payload.bannerStartTime = startIso;

  const endIso = values.bannerEndTime?.toISOString() ?? null;
  const originalEnd = original.bannerEndTime ?? null;
  if (endIso !== originalEnd) payload.bannerEndTime = endIso;

  return payload;
};

export const buildHeaderCreatePayload = (values: TopBannerFormValues, confirmReplaceActive = false) => ({
  bannerName: values.bannerName.trim(),
  bannerDisplayStyle: values.bannerDisplayStyle,
  bannerContent: values.bannerContent.trim() || undefined,
  bannerBgColor: values.bannerBgColor.trim() || undefined,
  bannerTextColor: values.bannerTextColor.trim() || undefined,
  bannerTargetUrl: values.bannerTargetUrl.trim() || '/',
  bannerAnimationStyle: values.bannerAnimationStyle,
  bannerLoopIntervalSec: values.bannerLoopIntervalSec,
  bannerStartTime: values.bannerStartTime!.toISOString(),
  bannerEndTime: values.bannerEndTime?.toISOString() ?? null,
  status: 'DRAFT' as HeaderStatus,
  ...(confirmReplaceActive ? { confirmReplaceActive: true } : {}),
});
