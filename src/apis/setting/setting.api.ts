import type { SettingGroupKey, SettingGroupMap } from "@/apis/setting/setting.interface";
import { apiRequest } from "@/apis/transport";
import { SETTINGS } from "@/mocks/data/setting.data";
import { cloneDeep, withLatency } from "@/mocks/mock-transport";

/** GET admin/settings/{group} */
export const getSettingGroup = <TKey extends SettingGroupKey>(group: TKey): Promise<SettingGroupMap[TKey]> =>
  apiRequest({
    method: "GET",
    path: `admin/settings/${group}`,
    mock: () => withLatency(() => cloneDeep(SETTINGS[group])),
  });

/** PUT admin/settings/{group} */
export const updateSettingGroup = <TKey extends SettingGroupKey>(
  group: TKey,
  payload: SettingGroupMap[TKey],
): Promise<SettingGroupMap[TKey]> =>
  apiRequest({
    method: "PUT",
    path: `admin/settings/${group}`,
    body: payload,
    mock: () =>
      withLatency(() => {
        SETTINGS[group] = payload;
        return cloneDeep(SETTINGS[group]);
      }),
  });
