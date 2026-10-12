import type { PagePermissionScope } from '../../permissions/page-folder-map';
import { createPageButtonPermission } from '../../permissions/page-button-permission.utils';

export const PRODUCT_LIST_PAGE_SCOPE: PagePermissionScope = { menuCode: 'product', tabCode: 'list' };
export const PRODUCT_COLLECTION_PAGE_SCOPE: PagePermissionScope = { menuCode: 'product', tabCode: 'collection' };
export const PRODUCT_CATEGORY_PAGE_SCOPE: PagePermissionScope = { menuCode: 'product', tabCode: 'category' };
export const PRODUCT_ATTRIBUTES_PAGE_SCOPE: PagePermissionScope = { menuCode: 'product', tabCode: 'attributes' };
export const PRODUCT_REVIEWS_PAGE_SCOPE: PagePermissionScope = { menuCode: 'product', tabCode: 'reviews' };
export const PRODUCT_SET_PAGE_SCOPE: PagePermissionScope = { menuCode: 'product', tabCode: 'set' };

export const productListButtonPermission = createPageButtonPermission(PRODUCT_LIST_PAGE_SCOPE);
export const productCollectionButtonPermission = createPageButtonPermission(PRODUCT_COLLECTION_PAGE_SCOPE);
export const productCategoryButtonPermission = createPageButtonPermission(PRODUCT_CATEGORY_PAGE_SCOPE);
export const productAttributesButtonPermission = createPageButtonPermission(PRODUCT_ATTRIBUTES_PAGE_SCOPE);
export const productReviewsButtonPermission = createPageButtonPermission(PRODUCT_REVIEWS_PAGE_SCOPE);
export const productSetButtonPermission = createPageButtonPermission(PRODUCT_SET_PAGE_SCOPE);
