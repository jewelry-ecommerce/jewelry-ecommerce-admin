import dayjs from 'dayjs';
import type { Category, CmsNavigation, CmsNavigationBadge, Page } from '../../../../apis';
import type { TreeSelectNode } from '../../../../components/form';
import { DEFAULT_FORM, MISSING_CATEGORY_TARGET_OPTION_LABEL, MISSING_PAGE_TARGET_OPTION_LABEL } from './site-navigation.constant';
import type { NavigationFormState } from './site-navigation.interface';

export const mapCategoryToTreeNode = (category: Category): TreeSelectNode => ({
  value: category.id,
  label: category.name,
  children: category.children?.map(mapCategoryToTreeNode),
});

export const flattenNavigation = (items: CmsNavigation[], depth = 1, parent?: CmsNavigation | null, out: Array<{ node: CmsNavigation; depth: number; parent?: CmsNavigation | null }> = []) => {
  for (const item of items) {
    out.push({ node: item, depth, parent });
    flattenNavigation(item.children ?? [], depth + 1, item, out);
  }
  return out;
};

export const findNavigationNode = (items: CmsNavigation[], id?: string): CmsNavigation | undefined => {
  if (!id) return undefined;
  for (const item of items) {
    if (item.id === id) return item;
    const child = findNavigationNode(item.children ?? [], id);
    if (child) return child;
  }
  return undefined;
};

export const findCategoryById = (items: Category[], id?: string): Category | undefined => {
  if (!id) return undefined;
  for (const item of items) {
    if (item.id === id) return item;
    const child = findCategoryById(item.children ?? [], id);
    if (child) return child;
  }
  return undefined;
};

export const findCategoryPathById = (items: Category[], id?: string, path: Category[] = []): Category[] | undefined => {
  if (!id) return undefined;
  for (const item of items) {
    const nextPath = [...path, item];
    if (item.id === id) return nextPath;
    const childPath = findCategoryPathById(item.children ?? [], id, nextPath);
    if (childPath) return childPath;
  }
  return undefined;
};

export const findPageById = (pages: Page[], id?: string): Page | undefined => pages.find((page) => page.id === id);

export const isPageTargetMissing = (pages: Page[], targetId?: string): boolean => Boolean(targetId?.trim()) && !findPageById(pages, targetId);

export const isCategoryTargetMissing = (categoryTree: Category[], targetId?: string): boolean => Boolean(targetId?.trim()) && !findCategoryById(categoryTree, targetId);

export const buildPageSelectOptions = (pages: Page[], selectedTargetId?: string) => {
  const options = pages.map((page) => ({ value: page.id, label: page.name }));
  const normalizedTargetId = selectedTargetId?.trim();
  if (!normalizedTargetId || findPageById(pages, normalizedTargetId)) {
    return options;
  }

  return [{ value: normalizedTargetId, label: MISSING_PAGE_TARGET_OPTION_LABEL }, ...options];
};

export const buildCategorySelectOptions = (categoryTree: Category[], selectedTargetId?: string): TreeSelectNode[] => {
  const options = categoryTree.map(mapCategoryToTreeNode);
  const normalizedTargetId = selectedTargetId?.trim();
  if (!normalizedTargetId || findCategoryById(categoryTree, normalizedTargetId)) {
    return options;
  }

  return [{ value: normalizedTargetId, label: MISSING_CATEGORY_TARGET_OPTION_LABEL }, ...options];
};

export const findNavigationPathById = (items: CmsNavigation[], id?: string, path: CmsNavigation[] = []): CmsNavigation[] | undefined => {
  if (!id) return undefined;
  for (const item of items) {
    const nextPath = [...path, item];
    if (item.id === id) return nextPath;
    const childPath = findNavigationPathById(item.children ?? [], id, nextPath);
    if (childPath) return childPath;
  }
  return undefined;
};

export const getNodeDepth = (items: CmsNavigation[], id?: string, depth = 1): number | undefined => {
  if (!id) return undefined;
  for (const item of items) {
    if (item.id === id) return depth;
    const childDepth = getNodeDepth(item.children ?? [], id, depth + 1);
    if (childDepth) return childDepth;
  }
  return undefined;
};

