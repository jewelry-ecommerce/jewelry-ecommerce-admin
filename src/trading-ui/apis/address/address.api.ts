import { axiosRequest } from '../../common/config/axios.config';
import { type IProvinceListResponse, type IWardListResponse } from './address.interface';

export const getProvinceList = async (): Promise<IProvinceListResponse> => await axiosRequest.get('iam/location/provinces');

/** Danh sách phường/xã theo mã tỉnh/thành: /iam/location/provinces/{code}/wards */
export const getWardsByProvinceCode = async (provinceCode: number): Promise<IWardListResponse> => await axiosRequest.get(`iam/location/provinces/${provinceCode}/wards`);

/** Backward-compatible alias (deprecated) */
export const getWardList = getWardsByProvinceCode;
