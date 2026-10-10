import { lazy } from "react";

/**
 * Lazy page registry. Every route element is code-split here so `route.constant.ts` stays a plain
 * data table. Modules still to be built point at the shared placeholder page.
 */
export const LoginPage = lazy(() => import("@/pages/auth/login.page"));

export const DashboardPage = lazy(() => import("@/pages/dashboard/dashboard.page"));

export const NoAccessPage = lazy(() => import("@/pages/error/no-access.page"));
export const NotFoundPage = lazy(() => import("@/pages/error/not-found.page"));

/** Shared "coming next" screen — parameterised by route so it can name the module it stands in for. */
export const ModulePlaceholderPage = lazy(() => import("@/pages/placeholder/module-placeholder.page"));
export const ModuleListPage = lazy(() => import("@/pages/modules/module-list.page"));
export const CmsDemoPage = lazy(() => import("@/pages/cms/cms-demo.page"));

export const CmsBannerPage = lazy(() => import("@/pages/cms/cms-banner.page"));
export const AttributeCreatePage = lazy(() => import("@/trading-ui/pages/product/product-attribute/product-attribute-create/product-attribute-create.page"));
export const AttributeListPage = lazy(() => import("@/trading-ui/pages/product/product-attribute/product-attribute-list/product-attribute-list.page"));
export const AttributeDetailPage = lazy(() => import("@/trading-ui/pages/product/product-attribute/product-attribute-detail/product-attribute-detail.page"));
export const AttributeEditPage = lazy(() => import("@/trading-ui/pages/product/product-attribute/product-attribute-update/product-attribute-update.page"));
export const CategoryPage = lazy(() => import("@/trading-ui/pages/product/product-category/category/category.page"));
export const CollectionListPage = lazy(() => import("@/trading-ui/pages/product/product-category/collection/collection-list/collection-list.page"));
export const CollectionFormPage = lazy(() => import("@/trading-ui/pages/product/product-category/collection/collection-form/collection-form.page"));
export const CollectionDetailPage = lazy(() => import("@/trading-ui/pages/product/product-category/collection/collection-detail/collection-detail.page"));
