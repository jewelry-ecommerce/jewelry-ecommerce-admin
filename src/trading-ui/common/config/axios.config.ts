
import { BackendHttpError,backendRequest, toUiEntityIds } from '@/apis/backend-request';
import { resolveJavaV7Route, javaV7Response, javaV7Body } from '@/apis/java/java-v7-routes';
import { isJavaBackend } from '@/common/config/app.config';
import { recordJavaCapabilityGap } from '@/apis/java/java-capability-gaps';
interface RequestOptions { timeout?:number; data?:unknown; params?: object; headers?: unknown; responseType?: string; signal?: unknown }
function pathWithQuery(path: string, method: string, options?: RequestOptions): string {
  if(isJavaBackend()) {
    const mapped = resolveJavaV7Route(path, method);
    if (mapped) return appendQuery(mapped, options);
    recordJavaCapabilityGap(method,path);
    throw new BackendHttpError('JAVA_CAPABILITY_NOT_SUPPORTED','Thao tác này hiện chưa khả dụng.',501);
  }
  return appendQuery(path, options);
}
function appendQuery(path: string, options?: RequestOptions): string {
  const query = new URLSearchParams();
  Object.entries(options?.params ?? {}).forEach(([key,value]) => { if(value !== undefined && value !== null) query.set(key,String(value)); });
  return path + (query.size ? (path.includes('?') ? '&' : '?') + query : '');
}
async function request<T>(path: string, method: string, body?: unknown, options?: RequestOptions): Promise<T> {
  try {
    const result = await backendRequest<unknown>(pathWithQuery(path, method, options), method, isJavaBackend() ? javaV7Body(path, body) : body);
    return (isJavaBackend() ? javaV7Response(path, method, toUiEntityIds(result)) : result) as T;
  } catch (error) {
    if (error instanceof BackendHttpError && error.code === 'NAVIGATION_BADGE_SCHEDULE_CONFLICT')
      return { success: false, flow: 'navigation_badge_schedule_conflict', message: error.message,
        conflictingBadges: toUiEntityIds(error.dependencies ?? []) } as T;
    throw error;
  }
}
export const axiosRequest = {
  get<T>(path:string, options?:RequestOptions):Promise<T> { return request<T>(path,'GET',undefined,options); },
  post<T>(path:string, body?:unknown, options?:RequestOptions):Promise<T> { return request<T>(path,'POST',body,options); },
  patch<T>(path:string, body?:unknown, options?:RequestOptions):Promise<T> { return request<T>(path,'PATCH',body,options); },
  put<T>(path:string, body?:unknown, options?:RequestOptions):Promise<T> { return request<T>(path,'PUT',body,options); },
  delete<T>(path:string, options?:RequestOptions):Promise<T> { return request<T>(path,'DELETE',options?.data,options); },
};
