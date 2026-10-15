import { backendRequest } from "@/apis/backend-request";
import { getDetailBadgeTemplate } from "@/trading-ui/apis/badge/badge.api";
import { badgeFlowBody, mapBadgeFlow, numericBadgeId, type WireBadgeFlow } from "@/trading-ui/apis/badge/badge-flow.mapper";
import type { CreateBadgeFlowDto, UpdateBadgeFlowDto, BadgeFlowDetail } from "@/trading-ui/apis/badge/badge.interface";
import type { BadgeCampaignStatus, BadgeCampaignDisplayStatus } from "@/trading-ui/apis/badge/badge.enum";
interface JavaFlow extends Omit<WireBadgeFlow, "rules" | "assignmentCount"> {
  templates: { badgeTemplateId: string; priorityWeight?: number; isPinned?: boolean }[];
}
interface JavaFlowPage { list: JavaFlow[]; total: number; counts?:{all:number;active:number;inactive:number;draft:number}; pagination: { page: number; take: number; total?:number; hasNextPage: boolean } }
const POLICY = { path: "admin/badge-flow", take: 100 };
async function view(flow: JavaFlow): Promise<BadgeFlowDetail> {
  const rules = await Promise.all(flow.templates.map(async reference => {
    const template = await getDetailBadgeTemplate(reference.badgeTemplateId);
    return { id: Number(reference.badgeTemplateId), name: template.name, priorityWeight: reference.priorityWeight ?? template.defaultPriorityWeight,
      isPinned: reference.isPinned ?? false, isActive: flow.isActive, template: { ...template, id: Number(template.id) } };
  }));
  return mapBadgeFlow({ ...flow, rules, assignmentCount: undefined });
}
export async function javaBadgeFlows(query: { page?: number; take?: number; search?: string; status?: BadgeCampaignStatus; displayStatus?:BadgeCampaignDisplayStatus; isPagination?:boolean } = {}) {
  const params = new URLSearchParams({ page: String(query.page ?? 1), take: String(query.take ?? POLICY.take) });
  if (query.status) params.set("status", query.status);
  if (query.search?.trim()) params.set("search",query.search.trim());
  if (query.displayStatus) params.set("displayStatus",query.displayStatus);
  const result = await backendRequest<JavaFlowPage>(POLICY.path + "?" + params);
  if(query.isPagination===false) {
    while(result.pagination.hasNextPage) {
      params.set("page",String(Number(params.get("page"))+1));
      const next=await backendRequest<JavaFlowPage>(POLICY.path+"?"+params);
      result.list.push(...next.list);result.pagination=next.pagination;
    }
  }
  return { ...result, list: await Promise.all(result.list.map(view)) };
}
async function rawFlow(id: string): Promise<JavaFlow> {
  numericBadgeId(id);
  let page = 1;
  while (true) {
    const result = await backendRequest<JavaFlowPage>(POLICY.path + "?page=" + page + "&take=" + POLICY.take);
    const flow = result.list.find(entry => String(entry.id) === id);
    if (flow) return flow;
    if (!result.pagination.hasNextPage) throw new Error("Không tìm thấy cấu hình nhãn.");
    page += 1;
  }
}
export async function javaBadgeFlow(id: string): Promise<BadgeFlowDetail> { return view(await rawFlow(id)); }
function body(input: CreateBadgeFlowDto | UpdateBadgeFlowDto) {
  const mapped = badgeFlowBody(input);
  const dates = { ...(Object.hasOwn(input, "activeFrom") ? { activeFrom: input.activeFrom ?? null } : {}),
    ...(Object.hasOwn(input, "activeTo") ? { activeTo: input.activeTo ?? null } : {}) };
  return { ...mapped, ...dates, templates: mapped.templates?.map(reference => ({ ...reference, badgeTemplateId: String(reference.badgeTemplateId) })) };
}
export async function javaCreateBadgeFlow(input: CreateBadgeFlowDto): Promise<BadgeFlowDetail> {
  return view(await backendRequest<JavaFlow>(POLICY.path, "POST", body(input)));
}
export async function javaUpdateBadgeFlow(id: string, input: UpdateBadgeFlowDto, status?: string): Promise<BadgeFlowDetail> {
  const current = await rawFlow(id), updates = body(input);
  const defined = Object.fromEntries(Object.entries(updates).filter(([, value]) => value !== undefined));
  return view(await backendRequest<JavaFlow>(POLICY.path + "/" + numericBadgeId(id), "PUT",
    { ...current, ...defined, ...(status ? { status } : {}) }));
}
