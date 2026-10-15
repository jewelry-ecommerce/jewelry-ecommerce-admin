import { beforeEach, expect, test, vi } from "vitest";
import { BadgeCampaignDisplayStatus } from "@/trading-ui/apis/badge/badge.enum";
const mocks = vi.hoisted(() => ({ request: vi.fn(), template: vi.fn() }));
vi.mock("../backend-request", () => ({ backendRequest: mocks.request }));
vi.mock("@/trading-ui/apis/badge/badge.api", () => ({ getDetailBadgeTemplate: mocks.template }));
import { javaUpdateBadgeFlow,javaBadgeFlows } from "./java-badge-flow.api";
const existing = { id: "5", name: "Nhãn campaign", status: "ACTIVE", isActive: true, ruleType: "CATEGORY",
  ruleConfig: { categoryIds: [12] }, channel: "WEB", activeFrom: "2026-10-01T00:00:00Z", activeTo: "2026-11-01T00:00:00Z",
  templates: [{ badgeTemplateId: "4", priorityWeight: 50, isPinned: true }] };
beforeEach(() => {
  vi.clearAllMocks();
  mocks.template.mockResolvedValue({ id: "4", name: "Nhãn", type: "TEXT", badgeType: "CAMPAIGN", defaultPriorityWeight: 10 });
  mocks.request.mockImplementation(async (_path: string, method?: string, body?: unknown) =>
    method === "PUT" ? { ...existing, ...body as object } : { list: [existing], pagination: { hasNextPage: false } });
});
test("search and display status are sent to the new backend",async()=>{
 await javaBadgeFlows({search:'campaign',displayStatus:BadgeCampaignDisplayStatus.RUNNING});
 expect(mocks.request).toHaveBeenCalledWith('admin/badge-flow?page=1&take=100&search=campaign&displayStatus=RUNNING');
});
test("status update PUT preserves required fields and references", async () => {
  await javaUpdateBadgeFlow("5", {}, "INACTIVE");
  expect(mocks.request).toHaveBeenLastCalledWith("admin/badge-flow/5", "PUT",
    expect.objectContaining({ name: existing.name, status: "INACTIVE", ruleConfig: { categoryIds: [12] }, templates: existing.templates }));
});
test("numeric request targets but string template references match Java", async () => {
  await javaUpdateBadgeFlow("5", { ruleConfig: { skuIds: ["21"] }, templates: [{ badgeTemplateId: "4" }] });
  expect(mocks.request).toHaveBeenLastCalledWith("admin/badge-flow/5", "PUT",
    expect.objectContaining({ ruleConfig: { skuIds: [21] }, templates: [{ badgeTemplateId: "4" }] }));
});
test("clearing scheduling sends null rather than keeping the old dates", async () => {
  await javaUpdateBadgeFlow("5", { activeFrom: undefined, activeTo: undefined });
  expect(mocks.request).toHaveBeenLastCalledWith("admin/badge-flow/5", "PUT",
    expect.objectContaining({ activeFrom: null, activeTo: null }));
});
