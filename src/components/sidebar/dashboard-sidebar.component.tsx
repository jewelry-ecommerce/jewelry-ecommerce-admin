import {
  CardMembershipOutlined,
  ExpandMore,
  Inventory2Outlined,
  LocalOfferOutlined,
  ManageAccountsOutlined,
  PeopleOutlined,
  ReceiptLongOutlined,
  ScheduleOutlined,
  SettingsOutlined,
  ShoppingCartOutlined,
  StorefrontOutlined,
  SupportAgentOutlined,
  WarehouseOutlined,
  WebOutlined,
} from '@mui/icons-material';
import { Box, Collapse, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Stack, Tooltip } from '@mui/material';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IconSidebarCollapsed, IconSidebarExpanded } from '@/trading-ui/assets/icon/icon-sidebar-panel';
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';
import { DASHBOARD_SIDEBAR_NAV, type DashboardSidebarIconKey } from '../../router/dashboard-sidebar.nav';
import { usePermissionContext } from '@/permissions/use-permission-context.hook';
import {
  collectGroupLeafItems,
  collectNavItemMatchPaths,
  expansionFromPathname,
  groupIsSelected,
  isBestNavItemActive,
  isNavActive,
  isNavItemWithChildren,
  nestedSubKeyIfActive,
  subItemKey,
  sx,
} from './dashboard-sidebar.utils';

export interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onExpand: () => void;
}

const GROUP_ICONS: Record<DashboardSidebarIconKey, React.ReactNode> = {
  shopping_cart: <ShoppingCartOutlined fontSize="small" />,
  inventory: <Inventory2Outlined fontSize="small" />,
  warehouse: <WarehouseOutlined fontSize="small" />,
  storefront: <StorefrontOutlined fontSize="small" />,
  web: <WebOutlined fontSize="small" />,
  receipt: <ReceiptLongOutlined fontSize="small" />,
  settings: <SettingsOutlined fontSize="small" />,
  promotion: <LocalOfferOutlined fontSize="small" />,
  people: <PeopleOutlined fontSize="small" />,
  loyalty: <CardMembershipOutlined fontSize="small" />,
  account: <ManageAccountsOutlined fontSize="small" />,
  schedule: <ScheduleOutlined fontSize="small" />,
  support_agent: <SupportAgentOutlined fontSize="small" />,
};

const Chevron = ({ open, small }: { open: boolean; small?: boolean }) => (
  <ExpandMore
    sx={{
      fontSize: small ? 18 : 20,
      color: 'inherit',
      opacity: 0.85,
      transform: open ? 'rotate(180deg)' : 'none',
      transition: 'transform 0.2s',
    }}
  />
);

