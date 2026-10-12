
import { backendRequest } from '@/apis/backend-request';
import type { BulkUpdateCustomerRequestStatusRequest, CustomerRequestListItem, CustomerRequestListQuery, CustomerRequestListResponse, UpdateCustomerRequestStatusRequest } from './customer-request.interface';
const BASE_PATH = 'admin/customer-request';
interface JavaRequestPage { list: JavaRequestItem[]; total:number }
type JavaRequestItem = Omit<CustomerRequestListItem, 'id'|'productId'|'productVariantId'|'orderId'> & {
  id: number | string; productId?: number | string | null; productVariantId?: number | string | null; orderId?: number | string | null;
};
function requestView(entry: JavaRequestItem): CustomerRequestListItem {
  return { ...entry, id: String(entry.id), productId: entry.productId == null ? undefined : String(entry.productId),
    productVariantId: entry.productVariantId == null ? undefined : String(entry.productVariantId),
    orderId: entry.orderId == null ? undefined : String(entry.orderId) };
}
export async function getCustomerRequestList(segment: 'back-in-stock'|'order-support'|'newsletter',query:CustomerRequestListQuery):Promise<CustomerRequestListResponse> {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key,value])=>{if(value!==undefined&&value!=='')params.set(key,String(value));});
  const result = await backendRequest<JavaRequestPage>(BASE_PATH+'/'+segment+'?'+params);
  return { items:result.list.map(requestView), total:result.total,page:query.page,take:query.take };
}
export async function getCustomerRequestDetail(id:string):Promise<CustomerRequestListItem>{
  return requestView(await backendRequest<JavaRequestItem>(BASE_PATH+'/'+encodeURIComponent(id)));
}
export async function updateCustomerRequestStatus(id:string,body:UpdateCustomerRequestStatusRequest):Promise<void>{await backendRequest(BASE_PATH+'/'+encodeURIComponent(id)+'/status','PATCH',body);}
export async function bulkUpdateCustomerRequestStatus(body:BulkUpdateCustomerRequestStatusRequest):Promise<void>{await backendRequest(BASE_PATH+'/status/bulk','PATCH',body);}
