import { expect,test } from 'vitest';
import { BadgeCampaignStatus,BadgeRuleType } from './badge.enum';
import { badgeFlowBody,mapBadgeFlow,numericBadgeId,type WireBadgeFlow } from './badge-flow.mapper';
test('badge flow writes numeric entity IDs without changing weights or stock parameters',()=>{
  const wire=badgeFlowBody({name:'Label',ruleType:BadgeRuleType.MANUAL,
    templates:[{badgeTemplateId:'4',priorityWeight:3,isPinned:false}],
    ruleConfig:{targets:[{productId:'12',productVariantId:'25',skuCode:'RING-25'}],minStock:1,collectionIds:['7']}});
  expect(wire.templates?.[0]?.badgeTemplateId).toBe(4);
  expect(wire.ruleConfig).toEqual({targets:[{productId:12,productVariantId:25,skuCode:'RING-25'}],minStock:1,collectionIds:[7]});
  expect(()=>numericBadgeId('01a0b87b-54e6-72e6-aa37-a85fe8dd7695')).toThrow();
  expect(()=>numericBadgeId('0')).toThrow();
});
test('badge flow reads UI keys as strings without converting real counts',()=>{
  const flow:WireBadgeFlow={id:2,name:'Label',status:BadgeCampaignStatus.ACTIVE,isActive:true,assignmentCount:5,
    ruleType:BadgeRuleType.CATEGORY,ruleConfig:{categories:[{categoryId:12}],collectionIds:[7]},rules:[],activeFrom:null,activeTo:null};
  expect(mapBadgeFlow(flow)).toMatchObject({id:'2',assignmentCount:5,ruleConfig:{categories:[{categoryId:'12'}],collectionIds:['7']}});
});
