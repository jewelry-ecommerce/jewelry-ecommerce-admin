import type { LogoStatus, LogoType } from '../../../../apis';

export type LogoSlotFormValues = {
  type: LogoType;
  logoId?: string;
  name: string;
  logoUrl: string;
};

export type LogoFormValues = {
  name: string;
  type: LogoType;
  status: LogoStatus;
  logoUrl: string;
  logoTargetUrl: string;
};
