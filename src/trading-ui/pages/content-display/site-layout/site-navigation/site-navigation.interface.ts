import type { Dayjs } from 'dayjs';
import type { CmsNavigation, CmsNavigationBadgeScheduleConflictResponse, CmsNavigationBadgeDesignType, CmsNavigationType, CreateCmsNavigationDto, UpdateCmsNavigationDto } from '../../../../apis';

export type NavigationViewMode = 'idle' | 'create' | 'edit';

export interface NavigationFormState {
  type: CmsNavigationType;
  label: string;
  targetId: string;
  url: string;
  image: string;
  openInNewTab: boolean;
  showOnMenuPopup: boolean;
  showOnPlp: boolean;
  badgeEnabled: boolean;
  badgeId: string;
  badgeDesignType: CmsNavigationBadgeDesignType;
  badgeDisplayText: string;
  badgeBackgroundColor: string;
  badgeTextColor: string;
  badgeImageUrl: string;
  badgeStartTime: Dayjs | null;
  badgeEndTime: Dayjs | null;
}

export interface ScreenState {
  mode: NavigationViewMode;
  selectedId?: string;
  createParent?: CmsNavigation | null;
}

export type PendingSubmit = {
  id?: string;
  payload: CreateCmsNavigationDto | UpdateCmsNavigationDto;
};

export type NavigationConflict = CmsNavigationBadgeScheduleConflictResponse | null;
