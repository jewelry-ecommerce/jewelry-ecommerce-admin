import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE, type PersistedState } from "redux-persist";
import storage from "redux-persist/lib/storage";

import { initialStateAuth, reducerAuth } from "@/redux/auth/auth.slice";
import type { GlobalReduxState } from "@/redux/store.interface";
import { initialStateSystem, reducerSystem } from "@/redux/system/system.slice";

/** Both slices are durable cross-layout concerns: the admin session and the chosen theme mode. */
const rootReducer = combineReducers({
  auth: reducerAuth,
  system: reducerSystem,
});

/**
 * `PersistedState` is `{ _persist: … } | undefined`, and redux-persist hands the migration whatever
 * it read from storage. Narrowing with `in` checks — instead of casting — keeps the merge honest:
 * only slices that really are objects contribute their fields, everything else falls back to the
 * slice's initial state, so a payload written by an older build cannot leave holes.
 */
const readPersistedSlice = <TSlice extends object>(state: PersistedState, key: keyof GlobalReduxState, initial: TSlice): TSlice => {
  if (!state || !(key in state)) return initial;
  const slice = (state as Record<string, unknown>)[key];
  if (typeof slice !== "object" || slice === null) return initial;
  return { ...initial, ...slice };
};

const migratePersistedState = (state: PersistedState): Promise<PersistedState> => {
  if (!state) return Promise.resolve(undefined);

  return Promise.resolve({
    ...state,
    auth: readPersistedSlice(state, "auth", initialStateAuth),
    system: readPersistedSlice(state, "system", initialStateSystem),
  });
};

const persistConfig = {
  key: "jwl-admin-root",
  storage,
  version: 1,
  whitelist: ["auth", "system"],
  migrate: migratePersistedState,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<GlobalReduxState> = useSelector;

export const persistor = persistStore(store);
