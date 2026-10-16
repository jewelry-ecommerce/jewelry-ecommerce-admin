export type LogoStatus = 'DRAFT' | 'ACTIVE' | 'DEACTIVE' | 'SCHEDULED';

export type LogoType = 'HEADER' | 'FOOTER' | 'AUTH' | 'FAVICON';

export type LogoAdmin = {
  id: string;
  tenantCode?: string;
  name: string;
  type: LogoType;
  status: LogoStatus;
  logoUrl: string;
  logoTheme?: string;
  logoTargetUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type QueryLogoDto = {
  page?: number;
  take?: number;
  search?: string;
  status?: LogoStatus;
  type?: LogoType;
  isPagination?: boolean;
};

export type CreateLogoDto = {
  name: string;
  type?: LogoType;
  status?: LogoStatus;
  logoUrl: string;
  logoTheme?: string;
  logoTargetUrl?: string;
};

export type UpdateLogoDto = Partial<Omit<CreateLogoDto, 'status'>>;

export type UpdateLogoStatusDto = {
  status: LogoStatus;
};

export type LogoListResponse = {
  list: LogoAdmin[];
  total?: number;
};

export type LogoMutationResponse = {
  success?: boolean;
  message?: string;
  id?: string;
  data?: LogoAdmin;
};

export type LogoArchiveResponse = {
  success: boolean;
  id: string;
};

export type FooterSocialPlatform = 'Facebook' | 'Instagram' | 'TikTok' | 'YouTube' | 'Twitter' | 'LinkedIn' | 'Zalo' | 'Other';

export type FooterSocialLinkInput = {
  id?: string;
  platform: FooterSocialPlatform;
  displayName: string;
  url: string;
  image?: string;
  orderIndex: number;
};

export type FooterMenuItemInput = {
  id?: string;
  label: string;
  url: string;
  orderIndex: number;
};

export type FooterMenuColumnInput = {
  id?: string;
  title: string;
  orderIndex: number;
  items: FooterMenuItemInput[];
};

export type SaveFooterDto = {
  copyrightText?: string;
  footerLogoUrl?: string;
  certificationImageUrl?: string;
  certificationUrl?: string;
  socialLinks: FooterSocialLinkInput[];
  menuColumns: FooterMenuColumnInput[];
};

export type FooterSocialLink = FooterSocialLinkInput & { id: string };
export type FooterMenuItem = FooterMenuItemInput & { id: string };
export type FooterMenuColumn = {
  id: string;
  title: string;
  orderIndex: number;
  items: FooterMenuItem[];
};

export type FooterSetting = {
  id: string;
  tenantCode?: string;
  copyrightText?: string;
  footerLogoUrl?: string;
  certificationImageUrl?: string;
  certificationUrl?: string;
  socialLinks?: FooterSocialLink[];
  menuColumns?: FooterMenuColumn[];
};

export type FooterUpsertResponse = {
  success?: boolean;
  message?: string;
  created?: boolean;
  data?: FooterSetting;
};

export type HeaderStatus = LogoStatus;

export type HeaderBannerDisplayStyle = 'TEXT' | 'MEDIA';

export type HeaderAdmin = {
  id: string;
  tenantCode?: string;
  status: HeaderStatus;
  /** Trạng thái hiển thị — BE tính SCHEDULED đã tới startTime thành ACTIVE. */
  displayStatus?: HeaderStatus;
  bannerName: string;
  bannerDisplayStyle: HeaderBannerDisplayStyle;
  bannerContent?: string;
  bannerBgColor?: string;
  bannerTextColor?: string;
  bannerTargetUrl?: string;
  bannerAnimationStyle?: string;
  bannerLoopIntervalSec?: number;
  bannerStartTime: string;
  bannerEndTime?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type QueryHeaderDto = {
  page?: number;
  take?: number;
  search?: string;
  status?: HeaderStatus;
  orderBy?: string;
  orderType?: 'ASC' | 'DESC';
  isPagination?: boolean;
};

export type HeaderBannerFieldsDto = {
  bannerName: string;
  bannerDisplayStyle: HeaderBannerDisplayStyle;
  bannerContent?: string;
  bannerBgColor?: string;
  bannerTextColor?: string;
  bannerTargetUrl?: string;
  bannerAnimationStyle?: string;
  bannerLoopIntervalSec?: number;
  bannerStartTime: string;
  bannerEndTime?: string | null;
};

export type CreateHeaderDto = HeaderBannerFieldsDto & {
  status?: HeaderStatus;
  confirmReplaceActive?: boolean;
};

export type UpdateHeaderDto = Partial<HeaderBannerFieldsDto>;

export type UpdateHeaderStatusDto = {
  status: HeaderStatus;
  confirmReplaceActive?: boolean;
};

export type HeaderListResponse = {
  list: HeaderAdmin[];
  total?: number;
};

export type HeaderMutationResponse = {
  success?: boolean;
  message?: string;
  id?: string;
  data?: HeaderAdmin;
};

export type HeaderDeleteResponse = {
  success: boolean;
  id: string;
  message?: string;
};

export type HeaderScheduleConflictItem = {
  id: string;
  bannerName: string;
  status: HeaderStatus;
  bannerStartTime: string;
  bannerEndTime: string | null;
};

export type HeaderScheduleConflictResponse = {
  success: false;
  flow: 'header_schedule_conflict';
  message: string;
  conflictingHeaders: HeaderScheduleConflictItem[];
};

export type HeaderUpsertResponse = HeaderMutationResponse | HeaderScheduleConflictResponse;

export const isHeaderScheduleConflictResponse = (value: unknown): value is HeaderScheduleConflictResponse => {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return record.success === false && record.flow === 'header_schedule_conflict';
};
