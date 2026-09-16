import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { usePermissionContext } from "@/permissions/use-permission-context.hook";
import { useAppSelector } from "@/redux/store.redux";
import { RouteType } from "@/router/route.enum";
import { getNoAccessPath, ROUTE_PATH } from "@/router/route.path";

export interface RouteGuardProps {
  type: RouteType;
  children: ReactNode;
}

/**
 * Single gate for every route:
 * - PUBLIC while signed in → dashboard, so `/login` cannot be revisited with a live session.
 * - PROTECTED while signed out → login, remembering where the user was headed.
 * - PROTECTED while signed in → the role's route permissions decide, no-access page otherwise.
 */
export const RouteGuard = ({ type, children }: RouteGuardProps) => {
  const location = useLocation();
  const { user, accessToken } = useAppSelector((state) => state.auth);
  const { canAccessRoute } = usePermissionContext();

  const isAuthenticated = Boolean(user && accessToken);

  if (type === RouteType.PUBLIC && isAuthenticated) {
    return <Navigate to={ROUTE_PATH.DASHBOARD} replace />;
  }

  if (type === RouteType.PROTECTED && !isAuthenticated) {
    return <Navigate to={ROUTE_PATH.LOGIN} replace state={{ from: location }} />;
  }

  if (type === RouteType.PROTECTED && location.pathname !== ROUTE_PATH.NO_ACCESS && !canAccessRoute(location.pathname)) {
    return <Navigate to={getNoAccessPath("route")} replace state={{ from: location }} />;
  }

  return <>{children}</>;
};
