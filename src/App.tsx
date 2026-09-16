import { CssBaseline, ThemeProvider } from "@mui/material";
import { Suspense } from "react";
import { Routes } from "react-router-dom";

import { ErrorBoundary } from "@/components/error-boundary/error-boundary.component";
import { LoadingComponent } from "@/components/loading/loading.component";
import { PermissionProvider } from "@/permissions/permission.context";
import { useAppSelector } from "@/redux/store.redux";
import { ROUTE } from "@/router/route.constant";
import { renderRoutes } from "@/router/render.route";
import { getTheme } from "@/theme/theme.utils";

/**
 * Application shell. The theme mode comes from the persisted `system` slice, so a reload restores the
 * scheme the admin chose before anything renders.
 */
const App = () => {
  const mode = useAppSelector((state) => state.system.mode);

  return (
    <ThemeProvider theme={getTheme(mode)}>
      <CssBaseline />
      <ErrorBoundary>
        <PermissionProvider>
          <Suspense fallback={<LoadingComponent />}>
            <Routes>{renderRoutes(Object.values(ROUTE))}</Routes>
          </Suspense>
        </PermissionProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
