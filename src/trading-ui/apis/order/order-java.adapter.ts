import { unsupportedJavaFields } from '@/apis/java/java-unsupported';
import { backendRequest } from '@/apis/backend-request';
import {JAVA_OPERATIONS} from '@/apis/java/java-operations.api';
import dayjs from 'dayjs';
import { OrderStatus,PaymentStatus,PaymentMethod,OrderSource,OrderTimeFilter,ShippingMethod } from './order.enum';
import type { IOrder,IOrderItem,IOrderListItem,IOrderListRequest,IOrderListResponse,IShippingAddress } from './order.interface';
const ORDER_BASE=JAVA_OPERATIONS.orders;
function resolveCode(id:string):string { return id; }
type WireItem=Omit<IOrderItem,'id'|'variationId'|'productId'> & {id:number;skuId:number;productId?:number;name:string;imageUrl?:string};
type WireOrder=Omit<IOrder,'id'|'items'|'status'|'paymentStatus'|'paymentMethod'|'source'|'shippingAddressSnapshot'|'statusHistory'> & {id:number;code:string;placedAt:string;items:WireItem[];status:string;paymentStatus:string;paymentMethod:string;shippingAddressSnapshot?:Partial<IShippingAddress>;timeline?:{status:string;note?:string;occurredAt:string}[]};
function status(value:string):OrderStatus{const match=Object.values(OrderStatus).find(status=>status.toUpperCase()===value.toUpperCase());if(!match)throw new Error('Trạng thái đơn Java chưa được hỗ trợ: '+value);return match;}
function payment(value:string):PaymentStatus{const match=Object.values(PaymentStatus).find(status=>status.toUpperCase()===value.toUpperCase());if(!match)throw new Error('Trạng thái thanh toán Java chưa được hỗ trợ: '+value);return match;}
export function javaOrderView(order:WireOrder):IOrder {
  const method=Object.values(PaymentMethod).find(method=>method===order.paymentMethod);
  const shippingMethod=Object.values(ShippingMethod).find(value=>value.replaceAll('_','').toUpperCase()===order.shippingMethod?.replaceAll('_','').toUpperCase());
  return {...order,id:String(order.id),orderCode:order.code,source:'source' in order && String(order.source).toUpperCase()==='ADMIN'?OrderSource.MANUAL:OrderSource.WEBSITE,status:status(order.status),paymentStatus:payment(order.paymentStatus),paymentMethod:method,
    shippingMethod,customerId:order.customerId==null?undefined:String(order.customerId),
    createdAt:order.createdAt??order.placedAt,updatedAt:order.updatedAt??order.createdAt??order.placedAt,
    shippingAddressSnapshot:order.shippingAddressSnapshot?{...order.shippingAddressSnapshot,provinceCode:order.shippingAddressSnapshot.provinceCode??null,wardCode:order.shippingAddressSnapshot.wardCode??null}:null,
    items:order.items.map(line=>({...line,id:String(line.id),variationId:String(line.skuId),productId:line.productId===undefined?undefined:String(line.productId),variationName:line.variationName??line.name,skuCode:line.skuCode??'',image:line.image??line.imageUrl??''})),
    statusHistory:order.timeline?.map((entry,index)=>({fromStatus:index?status(order.timeline![index-1].status):null,toStatus:status(entry.status),note:entry.note,createdAt:entry.occurredAt}))};
}
const view = javaOrderView;
function dateRange(request?:IOrderListRequest):{start?:string;end?:string}{
  if(request?.startDate||request?.endDate)return {start:request.startDate,end:request.endDate};
  const now=dayjs(),end=now.endOf("day");let start=now.startOf("day"),finish=end;
  switch(request?.orderTimeFilter){
    case OrderTimeFilter.TODAY:break;
    case OrderTimeFilter.YESTERDAY:start=start.subtract(1,"day");finish=end.subtract(1,"day");break;
    case OrderTimeFilter.LAST_7_DAYS:start=start.subtract(6,"day");break;
    case OrderTimeFilter.LAST_30_DAYS:start=start.subtract(29,"day");break;
    case OrderTimeFilter.LAST_90_DAYS:start=start.subtract(89,"day");break;
    case OrderTimeFilter.THIS_MONTH:start=now.startOf("month");break;
    case OrderTimeFilter.LAST_MONTH:start=now.subtract(1,"month").startOf("month");finish=start.endOf("month");break;
    default:return {};
  }
  return {start:start.toISOString(),end:finish.toISOString()};
}
function query(request?:IOrderListRequest):URLSearchParams{
  const unsupported=['warehouseId'] as const;
  const selected:string[]=unsupported.filter(key=>request?.[key]);
  if(selected.length)unsupportedJavaFields(ORDER_BASE,selected);
  if(request?.orderStatus && !(request.orderStatus.toUpperCase() in JAVA_OPERATIONS.transitions))unsupportedJavaFields(ORDER_BASE,['status:'+request.orderStatus]);
  const params=new URLSearchParams({page:String(request?.page??1),take:String(request?.take??20)});
  if(request?.search?.trim())params.set('search',request.search.trim());
  if(request?.orderStatus)params.set('status',request.orderStatus.toUpperCase());
  if(request?.paymentStatus)params.set('paymentStatus',request.paymentStatus.toUpperCase());
  for(const key of ['shippingMethod','provinceName','source','skuCode','orderBy','orderType','dateField','createdById'] as const)
    if(request?.[key])params.set(key,key==='source' && request[key]===OrderSource.MANUAL?'ADMIN':String(request[key]));
  const dates=dateRange(request);if(dates.start)params.set('fromDate',dayjs(dates.start).format('YYYY-MM-DD'));if(dates.end)params.set('toDate',dayjs(dates.end).format('YYYY-MM-DD'));
  return params;
}
export async function getJavaSourceOrderList(request?:IOrderListRequest):Promise<IOrderListResponse>{
  const response=await backendRequest<{list:WireOrder[];total:number}>(ORDER_BASE+'?'+query(request));
  const list:IOrderListItem[]=response.list.map(order=>({...view(order),trackingCode:order.trackingCode??''}));
  const params=query(request);
  for(const key of ['page','take','status','orderBy','orderType'])params.delete(key);
  const counts=await backendRequest<{total:number;byStatus:Record<string,number>}>(ORDER_BASE+'/counts?'+params);
  const summary=Object.fromEntries(Object.entries(counts.byStatus).map(([value,count])=>[status(value),count]));
  return {list,total:response.total,summary:{...summary,ALL:counts.total}};
}
export async function getJavaSourceOrderDetail(code:string):Promise<IOrder>{return view(await backendRequest<WireOrder>(ORDER_BASE+'/'+encodeURIComponent(await resolveCode(code))));}
export async function cancelJavaSourceOrder(code:string,reason?:string){const order=await backendRequest<WireOrder>(ORDER_BASE+'/'+encodeURIComponent(await resolveCode(code))+'/cancel','POST',{reason});return {data:view(order)};}
export async function changeJavaSourceOrder(code:string,target:string){
 const order=await backendRequest<WireOrder>(ORDER_BASE+'/'+encodeURIComponent(await resolveCode(code))+'/status','PATCH',{status:target});
 return {data:view(order)};
}
export async function shipJavaSourceOrder(code:string){const order=await backendRequest<WireOrder>(ORDER_BASE+'/'+encodeURIComponent(await resolveCode(code))+'/status','PATCH',{status:'SHIPPING'});return {data:view(order)};}
