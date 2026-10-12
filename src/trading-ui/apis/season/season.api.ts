import { axiosRequest } from '../../common/config';
import { type ResList } from '../../common/constant/api.interface';
import { type Season } from './season.entities';
import { type QueryAdminSeasonDto } from './season.interface';

export const getAdminSeasonList = async (params: Partial<QueryAdminSeasonDto>): Promise<ResList<Season>> => await axiosRequest.get('product/admin/seasons', { params });
