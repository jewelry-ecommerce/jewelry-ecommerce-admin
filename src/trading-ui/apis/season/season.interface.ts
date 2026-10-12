import { type PageOptionsDto } from '../../common/constant/api.interface';
import { type Season } from './season.entities';

export interface QueryAdminSeasonDto extends PageOptionsDto<Season> {
  isActive?: boolean;
}
