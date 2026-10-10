/// <reference types="vite/client" />

/**
 * Environment contract of this app. Declared here so `import.meta.env` is typed at every call site
 * instead of being read as a loose string bag. Keep this in sync with `.env.example`.
 */
interface ImportMetaEnv {
  /** `MOCK` resolves API calls against `src/mocks`; `HTTP` calls VITE_API_BASE_URL. */
  readonly VITE_DATA_SOURCE?: "MOCK" | "HTTP";
  /** Artificial latency in milliseconds applied to mock resolvers. */
  readonly VITE_MOCK_LATENCY_MS?: string;
  /** Root of the REST backend, used only when VITE_DATA_SOURCE is `HTTP`. */
  readonly VITE_API_BASE_URL?: string;
  /** Optional backend prefix, e.g. /api/v1. Empty when the base URL already includes it. */
  readonly VITE_API_PREFIX?: string;
  /** Dev server / preview port. */
  readonly VITE_PORT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
