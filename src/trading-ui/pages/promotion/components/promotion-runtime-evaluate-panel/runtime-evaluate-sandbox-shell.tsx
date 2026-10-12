import type { ReactNode } from 'react';
import { SandboxSimulationProvider, type SandboxEvaluateState } from './sandbox-simulation.context';

export interface RuntimeEvaluateSandboxShellProps {
  children: ReactNode;
  onEvaluateStateChange?: (state: SandboxEvaluateState) => void;
}

export const RuntimeEvaluateSandboxShell = ({ children, onEvaluateStateChange }: RuntimeEvaluateSandboxShellProps) => (
  <SandboxSimulationProvider onEvaluateStateChange={onEvaluateStateChange}>{children}</SandboxSimulationProvider>
);
