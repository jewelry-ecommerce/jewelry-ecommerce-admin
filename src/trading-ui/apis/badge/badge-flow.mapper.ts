import type { BadgeFlowDetail,BadgeFlowRuleView,CreateBadgeFlowDto,UpdateBadgeFlowDto } from './badge.interface';
export interface WireFlowRule extends Omit<BadgeFlowRuleView,'id'|'template'> {
  id:number;template:(Omit<NonNullable<BadgeFlowRuleView['template']>,'id'> & {id:number})|null;
}
export interface WireBadgeFlow extends Omit<BadgeFlowDetail,'id'|'rules'|'description'|'activeFrom'|'activeTo'> {
  id:number;rules:WireFlowRule[];description?:string|null;activeFrom?:string|null;activeTo?:string|null;
}
export function numericBadgeId(value:string|number):number {
  if(!/^[1-9][0-9]*$/.test(String(value))) throw new Error('ID cấu hình nhãn phải là số nguyên dương.');
  const parsed=Number(value);
  if(!Number.isSafeInteger(parsed)) throw new Error('ID cấu hình nhãn vượt giới hạn số an toàn.');
  return parsed;
}
function scopeValue(value:unknown,toWire:boolean,key=''):unknown {
  if(Array.isArray(value)) return value.map(entry=>scopeValue(entry,toWire,key.endsWith('Ids')?'id':''));
  if(value!==null&&typeof value==='object')
    return Object.fromEntries(Object.entries(value).map(([name,entry])=>[name,scopeValue(entry,toWire,name)]));
  if(value!==null&&value!==undefined&&(key==='id'||key.endsWith('Id')))
    return toWire?numericBadgeId(String(value)):String(value);
  return value;
}
function scopeConfig(config:Record<string,unknown>,toWire:boolean):Record<string,unknown> {
  return Object.fromEntries(Object.entries(config).map(([key,value])=>[key,scopeValue(value,toWire,key)]));
}
export function mapBadgeFlow(input:WireBadgeFlow):BadgeFlowDetail {
  return {...input,id:String(input.id),description:input.description??undefined,
    activeFrom:input.activeFrom??undefined,activeTo:input.activeTo??undefined,
    ruleConfig:scopeConfig(input.ruleConfig??{},false),
    rules:input.rules.map(rule=>({...rule,id:String(rule.id),template:rule.template?{...rule.template,id:String(rule.template.id)}:null}))};
}
export function badgeFlowBody(input:CreateBadgeFlowDto|UpdateBadgeFlowDto) {
  return {...input,ruleConfig:input.ruleConfig?scopeConfig(input.ruleConfig,true):undefined,
    templates:input.templates?.map(template=>({...template,badgeTemplateId:numericBadgeId(template.badgeTemplateId)}))};
}
