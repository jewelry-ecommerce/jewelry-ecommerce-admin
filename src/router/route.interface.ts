import type { ElementType } from "react";

import type { RouteType } from "@/router/route.enum";

export interface AppRoute {
  /** Omitted when `index` is true. */
  path?: string;
  /** React Router index route at the parent segment. */
  index?: boolean;
  type: RouteType;
  element?: ElementType;
  layout?: ElementType;
  /** Keyed so a nested route can be referenced by name from the registry. */
  children?: Record<string, AppRoute>;
}

export const childrenToArray = (children?: Record<string, AppRoute>): AppRoute[] | undefined =>
  children ? Object.values(children) : undefined;
