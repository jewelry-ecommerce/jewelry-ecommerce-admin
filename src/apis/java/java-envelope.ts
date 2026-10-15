
interface JavaEnvelope<T> { status: number; data: T; message?: string }
export function javaEnvelopeFailure(payload:unknown):{status:number;code:string;message:string}|undefined {
  if(!payload || typeof payload!=='object' || !('status' in payload) || typeof payload.status!=='number' || payload.status<400 || payload.status>599) return;
  const message='message' in payload && typeof payload.message==='string'?payload.message:'Yêu cầu không thành công.';
  const first='errors' in payload && Array.isArray(payload.errors)?payload.errors[0]:undefined;
  const code:unknown=first && typeof first==='object' && 'code' in first?first.code:undefined;
  return {status:payload.status,code:typeof code==='string'?code:'JAVA_BUSINESS_ERROR',message};
}
export function normalizeJavaPage(payload: unknown): unknown {
  if (!payload || typeof payload !== 'object') return payload;
  if ('items' in payload && Array.isArray(payload.items) && 'page' in payload && 'take' in payload && 'total' in payload) {
    const page = Number(payload.page), take = Number(payload.take), total = Number(payload.total);
    const totalPage = Math.ceil(total / Math.max(take, 1));
    return { ...payload, list: payload.items, pagination: { page, take, currentPage: page, itemCount: total, total,
      totalPage, pageCount: totalPage, hasNextPage: page < totalPage, hasPreviousPage: page > 1, nextPage: page < totalPage, previousPage: page > 1 } };
  }
  if (!('content' in payload) || !Array.isArray(payload.content)) return payload;
  if (!('page' in payload) || !('size' in payload) || !('totalElements' in payload) || !('totalPages' in payload)) return payload;
  const page = Number(payload.page), take = Number(payload.size), total = Number(payload.totalElements), totalPage = Number(payload.totalPages);
  return { list: payload.content, total, pagination: { page, take, currentPage: page, itemCount: total, pageCount: totalPage,
    total, totalPage, hasNextPage: page < totalPage, hasPreviousPage: page > 1, nextPage: page < totalPage, previousPage: page > 1 } };
}
export function unwrapJava<T>(payload: T | JavaEnvelope<T>): T {
  if (payload && typeof payload === 'object' && 'status' in payload && 'data' in payload
    && typeof payload.status === 'number' && payload.status >= 200 && payload.status < 300) return normalizeJavaPage(payload.data) as T;
  return payload as T;
}
