import { backendRequest } from '@/apis/backend-request';
import { getDataSourceMode } from '@/common/config/app.config';
import { badgeFlowBody,mapBadgeFlow,numericBadgeId,type WireBadgeFlow } from './badge-flow.mapper';
import type { CreateBadgeFlowDto,UpdateBadgeFlowDto } from './badge.interface';
import type { BadgeCampaignDisplayStatus,BadgeCampaignStatus } from './badge.enum';
const FLOW_PATH='admin/badge-flow';
interface FlowQuery {page?:number;take?:number;search?:string;status?:BadgeCampaignStatus;displayStatus?:BadgeCampaignDisplayStatus}
interface FlowPage {list:WireBadgeFlow[];total:number;pagination:{page:number;take:number;itemCount:number;hasNextPage:boolean}}
function flowPath(id?:string):string {
  if(getDataSourceMode()!=='HTTP') throw new Error('Cấu hình nhãn cần backend riêng ở chế độ HTTP.');
  return id===undefined?FLOW_PATH:FLOW_PATH+'/'+numericBadgeId(id);
}
export async function getListBadgeFlow(query:FlowQuery={}) {
  const params=new URLSearchParams();
  for(const [key,value] of Object.entries(query)) if(value!==undefined&&value!=='') params.set(key,String(value));
  const result=await backendRequest<FlowPage>(flowPath()+'?'+params);
  return {...result,list:result.list.map(mapBadgeFlow)};
}
export async function getDetailBadgeFlow(id:string) {
  return mapBadgeFlow(await backendRequest<WireBadgeFlow>(flowPath(id)));
}
export async function postBadgeFlow(body:CreateBadgeFlowDto) {
  return mapBadgeFlow(await backendRequest<WireBadgeFlow>(flowPath(),'POST',badgeFlowBody(body)));
}
export async function patchBadgeFlow(id:string,body:UpdateBadgeFlowDto) {
  return mapBadgeFlow(await backendRequest<WireBadgeFlow>(flowPath(id),'PATCH',badgeFlowBody(body)));
}
export async function activateBadgeFlow(id:string) {
  return mapBadgeFlow(await backendRequest<WireBadgeFlow>(flowPath(id)+'/activate','PATCH'));
}
export async function deactivateBadgeFlow(id:string) {
  return mapBadgeFlow(await backendRequest<WireBadgeFlow>(flowPath(id)+'/deactivate','PATCH'));
}
export async function deleteBadgeFlow(id:string):Promise<{success:boolean}> {
  return backendRequest(flowPath(id),'DELETE');
}
