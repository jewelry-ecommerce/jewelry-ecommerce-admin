import { axiosRequest } from '../../common/config';
import type {
  CreateHeaderDto,
  CreateLogoDto,
  FooterSetting,
  FooterUpsertResponse,
  HeaderAdmin,
  HeaderDeleteResponse,
  HeaderListResponse,
  HeaderUpsertResponse,
  LogoAdmin,
  LogoArchiveResponse,
  LogoListResponse,
  LogoMutationResponse,
  QueryHeaderDto,
  QueryLogoDto,
  SaveFooterDto,
  UpdateHeaderDto,
  UpdateHeaderStatusDto,
  UpdateLogoDto,
  UpdateLogoStatusDto,
} from './cms-header-footer.interface';

export const getLogoList = async (params?: QueryLogoDto): Promise<LogoListResponse> => await axiosRequest.get('cms/admin/logos', { params });

export const getLogoDetail = async (id: string): Promise<LogoAdmin> => await axiosRequest.get(`cms/admin/logos/${id}`);

export const postLogo = async (dto: CreateLogoDto): Promise<LogoMutationResponse> => await axiosRequest.post('cms/admin/logos', dto);

export const patchLogo = async (id: string, dto: UpdateLogoDto): Promise<LogoMutationResponse> => await axiosRequest.patch(`cms/admin/logos/${id}`, dto);

export const patchLogoStatus = async (id: string, dto: UpdateLogoStatusDto): Promise<LogoMutationResponse> => await axiosRequest.patch(`cms/admin/logos/${id}/status`, dto);

export const patchLogoArchive = async (id: string): Promise<LogoArchiveResponse> => await axiosRequest.patch(`cms/admin/logos/${id}/archive`);

export const getFooter = async (): Promise<FooterSetting> => await axiosRequest.get('cms/admin/footer');

export const putFooter = async (dto: SaveFooterDto): Promise<FooterUpsertResponse> => await axiosRequest.put('cms/admin/footer', dto);

export const getHeaderList = async (params?: QueryHeaderDto): Promise<HeaderListResponse> => await axiosRequest.get('cms/admin/headers', { params });

export const getHeaderDetail = async (id: string): Promise<HeaderAdmin> => await axiosRequest.get(`cms/admin/headers/${id}`);

export const postHeader = async (dto: CreateHeaderDto): Promise<HeaderUpsertResponse> => await axiosRequest.post('cms/admin/headers', dto);

export const patchHeader = async (id: string, dto: UpdateHeaderDto): Promise<HeaderUpsertResponse> => await axiosRequest.patch(`cms/admin/headers/${id}`, dto);

export const patchHeaderStatus = async (id: string, dto: UpdateHeaderStatusDto): Promise<HeaderUpsertResponse> => await axiosRequest.patch(`cms/admin/headers/${id}/status`, dto);

export const deleteHeader = async (id: string): Promise<HeaderDeleteResponse> => await axiosRequest.delete(`cms/admin/headers/${id}`);
