import type { Dayjs } from 'dayjs';
import type { HeaderBannerDisplayStyle, HeaderStatus } from '../../../../apis';
import type { SiteTopBannerPageViews } from './site-top-banner.enum';

export type SiteTopBannerGlobalState = {
  view: SiteTopBannerPageViews;
  selectedHeaderId?: string;
};

export type TopBannerFormValues = {
  bannerName: string;
  bannerDisplayStyle: HeaderBannerDisplayStyle;
  bannerContent: string;
  bannerBgColor: string;
  bannerTextColor: string;
  bannerTargetUrl: string;
  bannerAnimationStyle: string;
  bannerLoopIntervalSec: number;
  bannerStartTime: Dayjs | null;
  bannerEndTime: Dayjs | null;
  status: HeaderStatus;
};
