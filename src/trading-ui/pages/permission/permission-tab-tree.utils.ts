import type { PermissionBrand, PermissionMenu, PermissionTab } from './permission.types';

export type TabSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
  depth: number;
};

export const getTabCodeDepth = (code: string): number => code.split('.').filter(Boolean).length;

export const getParentTabCode = (code: string): string | null => {
  const parts = code.split('.').filter(Boolean);
  if (parts.length <= 1) return null;
  return parts.slice(0, -1).join('.');
};

export const parseTabCodeSegment = (fullCode: string): string => {
  const parts = fullCode.split('.').filter(Boolean);
  return parts[parts.length - 1] ?? fullCode;
};

export const buildChildTabCode = (parentCode: string | null | undefined, segment: string): string => {
  const normalizedSegment = segment.trim();
  if (!normalizedSegment) return '';
  if (!parentCode?.trim()) return normalizedSegment;
  return `${parentCode.trim()}.${normalizedSegment}`;
};

export const isLeafTab = (tab: PermissionTab, allTabs: PermissionTab[]): boolean => !allTabs.some((item) => item.id !== tab.id && item.code.startsWith(`${tab.code}.`));

export const isLeafTabInTree = (tab: PermissionTab, roots: PermissionTab[]): boolean => isLeafTab(tab, flattenTabTree(roots));

export const buildTabTreeFromDotCodes = (flatTabs: PermissionTab[]): PermissionTab[] => {
  if (flatTabs.length === 0) return [];

  const sorted = flatTabs.slice().sort((a, b) => {
    const depthDiff = getTabCodeDepth(a.code) - getTabCodeDepth(b.code);
    if (depthDiff !== 0) return depthDiff;
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  });

  const byCode = new Map<string, PermissionTab>();
  for (const tab of sorted) {
    byCode.set(tab.code, { ...tab, children: [] });
  }

  const roots: PermissionTab[] = [];
  for (const tab of sorted) {
    const node = byCode.get(tab.code);
    if (!node) continue;
    const parentCode = getParentTabCode(tab.code);
    const parentNode = parentCode ? byCode.get(parentCode) : undefined;
    if (parentNode) {
      parentNode.children!.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortSiblings = (nodes: PermissionTab[]): void => {
    nodes.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    nodes.forEach((node) => {
      if (node.children?.length) sortSiblings(node.children);
    });
  };
  sortSiblings(roots);
  return roots;
};

/** @deprecated Alias — dùng buildTabTreeFromDotCodes */
export const buildTabTree = buildTabTreeFromDotCodes;

export const flattenTabTree = (roots: PermissionTab[]): PermissionTab[] => {
  const results: PermissionTab[] = [];
  const walk = (nodes: PermissionTab[]): void => {
    for (const node of nodes) {
      const { children, ...rest } = node;
      results.push({ ...rest, children: undefined });
      if (children?.length) walk(children);
    }
  };
  walk(roots);
  return results;
};

export const findTabById = (roots: PermissionTab[], tabId: string): PermissionTab | undefined => {
  for (const tab of roots) {
    if (tab.id === tabId) return tab;
    if (tab.children?.length) {
      const nested = findTabById(tab.children, tabId);
      if (nested) return nested;
    }
  }
  return undefined;
};

export const findTabByCode = (roots: PermissionTab[], tabCode: string): PermissionTab | undefined => {
  for (const tab of flattenTabTree(roots)) {
    if (tab.code === tabCode) return findTabById(roots, tab.id) ?? tab;
  }
  return undefined;
};

export const findTabPath = (roots: PermissionTab[], tabId: string): PermissionTab[] => {
  for (const tab of roots) {
    if (tab.id === tabId) return [tab];
    if (tab.children?.length) {
      const nested = findTabPath(tab.children, tabId);
      if (nested.length) return [tab, ...nested];
    }
  }
  return [];
};

export const collectLeafTabs = (roots: PermissionTab[]): PermissionTab[] => {
  const flat = flattenTabTree(roots);
  return flat.filter((tab) => isLeafTab(tab, flat));
};

export const pickTabNodeId = (roots: PermissionTab[], preferredId?: string): string => {
  const flat = flattenTabTree(roots);
  if (preferredId && flat.some((item) => item.id === preferredId)) {
    const preferred = findTabById(roots, preferredId);
    if (preferred && isLeafTabInTree(preferred, roots)) return preferredId;
    if (preferred && !isLeafTabInTree(preferred, roots)) {
      const subtreeFlat = flattenTabTree([preferred]);
      const leaves = subtreeFlat.filter((tab) => isLeafTab(tab, flat));
      if (leaves[0]) return leaves[0].id;
    }
  }
  return collectLeafTabs(roots)[0]?.id ?? roots[0]?.id ?? '';
};

export const findTabInBrand = (brand: PermissionBrand, tabId: string): { menu: PermissionMenu; tab: PermissionTab } | null => {
  for (const menu of brand.menus) {
    const tab = findTabById(menu.tabs, tabId);
    if (tab) return { menu, tab };
  }
  return null;
};

export const updateTabInTree = (roots: PermissionTab[], tabId: string, updater: (tab: PermissionTab) => PermissionTab): PermissionTab[] =>
  roots.map((tab) => {
    if (tab.id === tabId) return updater(tab);
    if (tab.children?.length) return { ...tab, children: updateTabInTree(tab.children, tabId, updater) };
    return tab;
  });

export const removeTabFromTree = (roots: PermissionTab[], tabId: string): PermissionTab[] =>
  roots.filter((tab) => tab.id !== tabId).map((tab) => (tab.children?.length ? { ...tab, children: removeTabFromTree(tab.children, tabId) } : tab));

export const getAncestorTabIds = (roots: PermissionTab[], tabId: string): string[] =>
  findTabPath(roots, tabId)
    .slice(0, -1)
    .map((tab) => tab.id);

export const buildTabSelectOptions = (menus: PermissionMenu[]): TabSelectOption[] => {
  const options: TabSelectOption[] = [];

  const walk = (tabs: PermissionTab[], menu: PermissionMenu, depth: number, path: string[], allFlat: PermissionTab[]): void => {
    for (const tab of tabs) {
      const labelPath = [...path, tab.name].join(' / ');
      const leaf = isLeafTab(tab, allFlat);
      options.push({
        value: tab.id,
        label: `${menu.name} / ${labelPath} (${menu.code}.${tab.code})${leaf ? '' : ' · Nhóm'}`,
        disabled: !leaf,
        depth,
      });
      if (tab.children?.length) walk(tab.children, menu, depth + 1, [...path, tab.name], allFlat);
    }
  };

  for (const menu of menus) {
    const flat = flattenTabTree(menu.tabs);
    walk(menu.tabs, menu, 0, [], flat);
  }

  return options;
};
