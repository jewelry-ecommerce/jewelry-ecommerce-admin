import { Box, Stack } from "@mui/material";
import { type ReactNode } from "react";

import { DashboardHeader } from "@/components/header/dashboard-header.component";
import { DashboardSidebar } from "@/components/sidebar/dashboard-sidebar.component";
import { useAppDispatch, useAppSelector } from "@/redux/store.redux";
import { setSidebarCollapsed, toggleSidebarCollapsed } from "@/redux/system/system.slice";
import { COLOR, STYLE } from "@/theme/design-tokens";

export interface DashboardLayoutProps {
  children?: ReactNode;
}

/** Fixed header + fixed collapsible sidebar + scrolling content area. */
export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector((state) => state.system.isSidebarCollapsed);
  const sidebarWidth = isSidebarCollapsed ? STYLE.SIDEBAR_COLLAPSED_WIDTH : STYLE.SIDEBAR_WIDTH;

  return (
    <Stack sx={{ minHeight: "100vh", width: "100%", bgcolor: COLOR.NEUTRAL[100] }}>
      <DashboardHeader />

      <Box sx={{ display: "flex", width: "100%", pt: `${STYLE.HEIGHT_HEADER}px`, bgcolor: "#141414" }}>
        <Box
          component="aside"
          sx={{
            width: sidebarWidth,
            flexShrink: 0,
            transition: "width 0.2s ease",
          }}
        >
          <Box sx={{ position: "fixed", top: STYLE.HEIGHT_HEADER, bottom: 0, width: sidebarWidth, transition: "width 0.2s ease" }}>
            <DashboardSidebar
              collapsed={isSidebarCollapsed}
              onToggle={() => dispatch(toggleSidebarCollapsed())}
              onExpand={() => dispatch(setSidebarCollapsed(false))}
            />
          </Box>
        </Box>

        <Stack
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            overflow: "auto",
            bgcolor: "#F3F4F6",
            minHeight: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`,
            borderTopRightRadius: `${STYLE.BORDER_RADIUS_ELEMENT_MIDDLE}px`,
          }}
        >
          {children}
        </Stack>
      </Box>
    </Stack>
  );
};
