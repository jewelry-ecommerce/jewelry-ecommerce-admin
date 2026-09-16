import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { Mode } from "@/theme/theme-mode";

export interface SystemState {
  mode: Mode;
  isSidebarCollapsed: boolean;
}

export const initialStateSystem: SystemState = {
  mode: Mode.LIGHT,
  isSidebarCollapsed: false,
};

const systemSlice = createSlice({
  name: "system",
  initialState: initialStateSystem,
  reducers: {
    setMode: (state, { payload }: PayloadAction<Mode>) => {
      state.mode = payload;
    },
    toggleMode: (state) => {
      state.mode = state.mode === Mode.LIGHT ? Mode.DARK : Mode.LIGHT;
    },
    setSidebarCollapsed: (state, { payload }: PayloadAction<boolean>) => {
      state.isSidebarCollapsed = payload;
    },
    toggleSidebarCollapsed: (state) => {
      state.isSidebarCollapsed = !state.isSidebarCollapsed;
    },
  },
});

export const { setMode, toggleMode, setSidebarCollapsed, toggleSidebarCollapsed } = systemSlice.actions;
export const reducerSystem = systemSlice.reducer;
