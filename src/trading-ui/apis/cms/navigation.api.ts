import { axiosRequest } from '../../common/config';
import type {
  CmsNavigation,
  CmsNavigationArchiveResponse,
  CmsNavigationCacheClearResponse,
  CmsNavigationMutationSuccessResponse,
  CmsNavigationPublishResponse,
  CmsNavigationPublishStatusResponse,
  CmsNavigationTreeResponse,
  CmsNavigationUpsertResponse,
  CreateCmsNavigationDto,
  ReorderCmsNavigationsDto,
  UpdateCmsNavigationDto,
} from './navigation.interface';

const NAVIGATION_ADMIN_BASE = 'cms/admin/navigations';

export const postNavigation = async (dto: CreateCmsNavigationDto): Promise<CmsNavigationUpsertResponse> => await axiosRequest.post(NAVIGATION_ADMIN_BASE, dto);

export const getNavigationTree = async (): Promise<CmsNavigationTreeResponse> => await axiosRequest.get(NAVIGATION_ADMIN_BASE);

export const getNavigationPublishStatus = async (): Promise<CmsNavigationPublishStatusResponse> => await axiosRequest.get(`${NAVIGATION_ADMIN_BASE}/publish-status`);

export const postNavigationPublish = async (): Promise<CmsNavigationPublishResponse> => await axiosRequest.post(`${NAVIGATION_ADMIN_BASE}/publish`);

export const deleteNavigationCache = async (): Promise<CmsNavigationCacheClearResponse> => await axiosRequest.delete(`${NAVIGATION_ADMIN_BASE}/cache`);

export const patchNavigationReorder = async (dto: ReorderCmsNavigationsDto): Promise<CmsNavigationMutationSuccessResponse> => await axiosRequest.patch(`${NAVIGATION_ADMIN_BASE}/reorder`, dto);

export const getNavigationDetail = async (id: string): Promise<CmsNavigation> => await axiosRequest.get(`${NAVIGATION_ADMIN_BASE}/${id}`);

export const patchNavigation = async (id: string, dto: UpdateCmsNavigationDto): Promise<CmsNavigationUpsertResponse> => await axiosRequest.patch(`${NAVIGATION_ADMIN_BASE}/${id}`, dto);

export const patchNavigationArchive = async (id: string): Promise<CmsNavigationArchiveResponse> => await axiosRequest.patch(`${NAVIGATION_ADMIN_BASE}/${id}/archive`);
