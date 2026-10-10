import type { Category } from '../../../../apis/category/category.entities';
import type { AttributeTreeSelectOption } from '../../../../components/form/select-attribute-tree-input';

export const buildCategoryTreeSelectOptions = (categories: readonly Category[]): AttributeTreeSelectOption[] => {
  const options: AttributeTreeSelectOption[] = [];

  const walk = (nodes: readonly Category[], parentValuePath?: string, rootId?: string) => {
    for (const node of nodes) {
      const groupKey = rootId ?? node.id;
      const valuePath = parentValuePath ? `${parentValuePath}:${node.id}` : node.id;
      options.push({
        group: groupKey,
        value: valuePath,
        label: node.name,
      });
      if (node.children?.length) {
        walk(node.children, valuePath, groupKey);
      }
    }
  };

  walk(categories);
  return options;
};

export const getCategoryUuidFromTreeSelection = (values: readonly string[]): string => {
  const path = values[values.length - 1]?.trim();
  if (!path) return '';
  return path.split(':').filter(Boolean).at(-1) ?? '';
};

export const getCategoryTreeValuesFromUuid = (categoryUuid: string, options: readonly AttributeTreeSelectOption[]): string[] => {
  const id = categoryUuid.trim();
  if (!id) return [];

  const matches = options.filter((option) => option.value.split(':').filter(Boolean).at(-1) === id);
  if (!matches.length) return [];

  const deepest = matches.reduce((best, current) => (current.value.length > best.value.length ? current : best));
  return [deepest.value];
};

export const findCategoryInTree = (categories: readonly Category[], categoryId: string): Category | undefined => {
  const id = categoryId.trim();
  if (!id) return undefined;

  for (const node of categories) {
    if (node.id === id) return node;
    if (node.children?.length) {
      const found = findCategoryInTree(node.children, id);
      if (found) return found;
    }
  }

  return undefined;
};
