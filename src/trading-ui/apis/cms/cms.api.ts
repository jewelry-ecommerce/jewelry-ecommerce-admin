import { axiosRequest } from '../../common/config';
import type { ResList } from '../../common/constant/api.interface';
import type { BlockType, Layout, LayoutVersion, Page, VersionBlock } from './cms.entities';

import type {
  BulkSortBlocksDto,
  CreateBlockTypeDto,
  CreateLayoutDto,
  CreateLayoutVersionDto,
  CreateNavigationDto,
  CreatePageDto,
  CreateVersionBlockDto,
  CmsPostPageRestoreOverwriteResponse,
  QueryBlockTypeDto,
  QueryPageDto,
  QuerySubscriberDto,
  ReorderNavigationsDto,
  UpdateBlockTypeDto,
  UpdateLayoutDto,
  UpdateNavigationDto,
  UpdatePageDto,
  UpdateVersionBlockDto,
} from './cms.interface';

export const postblockType = async (dto: CreateBlockTypeDto) => await axiosRequest.post(`cms/admin/block-types`, dto);

export const getBlockTypeList = async (dto: Partial<QueryBlockTypeDto>): Promise<{ list: BlockType[]; total?: number }> => await axiosRequest.get(`cms/admin/block-types`, { params: dto });

export const getBlockTypeDetail = async (id: string) => await axiosRequest.get(`cms/admin/block-types/${id}`);

export const patchBlockType = async (id: string, dto: UpdateBlockTypeDto) => await axiosRequest.patch(`cms/admin/block-types/${id}`, dto);

export const deleteBlockType = async (id: string) => await axiosRequest.delete(`cms/admin/block-types/${id}`);

export const postLayout = async (pageId: string, dto: CreateLayoutDto): Promise<Layout> => await axiosRequest.post(`cms/admin/pages/${pageId}/layouts`, dto);

export const patchLayout = async (pageId: string, layoutId: string, dto: UpdateLayoutDto): Promise<Layout> => await axiosRequest.patch(`cms/admin/pages/${pageId}/layouts/${layoutId}`, dto);

export const getLayoutDetail = async (pageId: string, layoutId: string): Promise<Layout> => await axiosRequest.get(`cms/admin/pages/${pageId}/layouts/${layoutId}`);

export const deleteLayout = async (pageId: string, layoutId: string) => await axiosRequest.delete(`cms/admin/pages/${pageId}/layouts/${layoutId}`);

export const postLayoutVersion = async (pageId: string, layoutId: string, dto: CreateLayoutVersionDto): Promise<LayoutVersion> =>
  await axiosRequest.post(`cms/admin/pages/${pageId}/layouts/${layoutId}/versions`, dto);

export const getLayoutVersionDetail = async (pageId: string, layoutId: string, versionId: string): Promise<LayoutVersion> =>
  await axiosRequest.get(`cms/admin/pages/${pageId}/layouts/${layoutId}/versions/${versionId}`);

export const postLayoutVersionClone = async (pageId: string, layoutId: string, versionId: string): Promise<LayoutVersion> =>
  await axiosRequest.post(`cms/admin/pages/${pageId}/layouts/${layoutId}/versions/${versionId}/clone`);

export const postLayoutVersionPublish = async (pageId: string, layoutId: string, versionId: string) =>
  await axiosRequest.post(`cms/admin/pages/${pageId}/layouts/${layoutId}/versions/${versionId}/publish`);

export const postNavigation = async (dto: CreateNavigationDto) => await axiosRequest.post(`cms/admin/navigations`, dto);

export const getNavigationList = async () => await axiosRequest.get(`cms/admin/navigations`);

export const patchNavigationReorder = async (dto: ReorderNavigationsDto) => await axiosRequest.patch(`cms/admin/navigations/reorder`, dto);

export const getNavigationDetail = async (id: string) => await axiosRequest.get(`cms/admin/navigations/${id}`);

export const patchNavigation = async (id: string, dto: UpdateNavigationDto) => await axiosRequest.patch(`cms/admin/navigations/${id}`, dto);

export const deleteNavigation = async (id: string) => await axiosRequest.delete(`cms/admin/navigations/${id}`);

export const postPage = async (dto: CreatePageDto): Promise<Page | CmsPostPageRestoreOverwriteResponse> => await axiosRequest.post(`cms/admin/pages`, dto);

export const getPageList = async (dto: QueryPageDto): Promise<ResList<Page>> => await axiosRequest.get(`cms/admin/pages`, { params: dto });

export const getPageDetail = async (id: string): Promise<Page> => await axiosRequest.get(`cms/admin/pages/${id}`);

export const patchPage = async (id: string, dto: UpdatePageDto) => await axiosRequest.patch(`cms/admin/pages/${id}`, dto);

export const postPageRestore = async (id: string) => await axiosRequest.post(`cms/admin/pages/${id}/restore`);

export const postPageOverwrite = async (id: string, dto: UpdatePageDto) => await axiosRequest.post(`cms/admin/pages/${id}/overwrite`, dto);

export const deletePage = async (id: string) => await axiosRequest.delete(`cms/admin/pages/${id}`);

export const getSubscriberList = async (dto: QuerySubscriberDto) => await axiosRequest.get(`cms/admin/subscribers`, { params: dto });

export const deleteSubscriber = async (id: string) => await axiosRequest.delete(`cms/admin/subscribers/${id}`);

export const postVersionBlock = async (pageId: string, layoutId: string, versionId: string, dto: CreateVersionBlockDto): Promise<VersionBlock> =>
  await axiosRequest.post(`cms/admin/pages/${pageId}/layouts/${layoutId}/versions/${versionId}/blocks`, dto);

export const getVersionBlockDetail = async (pageId: string, layoutId: string, versionId: string, blockId: string): Promise<VersionBlock> =>
  await axiosRequest.get(`cms/admin/pages/${pageId}/layouts/${layoutId}/versions/${versionId}/blocks/${blockId}`);

export const patchVersionBlockBulkSort = async (pageId: string, layoutId: string, versionId: string, dto: BulkSortBlocksDto) =>
  await axiosRequest.patch(`cms/admin/pages/${pageId}/layouts/${layoutId}/versions/${versionId}/blocks/sort`, dto);

export const patchVersionBlock = async (pageId: string, layoutId: string, versionId: string, blockId: string, dto: UpdateVersionBlockDto) =>
  await axiosRequest.patch(`cms/admin/pages/${pageId}/layouts/${layoutId}/versions/${versionId}/blocks/${blockId}`, dto);

export const deleteVersionBlock = async (pageId: string, layoutId: string, versionId: string, blockId: string) =>
  await axiosRequest.delete(`cms/admin/pages/${pageId}/layouts/${layoutId}/versions/${versionId}/blocks/${blockId}`);