const DashboardSidebarContent: React.FC<DashboardSidebarProps & { pathname: string }> = ({ collapsed, onToggle, onExpand, pathname }) => {
  const navigate = useNavigate();
  const { filterSidebarNav } = usePermissionContext();
  const navItems = filterSidebarNav(DASHBOARD_SIDEBAR_NAV);
  const initialExpansion = React.useMemo(() => expansionFromPathname(pathname, navItems), [pathname, navItems]);
  const [openGroup, setOpenGroup] = React.useState<string | null>(initialExpansion.group);
  const [openSub, setOpenSub] = React.useState<string | null>(initialExpansion.sub);
  const [collapseInstant, setCollapseInstant] = React.useState(false);
  const toggleLabel = collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar';
  const collapseTimeout = collapseInstant ? 0 : 'auto';

  const markCollapseInstant = React.useCallback(() => {
    setCollapseInstant(true);
  }, []);

  React.useEffect(() => {
    if (!collapseInstant) return;
    const id = requestAnimationFrame(() => setCollapseInstant(false));
    return () => cancelAnimationFrame(id);
  }, [collapseInstant]);

  /** SPA navigate — giữ nguyên với left-click, bỏ qua để browser tự xử lý middle/right-click. */
  const go = (path: string) => (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
    e.preventDefault();
    navigate(path);
  };

  const handleToggleClick = () => {
    markCollapseInstant();
    if (collapsed) {
      const expansion = expansionFromPathname(pathname, navItems);
      setOpenGroup(expansion.group);
      setOpenSub(expansion.sub);
    }
    onToggle();
  };

  return (
    <Box sx={sx.shell}>
      <Box sx={{ flex: 1, minHeight: 0, px: collapsed ? 0.8 : 1.5, py: 2, overflowY: 'auto' }}>
        <List disablePadding>
          {navItems.map((group) => {
            const hasSubNav = Array.isArray(group.items);
            const selected = groupIsSelected(pathname, group);
            const groupOpen = openGroup === group.title;
            const groupLeafItems = collectGroupLeafItems(group);

            const onHeaderClick = () => {
              if (collapsed) {
                if (hasSubNav) {
                  markCollapseInstant();
                  setOpenGroup(group.title);
                  setOpenSub(nestedSubKeyIfActive(group, pathname));
                  onExpand();
                  return;
                }
                if (group.path) navigate(group.path);
                return;
              }
              if (hasSubNav) {
                if (groupOpen) {
                  setOpenGroup(null);
                  setOpenSub(null);
                } else {
                  setOpenGroup(group.title);
                  setOpenSub(nestedSubKeyIfActive(group, pathname));
                }
                return;
              }
              if (group.path) navigate(group.path);
            };

            return (
              <Box key={group.title} sx={{ mb: 0.75 }}>
                <Tooltip title={collapsed ? group.title : ''} placement="right">
                  <ListItemButton {...(group.path && !hasSubNav ? { component: 'a', href: group.path } : {})} onClick={onHeaderClick} sx={sx.groupBtn(collapsed, selected)}>
                    <ListItemIcon sx={{ minWidth: collapsed ? 'unset' : 28, mr: collapsed ? 0 : 0.5, color: 'inherit' }}>{GROUP_ICONS[group.icon]}</ListItemIcon>
                    {!collapsed && (
                      <React.Fragment>
                        <ListItemText primary={group.title} primaryTypographyProps={{ sx: { ...TYPOGRAPHY_STYLES.base.medium } }} sx={{ flex: '1 1 auto', minWidth: 0 }} />
                        {hasSubNav ? <Chevron open={groupOpen} /> : null}
                      </React.Fragment>
                    )}
                  </ListItemButton>
                </Tooltip>

                <Collapse in={!collapsed && groupOpen && hasSubNav} timeout={collapseTimeout} appear={false} unmountOnExit>
                  <List disablePadding sx={{ mt: 1, ml: 1.5, pl: 1.5, borderLeft: '1px solid #E5E7EB' }}>
                    {group.items
                      ?.filter((item) => !('hiddenFromNav' in item && item.hiddenFromNav))
                      .map((item) => {
                        if (isNavItemWithChildren(item)) {
                          const sk = subItemKey(group.title, item.title);
                          const subOpen = openSub === sk;
                          const parentActive = item.children.some((c) => collectNavItemMatchPaths(c).some((p) => isNavActive(pathname, p)));
                          return (
                            <Box key={item.title} sx={{ mb: 0.5 }}>
                              <ListItemButton onClick={() => setOpenSub((p) => (p === sk ? null : sk))} sx={sx.nestedBtn(parentActive)}>
                                <ListItemText primary={item.title} primaryTypographyProps={{ sx: sx.typoNestedTitle(parentActive) }} sx={{ flex: '1 1 auto', minWidth: 0 }} />
                                <Chevron open={subOpen} small />
                              </ListItemButton>
                              <Collapse in={!collapsed && subOpen} timeout={collapseTimeout} appear={false} unmountOnExit>
                                <List disablePadding sx={{ pl: 1.5, borderLeft: '1px solid #E5E7EB', ml: 0.75, mt: 0.25 }}>
                                  {item.children.map((child) => {
                                    const sel = isBestNavItemActive(pathname, child, item.children);
                                    return (
                                      <ListItemButton key={child.path} component="a" href={child.path} onClick={go(child.path)} sx={sx.nestedBtn(sel)}>
                                        <ListItemText primary={child.title} primaryTypographyProps={{ sx: sx.typoNestedTitle(sel) }} />
                                      </ListItemButton>
                                    );
                                  })}
                                </List>
                              </Collapse>
                            </Box>
                          );
                        }
                        const sel = isBestNavItemActive(pathname, item, groupLeafItems);
                        return (
                          <ListItemButton key={item.path} component="a" href={item.path} onClick={go(item.path)} sx={sx.leafBtn(sel)}>
                            <ListItemText primary={item.title} primaryTypographyProps={{ sx: sx.typoLeafTitle(sel) }} />
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
        justifyContent={collapsed ? 'center' : 'flex-start'}
        sx={{
          flexShrink: 0,
          mt: 'auto',
          px: collapsed ? 1 : 1.5,
          py: 1.25,
          pb: 1.5,
        }}
      >
        <Tooltip title={toggleLabel} placement={collapsed ? 'right' : 'top'}>
          <IconButton
            onClick={handleToggleClick}
            size="small"
            aria-label={toggleLabel}
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              color: '#1F2937',
              '&:hover': { bgcolor: '#F3F4F6' },
            }}
          >
            {collapsed ? <IconSidebarCollapsed /> : <IconSidebarExpanded />}
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
};

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ collapsed, onToggle, onExpand }) => {
  const { pathname } = useLocation();
  return <DashboardSidebarContent key={pathname} pathname={pathname} collapsed={collapsed} onToggle={onToggle} onExpand={onExpand} />;
};
