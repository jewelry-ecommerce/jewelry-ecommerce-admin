import {
  CardGiftcardOutlined,
  DashboardCustomizeOutlined,
  ExpandMore,
  GroupOutlined,
  InsertChartOutlined,
  Inventory2Outlined,
  LocalOfferOutlined,
  SettingsOutlined,
  ShoppingCartOutlined,
  SupportAgentOutlined,
  WarehouseOutlined,
  WebOutlined,
} from "@mui/icons-material";
import { Box, Collapse, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Stack, Tooltip } from "@mui/material";
import { useMemo, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { TYPOGRAPHY_STYLES } from "@/common/constant/typography.constant";
import { DASHBOARD_SIDEBAR_NAV, isGroupActive, isNavActive, type DashboardSidebarIconKey } from "@/router/dashboard-sidebar.nav";

const GROUP_ICONS: Record<DashboardSidebarIconKey, ReactNode> = {
  dashboard: <DashboardCustomizeOutlined fontSize="small" />,
  catalog: <Inventory2Outlined fontSize="small" />,
  set: <CardGiftcardOutlined fontSize="small" />,
  cms: <WebOutlined fontSize="small" />,
  order: <ShoppingCartOutlined fontSize="small" />,
  inventory: <WarehouseOutlined fontSize="small" />,
  promotion: <LocalOfferOutlined fontSize="small" />,
  customer: <GroupOutlined fontSize="small" />,
  inquiry: <SupportAgentOutlined fontSize="small" />,
  report: <InsertChartOutlined fontSize="small" />,
  setting: <SettingsOutlined fontSize="small" />,
};

const groupButtonSx = (collapsed: boolean, selected: boolean) => ({
  minHeight: 40,
  px: collapsed ? 1 : 1.25,
  borderRadius: 1.5,
  justifyContent: collapsed ? "center" : "flex-start",
  bgcolor: selected ? "#0F172A" : "transparent",
  color: selected ? "#F8FAFC" : "#1F2937",
  "&:hover": { bgcolor: selected ? "#0F172A" : "#F3F4F6" },
});

const leafButtonSx = (active: boolean) => ({
  minHeight: 40,
  px: 1.2,
  borderRadius: "8px",
  color: active ? "#0F172A" : "#4B5563",
  bgcolor: active ? "#F3F4F6" : "transparent",
  "&:hover": { bgcolor: "#F3F4F6" },
});

export interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onExpand: () => void;
}

export const DashboardSidebar = ({ collapsed, onToggle, onExpand }: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  /** `undefined` means derive from current route; `null` is an explicit user close. */
  const [openGroup, setOpenGroup] = useState<string | null | undefined>(undefined);
  const groups = useMemo(() => DASHBOARD_SIDEBAR_NAV, []);
  const activeGroup = groups.find((group) => isGroupActive(pathname, group))?.title ?? null;
  const expandedGroup = openGroup === undefined ? activeGroup : openGroup;

  const handleGroup = (title: string, hasItems: boolean, path?: string) => {
    if (collapsed) onExpand();
    if (!hasItems && path) navigate(path);
    if (hasItems) setOpenGroup(expandedGroup === title ? null : title);
  };

  return (
    <Box
      sx={{
        height: "100%",
        bgcolor: "#FFF",
        borderRight: "1px solid #E6EAF0",
        display: "flex",
        flexDirection: "column",
        borderTopLeftRadius: 12,
      }}
    >
      <Box sx={{ flex: 1, minHeight: 0, px: collapsed ? 0.8 : 1.5, py: 2, overflowY: "auto" }}>
        <List disablePadding>
          {groups.map((group) => {
            const selected = isGroupActive(pathname, group);
            const hasItems = Boolean(group.items?.length);
            const isOpen = expandedGroup === group.title;
            return (
              <Box key={group.title} sx={{ mb: 0.75 }}>
                <Tooltip title={collapsed ? group.title : ""} placement="right">
                  <ListItemButton onClick={() => handleGroup(group.title, hasItems, group.path)} sx={groupButtonSx(collapsed, selected)}>
                    <ListItemIcon sx={{ minWidth: collapsed ? "unset" : 28, mr: collapsed ? 0 : 0.5, color: "inherit" }}>
                      {GROUP_ICONS[group.icon]}
                    </ListItemIcon>
                    {!collapsed && (
                      <>
                        <ListItemText primary={group.title} primaryTypographyProps={{ sx: TYPOGRAPHY_STYLES.base.medium }} />
                        {hasItems ? (
                          <ExpandMore
                            sx={{
                              fontSize: 20,
                              opacity: 0.85,
                              transform: isOpen ? "rotate(180deg)" : "none",
                              transition: "transform 0.2s",
                            }}
                          />
                        ) : null}
                      </>
                    )}
                  </ListItemButton>
                </Tooltip>
                <Collapse in={!collapsed && isOpen && hasItems} timeout="auto" appear={false} unmountOnExit>
                  <List disablePadding sx={{ mt: 1, ml: 1.5, pl: 1.5, borderLeft: "1px solid #E5E7EB" }}>
                    {group.items?.map((item) => {
                      const active = [item.path, ...(item.relatedPaths ?? [])].some((path) =>
                        isNavActive(pathname, path.replace(/\/:([^/]+)/g, "")),
                      );
                      return (
                        <ListItemButton key={item.path} onClick={() => navigate(item.path)} sx={leafButtonSx(active)}>
                          <ListItemText
                            primary={item.title}
                            primaryTypographyProps={{ sx: { fontSize: 13, fontWeight: active ? 600 : 500 } }}
                          />
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Collapse>
              </Box>
            );
          })}
        </List>
      </Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent={collapsed ? "center" : "flex-start"}
        sx={{ px: collapsed ? 1 : 1.5, py: 1.25, pb: 1.5 }}
      >
        <IconButton
          onClick={onToggle}
          size="small"
          sx={{ width: 36, height: 36, borderRadius: 2, color: "#1F2937", "&:hover": { bgcolor: "#F3F4F6" } }}
        >
          {collapsed ? "›" : "‹"}
        </IconButton>
      </Stack>
    </Box>
  );
};
