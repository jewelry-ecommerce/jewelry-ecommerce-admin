import { expect, test } from "vitest";
import { labelFlowState, labelFlowPayload } from "./java-label-flow.state";
import { BadgeCampaignStatus, BadgeChannel, BadgeRuleType, BadgeTemplateBadgeType, BadgeType } from "@/trading-ui/apis/badge/badge.enum";
import type { BadgeFlowDetail } from "@/trading-ui/apis/badge/badge.interface";
function flow(ruleType: BadgeRuleType, ruleConfig: Record<string, unknown>): BadgeFlowDetail {
  return { id: "5", name: "Chiến dịch", status: BadgeCampaignStatus.ACTIVE, isActive: true,
    channel: BadgeChannel.WEB, ruleType, ruleConfig, rules: [{ id: "4", name: "Mới", priorityWeight: 10,
      isPinned: false, isActive: true, template: { id: "4", code: "NEW", name: "Mới",
        type: BadgeType.TEXT, badgeType: BadgeTemplateBadgeType.CAMPAIGN } }] };
}
test("editing keeps saved numeric category targets", () => {
  const state = labelFlowState(flow(BadgeRuleType.CATEGORY, { categoryIds: [12, "13"] }));
  expect(labelFlowPayload(state).ruleConfig).toEqual({ categoryIds: ["12", "13"] });
});
test("editing keeps SKU targets instead of broadening to all products", () => {
  const state = labelFlowState(flow(BadgeRuleType.MANUAL, { skuIds: [21] }));
  expect(labelFlowPayload(state)).toMatchObject({ ruleType: BadgeRuleType.MANUAL, ruleConfig: { skuIds: ["21"] } });
});
test("out-of-stock badge uses automatic rule without manual targets", () => {
  const state = labelFlowState(flow(BadgeRuleType.ALL, {}));
  state.badgeType = BadgeTemplateBadgeType.OUT_OF_STOCK;
  expect(labelFlowPayload(state)).toMatchObject({ ruleType: BadgeRuleType.OUT_OF_STOCK, ruleConfig: {} });
});
test("one label is required and an empty target scope cannot be saved", () => {
  const state = labelFlowState(flow(BadgeRuleType.CATEGORY, {}));
  expect(() => labelFlowPayload(state)).toThrow("ít nhất");
  state.labelIds = ["4", "5"];
  expect(() => labelFlowPayload(state)).toThrow("một nhãn");
});
