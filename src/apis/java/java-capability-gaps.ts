export interface JavaCapabilityGap { route: string; method: string; endpoint: string }
let snapshot: readonly JavaCapabilityGap[] = [];
const listeners = new Set<() => void>();
export function recordJavaCapabilityGap(method: string, endpoint: string): void {
  const route = typeof window === 'undefined' ? '' : window.location.pathname;
  if (snapshot.some(gap => gap.route === route && gap.method === method && gap.endpoint === endpoint)) return;
  snapshot = [...snapshot, { route, method, endpoint }];
  listeners.forEach(listener => listener());
}
export function subscribeJavaCapabilityGaps(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function getJavaCapabilityGaps(): readonly JavaCapabilityGap[] { return snapshot; }
