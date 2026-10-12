import { createContext, useContext, type ReactNode } from 'react';
import type { RuntimeEvaluateResponseDto } from '../../../../apis';
import { useRuntimeSimulation, type RuntimeSimulationLine } from './use-runtime-simulation';

type SandboxSimulationContextValue = ReturnType<typeof useRuntimeSimulation>;

const SandboxSimulationContext = createContext<SandboxSimulationContextValue | null>(null);

export interface SandboxEvaluateState {
  result: RuntimeEvaluateResponseDto | null;
  error: string | null;
  evaluating: boolean;
  isValid: boolean;
}

export interface SandboxSimulationProviderProps {
  children: ReactNode;
  onEvaluateStateChange?: (state: SandboxEvaluateState) => void;
}

export const SandboxSimulationProvider = ({ children, onEvaluateStateChange }: SandboxSimulationProviderProps) => {
  const simulation = useRuntimeSimulation({ initialLines: [], autoEvaluate: true, onEvaluateStateChange });
  return <SandboxSimulationContext.Provider value={simulation}>{children}</SandboxSimulationContext.Provider>;
};

export const useSandboxSimulation = (): SandboxSimulationContextValue => {
  const context = useContext(SandboxSimulationContext);
  if (!context) {
    throw new Error('useSandboxSimulation must be used within SandboxSimulationProvider');
  }
  return context;
};

export type { RuntimeSimulationLine };
