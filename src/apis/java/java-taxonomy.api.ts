import { backendRequest } from '../backend-request';
import type { Category } from '@/trading-ui/apis/category/category.entities';
import type { CategoryRequestDto } from '@/trading-ui/apis/category/category.interface';
import { CategoryStatus } from '@/trading-ui/apis/category/category.enum';
import type { Attribute, AttributeTreeItem } from '@/trading-ui/apis/attribute/attribute.entities';
import type { AttributeRequestDto, QueryAttributeDto } from '@/trading-ui/apis/attribute/attribute.interface';
import { AttributeDisplayType, AttributeStatus } from '@/trading-ui/apis/attribute/attribute.enum';
import { JAVA_CATALOG_PATH, type JavaCategory, type JavaAttribute } from './java-catalog.types';

const categoryPath = JAVA_CATALOG_PATH + '/categories';
const attributePath = JAVA_CATALOG_PATH + '/attributes';
const ATTRIBUTE_PAGE_POLICY = { page: 1, take: 20 } as const;
export function javaAttributeView(attribute: JavaAttribute): Attribute {
  return { id: String(attribute.id), name: attribute.name, code: attribute.code, index: 0,
    status: attribute.status === 'INACTIVE' ? AttributeStatus.INACTIVE : AttributeStatus.ACTIVE,
    isGlobal: false, isFilterable: false, isVariantAxis: attribute.type === 'SELECT' || attribute.type === 'MULTISELECT',
    displayType: attribute.displayType === 'IMAGE' ? AttributeDisplayType.IMAGE : AttributeDisplayType.TEXT,
    values: attribute.values.map(value => ({ id: String(value.id), attributeId: String(attribute.id),
      value: value.value, code: value.code, image: value.imageUrl })) };
}
export function javaCategoryView(category: JavaCategory, attributes: Attribute[] = []): Category {
  const select = (ids: number[]) => attributes.filter(attribute => ids.map(String).includes(attribute.id));
  return { id: String(category.id), name: category.name, slug: category.slug, code: category.code,
    parentId: category.parentId == null ? null : String(category.parentId), level: category.level,
    image: category.imageUrl, taxRate: 0, directAttributeIds: category.directAttributeIds.map(String),
    directAttributes: select(category.directAttributeIds), inheritedAttributes: select(category.inheritedAttributeIds),
    effectiveAttributes: select(category.effectiveAttributeIds),
    status: category.status === 'INACTIVE' ? CategoryStatus.INACTIVE : CategoryStatus.ACTIVE,
    createdAt: new Date(category.createdDate ?? ''), updatedAt: new Date(category.updatedDate ?? '') };
}
async function categoryViews(): Promise<Category[]> {
  const [categories, attributes] = await Promise.all([
    backendRequest<JavaCategory[]>(categoryPath), javaAttributes({ isPagination: false }),
  ]);
  return categories.map(category => javaCategoryView(category, attributes.list));
}
export async function javaCategoryTree(status?: CategoryStatus): Promise<Category[]> {
  const flat = await categoryViews();
  const byId = new Map(flat.map(category => [category.id, { ...category, children: [] as Category[] }]));
  const roots: Category[] = [];
  for (const category of byId.values()) {
    const parent = category.parentId ? byId.get(category.parentId) : undefined;
    if (parent) parent.children.push(category); else roots.push(category);
  }
  const filter = (nodes: Category[]): Category[] => nodes
    .filter(category => !status || category.status === status)
    .map(category => ({ ...category, children: filter(category.children ?? []) }));
  return filter(roots);
}
export async function javaCategoryDetail(id: string): Promise<Category> {
  const category = (await categoryViews()).find(entry => entry.id === id);
  if (!category) throw new Error('Không tìm thấy danh mục.');
  return category;
}
export async function javaSaveCategory(input: CategoryRequestDto, id?: string): Promise<Category> {
  const current = id ? await javaCategoryDetail(id) : undefined;
  const saved = await backendRequest<JavaCategory>(categoryPath + (id ? '/' + id : ''), id ? 'PUT' : 'POST',
    { name: input.name, code: input.code, slug: current?.slug, imageUrl: input.image,
      parentId: input.parentId ? Number(input.parentId) : null,
      status: input.status, directAttributeIds: input.directAttributeIds?.map(Number) });
  return javaCategoryDetail(String(saved.id));
}
export async function javaAttributes(query: Partial<QueryAttributeDto> = {}) {
  const all = (await backendRequest<JavaAttribute[]>(attributePath)).map(javaAttributeView);
  const search = query.search?.trim().toLocaleLowerCase();
  const filtered = all.filter(attribute => (!search || (attribute.name + ' ' + attribute.code).toLocaleLowerCase().includes(search))
    && (!query.status || query.status === attribute.status));
  const take = query.take ?? ATTRIBUTE_PAGE_POLICY.take;
  const start = query.isPagination === false ? 0 : ((query.page ?? ATTRIBUTE_PAGE_POLICY.page) - 1) * take;
  return { total: filtered.length, list: query.isPagination === false ? filtered : filtered.slice(start, start + take) };
}
export async function javaAttributeDetail(id: string): Promise<Attribute> {
  const attribute = (await javaAttributes({ isPagination: false })).list.find(entry => entry.id === id);
  if (!attribute) throw new Error('Không tìm thấy thuộc tính.');
  return attribute;
}
export async function javaAttributeTree(categoryId: string): Promise<{ list: AttributeTreeItem[]; total: number }> {
  const category = await javaCategoryDetail(categoryId);
  const list = (category.effectiveAttributes ?? [])
    .filter(attribute => attribute.status === AttributeStatus.ACTIVE && attribute.isVariantAxis)
    .map(attribute => ({ ...attribute, children: attribute.values }));
  return { list, total: list.length };
}
export async function javaSaveAttribute(input: AttributeRequestDto, id?: string): Promise<Attribute> {
  const current = id ? await javaAttributeDetail(id) : undefined;
  const values = input.values.map(value => {
    const existing = current?.values?.find(entry => value.id ? entry.id === value.id : entry.code === value.code);
    return { id: existing ? Number(existing.id) : undefined, code: value.code,
      value: value.value, imageUrl: value.image ?? null };
  });
  return javaAttributeView(await backendRequest<JavaAttribute>(attributePath + (id ? '/' + id : ''), id ? 'PUT' : 'POST',
    { name: input.name, code: input.code, type: input.isVariantAxis === false ? 'TEXT' : 'SELECT',
      displayType: input.displayType, status: input.status, values }));
}
export function unsupportedJavaAction(): never { throw new Error('Thao tác này hiện chưa khả dụng. Dữ liệu chưa được thay đổi.'); }
