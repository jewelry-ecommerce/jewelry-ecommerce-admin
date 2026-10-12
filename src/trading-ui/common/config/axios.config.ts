
import { BackendHttpError,backendRequest } from '@/apis/backend-request';
import { isJavaBackend } from '@/common/config/app.config';
import { recordJavaCapabilityGap } from '@/apis/java/java-capability-gaps';
interface RequestOptions { timeout?:number; data?:unknown; params?: object; headers?: unknown; responseType?: string; signal?: unknown }
function pathWithQuery(path: string, method: string, options?: RequestOptions): string {
  if(isJavaBackend()) {
    recordJavaCapabilityGap(method,path);
    throw new BackendHttpError('JAVA_CAPABILITY_NOT_SUPPORTED','Java chưa có API tương ứng cho thao tác: '+path,501);
  }
  const query = new URLSearchParams();
  Object.entries(options?.params ?? {}).forEach(([key,value]) => { if(value !== undefined && value !== null) query.set(key,String(value)); });
  return path + (query.size ? '?' + query : '');
}
export const axiosRequest = {
  get<T>(path:string, options?:RequestOptions):Promise<T> { return backendRequest<T>(pathWithQuery(path,'GET',options)); },
  post<T>(path:string, body?:unknown, options?:RequestOptions):Promise<T> { return backendRequest<T>(pathWithQuery(path,'POST',options),'POST',body); },
  patch<T>(path:string, body?:unknown, options?:RequestOptions):Promise<T> { return backendRequest<T>(pathWithQuery(path,'PATCH',options),'PATCH',body); },
  put<T>(path:string, body?:unknown, options?:RequestOptions):Promise<T> { return backendRequest<T>(pathWithQuery(path,'PUT',options),'PUT',body); },
  delete<T>(path:string, options?:RequestOptions):Promise<T> { return backendRequest<T>(pathWithQuery(path,'DELETE',options),'DELETE'); },
};
