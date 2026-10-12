
import { backendRequest } from '../backend-request';
import type { Category } from '@/trading-ui/apis/category/category.entities';
import type { CategoryRequestDto } from '@/trading-ui/apis/category/category.interface';
import { CategoryStatus } from '@/trading-ui/apis/category/category.enum';
import type { Attribute, AttributeTreeItem } from '@/trading-ui/apis/attribute/attribute.entities';
import type { AttributeRequestDto, QueryAttributeDto } from '@/trading-ui/apis/attribute/attribute.interface';
import { AttributeDisplayType, AttributeStatus } from '@/trading-ui/apis/attribute/attribute.enum';
import { JAVA_CATALOG_PATH, optionKey, type JavaCategory, type JavaAttribute } from './java-catalog.types';
const categoryPath = JAVA_CATALOG_PATH + '/categories';
const attributePath = JAVA_CATALOG_PATH + '/attributes';
export function javaCategoryView(category: JavaCategory): Category {
  return { id: String(category.id), name: category.name, slug: category.slug, code: category.slug,
    parentId: category.parentId == null ? null : String(category.parentId), level: 0,
    image: category.imageUrl, taxRate: 0, directAttributeIds: [], status: CategoryStatus.ACTIVE,
    createdAt: new Date(category.createdDate ?? ''), updatedAt: new Date(category.updatedDate ?? '') };
}
export async function javaCategoryTree(): Promise<Category[]> {
  const flat = (await backendRequest<JavaCategory[]>(categoryPath)).map(javaCategoryView);
  const byId = new Map(flat.map(category => [category.id, { ...category, children: [] as Category[] }]));
  const roots: Category[] = [];
  for (const category of byId.values()) {
    const parent = category.parentId ? byId.get(category.parentId) : undefined;
    if (parent) parent.children.push(category); else roots.push(category);
  }
  return roots;
}
export async function javaCategoryDetail(id: string): Promise<Category> {
  const categories = await backendRequest<JavaCategory[]>(categoryPath);
  const category = categories.find(entry => String(entry.id) === id);
  if (!category) throw new Error('Không tìm thấy danh mục.');
  return javaCategoryView(category);
}
export async function javaSaveCategory(input: CategoryRequestDto, id?: string): Promise<Category> {
  if (input.taxRate || input.directAttributeIds?.length || input.metaTitle || input.metaDescription || input.metaKeywords)
    throw new Error('Java chưa hỗ trợ thuế, SEO hoặc gán thuộc tính theo danh mục. Chỉ lưu tên, ảnh và danh mục cha.');
  const current = id ? await javaCategoryDetail(id) : undefined;
  return javaCategoryView(await backendRequest<JavaCategory>(categoryPath + (id ? '/' + id : ''), id ? 'PUT' : 'POST',
    { name: input.name, slug: current?.slug ?? input.code, imageUrl: input.image, parentId: input.parentId ? Number(input.parentId) : null, sortOrder: 0 }));
}
export function javaAttributeView(attribute: JavaAttribute): Attribute {
  return { id: String(attribute.id), name: attribute.name, code: attribute.code, index: 0,
    status: AttributeStatus.ACTIVE, isGlobal: true, isFilterable: false, isVariantAxis: attribute.type === 'SELECT',
    displayType: AttributeDisplayType.TEXT, values: (attribute.options ?? []).map(value => ({
      id: optionKey(attribute.id, value), attributeId: String(attribute.id), value, code: value })) };
}
export async function javaAttributes(query: Partial<QueryAttributeDto> = {}) {
  const all = (await backendRequest<JavaAttribute[]>(attributePath)).map(javaAttributeView);
  const search = query.search?.trim().toLocaleLowerCase();
  const filtered = all.filter(attribute => (!search || (attribute.name + ' ' + attribute.code).toLocaleLowerCase().includes(search))
    && (!query.status || query.status === attribute.status));
  const start = query.isPagination === false ? 0 : ((query.page ?? 1) - 1) * (query.take ?? 20);
  return { total: filtered.length, list: query.isPagination === false ? filtered : filtered.slice(start, start + (query.take ?? 20)) };
}
export async function javaAttributeDetail(id: string): Promise<Attribute> {
  const all = await javaAttributes({ isPagination: false });
  const attribute = all.list.find(entry => entry.id === id);
  if (!attribute) throw new Error('Không tìm thấy thuộc tính.');
  return attribute;
}
export async function javaAttributeTree(): Promise<{ list: AttributeTreeItem[]; total: number }> {
  const all = await javaAttributes({ isPagination: false });
  const list = all.list.filter(attribute => attribute.isVariantAxis).map(attribute => ({ ...attribute, children: attribute.values }));
  return { list, total: list.length };
}
export async function javaSaveAttribute(input: AttributeRequestDto, id?: string): Promise<Attribute> {
  if (input.isVariantAxis === false) throw new Error('Java chưa lưu thuộc tính không dùng làm trục biến thể. Dữ liệu chưa được thay đổi.');
  if (input.values.some(value => value.code && value.code !== value.value))
    throw new Error('Java chưa lưu mã riêng cho giá trị thuộc tính. Dữ liệu chưa được thay đổi.');
  if (input.values.some(value=>value.image)) throw new Error('Java chưa lưu được ảnh của giá trị thuộc tính. Dữ liệu chưa được thay đổi.');
  if (input.displayType !== AttributeDisplayType.TEXT || input.status !== AttributeStatus.ACTIVE)
    throw new Error('Java hiện chỉ hỗ trợ thuộc tính chữ, chưa có trạng thái hoặc ảnh giá trị.');
  return javaAttributeView(await backendRequest<JavaAttribute>(attributePath + (id ? '/' + id : ''), id ? 'PUT' : 'POST',
    { name: input.name, code: input.code, type: 'SELECT', options: input.values.map(value => value.value) }));
}
export function unsupportedJavaAction(): never { throw new Error('Backend Java chưa có API cho thao tác này. Không thay đổi dữ liệu.'); }
