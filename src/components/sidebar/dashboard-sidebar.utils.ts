import { DASHBOARD_SIDEBAR_NAV, isNavItemWithChildren, type DashboardSidebarNavGroup, type DashboardSidebarNavGroupItem, type DashboardSidebarNavLeaf } from '../../router/dashboard-sidebar.nav';

export { isNavItemWithChildren };

type NavMatchableItem = Pick<DashboardSidebarNavLeaf, 'path' | 'relatedPaths'>;

/** Route khớp path nav (list hoặc detail con). */
export const isNavActive = (pathname: string, path: string): boolean => pathname === path || pathname.startsWith(`${path}/`);

/** Trong cùng danh sách tab, chỉ highlight path khớp dài nhất (vd. `/product/spu` thay vì `/product`). */
export const isBestNavActive = (pathname: string, path: string, candidates: string[]): boolean => {
  const matched = candidates.filter((p) => isNavActive(pathname, p));
  if (!matched.length) return false;
  const longest = matched.reduce((a, b) => (a.length >= b.length ? a : b));
  return longest === path;
};

export const collectNavItemMatchPaths = (item: NavMatchableItem): string[] => {
  const paths = [item.path];
  if (item.relatedPaths?.length) paths.push(...item.relatedPaths);
  return paths;
};

export const collectGroupLeafItems = (group: DashboardSidebarNavGroup): NavMatchableItem[] => {
  const leaves: NavMatchableItem[] = [];
  for (const item of group.items ?? []) {
    if (isNavItemWithChildren(item)) leaves.push(...item.children);
    else leaves.push(item);
  }
  return leaves;
};

/** Highlight tab con khi pathname khớp `path` hoặc một trong `relatedPaths` của item đó. */
export const isBestNavItemActive = (pathname: string, item: NavMatchableItem, siblings: NavMatchableItem[]): boolean => {
  const matched = siblings.flatMap(collectNavItemMatchPaths).filter((path) => isNavActive(pathname, path));
  if (!matched.length) return false;
  const longest = matched.reduce((a, b) => (a.length >= b.length ? a : b));
  return collectNavItemMatchPaths(item).includes(longest);
};

export const collectGroupPaths = (group: DashboardSidebarNavGroup): string[] => {
  const paths: string[] = [];
  if (group.path) paths.push(group.path);
  for (const item of group.items ?? []) {
    if (isNavItemWithChildren(item)) {
      for (const child of item.children) {
        paths.push(...collectNavItemMatchPaths(child));
      }
    } else {
      paths.push(...collectNavItemMatchPaths(item));
    }
  }
  return paths;
};

export const groupIsSelected = (pathname: string, group: DashboardSidebarNavGroup): boolean => collectGroupPaths(group).some((path) => isNavActive(pathname, path));

export const subItemKey = (groupTitle: string, itemTitle: string) => `${groupTitle}::${itemTitle}`;

export const expansionFromPathname = (pathname: string, groups: DashboardSidebarNavGroup[] = DASHBOARD_SIDEBAR_NAV): { group: string | null; sub: string | null } => {
  for (const group of groups) {
    if (!groupIsSelected(pathname, group) || !group.items?.length) continue;

    const nested = group.items.find((item): item is DashboardSidebarNavGroupItem => isNavItemWithChildren(item) && item.children.some((c) => isNavActive(pathname, c.path)));
    return { group: group.title, sub: nested ? subItemKey(group.title, nested.title) : null };
  }
  return { group: null, sub: null };
};

export const nestedSubKeyIfActive = (group: DashboardSidebarNavGroup, pathname: string): string | null => {
  const nested = group.items?.find((item): item is DashboardSidebarNavGroupItem => isNavItemWithChildren(item) && item.children.some((c) => isNavActive(pathname, c.path)));
  return nested ? subItemKey(group.title, nested.title) : null;
};

const typoLeaf = { fontSize: 13 } as const;

export const sx = {
  shell: {
    height: '100%',
    bgcolor: '#FFF',
    borderRight: '1px solid #E6EAF0',
    display: 'flex',
    flexDirection: 'column',
    borderTopLeftRadius: 12,
  },
  groupBtn: (collapsed: boolean, selected: boolean) => ({
    minHeight: 40,
    px: collapsed ? 1 : 1.25,
    borderRadius: 1.5,
    justifyContent: collapsed ? 'center' : 'flex-start',
    bgcolor: selected ? '#0F172A' : 'transparent',
    color: selected ? '#F8FAFC' : '#1F2937',
    '&:hover': { bgcolor: selected ? '#0F172A' : '#F3F4F6' },
  }),
  nestedBtn: (active: boolean) => ({
    minHeight: 40,
    px: 1.2,
    borderRadius: 1.2,
    color: active ? '#0F172A' : '#4B5563',
    bgcolor: active ? '#EEF2F7' : 'transparent',
    cursor: 'pointer',
    '&:hover': { bgcolor: '#EEF2F7' },
  }),
  leafBtn: (active: boolean) => ({
    minHeight: 40,
    px: 1.2,
    borderRadius: '8px',
    color: active ? '#0F172A' : '#4B5563',
    bgcolor: active ? '#F3F4F6' : 'transparent',
    cursor: 'pointer',
    '&:hover': { bgcolor: '#F3F4F6' },
  }),
  typoNestedTitle: (active: boolean) => ({ ...typoLeaf, fontWeight: active ? 600 : 500 }),
  typoLeafTitle: (active: boolean) => ({ ...typoLeaf, fontWeight: active ? 600 : 500 }),
};
