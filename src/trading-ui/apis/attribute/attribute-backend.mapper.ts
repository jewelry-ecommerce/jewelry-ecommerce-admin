
import type { Attribute, AttributeValue } from './attribute.entities';
type WireAttribute = Omit<Attribute,'id'|'values'> & { id:number; values?: (Omit<AttributeValue,'id'|'attributeId'> & {id:number;attributeId:number})[] };
export function mapAttribute(input:WireAttribute):Attribute {
  return { ...input, id:String(input.id),
    values:input.values?.map(value=>({...value,id:String(value.id),attributeId:String(value.attributeId)})) };
}
export type { WireAttribute };
