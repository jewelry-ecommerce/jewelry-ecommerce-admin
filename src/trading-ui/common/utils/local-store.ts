export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

export const setAccessToken = (token: string): void => {
  localStorage.setItem('accessToken', token);
};

export const removeAccessToken = (): void => {
  localStorage.removeItem('accessToken');
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

export const setRefreshToken = (token: string): void => {
  localStorage.setItem('refreshToken', token);
};

export const removeRefreshToken = (): void => {
  localStorage.removeItem('refreshToken');
};

export const getTokenId = (): string | null => {
  return localStorage.getItem('tokenId');
};

export const setTokenId = (tokenId: string): void => {
  localStorage.setItem('tokenId', tokenId);
};

export const removeTokenId = (): void => {
  localStorage.removeItem('tokenId');
};

export const setAuthTokens = (tokens: { accessToken: string; refreshToken: string; tokenId: string }): void => {
  localStorage.setItem('accessToken', tokens.accessToken);
  localStorage.setItem('refreshToken', tokens.refreshToken);
  localStorage.setItem('tokenId', tokens.tokenId);
};

export const removeAuthTokens = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenId');
  localStorage.removeItem('warehouse');
};

export const setRememberMe = (rememberMe: boolean): void => {
  localStorage.setItem('rememberMe', rememberMe.toString());
};

export const removeRememberMe = (): void => {
  localStorage.removeItem('rememberMe');
};

export const getRememberMe = (): boolean => {
  return localStorage.getItem('rememberMe') === 'true';
};

const PERMISSION_BUNDLE_KEY = 'permissionBundle';

export const setPermissionBundle = (bundle: unknown): void => {
  if (bundle === undefined) return;
  localStorage.setItem(PERMISSION_BUNDLE_KEY, JSON.stringify(bundle));
};

export const getPermissionBundle = <T = unknown>(): T | null => {
  const raw = localStorage.getItem(PERMISSION_BUNDLE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const removePermissionBundle = (): void => {
  localStorage.removeItem(PERMISSION_BUNDLE_KEY);
};

export const getWarehouse = <T = unknown>(): T | null => {
  const raw = localStorage.getItem('warehouse');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const setWarehouse = (warehouse: unknown): void => {
  if (!warehouse) {
    localStorage.removeItem('warehouse');
    return;
  }
  localStorage.setItem('warehouse', JSON.stringify(warehouse));
};

export const removeWarehouse = (): void => {
  localStorage.removeItem('warehouse');
};
