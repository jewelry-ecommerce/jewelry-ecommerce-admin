/** Every key written by this app is namespaced, so clearing admin state never touches other apps. */
const STORAGE_PREFIX = "jwl-admin";

const buildKey = (key: string): string => `${STORAGE_PREFIX}:${key}`;

/**
 * `localStorage` is absent during SSR/tests and *throws on access* in some private-browsing modes,
 * so availability is probed rather than assumed.
 */
const getStorage = (): Storage | null => {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    // Private mode denies access to the property itself: treat storage as unavailable.
    return null;
  }
};

/** Reads and parses a namespaced value. Returns `fallback` on any miss, read error, or bad JSON. */
export const getItem = <TValue>(key: string, fallback: TValue): TValue => {
  const storage = getStorage();
  if (!storage) return fallback;

  try {
    const raw = storage.getItem(buildKey(key));
    return raw === null ? fallback : (JSON.parse(raw) as TValue);
  } catch {
    // Corrupted JSON from an older app version: the fallback keeps the screen usable.
    return fallback;
  }
};

/** Persists a value as JSON. Persistence is best-effort: a full quota must not break a flow. */
export const setItem = <TValue>(key: string, value: TValue): void => {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(buildKey(key), JSON.stringify(value));
  } catch {
    // Quota exceeded or storage disabled — the caller treats persistence as best-effort.
  }
};

export const removeItem = (key: string): void => {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.removeItem(buildKey(key));
  } catch {
    // Nothing actionable: the value is already unreachable for readers.
  }
};
