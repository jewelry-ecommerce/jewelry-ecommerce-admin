import { axiosRequest } from '../../common/config';
import { isJavaBackend } from '@/common/config/app.config';
import { javaSeasons } from '@/apis/java/java-brand-season.api';
import { type ResList } from '../../common/constant/api.interface';
import { type Season } from './season.entities';
import { type QueryAdminSeasonDto } from './season.interface';

export const getAdminSeasonList = async (params: Partial<QueryAdminSeasonDto>): Promise<ResList<Season>> => isJavaBackend() ? javaSeasons(params) : await axiosRequest.get('product/admin/seasons', { params });
