import { axiosRequest } from '../../common/config';
import type { CreateSearchPinnedDto, SearchPinnedListResponse, SearchPinnedProduct, UpdateSearchPinnedDto } from './search-pinned.interface';

export const getSearchPinnedList = async (): Promise<SearchPinnedListResponse> => await axiosRequest.get('product/admin/search-pinned-products');

export const postSearchPinned = async (dto: CreateSearchPinnedDto): Promise<SearchPinnedProduct> => await axiosRequest.post('product/admin/search-pinned-products', dto);

export const patchSearchPinned = async (uuid: string, dto: UpdateSearchPinnedDto): Promise<SearchPinnedProduct> => await axiosRequest.patch(`product/admin/search-pinned-products/${uuid}`, dto);

export const deleteSearchPinned = async (uuid: string): Promise<{ message: string }> => await axiosRequest.delete(`product/admin/search-pinned-products/${uuid}`);
