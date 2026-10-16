import { axiosRequest } from '../../common/config';
import { isJavaBackend } from '@/common/config/app.config';
import { javaHeaders, javaHeader, javaLogos, javaLogo, javaMutateHeader, javaMutateLogo, javaDeleteHeader, javaFooter, javaSaveFooter } from '@/apis/java/java-site-layout.api';
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

export const getLogoList = async (params?: QueryLogoDto): Promise<LogoListResponse> => isJavaBackend() ? javaLogos(params) : await axiosRequest.get('cms/admin/logos', { params });

export const getLogoDetail = async (id: string): Promise<LogoAdmin> => isJavaBackend() ? javaLogo(id) : await axiosRequest.get(`cms/admin/logos/${id}`);

export const postLogo = async (dto: CreateLogoDto): Promise<LogoMutationResponse> => isJavaBackend() ? javaMutateLogo('', 'POST', dto) : await axiosRequest.post('cms/admin/logos', dto);

export const patchLogo = async (id: string, dto: UpdateLogoDto): Promise<LogoMutationResponse> => isJavaBackend() ? javaMutateLogo('/' + id, 'PATCH', dto) : await axiosRequest.patch(`cms/admin/logos/${id}`, dto);

export const patchLogoStatus = async (id: string, dto: UpdateLogoStatusDto): Promise<LogoMutationResponse> => isJavaBackend() ? javaMutateLogo('/' + id + '/status', 'PATCH', dto) : await axiosRequest.patch(`cms/admin/logos/${id}/status`, dto);

export const patchLogoArchive = async (id: string): Promise<LogoArchiveResponse> => isJavaBackend() ? javaMutateLogo('/' + id + '/archive', 'PATCH') : await axiosRequest.patch(`cms/admin/logos/${id}/archive`);

export const getFooter = async (): Promise<FooterSetting> => isJavaBackend() ? javaFooter() : await axiosRequest.get('cms/admin/footer');

export const putFooter = async (dto: SaveFooterDto): Promise<FooterUpsertResponse> => isJavaBackend() ? javaSaveFooter(dto) : await axiosRequest.put('cms/admin/footer', dto);

export const getHeaderList = async (params?: QueryHeaderDto): Promise<HeaderListResponse> => isJavaBackend() ? javaHeaders(params) : await axiosRequest.get('cms/admin/headers', { params });

export const getHeaderDetail = async (id: string): Promise<HeaderAdmin> => isJavaBackend() ? javaHeader(id) : await axiosRequest.get(`cms/admin/headers/${id}`);

export const postHeader = async (dto: CreateHeaderDto): Promise<HeaderUpsertResponse> => isJavaBackend() ? javaMutateHeader('', 'POST', dto) : await axiosRequest.post('cms/admin/headers', dto);

export const patchHeader = async (id: string, dto: UpdateHeaderDto): Promise<HeaderUpsertResponse> => isJavaBackend() ? javaMutateHeader('/' + id, 'PATCH', dto) : await axiosRequest.patch(`cms/admin/headers/${id}`, dto);

export const patchHeaderStatus = async (id: string, dto: UpdateHeaderStatusDto): Promise<HeaderUpsertResponse> => isJavaBackend() ? javaMutateHeader('/' + id + '/status', 'PATCH', dto) : await axiosRequest.patch(`cms/admin/headers/${id}/status`, dto);

export const deleteHeader = async (id: string): Promise<HeaderDeleteResponse> => isJavaBackend() ? javaDeleteHeader(id) : await axiosRequest.delete(`cms/admin/headers/${id}`);
