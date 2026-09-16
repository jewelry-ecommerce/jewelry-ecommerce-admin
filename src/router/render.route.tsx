import { Fragment, type ReactNode } from "react";
import { Outlet, Route } from "react-router-dom";

import { RouteGuard } from "@/router/route.guard";
import { childrenToArray, type AppRoute } from "@/router/route.interface";

/** Recursively turns the route registry into `<Route>` elements wrapped in guard + layout. */
export const renderRoutes = (routes: AppRoute[]): ReactNode =>
  routes.map(({ path, index, type, layout: Layout = Fragment, element: Element, children }) => {
    const childRoutes = childrenToArray(children);

    const routeElement = (
      <RouteGuard type={type}>
        <Layout>
          {Element ? <Element /> : null}
          {childRoutes ? <Outlet /> : null}
        </Layout>
      </RouteGuard>
    );

    if (index) return <Route key="__index__" index element={routeElement} />;

    return (
      <Route key={path ?? "__route__"} path={path} element={routeElement}>
        {childRoutes ? renderRoutes(childRoutes) : null}
      </Route>
    );
  });
