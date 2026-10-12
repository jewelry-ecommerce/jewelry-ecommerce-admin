import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { AdminSession, AdminUser } from "@/apis/auth/auth.interface";

export interface AuthState {
  user: AdminUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  issuedAt: string | null;
}

export const initialStateAuth: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  issuedAt: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialStateAuth,
  reducers: {
    setSession: (state, { payload }: PayloadAction<AdminSession>) => {
      state.user = payload.user;
      state.accessToken = payload.accessToken;
      state.refreshToken = payload.refreshToken ?? null;
      state.issuedAt = payload.issuedAt;
    },
    setAuthTokens: (state, { payload }: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = payload.accessToken;
      state.refreshToken = payload.refreshToken;
    },
    setUser: (state, { payload }: PayloadAction<AdminUser>) => {
      state.user = payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.issuedAt = null;
    },
  },
});

export const { setSession, setUser, clearAuth, setAuthTokens } = authSlice.actions;
export const reducerAuth = authSlice.reducer;
