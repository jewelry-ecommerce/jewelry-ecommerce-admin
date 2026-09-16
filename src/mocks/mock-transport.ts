import { getMockLatencyMs } from "@/common/config/app.config";
import type { Paginated } from "@/apis/product/product.interface";

/** Error shape mirroring the stable `{ code, message }` contract the future backend will return. */
export class MockApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.name = "MockApiError";
    this.code = code;
    this.status = status;
  }
}

/** Simulates network latency so loading, skeleton and disabled states are genuinely exercised. */
export const withLatency = async <T>(produce: () => T): Promise<T> => {
  const latency = getMockLatencyMs();
  if (latency > 0) {
    await new Promise((resolve) => setTimeout(resolve, latency));
  }
  return produce();
};

export const paginate = <T>(rows: T[], page = 1, take = 12): Paginated<T> => {
  const safeTake = Math.max(1, Math.trunc(take));
  const safePage = Math.max(1, Math.trunc(page));
  const start = (safePage - 1) * safeTake;

  return {
    list: rows.slice(start, start + safeTake),
    total: rows.length,
    page: safePage,
    take: safeTake,
  };
};

export const normalizeSearch = (value: string | undefined | null): string => (value ?? "").trim().toLowerCase();

export const matchesSearch = (haystacks: (string | null | undefined)[], search: string): boolean => {
  if (!search) return true;
  return haystacks.some((value) => (value ?? "").toLowerCase().includes(search));
};

/** Stable pseudo-random generator so mock dashboards do not flicker between renders. */
export const seededSequence = (seed: string, length: number, min: number, max: number): number[] => {
  let state = Array.from(seed).reduce((accumulator, character) => (accumulator * 31 + character.charCodeAt(0)) % 233280, 7);
  return Array.from({ length }, () => {
    state = (state * 9301 + 49297) % 233280;
    const ratio = state / 233280;
    return Math.round(min + ratio * (max - min));
  });
};

export const cloneDeep = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