export const getSiblings = (items: CmsNavigation[], parentId?: string | null): CmsNavigation[] => {
  if (!parentId) return items;
  return findNavigationNode(items, parentId)?.children ?? [];
};

export const isValidManualUrl = (url: string) => {
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed);
};

export const buildCmsPageUrl = (page?: Page): string | undefined => {
  const slug = page?.slug?.trim().replace(/^\/+/, '');
  return slug ? `/${slug}` : undefined;
};

export const buildCategoryUrl = (categoryTree: Category[], navigationTree: CmsNavigation[], targetId: string, ancestorNavigationId?: string): string | undefined => {
  const selectedCategoryPath = findCategoryPathById(categoryTree, targetId) ?? [];
  const selectedCategory = selectedCategoryPath.at(-1);
  if (!selectedCategory?.slug) return undefined;

  const navigationAncestors = ancestorNavigationId ? (findNavigationPathById(navigationTree, ancestorNavigationId) ?? []) : [];
  const ancestorSlugs = navigationAncestors
    .filter((node) => node.type === 'CATEGORY' && Boolean(node.targetId))
    .map((node) => findCategoryById(categoryTree, node.targetId ?? undefined)?.slug)
    .filter((slug): slug is string => Boolean(slug));
  const selectedPathSlugs = selectedCategoryPath.map((category) => category.slug).filter(Boolean);

  const slugs = ancestorSlugs.length ? [...ancestorSlugs, selectedCategory.slug] : selectedPathSlugs.length ? selectedPathSlugs : [selectedCategory.slug];
  const uniqueSlugs = slugs.filter((slug, index) => index === 0 || slug !== slugs[index - 1]);

  return `/san-pham/${uniqueSlugs
    .map((slug) => slug.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/')}`;
};

export const formatNavigationTypeLabel = (type: CmsNavigation['type']): string => {
  switch (type) {
    case 'CATEGORY':
      return 'Danh mục';
    case 'PAGE':
      return 'Trang nội dung';
    case 'LINK':
      return 'Đường dẫn';
    case 'NONE':
    default:
      return 'Không điều hướng';
  }
};

export const formatBadgeLabel = (badge: CmsNavigationBadge) => {
  if (badge.designType === 'IMAGE') return badge.imageUrl ? 'Nhãn ảnh' : 'Nhãn ảnh chưa có file';
  return badge.displayText || 'Nhãn chữ';
};

export const badgePreviewSx = (badge?: CmsNavigationBadge | null) => {
  if (!badge || badge.designType !== 'TEXT') return {};
  return {
    bgcolor: badge.styleConfig?.backgroundColor || '#E53935',
    color: badge.styleConfig?.color || '#FFFFFF',
  };
};

export const buildFormFromNavigation = (navigation: CmsNavigation): NavigationFormState => {
  const firstBadge = navigation.badges?.[0];
  return {
    ...DEFAULT_FORM,
    type: navigation.type,
    label: navigation.label ?? '',
    targetId: navigation.targetId ?? '',
    url: navigation.url ?? '',
    image: navigation.image ?? '',
    openInNewTab: navigation.openInNewTab ?? false,
    showOnMenuPopup: navigation.showOnMenuPopup ?? true,
    showOnPlp: navigation.showOnPlp ?? true,
    badgeEnabled: Boolean(firstBadge),
    badgeId: firstBadge?.id ?? '',
    badgeDesignType: firstBadge?.designType ?? 'TEXT',
    badgeDisplayText: firstBadge?.displayText ?? '',
    badgeBackgroundColor: firstBadge?.styleConfig?.backgroundColor ?? '#E53935',
    badgeTextColor: firstBadge?.styleConfig?.color ?? '#FFFFFF',
    badgeImageUrl: firstBadge?.imageUrl ?? '',
    badgeStartTime: firstBadge?.startTime ? dayjs(firstBadge.startTime) : null,
    badgeEndTime: firstBadge?.endTime ? dayjs(firstBadge.endTime) : null,
  };
};
