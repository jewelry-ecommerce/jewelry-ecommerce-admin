
import type { Category } from './category.entities';
import { mapAttribute, type WireAttribute } from '../attribute/attribute-backend.mapper';
export type WireCategory = Omit<Category,'id'|'parentId'|'children'|'createdAt'|'updatedAt'|'directAttributeIds'|'directAttributes'|'inheritedAttributes'|'effectiveAttributes'|'parent'> & {
  id:number;parentId:number|null;createdAt:string;updatedAt:string;directAttributeIds:number[];
  children?:WireCategory[];directAttributes?:WireAttribute[];inheritedAttributes?:WireAttribute[];effectiveAttributes?:WireAttribute[];
};
export function mapCategory(input:WireCategory):Category {
  return {...input,id:String(input.id),parentId:input.parentId===null?null:String(input.parentId),
    createdAt:new Date(input.createdAt),updatedAt:new Date(input.updatedAt),
    directAttributeIds:input.directAttributeIds.map(String),children:input.children?.map(mapCategory),
    directAttributes:input.directAttributes?.map(mapAttribute),inheritedAttributes:input.inheritedAttributes?.map(mapAttribute),
    effectiveAttributes:input.effectiveAttributes?.map(mapAttribute)};
}
