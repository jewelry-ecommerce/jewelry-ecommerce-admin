
import * as badgeApi from './badge.api';
import { javaBadgeFlows } from '@/apis/java/java-badge-flow.api';
import type { BadgeCampaign, BadgeRule } from './badge.entities';
import type { BadgeFlowPositionCounts,BadgeFlowDetail } from './badge.interface';
import { BadgeCampaignDisplayStatus, BadgeCampaignStatus, BadgeChannel, BadgeRuleType,BadgePosition } from './badge.enum';
interface FlowQuery {page?:number;take?:number;search?:string;status?:BadgeCampaignStatus;displayStatus?:BadgeCampaignDisplayStatus;isPagination?:boolean}
function displayStatus(flow:BadgeFlowDetail):BadgeCampaignDisplayStatus {
  if(flow.status===BadgeCampaignStatus.DRAFT)return BadgeCampaignDisplayStatus.DRAFT;
  if(flow.status===BadgeCampaignStatus.INACTIVE)return BadgeCampaignDisplayStatus.PAUSED;
  if(flow.activeTo && Date.parse(flow.activeTo)<Date.now())return BadgeCampaignDisplayStatus.ENDED;
  if(flow.activeFrom && Date.parse(flow.activeFrom)>Date.now())return BadgeCampaignDisplayStatus.SCHEDULED;
  return BadgeCampaignDisplayStatus.RUNNING;
}
async function campaign(flow:BadgeFlowDetail):Promise<BadgeCampaign>{
  const rules:BadgeRule[]=await Promise.all(flow.rules.filter(rule=>rule.template).map(async rule=>{
    const badgeTemplate=await badgeApi.getDetailBadgeTemplate(rule.template!.id);
    return {id:rule.id,campaignId:flow.id,name:rule.name,badgeTemplateId:badgeTemplate.id,badgeTemplate,
      ruleType:flow.ruleType??BadgeRuleType.ALL,ruleConfig:flow.ruleConfig??{},priorityWeight:rule.priorityWeight,
      isPinned:rule.isPinned,isActive:flow.isActive,channel:flow.channel??BadgeChannel.ALL,isSystem:!!flow.isSystemGenerated,assignments:[]};
  }));
  return {...flow,activeFrom:flow.activeFrom?new Date(flow.activeFrom):undefined,activeTo:flow.activeTo?new Date(flow.activeTo):undefined,
    createdAt:flow.createdAt?new Date(flow.createdAt):undefined,updatedAt:flow.updatedAt?new Date(flow.updatedAt):undefined,rules,displayStatus:displayStatus(flow)};
}
async function allCampaigns():Promise<BadgeCampaign[]>{
  const list:BadgeCampaign[]=[];
  for(let page=1;;page++){
    const response=await javaBadgeFlows({page});list.push(...await Promise.all(response.list.map(campaign)));
    if(!response.pagination.hasNextPage)return list;
  }
}
function positions(list:BadgeCampaign[]):BadgeFlowPositionCounts{
  return Object.fromEntries(Object.values(BadgePosition).map(position=>{
    const campaigns=list.filter(flow=>flow.rules?.some(rule=>rule.badgeTemplate?.defaultPosition===position));
    return [position,{running:campaigns.filter(flow=>flow.displayStatus===BadgeCampaignDisplayStatus.RUNNING).length,
      upcoming:campaigns.filter(flow=>flow.displayStatus!==BadgeCampaignDisplayStatus.RUNNING&&flow.displayStatus!==BadgeCampaignDisplayStatus.ENDED).length}];
  })) as BadgeFlowPositionCounts;
}
async function getListBadgeFlow(query:FlowQuery={}){
  const result=await javaBadgeFlows({page:query.page,take:query.take,status:query.status,search:query.search});
  const list=await Promise.all(result.list.map(campaign));
  if(query.displayStatus)throw new Error('Chưa hỗ trợ lọc trạng thái hiển thị. Bỏ bộ lọc để tải danh sách.');
  const complete=await allCampaigns();
  return {...result,list:query.isPagination===false?complete:list,positionCounts:positions(complete),pagination:{...result.pagination,total:result.total}};
}
export const sourceBadgeApi={...badgeApi,getListBadgeFlow};
