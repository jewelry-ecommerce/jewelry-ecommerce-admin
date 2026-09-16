export type DataSourceMode = "MOCK" | "HTTP";

const readEnv = (value: string | undefined, fallback: string): string => {
  const normalized = (value ?? "").trim();
  return normalized || fallback;
};

/** Application-wide configuration. Every integration value comes from the environment. */
export const commonConfig = {
  APP_NAME: "jewelry-commerce-admin",
  BRAND_NAME: readEnv(import.meta.env.VITE_BRAND_NAME, "Jewelry Ecommerce"),
  DOCUMENT_TITLE: "Jewelry Ecommerce Admin",
  CURRENCY: readEnv(import.meta.env.VITE_CURRENCY, "VND"),
  LOCALE: readEnv(import.meta.env.VITE_LOCALE, "en-US"),
} as const;

/** Which transport `apiRequest` resolves to. Mock is the default for this phase. */
export const getDataSourceMode = (): DataSourceMode =>
  readEnv(import.meta.env.VITE_DATA_SOURCE, "MOCK").toUpperCase() === "HTTP" ? "HTTP" : "MOCK";

export const getMockLatencyMs = (): number => {
  const parsed = Number(import.meta.env.VITE_MOCK_LATENCY_MS);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 180;
};

/** Root of the future REST backend. Only read when the data source is `HTTP`. */
export const getApiBaseUrl = (): string => readEnv(import.meta.env.VITE_API_BASE_URL, "http://localhost:8080/api").replace(/\/$/, "");
