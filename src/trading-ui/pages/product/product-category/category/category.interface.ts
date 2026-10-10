import type { Category } from '../../../../apis/category/category.entities';
import { type CategoryPageViews } from './category.enum';

export interface CategoryGlobalState {
  view: CategoryPageViews;
  selectedCategoryId?: string;
  createParent: Category | null;
}
