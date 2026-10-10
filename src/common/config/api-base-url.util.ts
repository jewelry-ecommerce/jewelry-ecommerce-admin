/** Join the backend origin and optional API prefix without duplicating an existing suffix. */
export const composeApiBaseUrl = (baseUrl: string, prefix = ""): string => {
  const base = baseUrl.trim().replace(/\/+$/, "");
  const normalizedPrefix = prefix.trim().replace(/^\/+|\/+$/g, "");
  if (!normalizedPrefix || base.endsWith(`/${normalizedPrefix}`)) return base;
  return `${base}/${normalizedPrefix}`;
};
