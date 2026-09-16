import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { AdminSession, AdminUser } from "@/apis/auth/auth.interface";

export interface AuthState {
  user: AdminUser | null;
  accessToken: string | null;
  issuedAt: string | null;
}

export const initialStateAuth: AuthState = {
  user: null,
  accessToken: null,
  issuedAt: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialStateAuth,
  reducers: {
    setSession: (state, { payload }: PayloadAction<AdminSession>) => {
      state.user = payload.user;
      state.accessToken = payload.accessToken;
      state.issuedAt = payload.issuedAt;
    },
    setUser: (state, { payload }: PayloadAction<AdminUser>) => {
      state.user = payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.issuedAt = null;
    },
  },
});

export const { setSession, setUser, clearAuth } = authSlice.actions;
export const reducerAuth = authSlice.reducer;
