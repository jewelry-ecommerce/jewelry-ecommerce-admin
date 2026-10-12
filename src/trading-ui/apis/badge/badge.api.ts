import { backendRequest } from "@/apis/backend-request";
import { getDataSourceMode, isJavaBackend } from "@/common/config/app.config";
export * from './badge-flow.api';
export { activateBadgeFlow as patchBadgeFlowActivate, deactivateBadgeFlow as patchBadgeFlowDeactivate } from './badge-flow.api';
import type { BadgeTemplate } from "./badge.entities";
import type { CreateBadgeTemplateDto, QueryBadgeTemplateDto, UpdateBadgeStatusDto, UpdateBadgeTemplateDto } from "./badge.interface";
type WireTemplate = Omit<
  BadgeTemplate,
  "id" | "createdAt" | "updatedAt" | "displayText" | "image" | "icon" | "iconMobile" | "imageMobile" | "description"
> & {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  displayText?: string | null;
  image?: string | null;
  icon?: string | null;
  iconMobile?: string | null;
  imageMobile?: string | null;
  description?: string | null;
};
function view(input: WireTemplate): BadgeTemplate {
  return {
    ...input,
    id: String(input.id),
    createdAt: input.createdAt ? new Date(input.createdAt) : undefined,
    updatedAt: input.updatedAt ? new Date(input.updatedAt) : undefined,
    displayText: input.displayText ?? undefined,
    image: input.image ?? undefined,
    icon: input.icon ?? undefined,
    iconMobile: input.iconMobile ?? undefined,
    imageMobile: input.imageMobile ?? undefined,
    description: input.description ?? undefined,
  };
}
function assertHttp(): void {
  if (getDataSourceMode() !== "HTTP") throw new Error("Quản lý nhãn cần backend riêng ở chế độ HTTP.");
}
const PATH = "admin/badge-templates";
export async function getDetailBadgeTemplate(id: string): Promise<BadgeTemplate> {
  assertHttp();
  return view(await backendRequest<WireTemplate>(PATH + "/" + encodeURIComponent(id)));
}
export async function postBadgeTemplate(body: CreateBadgeTemplateDto): Promise<BadgeTemplate> {
  assertHttp();
  return view(await backendRequest<WireTemplate>(PATH, "POST", body));
}
export async function patchBadgeTemplate(id: string, body: UpdateBadgeTemplateDto): Promise<BadgeTemplate> {
  assertHttp();
  return view(await backendRequest<WireTemplate>(PATH + "/" + id, "PATCH", body));
}
export async function patchBadgeTemplateStatus(id: string, body: UpdateBadgeStatusDto): Promise<BadgeTemplate> {
  assertHttp();
  return view(await backendRequest<WireTemplate>(PATH + "/" + id + (isJavaBackend() ? "" : "/status"), "PATCH", body));
}
export async function deleteBadgeTemplate(id: string): Promise<{ success: boolean }> {
  assertHttp();
  return backendRequest(PATH + "/" + id, "DELETE");
}
const TEMPLATE_QUERY_POLICY = { firstPage: 1, defaultTake: 20, maximumTake: 100 } as const;
interface TemplatePage {
  total: number; list: WireTemplate[];
  pagination: { page: number; take: number; itemCount: number; hasNextPage: boolean };
}
async function templatePage(query: Partial<QueryBadgeTemplateDto>, page: number): Promise<TemplatePage> {
  const take = query.isPagination === false ? TEMPLATE_QUERY_POLICY.maximumTake :
    Math.min(Math.max(query.take ?? TEMPLATE_QUERY_POLICY.defaultTake, 1), TEMPLATE_QUERY_POLICY.maximumTake);
  const params = new URLSearchParams({ page: String(page), take: String(take) });
  for (const key of ["search", "status", "type", "badgeType", "defaultPosition"] as const)
    if (query[key]) params.set(key, String(query[key]));
  return backendRequest<TemplatePage>(PATH + "?" + params);
}
export async function getListBadgeTemplate(query: Partial<QueryBadgeTemplateDto>) {
  assertHttp();
  const firstPage = query.isPagination === false ? TEMPLATE_QUERY_POLICY.firstPage : Math.max(query.page ?? 1, 1);
  const useLocalSearch = isJavaBackend() && Boolean(query.search?.trim());
  const result = await templatePage(useLocalSearch ? { ...query, search: undefined, isPagination: false } : query, useLocalSearch ? 1 : firstPage);
  if (query.isPagination === false || useLocalSearch) {
    while (result.pagination.hasNextPage) {
      const next = await templatePage(useLocalSearch ? { ...query, search: undefined, isPagination: false } : query, result.pagination.page + 1);
      result.list.push(...next.list); result.pagination = next.pagination;
    }
  }
  if (useLocalSearch) {
    const keyword = query.search!.trim().toLocaleLowerCase();
    const filtered = result.list.filter(row => (row.name + " " + row.code).toLocaleLowerCase().includes(keyword));
    const take = query.take ?? TEMPLATE_QUERY_POLICY.defaultTake, offset = (firstPage - 1) * take;
    const list = query.isPagination === false ? filtered : filtered.slice(offset, offset + take);
    return { total: filtered.length, list: list.map(view), pagination: { page: firstPage, take, itemCount: filtered.length, hasNextPage: offset + take < filtered.length } };
  }
  return { ...result, list: result.list.map(view) };
}
