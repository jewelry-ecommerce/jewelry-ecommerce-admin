export interface IProvince {
  id: string;
  code: number;
  name: string;
  codename: string;
  divisionType: string;
  phoneCode: number;
  priority: number;
}

export interface IProvinceListResponse {
  list: IProvince[];
  total: number;
}

export interface IWard {
  id?: string;
  code: number;
  name: string;

  codename?: string;
  divisionType?: string;
  shortCodename?: string;
  provinceCode?: number;
}

export interface IWardListResponse {
  list: IWard[];
  total?: number;
}
