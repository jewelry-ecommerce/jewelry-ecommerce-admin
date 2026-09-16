import type { AuthState } from "@/redux/auth/auth.slice";
import type { SystemState } from "@/redux/system/system.slice";

export interface GlobalReduxState {
  auth: AuthState;
  system: SystemState;
}
