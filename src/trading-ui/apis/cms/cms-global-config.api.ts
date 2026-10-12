import { axiosRequest } from '../../common/config';
import type { DiscountLabelConfig } from './cms-global-config.interface';

export const getDiscountLabelConfig = async (): Promise<DiscountLabelConfig> => await axiosRequest.get('cms/admin/global-config/discount-label');

export const putDiscountLabelConfig = async (dto: DiscountLabelConfig): Promise<{ success: boolean; message: string; data: DiscountLabelConfig }> =>
  await axiosRequest.put('cms/admin/global-config/discount-label', dto);
