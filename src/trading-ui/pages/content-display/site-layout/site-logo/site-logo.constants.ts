import type { LogoAdmin, LogoStatus, LogoType, UpdateLogoDto } from '../../../../apis';
import type { LogoFormValues, LogoSlotFormValues } from './site-logo.interface';

export const LOGO_SLOT_TYPES: LogoType[] = ['HEADER', 'FOOTER', 'AUTH', 'FAVICON'];

export const LOGO_SLOT_META: Record<
  LogoType,
  {
    tag: string;
    title: string;
    subtitle: string;
    tagBackground: string;
    tagColor: string;
    previewBackground?: string;
    showNameField: boolean;
  }
> = {
  HEADER: {
    tag: 'Đầu trang',
    title: 'Logo Header',
    subtitle: 'Logo hiển thị trên đầu trang',
    tagBackground: '#DBEAFE',
    tagColor: '#1D4ED8',
    showNameField: true,
  },
  FOOTER: {
    tag: 'Chân trang',
    title: 'Logo Chân trang (Âm bản)',
    subtitle: 'Logo hiển thị trên nền tối ở chân trang',
    tagBackground: '#E5E7EB',
    tagColor: '#111827',
    previewBackground: '#111827',
    showNameField: true,
  },
  AUTH: {
    tag: 'Trang đăng nhập',
    title: 'Logo Đăng ký/Đăng nhập',
    subtitle: 'Logo trên trang xác thực',
    tagBackground: '#F3E8FF',
    tagColor: '#7C3AED',
    showNameField: true,
  },
  FAVICON: {
    tag: 'Biểu tượng tab trình duyệt',
    title: 'Biểu tượng Favicon Tab',
    subtitle: 'Icon hiển thị trên tab trình duyệt',
    tagBackground: '#FFEDD5',
    tagColor: '#C2410C',
    showNameField: false,
  },
};

export const LOGO_NAME_MAX_LENGTH = 50;

export const resolveLogoByType = (logos: LogoAdmin[], type: LogoType): LogoAdmin | undefined => {
  const matches = logos.filter((logo) => logo.type === type);
  return matches.find((logo) => logo.status === 'ACTIVE') ?? matches[0];
};

export const buildLogoSlotForms = (logos: LogoAdmin[]): LogoSlotFormValues[] =>
  LOGO_SLOT_TYPES.map((type) => {
    const logo = resolveLogoByType(logos, type);
    return {
      type,
      logoId: logo?.id,
      name: logo?.name ?? '',
      logoUrl: logo?.logoUrl ?? '',
    };
  });

export const LOGO_TYPE_OPTIONS: { value: LogoType; label: string }[] = [
  { value: 'HEADER', label: 'Đầu trang' },
  { value: 'FOOTER', label: 'Chân trang' },
  { value: 'AUTH', label: 'Form đăng nhập / đăng ký' },
  { value: 'FAVICON', label: 'Biểu tượng tab trình duyệt' },
];

export const LOGO_TYPE_LABEL: Record<LogoType, string> = {
  HEADER: 'Đầu trang',
  FOOTER: 'Chân trang',
  AUTH: 'Trang đăng nhập',
  FAVICON: 'Biểu tượng tab',
};

export const DEFAULT_LOGO_FORM: LogoFormValues = {
  name: '',
  type: 'HEADER',
  status: 'DRAFT',
  logoUrl: '',
  logoTargetUrl: '/',
};

/** Tạo mới: không được ACTIVE trực tiếp (API). */
export const LOGO_CREATE_STATUS_OPTIONS: LogoStatus[] = ['DRAFT', 'DEACTIVE', 'SCHEDULED'];

const LOGO_STATUS_TRANSITIONS: Record<LogoStatus, LogoStatus[]> = {
  DRAFT: ['ACTIVE', 'DEACTIVE', 'SCHEDULED'],
  ACTIVE: ['DEACTIVE'],
  DEACTIVE: ['DRAFT', 'ACTIVE'],
  SCHEDULED: ['ACTIVE', 'DEACTIVE', 'DRAFT'],
};

export const getLogoStatusSelectOptions = (statuses: LogoStatus[]) => statuses.map((value) => ({ value, label: LOGO_STATUS_LABEL[value] }));

export const getLogoUpdateStatusOptions = (current: LogoStatus): LogoStatus[] => {
  const next = LOGO_STATUS_TRANSITIONS[current] ?? [];
  return Array.from(new Set([current, ...next]));
};

export const canEditLogoContent = (status?: LogoStatus) => status === 'DRAFT' || status === 'DEACTIVE';

export const LOGO_ARCHIVABLE_STATUSES: LogoStatus[] = ['DRAFT'];

export const canArchiveLogo = (status?: LogoStatus) => Boolean(status && LOGO_ARCHIVABLE_STATUSES.includes(status));

/** PATCH nội dung: chỉ field đổi (không gồm status — dùng patchLogoStatus). */
export const buildLogoContentPatchPayload = (values: LogoFormValues, original: LogoAdmin): UpdateLogoDto => {
  const payload: UpdateLogoDto = {};
  const name = values.name.trim();
  const logoUrl = values.logoUrl.trim();
  const logoTargetUrl = values.logoTargetUrl.trim() || '/';

  if (name !== original.name) payload.name = name;
  if (values.type !== original.type) payload.type = values.type;
  if (logoUrl !== original.logoUrl) payload.logoUrl = logoUrl;
  if (logoTargetUrl !== (original.logoTargetUrl ?? '/')) payload.logoTargetUrl = logoTargetUrl;

  return payload;
};

export const LOGO_STATUS_LABEL: Record<LogoStatus, string> = {
  DRAFT: 'Nháp',
  ACTIVE: 'Đang chạy',
  DEACTIVE: 'Ngừng',
  SCHEDULED: 'Hẹn giờ',
};
