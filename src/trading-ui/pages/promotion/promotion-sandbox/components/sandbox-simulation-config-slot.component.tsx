import type { PromotionDraft } from '../../../../apis';
import { useSandboxSimulation } from '../../components/promotion-runtime-evaluate-panel/sandbox-simulation.context';
import { SandboxSimulationConfig } from './sandbox-simulation-config.component';

export const SandboxSimulationConfigSlot = ({ promotions }: { promotions: readonly PromotionDraft[] }) => {
  const { evaluatedAt, setEvaluatedAt, customerMode, setCustomerMode, customerId, setCustomerId, selectedDraftId, setSelectedDraftId } = useSandboxSimulation();

  return (
    <SandboxSimulationConfig
      promotions={promotions}
      evaluatedAt={evaluatedAt}
      onEvaluatedAtChange={setEvaluatedAt}
      customerMode={customerMode}
      onCustomerModeChange={setCustomerMode}
      customerId={customerId}
      onCustomerIdChange={setCustomerId}
      selectedDraftId={selectedDraftId}
      onSelectedDraftChange={setSelectedDraftId}
    />
  );
};
